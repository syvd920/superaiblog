'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Profile = {
  company_name: string;
  login_id: string | null;
  publish_limit: number;
  publish_used: number;
  image_limit: number;
  image_used: number;
  expires_at: string;
  is_active: boolean;
};

type Section = {
  id: number;
  heading: string;
  body: string;
  image: string;
  quote?: string;
};

export default function StudioPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  const [mainKeyword, setMainKeyword] = useState('');
  const [subKeyword, setSubKeyword] = useState('');
  const [region, setRegion] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [cta, setCta] = useState('');

  const [generated, setGenerated] = useState(false);
  const [title, setTitle] = useState('');
  const [score, setScore] = useState(0);
  const [titleScore, setTitleScore] = useState(0);
  const [keywordScore, setKeywordScore] = useState(0);
  const [readabilityScore, setReadabilityScore] = useState(0);
  const [ctaScore, setCtaScore] = useState(0);
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
        .select(
          'company_name,login_id,publish_limit,publish_used,image_limit,image_used,expires_at,is_active'
        )
        .eq('user_id', userData.user.id)
        .single();

      if (error || !data) {
        console.error(error);
        return;
      }

      if (!data.is_active) {
        alert('비활성화된 계정입니다.');
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }

      setProfile(data as Profile);
    };

    load();
  }, [router]);

  const tags = useMemo(
    () => [mainKeyword, subKeyword, region, propertyName].filter(Boolean),
    [mainKeyword, subKeyword, region, propertyName]
  );

  const handleGenerate = () => {
    const safeKeyword = mainKeyword || '메인 키워드';
    const safeSubKeyword = subKeyword || '보조 키워드';
    const safeRegion = region || '지역명';
    const safeProperty = propertyName || '매물명';

    const nextTitle = `${safeRegion} 하이엔드 주거의 기준, ${safeProperty}를 주목해야 하는 이유`;
    setTitle(nextTitle);

    setSections([
      {
        id: 1,
        heading: `${safeRegion} 입지 분석`,
        body: `${safeRegion}은 생활 인프라와 접근성, 상권 밀집도가 균형 있게 갖춰진 지역입니다. 이번 포스팅은 ${safeKeyword}를 중심으로 구성했습니다.`,
        image:
          'https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1400&auto=format&fit=crop',
        quote: `${safeRegion}의 가치는 단순한 주소가 아니라, 매일 누리는 생활 반경에서 완성됩니다.`,
      },
      {
        id: 2,
        heading: `${safeProperty} 핵심 포인트`,
        body: `${safeProperty}는 외관의 인상부터 내부 공간의 완성도까지 전체적인 밸런스가 뛰어난 편입니다. 실거주 만족도와 상품성을 동시에 고려하는 수요층에게 적합한 구조로 볼 수 있습니다.`,
        image:
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1400&auto=format&fit=crop',
      },
      {
        id: 3,
        heading: '실거주·자산가치 관점 정리',
        body: `${safeSubKeyword}를 자연스럽게 섞고 CTA 문구까지 연결하면 검색성과 문의 전환을 동시에 챙길 수 있습니다.`,
        image:
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1400&auto=format&fit=crop',
        quote: '좋은 포스팅은 예쁜 글이 아니라, 문의까지 이어지는 구조를 가집니다.',
      },
    ]);

    const nextTitleScore = mainKeyword ? 25 : 12;
    const nextKeywordScore = subKeyword ? 25 : 15;
    const nextReadabilityScore = region && propertyName ? 25 : 15;
    const nextCtaScore = cta.trim() ? 25 : 10;
    const total = nextTitleScore + nextKeywordScore + nextReadabilityScore + nextCtaScore;

    setTitleScore(nextTitleScore);
    setKeywordScore(nextKeywordScore);
    setReadabilityScore(nextReadabilityScore);
    setCtaScore(nextCtaScore);
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
          <div className="brand-wrap">
            <div className="brand-logo">AI</div>
            <div>
              <div className="brand-title">{profile?.company_name || '업체 불러오는 중...'}</div>
              <div className="brand-sub">네이버 블로그 포스팅 스튜디오</div>
            </div>
          </div>

          <div className="top-cards">
            <div className="top-card">
              <small>발행 한도</small>
              <strong>{profile ? `${profile.publish_limit}건` : '-'}</strong>
            </div>
            <div className="top-card">
              <small>이미지 생성 한도</small>
              <strong>{profile ? `${profile.image_limit}장` : '-'}</strong>
            </div>
            <div className="top-card">
              <small>이용권 만료일</small>
              <strong>{profile?.expires_at || '-'}</strong>
            </div>
            <button className="btn" onClick={logout}>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="studio-wrap">
        <aside className="sidebar">
          <div className="card section-card">
            <h2>기본 정보</h2>
            <p>키워드와 매물 정보를 입력해 포스팅 방향을 정합니다.</p>

            <div className="field">
              <label>메인 키워드</label>
              <input value={mainKeyword} onChange={(e) => setMainKeyword(e.target.value)} />
            </div>

            <div className="field">
              <label>서브 키워드</label>
              <input value={subKeyword} onChange={(e) => setSubKeyword(e.target.value)} />
            </div>

            <div className="field">
              <label>지역명</label>
              <input value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>

            <div className="field">
              <label>매물명</label>
              <input value={propertyName} onChange={(e) => setPropertyName(e.target.value)} />
            </div>

            <div className="field">
              <label>CTA 문구</label>
              <textarea rows={4} value={cta} onChange={(e) => setCta(e.target.value)} />
            </div>

            <button className="btn btn-dark" onClick={handleGenerate} style={{ width: '100%' }}>
              포스팅 생성하기
            </button>
          </div>
        </aside>

        <section className="content">
          <div className="score-grid">
            <div className="score-card primary">
              <small>최적화 점수</small>
              <strong>{generated ? `${score}점` : '-'}</strong>
              <span>{generated ? '생성 후 표시' : '생성 후 표시'}</span>
            </div>

            <div className="score-card">
              <small>제목 반영</small>
              <strong>{generated ? `${titleScore}/25` : '-'}</strong>
            </div>

            <div className="score-card">
              <small>키워드 구성</small>
              <strong>{generated ? `${keywordScore}/25` : '-'}</strong>
            </div>

            <div className="score-card">
              <small>가독성 / CTA</small>
              <strong>{generated ? `${readabilityScore + ctaScore}/50` : '-'}</strong>
            </div>
          </div>

          <div className="card preview-card">
            {!generated ? (
              <div className="preview-empty">
                <div className="ready-badge">READY</div>
                <h2>아직 생성된 포스팅이 없습니다.</h2>
                <p>
                  왼쪽에서 키워드와 매물 정보를 입력한 뒤 포스팅 생성하기를 누르면
                  네이버 블로그용 초안과 최적화 점수가 생성됩니다.
                </p>
              </div>
            ) : (
              <>
                <input
                  className="preview-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <div className="tag-row">
                  {tags.map((tag) => (
                    <span className="tag" key={tag}>
                      #{tag}
                    </span>
                  ))}
                </div>

                <img
                  className="hero-image"
                  src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format&fit=crop"
                  alt="thumbnail"
                />

                {sections.map((section, idx) => (
                  <article className="article-card" key={section.id}>
                    <h3>
                      {idx + 1}. {section.heading}
                    </h3>
                    <p>{section.body}</p>
                    {section.quote ? <div className="quote">“{section.quote}”</div> : null}
                    <img className="section-image" src={section.image} alt={section.heading} />
                  </article>
                ))}

                <div className="cta-box">
                  <small>CALL TO ACTION</small>
                  <h4>{propertyName || '매물'} 관련 자세한 정보가 궁금하신가요?</h4>
                  <p>{cta || '자세한 상담은 문의로 안내드립니다.'}</p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
