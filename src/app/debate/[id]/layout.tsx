export default function DebateLayout({ children }: { children: React.ReactNode }) {
  // 토론 페이지는 DebateArena가 fixed 풀스크린으로 렌더링되므로
  // 부모 레이아웃의 main flex-1이 작동하도록 최소 높이만 보장
  return <>{children}</>
}
