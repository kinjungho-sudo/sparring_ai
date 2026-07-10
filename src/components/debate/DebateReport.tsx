'use client'

import Link from 'next/link'
import type { ReportData } from '@/types'
import ShareButtons from './ShareButtons'
import { useLanguage } from '@/contexts/LanguageContext'

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
  const { t, language } = useLanguage()
  // convergence_note에 JSON이 담긴 경우 (폴백 케이스) 재파싱 — 잘린 JSON도 괄호 보완 후 복구
  const effectiveReport: ReportData = (() => {
    if (!report.verdict && !report.speech_summaries && report.convergence_note) {
      try {
        // 코드블록 제거 후 { 부터 추출
        const stripped = report.convergence_note.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '')
        const start = stripped.indexOf('{')
        if (start === -1) return report
        let jsonStr = stripped.slice(start)

        // 완전한 JSON 먼저 시도
        const end = jsonStr.lastIndexOf('}')
        if (end > 0) {
          try {
            const parsed = JSON.parse(jsonStr.slice(0, end + 1))
            if (parsed?.speech_summaries || parsed?.verdict) {
              return { ...report, ...parsed, convergence_note: undefined }
            }
          } catch { /* 잘린 경우 아래에서 처리 */ }
        }

        // 잘린 JSON — 열린 문자열 먼저 닫고 괄호 보완 후 재시도
        const quoteCount = (jsonStr.match(/(?<!\\)"/g) ?? []).length
        if (quoteCount % 2 !== 0) jsonStr += '"'
        const openB = (jsonStr.match(/\{/g) ?? []).length
        const closeB = (jsonStr.match(/\}/g) ?? []).length
        const openBr = (jsonStr.match(/\[/g) ?? []).length
        const closeBr = (jsonStr.match(/\]/g) ?? []).length
        jsonStr += ']'.repeat(Math.max(0, openBr - closeBr)) + '}'.repeat(Math.max(0, openB - closeB))
        const parsed = JSON.parse(jsonStr)
        if (parsed?.speech_summaries || parsed?.verdict || parsed?.key_points) {
          return { ...report, ...parsed, convergence_note: undefined }
        }
      } catch { /* 복구 불가 — 원본 유지 */ }
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
  const winnerLabel = winner ? (winner === 'red'
    ? (language === 'ko' ? '🔴 RED 찬성' : '🔴 RED (For)')
    : (language === 'ko' ? '🔵 BLUE 반대' : '🔵 BLUE (Against)')) : null

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto flex items-start justify-center pt-20 pb-8 px-4"
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
            <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{t('최종 결론', 'Final Conclusion')}</h2>
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
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>① {t('각 발언 요약', 'Speech Summaries')}</p>
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
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>② {t('핵심 논점 정리', 'Key Points')}</p>
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
            <section className="rounded-xl border overflow-hidden report-section" style={{ borderColor: 'rgba(245,158,11,0.3)', animationDelay: '160ms' }}>
              <div className="px-4 py-2.5 border-b" style={{ borderColor: 'rgba(245,158,11,0.2)', backgroundColor: 'rgba(245,158,11,0.08)' }}>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#f59e0b' }}>③ {t('팩트 체크', 'Fact Check')}</p>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(245,158,11,0.1)' }}>
                {factChecks.map((fc, i) => {
                  const sp = SPEAKER_LABEL[fc.speaker] ?? { label: fc.speaker, color: 'var(--text-muted)' }
                  const verdict = fc.verdict ?? 'FALSE'
                  const vs = verdict === 'TRUE'
                    ? { label: '✓ TRUE', color: '#22c55e', bg: 'rgba(34,197,94,0.06)' }
                    : verdict === 'MISLEADING'
                    ? { label: '△ MISLEADING', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)' }
                    : { label: '✗ FALSE', color: '#ef4444', bg: 'rgba(239,68,68,0.06)' }
                  return (
                    <div key={i} className="px-4 py-3" style={{ backgroundColor: vs.bg }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-black" style={{ color: sp.color }}>{sp.label}</span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded" style={{ color: vs.color, backgroundColor: `${vs.color}18`, border: `1px solid ${vs.color}40` }}>{vs.label}</span>
                      </div>
                      <p className="text-xs leading-relaxed mb-1" style={{ color: 'var(--text-secondary)' }}>{fc.note}</p>
                      {fc.source_url && (
                        <a href={fc.source_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-semibold underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity"
                          style={{ color: '#f59e0b' }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          {fc.source_label ?? t('출처 확인', 'View source')}
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* 레거시 팩트 오류 (이전 저장 데이터 호환) */}
          {!factChecks && effectiveReport.fact_errors && effectiveReport.fact_errors.length > 0 && (
            <section className="p-4 rounded-xl border report-section" style={{ borderColor: 'rgba(245,158,11,0.3)', backgroundColor: 'rgba(245,158,11,0.05)', animationDelay: '160ms' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#f59e0b' }}>③ {t('팩트 오류', 'Fact Errors')}</p>
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
                  ④ {t('최종 의견', 'Final Verdict')}
                </p>
                {winner ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-black" style={{ color: winnerColor }}>{winnerLabel} {t('주장 우위', 'argument prevails')}</span>
                    </div>
                    {verdict.reason && (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{verdict.reason}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>{t('결론 없음 — 의견 정리', 'No clear winner — summary of positions')}</p>
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
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>⚖️ {t('수렴 판정', 'Convergence Verdict')}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{effectiveReport.convergence_note}</p>
            </section>
          )}

          {/* ⑤ 인사이트 */}
          {effectiveReport.insight && (
            <section className="report-section" style={{ animationDelay: '320ms' }}>
              <div
                className="p-5 rounded-xl border relative overflow-hidden"
                style={{
                  borderColor: 'rgba(99,102,241,0.25)',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)',
                }}
              >
                <div className="absolute top-3 right-4 text-2xl opacity-10 select-none">💡</div>
                <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
                  ⑤ {t('이 토론이 말하는 것', 'Key Takeaway')}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>
                  {effectiveReport.insight}
                </p>
              </div>
            </section>
          )}

        </div>

        {/* 공유 */}
        {debateId && (
          <div className="px-5 sm:px-6 pb-4 pt-0">
            <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>{t('이 토론 공유하기', 'Share this debate')}</p>
              <ShareButtons debateId={debateId} topic={topic} />
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2 px-5 sm:px-6 pb-6">
          <Link
            href="/debate/new"
            className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors flex items-center justify-center"
          >
            {t('새 토론 시작', 'New Debate')}
          </Link>
          <Link
            href="/"
            className="h-11 px-4 rounded-xl border font-semibold text-sm transition-colors flex items-center justify-center hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            {t('홈', 'Home')}
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="h-11 px-4 rounded-xl border font-semibold text-sm transition-colors flex items-center justify-center hover:bg-white/5"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              {t('닫기', 'Close')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
