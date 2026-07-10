'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function NewPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-black text-center mb-2" style={{ color: 'var(--text-primary)' }}>
          {t('무엇을 시작할까요?', 'What would you like to start?')}
        </h1>
        <p className="text-sm text-center mb-10" style={{ color: 'var(--text-muted)' }}>
          {t('모드를 선택하세요', 'Choose a mode to begin')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 자유 토론 */}
          <Link
            href="/debate/new"
            className="group relative flex flex-col gap-3 p-6 sm:p-8 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.99]"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <div className="text-3xl">⚡</div>
            <div>
              <h2 className="text-lg font-black mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('자유 토론', 'Open Debate')}
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {t(
                  '어떤 주제든 AI 두 명이 찬반으로 토론합니다. 복잡한 결정에 다양한 시각을 얻어보세요.',
                  'Two AIs debate any topic for and against. Get multiple perspectives on complex decisions.',
                )}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap mt-1">
              {['찬반 토론', '의사결정', '다양한 관점'].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: 'var(--accent)' }}
                >
                  {t(tag, tag)}
                </span>
              ))}
            </div>
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ boxShadow: '0 0 0 2px var(--accent)' }}
            />
          </Link>

          {/* 모의 면접 */}
          <Link
            href="/interview/new"
            className="group relative flex flex-col gap-3 p-6 sm:p-8 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.99]"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            <div className="text-3xl">🎙️</div>
            <div>
              <h2 className="text-lg font-black mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('모의 면접', 'Mock Interview')}
              </h2>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {t(
                  '자기소개서를 기반으로 AI 면접관과 실전 모의 면접을 진행하고 즉각 피드백을 받으세요.',
                  'Practice a real interview with an AI interviewer based on your resume and get instant feedback.',
                )}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap mt-1">
              {['자소서 기반', '즉각 피드백', '모범 답변'].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e' }}
                >
                  {t(tag, tag)}
                </span>
              ))}
            </div>
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ boxShadow: '0 0 0 2px #22c55e' }}
            />
          </Link>
        </div>
      </div>
    </main>
  )
}
