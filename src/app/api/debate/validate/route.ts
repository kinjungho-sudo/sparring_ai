import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODEL } from '@/lib/ai/claude'
import { buildValidatePrompt } from '@/lib/ai/prompts'
import type { Language, ValidateResult } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { topic, language = 'ko' } = await req.json() as { topic: string; language: Language }

    if (!topic || topic.trim().length < 5) {
      return NextResponse.json({ error: '의제를 5자 이상 입력해주세요.' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 200,
      messages: [{ role: 'user', content: buildValidatePrompt(topic, language) }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return NextResponse.json<ValidateResult>({
        is_factual: false,
        is_sensitive: false,
        topic_type: 'strategic',
        message: '의제가 유효합니다.',
      })
    }

    const result = JSON.parse(jsonMatch[0]) as ValidateResult
    return NextResponse.json(result)
  } catch (err) {
    console.error('[validate]', err)
    return NextResponse.json({ error: 'AI 검증 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
