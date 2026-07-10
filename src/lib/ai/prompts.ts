import type { Language, DebaterConfig, DebateStyle, InterviewConfig } from '@/types'

const STYLE_INSTRUCTIONS: Record<DebateStyle, string> = {
  easy:         '어려운 용어 없이 누구나 이해할 수 있는 쉬운 표현으로 발언하세요.',
  expert:       '전문 용어와 심층 논거를 활용한 전문가 수준의 발언을 하세요.',
  short:        '핵심만 담아 3문장 이내로 간결하게 발언하세요.',
  bullet:       '핵심 포인트를 번호(1. 2. 3.)로 나누어 개조식으로 발언하세요.',
  storytelling: '실제 사례, 비유, 스토리를 활용해 감성적으로 설득하세요.',
  socratic:     '질문 방식으로 논지를 전달하세요. 단, 반드시 먼저 자신의 입장을 1~2문장으로 제시한 뒤, 그 근거를 뒷받침하는 날카로운 질문 1~2개를 던지세요. 질문만 하고 발언을 끝내면 안 됩니다.',
  casual:       '친구에게 말하듯 편안하고 자연스러운 구어체로 발언하세요. 격식체(~습니다, ~입니다) 대신 구어체(~이야, ~거든, ~잖아)를 사용하고, 딱딱한 논거보다 공감 가는 이야기체로 풀어주세요.',
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
  if (config.styles && config.styles.length > 0) {
    const styleLines = config.styles.map((s) => `  - ${STYLE_INSTRUCTIONS[s]}`).join('\n')
    lines.push(`- 발언 스타일:\n${styleLines}`)
  }
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
- 발언은 3~5문장 이내로 짧게 요약하세요. 한 발언에 하나의 핵심 주장과 근거만 담으세요.
- 불필요한 수식어, 반복, 장황한 설명 금지. 읽는 사람이 한눈에 이해할 수 있어야 합니다.
- 발언에서 가장 중요한 핵심 단어나 구절 1~2개는 **양쪽에 별표**로 강조하세요. 예: **핵심 주장**.
- ##, --, ___, > 등 다른 마크다운 기호는 사용 금지. 오직 **굵게** 강조만 허용.
- 상대방이 직접 질문을 던졌거나 확인을 요청한 경우, 반드시 그 질문에 먼저 답변한 뒤 자신의 주장을 전개하세요.
- 사회자(HOST)가 확인을 요청한 경우에도, 해당 요청에 먼저 답변한 뒤 발언을 이어가세요.
- 근거 없는 주장, 검증되지 않은 수치 금지.
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
- 발언은 3~5문장 이내로 짧게 요약하세요. 한 발언에 하나의 핵심 주장과 근거만 담으세요.
- 불필요한 수식어, 반복, 장황한 설명 금지. 읽는 사람이 한눈에 이해할 수 있어야 합니다.
- 발언에서 가장 중요한 핵심 단어나 구절 1~2개는 **양쪽에 별표**로 강조하세요. 예: **핵심 주장**.
- ##, --, ___, > 등 다른 마크다운 기호는 사용 금지. 오직 **굵게** 강조만 허용.
- 상대방이 직접 질문을 던졌거나 확인을 요청한 경우, 반드시 그 질문에 먼저 답변한 뒤 자신의 주장을 전개하세요.
- 사회자(HOST)가 확인을 요청한 경우에도, 해당 요청에 먼저 답변한 뒤 발언을 이어가세요.
- 근거 없는 주장, 검증되지 않은 수치 금지.
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
  const lang = ctx.language === 'ko' ? '한국어' : '영어'
  return `[역할]
당신은 스파링 AI의 사회자입니다. 토론자가 아닙니다. 절대로 어느 쪽 편도 들지 않습니다.

[현재 토론]
- 의제: ${ctx.topic}
- 라운드: ${ctx.currentRound} / ${ctx.totalRounds}

[이번 라운드 발언]
RED(찬성): ${redContent}
BLUE(반대): ${blueContent}

[팩트체크 임무]
검증 가능한 사실 주장만 대상으로 합니다. 다음 기준 모두 충족 시에만 포함하세요:
1. 구체적인 수치, 날짜, 고유명사, 통계 등 객관적으로 검증 가능한 사실 주장일 것
2. 해당 주장의 참/거짓(verdict)이 공식 자료로 명확히 판단 가능할 것
3. 의견, 추론, 예측, 가치 판단은 절대 포함하지 말 것
4. 확신이 없으면 포함하지 말 것

팩트 체크 항목이 없으면 반드시 { "checks": [] } 를 출력하세요.

출력 형식 (JSON만 출력, 다른 텍스트 없이, ${lang}로 작성):
{
  "checks": [
    {
      "speaker": "red" | "blue",
      "claim": "원문에서 검증 대상 주장 발췌 (짧게)",
      "verdict": "TRUE" | "FALSE" | "MISLEADING",
      "note": "판정 근거 1~2문장 (출처기관명 포함 가능, URL은 절대 생성 금지)"
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
반드시 순수 JSON만 출력하세요. 마크다운 코드블록이나 설명 텍스트를 절대 포함하지 마세요. 첫 글자는 반드시 { 이어야 합니다.

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
  },
  "insight": "이 토론 주제를 통해 이 앱을 사용하는 사람에게 전달하고 싶은 핵심 메시지. 찬반을 넘어 이 질문이 진짜로 가리키는 것, 놓치기 쉬운 본질, 혹은 삶에 적용할 수 있는 태도를 1~3문장으로 담담하고 진실되게 전달하세요. 격언투나 계몽적 어조 금지. 읽는 사람이 무언가를 느끼게 하는 말이어야 합니다."
}`
}

