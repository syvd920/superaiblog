import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">Superblog</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link className="btn" href="/login">로그인</Link>
            <Link className="btn btn-dark" href="/admin/users">관리자</Link>
          </div>
        </div>
      </header>

      <div className="wrap">
        <section className="hero">
          <div className="card hero-card">
            <span className="badge">폐쇄형 부동산 블로그 SaaS</span>
            <h1 className="title-xl">관리자가 업체 계정을 발급하고, 업체는 로그인 후 바로 포스팅을 생성하는 구조</h1>
            <p className="muted">
              공개 회원가입 없이 관리자만 업체를 생성합니다. 로그인한 업체는 블로그 스튜디오에서
              최적화 점수와 한도를 확인하면서 글을 생성할 수 있습니다.
            </p>
            <div style={{ display:'flex', gap:12, marginTop:24, flexWrap:'wrap' }}>
              <Link className="btn btn-dark" href="/login">업체 로그인</Link>
              <Link className="btn" href="/admin/users">관리자 페이지</Link>
            </div>
          </div>
          <div className="card hero-card">
            <h2 style={{ marginTop:0 }}>포함 구성</h2>
            <ul className="muted" style={{ paddingLeft:18 }}>
              <li>Supabase 로그인 연동</li>
              <li>업체별 회사명, 발행 한도, 이미지 한도, 만료일 표시</li>
              <li>블로그 스튜디오 화면</li>
              <li>관리자 전용 업체 목록/생성 화면</li>
              <li>Vercel 배포 기준 구조</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
