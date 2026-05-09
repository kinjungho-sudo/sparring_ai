import { NextRequest, NextResponse } from 'next/server'
import { streamText, MAX_TOKENS } from '@/lib/ai/stream'
import { buildRedPrompt } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'
import { logApiCall } from '@/lib/db/api-logs'
import type { Language, DebaterConfig, DebateModel } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    debate_id?: string
    topic: string
    currentRound: number
    totalRounds: number
    language: Language
    history: Array<{ speaker: string; content: string }>
    red_config?: DebaterConfig
    model?: DebateModel
  }
  const { debate_id, topic, currentRound, totalRounds, language, history, red_config, model = 'claude-sonnet-4-6' } = body

  if (debate_id) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: debate } = await supabase
      .from('sparring_debates')
      .select('user_id, is_sample')
      .eq('id', debate_id)
      .single()

    if (!debate) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!debate.is_sample && (!user || debate.user_id !== user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const prompt = buildRedPrompt({ topic, currentRound, totalRounds, language, history, config: red_config })

  const startTime = Date.now()
  let streamError: string | null = null

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      let tokenCount = 0
      try {
        const result = await streamText(model, prompt, MAX_TOKENS, (text) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
        })
        tokenCount = result.tokenCount
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, tokenCount })}\n\n`))
      } catch (err) {
        streamError = err instanceof Error ? err.message : 'stream error'
      } finally {
        controller.close()
        logApiCall({ debate_id, endpoint: '/api/debate/red', duration_ms: Date.now() - startTime, status: streamError ? 'error' : 'success', error_message: streamError })
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
