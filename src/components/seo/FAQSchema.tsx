import { JsonLd } from './JsonLd'

const FAQ_ITEMS = [
  { q: '스파링 AI는 무료인가요?', a: '네. 회원가입 후 매일 5회 무료로 AI 토론을 이용할 수 있습니다.' },
  { q: '스파링 AI는 어떻게 작동하나요?', a: '의제를 입력하면 RED AI(찬성)와 BLUE AI(반대)가 라운드별로 논쟁을 벌이고, 사회자 AI가 팩트를 검증합니다. 토론 종료 후 중립적 리포트가 생성됩니다.' },
  { q: 'AI가 정답을 알려주나요?', a: '아닙니다. 스파링 AI는 정답을 내리지 않습니다. 두 AI가 찬반 양쪽을 논리적으로 전개해 사용자가 스스로 결론에 도달하도록 돕습니다.' },
  { q: '어떤 주제로 토론할 수 있나요?', a: '이직, 창업, 투자 등 개인 의사결정부터 사회·정책 이슈까지 대부분의 주제를 지원합니다.' },
  { q: '토론 결과는 저장되나요?', a: '로그인 후 진행한 모든 토론은 자동 저장됩니다. 원하는 토론은 공개 링크로 공유할 수도 있습니다.' },
]

export function FAQSchema() {
  return (
    <JsonLd data={{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    }} />
  )
}
