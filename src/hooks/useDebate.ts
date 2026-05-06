'use client'

import { useState, useCallback, useRef } from 'react'
import type { Debate, Message, Report, Language } from '@/types'

interface LocalMessage {
  id: string
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
  isRunning: boolean
  isComplete: boolean
  reportContent: string | null
  debateId: string | null
  runRound: (debate: Debate, language: Language) => Promise<void>
  initDebate: (debate: Debate) => void
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

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const lines = decoder.decode(value).split('\n')
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = JSON.parse(line.slice(6))
      if (data.text) onChunk(data.text)
      if (data.done) tokenCount = data.tokenCount ?? 0
    }
  }

  return { done: true, tokenCount }
}

export function useDebate(): UseDebateReturn {
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [currentRound, setCurrentRound] = useState(1)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [reportContent, setReportContent] = useState<string | null>(null)
  const [debateId, setDebateId] = useState<string | null>(null)
  const messagesRef = useRef<LocalMessage[]>([])

  const addStreamingMessage = useCallback((id: string, speaker: 'red' | 'blue' | 'host', roundNumber: number, isFinalRound: boolean) => {
    const msg: LocalMessage = {
      id,
      speaker,
      content: '',
      roundNumber,
      isFinalRound,
      hasFactError: false,
      factErrorNote: null,
      tokenCount: null,
      isStreaming: true,
    }
    setMessages((prev) => {
      const next = [...prev, msg]
      messagesRef.current = next
      return next
    })
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
        const err = errors.find((e) => e.speaker === m.speaker && m.content.includes(e.claim.slice(0, 20)))
        if (!err) return m
        return { ...m, hasFactError: true, factErrorNote: err.note }
      })
      messagesRef.current = next
      return next
    })
  }, [])

  const saveMessageToDB = useCallback(async (debateId: string, msg: LocalMessage) => {
    await fetch('/api/debate/save-message', {
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
  }, [])

  const initDebate = useCallback((debate: Debate) => {
    setDebateId(debate.id)
    setMessages([])
    messagesRef.current = []
    setCurrentRound(1)
    setIsComplete(false)
    setReportContent(null)
  }, [])

  const runRound = useCallback(async (debate: Debate, language: Language) => {
    if (isRunning) return
    setIsRunning(true)

    const round = currentRound
    const isFinalRound = round === debate.rounds

    // 히스토리 빌드 (DB 형식으로)
    const history = messagesRef.current.map((m) => ({
      speaker: m.speaker,
      content: m.content,
    }))

    const baseBody = {
      topic: debate.topic,
      currentRound: round,
      totalRounds: debate.rounds,
      language,
      history,
    }

    try {
      // 최종 라운드 사회자 개입 고지
      if (isFinalRound) {
        const hostId = `host-final-${round}`
        const hostMsg: LocalMessage = {
          id: hostId,
          speaker: 'host',
          content: language === 'ko'
            ? '마지막 라운드입니다. 각자 최종 입장을 정리해주세요.'
            : 'This is the final round. Please summarize your final positions.',
          roundNumber: round,
          isFinalRound: true,
          hasFactError: false,
          factErrorNote: null,
          tokenCount: null,
        }
        setMessages((prev) => {
          const next = [...prev, hostMsg]
          messagesRef.current = next
          return next
        })
      }

      // RED 스트리밍
      const redId = `red-${round}`
      addStreamingMessage(redId, 'red', round, isFinalRound)
      const { tokenCount: redTokens } = await streamAI('/api/debate/red', baseBody, (text) => {
        updateStreamingMessage(redId, text)
      })
      finalizeMessage(redId, redTokens)

      // BLUE 스트리밍
      const blueId = `blue-${round}`
      addStreamingMessage(blueId, 'blue', round, isFinalRound)
      const { tokenCount: blueTokens } = await streamAI('/api/debate/blue', {
        ...baseBody,
        history: [...history, { speaker: 'red', content: messagesRef.current.find((m) => m.id === redId)?.content ?? '' }],
      }, (text) => {
        updateStreamingMessage(blueId, text)
      })
      finalizeMessage(blueId, blueTokens)

      const redContent = messagesRef.current.find((m) => m.id === redId)?.content ?? ''
      const blueContent = messagesRef.current.find((m) => m.id === blueId)?.content ?? ''

      // 팩트체크 비동기 (블로킹 없음)
      fetch('/api/debate/factcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseBody, redContent, blueContent }),
      })
        .then((r) => r.json())
        .then((result) => {
          if (result.errors?.length > 0) {
            applyFactErrors(result.errors, round)
          }
        })
        .catch(() => {})

      // DB 저장
      if (debate.id) {
        const redMsg = messagesRef.current.find((m) => m.id === redId)
        const blueMsg = messagesRef.current.find((m) => m.id === blueId)
        if (redMsg) await saveMessageToDB(debate.id, redMsg)
        if (blueMsg) await saveMessageToDB(debate.id, blueMsg)
      }

      // 조기 종료 감지
      const earlyEnd = redContent.includes('승복합니다:') || blueContent.includes('승복합니다:')

      if (isFinalRound || earlyEnd) {
        // 리포트 생성
        const allMessages = messagesRef.current.filter((m) => m.speaker !== 'host' || !m.isStreaming)
        const reportResp = await fetch('/api/debate/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: debate.topic,
            messages: allMessages.map((m) => ({
              speaker: m.speaker,
              content: m.content,
              has_fact_error: m.hasFactError,
              fact_error_note: m.factErrorNote,
            })),
            language,
          }),
        })
        const { content } = await reportResp.json()
        setReportContent(content)

        // DB 완료 처리
        if (debate.id) {
          await fetch('/api/debate/save-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'complete',
              debate_id: debate.id,
              status: earlyEnd ? 'early_end' : 'completed',
            }),
          })
        }

        setIsComplete(true)
      } else {
        setCurrentRound((prev) => prev + 1)
      }
    } finally {
      setIsRunning(false)
    }
  }, [currentRound, isRunning, addStreamingMessage, updateStreamingMessage, finalizeMessage, applyFactErrors, saveMessageToDB])

  return { messages, currentRound, isRunning, isComplete, reportContent, debateId, runRound, initDebate }
}
