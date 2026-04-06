[넣을 위치]
이 압축은 Next.js App Router 프로젝트 기준입니다.
프로젝트 루트에서 같은 경로에 그대로 넣어주세요.

- app/login/page.tsx
- app/login/login.css
- app/studio/page.tsx
- app/studio/studio.css
- app/admin/users/page.tsx
- app/admin/users/admin-users.css
- app/api/company/profile/route.ts
- app/api/company/consume/route.ts
- app/api/admin/companies/route.ts
- app/api/admin/companies/[id]/route.ts
- lib/supabase-browser.ts
- lib/supabase-admin.ts
- lib/server-auth.ts
- sql/setup.sql

[필수 설치]
npm install @supabase/supabase-js

[Vercel 환경변수]
NEXT_PUBLIC_SUPABASE_URL=Supabase Connect에서 복사한 Project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=Supabase Connect에서 복사한 publishable key
SUPABASE_SERVICE_ROLE_KEY=Supabase의 legacy service_role 또는 secret server key
ADMIN_EMAILS=관리자이메일1,관리자이메일2

중요:
- SERVICE ROLE / SECRET SERVER KEY는 브라우저에 넣으면 안 됩니다.
- Vercel Environment Variables에만 넣어야 합니다.

[Supabase 준비]
1) sql/setup.sql 실행
2) Authentication > Users 에서 관리자 계정 1개 먼저 생성
3) 그 관리자 이메일을 ADMIN_EMAILS에 넣기
4) /login 으로 로그인
5) /admin/users 에서 업체 계정 생성
6) 업체는 /login 에서 받은 아이디/비밀번호로 로그인

[현재 로그인 방식]
화면에는 '아이디'라고 보이지만 실제로는 Supabase email/password 로그인입니다.
즉 관리자 페이지에서 업체 생성 시 로그인 아이디 칸에 이메일 형식으로 넣어야 합니다.

[현재 구현된 것]
- 로그인 페이지 단순화: 아이디 / 비밀번호만
- 스튜디오 상단에 업체명 / 발행한도 / 이미지한도 / 만료일
- 포스팅 생성시 발행 1건 + 이미지 n건 차감
- 최적화 점수 표시
- 관리자 페이지에서 업체 생성, 활성/비활성, 업그레이드

[주의]
- 이 압축은 네 현재 프로젝트 구조를 모른 상태에서 만든 서버 연결용 스타터입니다.
- 기존 globals.css, 기존 app/page.tsx, 기존 middleware와 충돌할 수 있으니 확인 필요합니다.
- 관리자 페이지 접근제어는 ADMIN_EMAILS 기반입니다.
