'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import DisclaimerModal from '@/components/debate/DisclaimerModal'
import UsageLimitModal from '@/components/debate/UsageLimitModal'
import Button from '@/components/ui/Button'
import type { ValidateResult, DebateConfig, DebaterTone, DebateModel, TTSVoice } from '@/types'
import { TONE_VOICE_MAP, VOICE_LABELS } from '@/hooks/useTTS'

const ROUND_PRESETS = [5, 7, 10]

const TONE_OPTIONS: { value: DebaterTone; label: string; desc: string }[] = [
  { value: 'assertive',  label: '단호함',    desc: '공격적·확신에 찬 어조' },
  { value: 'analytical', label: '분석적',    desc: '데이터·논리 중심' },
  { value: 'emotional',  label: '감성적',    desc: '공감·스토리 중심' },
  { value: 'socratic',   label: '소크라테스', desc: '질문으로 모순 유도' },
]

const MODEL_OPTIONS: { value: DebateModel; label: string; badge: string; available: boolean }[] = [
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', badge: 'Anthropic', available: true },
  { value: 'gemini-2-flash',    label: 'Gemini 2.0 Flash',  badge: 'Google',    available: true },
  { value: 'gpt-4o-mini',       label: 'GPT-4o mini',       badge: 'OpenAI',    available: true },
]

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt']

async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'txt') {
    return await file.text()
  }
  // PDF, DOCX: 서버에 업로드하여 텍스트 추출
  const formData = new FormData()
  formData.append('file', file)
  const resp = await fetch('/api/extract-text', { method: 'POST', body: formData })
  if (resp.ok) {
    const { text } = await resp.json()
    return text as string
  }
  return `[첨부 파일: ${file.name}]\n(내용을 직접 붙여넣으면 더 정확하게 활용됩니다.)`
}

function TopicFileAttach({ onExtract }: { onExtract: (text: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const processFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      alert('PDF, DOCX, TXT 파일만 첨부할 수 있습니다.')
      return
    }
    setIsLoading(true)
    try {
      const text = await extractTextFromFile(file)
      onExtract(text)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await processFile(file)
    e.target.value = ''
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) await processFile(file)
  }

  return (
    <>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileRef.current?.click()}
        className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border transition-colors cursor-pointer"
        style={{
          borderColor: isDragging ? 'var(--accent)' : 'var(--border)',
          color: isDragging ? 'var(--accent)' : 'var(--text-muted)',
          backgroundColor: isDragging ? 'rgba(99,102,241,0.06)' : 'transparent',
          opacity: isLoading ? 0.5 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
        }}
      >
        {isLoading ? '읽는 중...' : isDragging ? '놓으세요' : '📎 자료 첨부'}
      </div>
      <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFile} />
    </>
  )
}

function KnowledgeInput({
  value,
  onChange,
  color,
  side,
}: {
  value: string
  onChange: (v: string) => void
  color: string
  side: 'red' | 'blue'
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const processFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      alert('PDF, DOCX, TXT 파일만 첨부할 수 있습니다.')
      return
    }
    setIsLoading(true)
    try {
      const text = await extractTextFromFile(file)
      onChange(value ? `${value}\n\n${text}` : text)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await processFile(file)
    e.target.value = ''
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) await processFile(file)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>지식 / 지침 (선택)</label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isLoading}
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border transition-colors hover:bg-white/5 disabled:opacity-50"
          style={{ borderColor: `${color}44`, color }}
        >
          {isLoading ? '읽는 중...' : '📎 파일 첨부'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      <div
        className="relative rounded-lg border transition-colors"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          borderColor: isDragging ? color : 'var(--border)',
          backgroundColor: isDragging ? `${color}08` : 'transparent',
        }}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={'논거로 쓸 지식, 데이터, 지침을 입력하거나\n파일을 드래그하거나 위 버튼으로 첨부하세요 (PDF, DOCX, TXT)'}
          className="w-full h-28 px-3 py-2 rounded-lg text-xs resize-y outline-none focus:border-indigo-500 transition-colors bg-transparent"
          style={{ color: 'var(--text-primary)', minHeight: 80 }}
          maxLength={2000}
        />
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg pointer-events-none">
            <span className="text-xs font-bold" style={{ color }}>파일을 놓으세요</span>
          </div>
        )}
      </div>
      <p className="text-[10px] text-right mt-0.5" style={{ color: value.length > 1800 ? 'var(--gold)' : 'var(--text-muted)' }}>
        {value.length}/2000
      </p>
    </div>
  )
}

