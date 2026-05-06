function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface DebateCompleteEmailParams {
  topic: string
  debateId: string
  redSummary?: string | null
  blueSummary?: string | null
  nextQuestion?: string | null
  language?: string
}

export function buildDebateCompleteEmail(params: DebateCompleteEmailParams) {
  const { topic, debateId, redSummary, blueSummary, nextQuestion, language = 'ko' } = params
  const safeTopic = escHtml(topic)
  const safeRedSummary = redSummary ? escHtml(redSummary) : null
  const safeBlueSummary = blueSummary ? escHtml(blueSummary) : null
  const safeNextQuestion = nextQuestion ? escHtml(nextQuestion) : null
  const isKo = language === 'ko'
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sparring.ai'}/debate/${debateId}`

  const subject = isKo
    ? `📊 토론 리포트: "${safeTopic}"`
    : `📊 Debate Report: "${safeTopic}"`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0a0a0a;color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <p style="font-size:11px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin:0 0 8px">SPARRING AI</p>
      <h1 style="font-size:22px;font-weight:900;margin:0;color:#f5f5f5;">
        ${isKo ? '토론이 완료되었습니다' : 'Debate Complete'}
      </h1>
      <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:8px 0 0;">"${safeTopic}"</p>
    </div>

    ${safeRedSummary || safeBlueSummary ? `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
      ${safeRedSummary ? `
      <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:16px;">
        <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;color:#ef4444;margin:0 0 8px">RED ${isKo ? '찬성' : 'PRO'}</p>
        <p style="font-size:13px;color:rgba(255,255,255,0.7);margin:0;line-height:1.6;">${safeRedSummary}</p>
      </div>` : ''}
      ${safeBlueSummary ? `
      <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.25);border-radius:12px;padding:16px;">
        <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;color:#6366f1;margin:0 0 8px">BLUE ${isKo ? '반대' : 'CON'}</p>
        <p style="font-size:13px;color:rgba(255,255,255,0.7);margin:0;line-height:1.6;">${safeBlueSummary}</p>
      </div>` : ''}
    </div>` : ''}

    ${safeNextQuestion ? `
    <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:16px;margin-bottom:20px;">
      <p style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;color:#6366f1;margin:0 0 8px">❓ ${isKo ? '다음 질문' : 'Next Question'}</p>
      <p style="font-size:13px;color:rgba(255,255,255,0.7);margin:0;font-style:italic;line-height:1.6;">${safeNextQuestion}</p>
    </div>` : ''}

    <div style="text-align:center;margin-top:32px;">
      <a href="${url}" style="display:inline-block;background:#6366f1;color:#fff;font-weight:700;font-size:14px;text-decoration:none;padding:14px 32px;border-radius:12px;">
        ${isKo ? '전체 리포트 보기' : 'View Full Report'} →
      </a>
      <p style="font-size:11px;color:rgba(255,255,255,0.25);margin:24px 0 0;">
        ${isKo ? '이 이메일은 스파링 AI에서 발송되었습니다.' : 'Sent by Sparring AI.'}
      </p>
    </div>
  </div>
</body>
</html>
`

  return { subject, html }
}
