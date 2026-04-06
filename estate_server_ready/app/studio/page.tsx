'use client';

import './studio.css';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

type ToneType = '고급형' | '정보형' | '감성형' | '세일즈형';
type LengthType = '짧게' | '보통' | '길게';

type Section = {
  id: number;
  heading: string;
  body: string;
  image: string;
  quote?: string;
};

type CompanyProfile = {
  id: number;
  company_name: string;
  publish_limit: number;
  publish_used: number;
  image_limit: number;
  image_used: number;
  expires_at: string;
  is_active: boolean;
  plan_name: string | null;
};

export default function StudioPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [mainKeyword, setMainKeyword] = useState('');
  const [subKeyword, setSubKeyword] = useState('');
  const [region, setRegion] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [tone, setTone] = useState<ToneType>('고급형');
  const [length, setLength] = useState<LengthType>('보통');
  const [imageCount, setImageCount] = useState(5);
  const [cta, setCta] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [score, setScore] = useState(0);
  const [scoreDetail, setScoreDetail] = useState({ title: 0, keyword: 0, readability: 0, cta: 0 });
  const [actionMessage, setActionMessage] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function init() {
      const { data } = await supabaseBrowser.auth.getSession();
      if (!data.session) {
        router.replace('/login');
        return;
      }

      const res = await fetch('/api/company/profile', {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });

      if (!res.ok) {
        await supabaseBrowser.auth.signOut();
        router.replace('/login');
        return;
      }

      const json = await res.json();
      setProfile(json.profile);
      setLoadingProfile(false);
    }

    init();
  }, [router]);

  const previewTags = useMemo(() => {
    return [mainKeyword, region, propertyName, ...highlights.map((h) => `${region} ${h}`)].filter(Boolean).slice(0, 8);
  }, [mainKeyword, region, propertyName, highlights]);

  function toggleHighlight(item: string) {
    setHighlights((prev) => prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]);
  }

  async function handleGenerateMock() {
    if (!profile) return;
    setCreating(true);
    setActionMessage('');

    const { data } = await supabaseBrowser.auth.getSession();
    if (!data.session) {
      router.replace('/login');
      return;
    }

    const consumeRes = await fetch('/api/company/consume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify({ publishCount: 1, imageCount }),
    });

    const consumeJson = await consumeRes.json();
    if (!consumeRes.ok) {
      setCreating(false);
      setActionMessage(consumeJson.error || '한도 차감 중 오류가 발생했습니다.');
      return;
    }

    setProfile(consumeJson.profile);

    const safeRegion = region || '지역명';
    const safeProperty = propertyName || '매물명';
    const safeKeyword = mainKeyword || '메인 키워드';
    const safeSubKeyword = subKeyword || '보조 키워드';

    const nextTitle =
      tone === '세일즈형'
        ? `${safeRegion}에서 찾기 어려운 프리미엄 주거, ${safeProperty}의 가치`
        : `${safeRegion} 하이엔드 주거의 기준, ${safeProperty}를 주목해야 하는 이유`;

    setTitle(nextTitle);
    setSections([
      {
        id: 1,
        heading: `${safeRegion} 입지 분석`,
        body: `${safeRegion}은 생활 인프라와 접근성, 상권 밀집도가 균형 있게 갖춰진 지역입니다. 이번 포스팅은 ${safeKeyword}를 중심으로 구성했습니다.`,
        image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1400&auto=format&fit=crop',
        quote: `${safeRegion}의 가치는 단순한 주소가 아니라, 매일 누리는 생활 반경에서 완성됩니다.`,
      },
      {
        id: 2,
        heading: `${safeProperty} 핵심 포인트`,
        body: `${safeProperty}는 외관의 인상부터 내부 공간의 완성도까지 전체적인 밸런스가 뛰어난 편입니다. 하이엔드 주거를 찾는 수요층이 중요하게 보는 기준을 고르게 갖춘 타입으로 볼 수 있습니다.`,
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1400&auto=format&fit=crop',
      },
      {
        id: 3,
        heading: '실거주·자산가치 관점 정리',
        body: `${safeSubKeyword} 같은 보조 키워드를 자연스럽게 섞으면 검색성과 읽는 흐름을 동시에 챙길 수 있습니다. 마지막에는 문의 유도 문구를 넣어 전환까지 연결하는 방식이 효과적입니다.`,
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1400&auto=format&fit=crop',
        quote: '좋은 포스팅은 예쁜 글이 아니라, 문의까지 이어지는 구조를 가집니다.',
      },
    ]);

    const titleScore = mainKeyword ? 25 : 10;
    const keywordScore = subKeyword ? 25 : 12;
    const readabilityScore = highlights.length >= 2 ? 25 : 15;
    const ctaScore = cta.trim() ? 25 : 8;

    setScore(titleScore + keywordScore + readabilityScore + ctaScore);
    setScoreDetail({ title: titleScore, keyword: keywordScore, readability: readabilityScore, cta: ctaScore });
    setGenerated(true);
    setActionMessage('포스팅 초안이 생성됐고 사용량도 반영됐습니다.');
    setCreating(false);
  }

  async function handleLogout() {
    await supabaseBrowser.auth.signOut();
    router.replace('/login');
  }

  if (loadingProfile) {
    return <main className="studio-loading">불러오는 중...</main>;
  }

  if (!profile) return null;

  const highlightOptions = ['입지', '희소성', '인테리어', '학군', '투자가치', '조망'];
  const publishLeft = Math.max(profile.publish_limit - profile.publish_used, 0);
  const imageLeft = Math.max(profile.image_limit - profile.image_used, 0);

  return (
    <main className="studio-page">
      <header className="studio-header">
        <div className="studio-header-inner">
          <div className="studio-company-wrap">
            <div className="studio-company-name">{profile.company_name}</div>
            <div className="studio-plan">{profile.plan_name || '기본 이용권'}</div>
          </div>

          <div className="studio-top-metrics">
            <div className="studio-metric"><span>발행 한도</span><strong>{profile.publish_used} / {profile.publish_limit}</strong></div>
            <div className="studio-metric"><span>이미지 생성</span><strong>{profile.image_used} / {profile.image_limit}</strong></div>
            <div className="studio-metric"><span>이용권 만료일</span><strong>{profile.expires_at}</strong></div>
            <button className="studio-logout" onClick={handleLogout}>로그아웃</button>
          </div>
        </div>
      </header>

      <div className="studio-layout">
        <aside className="studio-sidebar">
          <section className="studio-card">
            <h2>기본 정보</h2>
            <p>포스팅에 들어갈 키워드와 매물 정보를 입력합니다.</p>
            <Field label="메인 키워드" value={mainKeyword} onChange={setMainKeyword} />
            <Field label="서브 키워드" value={subKeyword} onChange={setSubKeyword} />
            <Field label="지역명" value={region} onChange={setRegion} />
            <Field label="매물명" value={propertyName} onChange={setPropertyName} />
          </section>

          <section className="studio-card">
            <h2>생성 옵션</h2>
            <p>톤과 길이, CTA를 설정합니다.</p>
            <SelectField label="톤" value={tone} onChange={(v) => setTone(v as ToneType)} options={['고급형', '정보형', '감성형', '세일즈형']} />
            <SelectField label="글 길이" value={length} onChange={(v) => setLength(v as LengthType)} options={['짧게', '보통', '길게']} />
            <div className="studio-field">
              <label>이미지 개수: {imageCount}장</label>
              <input type="range" min={1} max={10} value={imageCount} onChange={(e) => setImageCount(Number(e.target.value))} />
            </div>
            <div className="studio-field">
              <label>CTA 문구</label>
              <textarea value={cta} onChange={(e) => setCta(e.target.value)} rows={4} />
            </div>
          </section>

          <section className="studio-card">
            <h2>강조 포인트</h2>
            <p>포스팅에서 강조할 요소를 선택합니다.</p>
            <div className="studio-chip-wrap">
              {highlightOptions.map((item) => (
                <button key={item} type="button" onClick={() => toggleHighlight(item)} className={`studio-chip ${highlights.includes(item) ? 'active' : ''}`}>
                  {item}
                </button>
              ))}
            </div>
            <button className="studio-generate-btn" onClick={handleGenerateMock} disabled={creating || publishLeft < 1 || imageLeft < imageCount}>
              {creating ? '생성 중...' : '포스팅 생성하기'}
            </button>
            {actionMessage ? <div className="studio-message">{actionMessage}</div> : null}
          </section>
        </aside>

        <section className="studio-content">
          <div className="studio-summary-row">
            <div className="studio-summary-card studio-score-card">
              <span>최적화 점수</span>
              <strong>{generated ? `${score}점` : '-'}</strong>
              <em>{generated ? (score >= 85 ? '상위노출형 구조' : score >= 70 ? '양호한 구조' : '보완 필요') : '생성 후 표시'}</em>
            </div>
            <div className="studio-summary-card"><span>제목 반영</span><strong>{generated ? `${scoreDetail.title}/25` : '-'}</strong></div>
            <div className="studio-summary-card"><span>키워드 구성</span><strong>{generated ? `${scoreDetail.keyword}/25` : '-'}</strong></div>
            <div className="studio-summary-card"><span>가독성/CTA</span><strong>{generated ? `${scoreDetail.readability + scoreDetail.cta}/50` : '-'}</strong></div>
          </div>

          {!generated ? (
            <div className="studio-empty">
              <div className="studio-empty-badge">READY</div>
              <h2>아직 생성된 포스팅이 없습니다.</h2>
              <p>왼쪽에서 키워드와 매물 정보를 입력한 뒤 <strong>포스팅 생성하기</strong>를 누르면 블로그 초안이 생성됩니다.</p>
            </div>
          ) : (
            <div className="studio-preview">
              <div className="studio-preview-head">
                <div className="studio-preview-label">Preview</div>
                <input className="studio-title-input" value={title} onChange={(e) => setTitle(e.target.value)} />
                <div className="studio-tag-wrap">
                  {previewTags.map((tag) => <span key={tag} className="studio-tag">#{tag}</span>)}
                </div>
              </div>

              <div className="studio-hero-image-wrap">
                <img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format&fit=crop" alt="썸네일" className="studio-hero-image" />
                <div className="studio-hero-overlay" />
                <div className="studio-hero-text">
                  <div className="studio-hero-meta">{region || '지역명'} · {propertyName || '매물명'}</div>
                  <h2>{title}</h2>
                </div>
              </div>

              <p className="studio-intro">{propertyName || '매물명'}를 중심으로 {region || '지역명'} 하이엔드 주거의 분위기와 상품성을 정리해봤습니다. 이번 포스팅은 <strong>{mainKeyword || '메인 키워드'}</strong>를 찾는 분들을 위한 구성입니다.</p>

              <div className="studio-article-list">
                {sections.map((section, index) => (
                  <article key={section.id} className="studio-article-card">
                    <div className="studio-article-head"><h3>{index + 1}. {section.heading}</h3></div>
                    <p className="studio-article-body">{section.body}</p>
                    {section.quote ? <blockquote className="studio-quote">“{section.quote}”</blockquote> : null}
                    <img src={section.image} alt={section.heading} className="studio-section-image" />
                    <p className="studio-article-sub">현장에서 직접 확인해보면 사진만으로는 다 담기지 않는 분위기와 밀도가 있습니다. 특히 {highlights.join(', ') || '핵심 포인트'}를 중요하게 보는 분들에게는 실제 공간감이 더 크게 다가올 수 있습니다.</p>
                  </article>
                ))}
              </div>

              <div className="studio-cta-box">
                <div className="studio-cta-label">Call To Action</div>
                <h4>{propertyName || '매물'} 관련 자세한 정보가 궁금하신가요?</h4>
                <p>{cta || '상담 문의 시 자세한 매물 정보를 안내드립니다.'}</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="studio-field">
      <label>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <div className="studio-field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}
