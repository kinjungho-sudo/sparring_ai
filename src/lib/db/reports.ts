import { createClient } from '@/lib/supabase/server'
import type { Report } from '@/types'

export async function saveReport(params: {
  debate_id: string
  red_summary?: string
  blue_summary?: string
  new_perspectives?: string[] | null
  argument_gap?: string
  next_question?: string
  fact_errors?: Array<{ claim: string; note: string }>
  convergence_note?: string
}): Promise<Report> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sparring_reports')
    .insert({
      debate_id: params.debate_id,
      red_summary: params.red_summary ?? null,
      blue_summary: params.blue_summary ?? null,
      new_perspectives: params.new_perspectives ?? null,
      argument_gap: params.argument_gap ?? null,
      next_question: params.next_question ?? null,
      fact_errors: params.fact_errors ?? null,
      convergence_note: params.convergence_note ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getReport(debateId: string): Promise<Report | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('sparring_reports')
    .select()
    .eq('debate_id', debateId)
    .single()

  return data
}
