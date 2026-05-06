import { createServiceClient } from '@/lib/supabase/server'

export async function logApiCall({
  debate_id,
  endpoint,
  duration_ms,
  status,
  error_message,
}: {
  debate_id?: string | null
  endpoint: string
  duration_ms: number
  status: 'success' | 'error'
  error_message?: string | null
}) {
  try {
    const supabase = await createServiceClient()
    await supabase.from('sparring_api_logs').insert({
      debate_id: debate_id ?? null,
      endpoint,
      duration_ms,
      status,
      error_message: error_message ?? null,
    })
  } catch {
    // log failures must never break the main flow
  }
}
