import HeroSection from '@/components/landing/HeroSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import PricingSection from '@/components/landing/PricingSection'
import SampleDebateSection from '@/components/landing/SampleDebateSection'
import FAQSection from '@/components/landing/FAQSection'
import SocialProofSection from '@/components/landing/SocialProofSection'
import { createServiceClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createServiceClient()
  const { count } = await supabase
    .from('sparring_debates')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')

  return (
    <>
      <HeroSection />
      <SocialProofSection debateCount={count ?? 0} />
      <HowItWorksSection />
      <SampleDebateSection />
      <PricingSection />
      <FAQSection />
    </>
  )
}
