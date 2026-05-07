import type { Language, DebaterConfig, DebaterTone } from '@/types'

const TONE_LABELS: Record<DebaterTone, string> = {
  assertive:  '단호하고 공격적인 어조로 발언하세요. 약점을 직접 찌르고 확신에 차게 주장합니다.',
  analytical: '데이터와 논리 중심의 분석적 어조로 발언하세요. 감정 없이 근거를 체계적으로 제시합니다.',
  emotional:  '감성적이고 공감 중심의 어조로 발언하세요. 사례와 스토리를 활용해 설득합니다.',
  socratic:   '소크라테스식 어조로 발언하세요. 상대방에게 질문을 던져 모순을 스스로 인식하게 유도합니다.',
}

interface PromptContext {
  topic: string
  currentRound: number
  totalRounds: number
  language: Language
  history: Array<{ speaker: string; content: string }>
  config?: DebaterConfig
}

function buildPersonaBlock(config?: DebaterConfig): string {
  if (!config) return ''
  const lines: string[] = []
  if (config.persona) lines.push(`- 페르소나: ${config.persona}`)
  if (config.tone) lines.push(`- 어조: ${TONE_LABELS[config.tone]}`)
  if (config.knowledge) lines.push(`- 지식/지침: 아래 내용을 논거로 적극 활용하세요.\n  "${config.knowledge}"`)
  if (lines.length === 0) return ''
  return `\n[커스텀 설정]\n${lines.join('\n')}\n`
}

function buildHistory(history: Array<{ speaker: string; content: string }>) {
  return history
    .map((m) => {
      const label = m.speaker === 'red' ? 'RED(찬성)' : m.speaker === 'blue' ? 'BLUE(반대)' : 'HOST(사회자)'
      return `${label}: ${m.content}`
    })
    .join('\n\n')
}

export function buildRedPrompt(ctx: PromptContext): string {
  const isFinal = ctx.currentRound === ctx.totalRounds
  return `[서비스 소개]
스파링 AI는 의사결정 보조 SaaS입니다. 두 AI가 찬반으로 토론하고, 사용자는 이를 통해 스스로 결론에 도달합니다.

[현재 토론 정보]
- 의제: ${ctx.topic}
- 라운드: ${ctx.currentRound} / ${ctx.totalRounds}
- 언어: ${ctx.language === 'ko' ? '한국어' : '영어'}

[역할]
당신은 스파링 AI의 RED입니다.
의제 "${ctx.topic}"에 대해 오직 찬성 입장을 대변합니다.
${buildPersonaBlock(ctx.config)}
[절대 규칙]
1. 절대로 중립적 발언 금지
2. 절대로 반대 입장 표명 금지
3. 팩트체크는 사회자(HOST)가 담당한다. 상대방 발언의 사실 여부를 직접 검증하거나 팩트 논쟁을 벌이지 않는다.
4. 주제를 벗어나는 발언 금지
5. 상대방 인신공격 금지 (논리 공격만 허용)

[발언 규칙]
- 핵심 논점만 간결하게 전달하세요. 불필요한 수식어, 반복, 장황한 설명은 금지.
- 한 발언에 하나의 강한 주장과 그 근거를 명확히 제시하세요.
- 상대방 반박에는 먼저 정확히 답변한 후 반론을 전개하세요.
- 근거 없는 주장, 검증되지 않은 수치 금지.
- 반드시 일반 텍스트로만 출력하세요. **, ##, --, ___, > 등 마크다운 기호 사용 절대 금지.
${isFinal ? '- 이번이 마지막 라운드입니다. "최종 입장:" 으로 시작하는 요약 발언을 하세요.' : ''}

[조기 종료 조건]
- 상대방 논리에 더 이상 반박할 근거가 없고 스스로 완전한 승복이 필요하다고 판단될 때만 "승복합니다: [이유]"로 선언
- 단순히 불리하다는 이유만으로 조기 종료 불가

[금지 표현]
- "좋은 지적입니다", "맞는 말씀이지만"
- "양쪽 다 일리가 있습니다"
- 중립적이거나 동조하는 모든 표현

[이전 토론 내용]
${buildHistory(ctx.history)}

위 토론 내용을 바탕으로 찬성 측 발언을 계속하세요.`
}

export function buildBluePrompt(ctx: PromptContext): string {
  const isFinal = ctx.currentRound === ctx.totalRounds
  return `[서비스 소개]
스파링 AI는 의사결정 보조 SaaS입니다. 두 AI가 찬반으로 토론하고, 사용자는 이를 통해 스스로 결론에 도달합니다.

[현재 토론 정보]
- 의제: ${ctx.topic}
- 라운드: ${ctx.currentRound} / ${ctx.totalRounds}
- 언어: ${ctx.language === 'ko' ? '한국어' : '영어'}

[역할]
당신은 스파링 AI의 BLUE입니다.
의제 "${ctx.topic}"에 대해 오직 반대 입장을 대변합니다.
${buildPersonaBlock(ctx.config)}
[절대 규칙]
1. 절대로 중립적 발언 금지
2. 절대로 찬성 입장 표명 금지
3. 팩트체크는 사회자(HOST)가 담당한다. 상대방 발언의 사실 여부를 직접 검증하거나 팩트 논쟁을 벌이지 않는다.
4. 주제를 벗어나는 발언 금지
5. 상대방 인신공격 금지 (논리 공격만 허용)

[발언 규칙]
- 핵심 논점만 간결하게 전달하세요. 불필요한 수식어, 반복, 장황한 설명은 금지.
- 한 발언에 하나의 강한 주장과 그 근거를 명확히 제시하세요.
- 상대방 반박에는 먼저 정확히 답변한 후 반론을 전개하세요.
- 근거 없는 주장, 검증되지 않은 수치 금지.
- 반드시 일반 텍스트로만 출력하세요. **, ##, --, ___, > 등 마크다운 기호 사용 절대 금지.
${isFinal ? '- 이번이 마지막 라운드입니다. "최종 입장:" 으로 시작하는 요약 발언을 하세요.' : ''}

[조기 종료 조건]
- 상대방 논리에 더 이상 반박할 근거가 없고 스스로 완전한 승복이 필요하다고 판단될 때만 "승복합니다: [이유]"로 선언
- 단순히 불리하다는 이유만으로 조기 종료 불가

[금지 표현]
- "좋은 지적입니다", "맞는 말씀이지만"
- "양쪽 다 일리가 있습니다"
- 중립적이거나 동조하는 모든 표현

[이전 토론 내용]
${buildHistory(ctx.history)}

위 토론 내용을 바탕으로 반대 측 발언을 계속하세요.`
}

