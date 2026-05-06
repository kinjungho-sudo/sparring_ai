import { ImageResponse } from 'next/og'

export const alt = '스파링 AI 토론'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OGImage({ params }: Props) {
  const { id } = await params

  // Supabase REST API 직접 호출 (edge-safe)
  let topic = '스파링 AI 토론'
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sparring_debates?id=eq.${id}&select=topic,is_public&limit=1`
    const res = await fetch(url, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    })
    const rows = await res.json() as Array<{ topic: string; is_public: boolean }>
    if (rows[0]?.is_public && rows[0].topic) {
      topic = rows[0].topic
    }
  } catch {
    // 조회 실패 시 기본값 사용
  }

  const displayTopic = topic.length > 60 ? topic.slice(0, 58) + '…' : topic

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '80px',
        }}
      >
        {/* 배경 그라디언트 */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            left: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            right: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          }}
        />

        {/* 상단 레이블 */}
        <div
          style={{
            fontSize: '16px',
            fontWeight: 900,
            letterSpacing: '0.15em',
            color: '#6366f1',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}
        >
          TOPIC
        </div>

        {/* 의제 텍스트 */}
        <div
          style={{
            color: '#f5f5f5',
            fontSize: displayTopic.length > 30 ? '44px' : '56px',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            lineHeight: 1.3,
            marginBottom: '48px',
            maxWidth: '960px',
          }}
        >
          {displayTopic}
        </div>

        {/* VS 배지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1.5px solid rgba(239,68,68,0.4)',
              borderRadius: '10px',
              padding: '10px 24px',
              color: '#ef4444',
              fontSize: '16px',
              fontWeight: 900,
              letterSpacing: '0.1em',
            }}
          >
            RED 찬성
          </div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '18px', fontWeight: 900 }}>VS</div>
          <div
            style={{
              background: 'rgba(99,102,241,0.15)',
              border: '1.5px solid rgba(99,102,241,0.4)',
              borderRadius: '10px',
              padding: '10px 24px',
              color: '#6366f1',
              fontSize: '16px',
              fontWeight: 900,
              letterSpacing: '0.1em',
            }}
          >
            BLUE 반대
          </div>
        </div>

        {/* 하단 브랜드 */}
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>⚔️</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '16px', letterSpacing: '0.05em' }}>
            스파링 AI
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
