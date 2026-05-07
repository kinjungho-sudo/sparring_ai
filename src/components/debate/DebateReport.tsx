'use client'

import Link from 'next/link'
import type { ReportData } from '@/types'
import ShareButtons from './ShareButtons'

interface DebateReportProps {
  report: ReportData
  topic: string
  debateId?: string
  onClose?: () => void
}

const SPEAKER_LABEL: Record<string, { label: string; color: string }> = {
  red:  { label: '🔴 RED', color: '#ef4444' },
  blue: { label: '🔵 BLUE', color: '#6366f1' },
}

function parseVerdict(raw: ReportData['verdict']): ReportData['verdict'] {
  if (!raw) return null
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return parsed?.verdict ?? parsed
    } catch {
      return null
    }
  }
  return raw
}

function parseStringArray(raw: unknown): string[] | null {
  if (!raw) return null
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return null }
  }
  return null
}

function parseSpeechSummaries(raw: unknown): ReportData['speech_summaries'] {
  if (!raw) return null
  if (Array.isArray(raw)) return raw as ReportData['speech_summaries']
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return null }
  }
  return null
}

function parseFactChecks(raw: unknown): ReportData['fact_checks'] {
  if (!raw) return null
  if (Array.isArray(raw)) return raw as ReportData['fact_checks']
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return null }
  }
  return null
}

export default function DebateReport({ report, topic, debateId, onClose }: DebateReportProps) {
  // convergence_note에 JSON 전체가 담긴 경우 (폴백 케이스) 재파싱해서 올바른 report로 교체
  const effectiveReport: ReportData = (() => {
    if (!report.verdict && !report.speech_summaries && report.convergence_note) {
      try {
        const start = report.convergence_note.indexOf('{')
        const end = report.convergence_note.lastIndexOf('}')
        if (start !== -1 && end > start) {
          const parsed = JSON.parse(report.convergence_note.slice(start, end + 1))
          if (parsed && typeof parsed === 'object' && (parsed.verdict || parsed.speech_summaries)) {
            return { ...report, ...parsed, convergence_note: undefined }
          }
        }
      } catch { /* 원본 유지 */ }
    }
    return report
  })()

  // AI가 JSON 문자열을 필드에 직접 넣는 경우 파싱
  const verdict = parseVerdict(effectiveReport.verdict)
  const speechSummaries = parseSpeechSummaries(effectiveReport.speech_summaries)
  const keyPoints = parseStringArray(effectiveReport.key_points)
  const factChecks = parseFactChecks(effectiveReport.fact_checks)

  const winner = verdict?.winner
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
        <div className="px-6 pt-5 pb-4 border-b flex items-start gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex-1 text-center">
            <p className="text-xs font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--accent)' }}>FINAL CONCLUSION</p>
            <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>최종 결론</h2>
            <p className="text-xs mt-1.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{topic}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border transition-colors hover:bg-white/10"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              title="닫기"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-5 sm:p-6 space-y-5">

          {/* 1) 발언 요약 */}
          {speechSummaries && speechSummaries.length > 0 && (
            <section className="report-section" style={{ animationDelay: '0ms' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>① 각 발언 요약</p>
              <div className="space-y-2">
                {speechSummaries.map((s, i) => {
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
          {keyPoints && keyPoints.length > 0 && (
            <section className="p-4 rounded-xl border report-section" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)', animationDelay: '80ms' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>② 핵심 논점 정리</p>
              <ul className="space-y-2">
                {keyPoints.map((pt, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-black shrink-0 text-xs pt-0.5" style={{ color: 'var(--accent)' }}>{i + 1}.</span>
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 3) 주장 검증 (팩트 체크) */}
          {factChecks && factChecks.length > 0 && (
            <section className="p-4 rounded-xl border report-section" style={{ borderColor: 'rgba(245,158,11,0.3)', backgroundColor: 'rgba(245,158,11,0.05)', animationDelay: '160ms' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#f59e0b' }}>③ 주장 검증 (팩트 체크)</p>
              <ul className="space-y-1.5">
                {factChecks.map((fc, i) => {
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
          {!factChecks && effectiveReport.fact_errors && effectiveReport.fact_errors.length > 0 && (
            <section className="p-4 rounded-xl border report-section" style={{ borderColor: 'rgba(245,158,11,0.3)', backgroundColor: 'rgba(245,158,11,0.05)', animationDelay: '160ms' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#f59e0b' }}>③ 팩트 오류</p>
              <ul className="space-y-1">
                {effectiveReport.fact_errors.map((e, i) => (
                  <li key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-bold uppercase" style={{ color: '#f59e0b' }}>{e.speaker}</span>: {e.note ?? ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 4) 최종 의견 / 주장 우위 */}
          {verdict && (
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
                    {verdict.reason && (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{verdict.reason}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>결론 없음 — 의견 정리</p>
                    {verdict.conclusion && (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{verdict.conclusion}</p>
                    )}
                  </>
                )}
              </div>
            </section>
          )}

          {/* 레거시 수렴 판정 호환 */}
          {!verdict && effectiveReport.convergence_note && (
            <section className="p-4 rounded-xl border report-section" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)', animationDelay: '240ms' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>⚖️ 수렴 판정</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{effectiveReport.convergence_note}</p>
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
