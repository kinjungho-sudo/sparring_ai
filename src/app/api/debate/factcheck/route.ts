import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODEL } from '@/lib/ai/claude'
import { buildFactCheckPrompt } from '@/lib/ai/prompts'
import type { Language } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { topic, currentRound, totalRounds, language, history, redContent, blueContent } = await req.json() as {
      topic: string
      currentRound: number
      totalRounds: number
      language: Language
      history: Array<{ speaker: string; content: string }>
      redContent: string
      blueContent: string
    }

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

    if (!jsonMatch) {
      return NextResponse.json({ errors: [] })
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (err) {
    console.error('[factcheck]', err)
    return NextResponse.json({ errors: [] })
  }
}
