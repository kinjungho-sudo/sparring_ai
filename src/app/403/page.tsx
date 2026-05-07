import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-6">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-5">🚫</div>
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
          403 FORBIDDEN
        </p>
        <h1 className="text-2xl font-black mb-3" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          접근 권한이 없습니다
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          이 페이지는 관리자만 접근할 수 있습니다.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
