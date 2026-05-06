'use client'

interface MessageBubbleProps {
  speaker: 'red' | 'blue' | 'host'
  content: string
  roundNumber: number
  isFinalRound: boolean
  hasFactError: boolean
  factErrorNote: string | null
  isStreaming?: boolean
  index?: number
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
}: MessageBubbleProps) {
  const isRed = speaker === 'red'
  const isBlue = speaker === 'blue'
  const isHost = speaker === 'host'
  const delay = Math.min(index * 40, 300)

  if (isHost) {
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
          className={`text-xs font-black mb-1.5 ${isBlue ? 'text-right' : 'text-left'}`}
          style={{ color: isRed ? 'var(--red)' : 'var(--blue)' }}
        >
          {isRed ? '🔴 RED (찬성)' : '🔵 BLUE (반대)'}
          {isFinalRound && <span className="ml-2 opacity-60">· 최종 발언</span>}
        </div>

        {/* 버블 */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed relative ${isStreaming ? 'streaming-cursor' : ''}`}
          style={{
            backgroundColor: isRed ? 'var(--red-dim)' : 'var(--blue-dim)',
            border: `1.5px solid ${isRed ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)'}`,
            color: 'var(--text-primary)',
          }}
        >
          {hasFactError ? (
            <>
              <span className="fact-error">{content}</span>
              {factErrorNote && (
                <div className="mt-2 pt-2 border-t text-xs" style={{ borderColor: 'rgba(245,158,11,0.3)', color: 'var(--gold)' }}>
                  ⚠️ 팩트 오류: {factErrorNote}
                </div>
              )}
            </>
          ) : (
            content
          )}
        </div>

        {/* 팩트 오류 배지 */}
        {hasFactError && (
          <div className="mt-1 text-xs" style={{ color: 'var(--gold)' }}>
            🏅 팩트 오류 감지됨
          </div>
        )}
      </div>
    </div>
  )
}
