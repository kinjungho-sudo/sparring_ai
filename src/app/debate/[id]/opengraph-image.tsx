import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = '스파링 AI 토론'

interface Props {
  params: Promise<{ id: string }>
}

async function loadFont() {
  return readFile(join(process.cwd(), 'public', 'NotoSansKR.woff'))
}

export default async function OGImage({ params }: Props) {
  const { id } = await params

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
    // 기본값 유지
  }

  const displayTopic = topic.length > 55 ? topic.slice(0, 53) + '…' : topic
  const fontSize = displayTopic.length > 30 ? '46px' : '58px'

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
          padding: '80px',
          fontFamily: '"Noto Sans KR", sans-serif',
        }}
      >
        {/* 배경 그라디언트 — RED */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            left: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239,68,68,0.14) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        {/* 배경 그라디언트 — BLUE */}
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            right: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* TOPIC 레이블 */}
        <div
          style={{
            display: 'flex',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#6366f1',
            marginBottom: '28px',
          }}
        >
          TOPIC
        </div>

        {/* 의제 텍스트 */}
        <div
          style={{
            display: 'flex',
            color: '#f5f5f5',
            fontSize,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textAlign: 'center',
            lineHeight: 1.35,
            marginBottom: '52px',
            maxWidth: '960px',
          }}
        >
          {displayTopic}
        </div>

        {/* RED vs BLUE 배지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              background: 'rgba(239,68,68,0.15)',
              border: '1.5px solid rgba(239,68,68,0.45)',
              borderRadius: '10px',
              padding: '10px 24px',
              color: '#ef4444',
              fontSize: '17px',
              fontWeight: 700,
            }}
          >
            RED 찬성
          </div>
          <div style={{ display: 'flex', color: 'rgba(255,255,255,0.3)', fontSize: '20px', fontWeight: 900 }}>
            VS
          </div>
          <div
            style={{
              display: 'flex',
              background: 'rgba(99,102,241,0.15)',
              border: '1.5px solid rgba(99,102,241,0.45)',
              borderRadius: '10px',
              padding: '10px 24px',
              color: '#6366f1',
              fontSize: '17px',
              fontWeight: 700,
            }}
          >
            BLUE 반대
          </div>
        </div>

        {/* 하단 브랜드 */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: '32px',
            color: 'rgba(255,255,255,0.25)',
            fontSize: '16px',
            letterSpacing: '0.06em',
          }}
        >
          스파링 AI
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Noto Sans KR', data: font, weight: 400 }],
    }
  )
}
