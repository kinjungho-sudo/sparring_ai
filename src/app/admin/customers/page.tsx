import { createServiceClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const ADMIN_WHITELIST = (process.env.ADMIN_WHITELIST || '').split(',').map(e => e.trim())

interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  provider: string | null
  created_at: string
}

interface Consent {
  user_id: string
  terms_agreed: boolean
  privacy_agreed: boolean
  agreed_at: string | null
}

interface UsageRow {
  user_id: string
  date: string
  count: number
}

interface DebateRow {
  user_id: string
  created_at: string
  status: string
}

export default async function CustomersPage() {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user || !ADMIN_WHITELIST.includes(user.email ?? '')) redirect('/403')

  const supabase = await createServiceClient()

  const [
    { data: profiles },
    { data: consents },
    { data: usages },
    { data: debates },
  ] = await Promise.all([
    supabase.from('sparring_profiles').select('id, email, full_name, avatar_url, provider, created_at').order('created_at', { ascending: false }),
    supabase.from('sparring_consents').select('user_id, terms_agreed, privacy_agreed, agreed_at'),
    supabase.from('sparring_usage').select('user_id, date, count'),
    supabase.from('sparring_debates').select('user_id, created_at, status').not('user_id', 'is', null),
  ])

  // 인덱스 빌드
  const consentMap = new Map<string, Consent>()
  for (const c of (consents ?? []) as Consent[]) consentMap.set(c.user_id, c)

  const usageMap = new Map<string, number>()
  for (const u of (usages ?? []) as UsageRow[]) {
    usageMap.set(u.user_id, (usageMap.get(u.user_id) ?? 0) + u.count)
  }

  const debateMap = new Map<string, { total: number; completed: number; lastSeen: string }>()
  for (const d of (debates ?? []) as DebateRow[]) {
    const cur = debateMap.get(d.user_id) ?? { total: 0, completed: 0, lastSeen: d.created_at }
    debateMap.set(d.user_id, {
      total: cur.total + 1,
      completed: cur.completed + (d.status === 'completed' ? 1 : 0),
      lastSeen: d.created_at > cur.lastSeen ? d.created_at : cur.lastSeen,
    })
  }

  const rows = (profiles ?? []) as Profile[]

  // 요약 통계
  const totalUsers = rows.length
  const agreedUsers = rows.filter(p => consentMap.has(p.id)).length
  const today = new Date().toISOString().split('T')[0]
  const todayActiveUsers = new Set((usages ?? [] as UsageRow[]).filter((u: UsageRow) => u.date === today && u.count > 0).map((u: UsageRow) => u.user_id)).size
  const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const newThisWeek = rows.filter(p => p.created_at >= thisWeek).length

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>ADMIN</p>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>고객 관리</h1>
        </div>
        <Link href="/admin" className="text-sm" style={{ color: 'var(--text-muted)' }}>← 대시보드</Link>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: '전체 회원', value: totalUsers, color: 'var(--accent)' },
          { label: '약관 동의', value: agreedUsers, color: '#22c55e' },
          { label: '오늘 활성', value: todayActiveUsers, color: '#f59e0b' },
          { label: '이번주 신규', value: newThisWeek, color: '#a78bfa' },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 고객 테이블 */}
      <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm min-w-[700px]">
          <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <tr>
              {['이름 / 이메일', '가입일', '약관동의', '총 토론', '완료', '누적 사용', '마지막 활동'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((profile) => {
              const consent = consentMap.get(profile.id)
              const usage = usageMap.get(profile.id) ?? 0
              const debate = debateMap.get(profile.id) ?? { total: 0, completed: 0, lastSeen: '' }
              return (
                <tr key={profile.id} className="border-t hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                  {/* 이름/이메일 */}
                  <td className="px-4 py-3">
                    <p className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>
                      {profile.full_name ?? '(이름 없음)'}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {profile.email ?? '-'}
                    </p>
                  </td>
                  {/* 가입일 */}
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(profile.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  {/* 약관동의 */}
                  <td className="px-4 py-3">
                    {consent ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                        동의 {consent.agreed_at ? new Date(consent.agreed_at).toLocaleDateString('ko-KR') : ''}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                        미동의
                      </span>
                    )}
                  </td>
                  {/* 총 토론 */}
                  <td className="px-4 py-3 font-bold text-center" style={{ color: 'var(--text-primary)' }}>
                    {debate.total}
                  </td>
                  {/* 완료 */}
                  <td className="px-4 py-3 text-center text-xs" style={{ color: '#22c55e' }}>
                    {debate.completed}
                  </td>
                  {/* 누적 사용 */}
                  <td className="px-4 py-3 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {usage}
                  </td>
                  {/* 마지막 활동 */}
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                    {debate.lastSeen ? new Date(debate.lastSeen).toLocaleDateString('ko-KR') : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <p className="text-3xl mb-3">👥</p>
            <p className="text-sm">아직 가입한 고객이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
