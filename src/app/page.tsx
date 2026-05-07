import HeroSection from '@/components/landing/HeroSection'
import DemoSection from '@/components/landing/DemoSection'
import PainPointSection from '@/components/landing/PainPointSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import TestimonialSection from '@/components/landing/TestimonialSection'
import PricingSection from '@/components/landing/PricingSection'
import FAQSection from '@/components/landing/FAQSection'

export default function HomePage() {
  return (
    <>
      {/* 1. 히어로 — "결론이 안 나는 고민이 있나요?" */}
      <HeroSection />

      {/* 2. 데모 — 30초 만에 서비스가 뭔지 보여줌 */}
      <section id="demo"><DemoSection /></section>

      {/* 3. 문제 공감 — "이런 상황인가요?" → 해결책 */}
      <PainPointSection />

      {/* 4. 작동 방식 — 3단계 */}
      <section id="how-it-works"><HowItWorksSection /></section>

      {/* 5. 후기 + 신뢰 지표 */}
      <TestimonialSection />

      {/* 6. 가격 */}
      <section id="pricing"><PricingSection /></section>

      {/* 7. FAQ */}
      <section id="faq"><FAQSection /></section>
    </>
  )
}
