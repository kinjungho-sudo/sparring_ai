'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Debate } from '@/types'
import type { InterviewFeedbackData } from '@/lib/ai/prompts'

interface RoundData {
  question: string
  answer: string
  feedback: InterviewFeedbackData | null
}

interface Props {
  debate: Debate
}

export default function InterviewArena({ debate }: Props) {
  const router = useRouter()
  const config = debate.debate_config?.interview
  const model = (debate.debate_config?.model ?? 'claude-haiku-4-5-20251001') as import('@/types').DebateModel
  const totalRounds = debate.rounds

  const [rounds, setRounds] = useState<RoundData[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [streamingQuestion, setStreamingQuestion] = useState('')
  const [isQuestionStreaming, setIsQuestionStreaming] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false)
  const [currentFeedback, setCurrentFeedback] = useState<InterviewFeedbackData | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [finalReport, setFinalReport] = useState<object | null>(null)
  const [isReportLoading, setIsReportLoading] = useState(false)
  const [followUpCount, setFollowUpCount] = useState(0)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasStarted = useRef(false)

  const currentRound = rounds.length + 1

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [])

  const buildHistory = useCallback(() => {
    const hist: Array<{ speaker: string; content: string }> = []
    for (const r of rounds) {
      hist.push({ speaker: 'interviewer', content: r.question })
      hist.push({ speaker: 'candidate', content: r.answer })
    }
    return hist
  }, [rounds])

  const streamNextQuestion = useCallback(async (roundNum: number, followUp: number, history: Array<{ speaker: string; content: string }>) => {
    if (!config) return
    setStreamingQuestion('')
    setCurrentQuestion('')
    setIsQuestionStreaming(true)
    setCurrentFeedback(null)
    setUserAnswer('')
    setError('')

    let accumulated = ''
    try {
      const resp = await fetch('/api/interview/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: config.position,
          jd: config.jd,
          resume: config.resume,
          interviewType: config.interviewType,
          currentRound: roundNum,
          totalRounds,
          language: debate.language,
          history,
          followUpCount: followUp,
          model,
        }),
      })
      if (!resp.ok) { setError('질문 생성 중 오류가 발생했습니다.'); return }

      const reader = resp.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue
          try {
            const data = JSON.parse(payload)
            if (data.text) {
              accumulated += data.text
              setStreamingQuestion(accumulated)
            }
          } catch { /* skip */ }
        }
      }
      setCurrentQuestion(accumulated)
    } finally {
      setIsQuestionStreaming(false)
      scrollToBottom()
    }
  }, [config, debate.language, model, totalRounds, scrollToBottom])

  // Start first question
  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    streamNextQuestion(1, 0, [])
  }, [streamNextQuestion])

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !config) return
    setIsFeedbackLoading(true)
    setError('')
    try {
      const resp = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: config.position,
          resume: config.resume,
          language: debate.language,
          currentRound,
          question: currentQuestion,
          candidateAnswer: userAnswer.trim(),
          model,
        }),
      })
      const data = await resp.json()
      if (!resp.ok || !data.feedback) {
        setError('피드백 생성 중 오류가 발생했습니다.')
        return
      }
      setCurrentFeedback(data.feedback)
      scrollToBottom()
    } finally {
      setIsFeedbackLoading(false)
    }
  }

  const handleNextQuestion = useCallback(async () => {
    if (!currentFeedback) return
    const newRound: RoundData = { question: currentQuestion, answer: userAnswer.trim(), feedback: currentFeedback }
    const updatedRounds = [...rounds, newRound]
    setRounds(updatedRounds)

    if (updatedRounds.length >= totalRounds) {
      // Generate final report
      setIsComplete(true)
      setIsReportLoading(true)
      try {
        const resp = await fetch('/api/interview/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            position: config?.position,
            resume: config?.resume,
            rounds: updatedRounds,
            language: debate.language,
            model,
          }),
        })
        const data = await resp.json()
        if (data.report) setFinalReport(data.report)
      } finally {
        setIsReportLoading(false)
      }
      return
    }

    // Determine follow-up vs new topic
    const newFollowUp = followUpCount < 2 ? followUpCount + 1 : 0
    setFollowUpCount(newFollowUp)

    const history = buildHistory()
    history.push({ speaker: 'interviewer', content: currentQuestion })
    history.push({ speaker: 'candidate', content: userAnswer.trim() })

    await streamNextQuestion(updatedRounds.length + 1, newFollowUp, history)
  }, [currentFeedback, currentQuestion, userAnswer, rounds, totalRounds, followUpCount, config, debate.language, model, buildHistory, streamNextQuestion])

  if (!config) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>면접 설정이 없습니다.</div>

  const questionDisplay = isQuestionStreaming ? streamingQuestion : currentQuestion

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 h-14 border-b"
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>🎙️ 모의 면접</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: 'var(--accent)' }}>
            {config.position}
          </span>
        </div>
        <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
          {Math.min(rounds.length + 1, totalRounds)} / {totalRounds}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl w-full mx-auto flex flex-col gap-6">
        {/* Past rounds */}
        {rounds.map((r, i) => (
          <div key={i} className="flex flex-col gap-3">
            <InterviewerBubble text={r.question} roundNum={i + 1} />
            <CandidateBubble text={r.answer} />
            {r.feedback && <FeedbackCard feedback={r.feedback} />}
          </div>
        ))}

        {/* Current question */}
        {!isComplete && questionDisplay && (
          <InterviewerBubble text={questionDisplay} roundNum={currentRound} isStreaming={isQuestionStreaming} />
        )}

        {/* Answer input */}
        {!isComplete && !isQuestionStreaming && currentQuestion && !currentFeedback && (
          <div className="flex flex-col gap-3">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="답변을 입력하세요…"
              rows={5}
              className="w-full px-4 py-3 rounded-2xl border text-sm outline-none resize-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim() || isFeedbackLoading}
              className="self-end px-5 py-2 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              {isFeedbackLoading ? '평가 중…' : '답변 제출'}
            </button>
          </div>
        )}

        {/* Current feedback + next button */}
        {!isComplete && currentFeedback && (
          <div className="flex flex-col gap-3">
            <CandidateBubble text={userAnswer.trim()} />
            <FeedbackCard feedback={currentFeedback} />
            <button
              onClick={handleNextQuestion}
              className="self-center px-6 py-2.5 rounded-xl font-black text-sm transition-all"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              {rounds.length + 1 >= totalRounds ? '최종 결과 보기 →' : '다음 질문 →'}
            </button>
          </div>
        )}

        {/* Final report */}
        {isComplete && (
          <FinalReport report={finalReport} isLoading={isReportLoading} position={config.position} />
        )}

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function InterviewerBubble({ text, roundNum, isStreaming }: { text: string; roundNum: number; isStreaming?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>면접관 Q{roundNum}</span>
      <div
        className="self-start max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
      >
        {text}
        {isStreaming && <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse align-middle" />}
      </div>
    </div>
  )
}

function CandidateBubble({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-1 items-end">
      <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>나의 답변</span>
      <div
        className="self-end max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
        style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: 'var(--text-primary)' }}
      >
        {text}
      </div>
    </div>
  )
}

