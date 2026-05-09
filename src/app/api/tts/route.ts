import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 503 })
  }

  const { text: rawText, voice } = await req.json() as { text: string; voice?: string }
  if (!rawText) return NextResponse.json({ error: 'text required' }, { status: 400 })
  const text = rawText.slice(0, 4096)

  // RED → onyx (낮고 권위있는), BLUE → nova (밝고 명확한)
  const ttsVoice = voice ?? 'alloy'

  const resp = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: ttsVoice,
      response_format: 'mp3',
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    console.error('[tts]', err)
    return NextResponse.json({ error: 'TTS API error' }, { status: 502 })
  }

  return new Response(resp.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
      'Transfer-Encoding': 'chunked',
    },
  })
}
