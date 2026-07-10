import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { listDebates } from '@/lib/db/debates'
import HistoryClient from './HistoryClient'

export const metadata: Metadata = {
  title: 'Debate History — Sparring AI',
  robots: { index: false, follow: false },
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/debate/history')

  const debates = await listDebates(user.id)

  return <HistoryClient debates={debates} />
}
