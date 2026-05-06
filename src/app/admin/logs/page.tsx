import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function LogsPage() {
  const supabase = await createServiceClient()

  const { data: debates } = await supabase
    .from('sparring_debates')
    .select('id, topic, status, created_at, language')
    .eq('status', 'in_progress')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>ADMIN</p>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>시스템 로그</h1>
        </div>
        <Link href="/admin" className="text-sm" style={{ color: 'var(--text-muted)' }}>← 대시보드</Link>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
          미완료 토론 ({debates?.length ?? 0}건)
        </h2>
        <div className="space-y-2">
          {(debates ?? []).map((d: { id: string; topic: string; status: string; created_at: string; language: string }) => (
            <div
              key={d.id}
              className="flex items-center justify-between p-4 rounded-xl border"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div>
                <p className="text-sm font-semibold truncate max-w-xs" style={{ color: 'var(--text-primary)' }}>{d.topic}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {d.id.slice(0, 8)} · {d.language.toUpperCase()} · {new Date(d.created_at).toLocaleString('ko-KR')}
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)' }}>
                {d.status}
              </span>
            </div>
          ))}
        </div>
        {(debates?.length ?? 0) === 0 && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>미완료 토론 없음 ✅</p>
        )}
      </div>

      <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Phase 2에서 추가 예정</p>
        <ul className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
          <li>• API 오류 로그</li>
          <li>• Anthropic API 호출 실패율</li>
          <li>• 응답 지연 모니터링</li>
        </ul>
      </div>
    </div>
  )
}
