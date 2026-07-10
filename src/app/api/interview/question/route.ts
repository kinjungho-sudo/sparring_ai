import { NextRequest, NextResponse } from 'next/server'
import { streamText, MAX_TOKENS } from '@/lib/ai/stream'
import { buildInterviewerPrompt } from '@/lib/ai/prompts'
import type { Language, DebateModel } from '@/types'
import type { InterviewPromptContext } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Omit<InterviewPromptContext, never> & { model?: DebateModel }
    const { model = 'claude-haiku-4-5-20251001', ...ctx } = body

    const prompt = buildInterviewerPrompt(ctx as InterviewPromptContext)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamText(model, prompt, MAX_TOKENS, (text) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          })
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (e) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(e) })}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[interview/question]', err)
    return NextResponse.json({ error: '면접 질문 생성 중 오류' }, { status: 500 })
  }
}
