export default function ForbiddenPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="text-center">
        <div className="text-6xl font-black mb-4" style={{ color: 'var(--text-muted)' }}>403</div>
        <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>접근 권한이 없습니다</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>관리자 전용 페이지입니다</p>
      </div>
    </div>
  )
}
