import { createServiceClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const ADMIN_WHITELIST = (process.env.ADMIN_WHITELIST || '').split(',').map(e => e.trim())

export default async function DebatesPage() {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user || !ADMIN_WHITELIST.includes(user.email ?? '')) redirect('/403')

  const supabase = await createServiceClient()

  const { data: debates } = await supabase
    .from('sparring_debates')
    .select()
    .order('created_at', { ascending: false })
    .limit(100)

  const statusColor: Record<string, string> = {
    in_progress: '#f59e0b',
    completed: '#22c55e',
    early_end: '#6366f1',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>ADMIN</p>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>토론 로그</h1>
        </div>
        <Link href="/admin" className="text-sm" style={{ color: 'var(--text-muted)' }}>← 대시보드</Link>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <tr>
              {['의제', '언어', '라운드', '상태', '샘플', '생성일'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(debates ?? []).map((d: { id: string; topic: string; language: string; rounds: number; status: string; is_sample: boolean; created_at: string }) => (
              <tr key={d.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="px-4 py-3 max-w-xs truncate" style={{ color: 'var(--text-primary)' }}>{d.topic}</td>
                <td className="px-4 py-3 uppercase" style={{ color: 'var(--text-muted)' }}>{d.language}</td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{d.rounds}R</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: statusColor[d.status] || 'var(--text-muted)', backgroundColor: statusColor[d.status] ? `${statusColor[d.status]}22` : 'transparent' }}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{d.is_sample ? '✓' : '-'}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(d.created_at).toLocaleDateString('ko-KR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(debates?.length ?? 0) === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>데이터 없음</div>
        )}
      </div>
    </div>
  )
}
