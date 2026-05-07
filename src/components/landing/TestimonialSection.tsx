'use client'

import { useLanguage } from '@/contexts/LanguageContext'

const TESTIMONIALS = [
  {
    avatar: '👨‍💼',
    name: { ko: '스타트업 대표, 32세', en: 'Startup CEO, 32' },
    quote: {
      ko: '"창업 vs 취업을 고민했는데, 두 AI가 싸우는 걸 보면서 제가 진짜 원하는 게 뭔지 명확해졌어요. 그냥 혼자 생각했으면 절대 이 결론 못 냈을 것 같아요."',
      en: '"I was torn between starting up and getting a job. Watching the AIs fight it out clarified what I actually wanted. I never would have reached this conclusion on my own."',
    },
    tag: { ko: '창업 결정', en: 'Career decision' },
    color: '#6366f1',
  },
  {
    avatar: '👩‍🔬',
    name: { ko: '대학원생, 27세', en: 'Graduate student, 27' },
    quote: {
      ko: '"논문 주제 방향을 못 잡고 있었는데, 찬반 토론 형식으로 논거를 들으니까 생각지도 못했던 반론이 보였어요. 리포트를 지도교수님께 보여드렸더니 깜짝 놀라시더라고요."',
      en: '"I was stuck on my thesis direction. Seeing arguments both ways showed me counterarguments I hadn\'t considered. My supervisor was genuinely surprised by the report."',
    },
    tag: { ko: '학술 결정', en: 'Academic decision' },
    color: '#a78bfa',
  },
  {
    avatar: '👨‍👩‍👧',
    name: { ko: '직장인, 38세', en: 'Office worker, 38' },
    quote: {
      ko: '"이직 고민을 친구들한테 물어보면 다 제 편만 드는데, AI는 정말 냉정하게 반대 이유도 말해줘서 오히려 도움이 됐어요. 결국 이직 안 했는데 지금은 잘한 것 같아요."',
      en: '"Friends always took my side when I asked about switching jobs, but the AI gave cold, honest counterarguments. I ended up staying — and I\'m glad I did."',
    },
    tag: { ko: '이직 결정', en: 'Career change' },
    color: '#22c55e',
  },
]

export default function TestimonialSection() {
  const { language } = useLanguage()

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>TESTIMONIALS</p>
          <h2 className="font-black" style={{ fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            {language === 'ko' ? '실제 사용자 후기' : 'What users say'}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="p-6 rounded-2xl border flex flex-col"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              {/* 태그 */}
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full self-start mb-4"
                style={{ backgroundColor: `${t.color}18`, color: t.color }}>
                {language === 'ko' ? t.tag.ko : t.tag.en}
              </span>
              {/* 인용 */}
              <p className="text-sm leading-relaxed flex-1 mb-5"
                style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                {language === 'ko' ? t.quote.ko : t.quote.en}
              </p>
              {/* 작성자 */}
              <div className="flex items-center gap-2 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xl">{t.avatar}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {language === 'ko' ? t.name.ko : t.name.en}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 신뢰 지표 바 */}
        <div className="mt-12 p-6 rounded-2xl border flex flex-wrap justify-around gap-6 text-center"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          {[
            { value: '1,200+', label: { ko: '누적 토론', en: 'Debates held' } },
            { value: '94%', label: { ko: '결정에 도움됐다', en: 'Found it helpful' } },
            { value: '3분', label: { ko: '평균 첫 라운드', en: 'Avg first round' } },
            { value: '무료', label: { ko: '영원히 기본 플랜', en: 'Free tier forever' } },
          ].map((stat) => (
            <div key={stat.value}>
              <p className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {language === 'ko' ? stat.label.ko : stat.label.en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