function FeedbackCard({ feedback }: { feedback: InterviewFeedbackData }) {
  const [showModel, setShowModel] = useState(false)
  const scoreColor = feedback.score >= 4 ? '#22c55e' : feedback.score >= 3 ? '#f59e0b' : '#ef4444'

  return (
    <div
      className="rounded-2xl border p-4 flex flex-col gap-3 text-sm"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-black" style={{ color: 'var(--text-muted)' }}>사회자 피드백</span>
        <span className="font-black text-base" style={{ color: scoreColor }}>{feedback.score}/5</span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>질문 의도</p>
        <p style={{ color: 'var(--text-secondary)' }}>{feedback.question_intent}</p>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold text-green-400">잘한 점</p>
        <p style={{ color: 'var(--text-secondary)' }}>{feedback.strengths}</p>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold text-amber-400">보완할 점</p>
        <p style={{ color: 'var(--text-secondary)' }}>{feedback.improvements}</p>
      </div>

      <button
        onClick={() => setShowModel(!showModel)}
        className="self-start text-xs font-bold px-3 py-1 rounded-lg border transition-colors hover:bg-white/5"
        style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
      >
        {showModel ? '모범 답변 숨기기' : '모범 답변 보기'}
      </button>
      {showModel && (
        <div
          className="rounded-xl p-3 text-xs leading-relaxed"
          style={{ backgroundColor: 'rgba(99,102,241,0.08)', color: 'var(--text-secondary)' }}
        >
          {feedback.model_answer}
        </div>
      )}
    </div>
  )
}

