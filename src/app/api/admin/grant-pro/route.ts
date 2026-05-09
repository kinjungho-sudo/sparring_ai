import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const ADMIN_WHITELIST = (process.env.ADMIN_WHITELIST || '').split(',').map(e => e.trim())

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_WHITELIST.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { email, revoke } = await req.json()
  if (!email) return NextResponse.json({ error: 'missing_email' }, { status: 400 })

  const service = await createServiceClient()

  // 이메일로 profile 조회
  const { data: profile, error: lookupError } = await service
    .from('sparring_profiles')
    .select('id, plan')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (lookupError || !profile) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
  }

  const newPlan = revoke ? 'free' : 'pro'
  const { error: updateError } = await service
    .from('sparring_profiles')
    .update({ plan: newPlan, plan_expires_at: null })
    .eq('id', profile.id)

  if (updateError) {
    return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, plan: newPlan })
}
