import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InterviewArena from '@/components/interview/InterviewArena'

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: debate } = await supabase
    .from('sparring_debates')
    .select()
    .eq('id', id)
    .single()

  if (!debate || debate.mode !== 'interview') notFound()

  return <InterviewArena debate={debate} />
}
