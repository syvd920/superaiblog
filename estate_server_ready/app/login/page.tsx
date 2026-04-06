'use client';

import './login.css';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/studio');
    });
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
      return;
    }

    router.replace('/studio');
    router.refresh();
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-badge">CLOSED B2B</div>
        <h1>부동산 블로그 운영 로그인</h1>
        <p>
          관리자에게 발급받은 계정으로만 접속할 수 있습니다.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>아이디</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="관리자에게 받은 로그인 아이디"
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoComplete="current-password"
            />
          </div>

          {errorMessage ? <div className="login-error">{errorMessage}</div> : null}

          <button className="login-submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </section>
    </main>
  );
}
