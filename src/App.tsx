import React, { useState, useEffect } from "react";
import { Settings, X, Save } from "lucide-react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "./firebase";

const INITIAL_DATA = {
  name: "임석훈 / Lim Seok-hun",
  subtitle: "데이터와 창의력 기반 인재.",
  email: "tjrgns421@gmail.com",
  phone: "010-2591-2931",
  price_label: "희망 연봉",
  price_main: "회사내규에 따름",
  price_contact: "견적 문의: tjrgns421@gmail.com\n010-2591-2931",
  delivery: "📦 배송 안내: 부르시면 달려갑니다.",
  philosophy: '"기획이 탄탄할수록 구현할 때 헛된 시간을 낭비하지 않는다."',
  profile_img: "https://picsum.photos/seed/profile/400/440",
  p1_title: "VIMUL — 올인원 제품 기획 및 제작",
  p1_subtitle: "신제품 기획 · 시장 분석 · 설문조사 · 카테고리 이노베이션",
  p1_hero_img: "https://picsum.photos/seed/p1hero/800/340",
  p1_img1: "https://picsum.photos/seed/p1img1/400/220",
  p1_img2: "https://picsum.photos/seed/p1img2/400/220",
  p1_img3: "https://picsum.photos/seed/p1img3/400/180",
  p1_img4: "https://picsum.photos/seed/p1img4/400/180",
  p1_problem_title: "관리의 파편화",
  p1_problem_desc: "설문 응답 1위: '끈적임·이물감'과 '따로 쓰기 귀찮음'. 남성 뷰티 루틴의 소비 피로도.",
  p1_solution_title: "카테고리를 뒤집는 퓨전",
  p1_solution_desc: "국내 최초 헤어+스킨 동시 케어 제형 기획. 3~4만원대·100ml 설계.",
  p1_result_title: "니즈의 실체화",
  p1_result_desc: "설문·시장 데이터 기반으로 시장의 '이유 있는 공백'을 메운 실현 가능한 모델 완성.",
  p1_insight:
    "시장에 없는 제품은 '기회'이기도 하지만 '나오지 못할 이유'가 있을 수도 있다. 참고 자료가 부족한 영역에서 데이터를 기반으로 실현 가능한 모델을 완성하는 것이 핵심이었습니다.",
  p2_title: "VIMUL 브랜드 광고 — AI툴 사용한 광고 영상 제작",
  p2_hero_img: "https://picsum.photos/seed/p2hero/800/340",
  p2_video: "",
  p2_tools: "Midjourney, ChatGPT, Premiere Pro",
  p2_problem_title: "기획의 고립",
  p2_problem_desc: "1인 프로젝트로 고감도 비주얼 구현의 막막함과 독창적인 서사 구축의 압박감.",
  p2_solution_title: "동화 스토리텔링",
  p2_solution_desc: "'잠자는 숲속의 공주' 서사 접목. 배경 컬러 배치로 시각 피로도 최소화.",
  p2_result_title: "Ever After Beauty",
  p2_result_desc: "동화의 클리셰를 브랜드 가치로 연결, \"Ever After Beauty\" 슬로건 완성.",
  p2_insight:
    "기획이 탄탄할수록 구현하는 데 헛된 시간을 낭비하지 않고 올바른 방향으로 제작이 가능해진다는 것을 직접 경험했습니다.",
  p3_title: "Device Sync — 뷰티 디바이스 웹사이트 기획 및 제작",
  p3_hero_img: "https://picsum.photos/seed/p3hero/800/340",
  p3_img1: "https://picsum.photos/seed/p3img1/400/220",
  p3_img2: "https://picsum.photos/seed/p3img2/400/220",
  p3_img3: "https://picsum.photos/seed/p3img3/400/220",
  p3_img4: "https://picsum.photos/seed/p3img4/400/220",
  p3_link: "",
  p3_tools: "Figma, Notion",
  p3_problem_title: "높은 진입장벽",
  p3_problem_desc: "고가 뷰티 기기의 생소한 기능명과 복잡한 사용법으로 소비자가 제대로 활용하지 못함.",
  p3_solution_title: "직관을 더한 UX",
  p3_solution_desc: "피부고민 카테고리 기반 기기 추천, Color Coding으로 기능 시각화, 제품 간 비교 기능 설계.",
  p3_result_title: "확신을 주는 구매 여정",
  p3_result_desc: "기기 사용 허들을 낮추고 대여 서비스와 연계, 시장의 선순환을 유도하는 프로토타입 완성.",
  p3_insight:
    "데이터는 비교될 때 가치를 가집니다. 단순한 정보 나열이 아니라 소비자가 직접 비교하고 확신을 얻을 수 있는 구조를 설계하는 것이 UX 기획의 핵심임을 깨달았습니다.",
  contact_label1: "이메일",
  contact_label2: "연락처",
  contact_label3: "전문 분야",
  contact_val3: "마케팅 · 브랜드 기획",
  contact_label4: "근무 가능 시점",
  contact_val4: "협의 가능",
  contact_notice: "📦 배송 정보: 출근 가능 지역 및 시작일은 이메일로 문의해주세요. 빠른 응답을 약속드립니다.",
  contact_btn1: "장바구니",
  contact_btn2: "바로 구매 →",
};

