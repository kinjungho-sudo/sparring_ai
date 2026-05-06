import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '스파링 AI — 의사결정 보조 AI 토론'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
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
        }}
      >
        {/* 배경 그라디언트 원 */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            left: '-200px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-200px',
            right: '-200px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          }}
        />

        {/* VS 배지 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1.5px solid rgba(239,68,68,0.4)',
              borderRadius: '12px',
              padding: '12px 28px',
              color: '#ef4444',
              fontSize: '18px',
              fontWeight: 900,
              letterSpacing: '0.12em',
            }}
          >
            RED 찬성
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '22px',
              fontWeight: 900,
            }}
          >
            VS
          </div>
          <div
            style={{
              background: 'rgba(99,102,241,0.15)',
              border: '1.5px solid rgba(99,102,241,0.4)',
              borderRadius: '12px',
              padding: '12px 28px',
              color: '#6366f1',
              fontSize: '18px',
              fontWeight: 900,
              letterSpacing: '0.12em',
            }}
          >
            BLUE 반대
          </div>
        </div>

        {/* 메인 타이틀 */}
        <div
          style={{
            color: '#f5f5f5',
            fontSize: '72px',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          ⚔️ 스파링 AI
        </div>

        {/* 서브타이틀 */}
        <div
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '26px',
            fontWeight: 500,
            textAlign: 'center',
            maxWidth: '700px',
            lineHeight: 1.5,
          }}
        >
          두 AI가 찬반으로 격돌하는 동안
          <br />
          사용자는 스스로 결론에 도달합니다
        </div>

        {/* 하단 URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            color: 'rgba(255,255,255,0.25)',
            fontSize: '18px',
            letterSpacing: '0.05em',
          }}
        >
          sparring-ai.vercel.app
        </div>
      </div>
    ),
    { ...size }
  )
}
