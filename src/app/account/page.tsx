import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import AccountClient from './AccountClient'

export const metadata: Metadata = {
  title: 'My Account — Sparring AI',
  robots: { index: false, follow: false },
}

const FREE_DAILY_LIMIT = process.env.FREE_DAILY_LIMIT ? parseInt(process.env.FREE_DAILY_LIMIT) : 3
const PRO_DAILY_LIMIT = 30

interface Debate {
  id: string
  topic: string
  status: string
  rounds: number
  language: string
  is_public: boolean
  created_at: string
  completed_at: string | null
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/account')

  const service = await createServiceClient()

  const today = new Date().toISOString().split('T')[0]

  const [{ data: debates }, { data: todayUsage }, { data: profile }] = await Promise.all([
    service
      .from('sparring_debates')
      .select('id, topic, status, rounds, language, is_public, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    service
      .from('sparring_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single(),
    service
      .from('sparring_profiles')
      .select('plan, plan_expires_at')
      .eq('id', user.id)
      .single(),
  ])

  const rawPlan = profile?.plan ?? 'free'
  const isPlanExpired = profile?.plan_expires_at && new Date(profile.plan_expires_at) < new Date()
  const userPlan: 'free' | 'pro' = (rawPlan === 'pro' && !isPlanExpired) ? 'pro' : 'free'
  const isPro = userPlan === 'pro'
  const usedToday = todayUsage?.count ?? 0
  const totalDebates = debates?.length ?? 0
  const completedDebates = (debates ?? []).filter((d: Debate) => d.status === 'completed').length

  return (
    <AccountClient
      email={user.email ?? ''}
      isPro={isPro}
      planExpiresAt={profile?.plan_expires_at ?? null}
      usedToday={usedToday}
      totalDebates={totalDebates}
      completedDebates={completedDebates}
      debates={(debates ?? []) as Debate[]}
      freeDailyLimit={FREE_DAILY_LIMIT}
      proDailyLimit={PRO_DAILY_LIMIT}
    />
  )
}