export function buildHostInterventionPrompt(topic: string, reason: string, language: Language): string {
  const lang = language === 'ko' ? '한국어' : '영어'
  return `당신은 스파링 AI의 사회자입니다. 다음 상황에 대해 짧고 중립적으로 개입하세요 (${lang}로, 1~2문장).

의제: ${topic}
개입 이유: ${reason}`
}

// ── 면접 모드 프롬프트 ────────────────────────────────────────────────────────

export interface InterviewPromptContext {
  position: string
  jd?: string
  resume: string
  interviewType?: 'personality' | 'technical' | 'pressure'
  currentRound: number
  totalRounds: number
  language: Language
  history: Array<{ speaker: string; content: string }>  // speaker: 'interviewer' | 'candidate' | 'host'
  followUpCount: number  // 현재 주제에서 후속 질문 횟수
}

function buildInterviewHistory(history: Array<{ speaker: string; content: string }>, language: Language): string {
  if (history.length === 0) return language === 'ko' ? '(아직 대화 없음)' : '(No conversation yet)'
  return history.map((m) => {
    const label = m.speaker === 'interviewer'
      ? (language === 'ko' ? '면접관' : 'Interviewer')
      : m.speaker === 'candidate'
        ? (language === 'ko' ? '지원자' : 'Candidate')
        : (language === 'ko' ? '사회자' : 'Host')
    return `${label}: ${m.content}`
  }).join('\n\n')
}

const INTERVIEW_TYPE_DESC: Record<string, { ko: string; en: string }> = {
  personality: { ko: '인성 면접 — 가치관, 협업, 성장 경험 중심 질문', en: 'Personality interview — values, teamwork, growth experience' },
  technical:   { ko: '기술 면접 — 직무 역량, 기술 지식, 문제 해결 중심 질문', en: 'Technical interview — skills, knowledge, problem-solving' },
  pressure:    { ko: '압박 면접 — 논리적 허점을 파고드는 날카로운 질문', en: 'Pressure interview — probing questions that challenge weak points' },
}

