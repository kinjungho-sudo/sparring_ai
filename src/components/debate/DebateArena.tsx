'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import MessageBubble from './MessageBubble'
import RoundIndicator from './RoundIndicator'
import DebateReport from './DebateReport'
import Button from '@/components/ui/Button'
import type { Debate } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { useDebate } from '@/hooks/useDebate'
import { useTTS } from '@/hooks/useTTS'

interface DebateArenaProps {
  debate: Debate
}

function SampleEndPrompt({ language }: { language: string }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl border text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="text-3xl mb-4">🎉</div>
        <h3 className="text-lg font-black mb-2" style={{ color: 'var(--text-primary)' }}>
          {language === 'ko' ? '체험이 끝났습니다!' : 'Trial complete!'}
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {language === 'ko'
            ? '더 많은 의제로 토론하려면 로그인하세요. 매일 3회 무료!'
            : 'Log in to debate on any topic — 3 free debates every day!'}
        </p>
        <Link
          href="/login"
          className="flex items-center justify-center gap-3 w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors mb-3"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#fff" opacity="0.9" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#fff" opacity="0.9" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fff" opacity="0.9" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#fff" opacity="0.9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {language === 'ko' ? 'Google로 시작하기' : 'Continue with Google'}
        </Link>
        <Link href="/" className="text-xs block" style={{ color: 'var(--text-muted)' }}>
          {language === 'ko' ? '나중에 하기' : 'Maybe later'}
        </Link>
      </div>
    </div>
  )
}

export default function DebateArena({ debate }: DebateArenaProps) {
  const { language, t } = useLanguage()
  const { messages, currentRound, isRunning, isComplete, reportContent, initDebate, runRound } = useDebate()
  const { speak, stop, isSpeaking, ttsEnabled, setTtsEnabled, isSupported } = useTTS()
  const scrollRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)
  const [showSampleEnd, setShowSampleEnd] = useState(false)
  const prevMessagesCountRef = useRef(0)

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

  // 새 메시지 스트리밍 완료 시 TTS 실행
  useEffect(() => {
    const completed = messages.filter((m) => !m.isStreaming && (m.speaker === 'red' || m.speaker === 'blue'))
    if (completed.length > prevMessagesCountRef.current) {
      const latest = completed[completed.length - 1]
      if (latest && ttsEnabled) {
        speak(latest.content, { speaker: latest.speaker as 'red' | 'blue', lang: language })
      }
      prevMessagesCountRef.current = completed.length
    }
  }, [messages, ttsEnabled, speak, language])

  useEffect(() => {
    if (isComplete && debate.is_sample) {
      const timer = setTimeout(() => setShowSampleEnd(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [isComplete, debate.is_sample])

  const handleNextRound = () => {
    stop()
    runRound(debate, language)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <RoundIndicator
        currentRound={currentRound}
        totalRounds={debate.rounds}
        isRunning={isRunning}
      />

      {/* 의제 + TTS 토글 */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b flex items-start justify-between gap-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>TOPIC</p>
          <p className="text-xs sm:text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{debate.topic}</p>
        </div>
        {isSupported && (
          <button
            onClick={() => { setTtsEnabled(!ttsEnabled); if (ttsEnabled) stop() }}
            className="shrink-0 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all"
            style={{
              borderColor: ttsEnabled ? 'rgba(99,102,241,0.5)' : 'var(--border)',
              color: ttsEnabled ? 'var(--accent)' : 'var(--text-muted)',
              backgroundColor: ttsEnabled ? 'rgba(99,102,241,0.08)' : 'transparent',
            }}
            title={ttsEnabled ? '음성 끄기' : '음성 켜기'}
          >
            {isSpeaking ? (
              <span className="flex gap-0.5 items-end h-3">
                <span className="w-0.5 rounded-full bg-current animate-pulse" style={{ height: '60%' }} />
                <span className="w-0.5 rounded-full bg-current animate-pulse" style={{ height: '100%', animationDelay: '0.15s' }} />
                <span className="w-0.5 rounded-full bg-current animate-pulse" style={{ height: '70%', animationDelay: '0.3s' }} />
              </span>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                {ttsEnabled ? (
                  <>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </>
                ) : (
                  <line x1="23" y1="9" x2="17" y2="15" />
                )}
              </svg>
            )}
            <span className="hidden sm:inline">{ttsEnabled ? t('음성 ON', 'TTS ON') : t('음성', 'TTS')}</span>
          </button>
        )}
      </div>

      {/* 메시지 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4">
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

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            speaker={msg.speaker}
            content={msg.content}
            roundNumber={msg.roundNumber}
            isFinalRound={msg.isFinalRound}
            hasFactError={msg.hasFactError}
            factErrorNote={msg.factErrorNote}
            isStreaming={msg.isStreaming}
            index={i}
          />
        ))}
      </div>

      {/* 컨트롤 */}
      {!isComplete && (
        <div className="px-3 sm:px-4 py-3 sm:py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <Button onClick={handleNextRound} disabled={isRunning} size="lg" className="w-full">
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
        <DebateReport report={reportContent} topic={debate.topic} debateId={debate.id} />
      )}

      {/* 샘플 토론 완료 후 로그인 유도 */}
      {showSampleEnd && <SampleEndPrompt language={language} />}
    </div>
  )
}
