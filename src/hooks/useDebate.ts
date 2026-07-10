'use client'

import { useState, useCallback, useRef } from 'react'
import type { Debate, Language, Message, ReportData } from '@/types'

export interface FactCheck {
  speaker: string
  claim: string
  verdict: string
  note: string
  source_label?: string | null
  source_url?: string | null
}

interface LocalMessage {
  id: string
  dbId?: string
  speaker: 'red' | 'blue' | 'host'
  content: string
  roundNumber: number
  isFinalRound: boolean
  hasFactError: boolean
  factErrorNote: string | null
  tokenCount: number | null
  isStreaming?: boolean
  factChecks?: FactCheck[]
}

interface UseDebateReturn {
  messages: LocalMessage[]
  currentRound: number
  totalRounds: number
  isRunning: boolean
  isComplete: boolean
  roundErrorCount: number
  reportContent: ReportData | null
  reportFailed: boolean
  debateId: string | null
  pausedAfterRed: boolean
  runRound: (debate: Debate, language: Language, overrideTotalRounds?: number) => Promise<void>
  resumeBlue: () => void
  initDebate: (debate: Debate, preloadedMessages?: Message[]) => void
  adjustTotalRounds: (n: number) => void
  resetRoundError: () => void
  sendHostIntervention: (debate: Debate, language: Language, message: string, target?: 'both' | 'red' | 'blue') => void
}

async function streamAI(
  endpoint: string,
  body: object,
  onChunk: (text: string) => void
): Promise<{ done: boolean; tokenCount: number }> {
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!resp.ok) throw new Error(`${endpoint} failed`)

  const reader = resp.body!.getReader()
  const decoder = new TextDecoder()
  let tokenCount = 0
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const data = JSON.parse(line.slice(6))
        if (data.text) onChunk(data.text)
        if (data.done) tokenCount = data.tokenCount ?? 0
      } catch {
        // skip malformed chunk
      }
    }
  }

  return { done: true, tokenCount }
}

