import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/ai/stream'
import { buildReportPrompt } from '@/lib/ai/prompts'
import { logApiCall } from '@/lib/db/api-logs'
import type { Language, DebateModel } from '@/types'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  let debate_id: string | undefined
  try {
    const { topic, messages, language, debate_id: did, model = 'claude-sonnet-4-6' } = await req.json() as {
      topic: string
      messages: Array<{ speaker: string; content: string; has_fact_error: boolean; fact_error_note?: string | null }>
      language: Language
      debate_id?: string
      model?: DebateModel
    }
    debate_id = did

    const prompt = buildReportPrompt(topic, messages, language)

    const raw = await generateText(model, prompt, 4000)

    let report
    try {
      const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
      let jsonStr: string | null = codeBlockMatch ? codeBlockMatch[1].trim() : null

      if (!jsonStr) {
        const start = raw.indexOf('{')
        const end = raw.lastIndexOf('}')
        jsonStr = start !== -1 && end > start ? raw.slice(start, end + 1) : null
      }

      if (!jsonStr) {
        const start = raw.indexOf('{')
        jsonStr = start !== -1 ? raw.slice(start) : null
      }

      if (jsonStr) {
        try {
          report = JSON.parse(jsonStr)
        } catch {
          const quoteCount = (jsonStr.match(/(?<!\\)"/g) ?? []).length
          if (quoteCount % 2 !== 0) jsonStr += '"'
          const openBraces = (jsonStr.match(/\{/g) ?? []).length
          const closeBraces = (jsonStr.match(/\}/g) ?? []).length
          const openBrackets = (jsonStr.match(/\[/g) ?? []).length
          const closeBrackets = (jsonStr.match(/\]/g) ?? []).length
          const padded = jsonStr
            + ']'.repeat(Math.max(0, openBrackets - closeBrackets))
            + '}'.repeat(Math.max(0, openBraces - closeBraces))
          try { report = JSON.parse(padded) } catch { report = null }
        }
      }
    } catch {
      report = null
    }

    if (!report || typeof report !== 'object') {
      report = { convergence_note: raw }
    }

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
