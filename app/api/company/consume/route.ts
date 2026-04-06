import { NextRequest, NextResponse } from 'next/server';
import { getCompanyProfileByUserId, getRequestUser } from '@/lib/server-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const user = await getRequestUser();
    const body = await request.json();
    const publishCount = Number(body.publishCount || 0);
    const imageCount = Number(body.imageCount || 0);

    const profile = await getCompanyProfileByUserId(user.id);

    if (!profile.is_active) {
      return NextResponse.json({ error: '비활성 업체는 사용할 수 없습니다.' }, { status: 403 });
    }

    const today = new Date().toISOString().slice(0, 10);
    if (profile.expires_at < today) {
      return NextResponse.json({ error: '이용권이 만료되었습니다.' }, { status: 403 });
    }

    if (profile.publish_used + publishCount > profile.publish_limit) {
      return NextResponse.json({ error: '발행 한도를 초과했습니다.' }, { status: 400 });
    }

    if (profile.image_used + imageCount > profile.image_limit) {
      return NextResponse.json({ error: '이미지 생성 한도를 초과했습니다.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('company_profiles')
      .update({
        publish_used: profile.publish_used + publishCount,
        image_used: profile.image_used + imageCount,
      })
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ profile: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '사용량 차감에 실패했습니다.' },
      { status: 500 }
    );
  }
}
