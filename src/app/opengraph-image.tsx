import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = '스파링 AI — 의사결정 보조 AI 토론'

async function loadFont() {
  return readFile(join(process.cwd(), 'public', 'NotoSansKR.woff'))
}

export default async function OGImage() {
  const font = await loadFont()

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
          fontFamily: '"Noto Sans KR", sans-serif',
        }}
      >
        {/* 배경 그라디언트 — RED */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            left: '-200px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239,68,68,0.18) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        {/* 배경 그라디언트 — BLUE */}
        <div
          style={{
            position: 'absolute',
            bottom: '-200px',
            right: '-200px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* RED vs BLUE 배지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
          <div
            style={{
              display: 'flex',
              background: 'rgba(239,68,68,0.15)',
              border: '1.5px solid rgba(239,68,68,0.5)',
              borderRadius: '12px',
              padding: '12px 28px',
              color: '#ef4444',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            RED 찬성
          </div>
          <div style={{ display: 'flex', color: 'rgba(255,255,255,0.35)', fontSize: '24px', fontWeight: 900 }}>
            VS
          </div>
          <div
            style={{
              display: 'flex',
              background: 'rgba(99,102,241,0.15)',
              border: '1.5px solid rgba(99,102,241,0.5)',
              borderRadius: '12px',
              padding: '12px 28px',
              color: '#6366f1',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            BLUE 반대
          </div>
        </div>

        {/* 메인 타이틀 */}
        <div
          style={{
            display: 'flex',
            color: '#f5f5f5',
            fontSize: '76px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
          }}
        >
          스파링 AI
        </div>

        {/* 서브타이틀 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.45)',
            fontSize: '28px',
            fontWeight: 400,
            textAlign: 'center',
            maxWidth: '700px',
            lineHeight: 1.6,
          }}
        >
          <span>두 AI가 찬반으로 격돌하는 동안</span>
          <span>사용자는 스스로 결론에 도달합니다</span>
        </div>

        {/* 하단 URL */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: '36px',
            color: 'rgba(255,255,255,0.2)',
            fontSize: '18px',
            letterSpacing: '0.08em',
          }}
        >
          sparring-ai-ten.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Noto Sans KR', data: font, weight: 400 }],
    }
  )
}
