'use client'

import { useState } from 'react'
import type { FactCheck } from '@/hooks/useDebate'

// 화면 표시: 마크다운 기호만 제거, 줄바꿈은 유지
function cleanForDisplay(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_{1,3}(.+?)_{1,3}/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/^-{3,}$/gm, '')
    .replace(/^={3,}$/gm, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/>{1,}\s*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}


interface MessageBubbleProps {
  speaker: 'red' | 'blue' | 'host'
  content: string
  roundNumber: number
  isFinalRound: boolean
  hasFactError: boolean
  factErrorNote: string | null
  isStreaming?: boolean
  index?: number
  onSpeak?: (content: string, speaker: 'red' | 'blue') => void
  isSpeakingThis?: boolean
  factChecks?: FactCheck[]
}

const VERDICT_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  TRUE:      { label: '✓ TRUE',      color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  FALSE:     { label: '✗ FALSE',     color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  MISLEADING:{ label: '△ MISLEADING',color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
}

export default function MessageBubble({
  speaker,
  content,
  roundNumber,
  isFinalRound,
  hasFactError,
  factErrorNote,
  isStreaming,
  index = 0,
  onSpeak,
  isSpeakingThis,
  factChecks,
}: MessageBubbleProps) {
  const isRed = speaker === 'red'
  const isBlue = speaker === 'blue'
  const isHost = speaker === 'host'
  const delay = Math.min(index * 40, 300)
  const [showFactNote, setShowFactNote] = useState(false)

  if (isHost) {
    // 팩트체크 버블
    if (factChecks && factChecks.length > 0) {
      return (
        <div className="flex justify-center my-3 animate-fade-slide-in" style={{ animationDelay: `${delay}ms` }}>
          <div className="w-full max-w-[92%] sm:max-w-[85%] rounded-xl border overflow-hidden"
            style={{ borderColor: 'rgba(245,158,11,0.3)', backgroundColor: 'rgba(245,158,11,0.04)' }}>
            <div className="px-4 py-2 border-b flex items-center gap-2"
              style={{ borderColor: 'rgba(245,158,11,0.2)', backgroundColor: 'rgba(245,158,11,0.08)' }}>
              <span className="text-xs font-black" style={{ color: '#f59e0b' }}>⚖️ 사회자 팩트체크</span>
              <span className="text-[10px] font-semibold opacity-60" style={{ color: '#f59e0b' }}>Round {roundNumber}</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(245,158,11,0.12)' }}>
              {factChecks.map((fc, i) => {
                const vs = VERDICT_STYLE[fc.verdict] ?? VERDICT_STYLE.MISLEADING
                const speakerLabel = fc.speaker === 'red' ? '🔴 RED' : '🔵 BLUE'
                return (
                  <div key={i} className="px-4 py-3" style={{ backgroundColor: vs.bg }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black" style={{ color: fc.speaker === 'red' ? '#ef4444' : '#3b82f6' }}>{speakerLabel}</span>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded" style={{ color: vs.color, backgroundColor: `${vs.color}18`, border: `1px solid ${vs.color}40` }}>{vs.label}</span>
                    </div>
                    <p className="text-[11px] mb-1 italic opacity-70" style={{ color: 'var(--text-muted)' }}>&ldquo;{fc.claim}&rdquo;</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{fc.note}</p>
                    {fc.source_url && (
                      <a
                        href={fc.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity"
                        style={{ color: '#f59e0b' }}
                      >
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        {fc.source_label ?? '출처 확인'}
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    }

    // 일반 사회자 버블
    return (
      <div
        className="flex justify-center my-3 animate-fade-slide-in"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div
          className="px-4 py-2 rounded-xl text-xs font-semibold"
          style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--gold)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
        >
          ⚖️ {content}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex ${isBlue ? 'justify-end' : 'justify-start'} mb-4 animate-fade-slide-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="max-w-[92%] sm:max-w-[85%]">
        {/* 라벨 */}
        <div
          className={`text-xs font-black mb-1.5 flex items-center gap-1.5 ${isBlue ? 'justify-end' : 'justify-start'}`}
          style={{ color: isRed ? 'var(--red)' : 'var(--blue)' }}
        >
          {isRed ? '🔴 RED (찬성)' : '🔵 BLUE (반대)'}
          {isFinalRound && <span className="opacity-60">· 최종 발언</span>}
          {isSpeakingThis && (
            <span className="flex items-center gap-0.5">
              <span className="flex gap-0.5 items-end h-3">
                {[60, 100, 70, 85].map((h, i) => (
                  <span key={i} className="w-0.5 rounded-full animate-pulse"
                    style={{ height: `${h}%`, backgroundColor: isRed ? '#ef4444' : '#3b82f6', animationDelay: `${i * 0.1}s` }} />
                ))}
              </span>
              <span className="text-[10px] font-semibold opacity-80">낭독 중</span>
            </span>
          )}
        </div>

        {/* 버블 */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed relative whitespace-pre-wrap ${isStreaming ? 'streaming-cursor' : ''}`}
          style={{
            backgroundColor: isRed ? 'var(--red-dim)' : 'var(--blue-dim)',
            border: isSpeakingThis
              ? `1.5px solid ${isRed ? 'rgba(239,68,68,0.6)' : 'rgba(59,130,246,0.6)'}`
              : `1.5px solid ${isRed ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)'}`,
            color: 'var(--text-primary)',
            boxShadow: isSpeakingThis
              ? `0 0 0 2px ${isRed ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)'}`
              : undefined,
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        >
          {isStreaming ? content : cleanForDisplay(content)}
        </div>

        {/* 하단 액션 바 */}
        {(hasFactError || (!isStreaming && onSpeak)) && (
          <div className={`flex items-center gap-2 mt-1.5 ${isBlue ? 'justify-end' : 'justify-start'}`}>
            {/* TTS 재생 버튼 */}
            {!isStreaming && onSpeak && (isRed || isBlue) && (
              <button
                onClick={() => onSpeak(content, speaker as 'red' | 'blue')}
                className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors"
                style={{
                  color: isSpeakingThis ? (isRed ? '#ef4444' : '#3b82f6') : 'var(--text-muted)',
                  backgroundColor: isSpeakingThis ? (isRed ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)') : 'transparent',
                  border: `1px solid ${isSpeakingThis ? (isRed ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)') : 'rgba(255,255,255,0.08)'}`,
                }}
                title="이 발언 듣기"
              >
                {isSpeakingThis ? (
                  <span className="flex gap-0.5 items-end h-3">
                    {[60,100,70].map((h, i) => (
                      <span key={i} className="w-0.5 rounded-full animate-pulse"
                        style={{ height: `${h}%`, backgroundColor: isRed ? '#ef4444' : '#3b82f6', animationDelay: `${i*0.12}s` }} />
                    ))}
                  </span>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                )}
                <span>{isSpeakingThis ? '낭독 중' : '듣기'}</span>
              </button>
            )}

            {/* 팩트 오류 배지 */}
            {hasFactError && (
              <div>
                <button
                  onClick={() => setShowFactNote(!showFactNote)}
                  className="text-xs font-semibold px-2 py-0.5 rounded-md transition-colors"
                  style={{ color: 'var(--gold)', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                  ⚠️ 팩트 확인 {showFactNote ? '▲' : '▼'}
                </button>
                {showFactNote && factErrorNote && (
                  <div className="mt-1 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: 'rgba(245,158,11,0.06)', color: 'var(--gold)', border: '1px solid rgba(245,158,11,0.15)' }}>
                    {factErrorNote}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
