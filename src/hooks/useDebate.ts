'use client'

import { useState, useCallback, useRef } from 'react'
import type { Debate, Language, ReportData } from '@/types'

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
}

interface UseDebateReturn {
  messages: LocalMessage[]
  currentRound: number
  totalRounds: number
  isRunning: boolean
  isComplete: boolean
  roundErrorCount: number
  reportContent: ReportData | null
  debateId: string | null
  runRound: (debate: Debate, language: Language, overrideTotalRounds?: number) => Promise<void>
  initDebate: (debate: Debate) => void
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
  const [debateId, setDebateId] = useState<string | null>(null)
  const messagesRef = useRef<LocalMessage[]>([])
  const currentRoundRef = useRef(1)
  const totalRoundsRef = useRef(7)
  const isRunningRef = useRef(false)
  const roundErrorCountRef = useRef(0)

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
        const err = errors.find((e) => e.speaker === m.speaker && m.content.includes(e.claim.trim().replace(/^["']|["']$/g, '').slice(0, 40)))
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

  const initDebate = useCallback((debate: Debate) => {
    setDebateId(debate.id)
    setMessages([])
    messagesRef.current = []
    setCurrentRound(1)
    currentRoundRef.current = 1
    setTotalRounds(debate.rounds)
    totalRoundsRef.current = debate.rounds
    isRunningRef.current = false
    roundErrorCountRef.current = 0
    setIsRunning(false)
    setIsComplete(false)
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

  const runRound = useCallback(async (debate: Debate, language: Language, overrideTotalRounds?: number) => {
    if (isRunningRef.current) return
    isRunningRef.current = true
    setIsRunning(true)

    const round = currentRoundRef.current
    const effectiveTotalRounds = overrideTotalRounds ?? totalRoundsRef.current
    const isFinalRound = round === effectiveTotalRounds

    const history = messagesRef.current.map((m) => ({ speaker: m.speaker, content: m.content }))

    const baseBody = {
      debate_id: debate.id,
      topic: debate.topic,
      currentRound: round,
      totalRounds: effectiveTotalRounds,
      language,
      history,
      red_config: debate.debate_config?.red,
      blue_config: debate.debate_config?.blue,
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
      const { tokenCount: redTokens } = await streamAI('/api/debate/red', baseBody, (text) => updateStreamingMessage(redId, text))
      finalizeMessage(redId, redTokens)

      const blueId = `blue-${round}`
      addStreamingMessage(blueId, 'blue', round, isFinalRound)
      const { tokenCount: blueTokens } = await streamAI('/api/debate/blue', {
        ...baseBody,
        history: [...history, { speaker: 'red', content: messagesRef.current.find((m) => m.id === redId)?.content ?? '' }],
      }, (text) => updateStreamingMessage(blueId, text))
      finalizeMessage(blueId, blueTokens)

      const redContent = messagesRef.current.find((m) => m.id === redId)?.content ?? ''
      const blueContent = messagesRef.current.find((m) => m.id === blueId)?.content ?? ''

      // 팩트체크 비동기
      const currentDebateId = debate.id
      fetch('/api/debate/factcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseBody, redContent, blueContent }),
      }).then((r) => r.json()).then((result) => {
        if (result.errors?.length > 0) {
          applyFactErrors(result.errors, round)
          if (currentDebateId) {
            const msgs = messagesRef.current
            for (const err of result.errors) {
              const matched = msgs.find((m) => m.roundNumber === round && m.speaker === err.speaker && m.content.includes(err.claim.trim().replace(/^["']|["']$/g, '').slice(0, 40)))
              if (matched?.dbId) {
                fetch('/api/debate/save-message', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'update_fact_error', debate_id: currentDebateId, message_id: matched.dbId, fact_error_note: err.note }),
                }).catch(() => {})
              }
            }
          }
        }
      }).catch(() => {})

      if (debate.id) {
        const redMsg = messagesRef.current.find((m) => m.id === redId)
        const blueMsg = messagesRef.current.find((m) => m.id === blueId)
        if (redMsg) await saveMessageToDB(debate.id, redMsg)
        if (blueMsg) await saveMessageToDB(debate.id, blueMsg)
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
          // report 실패해도 토론은 종료 처리
        } finally {
          if (debate.id) {
            fetch('/api/debate/save-message', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'complete', debate_id: debate.id, status: earlyEnd ? 'early_end' : 'completed' }),
            }).catch(() => {})
          }
          setIsComplete(true)
        }
      } else {
        const next = round + 1
        setCurrentRound(next)
        currentRoundRef.current = next
      }
    } catch {
      roundErrorCountRef.current += 1
      setRoundErrorCount(roundErrorCountRef.current)
    } finally {
      isRunningRef.current = false
      setIsRunning(false)
    }
  }, [addStreamingMessage, updateStreamingMessage, finalizeMessage, applyFactErrors, saveMessageToDB])

  return { messages, currentRound, totalRounds, isRunning, isComplete, roundErrorCount, reportContent, debateId, runRound, initDebate, adjustTotalRounds, resetRoundError, sendHostIntervention }
}
