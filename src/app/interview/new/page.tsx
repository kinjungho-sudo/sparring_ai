'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import type { DebateModel } from '@/types'

const ROUND_OPTIONS = [3, 5, 7]

const INTERVIEW_TYPES = [
  { value: 'personality', labelKo: '인성 면접', labelEn: 'Personality', descKo: '가치관·협업·성장 경험', descEn: 'Values, teamwork, growth' },
  { value: 'technical',   labelKo: '기술 면접', labelEn: 'Technical',   descKo: '직무 역량·기술 지식', descEn: 'Skills & technical knowledge' },
  { value: 'pressure',    labelKo: '압박 면접', labelEn: 'Pressure',    descKo: '논리 허점 파고드는 질문', descEn: 'Challenging, probing questions' },
] as const

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt']

async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'txt') return await file.text()
  const formData = new FormData()
  formData.append('file', file)
  const resp = await fetch('/api/extract-text', { method: 'POST', body: formData })
  if (resp.ok) {
    const { text } = await resp.json()
    return text as string
  }
  return `[첨부 파일: ${file.name}]\n(내용을 직접 붙여넣으면 더 정확하게 활용됩니다.)`
}

export default function InterviewNewPage() {
  const { t } = useLanguage()
  const router = useRouter()

  const [position, setPosition] = useState('')
  const [jd, setJd] = useState('')
  const [resume, setResume] = useState('')
  const [interviewType, setInterviewType] = useState<'personality' | 'technical' | 'pressure'>('personality')
  const [rounds, setRounds] = useState(5)
  const [model, setModel] = useState<DebateModel>('claude-haiku-4-5-20251001')
  const [isLoading, setIsLoading] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      alert(t('PDF, DOCX, TXT 파일만 지원합니다.', 'Only PDF, DOCX, and TXT files are supported.'))
      return
    }
    setFileLoading(true)
    try {
      const text = await extractTextFromFile(file)
      setResume(text)
    } finally {
      setFileLoading(false)
      e.target.value = ''
    }
  }

  const handleStart = async () => {
    if (!position.trim()) { setError(t('지원 포지션을 입력해주세요.', 'Please enter the position.')); return }
    if (!resume.trim()) { setError(t('자기소개서를 입력해주세요.', 'Please enter your resume/cover letter.')); return }
    setError('')
    setIsLoading(true)
    try {
      const resp = await fetch('/api/debate/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `${position} 모의 면접`,
          rounds,
          language: 'ko',
          mode: 'interview',
          debate_config: {
            model,
            interview: {
              position: position.trim(),
              jd: jd.trim() || undefined,
              resume: resume.trim(),
              interviewType,
            },
          },
        }),
      })
      if (!resp.ok) {
        const data = await resp.json()
        if (data.error === 'USAGE_LIMIT') {
          setError(t('오늘 사용량을 초과했습니다. Pro 플랜으로 업그레이드하세요.', 'Daily limit reached. Upgrade to Pro.'))
        } else {
          setError(data.error ?? t('오류가 발생했습니다.', 'An error occurred.'))
        }
        return
      }
      const { debate } = await resp.json()
      router.push(`/interview/${debate.id}`)
    } catch {
      setError(t('네트워크 오류가 발생했습니다.', 'Network error occurred.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
            🎙️ {t('모의 면접 설정', 'Mock Interview Setup')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('자기소개서와 지원 포지션을 입력하면 AI 면접관이 질문합니다.', 'Enter your resume and position — the AI interviewer will ask you questions.')}
          </p>
        </div>

        {/* 포지션 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
            {t('지원 포지션 *', 'Position *')}
          </label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder={t('예: 프론트엔드 개발자, 마케팅 매니저', 'e.g. Frontend Developer, Marketing Manager')}
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* 면접 유형 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
            {t('면접 유형', 'Interview Type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {INTERVIEW_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setInterviewType(type.value)}
                className="flex flex-col gap-0.5 p-3 rounded-xl border text-left transition-all"
                style={{
                  borderColor: interviewType === type.value ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: interviewType === type.value ? 'rgba(99,102,241,0.08)' : 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                }}
              >
                <span className="text-xs font-black">{t(type.labelKo, type.labelEn)}</span>
                <span className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>
                  {t(type.descKo, type.descEn)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 라운드 수 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
            {t('질문 수', 'Number of Questions')}
          </label>
          <div className="flex gap-2">
            {ROUND_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRounds(r)}
                className="flex-1 py-2 rounded-xl border text-sm font-bold transition-all"
                style={{
                  borderColor: rounds === r ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: rounds === r ? 'rgba(99,102,241,0.08)' : 'var(--bg-secondary)',
                  color: rounds === r ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* JD (선택) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
            {t('직무기술서 (선택)', 'Job Description (optional)')}
          </label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder={t('채용공고 또는 JD를 붙여넣으면 더 정확한 질문이 나옵니다.', 'Paste the job posting or JD for more targeted questions.')}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* 자기소개서 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
              {t('자기소개서 / 이력서 *', 'Resume / Cover Letter *')}
            </label>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs px-2.5 py-1 rounded-lg border transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
            >
              {fileLoading ? t('변환 중…', 'Extracting…') : t('파일 첨부', 'Attach file')}
            </button>
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileChange} />
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder={t(
              '자기소개서나 이력서를 붙여넣거나 파일로 첨부하세요. AI 면접관이 이 내용을 바탕으로 질문합니다.',
              'Paste your resume or cover letter, or attach a file. The AI interviewer will base questions on this.',
            )}
            rows={8}
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          onClick={handleStart}
          disabled={isLoading}
          className="w-full py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
        >
          {isLoading ? t('시작 중…', 'Starting…') : t('면접 시작', 'Start Interview')}
        </button>
      </div>
    </main>
  )
}
