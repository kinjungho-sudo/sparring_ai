import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import DebateArena from '@/components/debate/DebateArena'
import type { Debate } from '@/types'

export default async function DebatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: debate, error } = await supabase
    .from('sparring_debates')
    .select()
    .eq('id', id)
    .single()

  if (error || !debate) notFound()

  // 본인 토론만 접근 가능 (샘플 제외)
  const { data: { user } } = await supabase.auth.getUser()
  if (!debate.is_sample && debate.user_id && debate.user_id !== user?.id) {
    redirect('/login')
  }

  return <DebateArena debate={debate as Debate} />
}
