import { createClient } from '@/lib/supabase/server'
import type { Message, Speaker } from '@/types'

export async function saveMessage(params: {
  debate_id: string
  round_number: number
  speaker: Speaker
  content: string
  has_fact_error?: boolean
  fact_error_note?: string | null
  is_final_round?: boolean
  token_count?: number | null
}): Promise<Message> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sparring_messages')
    .insert({
      debate_id: params.debate_id,
      round_number: params.round_number,
      speaker: params.speaker,
      content: params.content,
      has_fact_error: params.has_fact_error ?? false,
      fact_error_note: params.fact_error_note ?? null,
      is_final_round: params.is_final_round ?? false,
      token_count: params.token_count ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getMessages(debateId: string): Promise<Message[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('sparring_messages')
    .select()
    .eq('debate_id', debateId)
    .order('created_at', { ascending: true })

  return data ?? []
}

export async function updateMessageFactError(messageId: string, factErrorNote: string) {
  const supabase = await createClient()
  await supabase
    .from('sparring_messages')
    .update({ has_fact_error: true, fact_error_note: factErrorNote })
    .eq('id', messageId)
}
