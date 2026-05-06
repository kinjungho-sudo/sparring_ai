'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const { language, setLanguage, t } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 border-b"
      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            ⚡ Sparring AI
          </span>
          <span className="text-xs font-black px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: 'var(--accent)' }}>
            BETA
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-5">
          <Link href="/#how-it-works" className="text-xs font-semibold transition-colors hover:opacity-100" style={{ color: 'var(--text-muted)' }}>서비스 소개</Link>
          <Link href="/#pricing" className="text-xs font-semibold transition-colors hover:opacity-100" style={{ color: 'var(--text-muted)' }}>요금제</Link>
          <Link href="/#faq" className="text-xs font-semibold transition-colors hover:opacity-100" style={{ color: 'var(--text-muted)' }}>FAQ</Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* 언어 토글 */}
        <button
          onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
          className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors hover:bg-white/5"
          style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
        >
          {language === 'ko' ? 'EN' : 'KO'}
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              {t('마이페이지', 'My page')}
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
            >
              {t('로그아웃', 'Sign out')}
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm font-bold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            {t('시작하기', 'Get started')}
          </Link>
        )}
      </div>
    </header>
  )
}
