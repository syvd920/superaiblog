import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    await requireAdmin();

    const { data, error } = await supabaseAdmin
      .from('company_profiles')
      .select('id, company_name, login_email, publish_limit, publish_used, image_limit, image_used, expires_at, is_active, plan_name')
      .order('id', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ companies: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '업체 목록 조회에 실패했습니다.' },
      { status: 403 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const companyName = String(body.companyName || '').trim();
    const loginEmail = String(body.loginEmail || '').trim().toLowerCase();
    const password = String(body.password || '').trim();
    const publishLimit = Number(body.publishLimit || 0);
    const imageLimit = Number(body.imageLimit || 0);
    const expiresAt = String(body.expiresAt || '').trim();
    const planName = String(body.planName || 'Basic').trim();

    if (!companyName || !loginEmail || !password || !expiresAt) {
      return NextResponse.json({ error: '필수값이 비어 있습니다.' }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: loginEmail,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;

    const userId = authData.user.id;

    const { error: insertError } = await supabaseAdmin.from('company_profiles').insert({
      user_id: userId,
      company_name: companyName,
      login_email: loginEmail,
      publish_limit: publishLimit,
      publish_used: 0,
      image_limit: imageLimit,
      image_used: 0,
      expires_at: expiresAt,
      is_active: true,
      plan_name: planName,
    });

    if (insertError) throw insertError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '업체 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
