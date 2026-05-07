# 🗑 lash-salon-admin 프로젝트 정리 가이드

이 문서는 **lash-salon-admin 프로젝트를 완전히 종료하고 모든 흔적을 깔끔하게 삭제**할 때 사용합니다.

> ⚠️ **삭제는 영구입니다. 반드시 백업 후 진행하세요.**

---

## 📋 시작 전 체크리스트

```
[ ] 더 이상 이 프로젝트를 사용하지 않는다는 확신이 있다
[ ] 클라이언트(살롱 사장님)에게 인계할 데이터가 없다
[ ] 포트폴리오용 스크린샷/영상은 미리 캡처했다
[ ] 코드 자체는 GitHub에 보관할지 결정했다
   - 보관 → 레포는 남기고 Vercel 연결만 해제
   - 미보관 → 레포까지 삭제
```

---

## 🗂 삭제 대상 자원 전체 목록

| 분류 | 자원 | 식별자 |
|------|------|--------|
| 1. 데이터베이스 | Supabase 테이블 6개 | `lash_salon_*` prefix |
| 2. 데이터베이스 | Supabase RLS 정책 | `lash_salon_*` prefix |
| 3. 데이터베이스 | Supabase Storage 버킷 (사용 시) | `lash-salon-*` prefix |
| 4. 인증 | Supabase Auth 사용자 | 사장님 계정 1개 |
| 5. 외부 API | GCP 프로젝트 | `lash-salon-admin-001` |
| 6. 외부 API | Kakao 앱 | `lash-salon-admin` |
| 7. 외부 API | Naver Developers 앱 | `lash-salon-admin-trends` |
| 8. 배포 | Vercel 프로젝트 | `lash-salon-admin` |
| 9. 코드 | GitHub 레포 | `lash-salon-admin` |
| 10. 로컬 | 프로젝트 폴더 | `~/projects/lash-salon-admin` |
| 11. 로컬 | .env.local 백업 | (있으면) |
| 12. 비밀번호 관리자 | 저장된 키들 | `lash-salon-*` 검색 |

---

## ⚙️ Step 0: 백업 (선택, 권장)

### 0-1. DB 데이터 CSV 백업

```
Supabase Dashboard → Table Editor → 각 lash_salon_* 테이블
  → "..." 메뉴 → "Export to CSV"
  → 다음 6개 파일 저장:
     - lash_salon_owner_profiles.csv
     - lash_salon_customers.csv
     - lash_salon_menus.csv
     - lash_salon_bookings.csv
     - lash_salon_trend_keywords.csv
     - lash_salon_trend_history.csv
```

### 0-2. 코드 zip 백업 (GitHub 삭제할 거면)

```bash
cd ~/projects
zip -r lash-salon-admin-backup.zip lash-salon-admin -x "*/node_modules/*" -x "*/.next/*"
# 외장 드라이브 또는 NAS로 이동
```

### 0-3. 환경변수 백업 (재사용 가능성 있으면)

```bash
cp ~/projects/lash-salon-admin/.env.local ~/keys/archive/lash-salon-admin.env.bak
```

---

## 🗃 Step 1: Supabase 정리 (가장 중요)

> ⚠️ **공유 Supabase 인스턴스라 prefix 매칭이 정확해야 합니다. 다른 프로젝트 데이터 잘못 지우면 복구 불가.**

### 1-1. Supabase Dashboard 접속

```
https://supabase.com/dashboard
→ lash-salon-admin이 사용 중인 인스턴스 선택
```

### 1-2. SQL Editor에서 정리 스크립트 실행

```sql
-- =====================================================
-- ⚠️ 실행 전 확인: 다음 쿼리로 삭제 대상 미리 확인
-- =====================================================

-- 삭제될 테이블 목록 확인
SELECT tablename FROM pg_tables 
WHERE tablename LIKE 'lash_salon_%' 
AND schemaname = 'public';

-- 삭제될 정책 목록 확인
SELECT tablename, policyname FROM pg_policies 
WHERE policyname LIKE 'lash_salon_%';

-- =====================================================
-- 위 결과가 lash_salon_*만 나오는지 반드시 확인 후 아래 실행
-- =====================================================

-- 1. RLS 정책 일괄 삭제
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE policyname LIKE 'lash_salon_%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- 2. 테이블 일괄 삭제 (의존성 순서: history → keywords → bookings → menus → customers → owner_profiles)
DROP TABLE IF EXISTS lash_salon_trend_history CASCADE;
DROP TABLE IF EXISTS lash_salon_trend_keywords CASCADE;
DROP TABLE IF EXISTS lash_salon_bookings CASCADE;
DROP TABLE IF EXISTS lash_salon_menus CASCADE;
DROP TABLE IF EXISTS lash_salon_customers CASCADE;
DROP TABLE IF EXISTS lash_salon_owner_profiles CASCADE;

-- 3. 정리 결과 확인
SELECT tablename FROM pg_tables 
WHERE tablename LIKE 'lash_salon_%' 
AND schemaname = 'public';
-- → 결과가 0행이어야 정상
```

