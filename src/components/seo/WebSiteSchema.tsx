import { JsonLd } from './JsonLd'

export function WebSiteSchema() {
  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '스파링 AI',
      url: 'https://sparring-ai-ten.vercel.app',
      description: '두 AI가 찬반으로 격돌하는 AI 토론 서비스. 의사결정 보조.',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: 'https://sparring-ai-ten.vercel.app/debate/new?topic={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    }} />
  )
}
