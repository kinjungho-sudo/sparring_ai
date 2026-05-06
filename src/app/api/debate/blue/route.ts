import { NextRequest } from 'next/server'
import { anthropic, MODEL, MAX_TOKENS } from '@/lib/ai/claude'
import { buildBluePrompt } from '@/lib/ai/prompts'
import type { Language } from '@/types'

export async function POST(req: NextRequest) {
  const { topic, currentRound, totalRounds, language, history } = await req.json() as {
    topic: string
    currentRound: number
    totalRounds: number
    language: Language
    history: Array<{ speaker: string; content: string }>
  }

  const prompt = buildBluePrompt({ topic, currentRound, totalRounds, language, history })

  const stream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }],
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      let tokenCount = 0
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`))
        }
        if (chunk.type === 'message_delta' && chunk.usage) {
          tokenCount = chunk.usage.output_tokens
        }
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, tokenCount })}\n\n`))
      controller.close()
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
