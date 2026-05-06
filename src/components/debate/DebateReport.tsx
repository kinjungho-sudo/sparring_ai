'use client'

import Link from 'next/link'

interface DebateReportProps {
  content: string
  topic: string
}

export default function DebateReport({ content, topic }: DebateReportProps) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-8 pb-8 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border p-8"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="text-center mb-6">
          <div className="text-2xl mb-2">📊</div>
          <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
            사고확장 리포트
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {topic}
          </p>
        </div>

        <div
          className="whitespace-pre-wrap text-sm leading-relaxed p-4 rounded-xl border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
            fontFamily: 'monospace',
          }}
        >
          {content}
        </div>

        <div className="flex gap-3 mt-6">
          <Link
            href="/debate/new"
            className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors flex items-center justify-center"
          >
            새 토론 시작
          </Link>
          <Link
            href="/"
            className="flex-1 h-11 rounded-xl border font-semibold text-sm transition-colors flex items-center justify-center hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
