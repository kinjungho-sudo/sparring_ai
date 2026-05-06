import { NextRequest, NextResponse } from 'next/server'
import { saveMessage, updateMessageFactError } from '@/lib/db/messages'
import { completeDebate } from '@/lib/db/debates'
import { saveReport } from '@/lib/db/reports'
import type { Speaker } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.action === 'save_message') {
      const message = await saveMessage({
        debate_id: body.debate_id,
        round_number: body.round_number,
        speaker: body.speaker as Speaker,
        content: body.content,
        has_fact_error: body.has_fact_error ?? false,
        fact_error_note: body.fact_error_note ?? null,
        is_final_round: body.is_final_round ?? false,
        token_count: body.token_count ?? null,
      })
      return NextResponse.json({ message })
    }

    if (body.action === 'complete') {
      await completeDebate(body.debate_id, body.status ?? 'completed')
      return NextResponse.json({ ok: true })
    }

    if (body.action === 'save_report') {
      const report = await saveReport({
        debate_id: body.debate_id,
        red_summary: body.red_summary,
        blue_summary: body.blue_summary,
        new_perspectives: body.new_perspectives,
        argument_gap: body.argument_gap,
        next_question: body.next_question,
        fact_errors: body.fact_errors,
        convergence_note: body.convergence_note,
        speech_summaries: body.speech_summaries,
        key_points: body.key_points,
        fact_checks: body.fact_checks,
        verdict: body.verdict,
      })
      return NextResponse.json({ report })
    }

    if (body.action === 'update_fact_error') {
      await updateMessageFactError(body.message_id, body.fact_error_note)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('[save-message]', err)
    return NextResponse.json({ error: '저장 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
