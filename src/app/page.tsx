import { FAQSchema } from '@/components/seo/FAQSchema'
import HeroSection from '@/components/landing/HeroSection'
import PainPointSection from '@/components/landing/PainPointSection'
import PricingSection from '@/components/landing/PricingSection'
import FAQSection from '@/components/landing/FAQSection'
import WaitlistSection from '@/components/landing/WaitlistSection'

export default function HomePage() {
  return (
    <>
      <FAQSchema />
      {/* 1. 히어로 — 좌측 카피 + 우측 라이브 데모 */}
      <HeroSection />

      {/* 2. 문제 공감 — "이런 상황인가요?" → 해결책 */}
      <PainPointSection />

      {/* 4. 가격 */}
      <section id="pricing"><PricingSection /></section>

      {/* 6. FAQ */}
      <section id="faq"><FAQSection /></section>

      {/* 7. 얼리버드 웨이트리스트 CTA */}
      <WaitlistSection />
    </>
  )
}
