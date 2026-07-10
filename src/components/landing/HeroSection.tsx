'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

// ── 토론 스크립트 ────────────────────────────────────────────────
type Speaker = 'red' | 'blue' | 'host' | 'verdict'

interface Message {
  speaker: Speaker
  ko: string
  en: string
  delay: number
  typing: number
}

const TOPIC = {
  ko: '"주 4일제 근무는 생산성을 높인다"',
  en: '"A 4-day work week improves productivity"',
}

const SCRIPT: Message[] = [
  {
    speaker: 'red',
    ko: '마이크로소프트 일본 법인 실험에서 생산성이 40% 향상됐고, 번아웃 감소로 창의적 업무 효율도 크게 올랐습니다.',
    en: 'Microsoft Japan saw a 40% productivity jump. Reduced burnout significantly boosted creative output.',
    delay: 1000, typing: 2200,
  },
  {
    speaker: 'blue',
    ko: '단일 실험을 과도하게 일반화하고 있습니다. 제조·서비스업엔 적용 자체가 불가능하고, 동일 업무를 4일에 압축하면 스트레스가 오히려 증가합니다.',
    en: "Overgeneralizing one experiment. Manufacturing and service sectors can't adapt — same workload in 4 days raises stress.",
    delay: 1200, typing: 2500,
  },
  {
    speaker: 'red',
    ko: '업종 차이는 인정합니다. 그러나 현대 지식 경제에선 절반 이상의 일자리가 4일제 전환이 가능하고, 20개국 파일럿 모두 순이익을 보고했습니다.',
    en: 'Granted — but in a knowledge economy, over half of jobs can adapt. Every pilot across 20 countries reported net gains.',
    delay: 1200, typing: 2500,
  },
  {
    speaker: 'blue',
    ko: '"20개국 파일럿"은 자발적 참여 기업 위주라 생존편향이 심합니다. 실패한 기업은 데이터에 포함되지 않았습니다.',
    en: '"20-country pilot" relied on self-selected companies — severe survivorship bias. Failed firms never submitted data.',
    delay: 1200, typing: 2300,
  },
  {
    speaker: 'host',
    ko: '⚖️ 팩트체크: "20개국 파일럿"은 4 Day Week Global 2022 연구 기준. 참여 기업 자발 지원 방식으로 대표성 한계 인정됨.',
    en: '⚖️ Fact-check: "20-country pilot" = 4 Day Week Global 2022. Self-selected participation — representativeness limitation acknowledged.',
    delay: 1000, typing: 2000,
  },
  {
    speaker: 'red',
    ko: '편향을 감안해도 참여 기업의 91%가 도입 유지를 선택했습니다. 이 수치는 통계적으로 유의미합니다.',
    en: 'Despite that bias, 91% of participating companies chose to maintain 4-day weeks — statistically significant.',
    delay: 1200, typing: 2100,
  },
  {
    speaker: 'blue',
    ko: '유지율이 높아도 비참여 기업 대비 통제 실험이 아닙니다. 진짜 인과관계를 증명하려면 무작위 배정 연구가 필요합니다.',
    en: "High retention doesn't prove causation vs. non-participants. A proper RCT is needed to establish the real effect.",
    delay: 1200, typing: 2200,
  },
  {
    speaker: 'host',
    ko: '⚖️ 팩트체크: 현재까지 4일제에 대한 무작위 대조 연구(RCT)는 진행된 바 없음. BLUE의 지적은 방법론상 유효.',
    en: "⚖️ Fact-check: No RCT on 4-day weeks exists to date. BLUE's methodological critique is valid.",
    delay: 1000, typing: 2000,
  },
  { speaker: 'verdict', ko: '', en: '', delay: 1500, typing: 0 },
]

const VERDICT = {
  winner: { ko: '🔵 BLUE 우세', en: '🔵 BLUE leads' },
  summary: {
    ko: '증거의 인과적 강도 면에서 BLUE가 우세합니다. 4일제의 긍정적 효과는 현실적이나, 현재 증거는 상관관계 수준에 머물러 있습니다.',
    en: "BLUE wins on causal evidence strength. The 4-day week's positive effects are real, but current evidence remains correlational.",
  },
  red: { ko: '긍정적 케이스 다수·유지율 높음', en: 'Strong positive cases, high retention' },
  blue: { ko: 'RCT 부재·생존편향 지적', en: 'No RCT, survivorship bias' },
}

// ── 서브 컴포넌트 ─────────────────────────────────────────────────
function TypingDots({ color = '#888' }: { color?: string }) {
  return (
    <span className="flex items-center gap-1 h-4">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ backgroundColor: color, animationDelay: `${i * 150}ms` }} />
      ))}
    </span>
  )
}

