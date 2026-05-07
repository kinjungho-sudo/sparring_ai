import { JsonLd } from './JsonLd'

export function OrganizationSchema() {
  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: '스파링 AI',
      url: 'https://sparring-ai-ten.vercel.app',
      description: '두 AI가 찬반으로 격돌하는 AI 토론 서비스. 의사결정이 필요할 때 스파링 AI로 명확한 답을 찾으세요.',
      sameAs: [],
    }} />
  )
}
