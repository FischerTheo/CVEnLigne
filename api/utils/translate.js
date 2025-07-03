import fetch from 'node-fetch'

export async function translateText(text, source = 'fr', target = 'en') {
  if (!text) return ''
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}&de=fischer.theo2412@gmail.com`
    )
    const data = await res.json()
    if (!data.responseData || !data.responseData.translatedText) {
      console.error('MyMemory API error:', data)
      return text 
    }
    return data.responseData.translatedText
  } catch (err) {
    console.error('Translation fetch error:', err)
    return text 
  }
}