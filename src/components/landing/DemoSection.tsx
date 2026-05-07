'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

// 실제 영상 URL로 교체: DEMO_VIDEO_ID에 YouTube video ID 입력
const DEMO_VIDEO_ID = '' // 예: 'dQw4w9WgXcQ'

const SAMPLE_ROUNDS = [
  {
    speaker: 'red' as const,
    ko: '주 4일제는 생산성을 높입니다. 마이크로소프트 일본 법인 실험에서 생산성이 40% 향상됐고, 직원 번아웃이 줄면서 창의적 업무 효율이 크게 올랐습니다.',
    en: 'A 4-day week boosts productivity. Microsoft Japan saw a 40% productivity jump, and reduced burnout leads to significantly better creative output.',
  },
  {
    speaker: 'blue' as const,
    ko: '실험 결과를 과도하게 일반화하고 있습니다. 제조·서비스업에서는 적용 자체가 불가능하고, 같은 업무량을 4일에 압축하면 오히려 스트레스가 증가한다는 연구도 다수 존재합니다.',
    en: 'That result is being over-generalized. Manufacturing and service sectors simply can\'t adapt, and multiple studies show compressing the same workload actually increases stress.',
  },
  {
    speaker: 'red' as const,
    ko: '업종별 차이는 인정합니다. 그러나 지식 노동자 중심의 현대 경제에서 절반 이상의 일자리가 4일제 전환이 가능하며, 선진국 20개국 파일럿 프로그램 모두 순이익을 보고했습니다.',
    en: 'Sector differences are acknowledged. But in a modern knowledge economy, over half of jobs are compatible — and every pilot across 20 countries reported net gains.',
  },
]

export default function DemoSection() {
  const { language, t } = useLanguage()
  const [activeRound, setActiveRound] = useState(0)
  const [playing, setPlaying] = useState(false)

  return (
    <section id="demo" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* 섹션 헤더 */}
        <div className="text-center mb-12">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>DEMO</p>
          <h2 className="font-black mb-4" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            {t('이렇게 작동합니다', 'See it in action')}
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t(
              '"주 4일제는 생산성을 높이는가" — 30초 만에 AI 토론이 어떻게 생겼는지 확인하세요.',
              '"Does a 4-day work week boost productivity?" — See what an AI debate looks like in 30 seconds.'
            )}
          </p>
        </div>

        {/* 영상 or 인터랙티브 미리보기 */}
        {DEMO_VIDEO_ID ? (
          <div className="relative rounded-2xl overflow-hidden border mb-8" style={{ borderColor: 'var(--border)', aspectRatio: '16/9' }}>
            {!playing ? (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
                onClick={() => setPlaying(true)}
              >
                {/* 썸네일 오버레이 */}
                <img
                  src={`https://img.youtube.com/vi/${DEMO_VIDEO_ID}/maxresdefault.jpg`}
                  alt="demo thumbnail"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: 'rgba(99,102,241,0.9)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </div>
                  <span className="text-sm font-bold text-white">{t('데모 영상 재생', 'Play demo video')}</span>
                </div>
              </div>
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${DEMO_VIDEO_ID}?autoplay=1`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            )}
          </div>
        ) : (
          /* 영상 없을 때: 인터랙티브 토론 미리보기 */
          <div className="rounded-2xl border overflow-hidden mb-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            {/* 토론 헤더 */}
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  {t('라이브 토론 미리보기', 'Live debate preview')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>🔴 RED</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>vs</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>🔵 BLUE</span>
              </div>
            </div>

            {/* 의제 */}
            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(99,102,241,0.04)' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--accent)' }}>TOPIC</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('"주 4일제 근무는 생산성을 높인다"', '"A 4-day work week improves productivity"')}
              </p>
            </div>

            {/* 발언 */}
            <div className="p-5 space-y-4 min-h-[220px]">
              {SAMPLE_ROUNDS.slice(0, activeRound + 1).map((round, i) => (
                <div
                  key={i}
                  className={`flex ${round.speaker === 'blue' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[85%]">
                    <p className={`text-[10px] font-black mb-1 ${round.speaker === 'blue' ? 'text-right' : 'text-left'}`}
                      style={{ color: round.speaker === 'red' ? '#ef4444' : '#3b82f6' }}>
                      {round.speaker === 'red' ? '🔴 RED (찬성)' : '🔵 BLUE (반대)'}
                    </p>
                    <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                      style={{
                        backgroundColor: round.speaker === 'red' ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)',
                        border: `1.5px solid ${round.speaker === 'red' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`,
                        color: 'var(--text-primary)',
                      }}>
                      {language === 'ko' ? round.ko : round.en}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 라운드 컨트롤 */}
            <div className="px-5 py-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div className="flex gap-1.5">
                {SAMPLE_ROUNDS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveRound(i)}
                    className="w-6 h-6 rounded-full text-[10px] font-bold transition-all"
                    style={{
                      backgroundColor: activeRound >= i ? 'var(--accent)' : 'var(--bg-secondary)',
                      color: activeRound >= i ? 'white' : 'var(--text-muted)',
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {activeRound < SAMPLE_ROUNDS.length - 1 ? (
                  <button
                    onClick={() => setActiveRound(r => r + 1)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: 'var(--accent)' }}
                  >
                    {t('다음 발언 →', 'Next round →')}
                  </button>
                ) : (
                  <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>
                    {t('✓ 팩트체크 완료 · 리포트 생성됨', '✓ Fact-checked · Report generated')}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 하단 안내 */}
        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          {t('위는 실제 서비스 화면입니다. 어떤 주제든 즉시 토론이 시작됩니다.', 'This is the real UI. Any topic starts a debate instantly.')}
          {' '}
          <a href="#how-it-works" className="underline underline-offset-2 hover:opacity-80 transition-opacity" style={{ color: 'var(--accent)' }}>
            {t('작동 방식 더 보기 →', 'See how it works →')}
          </a>
        </p>
      </div>
    </section>
  )
}