export default function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [editData, setEditData] = useState(INITIAL_DATA);
  const [activeType, setActiveType] = useState("정규직");
  const [activeField, setActiveField] = useState("브랜드 기획");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email);
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    });

    const docRef = doc(db, "portfolio", "data");
    const unsubData = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const savedData = docSnap.data();
        setData({ ...INITIAL_DATA, ...savedData });
        setEditData({ ...INITIAL_DATA, ...savedData });
      } else {
        // Initialize if not exists
        setDoc(docRef, INITIAL_DATA);
      }
    }, (error) => {
      console.error("Firestore Error: ", error);
    });

    return () => {
      unsubAuth();
      unsubData();
    };
  }, []);

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdminOpen(true);
  };

  const handleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      alert("로그인에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, "portfolio", "data");
      await setDoc(docRef, editData);
      setIsAdminOpen(false);
      alert("저장되었습니다.");
    } catch (e) {
      console.error("Failed to save data:", e);
      alert("저장에 실패했습니다. 관리자 권한이 있는지 확인해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, [key]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderVideo = () => {
    if (!data.p2_video) {
      return (
        <div className="video-placeholder-inner">
          <div className="play-btn">▶</div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#888" }}>
            VIMUL 브랜드 광고 영상
          </div>
          <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
            어드민에서 유튜브 링크 또는 영상 파일을 등록해주세요
          </div>
        </div>
      );
    }
    const ytMatch = String(data.p2_video).match(
      /(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    if (ytMatch) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          allowFullScreen
        ></iframe>
      );
    }
    return <video controls src={data.p2_video}></video>;
  };

  return (
    <div className="shop-wrap">
      <div className="breadcrumb">
        <span>
          홈 &gt; 마케팅/기획 인재 &gt;{" "}
          <span>{data.name ? data.name.split("/")[0].trim() : ""}</span>
        </span>
        <button className="admin-link" onClick={handleAdminClick}>
          <Settings size={14} /> 관리자
        </button>
      </div>

      <div className="product-grid">
        <div className="product-image-box">
          <span className="img-badge">LIMITED TALENT</span>
          <img src={data.profile_img} alt="프로필" />
          <span className="stock-badge">재고 1명 남음</span>
        </div>
        <div className="product-info">
          <div className="brand-label">Marketing · Brand Planning</div>
          <div className="product-name">{data.name}</div>
          <div className="product-sub">{data.subtitle}</div>
          <div className="rating-row">
            <span className="stars">★★★★★</span>
            <span className="rating-text">5.0 · 프로젝트 3건 완료</span>
          </div>
          <div className="divider"></div>
          <div style={{ marginBottom: "20px" }}>
            <div className="price-label">{data.price_label || "희망 연봉"}</div>
            <div className="price-main">{data.price_main || "회사내규에 따름"}</div>
            <div className="price-contact">
              {data.price_contact || `견적 문의: ${data.email}\n${data.phone}`}
            </div>
            <div className="price-delivery">{data.delivery}</div>
          </div>
          <div className="divider"></div>
          <div className="option-label">고용 형태 선택</div>
          <div className="option-chips">
            {["정규직", "계약직", "인턴", "프리랜서"].map((type) => (
              <div
                key={type}
                className={`chip ${activeType === type ? "active" : ""}`}
                onClick={() => setActiveType(type)}
              >
                {type}
              </div>
            ))}
          </div>
          <div className="option-label">전문 분야 선택</div>
          <div className="option-chips">
            {["브랜드 기획", "콘텐츠 마케팅", "AI 활용 기획", "UX 기획"].map(
              (field) => (
                <div
                  key={field}
                  className={`chip ${activeField === field ? "active" : ""}`}
                  onClick={() => setActiveField(field)}
                >
                  {field}
                </div>
              ),
            )}
          </div>
          <div className="btn-row">
            <button className="btn-cart">장바구니</button>
            <button className="btn-buy">바로 구매</button>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <div className="section-label">상품 상세 정보</div>
        <table className="spec-table">
          <tbody>
            <tr>
              <td>학력</td>
              <td>건국대학교 글로컬캠퍼스 · 뷰티화장품과 졸업</td>
            </tr>
            <tr>
              <td>핵심 역량</td>
              <td>
                <div className="skill-row">
                  <span className="skill-pill">AI 툴 활용</span>
                  <span className="skill-pill">책임감</span>
                  <span className="skill-pill">열정</span>
                  <span className="skill-pill">창의력</span>
                  <span className="skill-pill">데이터 기반 사고</span>
                  <span className="skill-pill">스토리텔링</span>
                </div>
              </td>
            </tr>
            <tr>
              <td>프로젝트</td>
              <td>
                올인원 제품 기획 및 제작 / AI툴 사용한 광고 영상 제작 / 뷰티
                디바이스 웹사이트 기획 및 제작
              </td>
            </tr>
            <tr>
              <td>전문 영역</td>
              <td>뷰티·화장품 브랜드 기획, AI 기반 콘텐츠 제작, UX 기획</td>
            </tr>
            <tr>
              <td>기획 철학</td>
              <td>{data.philosophy}</td>
            </tr>
          </tbody>
        </table>

        {/* PROJECT 01 */}
        <div className="project-detail">
          <div className="project-header">
            <div className="project-num-big">01</div>
            <div className="project-title-area">
              <div className="project-title-big">{data.p1_title}</div>
              <div className="project-subtitle">{data.p1_subtitle}</div>
            </div>
          </div>
          <div className="project-tags">
            <span className="ptag">신제품 기획</span>
            <span className="ptag">시장 분석</span>
            <span className="ptag">설문조사</span>
            <span className="ptag">카테고리 이노베이션</span>
          </div>
          <div className="title-img-wrap">
            <img src={data.p1_hero_img} alt="" />
            <div className="title-img-overlay">
              <div className="proj-title">VIMUL FUSION ALL IN ONE</div>
              <div className="proj-sub">
                MAN'S CARE · SKIN &amp; HAIR · 100ml · ₩35,000
              </div>
            </div>
          </div>
          <div className="psr-grid">
            <div className="psr-block">
              <div className="psr-label">Problem</div>
              <div className="psr-title">{data.p1_problem_title}</div>
              <div className="psr-desc">{data.p1_problem_desc}</div>
            </div>
            <div className="psr-block">
              <div className="psr-label">Solution</div>
              <div className="psr-title">{data.p1_solution_title}</div>
              <div className="psr-desc">{data.p1_solution_desc}</div>
            </div>
            <div className="psr-block">
              <div className="psr-label">Result</div>
              <div className="psr-title">{data.p1_result_title}</div>
              <div className="psr-desc">{data.p1_result_desc}</div>
            </div>
          </div>
          <div className="img-2col">
            <img src={data.p1_img1} alt="" className="clickable-img" onClick={() => setSelectedImage(data.p1_img1)} />
            <img src={data.p1_img2} alt="" className="clickable-img" onClick={() => setSelectedImage(data.p1_img2)} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: ".15em",
                color: "#aaa",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              핵심 성분
            </div>
            <div className="img-2col">
              <div style={{ textAlign: "center" }}>
                <img
                  src={data.p1_img3}
                  className="clickable-img"
                  onClick={() => setSelectedImage(data.p1_img3)}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "0.5px solid #e5e5e5",
                  }}
                  alt=""
                />
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    marginTop: "8px",
                  }}
                >
                  올가닉 골든 호호바 오일
                </div>
                <div
                  style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}
                >
                  보습·피부 재생·모발 케어
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <img
                  src={data.p1_img4}
                  className="clickable-img"
                  onClick={() => setSelectedImage(data.p1_img4)}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "0.5px solid #e5e5e5",
                  }}
                  alt=""
                />
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    marginTop: "8px",
                  }}
                >
                  알로에베라 겔
                </div>
                <div
                  style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}
                >
                  진정·보습·피부 탄력
                </div>
              </div>
            </div>
          </div>
          <div className="contrib-section">
            <div className="contrib-header">
              <div className="contrib-title">기여도</div>
              <div className="contrib-team">1인 프로젝트</div>
            </div>
            <div className="contrib-item">
              <div className="contrib-row">
                <span className="contrib-label">기획</span>
                <span className="contrib-pct">100%</span>
              </div>
              <div className="gauge-bg">
                <div className="gauge-fill" style={{ width: "100%" }}></div>
              </div>
            </div>
            <div className="contrib-item">
              <div className="contrib-row">
                <span className="contrib-label">제작</span>
                <span className="contrib-pct">100%</span>
              </div>
              <div className="gauge-bg">
                <div className="gauge-fill" style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>
          <div className="insight-box">
            <div className="insight-label">INSIGHT</div>
            <span>{data.p1_insight}</span>
          </div>
        </div>

        <div className="project-divider"></div>

        {/* PROJECT 02 */}
        <div className="project-detail">
          <div className="project-header">
            <div className="project-num-big">02</div>
            <div className="project-title-area">
              <div className="project-title-big">{data.p2_title}</div>
              <div className="project-subtitle">
                AI 활용 · 스토리텔링 · 비주얼 기획 · 브랜드 광고
              </div>
            </div>
          </div>
          <div className="project-tags">
            <span className="ptag">AI 활용</span>
            <span className="ptag">스토리텔링</span>
            <span className="ptag">비주얼 기획</span>
            <span className="ptag">브랜드 광고</span>
          </div>
          <div className="title-img-wrap">
            <img src={data.p2_hero_img} alt="" />
            <div className="title-img-overlay">
              <div className="proj-title">EVER AFTER BEAUTY</div>
              <div className="proj-sub">
                100% AI 제작 · 잠자는 숲속의 공주 서사
              </div>
            </div>
          </div>
          <div className="video-wrap">{renderVideo()}</div>
          <div className="psr-grid">
            <div className="psr-block">
              <div className="psr-label">Problem</div>
              <div className="psr-title">{data.p2_problem_title}</div>
              <div className="psr-desc">{data.p2_problem_desc}</div>
            </div>
            <div className="psr-block">
              <div className="psr-label">Solution</div>
              <div className="psr-title">{data.p2_solution_title}</div>
              <div className="psr-desc">{data.p2_solution_desc}</div>
            </div>
            <div className="psr-block">
              <div className="psr-label">Result</div>
              <div className="psr-title">{data.p2_result_title}</div>
              <div className="psr-desc">{data.p2_result_desc}</div>
            </div>
          </div>
          <div className="contrib-section">
            <div className="contrib-header">
              <div className="contrib-title">기여도</div>
              <div className="contrib-team">1인 프로젝트</div>
            </div>
            <div className="contrib-item">
              <div className="contrib-row">
                <span className="contrib-label">기획</span>
                <span className="contrib-pct">100%</span>
              </div>
              <div className="gauge-bg">
                <div className="gauge-fill" style={{ width: "100%" }}></div>
              </div>
            </div>
            <div className="contrib-item">
              <div className="contrib-row">
                <span className="contrib-label">AI 영상 제작</span>
                <span className="contrib-pct">100%</span>
              </div>
              <div className="gauge-bg">
                <div className="gauge-fill" style={{ width: "100%" }}></div>
              </div>
            </div>
            {data.p2_tools && (
              <div style={{ marginTop: "16px" }}>
                <div className="contrib-title" style={{ marginBottom: "8px" }}>사용한 툴</div>
                <div className="skill-row">
                  {data.p2_tools.split(",").map((tool: string, idx: number) => (
                    <span key={idx} className="skill-pill">{tool.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="insight-box">
            <div className="insight-label">INSIGHT</div>
            <span>{data.p2_insight}</span>
          </div>
        </div>

        <div className="project-divider"></div>

        {/* PROJECT 03 */}
        <div className="project-detail">
          <div className="project-header">
            <div className="project-num-big">03</div>
            <div className="project-title-area">
              <div className="project-title-big">{data.p3_title}</div>
              <div className="project-subtitle">
                UX 기획 · 앱 기획 · 컬러 코딩 · 비교 기능 설계
              </div>
            </div>
          </div>
          <div className="project-tags">
            <span className="ptag">UX 기획</span>
            <span className="ptag">앱 기획</span>
            <span className="ptag">컬러 코딩</span>
            <span className="ptag">비교 기능 설계</span>
            <span className="ptag">협업 2인</span>
          </div>
          <div className="title-img-wrap">
            <img src={data.p3_hero_img} alt="" />
            <div className="title-img-overlay">
              <div className="proj-title">DEVICE SYNC</div>
              <div className="proj-sub">
                뷰티 디바이스 UX · 피부고민 기반 추천 · 제품 비교
              </div>
            </div>
          </div>
          <div className="psr-grid">
            <div className="psr-block">
              <div className="psr-label">Problem</div>
              <div className="psr-title">{data.p3_problem_title}</div>
              <div className="psr-desc">{data.p3_problem_desc}</div>
            </div>
            <div className="psr-block">
              <div className="psr-label">Solution</div>
              <div className="psr-title">{data.p3_solution_title}</div>
              <div className="psr-desc">{data.p3_solution_desc}</div>
            </div>
            <div className="psr-block">
              <div className="psr-label">Result</div>
              <div className="psr-title">{data.p3_result_title}</div>
              <div className="psr-desc">{data.p3_result_desc}</div>
            </div>
          </div>
          <div className="img-4col-vertical">
            <img src={data.p3_img1} alt="" className="clickable-img" onClick={() => setSelectedImage(data.p3_img1)} />
            <img src={data.p3_img2} alt="" className="clickable-img" onClick={() => setSelectedImage(data.p3_img2)} />
            <img src={data.p3_img3} alt="" className="clickable-img" onClick={() => setSelectedImage(data.p3_img3)} />
            <img src={data.p3_img4} alt="" className="clickable-img" onClick={() => setSelectedImage(data.p3_img4)} />
          </div>
          {data.p3_link && (
            <a href={data.p3_link} target="_blank" rel="noopener noreferrer" className="project-link-btn">
              프로젝트 보러가기
            </a>
          )}
          <div className="contrib-section">
            <div className="contrib-header">
              <div className="contrib-title">기여도</div>
              <div className="contrib-team">2인 프로젝트</div>
            </div>
            <div className="contrib-item">
              <div className="contrib-row">
                <span className="contrib-label">기획·디자인</span>
                <span className="contrib-pct">50%</span>
              </div>
              <div className="gauge-bg">
                <div className="gauge-fill" style={{ width: "50%" }}></div>
              </div>
            </div>
            <div className="contrib-item">
              <div className="contrib-row">
                <span className="contrib-label">기능 구현</span>
                <span className="contrib-pct">100%</span>
              </div>
              <div className="gauge-bg">
                <div className="gauge-fill" style={{ width: "100%" }}></div>
              </div>
            </div>
            {data.p3_tools && (
              <div style={{ marginTop: "16px" }}>
                <div className="contrib-title" style={{ marginBottom: "8px" }}>사용한 툴</div>
                <div className="skill-row">
                  {data.p3_tools.split(",").map((tool: string, idx: number) => (
                    <span key={idx} className="skill-pill">{tool.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="insight-box">
            <div className="insight-label">INSIGHT</div>
            <span>{data.p3_insight}</span>
          </div>
        </div>

        <div className="contact-footer">
          <div className="section-label">연락처 / Contact</div>
          <div className="contact-grid">
            <div className="contact-item">
              <div className="contact-item-label">{data.contact_label1 || "이메일"}</div>
              <div className="contact-item-val">{data.email}</div>
            </div>
            <div className="contact-item">
              <div className="contact-item-label">{data.contact_label2 || "연락처"}</div>
              <div className="contact-item-val">{data.phone}</div>
            </div>
            <div className="contact-item">
              <div className="contact-item-label">{data.contact_label3 || "전문 분야"}</div>
              <div className="contact-item-val">{data.contact_val3 || "마케팅 · 브랜드 기획"}</div>
            </div>
            <div className="contact-item">
              <div className="contact-item-label">{data.contact_label4 || "근무 가능 시점"}</div>
              <div className="contact-item-val">{data.contact_val4 || "협의 가능"}</div>
            </div>
          </div>
          <div className="notice-box">
            {data.contact_notice || "📦 배송 정보: 출근 가능 지역 및 시작일은 이메일로 문의해주세요. 빠른 응답을 약속드립니다."}
          </div>
          <div className="btn-row">
            <button className="btn-cart">{data.contact_btn1 || "장바구니"}</button>
            <button className="btn-buy">{data.contact_btn2 || "바로 구매 →"}</button>
          </div>
        </div>
      </div>

      {isAdminOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">관리자 설정</h2>
              <button
                onClick={() => setIsAdminOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {!isAuthenticated ? (
                <div className="flex flex-col gap-4 items-center justify-center py-10">
                  <p className="text-gray-600 mb-4">관리자 권한이 필요합니다.</p>
                  <button
                    onClick={handleLogin}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Google 계정으로 로그인
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">로그인됨: {userEmail}</span>
                    <button onClick={handleLogout} className="text-sm text-red-600 font-bold hover:underline">로그아웃</button>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-lg border-b pb-2">
                      기본 정보
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        이름
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        서브타이틀
                        <input
                          type="text"
                          value={editData.subtitle}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              subtitle: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        이메일
                        <input
                          type="text"
                          value={editData.email}
                          onChange={(e) =>
                            setEditData({ ...editData, email: e.target.value })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        연락처
                        <input
                          type="text"
                          value={editData.phone}
                          onChange={(e) =>
                            setEditData({ ...editData, phone: e.target.value })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        희망 연봉 라벨
                        <input
                          type="text"
                          value={editData.price_label || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, price_label: e.target.value })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        희망 연봉 내용
                        <input
                          type="text"
                          value={editData.price_main || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, price_main: e.target.value })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        견적 문의
                        <textarea
                          value={editData.price_contact || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, price_contact: e.target.value })
                          }
                          className="p-2 border rounded font-normal h-20"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        배송 안내
                        <input
                          type="text"
                          value={editData.delivery}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              delivery: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        기획 철학
                        <textarea
                          value={editData.philosophy}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              philosophy: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal h-24"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        프로필 이미지
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "profile_img")}
                          className="font-normal"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-lg border-b pb-2">
                      프로젝트 1
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        제목
                        <input
                          type="text"
                          value={editData.p1_title}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p1_title: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        서브타이틀
                        <input
                          type="text"
                          value={editData.p1_subtitle}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p1_subtitle: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Problem 제목
                          <input type="text" value={editData.p1_problem_title || ""} onChange={(e) => setEditData({ ...editData, p1_problem_title: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Problem 내용
                          <textarea value={editData.p1_problem_desc || ""} onChange={(e) => setEditData({ ...editData, p1_problem_desc: e.target.value })} className="p-2 border rounded font-normal h-20" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Solution 제목
                          <input type="text" value={editData.p1_solution_title || ""} onChange={(e) => setEditData({ ...editData, p1_solution_title: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Solution 내용
                          <textarea value={editData.p1_solution_desc || ""} onChange={(e) => setEditData({ ...editData, p1_solution_desc: e.target.value })} className="p-2 border rounded font-normal h-20" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Result 제목
                          <input type="text" value={editData.p1_result_title || ""} onChange={(e) => setEditData({ ...editData, p1_result_title: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Result 내용
                          <textarea value={editData.p1_result_desc || ""} onChange={(e) => setEditData({ ...editData, p1_result_desc: e.target.value })} className="p-2 border rounded font-normal h-20" />
                        </label>
                      </div>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        인사이트
                        <textarea
                          value={editData.p1_insight}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p1_insight: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal h-24"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        히어로 이미지
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "p1_hero_img")}
                          className="font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        이미지 1
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "p1_img1")}
                          className="font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        이미지 2
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "p1_img2")}
                          className="font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        이미지 3
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "p1_img3")}
                          className="font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        이미지 4
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "p1_img4")}
                          className="font-normal"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-lg border-b pb-2">
                      프로젝트 2
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        제목
                        <input
                          type="text"
                          value={editData.p2_title}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p2_title: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        사용한 툴 (쉼표로 구분)
                        <input
                          type="text"
                          value={editData.p2_tools || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p2_tools: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                          placeholder="예: Midjourney, ChatGPT"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Problem 제목
                          <input type="text" value={editData.p2_problem_title || ""} onChange={(e) => setEditData({ ...editData, p2_problem_title: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Problem 내용
                          <textarea value={editData.p2_problem_desc || ""} onChange={(e) => setEditData({ ...editData, p2_problem_desc: e.target.value })} className="p-2 border rounded font-normal h-20" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Solution 제목
                          <input type="text" value={editData.p2_solution_title || ""} onChange={(e) => setEditData({ ...editData, p2_solution_title: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Solution 내용
                          <textarea value={editData.p2_solution_desc || ""} onChange={(e) => setEditData({ ...editData, p2_solution_desc: e.target.value })} className="p-2 border rounded font-normal h-20" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Result 제목
                          <input type="text" value={editData.p2_result_title || ""} onChange={(e) => setEditData({ ...editData, p2_result_title: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Result 내용
                          <textarea value={editData.p2_result_desc || ""} onChange={(e) => setEditData({ ...editData, p2_result_desc: e.target.value })} className="p-2 border rounded font-normal h-20" />
                        </label>
                      </div>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        인사이트
                        <textarea
                          value={editData.p2_insight}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p2_insight: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal h-24"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        히어로 이미지
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "p2_hero_img")}
                          className="font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        영상 링크 (YouTube URL)
                        <input
                          type="text"
                          value={editData.p2_video}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p2_video: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        또는 영상 파일 업로드
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileChange(e, "p2_video")}
                          className="font-normal"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-lg border-b pb-2">
                      프로젝트 3
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        제목
                        <input
                          type="text"
                          value={editData.p3_title}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p3_title: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        사용한 툴 (쉼표로 구분)
                        <input
                          type="text"
                          value={editData.p3_tools || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p3_tools: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal"
                          placeholder="예: Figma, Notion"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Problem 제목
                          <input type="text" value={editData.p3_problem_title || ""} onChange={(e) => setEditData({ ...editData, p3_problem_title: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Problem 내용
                          <textarea value={editData.p3_problem_desc || ""} onChange={(e) => setEditData({ ...editData, p3_problem_desc: e.target.value })} className="p-2 border rounded font-normal h-20" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Solution 제목
                          <input type="text" value={editData.p3_solution_title || ""} onChange={(e) => setEditData({ ...editData, p3_solution_title: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Solution 내용
                          <textarea value={editData.p3_solution_desc || ""} onChange={(e) => setEditData({ ...editData, p3_solution_desc: e.target.value })} className="p-2 border rounded font-normal h-20" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Result 제목
                          <input type="text" value={editData.p3_result_title || ""} onChange={(e) => setEditData({ ...editData, p3_result_title: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          Result 내용
                          <textarea value={editData.p3_result_desc || ""} onChange={(e) => setEditData({ ...editData, p3_result_desc: e.target.value })} className="p-2 border rounded font-normal h-20" />
                        </label>
                      </div>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        인사이트
                        <textarea
                          value={editData.p3_insight}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p3_insight: e.target.value,
                            })
                          }
                          className="p-2 border rounded font-normal h-24"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        히어로 이미지
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "p3_hero_img")}
                          className="font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        이미지 1
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "p3_img1")}
                          className="font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        이미지 2
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "p3_img2")}
                          className="font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        이미지 3
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "p3_img3")}
                          className="font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        이미지 4
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "p3_img4")}
                          className="font-normal"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        프로젝트 링크
                        <input
                          type="text"
                          value={editData.p3_link || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              p3_link: e.target.value,
                            })
                          }
                          className="px-3 py-2 border rounded-lg font-normal"
                          placeholder="https://..."
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h3 className="font-bold text-lg border-b pb-2">
                      연락처 / Contact
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 1 제목
                          <input type="text" value={editData.contact_label1 || ""} onChange={(e) => setEditData({ ...editData, contact_label1: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 1 내용 (이메일)
                          <input type="text" value={editData.email || ""} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 2 제목
                          <input type="text" value={editData.contact_label2 || ""} onChange={(e) => setEditData({ ...editData, contact_label2: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 2 내용 (전화번호)
                          <input type="text" value={editData.phone || ""} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 3 제목
                          <input type="text" value={editData.contact_label3 || ""} onChange={(e) => setEditData({ ...editData, contact_label3: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 3 내용
                          <input type="text" value={editData.contact_val3 || ""} onChange={(e) => setEditData({ ...editData, contact_val3: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 4 제목
                          <input type="text" value={editData.contact_label4 || ""} onChange={(e) => setEditData({ ...editData, contact_label4: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          연락처 항목 4 내용
                          <input type="text" value={editData.contact_val4 || ""} onChange={(e) => setEditData({ ...editData, contact_val4: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                      </div>
                      <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                        배송 정보 (Notice Box)
                        <textarea value={editData.contact_notice || ""} onChange={(e) => setEditData({ ...editData, contact_notice: e.target.value })} className="p-2 border rounded font-normal h-20" />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          버튼 1 텍스트
                          <input type="text" value={editData.contact_btn1 || ""} onChange={(e) => setEditData({ ...editData, contact_btn1: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-bold text-gray-600">
                          버튼 2 텍스트
                          <input type="text" value={editData.contact_btn2 || ""} onChange={(e) => setEditData({ ...editData, contact_btn2: e.target.value })} className="p-2 border rounded font-normal" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setIsAdminOpen(false)}
                  className="px-6 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-lg font-medium bg-black text-white hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} /> {isSaving ? "저장 중..." : "저장"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
          <button className="image-modal-close" onClick={() => setSelectedImage(null)}>
            <X size={32} />
          </button>
          <img src={selectedImage} alt="Full size" className="image-modal-content" />
        </div>
      )}
    </div>
  );
}
