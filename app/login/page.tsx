'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function phoneToEmail(value: string) {
  const normalized = value.replace(/[^0-9]/g, '');
  return `${normalized}@admin.local`;
}

export default function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    const email = phoneToEmail(loginId);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      return;
    }

    router.push('/studio');
  };

  return (
    <main className="page-shell" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: 460, padding: 32 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>업체 로그인</h1>
        <p style={{ marginTop: 10, color: '#94a3b8', lineHeight: 1.7 }}>
          관리자가 발급한 전화번호 아이디와 비밀번호로 로그인하세요.
        </p>

        <div className="field" style={{ marginTop: 24 }}>
          <label>아이디</label>
          <input
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="전화번호 입력 (예: 01012345678)"
          />
        </div>

        <div className="field">
          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
          />
        </div>

        <button
          className="btn btn-dark"
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', marginTop: 12 }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        {error ? (
          <div style={{ marginTop: 14, color: '#dc2626', fontWeight: 600 }}>
            {error}
          </div>
        ) : null}
      </div>
    </main>
  );
}
