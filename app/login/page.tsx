'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push('/studio');
  };

  return (
    <main className="login-wrap">
      <div className="card login-card">
        <h1 className="login-title">업체 로그인</h1>
        <p className="login-sub">관리자가 발급한 계정으로 로그인하세요.</p>

        <div className="field">
          <label>아이디</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일 형식 아이디" />
        </div>
        <div className="field">
          <label>비밀번호</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" />
        </div>

        <button className="btn btn-dark" onClick={handleLogin} disabled={loading} style={{ width:'100%', marginTop:8 }}>
          {loading ? '로그인 중...' : '로그인'}
        </button>

        {error ? <div className="error">{error}</div> : null}
      </div>
    </main>
  );
}
