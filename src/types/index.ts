export type Language = 'ko' | 'en'
export type UserPlan = 'free' | 'pro'
export type Speaker = 'red' | 'blue' | 'host'
export type DebateStatus = 'in_progress' | 'completed' | 'early_end'
export type TopicType = 'factual' | 'strategic' | 'values' | 'legal_medical_investment'

export interface Debate {
  id: string
  user_id: string | null
  topic: string
  topic_type: TopicType | null
  rounds: number
  is_virtual: boolean
  disclaimer_agreed: boolean
  language: Language
  is_sample: boolean
  status: DebateStatus
  created_at: string
  completed_at: string | null
  debate_config?: DebateConfig | null
}

export interface Message {
  id: string
  debate_id: string
  round_number: number
  speaker: Speaker
  content: string
  has_fact_error: boolean
  fact_error_note: string | null
  is_final_round: boolean
  token_count: number | null
  created_at: string
}

export interface Report {
  id: string
  debate_id: string
  /** new structured fields */
  speech_summaries: Array<{ speaker: string; round: number; summary: string }> | null
  key_points: string[] | null
  fact_checks: Array<{ speaker: string; verdict?: string | null; note: string | null; source_label?: string | null; source_url?: string | null }> | null
  verdict: { winner: 'red' | 'blue' | null; reason?: string | null; conclusion?: string | null } | null
  /** legacy fields */
  red_summary: string | null
  blue_summary: string | null
  new_perspectives: string[] | null
  argument_gap: string | null
  next_question: string | null
  fact_errors: Array<{ claim: string; note: string }> | null
  convergence_note: string | null
  created_at: string
}

export interface Usage {
  id: string
  user_id: string
  date: string
  count: number
}

export interface ReportData {
  speech_summaries?: Array<{ speaker: string; round: number; summary: string }> | null
  key_points?: string[] | null
  fact_checks?: Array<{ speaker: string; verdict?: string | null; note: string | null; source_label?: string | null; source_url?: string | null }> | null
  verdict?: {
    winner: 'red' | 'blue' | null
    reason?: string | null
    conclusion?: string | null
  } | null
  insight?: string | null
  /** @deprecated legacy fields kept for backward-compat when loading old saved reports */
  red_summary?: string | null
  blue_summary?: string | null
  new_perspectives?: string[] | null
  argument_gap?: string | null
  next_question?: string | null
  fact_errors?: Array<{ speaker: string; note: string | null }> | null
  convergence_note?: string | null
}

export interface ValidateResult {
  is_factual: boolean
  is_sensitive: boolean
  topic_type: TopicType
  message: string
}

export type DebaterTone = 'assertive' | 'analytical' | 'emotional' | 'socratic'
export type DebateModel = 'claude-sonnet-4-6' | 'gemini-2-flash' | 'gpt-4o-mini'
export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'

export interface DebaterConfig {
  persona?: string
  tone?: DebaterTone
  knowledge?: string
  voice?: TTSVoice
}

export interface DebateConfig {
  red?: DebaterConfig
  blue?: DebaterConfig
  model?: DebateModel
}

export interface DebateState {
  debate: Debate | null
  messages: Message[]
  currentRound: number
  isRedStreaming: boolean
  isBlueStreaming: boolean
  isFactChecking: boolean
  isComplete: boolean
  report: Report | null
  showDisclaimer: boolean
  showLoginPrompt: boolean
}
