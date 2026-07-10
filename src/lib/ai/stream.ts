import Anthropic from '@anthropic-ai/sdk'
import type { DebateModel } from '@/types'

export const MAX_TOKENS = 1500

// SSE 스트리밍: 각 모델 SDK를 통일된 인터페이스로 추상화
export async function streamText(
  model: DebateModel,
  prompt: string,
  maxTokens: number,
  onChunk: (text: string) => void
): Promise<{ tokenCount: number }> {
  if (model === 'gpt-4o-mini') {
    return streamOpenAI(prompt, maxTokens, onChunk)
  }
  return streamClaude(prompt, maxTokens, onChunk)
}

// Non-streaming (factcheck, report용)
export async function generateText(
  model: DebateModel,
  prompt: string,
  maxTokens: number
): Promise<string> {
  if (model === 'gpt-4o-mini') {
    return generateOpenAI(prompt, maxTokens)
  }
  return generateClaude(prompt, maxTokens)
}

// ── Claude ──────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'

async function streamClaude(prompt: string, maxTokens: number, onChunk: (text: string) => void): Promise<{ tokenCount: number }> {
  const stream = await anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  })
  let tokenCount = 0
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      onChunk(chunk.delta.text)
    }
    if (chunk.type === 'message_delta' && chunk.usage) {
      tokenCount = chunk.usage.output_tokens
    }
  }
  return { tokenCount }
}

async function generateClaude(prompt: string, maxTokens: number): Promise<string> {
  const msg = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  })
  return msg.content[0].type === 'text' ? msg.content[0].text : ''
}

// ── OpenAI ───────────────────────────────────────────────────────────────────

async function streamOpenAI(prompt: string, maxTokens: number, onChunk: (text: string) => void): Promise<{ tokenCount: number }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      stream: true,
      stream_options: { include_usage: true },
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`OpenAI API error: ${resp.status} ${err}`)
  }

  const reader = resp.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let tokenCount = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') continue
      try {
        const data = JSON.parse(payload)
        const text = data.choices?.[0]?.delta?.content
        if (text) onChunk(text)
        if (data.usage?.completion_tokens) {
          tokenCount = data.usage.completion_tokens
        }
      } catch { /* skip */ }
    }
  }

  return { tokenCount }
}

async function generateOpenAI(prompt: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!resp.ok) throw new Error(`OpenAI API error: ${resp.status}`)
  const data = await resp.json()
  return data.choices?.[0]?.message?.content ?? ''
}
