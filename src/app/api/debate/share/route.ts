import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { debate_id } = await req.json() as { debate_id: string }
    if (!debate_id) return NextResponse.json({ error: 'debate_id required' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: debate } = await supabase
      .from('sparring_debates')
      .select('user_id, is_sample')
      .eq('id', debate_id)
      .single()

    if (!debate) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // 샘플 토론이거나 본인 토론만 공개 전환 가능
    if (!debate.is_sample && debate.user_id !== user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('sparring_debates')
      .update({ is_public: true })
      .eq('id', debate_id)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[share]', err)
    return NextResponse.json({ error: '공유 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
