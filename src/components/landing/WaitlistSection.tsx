'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'

type State = 'idle' | 'loading' | 'done' | 'already' | 'error'

export default function WaitlistSection() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  // 로그인된 경우 이메일 자동 채우기
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'loading' || state === 'done') return
    setState('loading')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setState('error'); return }
      setState(data.already ? 'already' : 'done')
    } catch {
      setState('error')
    }
  }

  const isSuccess = state === 'done' || state === 'already'

  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-xl mx-auto text-center">

        {/* 상단 뱃지 */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6"
          style={{ borderColor: 'rgba(99,102,241,0.3)', backgroundColor: 'rgba(99,102,241,0.08)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            {t('정식 오픈 예정', 'Coming Soon')}
          </span>
        </div>

        <h2 className="font-black mb-3"
          style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
          {t('정식 오픈 소식, 가장 먼저 받아보세요', 'Be first to know when we launch')}
        </h2>
        <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          {t(
            '정식 서비스 오픈 시 얼리버드 혜택과 함께 이메일로 바로 알려드립니다.',
            'Get early-bird benefits and launch updates straight to your inbox.'
          )}
        </p>

        {isSuccess ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: 'rgba(99,102,241,0.12)' }}>
              {state === 'already' ? '👍' : '✅'}
            </div>
            <p className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
              {state === 'already'
                ? t('이미 등록된 이메일입니다', 'You\'re already on the list!')
                : t('등록 완료! 오픈 시 알려드릴게요', 'You\'re in! We\'ll let you know.')}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {email}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              ref={inputRef}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('이메일 주소를 입력하세요', 'Enter your email')}
              className="flex-1 h-12 px-4 rounded-xl border text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              {state === 'loading'
                ? t('등록 중...', 'Submitting...')
                : t('얼리버드 신청', 'Notify me')}
            </button>
          </form>
        )}

        {state === 'error' && (
          <p className="mt-3 text-xs" style={{ color: '#ef4444' }}>
            {t('오류가 발생했습니다. 다시 시도해주세요.', 'Something went wrong. Please try again.')}
          </p>
        )}

        <p className="mt-5 text-xs" style={{ color: 'var(--text-muted)' }}>
          {t('스팸 없음 · 언제든 수신 거부 가능', 'No spam · Unsubscribe anytime')}
        </p>
      </div>
    </section>
  )
}
