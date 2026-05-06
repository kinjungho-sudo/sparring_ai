import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODEL } from '@/lib/ai/claude'
import { buildReportPrompt } from '@/lib/ai/prompts'
import type { Language } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { topic, messages, language } = await req.json() as {
      topic: string
      messages: Array<{ speaker: string; content: string; has_fact_error: boolean; fact_error_note?: string | null }>
      language: Language
    }

    const prompt = buildReportPrompt(topic, messages, language)

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ content })
  } catch (err) {
    console.error('[report]', err)
    return NextResponse.json({ error: '리포트 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
