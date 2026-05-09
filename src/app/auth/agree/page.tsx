'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { saveProfileAndConsent } from './actions'

function AgreeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/debate/new'

  const [displayName, setDisplayName] = useState('')
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [emailMarketing, setEmailMarketing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nameError, setNameError] = useState('')

  const canSubmit = displayName.trim().length >= 2 && termsAgreed && privacyAgreed

  const handleAgree = async () => {
    if (displayName.trim().length < 2) {
      setNameError('이름을 2자 이상 입력해주세요.')
      return
    }
    setNameError('')
    setLoading(true)
    await saveProfileAndConsent({ displayName: displayName.trim(), marketingAgreed: emailMarketing })
    router.replace(next)
  }

  const handleDecline = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div
        className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        {/* 헤더 */}
        <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">👋</span>
            <div>
              <h1 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                스파링 AI에 오신 걸 환영합니다!
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                간단한 정보를 입력하고 시작하세요.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* 사용자 이름 */}
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              이름 <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setNameError('') }}
              placeholder="닉네임 또는 실명"
              maxLength={30}
              className="w-full h-10 px-3 rounded-lg border text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: nameError ? '#ef4444' : 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            {nameError && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{nameError}</p>}
          </div>

          {/* 약관 동의 */}
          <div className="space-y-2">
            <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>약관 동의</p>

            {/* 이용약관 */}
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors hover:bg-white/5"
              style={{ borderColor: termsAgreed ? 'rgba(99,102,241,0.4)' : 'var(--border)' }}>
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 shrink-0"
              />
              <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                이용약관 동의
                <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>필수</span>
              </span>
              <Link
                href="/terms"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] underline underline-offset-2 shrink-0 transition-opacity hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                보기
              </Link>
            </label>

            {/* 개인정보처리방침 */}
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors hover:bg-white/5"
              style={{ borderColor: privacyAgreed ? 'rgba(99,102,241,0.4)' : 'var(--border)' }}>
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(e) => setPrivacyAgreed(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 shrink-0"
              />
              <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                개인정보처리방침 동의
                <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>필수</span>
              </span>
              <Link
                href="/privacy"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] underline underline-offset-2 shrink-0 transition-opacity hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                보기
              </Link>
            </label>

            {/* 이메일 알림 (선택) */}
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors hover:bg-white/5"
              style={{ borderColor: emailMarketing ? 'rgba(99,102,241,0.4)' : 'var(--border)' }}>
              <input
                type="checkbox"
                checked={emailMarketing}
                onChange={(e) => setEmailMarketing(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 shrink-0"
              />
              <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                이메일 알림 수신
                <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>선택</span>
              </span>
            </label>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 pt-1">
          <button
            onClick={handleAgree}
            disabled={!canSubmit || loading}
            className="w-full h-12 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mb-2"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {loading ? '저장 중...' : '시작하기'}
          </button>
          <button
            onClick={handleDecline}
            disabled={loading}
            className="w-full h-9 rounded-xl text-xs transition-colors hover:bg-white/5 disabled:opacity-40"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            동의하지 않음 — 로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AgreePage() {
  return (
    <Suspense>
      <AgreeContent />
    </Suspense>
  )
}
