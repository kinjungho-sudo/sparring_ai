import { createServiceClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const ADMIN_WHITELIST = (process.env.ADMIN_WHITELIST || '').split(',').map(e => e.trim())

interface ApiLog {
  id: string
  debate_id: string | null
  endpoint: string
  duration_ms: number
  status: 'success' | 'error'
  error_message: string | null
  created_at: string
}

function StatusBadge({ status }: { status: string }) {
  const isError = status === 'error'
  return (
    <span
      className="text-xs font-bold px-2 py-1 rounded-full"
      style={{
        color: isError ? '#ef4444' : '#22c55e',
        backgroundColor: isError ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
      }}
    >
      {status}
    </span>
  )
}

function EndpointLabel({ endpoint }: { endpoint: string }) {
  const short = endpoint.replace('/api/debate/', '')
  const colorMap: Record<string, string> = {
    red: '#ef4444',
    blue: '#6366f1',
    factcheck: '#f59e0b',
    report: '#22c55e',
  }
  const color = colorMap[short] ?? 'var(--text-muted)'
  return (
    <span className="text-xs font-black uppercase tracking-widest" style={{ color }}>
      {short}
    </span>
  )
}

export default async function LogsPage() {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user || !ADMIN_WHITELIST.includes(user.email ?? '')) redirect('/403')

  const supabase = await createServiceClient()

  const [{ data: apiLogs }, { data: incompleteDebates }, { data: errorStats }] = await Promise.all([
    supabase
      .from('sparring_api_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('sparring_debates')
      .select('id, topic, status, created_at, language')
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('sparring_api_logs')
      .select('endpoint, status, duration_ms')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ])

  const logs = (apiLogs ?? []) as ApiLog[]
  const stats24h = errorStats ?? []

  // 엔드포인트별 통계 계산
  const endpointStats = ['red', 'blue', 'factcheck', 'report'].map((ep) => {
    const epLogs = stats24h.filter((l) => l.endpoint.includes(ep))
    const total = epLogs.length
    const errors = epLogs.filter((l) => l.status === 'error').length
    const avgMs = total > 0 ? Math.round(epLogs.reduce((s, l) => s + l.duration_ms, 0) / total) : 0
    return { ep, total, errors, avgMs, errorRate: total > 0 ? Math.round((errors / total) * 100) : 0 }
  })

  const totalErrors = logs.filter((l) => l.status === 'error').length
  const totalCalls = logs.length

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>ADMIN</p>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>시스템 로그</h1>
        </div>
        <Link href="/admin" className="text-sm" style={{ color: 'var(--text-muted)' }}>← 대시보드</Link>
      </div>

      {/* 24시간 요약 카드 */}
      <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
        <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{stats24h.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>24h 총 호출</p>
        </div>
        <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <p className="text-2xl font-black" style={{ color: stats24h.filter(l => l.status === 'error').length > 0 ? '#ef4444' : '#22c55e' }}>
            {stats24h.filter(l => l.status === 'error').length}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>24h 오류</p>
        </div>
        <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            {stats24h.length > 0 ? Math.round(stats24h.reduce((s, l) => s + l.duration_ms, 0) / stats24h.length) : 0}
            <span className="text-sm font-normal">ms</span>
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>24h 평균 응답</p>
        </div>
        <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <p className="text-2xl font-black" style={{ color: (incompleteDebates?.length ?? 0) > 0 ? '#f59e0b' : '#22c55e' }}>
            {incompleteDebates?.length ?? 0}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>미완료 토론</p>
        </div>
      </div>

      {/* 엔드포인트별 통계 */}
      <div className="mb-8">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>엔드포인트별 24h 통계</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {endpointStats.map(({ ep, total, errors, avgMs, errorRate }) => (
            <div key={ep} className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <EndpointLabel endpoint={`/api/debate/${ep}`} />
              <p className="text-lg font-black mt-2" style={{ color: 'var(--text-primary)' }}>{total}<span className="text-xs font-normal ml-1" style={{ color: 'var(--text-muted)' }}>회</span></p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>avg {avgMs}ms</p>
                {errors > 0 && (
                  <p className="text-xs font-bold" style={{ color: '#ef4444' }}>오류 {errorRate}%</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API 로그 테이블 */}
      <div className="mb-8">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
          최근 API 호출 ({totalCalls}건 / 오류 {totalErrors}건)
        </h2>
        {logs.length === 0 ? (
          <div className="p-6 rounded-xl border text-center" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>아직 로그가 없습니다. 토론을 실행하면 여기에 기록됩니다.</p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <div
              className="grid text-xs font-black uppercase tracking-widest px-4 py-2.5"
              style={{ gridTemplateColumns: '100px 1fr 80px 80px 1fr', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
            >
              <span>엔드포인트</span>
              <span>토론 ID</span>
              <span>응답시간</span>
              <span>상태</span>
              <span>시각</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="grid items-center px-4 py-3 text-sm"
                  style={{ gridTemplateColumns: '100px 1fr 80px 80px 1fr', backgroundColor: 'var(--bg-card)' }}
                >
                  <EndpointLabel endpoint={log.endpoint} />
                  <span className="text-xs truncate pr-2" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {log.debate_id ? log.debate_id.slice(0, 8) + '…' : '—'}
                  </span>
                  <span className="text-xs font-mono" style={{ color: log.duration_ms > 10000 ? '#f59e0b' : 'var(--text-secondary)' }}>
                    {(log.duration_ms / 1000).toFixed(1)}s
                  </span>
                  <StatusBadge status={log.status} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(log.created_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 오류 로그만 필터 */}
      {totalErrors > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold mb-3" style={{ color: '#ef4444' }}>⚠️ 오류 로그</h2>
          <div className="space-y-2">
            {logs.filter(l => l.status === 'error').map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border"
                style={{ borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.05)' }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <EndpointLabel endpoint={log.endpoint} />
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {new Date(log.created_at).toLocaleString('ko-KR')}
                  </span>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {log.debate_id ? log.debate_id.slice(0, 8) + '…' : '—'}
                  </span>
                </div>
                <p className="text-xs" style={{ color: '#ef4444', fontFamily: 'monospace' }}>
                  {log.error_message ?? 'unknown error'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 미완료 토론 */}
      <div>
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
          미완료 토론 ({incompleteDebates?.length ?? 0}건)
        </h2>
        <div className="space-y-2">
          {(incompleteDebates ?? []).map((d: { id: string; topic: string; status: string; created_at: string; language: string }) => (
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
          {(incompleteDebates?.length ?? 0) === 0 && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>미완료 토론 없음 ✅</p>
          )}
        </div>
      </div>
    </div>
  )
}
