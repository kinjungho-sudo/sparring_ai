import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* 브랜드 */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-2">
              <span className="text-base font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>⚡ 스파링 AI</span>
            </Link>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              의사결정 보조 토론형 AI 코칭 서비스
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              운영사: <span style={{ color: 'var(--text-secondary)' }}>코마인드웍스 (CoMindworks)</span>
            </p>
          </div>

          {/* 링크 */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Link href="/#how-it-works" className="hover:text-white transition-colors">서비스 소개</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">요금제</Link>
            <Link href="/#faq" className="hover:text-white transition-colors">자주 묻는 질문</Link>
            <Link href="/debate/new" className="hover:text-white transition-colors">토론 시작</Link>
            <Link href="/account" className="hover:text-white transition-colors">내 계정</Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {year} CoMindworks. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Link href="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-white transition-colors">이용약관</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
