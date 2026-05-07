import LoginButton from '@/components/auth/LoginButton'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">

      {/* 왼쪽 — 브랜드 패널 (md 이상에서만 표시) */}
      <div
        className="hidden md:flex flex-col justify-between w-1/2 p-12"
        style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-16">
            <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              ⚡ Sparring AI
            </span>
          </div>

          <h2
            className="font-black mb-4 leading-tight"
            style={{ fontSize: 'clamp(28px, 3vw, 40px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
          >
            AI가 당신 대신<br />치열하게 싸웁니다.
          </h2>
          <p className="text-base mb-10" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            두 AI가 찬반으로 격돌하는 토론을 지켜보며<br />
            더 나은 결정에 도달하세요.
          </p>

          {/* 소셜 프루프 */}
          <div className="space-y-3">
            {[
              { icon: '🔴🔵', text: 'RED vs BLUE — 완전 반대 입장 AI 2인 토론' },
              { icon: '⚖️', text: '팩트체크 사회자가 오류를 실시간 감지' },
              { icon: '📊', text: '토론 종료 후 중립적 리포트 자동 생성' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <span className="text-sm mt-0.5">{item.icon}</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Beta — 매일 10회 무료 · 언제든 취소 가능
        </p>
      </div>

      {/* 오른쪽 — 로그인 패널 */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* 모바일에서만 보이는 브랜드 */}
          <div className="md:hidden text-center mb-10">
            <p className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>⚡ Sparring AI</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI 토론으로 더 나은 결정을</p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              시작하기
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              계정이 없으면 자동으로 가입됩니다.
            </p>
          </div>

          <LoginButton redirectTo="/debate/new" />

          {/* 약관 동의 안내 — 업계 표준 방식 */}
          <p className="text-xs text-center mt-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            계속하면{' '}
            <Link href="/terms" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
              이용약관
            </Link>
            {' '}및{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
              개인정보처리방침
            </Link>
            에 동의하는 것으로 간주됩니다.
          </p>

          {/* 구분선 */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>또는</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          </div>

          {/* 비로그인 체험 */}
          <Link
            href="/debate/new?sample=true"
            className="flex items-center justify-center w-full h-11 rounded-xl border text-sm font-semibold transition-all hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            로그인 없이 체험하기
          </Link>
        </div>
      </div>

    </div>
  )
}
