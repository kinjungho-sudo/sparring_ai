import LoginButton from '@/components/auth/LoginButton'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>
}) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div
        className="w-full max-w-sm p-8 rounded-2xl border"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="text-center mb-8">
          <div className="text-3xl mb-3">⚡</div>
          <h1 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
            스파링 AI
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            로그인 후 매일 3회 무료 토론
          </p>
        </div>

        <LoginButton redirectTo="/debate/new" />

        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다
        </p>
      </div>
    </div>
  )
}
