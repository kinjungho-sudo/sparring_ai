'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import DisclaimerModal from '@/components/debate/DisclaimerModal'
import UsageLimitModal from '@/components/debate/UsageLimitModal'
import Button from '@/components/ui/Button'
import type { ValidateResult, DebateConfig, DebaterTone } from '@/types'

const ROUND_PRESETS = [3, 5, 7]

const TONE_OPTIONS: { value: DebaterTone; label: string; desc: string }[] = [
  { value: 'assertive',  label: '단호함',   desc: '공격적·확신에 찬 어조' },
  { value: 'analytical', label: '분석적',   desc: '데이터·논리 중심' },
  { value: 'emotional',  label: '감성적',   desc: '공감·스토리 중심' },
  { value: 'socratic',   label: '소크라테스', desc: '질문으로 모순 유도' },
]

function DebaterCustomPanel({
  side,
  color,
  label,
  config,
  onChange,
}: {
  side: 'red' | 'blue'
  color: string
  label: string
  config: { persona?: string; tone?: DebaterTone; key_argument?: string }
  onChange: (c: typeof config) => void
}) {
  return (
    <div className="p-4 rounded-xl border space-y-3" style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}>
      <p className="text-xs font-black uppercase tracking-widest" style={{ color }}>
        {side === 'red' ? '🔴' : '🔵'} {label}
      </p>

      {/* 페르소나 */}
      <div>
        <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>페르소나 (선택)</label>
        <input
          type="text"
          value={config.persona ?? ''}
          onChange={(e) => onChange({ ...config, persona: e.target.value || undefined })}
          placeholder="예: 현직 변호사, 경제학 교수, 스타트업 창업자..."
          className="w-full h-9 px-3 rounded-lg border text-xs outline-none focus:border-indigo-500 transition-colors"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          maxLength={60}
        />
      </div>

      {/* 어조 */}
      <div>
        <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>어조 (선택)</label>
        <div className="grid grid-cols-2 gap-1.5">
          {TONE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...config, tone: config.tone === opt.value ? undefined : opt.value })}
              className="h-9 px-2 rounded-lg border text-xs font-semibold transition-all text-left flex flex-col justify-center"
              style={{
                backgroundColor: config.tone === opt.value ? `${color}20` : 'var(--bg-card)',
                borderColor: config.tone === opt.value ? color : 'var(--border)',
                color: config.tone === opt.value ? color : 'var(--text-secondary)',
              }}
            >
              <span>{opt.label}</span>
              <span className="text-[10px] opacity-60">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 핵심 주장 */}
      <div>
        <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>핵심 주장 (선택)</label>
        <textarea
          value={config.key_argument ?? ''}
          onChange={(e) => onChange({ ...config, key_argument: e.target.value || undefined })}
          placeholder="반드시 포함해야 할 논점을 입력하세요..."
          className="w-full h-16 px-3 py-2 rounded-lg border text-xs resize-none outline-none focus:border-indigo-500 transition-colors"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          maxLength={200}
        />
      </div>
    </div>
  )
}

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
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [debateConfig, setDebateConfig] = useState<DebateConfig>({})

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
          debate_config: (debateConfig.red || debateConfig.blue) ? debateConfig : undefined,
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
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
          NEW DEBATE
        </p>
        <h1
          className="font-black"
          style={{ fontSize: 'clamp(26px, 4vw, 40px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
        >
          {t('의제를 입력하세요', 'Enter your topic')}
        </h1>
        <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
          {t('결정이 필요한 주제를 자유롭게 입력하세요', 'Type any topic you need to decide on')}
        </p>
      </div>

      <div className="space-y-5">
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
            maxLength={400}
          />
          <div className="flex justify-between mt-1">
            {error && <p className="text-xs text-red-500">{error}</p>}
            <p className="text-xs ml-auto" style={{ color: topic.length > 350 ? 'var(--gold)' : 'var(--text-muted)' }}>
              {topic.length}/400
            </p>
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

        {/* 고급 설정 토글 */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-bold w-full py-2 transition-colors"
            style={{ color: showAdvanced ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            <span className="transition-transform" style={{ display: 'inline-block', transform: showAdvanced ? 'rotate(90deg)' : 'none' }}>▶</span>
            {t('고급 설정 (AI 페르소나 / 어조 / 핵심 주장)', 'Advanced (Persona / Tone / Key Argument)')}
          </button>

          {showAdvanced && (
            <div className="space-y-3 mt-2">
              <DebaterCustomPanel
                side="red"
                color="#ef4444"
                label="RED (찬성 측)"
                config={debateConfig.red ?? {}}
                onChange={(c) => setDebateConfig((prev) => ({ ...prev, red: c }))}
              />
              <DebaterCustomPanel
                side="blue"
                color="#6366f1"
                label="BLUE (반대 측)"
                config={debateConfig.blue ?? {}}
                onChange={(c) => setDebateConfig((prev) => ({ ...prev, blue: c }))}
              />
            </div>
          )}
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
