'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Profile = {
  company_name: string;
  publish_limit: number;
  publish_used: number;
  image_limit: number;
  image_used: number;
  expires_at: string;
};

type Section = { id: number; heading: string; body: string; image: string; quote?: string };

export default function StudioPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mainKeyword, setMainKeyword] = useState('');
  const [region, setRegion] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [cta, setCta] = useState('');
  const [generated, setGenerated] = useState(false);
  const [title, setTitle] = useState('');
  const [score, setScore] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('company_profiles')
        .select('company_name,publish_limit,publish_used,image_limit,image_used,expires_at')
        .eq('user_id', userData.user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setProfile(data as Profile);
    };

    load();
  }, [router]);

  const tags = useMemo(() => [mainKeyword, region, propertyName].filter(Boolean), [mainKeyword, region, propertyName]);

  const handleGenerate = () => {
    const safeRegion = region || '지역명';
    const safeProperty = propertyName || '매물명';
    const safeKeyword = mainKeyword || '메인 키워드';
    const nextTitle = `${safeRegion} 하이엔드 주거의 기준, ${safeProperty}를 주목해야 하는 이유`;

    setTitle(nextTitle);
    setSections([
      {
        id: 1,
        heading: `${safeRegion} 입지 분석`,
        body: `${safeRegion}은 생활 인프라와 접근성, 상권 밀집도가 균형 있게 갖춰진 지역입니다. 이번 포스팅은 ${safeKeyword}를 중심으로 구성했습니다.`,
        image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1400&auto=format&fit=crop',
        quote: `${safeRegion}의 가치는 단순한 주소가 아니라, 매일 누리는 생활 반경에서 완성됩니다.`
      },
      {
        id: 2,
        heading: `${safeProperty} 핵심 포인트`,
        body: `${safeProperty}는 외관의 인상부터 내부 공간의 완성도까지 전체적인 밸런스가 뛰어난 편입니다. 하이엔드 주거를 찾는 수요층이 중요하게 보는 기준을 고르게 갖춘 타입으로 볼 수 있습니다.`,
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1400&auto=format&fit=crop'
      },
      {
        id: 3,
        heading: '실거주·자산가치 관점 정리',
        body: `CTA 문구와 보조 키워드를 자연스럽게 섞으면 검색성과 문의 전환을 동시에 챙길 수 있습니다.`,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1400&auto=format&fit=crop',
        quote: '좋은 포스팅은 예쁜 글이 아니라, 문의까지 이어지는 구조를 가집니다.'
      }
    ]);
    let total = 40;
    if (mainKeyword) total += 20;
    if (region) total += 15;
    if (propertyName) total += 15;
    if (cta.trim()) total += 10;
    setScore(total);
    setGenerated(true);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">{profile?.company_name || '업체정보 불러오는 중...'}</div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn" onClick={logout}>로그아웃</button>
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className="info-strip">
          <div className="card info-box">
            <small>업체명</small>
            <strong>{profile?.company_name || '-'}</strong>
          </div>
          <div className="card info-box">
            <small>발행 한도</small>
            <strong>{profile ? `${profile.publish_used} / ${profile.publish_limit}` : '-'}</strong>
          </div>
          <div className="card info-box">
            <small>이미지 한도</small>
            <strong>{profile ? `${profile.image_used} / ${profile.image_limit}` : '-'}</strong>
          </div>
          <div className="card info-box">
            <small>이용권 만료일</small>
            <strong>{profile?.expires_at || '-'}</strong>
          </div>
        </div>

        <div className="layout">
          <aside className="sidebar">
            <div className="card section-card">
              <h2>기본 정보</h2>
              <p>키워드와 매물 정보를 입력해 포스팅 방향을 정합니다.</p>
              <div className="field"><label>메인 키워드</label><input value={mainKeyword} onChange={(e) => setMainKeyword(e.target.value)} /></div>
              <div className="field"><label>지역명</label><input value={region} onChange={(e) => setRegion(e.target.value)} /></div>
              <div className="field"><label>매물명</label><input value={propertyName} onChange={(e) => setPropertyName(e.target.value)} /></div>
              <div className="field"><label>CTA 문구</label><textarea rows={4} value={cta} onChange={(e) => setCta(e.target.value)} /></div>
              <button className="btn btn-dark" onClick={handleGenerate} style={{ width:'100%', marginTop:8 }}>포스팅 생성하기</button>
            </div>
          </aside>

          <section className="content">
            <div className="info-strip" style={{ gridTemplateColumns:'repeat(4, 1fr)' }}>
              <div className="card info-box"><small>최적화 점수</small><strong>{generated ? `${score}점` : '-'}</strong></div>
              <div className="card info-box"><small>메인 키워드</small><strong>{mainKeyword || '-'}</strong></div>
              <div className="card info-box"><small>지역명</small><strong>{region || '-'}</strong></div>
              <div className="card info-box"><small>매물명</small><strong>{propertyName || '-'}</strong></div>
            </div>

            <div className="card preview">
              {!generated ? (
                <div className="preview-empty">
                  <h2>아직 생성된 포스팅이 없습니다.</h2>
                  <p>왼쪽에서 키워드와 매물 정보를 입력한 뒤 포스팅 생성하기 버튼을 누르면 네이버 블로그용 초안이 생성됩니다.</p>
                </div>
              ) : (
                <>
                  <input className="preview-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <div className="tag-row">{tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div>
                  <img className="hero-image" src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format&fit=crop" alt="thumbnail" />
                  {sections.map((section, idx) => (
                    <article className="article-card" key={section.id}>
                      <h3>{idx + 1}. {section.heading}</h3>
                      <p>{section.body}</p>
                      {section.quote ? <div className="quote">“{section.quote}”</div> : null}
                      <img className="section-image" src={section.image} alt={section.heading} />
                    </article>
                  ))}
                  <div className="cta-box">
                    <small style={{ opacity:.7, textTransform:'uppercase' }}>Call To Action</small>
                    <h4>{propertyName || '매물'} 관련 자세한 정보가 궁금하신가요?</h4>
                    <p>{cta || '자세한 상담은 문의로 안내드립니다.'}</p>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
