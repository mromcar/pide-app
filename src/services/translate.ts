export type Lang = 'es' | 'en' | 'fr'

export async function translateText(text: string, from: Lang, to: Lang): Promise<string> {
  try {
    if (!text?.trim() || from === to) return text
    const base = process.env.NEXT_PUBLIC_TRANSLATE_API
    if (!base) return text

    const url = `${base.replace(/\/$/, '')}/translate`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: from, target: to, format: 'text' }),
    })
    if (!res.ok) throw new Error('translate error')
    const data = await res.json()
    return data?.translatedText ?? text
  } catch {
    return text
  }
}
