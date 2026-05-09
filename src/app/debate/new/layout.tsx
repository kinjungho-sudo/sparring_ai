import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '새 토론 시작',
  description: '고민 중인 주제를 입력하면 AI 두 명이 찬성·반대로 즉시 토론을 시작합니다. 의사결정 AI 토론 서비스 스파링 AI.',
  alternates: { canonical: 'https://sparring-ai-ten.vercel.app/debate/new' },
  openGraph: {
    title: '새 토론 시작 | 스파링 AI',
    description: '고민 중인 주제를 입력하면 AI 두 명이 찬성·반대로 즉시 토론을 시작합니다.',
    type: 'website',
    url: 'https://sparring-ai-ten.vercel.app/debate/new',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: '스파링 AI — 새 토론 시작' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '새 토론 시작 | 스파링 AI',
    description: '고민 중인 주제를 입력하면 AI 두 명이 찬성·반대로 즉시 토론을 시작합니다.',
    images: ['/opengraph-image'],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
