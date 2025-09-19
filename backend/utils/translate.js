// utils/translate.js — DeepL-backed translator with safe fallbacks

function normalizeLang(code, { asTarget = false } = {}) {
  if (!code) return undefined
  const c = String(code).toLowerCase()
  // Basic map for common languages; extend if needed
  if (c.startsWith('fr')) return 'FR'
  if (c.startsWith('en')) return 'EN'
  if (c.startsWith('de')) return 'DE'
  if (c.startsWith('es')) return 'ES'
  if (c.startsWith('it')) return 'IT'
  if (c.startsWith('pt')) {
    // DeepL supports PT (source) and PT-PT/PT-BR (target)
    return asTarget ? 'PT-PT' : 'PT'
  }
  if (c.startsWith('nl')) return 'NL'
  if (c.startsWith('pl')) return 'PL'
  if (c.startsWith('ru')) return 'RU'
  if (c.startsWith('ja')) return 'JA'
  if (c.startsWith('zh')) return 'ZH'
  if (c.startsWith('ar')) return 'AR'
  if (c.startsWith('tr')) return 'TR'
  if (c.startsWith('cs')) return 'CS'
  if (c.startsWith('sv')) return 'SV'
  if (c.startsWith('da')) return 'DA'
  if (c.startsWith('fi')) return 'FI'
  if (c.startsWith('hu')) return 'HU'
  if (c.startsWith('el')) return 'EL'
  // Fallback to upper-case two-letter code
  return c.slice(0, 2).toUpperCase()
}

async function deeplTranslate(text, source = 'fr', target = 'en') {
  const key = process.env.DEEPL_API_KEY
  if (!key) return null

  const usePaid = String(process.env.DEEPL_API_USE_PAID || '').toLowerCase() === 'true'
  const baseUrl = process.env.DEEPL_API_URL || (usePaid ? 'https://api.deepl.com' : 'https://api-free.deepl.com')
  const url = `${baseUrl}/v2/translate`

  // Map languages to DeepL codes
  const sourceLang = normalizeLang(source)
  const targetLang = normalizeLang(target, { asTarget: true })

  const params = new URLSearchParams()
  params.append('text', text)
  if (sourceLang) params.append('source_lang', sourceLang)
  if (targetLang) params.append('target_lang', targetLang)
  // Preserve basic formatting/newlines
  params.append('preserve_formatting', '1')


  // Use AbortController to avoid hanging requests
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
    // propagate as a thrown error so caller can decide, but here return null
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

async function safeReadError(res) {
  try {
    const j = await res.json()
    return j?.message || j?.error || res.statusText
  } catch {
    return res.statusText
  }
}

export async function translateText(text, source = 'fr', target = 'en') {
  const input = text || ''
  const s = (source || 'fr').toLowerCase()
  const t = (target || 'en').toLowerCase()
  if (!input.trim()) return ''
  if (s === t) return input

  // Try DeepL when configured
  try {
    const out = await deeplTranslate(input, s, t)
    if (out) return out
  } catch (err) {
    // swallow and fall back to original text
  }

  // Last resort: return original text (no-op)
  return input
}