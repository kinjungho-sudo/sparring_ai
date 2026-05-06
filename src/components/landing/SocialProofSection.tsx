// 서버 컴포넌트 — debateCount는 page.tsx에서 전달
interface SocialProofSectionProps {
  debateCount: number
}

export default function SocialProofSection({ debateCount }: SocialProofSectionProps) {
  const displayCount = debateCount >= 100
    ? `${Math.floor(debateCount / 100) * 100}+`
    : debateCount >= 10
    ? `${Math.floor(debateCount / 10) * 10}+`
    : `${debateCount}+`

  const stats = [
    { value: displayCount, label: '완료된 토론' },
    { value: '3초', label: '만에 토론 시작' },
    { value: '100%', label: '무료 (지금은)' },
  ]

  return (
    <section className="py-16 px-6 border-y" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p
                className="font-black mb-1"
                style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
              >
                {stat.value}
              </p>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
