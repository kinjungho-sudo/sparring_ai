import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createDebate } from '@/lib/db/debates'
import { checkAndIncrementUsage } from '@/lib/db/usage'
import type { Language } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { topic, topic_type, rounds, is_virtual, disclaimer_agreed, language, is_sample } = await req.json() as {
      topic: string
      topic_type?: string
      rounds: number
      is_virtual?: boolean
      disclaimer_agreed?: boolean
      language: Language
      is_sample?: boolean
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 샘플 토론이 아닌 경우 로그인 필수
    if (!is_sample && !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 일 3회 제한 체크 (로그인 유저에만 적용)
    if (user && !is_sample) {
      const { allowed, count } = await checkAndIncrementUsage(user.id)
      if (!allowed) {
        return NextResponse.json({ error: 'USAGE_LIMIT', count }, { status: 429 })
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
    })

    return NextResponse.json({ debate })
  } catch (err) {
    console.error('[debate/start]', err)
    return NextResponse.json({ error: '토론 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
