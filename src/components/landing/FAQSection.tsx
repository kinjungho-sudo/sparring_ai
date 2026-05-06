'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

const FAQ_KO = [
  {
    q: '완전히 무료인가요?',
    a: '네. 회원가입만 하면 매일 3회 무료로 토론할 수 있습니다. 비로그인 상태에서도 샘플 토론 1회를 체험할 수 있습니다.',
  },
  {
    q: '어떤 주제든 토론이 가능한가요?',
    a: '사실 확인이 가능한 주제, 전략적 의사결정, 가치관 충돌 등 대부분의 주제를 지원합니다. 단, 법률·의료·투자 관련 주제는 AI 한계를 고지한 후 토론이 진행됩니다.',
  },
  {
    q: 'AI가 정답을 알려주는 건가요?',
    a: '아닙니다. 스파링 AI는 정답을 내리지 않습니다. 두 AI가 찬반 양쪽을 논리적으로 전개해 사용자가 스스로 결론에 도달하도록 돕는 "사고 확장" 도구입니다.',
  },
  {
    q: '토론 결과는 저장되나요?',
    a: '예. 로그인한 상태에서 진행한 모든 토론은 자동 저장됩니다. 원하는 토론은 공개 링크로 공유할 수도 있습니다.',
  },
  {
    q: '어떤 AI 모델을 사용하나요?',
    a: 'Anthropic의 Claude 3.7 Sonnet을 사용합니다. 찬성(RED)과 반대(BLUE) 역할을 각각 독립 세션으로 구동해 편향 없이 논쟁을 전개합니다.',
  },
]

const FAQ_EN = [
  {
    q: 'Is it completely free?',
    a: 'Yes. Sign up and get 3 free debates every day. You can also try one sample debate without logging in.',
  },
  {
    q: 'Can I debate on any topic?',
    a: 'Most topics work — factual disputes, strategic decisions, value conflicts, and more. For legal, medical, or investment topics, a disclaimer is shown before the debate starts.',
  },
  {
    q: 'Does the AI give me the "right" answer?',
    a: 'No. Sparring AI never declares a winner. Two AIs argue both sides logically so you can reach your own conclusion — it\'s a tool for expanding your thinking, not replacing it.',
  },
  {
    q: 'Are my debate results saved?',
    a: 'Yes. All debates run while logged in are saved automatically. You can also share any completed debate via a public link.',
  },
  {
    q: 'What AI model does it use?',
    a: "Anthropic's Claude 3.7 Sonnet. The PRO (for) and CON (against) roles run as separate independent sessions to prevent bias in the argumentation.",
  },
]

function AccordionItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  return (
    <div className="border-b" style={{ borderColor: 'var(--border)' }}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{q}</span>
        <span
          className="shrink-0 text-lg leading-none transition-transform"
          style={{ color: 'var(--accent)', transform: open ? 'rotate(45deg)' : 'none' }}
        >
          +
        </span>
      </button>
      {open && (
        <p className="pb-5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {a}
        </p>
      )}
    </div>
  )
}

export default function FAQSection() {
  const { language } = useLanguage()
  const faqs = language === 'ko' ? FAQ_KO : FAQ_EN
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>FAQ</p>
          <h2
            className="font-black"
            style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}
          >
            {language === 'ko' ? '자주 묻는 질문' : 'Frequently Asked Questions'}
          </h2>
        </div>

        <div>
          {faqs.map((item, i) => (
            <AccordionItem
              key={i}
              q={item.q}
              a={item.a}
              open={openIdx === i}
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
