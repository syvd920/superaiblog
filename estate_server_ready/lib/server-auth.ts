import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabase-admin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getBearerToken(authHeader: string | null) {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

export async function getRequestUser() {
  const headerStore = await headers();
  const token = getBearerToken(headerStore.get('authorization'));

  if (!token) {
    throw new Error('인증 토큰이 없습니다.');
  }

  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new Error('로그인이 필요합니다.');
  }

  return data.user;
}

export async function requireAdmin() {
  const user = await getRequestUser();
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes((user.email || '').toLowerCase())) {
    throw new Error('관리자 권한이 없습니다.');
  }

  return user;
}

export async function getCompanyProfileByUserId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('company_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
