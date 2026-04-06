import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const userSupabase = createClient(url, publishable, {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') || '',
        },
      },
    });

    const {
      data: { user },
    } = await userSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const adminEmails = getAdminEmails();
    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.json({ error: '관리자만 접근 가능합니다.' }, { status: 403 });
    }

    const adminSupabase = createClient(url, serviceRole);

    const authResult = await adminSupabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });

    if (authResult.error || !authResult.data.user) {
      return NextResponse.json(
        { error: authResult.error?.message || 'Auth 유저 생성 실패' },
        { status: 400 }
      );
    }

    const insertResult = await adminSupabase.from('company_profiles').insert({
      user_id: authResult.data.user.id,
      company_name: body.company_name,
      login_id: body.login_id,
      publish_limit: body.publish_limit,
      publish_used: 0,
      image_limit: body.image_limit,
      image_used: 0,
      expires_at: body.expires_at,
      is_active: true,
    });

    if (insertResult.error) {
      return NextResponse.json({ error: insertResult.error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