interface ReportData {
  overall_score: number
  summary: string
  strengths: string[]
  improvements: string[]
  round_scores: Array<{ round: number; score: number; summary: string }>
  next_questions: string[]
  final_advice: string
}

function FinalReport({ report, isLoading, position }: { report: object | null; isLoading: boolean; position: string }) {
  const router = useRouter()
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <div className="w-6 h-6 rounded-full border-2 border-current border-t-transparent animate-spin" style={{ color: 'var(--accent)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>최종 리포트 생성 중…</p>
      </div>
    )
  }
  if (!report) return null
  const r = report as ReportData
  const scoreColor = r.overall_score >= 4 ? '#22c55e' : r.overall_score >= 3 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center py-4">
        <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-muted)' }}>면접 종료 — 최종 결과</p>
        <p className="text-5xl font-black mb-1" style={{ color: scoreColor }}>{r.overall_score.toFixed(1)}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>/ 5.0</p>
      </div>

      <div
        className="rounded-2xl border p-4 flex flex-col gap-4 text-sm"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <p style={{ color: 'var(--text-secondary)' }}>{r.summary}</p>

        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold text-green-400">강점</p>
          <ul className="list-disc list-inside flex flex-col gap-0.5" style={{ color: 'var(--text-secondary)' }}>
            {r.strengths?.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold text-amber-400">보완 사항</p>
          <ul className="list-disc list-inside flex flex-col gap-0.5" style={{ color: 'var(--text-secondary)' }}>
            {r.improvements?.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>

        {r.round_scores && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>라운드별 점수</p>
            <div className="flex flex-col gap-1.5">
              {r.round_scores.map((rs) => (
                <div key={rs.round} className="flex items-start gap-2">
                  <span className="text-xs font-bold shrink-0 w-6 mt-0.5" style={{ color: 'var(--accent)' }}>Q{rs.round}</span>
                  <div className="flex-1">
                    <span className="text-xs font-bold" style={{ color: rs.score >= 4 ? '#22c55e' : rs.score >= 3 ? '#f59e0b' : '#ef4444' }}>{rs.score}/5 </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{rs.summary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {r.next_questions && r.next_questions.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>추가 예상 질문</p>
            <ul className="flex flex-col gap-1" style={{ color: 'var(--text-secondary)' }}>
              {r.next_questions.map((q, i) => <li key={i} className="text-xs">• {q}</li>)}
            </ul>
          </div>
        )}

        <div
          className="rounded-xl p-3 text-xs leading-relaxed"
          style={{ backgroundColor: 'rgba(99,102,241,0.08)', color: 'var(--text-secondary)' }}
        >
          💡 {r.final_advice}
        </div>
      </div>

      <div className="flex gap-3 justify-center mt-2">
        <button
          onClick={() => router.push('/interview/new')}
          className="px-5 py-2.5 rounded-xl border font-bold text-sm transition-colors hover:bg-white/5"
          style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
        >
          다시 도전
        </button>
        <button
          onClick={() => router.push('/new')}
          className="px-5 py-2.5 rounded-xl font-bold text-sm"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
        >
          메인으로
        </button>
      </div>
    </div>
  )
}