### 1-3. Storage 버킷 삭제 (사용한 경우)

```
Dashboard → Storage
→ lash-salon-* 으로 시작하는 모든 버킷
→ 각각 우클릭 → Empty bucket → Delete bucket
```

### 1-4. Auth 사용자 삭제 (이 프로젝트만 사용한 사장님 계정)

```
⚠️ 신중: auth.users는 다른 프로젝트와 공유될 수 있음
       사장님 본인 계정 외 다른 사용자는 절대 건드리지 말 것

Dashboard → Authentication → Users
→ lash-salon-admin 사장님 이메일 검색
→ 해당 사용자만 "..." → Delete user
```

---

## ☁️ Step 2: Google Cloud Platform 정리

### 2-1. GCP 프로젝트 종료 (가장 깔끔한 방법)

프로젝트 통째로 종료하면 OAuth Client ID, API 활성화, 관련 모든 자원이 한 번에 삭제됩니다.

```
1. https://console.cloud.google.com 접속
2. 상단 프로젝트 드롭다운 → "lash-salon-admin-001" 선택
3. 좌측 메뉴 → "IAM 및 관리자" → "설정" (Settings)
4. "종료" (Shut down) 버튼 클릭
5. 확인창에서 프로젝트 ID 입력 → 종료

⚠️ 30일 후 영구 삭제. 그 전에는 "복원" 가능
```

### 2-2. (대안) OAuth Client만 삭제하고 GCP 프로젝트는 유지

다른 학습 프로젝트와 GCP 프로젝트를 공유했다면:

```
1. GCP Console → "API 및 서비스" → "사용자 인증 정보"
2. "lash-salon-admin-web" Client ID 찾기
3. 우측 휴지통 아이콘 → 삭제
4. OAuth 동의 화면에서 "lash-salon-admin" 앱 정보 정리
```

---

## 💛 Step 3: Kakao Developers 정리

```
1. https://developers.kakao.com/console/app 접속
2. "lash-salon-admin" 앱 클릭
3. 좌측 메뉴 "앱 설정" → "삭제"
4. 비밀번호 재입력 → 삭제
```

⚠️ **다른 학습 프로젝트와 같은 Kakao 앱을 공유 중이면**: 삭제 대신 "Web 플랫폼"에서 lash-salon-admin 도메인만 제거.

---

## 🌐 Step 4: Naver Developers 정리

```
1. https://developers.naver.com/apps/#/list 접속
2. "lash-salon-admin-trends" 앱 클릭
3. 우측 상단 "삭제" 버튼
4. 확인 → 삭제
```

⚠️ **다른 학습 프로젝트와 같은 Naver 앱을 공유 중이면**: 그대로 두고 사용량만 모니터링.

---

## 🚀 Step 5: Vercel 정리

```
1. https://vercel.com/dashboard 접속
2. "lash-salon-admin" 프로젝트 클릭
3. Settings → 페이지 맨 하단 "Delete Project"
4. 프로젝트 이름 입력 → "Delete"

이 작업으로 자동 삭제되는 것:
  ✓ 배포된 모든 버전
  ✓ Vercel 환경변수
  ✓ 도메인 연결
  ✓ 빌드 로그
```

### 5-1. 도메인 연결한 경우 (있으면)

```
도메인 등록 업체에서 DNS 레코드 정리:
  - A 레코드 → Vercel IP 제거
  - CNAME → cname.vercel-dns.com 제거
```

---

## 💻 Step 6: GitHub 정리

### 6-1. 레포 통째로 삭제 (코드 보관 안 할 시)

```
1. https://github.com/[정호님계정]/lash-salon-admin
2. Settings → 페이지 맨 하단 "Danger Zone"
3. "Delete this repository"
4. 레포 이름 정확히 입력 → 확인
```

