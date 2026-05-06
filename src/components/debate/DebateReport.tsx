'use client'

import Link from 'next/link'
import type { ReportData } from '@/types'
import ShareButtons from './ShareButtons'

interface DebateReportProps {
  report: ReportData
  topic: string
  debateId?: string
}

const SPEAKER_LABEL: Record<string, { label: string; color: string }> = {
  red:  { label: '🔴 RED', color: '#ef4444' },
  blue: { label: '🔵 BLUE', color: '#6366f1' },
}

export default function DebateReport({ report, topic, debateId }: DebateReportProps) {
  const winner = report.verdict?.winner
  const winnerColor = winner ? (winner === 'red' ? '#ef4444' : '#6366f1') : undefined
  const winnerLabel = winner ? (winner === 'red' ? '🔴 RED 찬성' : '🔵 BLUE 반대') : null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-6 pb-8 px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        {/* 헤더 */}
        <div className="px-6 pt-6 pb-4 text-center border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>FINAL CONCLUSION</p>
          <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>최종 결론</h2>
          <p className="text-xs mt-1.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{topic}</p>
        </div>

        <div className="p-5 sm:p-6 space-y-5">

          {/* 1) 발언 요약 */}
          {report.speech_summaries && report.speech_summaries.length > 0 && (
            <section className="report-section" style={{ animationDelay: '0ms' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>① 각 발언 요약</p>
              <div className="space-y-2">
                {report.speech_summaries.map((s, i) => {
                  const sp = SPEAKER_LABEL[s.speaker] ?? { label: s.speaker, color: 'var(--text-muted)' }
                  return (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-xs font-black shrink-0 pt-0.5" style={{ color: sp.color, width: 52 }}>
                        {sp.label}
                      </span>
                      <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        <span className="text-[10px] font-bold mr-1.5 opacity-50">R{s.round}</span>
                        {s.summary}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* 2) 핵심 논점 */}
          {report.key_points && report.key_points.length > 0 && (
            <section className="p-4 rounded-xl border report-section" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)', animationDelay: '80ms' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>② 핵심 논점 정리</p>
              <ul className="space-y-2">
                {report.key_points.map((pt, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-black shrink-0 text-xs pt-0.5" style={{ color: 'var(--accent)' }}>{i + 1}.</span>
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 3) 주장 검증 (팩트 체크) */}
          {report.fact_checks && report.fact_checks.length > 0 && (
            <section className="p-4 rounded-xl border report-section" style={{ borderColor: 'rgba(245,158,11,0.3)', backgroundColor: 'rgba(245,158,11,0.05)', animationDelay: '160ms' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#f59e0b' }}>③ 주장 검증 (팩트 체크)</p>
              <ul className="space-y-1.5">
                {report.fact_checks.map((fc, i) => {
                  const sp = SPEAKER_LABEL[fc.speaker] ?? { label: fc.speaker, color: 'var(--text-muted)' }
                  return (
                    <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-black text-xs shrink-0 pt-0.5" style={{ color: sp.color }}>{sp.label}</span>
                      <span className="leading-relaxed">{fc.note}</span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {/* 레거시 팩트 오류 (이전 저장 데이터 호환) */}
          {!report.fact_checks && report.fact_errors && report.fact_errors.length > 0 && (
            <section className="p-4 rounded-xl border report-section" style={{ borderColor: 'rgba(245,158,11,0.3)', backgroundColor: 'rgba(245,158,11,0.05)', animationDelay: '160ms' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#f59e0b' }}>③ 팩트 오류</p>
              <ul className="space-y-1">
                {report.fact_errors.map((e, i) => (
                  <li key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-bold uppercase" style={{ color: '#f59e0b' }}>{e.speaker}</span>: {e.note ?? ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 4) 최종 의견 / 주장 우위 */}
          {report.verdict && (
            <section className="report-section" style={{ animationDelay: '240ms' }}>
              <div
                className="p-5 rounded-xl border"
                style={{
                  borderColor: winner ? `${winnerColor}40` : 'var(--border)',
                  backgroundColor: winner ? `${winnerColor}08` : 'var(--bg-secondary)',
                }}
              >
                <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: winner ? winnerColor : 'var(--text-muted)' }}>
                  ④ 최종 의견
                </p>
                {winner ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-black" style={{ color: winnerColor }}>{winnerLabel} 주장 우위</span>
                    </div>
                    {report.verdict.reason && (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{report.verdict.reason}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>결론 없음 — 의견 정리</p>
                    {report.verdict.conclusion && (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{report.verdict.conclusion}</p>
                    )}
                  </>
                )}
              </div>
            </section>
          )}

          {/* 레거시 수렴 판정 호환 */}
          {!report.verdict && report.convergence_note && (
            <section className="p-4 rounded-xl border report-section" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)', animationDelay: '240ms' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>⚖️ 수렴 판정</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{report.convergence_note}</p>
            </section>
          )}

        </div>

        {/* 공유 */}
        {debateId && (
          <div className="px-5 sm:px-6 pb-4 pt-0">
            <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>이 토론 공유하기</p>
              <ShareButtons debateId={debateId} topic={topic} />
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3 px-5 sm:px-6 pb-6">
          <Link
            href="/debate/new"
            className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors flex items-center justify-center"
          >
            새 토론 시작
          </Link>
          <Link
            href="/"
            className="h-11 px-4 rounded-xl border font-semibold text-sm transition-colors flex items-center justify-center hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            홈
          </Link>
        </div>
      </div>
    </div>
  )
}
