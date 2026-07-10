'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Debate } from '@/types'

interface HistoryClientProps {
  debates: Debate[]
}

export default function HistoryClient({ debates }: HistoryClientProps) {
  const { t, language } = useLanguage()

  function statusLabel(status: Debate['status']) {
    if (status === 'completed') return { text: t('완료', 'Done'), color: '#22c55e' }
    if (status === 'early_end') return { text: t('중도 종료', 'Early end'), color: '#f59e0b' }
    return { text: t('진행 중', 'In progress'), color: '#6366f1' }
  }

  function formatDate(iso: string | null) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>HISTORY</p>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>{t('지난 토론', 'Past Debates')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {t('완료된 토론을 다시 확인하세요.', 'Review your completed debates.')}
          </p>
        </div>

        {debates.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🗂️</p>
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{t('아직 완료된 토론이 없습니다', 'No completed debates yet')}</p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{t('토론을 완료하면 여기서 다시 볼 수 있습니다.', 'Completed debates will appear here.')}</p>
            <Link
              href="/debate/new"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors"
            >
              {t('새 토론 시작', 'New Debate')}
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
                          {debate.rounds}{t('라운드', 'R')}
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
                        {t('결과 보기', 'View result')} →
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
            + {t('새 토론 시작', 'New Debate')}
          </Link>
        </div>
      </div>
    </div>
  )
}
