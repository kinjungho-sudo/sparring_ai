import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { OrganizationSchema } from '@/components/seo/OrganizationSchema'
import { WebSiteSchema } from '@/components/seo/WebSiteSchema'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sparring-ai.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: '스파링 AI — 의사결정 보조 AI 토론',
    template: '%s | 스파링 AI',
  },
  description: '두 AI가 찬반으로 격돌하는 동안, 사용자는 스스로 결론에 도달합니다. 의사결정이 어려울 때 AI 토론으로 명확한 답을 찾으세요. 매일 5회 무료.',
  keywords: ['AI 토론', '의사결정 보조', '찬반 토론', '스파링 AI', 'AI 디베이트', 'AI 토론 서비스', '의사결정 AI', '토론 AI', '찬반 AI 토론', '결정 도우미'],
  authors: [{ name: '스파링 AI' }],
  creator: '스파링 AI',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: BASE_URL,
    siteName: '스파링 AI',
    title: '스파링 AI — 의사결정 보조 AI 토론',
    description: '두 AI가 찬반으로 격돌하는 동안, 사용자는 스스로 결론에 도달합니다.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: '스파링 AI' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '스파링 AI — 의사결정 보조 AI 토론',
    description: '두 AI가 찬반으로 격돌하는 동안, 사용자는 스스로 결론에 도달합니다.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: 'google-site-verification',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-T2EY4Q1S4X" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-T2EY4Q1S4X');
        `}</Script>
        <OrganizationSchema />
        <WebSiteSchema />
        <LanguageProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
