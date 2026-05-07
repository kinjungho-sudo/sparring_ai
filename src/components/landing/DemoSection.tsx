'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

// YouTube 영상 ID가 생기면 여기에 입력
const DEMO_VIDEO_ID = ''

// ──────────────────────────────────────────────
// 토론 스크립트
// ──────────────────────────────────────────────
type Speaker = 'red' | 'blue' | 'host' | 'verdict'

interface Message {
  speaker: Speaker
  ko: string
  en: string
  delay: number   // 이전 메시지 등장 후 대기 ms
  typing: number  // 타이핑 연출 ms (0 = 즉시)
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
    delay: 600,
    typing: 900,
  },
  {
    speaker: 'blue',
    ko: '단일 실험을 과도하게 일반화하고 있습니다. 제조·서비스업엔 적용 자체가 불가능하고, 동일 업무를 4일에 압축하면 스트레스가 오히려 증가합니다.',
    en: 'Overgeneralizing one experiment. Manufacturing and service sectors can\'t adapt — same workload in 4 days raises stress.',
    delay: 700,
    typing: 1000,
  },
  {
    speaker: 'red',
    ko: '업종 차이는 인정합니다. 그러나 현대 지식 경제에선 절반 이상의 일자리가 4일제 전환이 가능하고, 20개국 파일럿 모두 순이익을 보고했습니다.',
    en: 'Granted — but in a knowledge economy, over half of jobs can adapt. Every pilot across 20 countries reported net gains.',
    delay: 600,
    typing: 1000,
  },
  {
    speaker: 'blue',
    ko: '"20개국 파일럿"은 자발적 참여 기업 위주라 생존편향이 심합니다. 실패한 기업은 데이터에 포함되지 않았습니다.',
    en: '"20-country pilot" relied on self-selected companies — severe survivorship bias. Failed firms never submitted data.',
    delay: 700,
    typing: 950,
  },
  {
    speaker: 'host',
    ko: '⚖️ 팩트체크: "20개국 파일럿"은 4 Day Week Global 2022 연구 기준. 참여 기업 자발 지원 방식으로 대표성 한계 인정됨.',
    en: '⚖️ Fact-check: "20-country pilot" = 4 Day Week Global 2022. Self-selected participation — representativeness limitation acknowledged.',
    delay: 500,
    typing: 800,
  },
  {
    speaker: 'red',
    ko: '편향을 감안해도 참여 기업의 91%가 도입 유지를 선택했습니다. 이 수치는 통계적으로 유의미합니다.',
    en: 'Despite that bias, 91% of participating companies chose to maintain 4-day weeks — statistically significant.',
    delay: 600,
    typing: 850,
  },
  {
    speaker: 'blue',
    ko: '유지율이 높아도 비참여 기업 대비 통제 실험이 아닙니다. 진짜 인과관계를 증명하려면 무작위 배정 연구가 필요합니다.',
    en: 'High retention doesn\'t prove causation vs. non-participants. A proper RCT is needed to establish the real effect.',
    delay: 700,
    typing: 900,
  },
  {
    speaker: 'host',
    ko: '⚖️ 팩트체크: 현재까지 4일제에 대한 무작위 대조 연구(RCT)는 진행된 바 없음. BLUE의 지적은 방법론상 유효.',
    en: '⚖️ Fact-check: No RCT on 4-day weeks exists to date. BLUE\'s methodological critique is valid.',
    delay: 500,
    typing: 800,
  },
  {
    speaker: 'verdict',
    ko: '',
    en: '',
    delay: 800,
    typing: 0,
  },
]

const VERDICT = {
  winner: { ko: '🔵 BLUE 우세', en: '🔵 BLUE leads' },
  summary: {
    ko: '증거의 인과적 강도 면에서 BLUE가 우세합니다. 4일제의 긍정적 효과는 현실적이나, 현재 증거는 상관관계 수준에 머물러 있습니다. 도입 결정 전 업종·직군별 검토가 필수적입니다.',
    en: 'BLUE wins on causal evidence strength. The 4-day week\'s positive effects are real, but current evidence remains correlational. Industry-specific review is essential before adoption.',
  },
  red: { ko: '긍정적 케이스 다수·유지율 높음', en: 'Strong positive cases, high retention' },
  blue: { ko: 'RCT 부재·생존편향 지적', en: 'No RCT, survivorship bias' },
}

