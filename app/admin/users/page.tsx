'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Company = {
  id: number;
  company_name: string;
  publish_limit: number;
  publish_used: number;
  image_limit: number;
  image_used: number;
  expires_at: string;
  is_active: boolean;
};

export default function AdminUsersPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState({
    company_name: '',
    publish_limit: '100',
    image_limit: '300',
    expires_at: ''
  });
  const [message, setMessage] = useState('');

  const loadCompanies = async () => {
    const { data } = await supabase
      .from('company_profiles')
      .select('id,company_name,publish_limit,publish_used,image_limit,image_used,expires_at,is_active')
      .order('id', { ascending: false });

    setCompanies((data || []) as Company[]);
  };

  useEffect(() => { loadCompanies(); }, []);

  const handleCreate = async () => {
    setMessage('관리자 API 붙이기 전 목업입니다. SQL로 계정/프로필 생성 후 이 화면은 목록 확인 및 UI 용도로 먼저 사용하세요.');
  };

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">관리자 페이지</div>
        </div>
      </header>
      <div className="wrap">
        <div className="notice">관리자 생성 API까지 붙이기 전 기본 관리 화면입니다. 먼저 Supabase SQL 실행 후 목록 확인에 사용하세요.</div>
        <div className="layout">
          <aside className="sidebar">
            <div className="card section-card">
              <h2>업체 생성</h2>
              <p>실제 운영에선 서버 API로 Auth 사용자와 프로필을 함께 생성해야 합니다.</p>
              <div className="field"><label>업체명</label><input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></div>
              <div className="field"><label>발행 한도</label><input value={form.publish_limit} onChange={(e) => setForm({ ...form, publish_limit: e.target.value })} /></div>
              <div className="field"><label>이미지 한도</label><input value={form.image_limit} onChange={(e) => setForm({ ...form, image_limit: e.target.value })} /></div>
              <div className="field"><label>만료일</label><input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></div>
              <button className="btn btn-dark" onClick={handleCreate} style={{ width:'100%' }}>업체 생성</button>
              {message ? <div className="small" style={{ marginTop: 12 }}>{message}</div> : null}
            </div>
          </aside>
          <section className="content">
            <div className="card section-card">
              <h2>업체 목록</h2>
              <p>업체명, 사용량, 만료일을 확인합니다.</p>
              <table className="table">
                <thead>
                  <tr>
                    <th>업체명</th>
                    <th>발행</th>
                    <th>이미지</th>
                    <th>만료일</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td>{company.company_name}</td>
                      <td>{company.publish_used} / {company.publish_limit}</td>
                      <td>{company.image_used} / {company.image_limit}</td>
                      <td>{company.expires_at}</td>
                      <td>{company.is_active ? '활성' : '비활성'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
