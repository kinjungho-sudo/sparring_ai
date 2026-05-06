'use client'

interface RoundIndicatorProps {
  currentRound: number
  totalRounds: number
  isRunning: boolean
}

export default function RoundIndicator({ currentRound, totalRounds, isRunning }: RoundIndicatorProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3">
        <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          ROUND
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-6 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: i < currentRound - 1
                  ? 'var(--accent)'
                  : i === currentRound - 1
                  ? 'var(--text-primary)'
                  : 'var(--border)',
              }}
            />
          ))}
        </div>
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          {currentRound} / {totalRounds}
        </span>
      </div>

      {isRunning && (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="animate-pulse">●</span> AI 토론 중...
        </div>
      )}
    </div>
  )
}
