import { createServiceClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import GrantProButton from './GrantProButton'

const ADMIN_WHITELIST = (process.env.ADMIN_WHITELIST || '').split(',').map(e => e.trim())

interface WaitlistRow {
  email: string
  user_id: string | null
  source: string | null
  created_at: string
}

interface ProfileRow {
  id: string
  email: string | null
  plan: string | null
}

export default async function WaitlistPage() {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user || !ADMIN_WHITELIST.includes(user.email ?? '')) redirect('/403')

  const supabase = await createServiceClient()

  const [{ data: waitlist }, { data: profiles }] = await Promise.all([
    supabase.from('sparring_waitlist').select('email, user_id, source, created_at').order('created_at', { ascending: false }),
    supabase.from('sparring_profiles').select('id, email, plan'),
  ])

  const rows = (waitlist ?? []) as WaitlistRow[]
  const planMap = new Map<string, string>()
  for (const p of (profiles ?? []) as ProfileRow[]) {
    if (p.email) planMap.set(p.email.toLowerCase(), p.plan ?? 'free')
  }

  const proCount = rows.filter(r => planMap.get(r.email.toLowerCase()) === 'pro').length

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>ADMIN</p>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>웨이트리스트</h1>
        </div>
        <Link href="/admin" className="text-sm" style={{ color: 'var(--text-muted)' }}>← 대시보드</Link>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: '총 신청', value: rows.length, color: 'var(--accent)' },
          { label: 'Pro 전환', value: proCount, color: '#a78bfa' },
          { label: '미전환', value: rows.length - proCount, color: 'var(--text-muted)' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 테이블 */}
      <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm min-w-[600px]">
          <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <tr>
              {['이메일', '가입일', '회원 여부', '플랜', '액션'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const plan = planMap.get(row.email.toLowerCase())
              const isPro = plan === 'pro'
              const isRegistered = plan !== undefined
              return (
                <tr key={row.email} className="border-t hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{row.email}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(row.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    {isRegistered ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>가입</span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>미가입</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isPro ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>Pro</span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                        {isRegistered ? 'Free' : '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isRegistered && (
                      <GrantProButton email={row.email} isPro={isPro} />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <p className="text-3xl mb-3">📬</p>
            <p className="text-sm">아직 웨이트리스트 신청이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
