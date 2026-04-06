[중요]
이 압축은 프로젝트 전체 스타터입니다.
기존 GitHub 저장소 파일을 이 구조로 맞춰서 덮어쓰세요.

[반드시 있어야 하는 파일]
- package.json
- tsconfig.json
- next.config.mjs
- next-env.d.ts
- app/layout.tsx
- app/globals.css
- app/page.tsx
- app/login/page.tsx
- app/studio/page.tsx
- app/admin/users/page.tsx
- lib/supabase.ts
- sql/setup.sql

[Vercel 환경변수]
NEXT_PUBLIC_SUPABASE_URL=Supabase Project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=Supabase Publishable key

[설치]
npm install

[실행]
npm run dev

[배포]
GitHub에 전체 업로드 후 Vercel Framework Preset을 Next.js로 설정

[주의]
이 버전은 관리자 생성 API까지 완전 자동으로 붙인 버전은 아닙니다.
먼저 로그인/스튜디오/프로필 표시가 돌아가게 만드는 최소 전체 프로젝트입니다.
