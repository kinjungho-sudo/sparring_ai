import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '내 계정' }

const DAILY_LIMIT = process.env.DAILY_LIMIT ? parseInt(process.env.DAILY_LIMIT) : 3
const IS_UNLIMITED = DAILY_LIMIT === 0

interface Debate {
  id: string
  topic: string
  status: string
  rounds: number
  language: string
  is_public: boolean
  created_at: string
  completed_at: string | null
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/account')

  const service = await createServiceClient()

  const today = new Date().toISOString().split('T')[0]

  const [{ data: debates }, { data: todayUsage }] = await Promise.all([
    service
      .from('sparring_debates')
      .select('id, topic, status, rounds, language, is_public, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    service
      .from('sparring_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single(),
  ])

  const usedToday = todayUsage?.count ?? 0
  const totalDebates = debates?.length ?? 0
  const completedDebates = (debates ?? []).filter((d: Debate) => d.status === 'completed').length

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* 헤더 */}
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>MY ACCOUNT</p>
        <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>내 계정</h1>
      </div>

      {/* 프로필 카드 */}
      <div
        className="p-6 rounded-2xl border mb-6"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>EMAIL</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.email}</p>
          </div>
          <span
            className="text-xs font-black px-3 py-1 rounded-full"
            style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-dim)' }}
          >
            FREE
          </span>
        </div>
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
              {IS_UNLIMITED ? '∞' : `${usedToday}/${DAILY_LIMIT}`}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>오늘 사용</p>
          </div>
          <div>
            <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{totalDebates}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>전체 토론</p>
          </div>
          <div>
            <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{completedDebates}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>완료한 토론</p>
          </div>
        </div>
      </div>

      {/* 새 토론 CTA */}
      <Link
        href="/debate/new"
        className="flex items-center justify-center w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors mb-8"
      >
        + 새 토론 시작
      </Link>

      {/* 토론 이력 */}
      <div>
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
          토론 이력 ({totalDebates}건)
        </h2>

        {totalDebates === 0 ? (
          <div
            className="p-8 rounded-2xl border text-center"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <p className="text-2xl mb-2">💬</p>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              아직 토론이 없습니다
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              첫 토론을 시작해보세요
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {(debates as Debate[]).map((debate) => (
              <Link
                key={debate.id}
                href={`/debate/${debate.id}`}
                className="flex items-center justify-between p-4 rounded-xl border transition-colors hover:bg-white/5"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {debate.topic}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {debate.rounds}라운드 · {debate.language.toUpperCase()} · {new Date(debate.created_at).toLocaleDateString('ko-KR')}
                    {debate.is_public && (
                      <span className="ml-2" style={{ color: 'var(--accent)' }}>🔗 공개</span>
                    )}
                  </p>
                </div>
                <StatusBadge status={debate.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    completed:   { label: '완료',   color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    early_end:   { label: '조기종료', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    in_progress: { label: '진행중', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  }
  const style = map[status] ?? { label: status, color: 'var(--text-muted)', bg: 'transparent' }
  return (
    <span
      className="shrink-0 text-xs font-bold px-2 py-1 rounded-full"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {style.label}
    </span>
  )
}
