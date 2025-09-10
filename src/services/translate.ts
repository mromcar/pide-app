export type Lang = 'es' | 'en' | 'fr'

/**
 * Traduce texto usando LibreTranslate u otro servicio compatible.
 * Configura NEXT_PUBLIC_TRANSLATE_API en tu .env.local
 */
export async function translateText(text: string, from: Lang, to: Lang): Promise<string> {
  try {
    const q = (text ?? '').trim()
    if (!q || from === to) return text

    // Por ahora, retorna el texto original si no hay API configurada
    const base = process.env.NEXT_PUBLIC_TRANSLATE_API
    if (!base) {
      console.warn('[TranslateService] No translation API configured')
      return text
    }

    console.log(`[TranslateService] Translating "${text}" from ${from} to ${to}`)

    const res = await fetch(`${base.replace(/\/$/, '')}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, source: from, target: to, format: 'text' }),
    })

    if (!res.ok) {
      console.error('[TranslateService] API error:', res.status, res.statusText)
      throw new Error(`Translation API error: ${res.status}`)
    }

    const data = (await res.json()) as { translatedText?: string }
    const translated = data?.translatedText ?? text

    console.log(`[TranslateService] Translation result: "${translated}"`)
    return translated
  } catch (error) {
    console.error('[TranslateService] Translation failed:', error)
    return text
  }
}
