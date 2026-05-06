import { createServiceClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const ADMIN_WHITELIST = (process.env.ADMIN_WHITELIST || '').split(',').map(e => e.trim())

const INPUT_COST_PER_1M = 3.0
const OUTPUT_COST_PER_1M = 15.0
const AVG_INPUT_RATIO = 0.7

export default async function ApiCostPage() {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user || !ADMIN_WHITELIST.includes(user.email ?? '')) redirect('/403')

  const supabase = await createServiceClient()

  const { data: messages } = await supabase
    .from('sparring_messages')
    .select('token_count, created_at')
    .not('token_count', 'is', null)
    .order('created_at', { ascending: false })

  const today = new Date().toISOString().split('T')[0]
  const monthStart = today.slice(0, 7) + '-01'

  const todayMessages = (messages ?? []).filter((m: { created_at: string }) => m.created_at.startsWith(today))
  const monthMessages = (messages ?? []).filter((m: { created_at: string }) => m.created_at >= monthStart)

  const calcCost = (msgs: Array<{ token_count: number | null }>) => {
    const total = msgs.reduce((sum, m) => sum + (m.token_count ?? 0), 0)
    const inputTokens = total * AVG_INPUT_RATIO
    const outputTokens = total * (1 - AVG_INPUT_RATIO)
    return {
      tokens: total,
      usd: (inputTokens / 1_000_000 * INPUT_COST_PER_1M + outputTokens / 1_000_000 * OUTPUT_COST_PER_1M).toFixed(4),
      krw: Math.round((inputTokens / 1_000_000 * INPUT_COST_PER_1M + outputTokens / 1_000_000 * OUTPUT_COST_PER_1M) * 1350),
    }
  }

  const todayCost = calcCost(todayMessages)
  const monthCost = calcCost(monthMessages)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>ADMIN</p>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>API 비용</h1>
        </div>
        <Link href="/admin" className="text-sm" style={{ color: 'var(--text-muted)' }}>← 대시보드</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {[
          { label: '오늘', data: todayCost },
          { label: '이번 달', data: monthCost },
        ].map(({ label, data }) => (
          <div key={label} className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <div className="text-3xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>${data.usd}</div>
            <div className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>≈ ₩{data.krw.toLocaleString()}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{data.tokens.toLocaleString()} tokens</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        * Claude claude-sonnet-4-6 기준 추정값 (Input $3/1M, Output $15/1M, 환율 1,350원)
      </p>
    </div>
  )
}