const ALL_VOICES: TTSVoice[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']

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
  config: { persona?: string; tone?: DebaterTone; knowledge?: string; voice?: TTSVoice }
  onChange: (c: typeof config) => void
}) {
  const toneKey = config.tone ?? 'default'
  const suggestedVoice: TTSVoice = (TONE_VOICE_MAP[toneKey] ?? TONE_VOICE_MAP.default)[side]

  return (
    <div className="p-4 rounded-xl border space-y-3 flex flex-col" style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}>
      <p className="text-xs font-black uppercase tracking-widest shrink-0" style={{ color }}>
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

      {/* 목소리 선택 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>TTS 목소리 (선택)</label>
          {config.voice && config.voice !== suggestedVoice && (
            <button
              type="button"
              onClick={() => onChange({ ...config, voice: undefined })}
              className="text-[10px] px-1.5 py-0.5 rounded border transition-colors hover:bg-white/5"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              기본으로
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1">
          {ALL_VOICES.map((v) => {
            const isSelected = (config.voice ?? suggestedVoice) === v
            const isSuggested = v === suggestedVoice && !config.voice
            return (
              <button
                key={v}
                type="button"
                onClick={() => onChange({ ...config, voice: v === suggestedVoice ? undefined : v })}
                className="px-2 py-1.5 rounded-lg border text-left text-[10px] transition-all"
                style={{
                  backgroundColor: isSelected ? `${color}20` : 'var(--bg-card)',
                  borderColor: isSelected ? color : 'var(--border)',
                  color: isSelected ? color : 'var(--text-secondary)',
                }}
              >
                <span className="font-bold capitalize">{v}</span>
                {isSuggested && <span className="ml-1 opacity-60">(추천)</span>}
                <br />
                <span className="opacity-60">{VOICE_LABELS[v].split(' — ')[1]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 지식 / 지침 */}
      <KnowledgeInput
        value={config.knowledge ?? ''}
        onChange={(v) => onChange({ ...config, knowledge: v || undefined })}
        color={color}
        side={side}
      />
    </div>
  )
}

