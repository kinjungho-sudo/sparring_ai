import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createDebate } from '@/lib/db/debates'
import { checkAndIncrementUsage } from '@/lib/db/usage'
import type { Language, DebateConfig, DebateMode } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { topic, topic_type, rounds, is_virtual, disclaimer_agreed, language, is_sample, debate_config, mode } = await req.json() as {
      topic: string
      topic_type?: string
      rounds: number
      is_virtual?: boolean
      disclaimer_agreed?: boolean
      language: Language
      is_sample?: boolean
      debate_config?: DebateConfig
      mode?: DebateMode
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 샘플 토론이 아닌 경우 로그인 필수
    if (!is_sample && !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 사용량 제한 체크 (로그인 유저에만 적용, pro는 무제한)
    if (user && !is_sample) {
      const { allowed, count, plan } = await checkAndIncrementUsage(user.id)
      if (!allowed) {
        return NextResponse.json({ error: 'USAGE_LIMIT', count, plan }, { status: 429 })
      }
    }

    const debate = await createDebate({
      user_id: user?.id ?? null,
      topic,
      topic_type,
      rounds,
      is_virtual,
      disclaimer_agreed,
      language,
      is_sample: is_sample ?? false,
      debate_config: debate_config ?? null,
      mode: mode ?? 'debate',
    })

    return NextResponse.json({ debate })
  } catch (err) {
    console.error('[debate/start]', err)
    return NextResponse.json({ error: '토론 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
