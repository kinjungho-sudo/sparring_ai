import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODEL, MAX_TOKENS } from '@/lib/ai/claude'
import { buildRedPrompt } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'
import { logApiCall } from '@/lib/db/api-logs'
import type { Language } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    debate_id?: string
    topic: string
    currentRound: number
    totalRounds: number
    language: Language
    history: Array<{ speaker: string; content: string }>
  }
  const { debate_id, topic, currentRound, totalRounds, language, history } = body

  // Auth check: sample debates pass through; others require session + ownership
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

  const prompt = buildRedPrompt({ topic, currentRound, totalRounds, language, history })

  const startTime = Date.now()
  let streamError: string | null = null

  const stream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }],
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      let tokenCount = 0
      try {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`))
          }
          if (chunk.type === 'message_delta' && chunk.usage) {
            tokenCount = chunk.usage.output_tokens
          }
        }
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