export default function NewDebatePage() {
  const router = useRouter()
  const { language, t } = useLanguage()
  const [topic, setTopic] = useState('')
  const [rounds, setRounds] = useState(7)
  const [isValidating, setIsValidating] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [showUsageLimit, setShowUsageLimit] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidateResult | null>(null)
  const [error, setError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [debateConfig, setDebateConfig] = useState<DebateConfig>({})
  const [selectedModel, setSelectedModel] = useState<DebateModel>('claude-sonnet-4-6')

  const [resumeDebate, setResumeDebate] = useState<{ id: string; topic: string } | null>(null)
  const [topicDragging, setTopicDragging] = useState(false)

  useEffect(() => {
    fetch('/api/debate/resume-check')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.debate) setResumeDebate(data.debate) })
      .catch(() => {})
  }, [])

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
          debate_config: (debateConfig.red || debateConfig.blue)
            ? { ...debateConfig, model: selectedModel }
            : { model: selectedModel },
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
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* 미완료 토론 재개 배너 */}
      {resumeDebate && (
        <div className="mb-6 p-4 rounded-xl border flex items-start gap-3" style={{ backgroundColor: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.3)' }}>
          <span className="text-lg shrink-0">⚡</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>이전 토론이 있습니다</p>
            <p className="text-xs truncate mb-3" style={{ color: 'var(--text-muted)' }}>"{resumeDebate.topic}"</p>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/debate/${resumeDebate.id}`)}
                className="flex-1 h-9 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                {t('계속 진행', 'Continue')}
              </button>
              <button
                onClick={() => setResumeDebate(null)}
                className="flex-1 h-9 rounded-lg text-xs border transition-colors hover:bg-white/5"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                {t('새로 시작', 'Start new')}
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div
            className="relative rounded-xl border transition-colors"
            onDragOver={(e) => { e.preventDefault(); setTopicDragging(true) }}
            onDragLeave={() => setTopicDragging(false)}
            onDrop={async (e) => {
              e.preventDefault()
              setTopicDragging(false)
              const file = e.dataTransfer.files?.[0]
              if (!file) return
              const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
              if (!ALLOWED_EXTENSIONS.includes(ext)) { alert('PDF, DOCX, TXT 파일만 첨부할 수 있습니다.'); return }
              const text = await extractTextFromFile(file)
              setTopic((prev) => prev ? `${prev}\n\n${text}` : text)
            }}
            style={{
              borderColor: topicDragging ? 'var(--accent)' : 'var(--border)',
              backgroundColor: topicDragging ? 'rgba(99,102,241,0.05)' : 'var(--bg-card)',
            }}
          >
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t(
                '예: "AI가 인간의 일자리를 대체하는 것은 사회 발전이다"\n"주 4일제 근무는 생산성을 높인다"\n"SNS는 민주주의에 해롭다"\n\n자료 파일(PDF, DOCX, TXT)을 여기에 드래그해도 됩니다',
                'e.g. "AI replacing human jobs is social progress"\n"A 4-day work week improves productivity"\n"Social media is harmful to democracy"\n\nYou can also drag & drop a file (PDF, DOCX, TXT) here'
              )}
              className="w-full h-32 p-4 rounded-xl text-sm resize-y outline-none transition-colors bg-transparent"
              style={{ color: 'var(--text-primary)', minHeight: 96 }}
            />
            {topicDragging && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl pointer-events-none">
                <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>파일을 놓으세요 📄</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-start mt-1 gap-2">
            {error && <p className="text-xs text-red-500 flex-1">{error}</p>}
            <div className="ml-auto shrink-0 flex items-center gap-2">
              {/* 의제 파일 첨부 */}
              <TopicFileAttach onExtract={(text) => setTopic((prev) => prev ? `${prev}\n\n${text}` : text)} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{topic.length}자</p>
            </div>
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
            {t('고급 설정 (AI 모델 / 페르소나 / 어조 / 지식)', 'Advanced (Model / Persona / Tone / Knowledge)')}
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-4">

              {/* AI 모델 선택 */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest mb-2.5 block" style={{ color: 'var(--text-muted)' }}>
                  AI 모델
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {MODEL_OPTIONS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      disabled={!m.available}
                      onClick={() => m.available && setSelectedModel(m.value)}
                      className="relative flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl border text-left transition-all disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: selectedModel === m.value ? 'rgba(99,102,241,0.12)' : 'var(--bg-card)',
                        borderColor: selectedModel === m.value ? 'rgba(99,102,241,0.6)' : 'var(--border)',
                        opacity: m.available ? 1 : 0.5,
                      }}
                    >
                      <span className="text-xs font-bold" style={{ color: selectedModel === m.value ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {m.label}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.badge}</span>
                      {!m.available && (
                        <span className="absolute top-1.5 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: 'var(--text-muted)' }}>
                          준비 중
                        </span>
                      )}
                      {m.available && selectedModel === m.value && (
                        <span className="absolute top-1.5 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(99,102,241,0.2)', color: 'var(--accent)' }}>
                          선택됨
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* RED / BLUE 좌우 패널 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DebaterCustomPanel
                  side="red"
                  color="#ef4444"
                  label="RED — 찬성 측"
                  config={debateConfig.red ?? {}}
                  onChange={(c) => setDebateConfig((prev) => ({ ...prev, red: c }))}
                />
                <DebaterCustomPanel
                  side="blue"
                  color="#6366f1"
                  label="BLUE — 반대 측"
                  config={debateConfig.blue ?? {}}
                  onChange={(c) => setDebateConfig((prev) => ({ ...prev, blue: c }))}
                />
              </div>
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
