'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

type Phase = 'typing' | 'red' | 'blue' | 'fact' | 'report' | 'done'

const TOPIC = {
  ko: '이직해야 할까? 연봉 30% 오르는 오퍼가 왔는데...',
  en: 'Should I switch jobs? Got a 30% raise offer...',
}

const RED_MSG = {
  ko: '연봉 30% 상승은 단순 숫자가 아닙니다. 복리 효과로 10년 뒤 자산 차이는 수억이며, 새 환경이 주는 성장 기회도 큽니다.',
  en: 'A 30% raise is huge compounded over 10 years. New environment brings fresh growth opportunities you can\'t get staying put.',
}

const BLUE_MSG = {
  ko: '현 직장의 암묵적 가치를 과소평가하고 있습니다. 신뢰 자본, 안정성, 숨겨진 복지 — 이직 6개월 후 후회하는 케이스가 42%입니다.',
  en: 'You\'re undervaluing your current job\'s hidden worth. Trust, stability, unspoken perks — 42% regret switching within 6 months.',
}

const FACT_MSG = {
  ko: '⚖️ 사회자: "42%" 수치는 2022 LinkedIn 설문 기준. 직군별 편차 큼. 재직 중 이직 탐색이 협상력 최대화.',
  en: '⚖️ Host: The "42%" stat is from 2022 LinkedIn survey — varies by field. Job-searching while employed maximizes leverage.',
}

const REPORT = {
  verdict: { ko: '🔵 BLUE 우세', en: '🔵 BLUE leads' },
  summary: {
    ko: '단기 연봉보다 장기 커리어 경로 검토 필요. 현 직장 재협상 또는 추가 오퍼 확보 후 결정 권장.',
    en: 'Prioritize long-term career path over short-term pay. Recommend renegotiating or securing competing offers first.',
  },
  pros: { ko: '연봉 인상·성장 환경', en: 'Higher pay & new growth' },
  cons: { ko: '안정성·네트워크 손실 위험', en: 'Stability & network risk' },
}

const PHASE_DURATIONS: Record<Phase, number> = {
  typing: 1800,
  red: 2200,
  blue: 2200,
  fact: 1800,
  report: 3000,
  done: 2000,
}

const PHASE_ORDER: Phase[] = ['typing', 'red', 'blue', 'fact', 'report', 'done']

