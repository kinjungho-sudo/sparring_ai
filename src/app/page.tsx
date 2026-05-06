import HeroSection from '@/components/landing/HeroSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import PricingSection from '@/components/landing/PricingSection'
import SampleDebateSection from '@/components/landing/SampleDebateSection'
import FAQSection from '@/components/landing/FAQSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <section id="sample"><SampleDebateSection /></section>
      <section id="how-it-works"><HowItWorksSection /></section>
      <section id="pricing"><PricingSection /></section>
      <section id="faq"><FAQSection /></section>
    </>
  )
}
