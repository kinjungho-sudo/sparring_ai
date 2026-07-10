'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

const PAINS = [
  {
    ko: '혼자 생각하면 결론이 계속 바뀐다',
    en: 'I keep going back and forth on my own',
  },
  {
    ko: '주변 사람들은 내 편 아니면 무관심이다',
    en: 'People around me are either biased or uninterested',
  },
  {
    ko: '"어떻게 생각해?"라고 물어보기가 눈치 보인다',
    en: 'It feels awkward to keep asking others for opinions',
  },
  {
    ko: '찬반 자료를 직접 찾아보기엔 시간이 없다',
    en: 'I don\'t have time to research both sides myself',
  },
  {
    ko: '결정 후에도 "혹시 틀린 건 아닐까?" 불안하다',
    en: 'Even after deciding, I second-guess myself',
  },
]

export default function PainPointSection() {
  const { language, t } = useLanguage()

  return (
    <section className="py-12 sm:py-24 px-4 sm:px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">

          {/* 왼쪽: 문제 공감 */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
              {t('이런 경험, 있으신가요?', 'SOUND FAMILIAR?')}
            </p>
            <h2 className="font-black mb-6 leading-tight"
              style={{ fontSize: 'clamp(24px, 3vw, 38px)', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {language === 'ko' ? (
                <>중요한 결정일수록<br /><span style={{ color: '#ef4444' }}>더 모르겠습니다</span></>
              ) : (
                <>The bigger the decision,<br /><span style={{ color: '#ef4444' }}>the harder it gets</span></>
              )}
            </h2>
            <div className="space-y-3">
              {PAINS.map((pain, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-sm">😔</span>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                    {language === 'ko' ? pain.ko : pain.en}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 오른쪽: 해결 */}
          <div>
            <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'rgba(99,102,241,0.3)' }}>
              <div className="text-3xl mb-4">⚡</div>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
                {t('스파링 AI의 해답', 'THE SPARRING AI WAY')}
              </p>
              <h3 className="font-black mb-3 text-xl" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                {t('혼자 고민하지 마세요', 'Stop overthinking alone')}
              </h3>
              <div className="space-y-3 mb-6">
                {[
                  {
                    ko: '🔴 RED AI가 찬성 근거를 전부 가져옵니다',
                    en: '🔴 RED AI brings every pro argument',
                  },
                  {
                    ko: '🔵 BLUE AI가 반대 근거를 전부 가져옵니다',
                    en: '🔵 BLUE AI brings every con argument',
                  },
                  {
                    ko: '⚖️ 사회자 AI가 팩트를 검증합니다',
                    en: '⚖️ Host AI fact-checks in real time',
                  },
                  {
                    ko: '📊 토론 후 중립적 리포트를 받습니다',
                    en: '📊 You get a neutral report afterward',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {language === 'ko' ? item.ko : item.en}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/debate/new"
                className="flex items-center justify-center w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all hover:scale-[1.01]"
              >
                {t('지금 고민 해결하기 →', 'Solve my dilemma →')}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
