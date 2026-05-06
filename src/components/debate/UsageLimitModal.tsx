'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface UsageLimitModalProps {
  onClose: () => void
}

export default function UsageLimitModal({ onClose }: UsageLimitModalProps) {
  const { t } = useLanguage()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user))
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl border text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="text-3xl mb-4">🔒</div>
        <h3 className="text-lg font-black mb-2" style={{ color: 'var(--text-primary)' }}>
          {t('오늘의 무료 토론이 끝났습니다', "Today's free debates used up")}
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {t('매일 3회 무료 · 무제한은 월 9,900원', '3 free/day · Unlimited at ₩9,900/mo')}
        </p>
        <Link
          href={isLoggedIn ? '/#pricing' : '/login'}
          className="block w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors flex items-center justify-center"
        >
          {isLoggedIn
            ? t('Pro 플랜 보기', 'See Pro plan')
            : t('로그인하고 시작하기', 'Sign in to continue')}
        </Link>
        <button
          onClick={onClose}
          className="mt-3 text-xs w-full"
          style={{ color: 'var(--text-muted)' }}
        >
          {t('내일 다시 오기', 'Come back tomorrow')}
        </button>
      </div>
    </div>
  )
}