export function useDebate(): UseDebateReturn {
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds, setTotalRounds] = useState(7)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [roundErrorCount, setRoundErrorCount] = useState(0)
  const [reportContent, setReportContent] = useState<ReportData | null>(null)
  const [reportFailed, setReportFailed] = useState(false)
  const [debateId, setDebateId] = useState<string | null>(null)
  const [pausedAfterRed, setPausedAfterRed] = useState(false)
  const messagesRef = useRef<LocalMessage[]>([])
  const currentRoundRef = useRef(1)
  const totalRoundsRef = useRef(7)
  const isRunningRef = useRef(false)
  const roundErrorCountRef = useRef(0)
  const resumeBlueRef = useRef<(() => void) | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runRoundRef = useRef<any>(null)

  const addStreamingMessage = useCallback((id: string, speaker: 'red' | 'blue' | 'host', roundNumber: number, isFinalRound: boolean) => {
    const msg: LocalMessage = { id, speaker, content: '', roundNumber, isFinalRound, hasFactError: false, factErrorNote: null, tokenCount: null, isStreaming: true }
    setMessages((prev) => { const next = [...prev, msg]; messagesRef.current = next; return next })
  }, [])

  const updateStreamingMessage = useCallback((id: string, text: string) => {
    setMessages((prev) => {
      const next = prev.map((m) => m.id === id ? { ...m, content: m.content + text } : m)
      messagesRef.current = next
      return next
    })
  }, [])

  const finalizeMessage = useCallback((id: string, tokenCount: number) => {
    setMessages((prev) => {
      const next = prev.map((m) => m.id === id ? { ...m, isStreaming: false, tokenCount } : m)
      messagesRef.current = next
      return next
    })
  }, [])

  const applyFactErrors = useCallback((errors: Array<{ speaker: string; claim: string; note: string }>, roundNumber: number) => {
    setMessages((prev) => {
      const next = prev.map((m) => {
        if (m.roundNumber !== roundNumber) return m
        const err = errors.find((e) => {
          if (e.speaker !== m.speaker) return false
          // 클레임에서 핵심 단어(4자 이상) 추출해 발언에 하나라도 포함되면 매칭
          const words = e.claim.trim().replace(/^["']|["']$/g, '').split(/\s+/).filter((w) => w.length >= 4)
          if (words.length === 0) return m.content.includes(e.claim.trim().slice(0, 20))
          const matched = words.filter((w) => m.content.includes(w))
          return matched.length >= Math.ceil(words.length * 0.4)
        })
        if (!err) return m
        return { ...m, hasFactError: true, factErrorNote: err.note }
      })
      messagesRef.current = next
      return next
    })
  }, [])

  const saveMessageToDB = useCallback(async (debateId: string, msg: LocalMessage): Promise<string | null> => {
    try {
      const resp = await fetch('/api/debate/save-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_message',
          debate_id: debateId,
          round_number: msg.roundNumber,
          speaker: msg.speaker,
          content: msg.content,
          has_fact_error: msg.hasFactError,
          fact_error_note: msg.factErrorNote,
          is_final_round: msg.isFinalRound,
          token_count: msg.tokenCount,
        }),
      })
      const { message } = await resp.json()
      if (message?.id) {
        setMessages((prev) => {
          const next = prev.map((m) => m.id === msg.id ? { ...m, dbId: message.id } : m)
          messagesRef.current = next
          return next
        })
        return message.id as string
      }
    } catch {}
    return null
  }, [])

  const initDebate = useCallback((debate: Debate, preloadedMessages?: Message[]) => {
    setDebateId(debate.id)

    const loaded: LocalMessage[] = (preloadedMessages ?? []).map((m) => ({
      id: m.id,
      dbId: m.id,
      speaker: m.speaker as 'red' | 'blue' | 'host',
      content: m.content,
      roundNumber: m.round_number,
      isFinalRound: m.is_final_round,
      hasFactError: m.has_fact_error,
      factErrorNote: m.fact_error_note,
      tokenCount: m.token_count,
      isStreaming: false,
    }))

    setMessages(loaded)
    messagesRef.current = loaded

    // current round = max round in loaded messages + 1 (or 1 if none)
    const maxRound = loaded.reduce((max, m) => Math.max(max, m.roundNumber), 0)
    const isFinished = debate.status === 'completed' || debate.status === 'early_end'
    const resumeRound = isFinished ? maxRound : maxRound + 1
    const startRound = Math.max(1, resumeRound)

    setCurrentRound(startRound)
    currentRoundRef.current = startRound
    setTotalRounds(debate.rounds)
    totalRoundsRef.current = debate.rounds
    isRunningRef.current = false
    isCompleteRef.current = isFinished
    roundErrorCountRef.current = 0
    setIsRunning(false)
    setIsComplete(isFinished)
    setRoundErrorCount(0)
    setReportContent(null)
  }, [])

  const resetRoundError = useCallback(() => {
    roundErrorCountRef.current = 0
    setRoundErrorCount(0)
  }, [])

  const adjustTotalRounds = useCallback((n: number) => {
    // 현재 라운드보다 최소 1 이상 많아야 의미 있음 (현재 라운드를 마지막으로 만들지 않도록)
    const min = currentRoundRef.current + 1
    const clamped = Math.max(min, Math.min(20, n))
    setTotalRounds(clamped)
    totalRoundsRef.current = clamped
  }, [])

  const sendHostIntervention = useCallback((debate: Debate, language: Language, message: string, target: 'both' | 'red' | 'blue' = 'both') => {
    const hostId = `host-intervention-${Date.now()}`
    const round = currentRoundRef.current
    const targetPrefix = target === 'red'
      ? (language === 'ko' ? '[RED에게] ' : '[To RED] ')
      : target === 'blue'
        ? (language === 'ko' ? '[BLUE에게] ' : '[To BLUE] ')
        : ''
    const fullMessage = targetPrefix + message
    const hostMsg: LocalMessage = {
      id: hostId, speaker: 'host', content: fullMessage,
      roundNumber: round, isFinalRound: false,
      hasFactError: false, factErrorNote: null, tokenCount: null,
    }
    setMessages((prev) => { const next = [...prev, hostMsg]; messagesRef.current = next; return next })
    if (debate.id) {
      fetch('/api/debate/save-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_message',
          debate_id: debate.id,
          round_number: round,
          speaker: 'host',
          content: fullMessage,
          has_fact_error: false,
          fact_error_note: null,
          is_final_round: false,
          token_count: null,
        }),
      }).catch(() => {})
    }
  }, [])

  const resumeBlue = useCallback(() => {
    if (resumeBlueRef.current) {
      resumeBlueRef.current()
      resumeBlueRef.current = null
    }
  }, [])

  const isCompleteRef = useRef(false)

  const runRound = useCallback(async (debate: Debate, language: Language, overrideTotalRounds?: number) => {
    if (isRunningRef.current) return
    if (isCompleteRef.current) return
    isRunningRef.current = true
    setIsRunning(true)

    const round = currentRoundRef.current
    const effectiveTotalRounds = overrideTotalRounds ?? totalRoundsRef.current
    const isFinalRound = round === effectiveTotalRounds

    const history = messagesRef.current.map((m) => ({ speaker: m.speaker, content: m.content }))

    const cfg = debate.debate_config
    const sharedModel = cfg?.model ?? 'claude-haiku-4-5-20251001'
    const baseBody = {
      debate_id: debate.id,
      topic: debate.topic,
      currentRound: round,
      totalRounds: effectiveTotalRounds,
      language,
      history,
      red_config: cfg?.red,
      blue_config: cfg?.blue,
      model: sharedModel,
      red_model: cfg?.red_model ?? sharedModel,
      blue_model: cfg?.blue_model ?? sharedModel,
    }

    try {
      if (isFinalRound) {
        const hostId = `host-final-${round}`
        const hostMsg: LocalMessage = {
          id: hostId, speaker: 'host',
          content: language === 'ko' ? '마지막 라운드입니다. 각자 최종 입장을 정리해주세요.' : 'This is the final round. Please summarize your final positions.',
          roundNumber: round, isFinalRound: true, hasFactError: false, factErrorNote: null, tokenCount: null,
        }
        setMessages((prev) => { const next = [...prev, hostMsg]; messagesRef.current = next; return next })
      }

      // 성공적으로 스트리밍 시작 시 에러 카운트 리셋
      roundErrorCountRef.current = 0
      setRoundErrorCount(0)

      const redId = `red-${round}`
      addStreamingMessage(redId, 'red', round, isFinalRound)
      const { tokenCount: redTokens } = await streamAI('/api/debate/red', { ...baseBody, model: baseBody.red_model }, (text) => updateStreamingMessage(redId, text))
      finalizeMessage(redId, redTokens)

      // RED 발언 완료 후 사용자가 읽을 시간을 주기 위해 멈춤
      isRunningRef.current = false
      setIsRunning(false)
      setPausedAfterRed(true)

      // 사용자가 resumeBlue()를 호출할 때까지 대기
      await new Promise<void>((resolve) => {
        resumeBlueRef.current = resolve
      })

      setPausedAfterRed(false)
      isRunningRef.current = true
      setIsRunning(true)

      const blueId = `blue-${round}`
      addStreamingMessage(blueId, 'blue', round, isFinalRound)
      const { tokenCount: blueTokens } = await streamAI('/api/debate/blue', {
        ...baseBody,
        model: baseBody.blue_model,
        history: [...history, { speaker: 'red', content: messagesRef.current.find((m) => m.id === redId)?.content ?? '' }],
      }, (text) => updateStreamingMessage(blueId, text))
      finalizeMessage(blueId, blueTokens)

      const redContent = messagesRef.current.find((m) => m.id === redId)?.content ?? ''
      const blueContent = messagesRef.current.find((m) => m.id === blueId)?.content ?? ''

      // 팩트체크 비동기 — 완료 후 사회자 버블로 표시
      const currentDebateId = debate.id
      fetch('/api/debate/factcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseBody, redContent, blueContent }),
      }).then((r) => r.json()).then((result) => {
        const checks: FactCheck[] = result.checks ?? []
        if (checks.length > 0) {
          // 사회자 팩트체크 버블 삽입
          const fcId = `host-factcheck-${round}`
          const fcMsg: LocalMessage = {
            id: fcId, speaker: 'host',
            content: language === 'ko' ? `[라운드 ${round} 팩트체크]` : `[Round ${round} Fact Check]`,
            roundNumber: round, isFinalRound: false,
            hasFactError: false, factErrorNote: null, tokenCount: null,
            factChecks: checks,
          }
          setMessages((prev) => { const next = [...prev, fcMsg]; messagesRef.current = next; return next })

          // 기존 메시지에 팩트 오류 마킹 (버블 내 ⚠️ 표시용)
          applyFactErrors(checks.map((c) => ({ speaker: c.speaker, claim: c.claim, note: c.note })), round)
        }
      }).catch(() => {})

      if (debate.id) {
        const redMsg = messagesRef.current.find((m) => m.id === redId)
        const blueMsg = messagesRef.current.find((m) => m.id === blueId)
        if (redMsg) saveMessageToDB(debate.id, redMsg).catch(() => {})
        if (blueMsg) saveMessageToDB(debate.id, blueMsg).catch(() => {})
      }

      const earlyEnd = redContent.includes('승복합니다:') || blueContent.includes('승복합니다:')
        || redContent.includes('I concede:') || blueContent.includes('I concede:')

      if (isFinalRound || earlyEnd) {
        // report 실패 시에도 반드시 완료 처리 (무한 반복 방지)
        try {
          const allMessages = messagesRef.current.filter((m) => !m.isStreaming)
          const reportResp = await fetch('/api/debate/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              debate_id: debate.id,
              topic: debate.topic,
              messages: allMessages.map((m) => ({ speaker: m.speaker, content: m.content, has_fact_error: m.hasFactError, fact_error_note: m.factErrorNote })),
              language,
              model: debate.debate_config?.model,
            }),
          })
          if (reportResp.ok) {
            const { report } = await reportResp.json() as { report: ReportData }
            setReportContent(report)
            if (debate.id) {
              fetch('/api/debate/save-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'save_report', debate_id: debate.id,
                  red_summary: report.red_summary ?? null, blue_summary: report.blue_summary ?? null,
                  new_perspectives: report.new_perspectives ?? null, argument_gap: report.argument_gap ?? null,
                  next_question: report.next_question ?? null, fact_errors: report.fact_errors ?? null,
                  convergence_note: report.convergence_note ?? null, speech_summaries: report.speech_summaries ?? null,
                  key_points: report.key_points ?? null, fact_checks: report.fact_checks ?? null, verdict: report.verdict ?? null,
                }),
              }).catch(() => {})
            }
            if (debate.id && !debate.is_sample) {
              fetch('/api/debate/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ debate_id: debate.id, report }),
              }).catch(() => {})
            }
          }
        } catch {
          setReportFailed(true)
        } finally {
          if (debate.id) {
            fetch('/api/debate/save-message', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'complete', debate_id: debate.id, status: earlyEnd ? 'early_end' : 'completed' }),
            }).catch(() => {})
          }
          isCompleteRef.current = true
          setIsComplete(true)
        }
      } else {
        const next = round + 1
        setCurrentRound(next)
        currentRoundRef.current = next
        // 라운드 간 자동 이동 없음 — 사용자가 버튼으로 다음 라운드 시작
      }
    } catch {
      roundErrorCountRef.current += 1
      setRoundErrorCount(roundErrorCountRef.current)
    } finally {
      isRunningRef.current = false
      setIsRunning(false)
    }
  }, [addStreamingMessage, updateStreamingMessage, finalizeMessage, applyFactErrors, saveMessageToDB])

  runRoundRef.current = runRound

  return { messages, currentRound, totalRounds, isRunning, isComplete, roundErrorCount, reportContent, reportFailed, debateId, pausedAfterRed, runRound, resumeBlue, initDebate, adjustTotalRounds, resetRoundError, sendHostIntervention }
}
