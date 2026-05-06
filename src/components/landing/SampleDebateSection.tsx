'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import Button from '@/components/ui/Button'

const SAMPLE_TOPICS = {
  ko: 'AI가 인간의 일자리를 대체하는 것은 긍정적이다',
  en: 'AI replacing human jobs is a positive development',
}

export default function SampleDebateSection() {
  const router = useRouter()
  const { language, t } = useLanguage()
  const [isStarting, setIsStarting] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const handleSampleStart = async () => {
    setIsStarting(true)
    try {
      const resp = await fetch('/api/debate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: SAMPLE_TOPICS[language],
          topic_type: 'strategic',
          rounds: 3,
          language,
          is_sample: true,
        }),
      })

      const data = await resp.json()
      if (data.debate?.id) {
        router.push(`/debate/${data.debate.id}`)
      }
    } catch {
      // silent
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <section id="sample" className="py-24 px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
          LIVE DEMO
        </p>
        <h2
          className="font-black mb-4"
          style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
        >
          {t('지금 바로 체험해보세요', 'Try it right now')}
        </h2>
        <p className="text-base mb-2" style={{ color: 'var(--text-secondary)' }}>
          {t('회원가입 없이 1회 무료 체험', 'One free debate — no signup required')}
        </p>

        {/* 고정 의제 표시 */}
        <div
          className="my-8 p-6 rounded-2xl border text-left"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            {t('체험 의제', 'SAMPLE TOPIC')}
          </p>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            "{SAMPLE_TOPICS[language]}"
          </p>

          <div className="flex gap-3 mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1.5">
              <span style={{ color: 'var(--red)' }}>🔴</span>
              {t('찬성 AI', 'Pro AI')}
            </span>
            <span>vs</span>
            <span className="flex items-center gap-1.5">
              <span style={{ color: 'var(--blue)' }}>🔵</span>
              {t('반대 AI', 'Con AI')}
            </span>
            <span className="ml-auto">3 {t('라운드', 'rounds')}</span>
          </div>
        </div>

        <Button onClick={handleSampleStart} disabled={isStarting} size="lg" className="px-12">
          {isStarting ? t('시작 중...', 'Starting...') : t('무료 체험 시작 →', 'Start Free Trial →')}
        </Button>

        <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
          {t('더 많은 의제로 토론하려면 로그인하세요', 'Log in to debate on any topic')}
        </p>
      </div>
    </section>
  )
}
