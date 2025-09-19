export const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, options)
  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json()).error || res.statusText } catch {}
    const err = new Error(detail || `HTTP ${res.status}`)
    err.status = res.status
    throw err
  }
  try { return await res.json() } catch { return null }
}
