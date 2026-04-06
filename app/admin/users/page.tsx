'use client';

import './admin-users.css';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Company = {
  id: number;
  company_name: string;
  login_email: string;
  publish_limit: number;
  publish_used: number;
  image_limit: number;
  image_used: number;
  expires_at: string;
  is_active: boolean;
  plan_name: string | null;
};

const initialForm = {
  companyName: '',
  loginEmail: '',
  password: '',
  publishLimit: 100,
  imageLimit: 300,
  expiresAt: '',
  planName: 'Basic',
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState(initialForm);
  const [accessToken, setAccessToken] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      const { data } = await supabaseBrowser.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }
      setAccessToken(data.session.access_token);
      await loadCompanies(data.session.access_token);
    }
    init();
  }, [router]);

  async function loadCompanies(token: string) {
    const res = await fetch('/api/admin/companies', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();

    if (!res.ok) {
      setMessage(json.error || '관리자 권한이 없습니다.');
      setLoading(false);
      return;
    }

    setCompanies(json.companies || []);
    setLoading(false);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const res = await fetch('/api/admin/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage(json.error || '업체 생성에 실패했습니다.');
      return;
    }

    setForm(initialForm);
    setMessage('업체 계정이 생성되었습니다.');
    await loadCompanies(accessToken);
  }

  async function handleToggle(company: Company) {
    const res = await fetch(`/api/admin/companies/${company.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ isActive: !company.is_active }),
    });

    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error || '상태 변경에 실패했습니다.');
      return;
    }

    await loadCompanies(accessToken);
  }

  async function handleUpgrade(company: Company) {
    const res = await fetch(`/api/admin/companies/${company.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        publishLimit: company.publish_limit + 50,
        imageLimit: company.image_limit + 150,
        planName: 'Premium',
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error || '업그레이드에 실패했습니다.');
      return;
    }

    await loadCompanies(accessToken);
  }

  if (loading) return <main className="admin-users-page"><div className="admin-shell">불러오는 중...</div></main>;

  return (
    <main className="admin-users-page">
      <div className="admin-shell">
        <section className="admin-header-card">
          <div>
            <div className="admin-badge">ADMIN</div>
            <h1>업체 계정 관리</h1>
            <p>회원가입 없이 관리자가 직접 업체 계정을 생성하고, 한도와 만료일을 조정하는 구조입니다.</p>
          </div>
        </section>

        <div className="admin-grid">
          <section className="admin-card">
            <h2>업체 계정 생성</h2>
            <form className="admin-form" onSubmit={handleCreate}>
              <Field label="업체명" value={form.companyName} onChange={(v) => setForm({ ...form, companyName: v })} />
              <Field label="로그인 아이디(이메일)" value={form.loginEmail} onChange={(v) => setForm({ ...form, loginEmail: v })} />
              <Field label="비밀번호" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
              <Field label="플랜명" value={form.planName} onChange={(v) => setForm({ ...form, planName: v })} />
              <Field label="발행 한도" type="number" value={String(form.publishLimit)} onChange={(v) => setForm({ ...form, publishLimit: Number(v) || 0 })} />
              <Field label="이미지 한도" type="number" value={String(form.imageLimit)} onChange={(v) => setForm({ ...form, imageLimit: Number(v) || 0 })} />
              <Field label="만료일" type="date" value={form.expiresAt} onChange={(v) => setForm({ ...form, expiresAt: v })} />
              {message ? <div className="admin-message">{message}</div> : null}
              <button className="admin-submit" disabled={saving}>{saving ? '생성 중...' : '업체 계정 생성'}</button>
            </form>
          </section>

          <section className="admin-card admin-list-card">
            <h2>업체 목록</h2>
            <div className="admin-list">
              {companies.map((company) => (
                <div key={company.id} className="admin-company-item">
                  <div className="admin-company-main">
                    <div className="admin-company-top">
                      <strong>{company.company_name}</strong>
                      <span className={`admin-status ${company.is_active ? 'on' : 'off'}`}>
                        {company.is_active ? '활성' : '비활성'}
                      </span>
                    </div>
                    <div className="admin-company-meta">{company.login_email}</div>
                    <div className="admin-company-stats">
                      <span>발행 {company.publish_used}/{company.publish_limit}</span>
                      <span>이미지 {company.image_used}/{company.image_limit}</span>
                      <span>만료 {company.expires_at}</span>
                      <span>{company.plan_name || '기본'}</span>
                    </div>
                  </div>

                  <div className="admin-company-actions">
                    <button onClick={() => handleUpgrade(company)}>업그레이드</button>
                    <button onClick={() => handleToggle(company)}>{company.is_active ? '비활성화' : '활성화'}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string; }) {
  return (
    <div className="admin-field">
      <label>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
