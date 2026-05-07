import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ debate: null })

    const { data } = await supabase
      .from('sparring_debates')
      .select('id, topic')
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .eq('is_sample', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({ debate: data ?? null })
  } catch {
    return NextResponse.json({ debate: null })
  }
}
