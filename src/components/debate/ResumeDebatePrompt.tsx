'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

interface ResumeDebate {
  id: string
  topic: string
}

const SESSION_KEY = 'resume_prompt_dismissed'

export default function ResumeDebatePrompt() {
  const { t } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const [debate, setDebate] = useState<ResumeDebate | null>(null)

  useEffect(() => {
    // 토론 진행 중인 페이지에서는 팝업 표시 안 함
    if (pathname.startsWith('/debate/') && pathname !== '/debate/new') return
    // 이번 세션에서 이미 닫은 경우 표시 안 함
    if (sessionStorage.getItem(SESSION_KEY)) return

    fetch('/api/debate/resume-check')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.debate) setDebate(data.debate)
      })
      .catch(() => {})
  }, [pathname])

  if (!debate) return null

  const handleResume = () => {
    router.push(`/debate/${debate.id}`)
    setDebate(null)
  }

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, '1')
    setDebate(null)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div
        className="w-full max-w-sm rounded-2xl border p-6"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        {/* 아이콘 */}
        <div className="text-3xl mb-4 text-center">⚡</div>

        {/* 제목 */}
        <h3 className="text-base font-black text-center mb-1" style={{ color: 'var(--text-primary)' }}>
          {t('진행 중인 토론이 있습니다', 'You have an ongoing debate')}
        </h3>

        {/* 토론 주제 */}
        <p
          className="text-xs text-center mb-5 px-2 py-2 rounded-lg leading-snug"
          style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' }}
        >
          &ldquo;{debate.topic}&rdquo;
        </p>

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 h-11 rounded-xl border text-sm font-semibold transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            {t('닫기', 'Close')}
          </button>
          <button
            onClick={handleResume}
            className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
          >
            {t('열기', 'Open')}
          </button>
        </div>
      </div>
    </div>
  )
}
