'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type CompanyRow = {
  id: number;
  company_name: string;
  login_id: string | null;
  publish_limit: number;
  publish_used: number;
  image_limit: number;
  image_used: number;
  expires_at: string;
  is_active: boolean;
};

function phoneToEmail(phone: string) {
  const normalized = phone.replace(/[^0-9]/g, '');
  return `${normalized}@admin.local`;
}

export default function AdminUsersPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);

  const [companyName, setCompanyName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [publishLimit, setPublishLimit] = useState(30);
  const [imageLimit, setImageLimit] = useState(100);
  const [expiresAt, setExpiresAt] = useState('2026-12-31');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email || '';
      const admins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);

      if (!userData.user || !admins.includes(email)) {
        router.push('/login');
        return;
      }

      setChecking(false);
      loadCompanies();
    };

    checkAdmin();
  }, [router]);

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('company_profiles')
      .select(
        'id,company_name,login_id,publish_limit,publish_used,image_limit,image_used,expires_at,is_active'
      )
      .order('id', { ascending: false });

    if (!error && data) {
      setCompanies(data as CompanyRow[]);
    }
  };

  const createCompany = async () => {
    if (!companyName || !loginId || !password || !expiresAt) {
      alert('모든 값을 입력하세요.');
      return;
    }

    try {
      setSaving(true);

      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: companyName,
          login_id: loginId,
          email: phoneToEmail(loginId),
          password,
          publish_limit: Number(publishLimit),
          image_limit: Number(imageLimit),
          expires_at: expiresAt,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error || '업체 생성 실패');
        return;
      }

      alert('업체 계정이 생성되었습니다.');
      setCompanyName('');
      setLoginId('');
      setPassword('');
      setPublishLimit(30);
      setImageLimit(100);
      setExpiresAt('2026-12-31');
      loadCompanies();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: CompanyRow) => {
    const { error } = await supabase
      .from('company_profiles')
      .update({ is_active: !row.is_active })
      .eq('id', row.id);

    if (error) {
      alert('상태 변경 실패');
      return;
    }

    loadCompanies();
  };

  if (checking) {
    return <main className="page-shell" style={{ padding: 40 }}>관리자 확인 중...</main>;
  }

  return (
    <main className="page-shell">
      <div className="admin-wrap">
        <div className="card admin-form-card">
          <h1>업체 계정 생성</h1>
          <p>전화번호를 아이디처럼 부여하고, 내부적으로는 이메일 형태로 Auth 계정을 생성합니다.</p>

          <div className="field">
            <label>업체명</label>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>

          <div className="field">
            <label>전화번호 아이디</label>
            <input
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="01012345678"
            />
          </div>

          <div className="field">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>발행 한도</label>
              <input
                type="number"
                value={publishLimit}
                onChange={(e) => setPublishLimit(Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>이미지 생성 한도</label>
              <input
                type="number"
                value={imageLimit}
                onChange={(e) => setImageLimit(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="field">
            <label>이용권 만료일</label>
            <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>

          <button className="btn btn-dark" onClick={createCompany} disabled={saving}>
            {saving ? '생성 중...' : '업체 계정 생성'}
          </button>
        </div>

        <div className="card admin-table-card">
          <h2>업체 목록</h2>

          <div className="admin-table">
            <div className="admin-head">
              <span>업체명</span>
              <span>아이디(전화번호)</span>
              <span>발행</span>
              <span>이미지</span>
              <span>만료일</span>
              <span>상태</span>
              <span>관리</span>
            </div>

            {companies.map((row) => (
              <div className="admin-row" key={row.id}>
                <span>{row.company_name}</span>
                <span>{row.login_id || '-'}</span>
                <span>
                  {row.publish_used} / {row.publish_limit}
                </span>
                <span>
                  {row.image_used} / {row.image_limit}
                </span>
                <span>{row.expires_at}</span>
                <span>{row.is_active ? '활성' : '비활성'}</span>
                <span>
                  <button className="btn" onClick={() => toggleActive(row)}>
                    {row.is_active ? '비활성화' : '활성화'}
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
