'use client'

import { useLanguage } from '@/contexts/LanguageContext'

interface DisclaimerModalProps {
  onAgree: () => void
  onCancel: () => void
}

export default function DisclaimerModal({ onAgree, onCancel }: DisclaimerModalProps) {
  const { t } = useLanguage()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-md p-8 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="text-2xl mb-4 text-center">⚠️</div>
        <h3 className="text-lg font-black text-center mb-4" style={{ color: 'var(--text-primary)' }}>
          {t('면책 고지', 'Disclaimer')}
        </h3>
        <p className="text-sm leading-relaxed mb-6 p-4 rounded-xl" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' }}>
          {t(
            '이 토론은 투자 권유 또는 법률/의료 조언이 아닌 사고확장 도구입니다. 최종 판단은 반드시 본인이 내리십시오.',
            'This debate is a thought-expansion tool, not investment advice or legal/medical counsel. All final decisions must be made by you.'
          )}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl border font-semibold text-sm transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            {t('취소', 'Cancel')}
          </button>
          <button
            onClick={onAgree}
            className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors"
          >
            {t('동의하고 시작', 'Agree & Start')}
          </button>
        </div>
      </div>
    </div>
  )
}
