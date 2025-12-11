import { getUserFriendlyError } from '../utils/errorMessages.js'

export const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Détection de la connexion hors-ligne
const isOnline = () => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

export async function apiFetch(path, options = {}, retries = 2, timeout = 10000) {
  // Vérifier si l'utilisateur est hors ligne
  if (!isOnline()) {
    const err = new Error('Vous êtes hors ligne')
    err.offline = true
    throw err
  }
  
  // Créer un AbortController pour le timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    // Récupérer le token depuis localStorage
    const token = localStorage.getItem('token')
    
    // Ajouter credentials: 'include' pour envoyer les cookies HttpOnly
    const fetchOptions = {
      ...options,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        ...options.headers,
        // Ajouter le token dans Authorization header si disponible
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    }
    
    const res = await fetch(`${API}${path}`, fetchOptions)
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      let detail = ''
      try { 
        const json = await res.json()
        detail = json.error || json.message || res.statusText 
      } catch {}
      const err = new Error(detail || `HTTP ${res.status}`)
      err.status = res.status
      throw err
    }
    try { return await res.json() } catch { return null }
  } catch (err) {
    clearTimeout(timeoutId)
    
    // Si AbortError (timeout) ou erreur réseau, et il reste des retries
    if (retries > 0 && (err.name === 'AbortError' || err.message?.includes('Failed to fetch'))) {
      // Attendre un peu avant de réessayer (backoff exponentiel)
      const delay = (3 - retries) * 1000 // 0ms, 1000ms, 2000ms
      await new Promise(resolve => setTimeout(resolve, delay))
      return apiFetch(path, options, retries - 1, timeout)
    }
    
    // Enrichir l'erreur avec un message user-friendly (détecte la langue depuis i18n si disponible)
    const lang = document.documentElement.lang || 'fr'
    err.userMessage = getUserFriendlyError(err, lang)
    throw err
  }
}
