'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GrantProButton({ email, isPro }: { email: string; isPro: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    await fetch('/api/admin/grant-pro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, revoke: isPro }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-[11px] font-bold px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
      style={isPro
        ? { backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }
        : { backgroundColor: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }
      }
    >
      {loading ? '...' : isPro ? 'Pro 해제' : 'Pro 부여'}
    </button>
  )
}
