import { createServiceClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const ADMIN_WHITELIST = (process.env.ADMIN_WHITELIST || '').split(',').map(e => e.trim())

export default async function CustomersPage() {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user || !ADMIN_WHITELIST.includes(user.email ?? '')) redirect('/403')

  const supabase = await createServiceClient()

  const { data: usages } = await supabase
    .from('sparring_usage')
    .select('user_id, date, count')
    .order('date', { ascending: false })
    .limit(100)

  const { data: debates } = await supabase
    .from('sparring_debates')
    .select('user_id, created_at')
    .not('user_id', 'is', null)
    .order('created_at', { ascending: false })

  // 사용자별 집계
  const userMap = new Map<string, { totalDebates: number; lastSeen: string; totalUsage: number }>()

  for (const d of debates ?? []) {
    const existing = userMap.get(d.user_id) ?? { totalDebates: 0, lastSeen: d.created_at, totalUsage: 0 }
    userMap.set(d.user_id, {
      totalDebates: existing.totalDebates + 1,
      lastSeen: d.created_at > existing.lastSeen ? d.created_at : existing.lastSeen,
      totalUsage: existing.totalUsage,
    })
  }

  for (const u of usages ?? []) {
    const existing = userMap.get(u.user_id)
    if (existing) {
      userMap.set(u.user_id, { ...existing, totalUsage: existing.totalUsage + u.count })
    }
  }

  const users = Array.from(userMap.entries()).sort((a, b) => b[1].totalDebates - a[1].totalDebates)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>ADMIN</p>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>고객 관리</h1>
        </div>
        <Link href="/admin" className="text-sm" style={{ color: 'var(--text-muted)' }}>← 대시보드</Link>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <tr>
              {['사용자 ID', '총 토론', '총 사용', '마지막 활동'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(([userId, data]) => (
              <tr key={userId} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{userId.slice(0, 8)}...</td>
                <td className="px-4 py-3 font-bold" style={{ color: 'var(--text-primary)' }}>{data.totalDebates}</td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{data.totalUsage}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(data.lastSeen).toLocaleDateString('ko-KR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>데이터 없음</div>
        )}
      </div>
    </div>
  )
}
