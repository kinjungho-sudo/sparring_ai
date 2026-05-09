import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/ai/stream'
import { buildFactCheckPrompt } from '@/lib/ai/prompts'
import { logApiCall } from '@/lib/db/api-logs'
import type { Language, DebateModel } from '@/types'

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
      model?: DebateModel
    }
    debate_id = body.debate_id
    const { topic, currentRound, totalRounds, language, history, redContent, blueContent, model = 'claude-sonnet-4-6' } = body

    const prompt = buildFactCheckPrompt(
      { topic, currentRound, totalRounds, language, history },
      redContent,
      blueContent
    )

    const text = await generateText(model, prompt, 800)
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    logApiCall({ debate_id, endpoint: '/api/debate/factcheck', duration_ms: Date.now() - startTime, status: 'success' })

    if (!jsonMatch) {
      return NextResponse.json({ checks: [], errors: [] })
    }

    const result = JSON.parse(jsonMatch[0])
    // 하위 호환: 구버전 errors 필드를 checks로 변환
    if (!result.checks && result.errors) {
      result.checks = result.errors.map((e: { speaker: string; claim: string; note: string }) => ({
        speaker: e.speaker, claim: e.claim, verdict: 'FALSE', note: e.note, source_label: null, source_url: null,
      }))
    }
    result.checks = result.checks ?? []
    return NextResponse.json(result)
  } catch (err) {
    console.error('[factcheck]', err)
    logApiCall({ debate_id, endpoint: '/api/debate/factcheck', duration_ms: Date.now() - startTime, status: 'error', error_message: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ checks: [], errors: [] })
  }
}
