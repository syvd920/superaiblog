import { NextResponse } from 'next/server';
import { getCompanyProfileByUserId, getRequestUser } from '@/lib/server-auth';

export async function GET() {
  try {
    const user = await getRequestUser();
    const profile = await getCompanyProfileByUserId(user.id);

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '프로필 조회에 실패했습니다.' },
      { status: 401 }
    );
  }
}