export function buildInterviewerPrompt(ctx: InterviewPromptContext): string {
  const lang = ctx.language === 'ko' ? '한국어' : '영어'
  const isFinal = ctx.currentRound === ctx.totalRounds
  const typeDesc = ctx.interviewType
    ? (ctx.language === 'ko' ? INTERVIEW_TYPE_DESC[ctx.interviewType].ko : INTERVIEW_TYPE_DESC[ctx.interviewType].en)
    : (ctx.language === 'ko' ? '일반 면접' : 'General interview')
  const shouldFollowUp = ctx.followUpCount < 2 && ctx.history.length > 0

  return `당신은 ${ctx.position} 포지션의 실제 면접관입니다.
언어: ${lang}
면접 유형: ${typeDesc}

[지원자 자기소개서/이력서]
${ctx.resume}
${ctx.jd ? `\n[직무기술서(JD)]\n${ctx.jd}` : ''}

[면접 진행 규칙]
- 현재 ${ctx.currentRound}/${ctx.totalRounds} 라운드
- 질문은 반드시 하나만 하세요. 여러 질문을 한 번에 하지 마세요.
- 질문은 간결하고 명확하게, 2~3문장 이내로 하세요.
- ${shouldFollowUp
    ? '이전 지원자 답변을 바탕으로 더 깊이 파고드는 후속 질문을 하세요. 답변의 구체적인 부분에 대해 추가로 물어보세요.'
    : '이전 주제는 마무리하고 자기소개서의 다른 항목을 기반으로 새로운 주제의 질문을 하세요.'}
${isFinal ? '- 마지막 라운드입니다. "마지막으로" 또는 "끝으로"로 시작하는 마무리 질문을 하세요.' : ''}
- 평가하거나 피드백하지 마세요. 오직 질문만 하세요.
- 마크다운 기호 사용 금지.

[지금까지의 면접 대화]
${buildInterviewHistory(ctx.history, ctx.language)}

위 대화를 바탕으로 다음 면접 질문을 하세요.`
}

export function buildInterviewFeedbackPrompt(
  ctx: Pick<InterviewPromptContext, 'position' | 'resume' | 'language' | 'currentRound'>,
  question: string,
  candidateAnswer: string,
): string {
  const lang = ctx.language === 'ko' ? '한국어' : '영어'
  return `당신은 ${ctx.position} 포지션 면접의 전문 평가 사회자입니다.
언어: ${lang}

[지원자 자기소개서]
${ctx.resume}

[라운드 ${ctx.currentRound} 면접 내용]
면접관 질문: ${question}
지원자 답변: ${candidateAnswer}

[임무]
지원자의 답변을 평가하고 아래 JSON 형식으로만 출력하세요. 다른 텍스트 없이 순수 JSON만 출력하세요.

{
  "question_intent": "이 질문이 무엇을 평가하려는 것인지 1~2문장으로 설명 (${lang})",
  "strengths": "답변에서 잘한 점 1~2가지 (${lang})",
  "improvements": "보완하면 좋을 점 1~2가지. 구체적으로 무엇이 부족했는지 (${lang})",
  "model_answer": "지원자의 실제 답변 내용을 최대한 살리되, 구조와 표현을 다듬은 모범 답변. 지원자가 언급한 경험/사례를 그대로 활용할 것 (${lang})",
  "score": 1~5 사이 정수 (5가 최고)
}`
}

export function buildInterviewReportPrompt(
  position: string,
  resume: string,
  rounds: Array<{ question: string; answer: string; feedback: InterviewFeedbackData }>,
  language: Language,
): string {
  const lang = language === 'ko' ? '한국어' : '영어'
  const transcript = rounds.map((r, i) =>
    `[Q${i + 1}] ${r.question}\n답변: ${r.answer}\n평가 점수: ${r.feedback.score}/5`
  ).join('\n\n')

  return `당신은 ${position} 포지션 면접의 최종 평가자입니다.
언어: ${lang}

[지원자 자기소개서]
${resume}

[전체 면접 내용]
${transcript}

[임무]
전체 면접을 종합 평가하여 아래 JSON 형식으로만 출력하세요. 순수 JSON만 출력하세요.

{
  "overall_score": 1~5 사이 소수점 첫째 자리까지 (예: 3.8),
  "summary": "전반적인 면접 인상을 2~3문장으로 종합 (${lang})",
  "strengths": ["잘한 점 1", "잘한 점 2", "잘한 점 3"],
  "improvements": ["보완할 점 1", "보완할 점 2", "보완할 점 3"],
  "round_scores": [{"round": 1, "score": 4, "summary": "한 줄 요약"}, ...],
  "next_questions": ["면접관이 추가로 물어볼 만한 질문 1", "질문 2", "질문 3"],
  "final_advice": "지원자에게 전하는 핵심 조언 1~2문장 (${lang})"
}`
}

export interface InterviewFeedbackData {
  question_intent: string
  strengths: string
  improvements: string
  model_answer: string
  score: number
}
