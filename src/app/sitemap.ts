import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sparring-ai.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServiceClient()

  const { data: publicDebates } = await supabase
    .from('sparring_debates')
    .select('id, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(500)

  const debateEntries = (publicDebates ?? []).map((d) => ({
    url: `${BASE_URL}/debate/${d.id}`,
    lastModified: new Date(d.created_at),
    changeFrequency: 'never' as const,
    priority: 0.6,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/debate/new`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...debateEntries,
  ]
}
