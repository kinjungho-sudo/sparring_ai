import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODEL } from '@/lib/ai/claude'
import { buildReportPrompt } from '@/lib/ai/prompts'
import { logApiCall } from '@/lib/db/api-logs'
import type { Language } from '@/types'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  let debate_id: string | undefined
  try {
    const { topic, messages, language, debate_id: did } = await req.json() as {
      topic: string
      messages: Array<{ speaker: string; content: string; has_fact_error: boolean; fact_error_note?: string | null }>
      language: Language
      debate_id?: string
    }
    debate_id = did

    const prompt = buildReportPrompt(topic, messages, language)

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''

    let report
    try {
      // ```json ... ``` 블록 우선 추출, 없으면 첫 번째 { } 블록
      const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
      const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : (() => {
        // 가장 바깥쪽 { } 추출 — 앞뒤 텍스트 제거
        const start = raw.indexOf('{')
        const end = raw.lastIndexOf('}')
        return start !== -1 && end > start ? raw.slice(start, end + 1) : null
      })()
      report = jsonStr ? JSON.parse(jsonStr) : null
    } catch {
      report = null
    }

    // 파싱 실패 시 전체 텍스트를 convergence_note에 폴백
    if (!report || typeof report !== 'object') {
      report = { convergence_note: raw }
    }

    // 각 필드가 JSON 문자열로 이중 인코딩된 경우 재파싱
    for (const key of ['speech_summaries', 'key_points', 'fact_checks', 'verdict'] as const) {
      if (typeof report[key] === 'string') {
        try { report[key] = JSON.parse(report[key]) } catch { /* 원본 유지 */ }
      }
    }

    logApiCall({ debate_id, endpoint: '/api/debate/report', duration_ms: Date.now() - startTime, status: 'success' })
    return NextResponse.json({ report })
  } catch (err) {
    console.error('[report]', err)
    logApiCall({ debate_id, endpoint: '/api/debate/report', duration_ms: Date.now() - startTime, status: 'error', error_message: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ error: '리포트 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
