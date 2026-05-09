'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import MessageBubble from './MessageBubble'
import RoundIndicator from './RoundIndicator'
import DebateReport from './DebateReport'
import Button from '@/components/ui/Button'
import type { Debate, Message } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { useDebate } from '@/hooks/useDebate'
import type { FactCheck } from '@/hooks/useDebate'
import { useTTS, TONE_VOICE_MAP, TTS_SPEEDS } from '@/hooks/useTTS'
import type { TTSVoice } from '@/types'

interface DebateArenaProps {
  debate: Debate
  initialReport?: import('@/types').ReportData | null
  initialMessages?: Message[]
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
          {language === 'ko' ? '더 많은 의제로 토론하려면 로그인하세요. 매일 5회 무료!' : 'Log in to debate on any topic — 5 free debates every day!'}
        </p>
        <Link href="/login" className="flex items-center justify-center gap-3 w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors mb-3">
          {language === 'ko' ? 'Google로 시작하기' : 'Continue with Google'}
        </Link>
        <Link href="/" className="text-xs block" style={{ color: 'var(--text-muted)' }}>
          {language === 'ko' ? '나중에 하기' : 'Maybe later'}
        </Link>
      </div>
    </div>
  )
}

function RoundAdjustModal({ current, total, onConfirm, onClose }: { current: number; total: number; onConfirm: (n: number) => void; onClose: () => void }) {
  const min = current + 1
  const [value, setValue] = useState(Math.max(total, min))
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-xs p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-black mb-1" style={{ color: 'var(--text-primary)' }}>라운드 수 조정</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>현재 라운드 {current} 완료 후 최대 라운드를 변경합니다.</p>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setValue(Math.max(min, value - 1))} className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>−</button>
          <span className="flex-1 text-center text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</span>
          <button onClick={() => setValue(Math.min(20, value + 1))} className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>+</button>
        </div>
        <input type="range" min={min} max={20} value={value} onChange={(e) => setValue(Number(e.target.value))} className="w-full mb-4 accent-indigo-500" />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>취소</button>
          <button onClick={() => { onConfirm(value); onClose() }} className="flex-1 h-10 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors">적용</button>
        </div>
      </div>
    </div>
  )
}

type InterventionTarget = 'both' | 'red' | 'blue'