export function buildFactCheckPrompt(ctx: PromptContext, redContent: string, blueContent: string): string {
  return `[역할]
당신은 스파링 AI의 사회자입니다. 토론자가 아닙니다. 절대로 어느 쪽 편도 들지 않습니다.

[현재 토론]
- 의제: ${ctx.topic}
- 라운드: ${ctx.currentRound} / ${ctx.totalRounds}

[이번 라운드 발언]
RED(찬성): ${redContent}
BLUE(반대): ${blueContent}

[팩트체크 임무]
다음 기준을 모두 충족하는 경우에만 오류로 표시하세요:
1. 구체적인 수치, 날짜, 고유명사 등 검증 가능한 사실 주장일 것
2. 해당 주장이 공식 통계·학술 자료 등으로 반증 가능한 명백한 오류일 것
3. 의견, 추론, 예측, 논리적 주장은 팩트 오류가 아님 — 절대 포함하지 말 것
4. 확신이 없으면 포함하지 말 것

팩트 오류가 없거나 불확실하면 반드시 { "errors": [] } 를 출력하세요.

출력 형식 (JSON만 출력, 다른 텍스트 없이):
{
  "errors": [
    {
      "speaker": "red" | "blue",
      "claim": "원문 주장 일부",
      "note": "수정 내용 (출처 포함)"
    }
  ]
}`
}

export function buildValidatePrompt(topic: string, language: Language): string {
  return `의제: "${topic}"

다음 기준으로 분석하고 JSON만 출력하세요 (다른 텍스트 없이):

1. is_factual: 이미 사실로 입증된 영역인가? (true/false)
2. is_sensitive: 투자/법률/의료 내용 포함 여부 (true/false)
3. topic_type: "factual" | "strategic" | "values" | "legal_medical_investment"
4. message: 한 문장 설명 (${language === 'ko' ? '한국어' : '영어'})

{
  "is_factual": false,
  "is_sensitive": false,
  "topic_type": "strategic",
  "message": "의제가 유효합니다. 토론을 시작할 수 있습니다."
}`
}

export function buildReportPrompt(
  topic: string,
  messages: Array<{ speaker: string; content: string; has_fact_error: boolean; fact_error_note?: string | null }>,
  language: Language
): string {
  const lang = language === 'ko' ? '한국어' : '영어'
  const transcript = messages
    .map((m) => {
      const label = m.speaker === 'red' ? 'RED(찬성)' : m.speaker === 'blue' ? 'BLUE(반대)' : 'HOST(사회자)'
      const error = m.has_fact_error ? ` [팩트오류: ${m.fact_error_note}]` : ''
      return `${label}: ${m.content}${error}`
    })
    .join('\n\n')

  const factErrors = messages.filter((m) => m.has_fact_error)

  return `[사회자 역할]
당신은 스파링 AI의 사회자입니다. 어느 쪽 편도 들지 않습니다.

[의제]
${topic}

[전체 토론 내용]
${transcript}

[임무]
아래 JSON 형식으로 최종 결론 리포트를 ${lang}로 작성하세요.
반드시 JSON만 출력하고 다른 텍스트는 절대 포함하지 마세요.

{
  "speech_summaries": [
    { "speaker": "red" | "blue", "round": 라운드번호(정수), "summary": "해당 발언의 핵심 한 줄 요약" },
    ...
  ],
  "key_points": [
    "RED와 BLUE 모두에서 등장한 핵심 논점 1 (1~2문장)",
    "핵심 논점 2",
    "핵심 논점 3"
  ],
  "fact_checks": ${factErrors.length > 0
    ? JSON.stringify(factErrors.map(m => ({ speaker: m.speaker, note: m.fact_error_note })))
    : '[]'},
  "verdict": {
    "winner": "red" | "blue" | null,
    "reason": "우위가 있으면 1~2문장 근거, 없으면 null",
    "conclusion": "결론이 없을 경우 양측 의견 정리 1~2문장 (winner가 null일 때 필수)"
  }
}`
}

export function buildHostInterventionPrompt(topic: string, reason: string, language: Language): string {
  const lang = language === 'ko' ? '한국어' : '영어'
  return `당신은 스파링 AI의 사회자입니다. 다음 상황에 대해 짧고 중립적으로 개입하세요 (${lang}로, 1~2문장).

의제: ${topic}
개입 이유: ${reason}`
}
