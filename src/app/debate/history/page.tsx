import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Debate } from '@/types'
import { listDebates } from '@/lib/db/debates'

export const metadata: Metadata = {
  title: '지난 토론 — 스파링 AI',
  robots: { index: false, follow: false },
}

function statusLabel(status: Debate['status']) {
  if (status === 'completed') return { text: '완료', color: '#22c55e' }
  if (status === 'early_end') return { text: '중도 종료', color: '#f59e0b' }
  return { text: '진행 중', color: '#6366f1' }
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/debate/history')

  const debates = await listDebates(user.id)

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>HISTORY</p>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>지난 토론</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            완료된 토론을 다시 확인하세요.
          </p>
        </div>

        {debates.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🗂️</p>
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>아직 완료된 토론이 없습니다</p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>토론을 완료하면 여기서 다시 볼 수 있습니다.</p>
            <Link
              href="/debate/new"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors"
            >
              새 토론 시작
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {debates.map((debate) => {
              const s = statusLabel(debate.status)
              return (
                <Link
                  key={debate.id}
                  href={`/debate/${debate.id}`}
                  className="block p-4 rounded-2xl border transition-colors hover:bg-white/5"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm leading-snug mb-1.5" style={{ color: 'var(--text-primary)' }}>
                        {debate.topic}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md"
                          style={{ color: s.color, backgroundColor: `${s.color}18` }}
                        >
                          {s.text}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {debate.rounds}라운드
                        </span>
                        {debate.language === 'en' && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>EN</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(debate.completed_at ?? debate.created_at)}
                      </p>
                      <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--accent)' }}>
                        결과 보기 →
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/debate/new"
            className="inline-flex items-center justify-center h-10 px-5 rounded-xl border text-sm font-semibold transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            + 새 토론 시작
          </Link>
        </div>
      </div>
    </div>
  )
}
