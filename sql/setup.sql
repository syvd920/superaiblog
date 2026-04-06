create table if not exists public.company_profiles (
  id bigint generated always as identity primary key,
  user_id uuid unique not null,
  company_name text not null,
  login_email text not null,
  publish_limit integer not null default 100,
  publish_used integer not null default 0,
  image_limit integer not null default 300,
  image_used integer not null default 0,
  expires_at date not null,
  is_active boolean not null default true,
  plan_name text default 'Basic',
  created_at timestamptz not null default now()
);

alter table public.company_profiles enable row level security;

create policy "users can read own company profile"
on public.company_profiles
for select
using (auth.uid() = user_id);

-- 업체 화면에서 직접 테이블 업데이트는 막고, 사용량 차감은 서버 route에서 service role로 처리

-- 선택사항: 관리자 이메일로 직접 확인하고 싶으면 admin은 service_role route를 사용하므로 추가 정책은 없어도 됨.
