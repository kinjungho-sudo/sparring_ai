'use client'

import { useLanguage } from '@/contexts/LanguageContext'

const steps = [
  {
    icon: '✍️',
    ko: { title: '의제 입력', desc: '결정이 필요한 주제를 자유롭게 입력하세요' },
    en: { title: 'Enter your topic', desc: 'Type any topic you need to decide on' },
  },
  {
    icon: '⚡',
    ko: { title: 'AI 찬반 토론', desc: 'RED(찬성)와 BLUE(반대) AI가 실시간으로 격돌합니다' },
    en: { title: 'AI debate', desc: 'RED (pro) and BLUE (con) AI clash in real time' },
  },
  {
    icon: '💡',
    ko: { title: '사고확장 리포트', desc: '사회자 AI가 새로운 시각과 핵심 논점을 정리합니다' },
    en: { title: 'Thought expansion report', desc: 'Host AI summarizes new angles and key arguments' },
  },
]

export default function HowItWorksSection() {
  const { language } = useLanguage()

  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
            HOW IT WORKS
          </p>
          <h2
            className="font-black"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
          >
            {language === 'ko' ? '3단계로 끝납니다' : 'Done in 3 steps'}
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4 relative">
          {steps.map((step, i) => (
            <div key={i} className="flex-1 flex flex-col items-center text-center p-8 rounded-2xl border relative"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="text-4xl mb-4">{step.icon}</div>
              <div className="text-xs font-black mb-2" style={{ color: 'var(--accent)' }}>
                STEP {i + 1}
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                {language === 'ko' ? step.ko.title : step.en.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {language === 'ko' ? step.ko.desc : step.en.desc}
              </p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-xl z-10"
                  style={{ color: 'var(--text-muted)' }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