// ──────────────────────────────────────────────
// 서브 컴포넌트: 메시지 버블
// ──────────────────────────────────────────────
function Bubble({ msg, lang, isTyping }: { msg: Message; lang: 'ko' | 'en'; isTyping: boolean }) {
  const text = lang === 'ko' ? msg.ko : msg.en

  if (msg.speaker === 'host') {
    return (
      <div className="animate-in fade-in duration-400 mx-1">
        <div className="px-4 py-2.5 rounded-xl text-xs font-medium text-center"
          style={{ backgroundColor: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', color: '#ca8a04' }}>
          {isTyping ? <TypingDots /> : text}
        </div>
      </div>
    )
  }

  const isRed = msg.speaker === 'red'
  return (
    <div className={`flex ${isRed ? 'justify-start' : 'justify-end'} animate-in ${isRed ? 'slide-in-from-left-3' : 'slide-in-from-right-3'} duration-400`}>
      <div className="max-w-[82%]">
        <p className={`text-[10px] font-black mb-1 ${isRed ? '' : 'text-right'}`}
          style={{ color: isRed ? '#ef4444' : '#3b82f6' }}>
          {isRed ? `🔴 RED · ${lang === 'ko' ? '찬성' : 'PRO'}` : `🔵 BLUE · ${lang === 'ko' ? '반대' : 'CON'}`}
        </p>
        <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
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

function VerdictCard({ lang }: { lang: 'ko' | 'en' }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-600 mx-1">
      <div className="p-4 rounded-2xl border"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'rgba(99,102,241,0.4)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
            📊 {lang === 'ko' ? '토론 최종 결과' : 'FINAL VERDICT'}
          </span>
          <span className="text-sm font-black px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
            {lang === 'ko' ? VERDICT.winner.ko : VERDICT.winner.en}
          </span>
        </div>
        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          {lang === 'ko' ? VERDICT.summary.ko : VERDICT.summary.en}
        </p>
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.07)', color: '#ef4444' }}>
            <span className="font-black block mb-0.5">🔴 {lang === 'ko' ? '찬성 요약' : 'PRO'}</span>
            {lang === 'ko' ? VERDICT.red.ko : VERDICT.red.en}
          </div>
          <div className="flex-1 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: 'rgba(59,130,246,0.07)', color: '#3b82f6' }}>
            <span className="font-black block mb-0.5">🔵 {lang === 'ko' ? '반대 요약' : 'CON'}</span>
            {lang === 'ko' ? VERDICT.blue.ko : VERDICT.blue.en}
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────────
export default function DemoSection() {
  const { language, t } = useLanguage()
  const lang = language === 'ko' ? 'ko' : 'en'

  const [visible, setVisible] = useState(false)
  const [shownCount, setShownCount] = useState(0)   // 현재까지 표시된 메시지 수
  const [typingIdx, setTypingIdx] = useState<number | null>(null) // 현재 타이핑 중인 인덱스

  const sectionRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 뷰포트 진입 감지
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.25 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // 메시지 순차 등장
  useEffect(() => {
    if (!visible) return
    if (shownCount >= SCRIPT.length) {
      // 전체 표시 완료 → 3.5초 후 리셋 루프
      timerRef.current = setTimeout(() => {
        setShownCount(0)
        setTypingIdx(null)
      }, 3500)
      return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }

    const msg = SCRIPT[shownCount]

    // delay 후 타이핑 시작
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
  }, [visible, shownCount])

  // 새 메시지 추가 시 자동 스크롤
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [shownCount, typingIdx])

  const displayedMessages = SCRIPT.slice(0, shownCount)
  const currentlyTyping = typingIdx !== null ? SCRIPT[typingIdx] : null

  // YouTube ID 있으면 영상 표시
  if (DEMO_VIDEO_ID) {
    return <YouTubeDemo id={DEMO_VIDEO_ID} t={t} />
  }

  return (
    <section ref={sectionRef} id="demo" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>DEMO</p>
          <h2 className="font-black mb-4" style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            {t('30초 만에 체험하기', 'See it live')}
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t(
              'AI 두 명이 실시간으로 토론하고 사회자가 팩트를 검증합니다. 결론까지 자동으로 도출됩니다.',
              'Two AIs debate in real time while a host fact-checks. A final verdict is generated automatically.'
            )}
          </p>
        </div>

        {/* 토론 창 */}
        <div className="rounded-2xl border overflow-hidden shadow-xl" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>

          {/* 상단 바 */}
          <div className="px-5 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                {t('스파링 AI · 라이브 토론', 'Sparring AI · Live Debate')}
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
            <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--accent)' }}>TOPIC</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {lang === 'ko' ? TOPIC.ko : TOPIC.en}
            </p>
          </div>

          {/* 메시지 영역 */}
          <div ref={scrollRef} className="p-5 space-y-4 overflow-y-auto" style={{ minHeight: '300px', maxHeight: '420px' }}>
            {displayedMessages.map((msg, i) => (
              msg.speaker === 'verdict'
                ? <VerdictCard key={i} lang={lang} />
                : <Bubble key={i} msg={msg} lang={lang} isTyping={false} />
            ))}
            {/* 타이핑 중인 버블 */}
            {currentlyTyping && currentlyTyping.speaker !== 'verdict' && (
              <Bubble msg={currentlyTyping} lang={lang} isTyping={true} />
            )}
          </div>

          {/* 하단 상태 바 */}
          <div className="px-5 py-3 border-t flex items-center justify-between"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex gap-1">
              {SCRIPT.filter(m => m.speaker !== 'verdict').map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i < shownCount ? '#22c55e' : typingIdx === i ? 'var(--accent)' : 'var(--border)',
                  }} />
              ))}
            </div>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
              {shownCount >= SCRIPT.length
                ? t('✓ 토론 완료 · 리포트 생성됨', '✓ Debate complete · Report ready')
                : typingIdx !== null && SCRIPT[typingIdx].speaker === 'host'
                  ? t('⚖️ 팩트체크 중...', '⚖️ Fact-checking...')
                  : typingIdx !== null
                    ? SCRIPT[typingIdx].speaker === 'red'
                      ? t('🔴 RED 발언 중...', '🔴 RED arguing...')
                      : t('🔵 BLUE 반론 중...', '🔵 BLUE countering...')
                    : t('다음 발언 대기 중...', 'Waiting for next round...')}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            {t('위는 실제 서비스 화면입니다. 어떤 주제든 즉시 시작됩니다.', 'This is the real UI. Any topic starts instantly.')}
          </p>
          <Link
            href="/debate/new"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all hover:scale-[1.02]"
          >
            ⚡ {t('내 고민으로 직접 해보기 →', 'Try with my own topic →')}
          </Link>
        </div>
      </div>
    </section>
  )
}

// YouTube 영상이 있을 때 표시
function YouTubeDemo({ id, t }: { id: string; t: (ko: string, en: string) => string }) {
  const [playing, setPlaying] = useState(false)
  return (
    <section id="demo" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)', aspectRatio: '16/9' }}>
          {!playing ? (
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer group"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
              onClick={() => setPlaying(true)}>
              <img src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`} alt="demo"
                className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: 'rgba(99,102,241,0.9)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                </div>
                <span className="text-sm font-bold text-white">{t('데모 영상 재생', 'Play demo')}</span>
              </div>
            </div>
          ) : (
            <iframe src={`https://www.youtube.com/embed/${id}?autoplay=1`}
              className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
          )}
        </div>
      </div>
    </section>
  )
}
