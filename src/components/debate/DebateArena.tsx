'use client'

import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import RoundIndicator from './RoundIndicator'
import DebateReport from './DebateReport'
import Button from '@/components/ui/Button'
import type { Debate } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { useDebate } from '@/hooks/useDebate'

interface DebateArenaProps {
  debate: Debate
  onDebateEnd?: () => void
}

export default function DebateArena({ debate, onDebateEnd }: DebateArenaProps) {
  const { language, t } = useLanguage()
  const { messages, currentRound, isRunning, isComplete, reportContent, initDebate, runRound } = useDebate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      initDebate(debate)
    }
  }, [debate, initDebate])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleNextRound = () => {
    runRound(debate, language)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <RoundIndicator
        currentRound={currentRound}
        totalRounds={debate.rounds}
        isRunning={isRunning}
      />

      {/* 의제 표시 */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>TOPIC</p>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{debate.topic}</p>
      </div>

      {/* 메시지 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !isRunning && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-4xl mb-4">⚡</p>
              <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('토론을 시작할 준비가 됐습니다', 'Ready to start the debate')}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('아래 버튼을 눌러 첫 라운드를 시작하세요', 'Press the button below to start Round 1')}
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            speaker={msg.speaker}
            content={msg.content}
            roundNumber={msg.roundNumber}
            isFinalRound={msg.isFinalRound}
            hasFactError={msg.hasFactError}
            factErrorNote={msg.factErrorNote}
            isStreaming={msg.isStreaming}
          />
        ))}
      </div>

      {/* 컨트롤 */}
      {!isComplete && (
        <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <Button
            onClick={handleNextRound}
            disabled={isRunning}
            size="lg"
            className="w-full"
          >
            {isRunning
              ? t('AI 토론 중...', 'AI debating...')
              : messages.length === 0
              ? t('라운드 1 시작', 'Start Round 1')
              : currentRound === debate.rounds
              ? t(`최종 라운드 ${currentRound} 시작`, `Start Final Round ${currentRound}`)
              : t(`라운드 ${currentRound} 시작`, `Start Round ${currentRound}`)}
          </Button>
        </div>
      )}

      {/* 리포트 오버레이 */}
      {isComplete && reportContent && (
        <DebateReport content={reportContent} topic={debate.topic} />
      )}
    </div>
  )
}