### 6-2. 레포 보관 (코드 학습 자료로 남길 시)

```
Settings → 페이지 상단
  - "Archive this repository" 체크 (읽기 전용으로 전환)
또는
  - Visibility를 Private으로 변경
```

---

## 📁 Step 7: 로컬 환경 정리

```bash
# 1. 프로젝트 폴더 삭제
cd ~/projects
rm -rf lash-salon-admin

# 2. 글로벌 npm 캐시에서 관련 패키지 정리 (선택)
npm cache clean --force

# 3. (선택) Vercel CLI에서 프로젝트 연결 끊기
vercel project rm lash-salon-admin

# 4. .env.local 백업도 확실히 정리할 거면
rm ~/keys/archive/lash-salon-admin.env.bak
```

---

## 🔐 Step 8: 비밀번호 관리자 정리

```
1Password / Bitwarden / 로컬 vault 등 사용 중인 도구에서:
  → "lash-salon" 또는 "lash_salon" 검색
  → 검색된 모든 항목 삭제
  
정리 대상:
  □ Supabase DB Password
  □ Google OAuth Client Secret
  □ Kakao REST API Key
  □ Naver Client Secret
  □ Vercel 토큰 (있으면)
```

---

## ✅ Step 9: 최종 검증 체크리스트

모든 단계 완료 후 다음을 확인하세요.

```
[ ] Supabase Dashboard에서 lash_salon_* 테이블/정책 0개 확인
[ ] Supabase Storage에서 lash-salon-* 버킷 0개 확인
[ ] GCP Console에서 lash-salon-admin-001 프로젝트 "종료됨" 상태
[ ] Kakao Developers에서 lash-salon-admin 앱 미존재
[ ] Naver Developers에서 lash-salon-admin-trends 앱 미존재
[ ] Vercel에서 lash-salon-admin 프로젝트 미존재
[ ] GitHub에서 lash-salon-admin 레포 미존재 (또는 Archive)
[ ] 로컬에 ~/projects/lash-salon-admin 폴더 미존재
[ ] 비밀번호 관리자에 lash-salon 검색 결과 0건
[ ] 브라우저 북마크/Recent에서 관련 URL 정리
```

---

## 🆘 문제 발생 시

### "Supabase에서 다른 프로젝트 테이블이 같이 지워졌어요"
- Supabase는 **30일 PITR(Point-in-Time Recovery)** 가능 (Pro 플랜)
- Free 플랜은 **하루치 자동 백업** 가능
- Dashboard → Database → Backups 확인

### "GCP 프로젝트를 실수로 종료했어요"
- 종료 후 30일 이내 → "복원" 버튼 클릭 가능
- 30일 경과 → 영구 삭제, 복구 불가

### "GitHub 레포를 잘못 지웠어요"
- 90일 이내 → GitHub 고객센터 문의로 복구 가능
- 90일 경과 → 복구 불가

---

## 📊 예상 소요 시간

| 단계 | 시간 |
|------|------|
| Step 0 백업 | 10분 |
| Step 1 Supabase | 5분 |
| Step 2 GCP | 3분 |
| Step 3 Kakao | 2분 |
| Step 4 Naver | 2분 |
| Step 5 Vercel | 2분 |
| Step 6 GitHub | 2분 |
| Step 7 로컬 | 1분 |
| Step 8 비밀번호 | 5분 |
| Step 9 검증 | 5분 |
| **총합** | **약 35~40분** |

---

## 📝 정리 완료 보고 (선택)

정리 완료 후 자기 자신에게 짧은 메모를 남겨두면 다음 프로젝트 정리 때 참고됩니다.

```
정리 일시: 2026-XX-XX
프로젝트: lash-salon-admin
사용 기간: XXXX-XX-XX ~ 2026-XX-XX
배운 점: 
보관한 것 (있으면): 
```

---

## 🎯 핵심 원칙

```
1. 삭제 전 백업 (특히 DB CSV)
2. prefix 매칭으로 다른 프로젝트와 격리
3. SQL 실행 전 SELECT로 미리 확인
4. GCP 프로젝트는 종료 (30일 복원 가능)
5. 한 번에 모두 지우지 말고 단계별로 검증
```

**프로젝트 시작 시 네이밍 규칙(lash_salon_*, lash-salon-*)을 일관되게 적용해두면 정리가 쉽습니다.**
