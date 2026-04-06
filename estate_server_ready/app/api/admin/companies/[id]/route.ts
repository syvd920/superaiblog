import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};

    if (typeof body.isActive === 'boolean') updates.is_active = body.isActive;
    if (typeof body.publishLimit === 'number') updates.publish_limit = body.publishLimit;
    if (typeof body.imageLimit === 'number') updates.image_limit = body.imageLimit;
    if (typeof body.planName === 'string') updates.plan_name = body.planName;
    if (typeof body.expiresAt === 'string' && body.expiresAt) updates.expires_at = body.expiresAt;

    const { error } = await supabaseAdmin
      .from('company_profiles')
      .update(updates)
      .eq('id', Number(id));

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '업체 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}
