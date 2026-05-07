# 🔍 SEO 하네스 (SEO Harness for CLAUDE.md)

> **목적**: 모든 웹 프로젝트 개발 시작 전, 설계 단계부터 SEO를 자동으로 체크하고 반영하도록 Claude Code를 제어하는 행동 규칙 파일입니다.
> **적용 범위**: Next.js + Supabase (메인) / Vite + React / 기타 웹 프레임워크 범용 적용 가능

---

## ⚙️ 활성화 조건

이 하네스는 아래 조건 중 하나라도 해당될 때 **자동 활성화**됩니다:

- 새 웹 프로젝트 생성 시작 시
- 새 페이지(route/page) 컴포넌트 생성 시
- `index.html` / `layout.tsx` / `_document.tsx` 수정 시
- Landing page, 서비스 소개 페이지 제작 시

---

## 📋 설계 단계 SEO 체크리스트 (Plan Mode 진입 시 자동 수행)

새 프로젝트 또는 페이지 설계를 시작할 때, **코드 작성 이전에** 아래 항목을 반드시 확인하고 설계에 반영하라.

### 1. 검색 엔진 크롤링 설정
- [ ] `robots.txt` 생성 여부 확인 (허용/차단 경로 명시)
- [ ] `sitemap.xml` 또는 동적 sitemap 생성 계획 수립
- [ ] 내부 링크 구조가 계층적으로 설계되었는지 확인

### 2. 온페이지(On-Page) SEO 필수 요소
- [ ] 각 페이지마다 고유한 `<title>` 태그 존재 여부
  - 형식: `{페이지명} | {서비스명}` (50~60자 이내)
- [ ] 각 페이지마다 고유한 `<meta name="description">` 존재 여부
  - 형식: 핵심 키워드 포함, 120~160자 이내
- [ ] `<h1>` ~ `<h6>` Heading 계층 구조 준수 여부
  - 페이지당 `<h1>` 은 반드시 1개만 사용
- [ ] URL 구조가 의미 있는 슬러그로 설계되었는지 확인
  - Good: `/ai-agent-automation-guide`
  - Bad: `/page?id=123`
- [ ] 내부 링크가 관련 콘텐츠끼리 유기적으로 연결되었는지 확인

### 3. Favicon 설정
- [ ] `/public/favicon.ico` 또는 `.svg` 존재 여부
- [ ] `<link rel="icon">` 태그가 `<head>`에 포함되었는지 확인
- [ ] 16x16 / 32x32 / 180x180 (Apple Touch Icon) 사이즈 대응 여부

### 4. Open Graph (SNS 공유 최적화)
- [ ] `og:title` — 페이지 제목
- [ ] `og:description` — 페이지 설명 (120자 이내)
- [ ] `og:image` — 대표 이미지 (1200x630px 권장)
- [ ] `og:url` — 정규 URL
- [ ] `og:type` — `website` 또는 `article`
- [ ] `twitter:card` — `summary_large_image` 권장

### 5. 키워드 전략 확인 (설계 전 1회)
- [ ] 서비스의 **롱테일 키워드** 3개 이상 정의 (초기 SEO 핵심)
  - 예: `"소규모 사업체 AI 업무 자동화 도구"`, `"n8n 워크플로우 무료 템플릿"`
- [ ] 각 페이지의 **타겟 키워드** 1개 지정
- [ ] 키워드가 title, description, h1, 본문에 자연스럽게 포함되었는지 확인

---

## 🛠️ 프레임워크별 구현 가이드

### Next.js (App Router) — 메인 스택
```tsx
// app/layout.tsx 또는 app/[page]/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '{페이지명} | {서비스명}',
  description: '{타겟 키워드 포함 120~160자 설명}',
  openGraph: {
    title: '{페이지명} | {서비스명}',
    description: '{설명}',
    url: 'https://your-domain.com',
    siteName: '{서비스명}',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '{페이지명} | {서비스명}',
    description: '{설명}',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

### Next.js — robots.txt & sitemap (App Router)
```ts
// app/robots.ts
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://your-domain.com/sitemap.xml',
  }
}

// app/sitemap.ts
export default function sitemap() {
  return [
    { url: 'https://your-domain.com', lastModified: new Date() },
    { url: 'https://your-domain.com/about', lastModified: new Date() },
  ]
}
```

### Vite + React — 범용
```html
<!-- index.html <head> 내부 -->
<title>{페이지명} | {서비스명}</title>
<meta name="description" content="{설명}" />
<link rel="icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />

<!-- Open Graph -->
<meta property="og:title" content="{제목}" />
<meta property="og:description" content="{설명}" />
<meta property="og:image" content="https://your-domain.com/og-image.png" />
<meta property="og:url" content="https://your-domain.com" />
<meta property="og:type" content="website" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
```

---

## 🚫 SEO 위반 패턴 — 절대 생성하지 말 것

| 위반 패턴 | 이유 |
|-----------|------|
| `<title>` 없는 페이지 생성 | 크롤러가 페이지 의미를 파악 불가 |
| 모든 페이지에 동일한 `title`/`description` | 중복 콘텐츠로 랭킹 하락 |
| `<h1>` 2개 이상 사용 | 구조 혼란으로 랭킹 신호 약화 |
| `?id=123` 형태의 URL | 의미 없는 URL은 색인 우선순위 하락 |
| `og:image` 누락 | 카카오톡/SNS 공유 시 썸네일 없음 |
| favicon 미설정 | 사용자 신뢰도 하락, CTR 감소 |

---

## 📌 CLAUDE.md 삽입 방법

이 파일의 내용을 프로젝트 루트의 `CLAUDE.md`에 아래와 같이 추가하라:

```markdown
## SEO 하네스
[SEO_HARNESS.md 전체 내용 붙여넣기]
```

또는 별도 파일로 분리 후 참조:
```markdown
## SEO 하네스
@SEO_HARNESS.md 참조
```

---

## 🔁 개발 루프에서의 SEO 체크 시점

```
[프로젝트 시작]
       ↓
  Plan Mode 진입
       ↓
  SEO 체크리스트 자동 수행 (위 5개 항목)
       ↓
  키워드 전략 확정
       ↓
  레이아웃/메타태그 먼저 설계
       ↓
  기능 개발 시작
       ↓
  새 페이지 추가 시 → 온페이지 SEO 항목 재확인
       ↓
  배포 전 최종 점검 (robots.txt / sitemap / OG 이미지 존재 여부)
```
