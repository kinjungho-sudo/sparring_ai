'use client'

import { useState } from 'react'

interface ShareButtonsProps {
  debateId: string
  topic: string
  onMakePublic?: () => Promise<void>
  isPublic?: boolean
}

export default function ShareButtons({ debateId, topic, onMakePublic, isPublic }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(isPublic ?? false)
  const [loading, setLoading] = useState(false)

  const getUrl = () => `${window.location.origin}/debate/${debateId}`
  const shareText = `"${topic}" — AI 찬반 토론 결과를 확인해보세요.`

  const ensurePublic = async () => {
    if (shared || loading) return
    setLoading(true)
    try {
      await fetch('/api/debate/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debate_id: debateId }),
      })
      setShared(true)
      await onMakePublic?.()
    } catch {}
    setLoading(false)
  }

  const handleNativeShare = async () => {
    await ensurePublic()
    const url = getUrl()
    if (navigator.share) {
      try {
        await navigator.share({ title: `AI 토론: ${topic}`, text: shareText, url })
      } catch {}
    } else {
      await copyLink()
    }
  }

  const copyLink = async () => {
    await ensurePublic()
    try {
      await navigator.clipboard.writeText(getUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const openTwitter = async () => {
    await ensurePublic()
    const url = getUrl()
    const tweetText = encodeURIComponent(`${shareText}\n`)
    const tweetUrl = encodeURIComponent(url)
    window.open(
      `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`,
      '_blank',
      'noopener,noreferrer,width=550,height=420'
    )
  }

  if (loading) {
    return (
      <div className="flex gap-2 flex-wrap">
        <div className="h-9 px-4 rounded-xl border flex items-center text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          공유 준비 중...
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {/* 링크 복사 */}
      <button
        onClick={copyLink}
        className="h-9 px-4 rounded-xl border font-semibold text-xs transition-all flex items-center gap-1.5 hover:bg-white/5"
        style={{
          borderColor: copied ? 'rgba(34,197,94,0.4)' : 'var(--border)',
          color: copied ? '#22c55e' : 'var(--text-secondary)',
        }}
      >
        {copied ? '✓ 복사됨' : '🔗 링크 복사'}
      </button>

      {/* X(트위터) 공유 */}
      <button
        onClick={openTwitter}
        className="h-9 px-4 rounded-xl border font-semibold text-xs transition-all flex items-center gap-1.5 hover:bg-white/5"
        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        X 공유
      </button>

      {/* 네이티브 공유 (모바일) */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={handleNativeShare}
          className="h-9 px-4 rounded-xl border font-semibold text-xs transition-all flex items-center gap-1.5 hover:bg-white/5"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          ↗ 공유
        </button>
      )}
    </div>
  )
}
