import { createServiceClient } from '@/lib/supabase/server'

const FREE_DAILY_LIMIT = process.env.FREE_DAILY_LIMIT ? parseInt(process.env.FREE_DAILY_LIMIT) : 3

async function getUserPlan(supabase: Awaited<ReturnType<typeof createServiceClient>>, userId: string): Promise<'free' | 'pro'> {
  const { data } = await supabase
    .from('sparring_profiles')
    .select('plan, plan_expires_at')
    .eq('id', userId)
    .single()

  if (!data || data.plan !== 'pro') return 'free'
  // 만료일이 있고 이미 지났으면 free로 처리
  if (data.plan_expires_at && new Date(data.plan_expires_at) < new Date()) return 'free'
  return 'pro'
}

export async function checkAndIncrementUsage(userId: string): Promise<{ allowed: boolean; count: number; plan: 'free' | 'pro' }> {
  const supabase = await createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const plan = await getUserPlan(supabase, userId)

  // pro 플랜은 무제한
  if (plan === 'pro') {
    const { data: existing } = await supabase
      .from('sparring_usage')
      .select()
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (existing) {
      await supabase.from('sparring_usage').update({ count: existing.count + 1 }).eq('id', existing.id)
      return { allowed: true, count: existing.count + 1, plan }
    }
    await supabase.from('sparring_usage').insert({ user_id: userId, date: today, count: 1 })
    return { allowed: true, count: 1, plan }
  }

  // free 플랜: 일일 한도 적용
  const { data: existing } = await supabase
    .from('sparring_usage')
    .select()
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (existing && existing.count >= FREE_DAILY_LIMIT) {
    return { allowed: false, count: existing.count, plan }
  }

  if (existing) {
    await supabase.from('sparring_usage').update({ count: existing.count + 1 }).eq('id', existing.id)
    return { allowed: true, count: existing.count + 1, plan }
  }

  await supabase.from('sparring_usage').insert({ user_id: userId, date: today, count: 1 })
  return { allowed: true, count: 1, plan }
}

export async function getTodayUsage(userId: string): Promise<{ count: number; plan: 'free' | 'pro'; limit: number }> {
  const supabase = await createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const plan = await getUserPlan(supabase, userId)

  const { data } = await supabase
    .from('sparring_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  return {
    count: data?.count ?? 0,
    plan,
    limit: plan === 'pro' ? Infinity : FREE_DAILY_LIMIT,
  }
}