export default function HowItWorksSection() {
  const { language, t } = useLanguage()
  const [phase, setPhase] = useState<Phase>('typing')
  const [typedLen, setTypedLen] = useState(0)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const topic = language === 'ko' ? TOPIC.ko : TOPIC.en

  // Intersection observer — start animation when section enters viewport
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Phase progression
  useEffect(() => {
    if (!visible) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const idx = PHASE_ORDER.indexOf(phase)
      if (phase === 'done') {
        // restart loop
        setTypedLen(0)
        setPhase('typing')
      } else {
        setPhase(PHASE_ORDER[idx + 1])
      }
    }, PHASE_DURATIONS[phase])
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [phase, visible])

  // Typewriter effect during typing phase
  useEffect(() => {
    if (phase !== 'typing' || !visible) return
    setTypedLen(0)
    let i = 0
    const interval = setInterval(() => {
      i++
      setTypedLen(i)
      if (i >= topic.length) clearInterval(interval)
    }, Math.floor(1600 / topic.length))
    return () => clearInterval(interval)
  }, [phase, visible, topic])

  const showRed = ['red', 'blue', 'fact', 'report', 'done'].includes(phase)
  const showBlue = ['blue', 'fact', 'report', 'done'].includes(phase)
  const showFact = ['fact', 'report', 'done'].includes(phase)
  const showReport = ['report', 'done'].includes(phase)

  return (
    <section ref={sectionRef} id="how-it-works" className="py-24 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>HOW IT WORKS</p>
          <h2 className="font-black mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            {t('이렇게 작동합니다', 'See it happen live')}
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t('주제를 입력하면 AI 두 명이 즉시 논쟁을 시작합니다.', 'Enter a topic and two AIs start arguing immediately.')}
          </p>
        </div>

        {/* Animation window */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>

          {/* Header bar */}
          <div className="px-5 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                {t('스파링 AI 실시간 토론', 'Sparring AI · Live')}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>🔴 RED</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>vs</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>🔵 BLUE</span>
            </div>
          </div>

          {/* Content area */}
          <div className="p-5 space-y-4 min-h-[340px]">

            {/* Phase 1: topic input */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {t('의제', 'TOPIC')}
              </span>
              <div className="px-4 py-3 rounded-xl border text-sm font-medium"
                style={{ borderColor: 'rgba(99,102,241,0.4)', backgroundColor: 'rgba(99,102,241,0.06)', color: 'var(--text-primary)', minHeight: '44px' }}>
                {phase === 'typing' ? topic.slice(0, typedLen) : topic}
                {phase === 'typing' && (
                  <span className="inline-block w-0.5 h-4 ml-0.5 bg-indigo-400 animate-pulse align-middle" />
                )}
              </div>
            </div>

            {/* Phase 2: RED */}
            {showRed && (
              <div className="flex justify-start animate-in slide-in-from-left-4 duration-500">
                <div className="max-w-[85%]">
                  <p className="text-[10px] font-black mb-1" style={{ color: '#ef4444' }}>🔴 RED — {t('찬성', 'PRO')}</p>
                  <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                    style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.2)', color: 'var(--text-primary)' }}>
                    {language === 'ko' ? RED_MSG.ko : RED_MSG.en}
                  </div>
                </div>
              </div>
            )}

            {/* Phase 3: BLUE */}
            {showBlue && (
              <div className="flex justify-end animate-in slide-in-from-right-4 duration-500">
                <div className="max-w-[85%]">
                  <p className="text-[10px] font-black mb-1 text-right" style={{ color: '#3b82f6' }}>🔵 BLUE — {t('반대', 'CON')}</p>
                  <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                    style={{ backgroundColor: 'rgba(59,130,246,0.08)', border: '1.5px solid rgba(59,130,246,0.2)', color: 'var(--text-primary)' }}>
                    {language === 'ko' ? BLUE_MSG.ko : BLUE_MSG.en}
                  </div>
                </div>
              </div>
            )}

            {/* Phase 4: Fact check */}
            {showFact && (
              <div className="animate-in fade-in duration-500">
                <div className="px-4 py-2.5 rounded-xl text-xs font-medium text-center"
                  style={{ backgroundColor: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', color: '#ca8a04' }}>
                  {language === 'ko' ? FACT_MSG.ko : FACT_MSG.en}
                </div>
              </div>
            )}

            {/* Phase 5: Report */}
            {showReport && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-600">
                <div className="p-4 rounded-2xl border"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'rgba(99,102,241,0.35)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                      📊 {t('토론 리포트', 'DEBATE REPORT')}
                    </span>
                    <span className="text-sm font-black px-3 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                      {language === 'ko' ? REPORT.verdict.ko : REPORT.verdict.en}
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                    {language === 'ko' ? REPORT.summary.ko : REPORT.summary.en}
                  </p>
                  <div className="flex gap-3">
                    <div className="flex-1 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.07)', color: '#ef4444' }}>
                      <span className="font-black block mb-0.5">🔴 {t('찬성 핵심', 'PRO KEY')}</span>
                      {language === 'ko' ? REPORT.pros.ko : REPORT.pros.en}
                    </div>
                    <div className="flex-1 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: 'rgba(59,130,246,0.07)', color: '#3b82f6' }}>
                      <span className="font-black block mb-0.5">🔵 {t('반대 핵심', 'CON KEY')}</span>
                      {language === 'ko' ? REPORT.cons.ko : REPORT.cons.en}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Phase indicator footer */}
          <div className="px-5 py-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            {(['typing', 'red', 'blue', 'fact', 'report'] as Phase[]).map((p, i) => (
              <div key={p} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: phase === p ? 'var(--accent)' :
                      PHASE_ORDER.indexOf(phase) > PHASE_ORDER.indexOf(p) ? '#22c55e' : 'var(--border)',
                  }} />
                {i < 4 && <div className="w-4 h-px" style={{ backgroundColor: 'var(--border)' }} />}
              </div>
            ))}
            <span className="ml-2 text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
              {phase === 'typing' && t('의제 입력 중...', 'Entering topic...')}
              {phase === 'red' && t('RED AI 발언 중...', 'RED AI arguing...')}
              {phase === 'blue' && t('BLUE AI 반론 중...', 'BLUE AI countering...')}
              {phase === 'fact' && t('사회자 팩트체크 중...', 'Host fact-checking...')}
              {(phase === 'report' || phase === 'done') && t('✓ 리포트 완성', '✓ Report ready')}
            </span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/debate/new"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all hover:scale-[1.02]"
          >
            ⚡ {t('지금 바로 시작하기', "Start now — it's free")}
          </Link>
        </div>
      </div>
    </section>
  )
}
