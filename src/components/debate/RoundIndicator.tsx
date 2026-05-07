'use client'

interface RoundIndicatorProps {
  currentRound: number
  totalRounds: number
  isRunning: boolean
}

export default function RoundIndicator({ currentRound, totalRounds, isRunning }: RoundIndicatorProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xs font-black uppercase tracking-widest hidden sm:block" style={{ color: 'var(--text-muted)' }}>
          ROUND
        </span>
        <div className="flex gap-1 sm:gap-1.5 items-center">
          {Array.from({ length: totalRounds }).map((_, i) => {
            const isDone = i < currentRound - 1
            const isCurrent = i === currentRound - 1
            return (
              <div
                key={i}
                className="relative flex items-center justify-center transition-all duration-300"
                style={{
                  width: isCurrent ? 28 : 20,
                  height: 8,
                }}
              >
                <div
                  className="absolute inset-0 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: isDone
                      ? 'var(--accent)'
                      : isCurrent
                      ? 'var(--text-primary)'
                      : 'var(--border)',
                    opacity: isCurrent && isRunning ? 1 : undefined,
                  }}
                />
                {isDone && (
                  <span className="relative z-10 text-[7px] font-black text-white leading-none">✓</span>
                )}
                {isCurrent && isRunning && (
                  <span className="absolute inset-0 rounded-full animate-pulse" style={{ backgroundColor: 'var(--text-primary)', opacity: 0.3 }} />
                )}
              </div>
            )
          })}
        </div>
        <span className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          <span className="sm:hidden">{currentRound}/{totalRounds}</span>
          <span className="hidden sm:inline">{currentRound} / {totalRounds}</span>
        </span>
      </div>

      {isRunning && (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
          <span className="hidden sm:inline">AI 토론 중...</span>
          <span className="sm:hidden">토론 중</span>
        </div>
      )}
    </div>
  )
}
