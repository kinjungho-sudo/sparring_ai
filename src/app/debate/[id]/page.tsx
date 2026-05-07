import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import DebateArena from '@/components/debate/DebateArena'
import { getReport } from '@/lib/db/reports'
import type { Debate } from '@/types'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: debate } = await supabase
    .from('sparring_debates')
    .select('topic, is_public')
    .eq('id', id)
    .single()

  if (!debate) return {}

  const title = `"${debate.topic}" — 스파링 AI 토론`
  const description = 'AI 두 명이 찬반으로 격돌한 토론 결과를 확인해보세요.'

  // 비공개 토론은 title만 (소셜 공유 메타 제외)
  if (!debate.is_public) return { title }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/debate/${id}`,
      images: [{ url: `/debate/${id}/opengraph-image`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/debate/${id}/opengraph-image`],
    },
  }
}

export default async function DebatePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: debate, error } = await supabase
    .from('sparring_debates')
    .select()
    .eq('id', id)
    .single()

  if (error || !debate) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  // 접근 권한: 공개 토론 or 본인 토론 or 샘플
  const canAccess = debate.is_public || debate.is_sample || (user && debate.user_id === user.id)
  if (!canAccess) {
    if (!user) {
      redirect(`/login?redirect=/debate/${id}`)
    }
    redirect('/')
  }

  const isFinished = debate.status === 'completed' || debate.status === 'early_end'
  const report = isFinished ? await getReport(id) : null

  return <DebateArena debate={debate as Debate} initialReport={report as import('@/types').ReportData | null} />
}
