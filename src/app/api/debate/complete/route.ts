import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getResend } from '@/lib/email/resend'
import { buildDebateCompleteEmail } from '@/lib/email/templates'

export async function POST(req: NextRequest) {
  try {
    const { debate_id, report } = await req.json()
    if (!debate_id) return NextResponse.json({ error: 'debate_id required' }, { status: 400 })

    const resend = getResend()
    if (!resend) return NextResponse.json({ sent: false, reason: 'no_key' })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ sent: false, reason: 'no_user' })

    const { data: debate } = await supabase
      .from('sparring_debates')
      .select('topic, language, is_sample')
      .eq('id', debate_id)
      .single()

    if (!debate || debate.is_sample) return NextResponse.json({ sent: false, reason: 'skipped' })

    const { subject, html } = buildDebateCompleteEmail({
      topic: debate.topic,
      debateId: debate_id,
      redSummary: report?.red_summary,
      blueSummary: report?.blue_summary,
      nextQuestion: report?.next_question,
      language: debate.language,
    })

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'Sparring AI <noreply@sparring.ai>',
      to: user.email,
      subject,
      html,
    })

    return NextResponse.json({ sent: true })
  } catch {
    return NextResponse.json({ sent: false, reason: 'error' })
  }
}
