'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* 브랜드 */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-2">
              <span className="text-base font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>⚡ Sparring AI</span>
              <span className="text-xs font-black px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: 'var(--accent)' }}>BETA</span>
            </Link>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('의사결정 보조 토론형 AI 코칭 서비스', 'AI debate coaching for better decisions')}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {t('운영사', 'Operated by')}: <span style={{ color: 'var(--text-secondary)' }}>코마인드웍스 (CoMindworks)</span>
            </p>
          </div>

          {/* 링크 */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Link href="/#how-it-works" className="hover:text-white transition-colors">{t('서비스 소개', 'How it works')}</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">{t('요금제', 'Pricing')}</Link>
            <Link href="/#faq" className="hover:text-white transition-colors">{t('자주 묻는 질문', 'FAQ')}</Link>
            <Link href="/debate/new" className="hover:text-white transition-colors">{t('토론 시작', 'Start debate')}</Link>
            <Link href="/account" className="hover:text-white transition-colors">{t('내 계정', 'My account')}</Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {year} CoMindworks. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Link href="/privacy" className="hover:text-white transition-colors">{t('개인정보처리방침', 'Privacy Policy')}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t('이용약관', 'Terms of Service')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
