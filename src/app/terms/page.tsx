import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이용약관',
}

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
        이용약관
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>최종 업데이트: 2026년 5월</p>

      <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>제1조 (목적)</h2>
          <p>이 약관은 코마인드웍스(이하 "회사")가 운영하는 스파링 AI(sparring-ai.vercel.app, 이하 "서비스") 이용에 관한 조건 및 절차를 규정함을 목적으로 합니다.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>제2조 (서비스 내용)</h2>
          <p>서비스는 AI 찬반 토론을 통해 사용자의 의사결정을 보조하는 AI 코칭 서비스를 제공합니다. 무료 플랜은 하루 3회 토론이 제공됩니다.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>제3조 (이용 제한)</h2>
          <ul className="ml-4 space-y-1 list-disc">
            <li>타인에게 피해를 주거나 법령에 위반되는 목적의 이용 금지</li>
            <li>서비스 시스템을 의도적으로 방해하는 행위 금지</li>
            <li>상업적 목적의 무단 크롤링 금지</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>제4조 (면책 조항)</h2>
          <p>스파링 AI가 제공하는 AI 토론 결과는 참고 자료이며, 최종 의사결정의 책임은 사용자에게 있습니다. 회사는 AI 응답의 정확성을 보장하지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>제5조 (문의)</h2>
          <p>이용약관 관련 문의는 아래로 연락 주세요.</p>
          <p className="mt-1">이메일: kinjungho@gmail.com</p>
        </section>
      </div>
    </div>
  )
}
