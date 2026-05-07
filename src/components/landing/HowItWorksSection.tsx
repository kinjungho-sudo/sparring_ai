'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

const STEPS = [
  {
    icon: '✍️',
    step: '01',
    ko: { title: '의제 입력', desc: '결정이 필요한 주제를 자유롭게 입력하세요. "이직해야 할까?", "법인 설립 vs 프리랜서" 뭐든 됩니다.' },
    en: { title: 'Enter your topic', desc: 'Type any topic you need to decide on. "Should I quit my job?" "Co-founder or solo?" — anything goes.' },
  },
  {
    icon: '⚡',
    step: '02',
    ko: { title: 'AI 찬반 격돌', desc: 'RED AI(찬성)와 BLUE AI(반대)가 라운드마다 치열하게 논거를 주고받습니다. 사회자 AI가 팩트를 실시간 검증합니다.' },
    en: { title: 'AIs clash', desc: 'RED (pro) and BLUE (con) exchange arguments round by round. A host AI fact-checks claims in real time.' },
  },
  {
    icon: '📊',
    step: '03',
    ko: { title: '리포트 수령', desc: '토론이 끝나면 핵심 논점·팩트 오류·승패 판정을 담은 중립적 리포트를 받습니다. 링크로 공유도 가능합니다.' },
    en: { title: 'Get your report', desc: 'When it\'s over, receive a neutral report with key arguments, fact errors, and a verdict. Shareable via link.' },
  },
]

export default function HowItWorksSection() {
  const { language, t } = useLanguage()

  return (
    <section id="how-it-works" className="py-24 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>HOW IT WORKS</p>
          <h2 className="font-black mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            {t('3단계, 3분이면 충분합니다', 'Three steps. Three minutes.')}
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t('복잡한 설정 없이 주제만 입력하면 AI 토론이 즉시 시작됩니다.', 'No setup needed. Just type your topic and the debate starts immediately.')}
          </p>
        </div>

        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <div key={i} className="flex gap-5 p-6 rounded-2xl border transition-all hover:border-indigo-500/30"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              {/* 번호 */}
              <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
                style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--accent)' }}>
                {step.step}
              </div>
              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span>{step.icon}</span>
                  <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                    {language === 'ko' ? step.ko.title : step.en.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {language === 'ko' ? step.ko.desc : step.en.desc}
                </p>
              </div>
              {/* 화살표 */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex shrink-0 items-center" style={{ color: 'var(--text-muted)' }}>↓</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/debate/new"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all hover:scale-[1.02]"
          >
            ⚡ {t('지금 바로 시작하기', 'Start now — it\'s free')}
          </Link>
        </div>
      </div>
    </section>
  )
}