function HostInterventionModal({ onSend, onClose, language }: { onSend: (msg: string, target: InterventionTarget) => void; onClose: () => void; language: string }) {
  const [text, setText] = useState('')
  const [target, setTarget] = useState<InterventionTarget>('both')
  const presets = language === 'ko'
    ? ['주제를 벗어났습니다. 의제로 돌아와주세요.', '발언 시간이 너무 길었습니다. 요점만 말씀해주세요.', '상대방의 논점에 직접 답변해주세요.']
    : ['Please stay on topic.', 'Please be more concise.', 'Please address the opponent\'s argument directly.']

  const targets: { value: InterventionTarget; label: string; color: string; activeBg: string; activeBorder: string }[] = [
    { value: 'both', label: '⚖️ 양측', color: 'var(--gold)', activeBg: 'rgba(245,158,11,0.1)', activeBorder: 'rgba(245,158,11,0.5)' },
    { value: 'red',  label: '🔴 RED', color: 'var(--red)',  activeBg: 'rgba(239,68,68,0.1)',  activeBorder: 'rgba(239,68,68,0.5)' },
    { value: 'blue', label: '🔵 BLUE', color: 'var(--blue)', activeBg: 'rgba(59,130,246,0.1)', activeBorder: 'rgba(59,130,246,0.5)' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-sm p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-black mb-1" style={{ color: 'var(--text-primary)' }}>⚖️ 사회자 개입</h3>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>대상을 선택하고 멘트를 입력하세요.</p>

        {/* 대상 선택 */}
        <div className="flex gap-1.5 mb-3">
          {targets.map((t) => (
            <button
              key={t.value}
              onClick={() => setTarget(t.value)}
              className="flex-1 h-8 rounded-lg text-xs font-bold border transition-all"
              style={{
                color: target === t.value ? t.color : 'var(--text-muted)',
                backgroundColor: target === t.value ? t.activeBg : 'transparent',
                borderColor: target === t.value ? t.activeBorder : 'var(--border)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-1.5 mb-3">
          {presets.map((p) => (
            <button key={p} onClick={() => setText(p)} className="w-full text-left text-xs px-3 py-2 rounded-lg border transition-colors hover:bg-white/5" style={{ borderColor: text === p ? 'var(--gold)' : 'var(--border)', color: text === p ? 'var(--gold)' : 'var(--text-secondary)' }}>{p}</button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="직접 입력..." rows={2} className="w-full px-3 py-2 rounded-lg border text-xs resize-none outline-none mb-3" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>취소</button>
          <button disabled={!text.trim()} onClick={() => { onSend(text.trim(), target); onClose() }} className="flex-1 h-10 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors disabled:opacity-40">보내기</button>
        </div>
      </div>
    </div>
  )
}

function UserCommentModal({ onSend, onClose, language }: { onSend: (msg: string) => void; onClose: () => void; language: string }) {
  const [text, setText] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-sm p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-black mb-1" style={{ color: 'var(--text-primary)' }}>💬 관전 메모</h3>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>토론 흐름에 대한 나의 생각을 기록합니다. (AI에게 전달되지 않습니다)</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={language === 'ko' ? '이 시점에서 드는 생각을 적어보세요...' : 'Write your thoughts at this point...'} rows={3} className="w-full px-3 py-2 rounded-lg border text-xs resize-none outline-none mb-3" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>취소</button>
          <button disabled={!text.trim()} onClick={() => { onSend(text.trim()); onClose() }} className="flex-1 h-10 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-40">기록하기</button>
        </div>
      </div>
    </div>
  )
}

export default function DebateArena({ debate, initialReport, initialMessages }: DebateArenaProps) {
  const { language, t } = useLanguage()
  const { messages, currentRound, totalRounds, isRunning, isComplete, roundErrorCount, reportContent, initDebate, runRound, adjustTotalRounds, resetRoundError, sendHostIntervention } = useDebate()
  const { speakMsg, enqueueMsg, stop, isSupported, speakingMsgId, ttsEnabled, setTtsEnabled, speed, setSpeed } = useTTS()
  const scrollRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)
  const [showSampleEnd, setShowSampleEnd] = useState(false)
  const [showReport, setShowReport] = useState(() => !!initialReport)

  // TTS: 이미 큐에 추가한 메시지 추적
  const spokenMsgIdsRef = useRef<Set<string>>(new Set())

  // UI 모달 상태
  const [showRoundAdjust, setShowRoundAdjust] = useState(false)
  const [showHostModal, setShowHostModal] = useState(false)
  const [showUserComment, setShowUserComment] = useState(false)

  // 사용자 메모 목록 (AI에 전달 안 됨, 로컬만)
  const [userMemos, setUserMemos] = useState<Array<{ id: string; round: number; text: string }>>([])

  // 토론 페이지: body 클래스 추가로 푸터/헤더 nav 숨김 + 이탈 시 TTS 중단
  useEffect(() => {
    document.body.classList.add('debate-active')
    const handleUnload = () => stop()
    window.addEventListener('beforeunload', handleUnload)
    return () => {
      document.body.classList.remove('debate-active')
      window.removeEventListener('beforeunload', handleUnload)
      stop()
    }
  }, [stop])

  // 토론 진행 중 여부를 localStorage에 저장 (재접속 감지용)
  useEffect(() => {
    if (!debate.is_sample && debate.id) {
      localStorage.setItem('sparring_active_debate_id', debate.id)
    }
    return () => {
      if (!debate.is_sample) localStorage.removeItem('sparring_active_debate_id')
    }
  }, [debate.id, debate.is_sample])

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      initDebate(debate, initialMessages)
    }
  }, [debate, initDebate, initialMessages])

  // 스크롤: 새 메시지 오면 하단으로
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (isComplete && debate.is_sample) {
      const timer = setTimeout(() => setShowSampleEnd(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [isComplete, debate.is_sample])

  // 토론 완료 시 TTS 중단 + 결론 자동 표시
  useEffect(() => {
    if (isComplete) {
      stop()
      if (reportContent) setShowReport(true)
    }
  }, [isComplete, reportContent, stop])

  // 자동 모드 + TTS 켜짐: 스트리밍 완료된 메시지를 큐에 순차 추가
  useEffect(() => {
    if (!ttsEnabled || !isSupported) return
    const finalized = messages.filter(
      (m) => !m.isStreaming && (m.speaker === 'red' || m.speaker === 'blue') && !spokenMsgIdsRef.current.has(m.id)
    )
    for (const msg of finalized) {
      spokenMsgIdsRef.current.add(msg.id)
      const cfg = msg.speaker === 'red' ? debate.debate_config?.red : debate.debate_config?.blue
      const tone = cfg?.tone ?? 'default'
      const voiceMap = TONE_VOICE_MAP[tone] ?? TONE_VOICE_MAP.default
      const voice = (cfg?.voice ?? voiceMap[msg.speaker as 'red' | 'blue']) as TTSVoice
      enqueueMsg(msg.id, msg.content, { speaker: msg.speaker as 'red' | 'blue', lang: language, voice })
    }
  }, [messages, ttsEnabled, isSupported, debate.debate_config, language, enqueueMsg])


  const handleNextRound = useCallback(() => {
    stop()
    runRound(debate, language, totalRounds)
  }, [stop, runRound, debate, language, totalRounds])

  const handleToggleTTS = useCallback(() => {
    const next = !ttsEnabled
    setTtsEnabled(next)
    if (next) {
      // 켜는 순간 이미 완료된 메시지를 spokenMsgIdsRef 초기화 후 즉시 큐 추가
      spokenMsgIdsRef.current = new Set()
    } else {
      stop()
    }
  }, [ttsEnabled, setTtsEnabled, stop])

  const handleRoundAdjust = (n: number) => {
    adjustTotalRounds(n)
  }

  const handleHostSend = (msg: string, target: InterventionTarget) => {
    sendHostIntervention(debate, language, msg, target)
  }

  const handleUserMemo = (text: string) => {
    setUserMemos((prev) => [...prev, { id: `memo-${Date.now()}`, round: currentRound, text }])
  }

  const isDebating = messages.length > 0 && !isComplete

  const streamingMsg = messages.find((m) => m.isStreaming)
  const activeSpeaker = streamingMsg?.speaker ?? null

  return (
    // 토론 중: 뷰포트 전체 고정, 푸터/스크롤 차단
    <div className="fixed inset-0 flex flex-col" style={{ top: 64 /* header height */ }}>

      {/* 상단 바: 뒤로가기 + 라운드 인디케이터 + 컨트롤 */}
      <div className="shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)' }}>
        {/* 뒤로가기 */}
        <Link
          href="/debate/new"
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-white/5 shrink-0"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          onClick={() => stop()}
        >
          ← {t('나가기', 'Exit')}
        </Link>

        {/* 라운드 인디케이터 */}
        <div className="flex-1 min-w-0">
          <RoundIndicator currentRound={currentRound} totalRounds={totalRounds} isRunning={isRunning} />
        </div>

        {/* TTS 토글 + 속도 조절 */}
        {isSupported && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleToggleTTS}
              className="text-xs px-2.5 py-1.5 rounded-lg border transition-all"
              style={{
                borderColor: ttsEnabled ? 'rgba(99,102,241,0.5)' : 'var(--border)',
                color: ttsEnabled ? 'var(--accent)' : 'var(--text-muted)',
                backgroundColor: ttsEnabled ? 'rgba(99,102,241,0.08)' : 'transparent',
              }}
              title={ttsEnabled ? '음성 끄기' : '음성 켜기'}
            >
              {ttsEnabled ? '🔊' : '🔇'}
            </button>
            {ttsEnabled && (
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value) as typeof speed)}
                className="text-[11px] font-bold px-1.5 py-1.5 rounded-lg border cursor-pointer outline-none"
                style={{
                  borderColor: 'rgba(99,102,241,0.3)',
                  color: 'var(--accent)',
                  backgroundColor: 'rgba(99,102,241,0.08)',
                }}
              >
                {TTS_SPEEDS.map((s) => (
                  <option key={s} value={s}>{s}×</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* 라운드 조정 버튼 */}
        {!isComplete && (
          <button
            onClick={() => setShowRoundAdjust(true)}
            className="shrink-0 text-xs px-2 py-1.5 rounded-lg border transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            title="라운드 수 조정"
          >
            ⚙️
          </button>
        )}
      </div>

      {/* 의제 */}
      <div className="shrink-0 px-3 sm:px-4 py-2 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <p className="text-xs font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>TOPIC</p>
        <p className="text-xs sm:text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{debate.topic}</p>
      </div>

      {/* 메시지 영역 — 스크롤 가능 */}
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

        {messages.length === 0 && isRunning && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-fade-slide-in">
              <p className="text-3xl mb-3">🤔</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {t('생각 중...', 'Thinking...')}
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          // 라운드 첫 메시지 여부 — RED 발언이 시작될 때 구분선 표시
          const isRoundStart = msg.speaker === 'red' && (i === 0 || messages[i - 1].roundNumber !== msg.roundNumber)
          // 해당 라운드의 사용자 메모 표시
          const memo = msg.speaker === 'blue' && !msg.isStreaming
            ? userMemos.find((m) => m.round === msg.roundNumber)
            : undefined
          return (
            <div key={msg.id}>
              {isRoundStart && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                  <span
                    className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                  >
                    {msg.isFinalRound
                      ? (language === 'ko' ? '최종 라운드' : 'Final Round')
                      : `Round ${msg.roundNumber}`}
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                </div>
              )}
              <MessageBubble
                speaker={msg.speaker}
                content={msg.content}
                roundNumber={msg.roundNumber}
                isFinalRound={msg.isFinalRound}
                hasFactError={msg.hasFactError}
                factErrorNote={msg.factErrorNote}
                isStreaming={msg.isStreaming}
                index={i}
                onSpeak={isSupported && !msg.isStreaming && (msg.speaker === 'red' || msg.speaker === 'blue') ? (content, speaker) => {
                  const cfg = speaker === 'red' ? debate.debate_config?.red : debate.debate_config?.blue
                  const tone = cfg?.tone ?? 'default'
                  const voiceMap = TONE_VOICE_MAP[tone] ?? TONE_VOICE_MAP.default
                  const voice = cfg?.voice ?? voiceMap[speaker]
                  speakMsg(msg.id, content, speaker, { speaker, lang: language, voice })
                } : undefined}
                isSpeakingThis={speakingMsgId === msg.id}
                factChecks={msg.factChecks}
              />
              {memo && (
                <div className="flex justify-center my-2">
                  <div className="px-3 py-1.5 rounded-lg text-xs italic" style={{ backgroundColor: 'rgba(99,102,241,0.06)', color: 'var(--text-muted)', border: '1px dashed rgba(99,102,241,0.2)' }}>
                    📝 나의 메모: {memo.text}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 하단 컨트롤 */}
      {!isComplete && (
        <div className="shrink-0 px-3 sm:px-4 py-3 border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)' }}>
          {/* 사회자/사용자 개입 버튼 (토론 중일 때만) */}
          {isDebating && !isRunning && (
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setShowHostModal(true)}
                className="flex-1 h-9 rounded-xl text-xs font-semibold border transition-colors hover:bg-white/5"
                style={{ borderColor: 'rgba(245,158,11,0.4)', color: 'var(--gold)' }}
              >
                ⚖️ 사회자 개입
              </button>
              <button
                onClick={() => setShowUserComment(true)}
                className="flex-1 h-9 rounded-xl text-xs font-semibold border transition-colors hover:bg-white/5"
                style={{ borderColor: 'rgba(99,102,241,0.4)', color: 'var(--accent)' }}
              >
                📝 관전 메모
              </button>
            </div>
          )}

          {/* 진행 중: 발언자 표시 */}
          {isRunning && (
            <div className="w-full h-11 flex items-center justify-center gap-3 rounded-xl mb-2"
              style={{
                backgroundColor: activeSpeaker === 'red' ? 'rgba(239,68,68,0.08)' : activeSpeaker === 'blue' ? 'rgba(59,130,246,0.08)' : 'rgba(99,102,241,0.08)',
                border: `1px solid ${activeSpeaker === 'red' ? 'rgba(239,68,68,0.3)' : activeSpeaker === 'blue' ? 'rgba(59,130,246,0.3)' : 'rgba(99,102,241,0.2)'}`,
              }}>
              <span className="flex gap-0.5 items-end h-3.5">
                {[60, 100, 70, 85].map((h, i) => (
                  <span key={i} className="w-0.5 rounded-full animate-pulse"
                    style={{ height: `${h}%`, backgroundColor: activeSpeaker === 'red' ? '#ef4444' : activeSpeaker === 'blue' ? '#3b82f6' : 'var(--accent)', animationDelay: `${i * 0.12}s` }} />
                ))}
              </span>
              <span className="text-xs font-bold" style={{ color: activeSpeaker === 'red' ? '#ef4444' : activeSpeaker === 'blue' ? '#3b82f6' : 'var(--accent)' }}>
                {activeSpeaker === 'red'
                  ? t(`🔴 RED 발언 중`, `🔴 RED speaking`)
                  : activeSpeaker === 'blue'
                    ? t(`🔵 BLUE 발언 중`, `🔵 BLUE speaking`)
                    : t(`라운드 ${currentRound} 진행 중...`, `Round ${currentRound} in progress...`)}
              </span>
            </div>
          )}

          {/* 오류 */}
          {roundErrorCount >= 2 && !isRunning && (
            <div className="w-full px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 mb-2" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <span className="text-xs" style={{ color: '#ef4444' }}>{t('연결 오류가 발생했습니다', 'Connection error occurred')}</span>
              <button onClick={() => { resetRoundError(); runRound(debate, language, totalRounds) }}
                className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                {t('재시도', 'Retry')}
              </button>
            </div>
          )}

          {/* 다음 라운드 버튼 — 항상 표시 */}
          <Button onClick={handleNextRound} disabled={isRunning} size="lg" className="w-full">
            {isRunning
              ? t('AI 토론 중...', 'AI debating...')
              : messages.length === 0
              ? t('라운드 1 시작', 'Start Round 1')
              : currentRound === totalRounds
              ? t(`최종 라운드 ${currentRound} 시작`, `Start Final Round ${currentRound}`)
              : t(`라운드 ${currentRound} 시작`, `Start Round ${currentRound}`)}
          </Button>

        </div>
      )}

      {/* 완료 후 하단 바 */}
      {(isComplete || !!initialReport) && (
        <div className="shrink-0 px-3 sm:px-4 py-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)' }}>
          <button
            onClick={() => setShowReport(true)}
            className="flex-1 h-11 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            📋 결론 보기
          </button>
          <Link
            href="/debate/history"
            className="h-11 px-4 rounded-xl border font-semibold text-sm flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            목록
          </Link>
          <Link
            href="/debate/new"
            className="h-11 px-4 rounded-xl border font-semibold text-sm flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            새 토론
          </Link>
        </div>
      )}

      {/* 리포트 오버레이 (토글 가능) */}
      {showReport && (reportContent ?? initialReport) && (
        <DebateReport
          report={(reportContent ?? initialReport)!}
          topic={debate.topic}
          debateId={debate.id}
          onClose={() => setShowReport(false)}
        />
      )}

      {showSampleEnd && <SampleEndPrompt language={language} />}

      {/* 모달들 */}
      {showRoundAdjust && (
        <RoundAdjustModal
          current={currentRound}
          total={totalRounds}
          onConfirm={handleRoundAdjust}
          onClose={() => setShowRoundAdjust(false)}
        />
      )}
      {showHostModal && (
        <HostInterventionModal
          onSend={handleHostSend}
          onClose={() => setShowHostModal(false)}
          language={language}
        />
      )}
      {showUserComment && (
        <UserCommentModal
          onSend={handleUserMemo}
          onClose={() => setShowUserComment(false)}
          language={language}
        />
      )}
    </div>
  )
}
