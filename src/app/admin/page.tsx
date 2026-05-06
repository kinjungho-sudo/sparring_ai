import { createServiceClient, createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const ADMIN_WHITELIST = (process.env.ADMIN_WHITELIST || '').split(',').map(e => e.trim())

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_WHITELIST.includes(user.email ?? '')) redirect('/403')
}

async function getDashboardStats() {
  const supabase = await createServiceClient()
  const today = new Date().toISOString().split('T')[0]
  const monthStart = today.slice(0, 7) + '-01'

  const [usersResult, debatesTodayResult, debatesMonthResult, completedResult] = await Promise.all([
    supabase.from('sparring_debates').select('user_id').not('user_id', 'is', null),
    supabase.from('sparring_debates').select('id', { count: 'exact' }).gte('created_at', today),
    supabase.from('sparring_debates').select('id', { count: 'exact' }).gte('created_at', monthStart),
    supabase.from('sparring_debates').select('id', { count: 'exact' }).eq('status', 'completed'),
  ])

  const uniqueUsers = new Set((usersResult.data ?? []).map((d: { user_id: string }) => d.user_id)).size

  return {
    uniqueUsers,
    debatesToday: debatesTodayResult.count ?? 0,
    debatesMonth: debatesMonthResult.count ?? 0,
    completedTotal: completedResult.count ?? 0,
  }
}

const navItems = [
  { href: '/admin/customers', label: '고객 관리', icon: '👥' },
  { href: '/admin/debates', label: '토론 로그', icon: '💬' },
  { href: '/admin/api-cost', label: 'API 비용', icon: '💰' },
  { href: '/admin/logs', label: '시스템 로그', icon: '📋' },
]

export default async function AdminPage() {
  await requireAdmin()
  const stats = await getDashboardStats()

  const cards = [
    { label: '총 사용자', value: stats.uniqueUsers, icon: '👤' },
    { label: '오늘 토론', value: stats.debatesToday, icon: '⚡' },
    { label: '이번 달 토론', value: stats.debatesMonth, icon: '📅' },
    { label: '완료된 토론', value: stats.completedTotal, icon: '✅' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>ADMIN</p>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>대시보드</h1>
        </div>
        <Link href="/" className="text-sm" style={{ color: 'var(--text-muted)' }}>← 홈</Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-3xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{card.value}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* 네비게이션 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="p-6 rounded-2xl border text-center transition-colors hover:bg-white/5"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
