import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로그인',
  description: 'Google 계정으로 로그인하고 AI 찬반 토론 서비스를 이용하세요. 매일 5회 무료.',
  alternates: { canonical: 'https://sparring-ai-ten.vercel.app/login' },
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
