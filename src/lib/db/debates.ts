import { createClient } from '@/lib/supabase/server'
import type { Debate, Language, DebateConfig } from '@/types'

export async function createDebate(params: {
  user_id: string | null
  topic: string
  topic_type?: string
  rounds: number
  is_virtual?: boolean
  disclaimer_agreed?: boolean
  language: Language
  is_sample?: boolean
  debate_config?: DebateConfig | null
}): Promise<Debate> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sparring_debates')
    .insert({
      user_id: params.user_id,
      topic: params.topic,
      topic_type: params.topic_type ?? null,
      rounds: params.rounds,
      is_virtual: params.is_virtual ?? false,
      disclaimer_agreed: params.disclaimer_agreed ?? false,
      language: params.language,
      is_sample: params.is_sample ?? false,
      status: 'in_progress',
      debate_config: params.debate_config ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function completeDebate(debateId: string, status: 'completed' | 'early_end' = 'completed') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('sparring_debates')
    .update({ status, completed_at: new Date().toISOString() })
    .eq('id', debateId)

  if (error) throw error
}

export async function getDebate(debateId: string): Promise<Debate | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('sparring_debates')
    .select()
    .eq('id', debateId)
    .single()

  return data
}