function Bubble({ msg, lang, isTyping }: { msg: Message; lang: 'ko' | 'en'; isTyping: boolean }) {
  const text = lang === 'ko' ? msg.ko : msg.en

  if (msg.speaker === 'host') {
    return (
      <div className="animate-in fade-in duration-400 mx-1">
        <div className="px-3 py-2 rounded-xl text-xs font-medium text-center"
          style={{ backgroundColor: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', color: '#ca8a04' }}>
          {isTyping ? <TypingDots color="#ca8a04" /> : text}
        </div>
      </div>
    )
  }

  const isRed = msg.speaker === 'red'
  return (
    <div className={`flex ${isRed ? 'justify-start' : 'justify-end'} animate-in ${isRed ? 'slide-in-from-left-3' : 'slide-in-from-right-3'} duration-400`}>
      <div className="max-w-[85%]">
        <p className={`text-[10px] font-black mb-1 ${isRed ? '' : 'text-right'}`}
          style={{ color: isRed ? '#ef4444' : '#3b82f6' }}>
          {isRed
            ? `🔴 RED · ${lang === 'ko' ? '찬성' : 'PRO'}`
            : `🔵 BLUE · ${lang === 'ko' ? '반대' : 'CON'}`}
        </p>
        <div className="px-3 py-2.5 rounded-2xl text-xs leading-relaxed"
          style={{
            backgroundColor: isRed ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)',
            border: `1.5px solid ${isRed ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`,
            color: 'var(--text-primary)',
          }}>
          {isTyping ? <TypingDots color={isRed ? '#ef4444' : '#3b82f6'} /> : text}
        </div>
      </div>
    </div>
  )
}

function VerdictCard({ lang }: { lang: 'ko' | 'en' }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-600 mx-1">
      <div className="p-3 rounded-2xl border"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'rgba(99,102,241,0.4)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            📊 {lang === 'ko' ? '토론 최종 결과' : 'FINAL VERDICT'}
          </span>
          <span className="text-xs font-black px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
            {lang === 'ko' ? VERDICT.winner.ko : VERDICT.winner.en}
          </span>
        </div>
        <p className="text-xs mb-2.5" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          {lang === 'ko' ? VERDICT.summary.ko : VERDICT.summary.en}
        </p>
        <div className="flex gap-2">
          <div className="flex-1 px-2.5 py-1.5 rounded-lg text-[10px]" style={{ backgroundColor: 'rgba(239,68,68,0.07)', color: '#ef4444' }}>
            <span className="font-black block mb-0.5">🔴 {lang === 'ko' ? '찬성' : 'PRO'}</span>
            {lang === 'ko' ? VERDICT.red.ko : VERDICT.red.en}
          </div>
          <div className="flex-1 px-2.5 py-1.5 rounded-lg text-[10px]" style={{ backgroundColor: 'rgba(59,130,246,0.07)', color: '#3b82f6' }}>
            <span className="font-black block mb-0.5">🔵 {lang === 'ko' ? '반대' : 'CON'}</span>
            {lang === 'ko' ? VERDICT.blue.ko : VERDICT.blue.en}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────
export default function HeroSection() {
  const { language, t } = useLanguage()
  const lang = language === 'ko' ? 'ko' : 'en'

  const [shownCount, setShownCount] = useState(0)
  const [typingIdx, setTypingIdx] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 컴포넌트 마운트 즉시 시작 (히어로에 있으므로 항상 보임)
  useEffect(() => {
    if (shownCount >= SCRIPT.length) {
      timerRef.current = setTimeout(() => {
        setShownCount(0)
        setTypingIdx(null)
      }, 6000)
      return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }

    const msg = SCRIPT[shownCount]
    timerRef.current = setTimeout(() => {
      if (msg.typing > 0) {
        setTypingIdx(shownCount)
        timerRef.current = setTimeout(() => {
          setTypingIdx(null)
          setShownCount(n => n + 1)
        }, msg.typing)
      } else {
        setShownCount(n => n + 1)
      }
    }, msg.delay)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [shownCount])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [shownCount, typingIdx])

  const displayedMessages = SCRIPT.slice(0, shownCount)
  const currentlyTyping = typingIdx !== null ? SCRIPT[typingIdx] : null

  const statusText = shownCount >= SCRIPT.length
    ? t('✓ 토론 완료 · 리포트 생성됨', '✓ Debate complete · Report ready')
    : typingIdx !== null && SCRIPT[typingIdx].speaker === 'host'
      ? t('⚖️ 팩트체크 중...', '⚖️ Fact-checking...')
      : typingIdx !== null
        ? SCRIPT[typingIdx].speaker === 'red'
          ? t('🔴 RED 발언 중...', '🔴 RED arguing...')
          : t('🔵 BLUE 반론 중...', '🔵 BLUE countering...')
        : t('다음 발언 대기 중...', 'Waiting for next round...')

  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden">
      {/* 배경 글로우 */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 80% at 30% 50%, rgba(99,102,241,0.1) 0%, transparent 65%)',
      }} />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)',
      }} />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
      }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">

        {/* ── 좌측: 텍스트 ── */}
        <div className="flex flex-col items-start">
          {/* 뱃지 */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-6"
            style={{ borderColor: 'rgba(99,102,241,0.3)', backgroundColor: 'rgba(99,102,241,0.08)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              {t('AI 토론 · 의사결정 보조', 'AI Debate · Decision Coach')}
            </span>
          </div>

          {/* 헤드라인 */}
          <h1 className="font-black tracking-tight mb-5 leading-tight text-left"
            style={{ fontSize: 'clamp(32px, 4.5vw, 64px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            {language === 'ko' ? (
              <>결론이 안 나는<br /><span style={{ color: 'var(--accent)' }}>고민</span>이 있나요?</>
            ) : (
              <>Stuck on a<br /><span style={{ color: 'var(--accent)' }}>tough decision?</span></>
            )}
          </h1>

          {/* 서브카피 */}
          <p className="text-base sm:text-lg mb-2 max-w-md" style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            {t(
              '두 AI가 찬반으로 맞붙습니다. 당신은 지켜보기만 하면 됩니다.',
              'Two AIs argue both sides. You just watch — and decide.'
            )}
          </p>
          <p className="text-sm mb-8 max-w-md" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
            {t(
              'RED AI가 찬성, BLUE AI가 반대 — 라운드마다 치열하게 격돌하고 사회자 AI가 팩트를 검증합니다.',
              'RED AI argues pro, BLUE AI argues con — round by round, with a host AI fact-checking live.'
            )}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link
              href="/debate/new"
              className="h-12 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
            >
              ⚡ {t('지금 무료로 시작', 'Start for free')}
            </Link>
            <a
              href="#how-it-works"
              className="h-12 px-7 rounded-xl border font-semibold text-sm transition-all hover:bg-white/5 inline-flex items-center justify-center gap-2"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              {t('서비스 소개 보기', 'How it works')} →
            </a>
          </div>

          {/* 신뢰 지표 */}
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              t('✓ 무료로 시작', '✓ Free to start'),
              t('✓ 신용카드 불필요', '✓ No credit card'),
              t('✓ 매일 5회 제공', '✓ 5 debates/day'),
            ].map((item) => (
              <span key={item} className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{item}</span>
            ))}
          </div>
        </div>

        {/* ── 우측: 라이브 데모 창 ── */}
        <div className="w-full flex flex-col" style={{ height: 'clamp(340px, 50vh, 680px)' }}>
          {/* 창 프레임 */}
          <div className="flex flex-col h-full rounded-2xl border shadow-2xl overflow-hidden"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(99,102,241,0.1)',
            }}>

            {/* 상단 타이틀 바 */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
              {/* 맥OS 닷 */}
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444', opacity: 0.8 }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b', opacity: 0.8 }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e', opacity: 0.8 }} />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  {t('스파링 AI · 라이브 토론', 'Sparring AI · Live Debate')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>🔴 RED</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>vs</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>🔵 BLUE</span>
              </div>
            </div>

            {/* 의제 바 */}
            <div className="px-4 py-2.5 border-b shrink-0"
              style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(99,102,241,0.04)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--accent)' }}>TOPIC</p>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {lang === 'ko' ? TOPIC.ko : TOPIC.en}
              </p>
            </div>

            {/* 메시지 영역 */}
            <div
              ref={scrollRef}
              className="flex-1 p-4 space-y-3.5 overflow-y-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              {displayedMessages.map((msg, i) => (
                msg.speaker === 'verdict'
                  ? <VerdictCard key={i} lang={lang} />
                  : <Bubble key={i} msg={msg} lang={lang} isTyping={false} />
              ))}
              {currentlyTyping && currentlyTyping.speaker !== 'verdict' && (
                <Bubble msg={currentlyTyping} lang={lang} isTyping={true} />
              )}
            </div>

            {/* 하단 상태 바 */}
            <div className="px-4 py-2.5 border-t shrink-0 flex items-center justify-between"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
              <div className="flex gap-1">
                {SCRIPT.filter(m => m.speaker !== 'verdict').map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: i < shownCount
                        ? '#22c55e'
                        : typingIdx === i
                          ? 'var(--accent)'
                          : 'var(--border)',
                    }} />
                ))}
              </div>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                {statusText}
              </span>
            </div>
          </div>

          {/* 창 아래 실제 서비스 문구 */}
          <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            {t('↑ 실제 서비스 화면 · 어떤 주제든 즉시 시작', '↑ Real UI · Any topic starts instantly')}
          </p>
        </div>
      </div>
    </section>
  )
}
