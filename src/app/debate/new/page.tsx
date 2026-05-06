'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import DisclaimerModal from '@/components/debate/DisclaimerModal'
import UsageLimitModal from '@/components/debate/UsageLimitModal'
import Button from '@/components/ui/Button'
import type { ValidateResult } from '@/types'

const ROUND_PRESETS = [3, 5, 7]

export default function NewDebatePage() {
  const router = useRouter()
  const { language, t } = useLanguage()
  const [topic, setTopic] = useState('')
  const [rounds, setRounds] = useState(5)
  const [isValidating, setIsValidating] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [showUsageLimit, setShowUsageLimit] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidateResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (topic.trim().length < 5) {
      setError(t('의제를 5자 이상 입력해주세요.', 'Please enter at least 5 characters.'))
      return
    }

    setError('')
    setIsValidating(true)

    try {
      const resp = await fetch('/api/debate/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, language }),
      })
      const result: ValidateResult = await resp.json()
      setValidationResult(result)

      if (result.is_sensitive) {
        setShowDisclaimer(true)
      } else {
        await startDebate(result)
      }
    } catch {
      setError(t('오류가 발생했습니다. 다시 시도해주세요.', 'An error occurred. Please try again.'))
    } finally {
      setIsValidating(false)
    }
  }

  const startDebate = async (validation?: ValidateResult, disclaimerAgreed = false) => {
    const result = validation ?? validationResult
    setIsStarting(true)

    try {
      const resp = await fetch('/api/debate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          topic_type: result?.topic_type,
          rounds,
          is_virtual: result?.is_factual,
          disclaimer_agreed: disclaimerAgreed,
          language,
          is_sample: false,
        }),
      })

      const data = await resp.json()

      if (resp.status === 429) {
        setShowUsageLimit(true)
        return
      }

      if (!resp.ok) throw new Error(data.error)

      router.push(`/debate/${data.debate.id}`)
    } catch {
      setError(t('토론 시작 중 오류가 발생했습니다.', 'Failed to start the debate.'))
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
          NEW DEBATE
        </p>
        <h1
          className="font-black"
          style={{ fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
        >
          {t('의제를 입력하세요', 'Enter your topic')}
        </h1>
        <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
          {t('결정이 필요한 주제를 자유롭게 입력하세요', 'Type any topic you need to decide on')}
        </p>
      </div>

      <div className="space-y-6">
        {/* 의제 입력 */}
        <div>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t(
              '예: "우리 팀이 B2B SaaS로 피벗하는 것은 올바른 결정이다"',
              'e.g. "Pivoting our team to B2B SaaS is the right decision"'
            )}
            className="w-full h-32 p-4 rounded-xl border text-sm resize-none outline-none focus:border-indigo-500 transition-colors"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            maxLength={300}
          />
          <div className="flex justify-between mt-1">
            {error && <p className="text-xs text-red-500">{error}</p>}
            <p className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{topic.length}/300</p>
          </div>
        </div>

        {/* 라운드 설정 */}
        <div>
          <label className="text-xs font-black uppercase tracking-widest mb-3 block" style={{ color: 'var(--text-muted)' }}>
            {t('라운드 수', 'Rounds')}
          </label>
          <div className="flex gap-2 mb-3">
            {ROUND_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setRounds(preset)}
                className="flex-1 h-10 rounded-xl border text-sm font-bold transition-colors"
                style={{
                  backgroundColor: rounds === preset ? 'var(--accent)' : 'var(--bg-card)',
                  borderColor: rounds === preset ? 'var(--accent)' : 'var(--border)',
                  color: rounds === preset ? 'white' : 'var(--text-secondary)',
                }}
              >
                {preset}R
              </button>
            ))}
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <p className="text-xs mt-1 text-center" style={{ color: 'var(--text-muted)' }}>
            {t(`${rounds}라운드로 설정됨`, `Set to ${rounds} rounds`)}
          </p>
        </div>

        {/* 시작 버튼 */}
        <Button
          onClick={handleSubmit}
          disabled={isValidating || isStarting || topic.trim().length < 5}
          size="lg"
          className="w-full"
        >
          {isValidating
            ? t('의제 검증 중...', 'Validating...')
            : isStarting
            ? t('토론 시작 중...', 'Starting...')
            : t('토론 시작 →', 'Start Debate →')}
        </Button>
      </div>

      {showDisclaimer && (
        <DisclaimerModal
          onAgree={() => {
            setShowDisclaimer(false)
            startDebate(validationResult ?? undefined, true)
          }}
          onCancel={() => setShowDisclaimer(false)}
        />
      )}

      {showUsageLimit && (
        <UsageLimitModal onClose={() => setShowUsageLimit(false)} />
      )}
    </div>
  )
}
