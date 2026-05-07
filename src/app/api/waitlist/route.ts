import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const service = await createServiceClient()
  const { error } = await service.from('sparring_waitlist').insert({
    email: email.toLowerCase().trim(),
    user_id: user?.id ?? null,
    source: 'landing',
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ ok: true, already: true })
    }
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
