import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODEL } from '@/lib/ai/claude'
import { buildFactCheckPrompt } from '@/lib/ai/prompts'
import { logApiCall } from '@/lib/db/api-logs'
import type { Language } from '@/types'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  let debate_id: string | undefined
  try {
    const body = await req.json() as {
      debate_id?: string
      topic: string
      currentRound: number
      totalRounds: number
      language: Language
      history: Array<{ speaker: string; content: string }>
      redContent: string
      blueContent: string
    }
    debate_id = body.debate_id
    const { topic, currentRound, totalRounds, language, history, redContent, blueContent } = body

    const prompt = buildFactCheckPrompt(
      { topic, currentRound, totalRounds, language, history },
      redContent,
      blueContent
    )

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    logApiCall({ debate_id, endpoint: '/api/debate/factcheck', duration_ms: Date.now() - startTime, status: 'success' })

    if (!jsonMatch) {
      return NextResponse.json({ errors: [] })
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (err) {
    console.error('[factcheck]', err)
    logApiCall({ debate_id, endpoint: '/api/debate/factcheck', duration_ms: Date.now() - startTime, status: 'error', error_message: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ errors: [] })
  }
}
