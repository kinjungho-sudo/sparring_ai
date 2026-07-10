import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/ai/stream'
import { buildInterviewFeedbackPrompt } from '@/lib/ai/prompts'
import type { DebateModel, Language } from '@/types'
import type { InterviewFeedbackData } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
  try {
    const { position, resume, language, currentRound, question, candidateAnswer, model = 'claude-haiku-4-5-20251001' } = await req.json() as {
      position: string
      resume: string
      language: Language
      currentRound: number
      question: string
      candidateAnswer: string
      model?: DebateModel
    }

    const prompt = buildInterviewFeedbackPrompt(
      { position, resume, language, currentRound },
      question,
      candidateAnswer,
    )

    const raw = await generateText(model, prompt, 1200)

    let feedback: InterviewFeedbackData
    try {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
      feedback = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'JSON 파싱 실패', raw }, { status: 500 })
    }

    return NextResponse.json({ feedback })
  } catch (err) {
    console.error('[interview/feedback]', err)
    return NextResponse.json({ error: '피드백 생성 중 오류' }, { status: 500 })
  }
}
