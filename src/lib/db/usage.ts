import { createServiceClient } from '@/lib/supabase/server'

const DAILY_LIMIT = 3

export async function checkAndIncrementUsage(userId: string): Promise<{ allowed: boolean; count: number }> {
  const supabase = await createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('sparring_usage')
    .select()
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (existing && existing.count >= DAILY_LIMIT) {
    return { allowed: false, count: existing.count }
  }

  if (existing) {
    await supabase
      .from('sparring_usage')
      .update({ count: existing.count + 1 })
      .eq('id', existing.id)
    return { allowed: true, count: existing.count + 1 }
  }

  await supabase
    .from('sparring_usage')
    .insert({ user_id: userId, date: today, count: 1 })
  return { allowed: true, count: 1 }
}

export async function getTodayUsage(userId: string): Promise<number> {
  const supabase = await createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('sparring_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  return data?.count ?? 0
}
