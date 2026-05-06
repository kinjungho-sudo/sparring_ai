import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import { LanguageProvider } from '@/contexts/LanguageContext'

export const metadata: Metadata = {
  title: '스파링 AI — 의사결정 보조 AI 토론 서비스',
  description: '두 AI가 찬반으로 격돌하는 동안, 사용자는 스스로 결론에 도달합니다.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <LanguageProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  )
}
