import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/ai/stream'
import { buildInterviewReportPrompt } from '@/lib/ai/prompts'
import type { DebateModel, Language } from '@/types'
import type { InterviewFeedbackData } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
  try {
    const { position, resume, rounds, language, model = 'claude-haiku-4-5-20251001' } = await req.json() as {
      position: string
      resume: string
      rounds: Array<{ question: string; answer: string; feedback: InterviewFeedbackData }>
      language: Language
      model?: DebateModel
    }

    const prompt = buildInterviewReportPrompt(position, resume, rounds, language)
    const raw = await generateText(model, prompt, 1500)

    let report: object
    try {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
      report = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'JSON 파싱 실패', raw }, { status: 500 })
    }

    return NextResponse.json({ report })
  } catch (err) {
    console.error('[interview/report]', err)
    return NextResponse.json({ error: '리포트 생성 중 오류' }, { status: 500 })
  }
}
