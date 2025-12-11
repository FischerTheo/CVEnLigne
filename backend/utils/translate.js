// Utilitaire de traduction basé sur DeepL, avec gestion des erreurs

// Normalise le code langue pour DeepL
function normalizeLang(code, { asTarget = false } = {}) {
  if (!code) return undefined
  const c = String(code).toLowerCase()
  // Mappage des langues
  if (c.startsWith('fr')) return 'FR'
  if (c.startsWith('en')) return 'EN'
  return undefined
}

// Appel l'API DeepL pour traduire un texte
async function deeplTranslate(text, source = 'fr', target = 'en') {
  const key = process.env.DEEPL_API_KEY
  if (!key) return null

  const usePaid = String(process.env.DEEPL_API_USE_PAID || '').toLowerCase() === 'true'
  const baseUrl = process.env.DEEPL_API_URL || (usePaid ? 'https://api.deepl.com' : 'https://api-free.deepl.com')
  const url = `${baseUrl}/v2/translate`

  // Conversion des langues pour DeepL
  const sourceLang = normalizeLang(source)
  const targetLang = normalizeLang(target, { asTarget: true })

  const params = new URLSearchParams()
  params.append('text', text)
  if (sourceLang) params.append('source_lang', sourceLang)
  if (targetLang) params.append('target_lang', targetLang)
  // Préserve la mise en forme
  params.append('preserve_formatting', '1')

  // Timeout pour éviter les requêtes bloquantes
  const controller = new AbortController()
  const timeoutMs = Number(process.env.DEEPL_TIMEOUT_MS || 10000)
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params,
      signal: controller.signal
    })
  } catch (fetchErr) {
    clearTimeout(timeout)
    // En cas d'erreur réseau, retourne null
    return null
  }
  clearTimeout(timeout)

  if (!res.ok) {
    const msg = await safeReadError(res)
    return null
  }
  const json = await res.json()
  const translated = json?.translations?.[0]?.text
  return typeof translated === 'string' ? translated : null
}

// Lecture sécurisée des erreurs API
async function safeReadError(res) {
  try {
    const j = await res.json()
    return j?.message || j?.error || res.statusText
  } catch {
    return res.statusText
  }
}

// Fonction principale de traduction utilisée dans l'app
export async function translateText(text, source = 'fr', target = 'en') {
  const input = text || ''
  const s = (source || 'fr').toLowerCase()
  const t = (target || 'en').toLowerCase()
  if (!input.trim()) return ''
  if (s === t) return input

  // Tente DeepL si configuré
  try {
    const out = await deeplTranslate(input, s, t)
    if (out) return out
  } catch (err) {
    // En cas d'échec, retourne le texte original
  }

  // Si tout échoue, retourne le texte d'original
  return input
}