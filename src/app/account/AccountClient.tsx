'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

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

interface AccountClientProps {
  email: string
  isPro: boolean
  planExpiresAt: string | null
  usedToday: number
  totalDebates: number
  completedDebates: number
  debates: Debate[]
  freeDailyLimit: number
  proDailyLimit: number
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage()
  const map: Record<string, { label: () => string; color: string; bg: string }> = {
    completed:   { label: () => t('완료', 'Done'),        color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    early_end:   { label: () => t('조기종료', 'Early end'), color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    in_progress: { label: () => t('진행중', 'In progress'), color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  }
  const style = map[status] ?? { label: () => status, color: 'var(--text-muted)', bg: 'transparent' }
  return (
    <span
      className="shrink-0 text-xs font-bold px-2 py-1 rounded-full"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {style.label()}
    </span>
  )
}

export default function AccountClient({
  email, isPro, planExpiresAt, usedToday, totalDebates, completedDebates, debates, freeDailyLimit, proDailyLimit,
}: AccountClientProps) {
  const { t, language } = useLanguage()

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>MY ACCOUNT</p>
        <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{t('내 계정', 'My Account')}</h1>
      </div>

      <div
        className="p-6 rounded-2xl border mb-6"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>EMAIL</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{email}</p>
          </div>
          <span
            className="text-xs font-black px-3 py-1 rounded-full"
            style={{
              color: isPro ? '#f59e0b' : 'var(--accent)',
              backgroundColor: isPro ? 'rgba(245,158,11,0.12)' : 'var(--accent-dim)',
            }}
          >
            {isPro ? '⭐ PRO' : 'FREE'}
          </span>
        </div>
        {isPro && planExpiresAt && (
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            {t('만료일', 'Expires')}: {new Date(planExpiresAt).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US')}
          </p>
        )}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
              {isPro ? `${usedToday} / ${proDailyLimit}` : `${usedToday} / ${freeDailyLimit}`}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('오늘 사용', 'Today')}</p>
          </div>
          <div>
            <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{totalDebates}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('전체 토론', 'Total')}</p>
          </div>
          <div>
            <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{completedDebates}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t('완료한 토론', 'Completed')}</p>
          </div>
        </div>
      </div>

      <Link
        href="/debate/new"
        className="flex items-center justify-center w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors mb-8"
      >
        + {t('새 토론 시작', 'New Debate')}
      </Link>

      <div>
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
          {t('토론 이력', 'Debate History')} ({totalDebates}{t('건', '')})
        </h2>

        {totalDebates === 0 ? (
          <div
            className="p-8 rounded-2xl border text-center"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <p className="text-2xl mb-2">💬</p>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {t('아직 토론이 없습니다', 'No debates yet')}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('첫 토론을 시작해보세요', 'Start your first debate')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {debates.map((debate) => (
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
                    {debate.rounds}{t('라운드', 'R')} · {debate.language.toUpperCase()} · {formatDate(debate.created_at)}
                    {debate.is_public && (
                      <span className="ml-2" style={{ color: 'var(--accent)' }}>🔗 {t('공개', 'Public')}</span>
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
