/* global React, IconMail, IconLock, IconCheck */

function LoginScreen() {
  const [email, setEmail] = React.useState("minji.park@demodev.kr");
  const [pw, setPw]       = React.useState("••••••••••");
  const [remember, setRemember] = React.useState(true);

  return (
    <div className="login-wrap">
      <div className="login-hero">
        <div className="login-hero-top">
          <span className="mk">T</span>
          <span>TODO · demodev</span>
        </div>

        <div className="login-hero-headline">
          <h1>오늘 할 일을<br/>가장 가볍게.</h1>
          <p>하루를 빠르게 정리하고, 중요한 것을 놓치지 않게 도와줍니다. demodev 워크스페이스 계정으로 로그인하세요.</p>
        </div>

        <div className="login-hero-foot">
          <div className="row">
            <span>v 1.4.0</span>
            <span>© demodev — 2026</span>
            <span>Made in Seoul</span>
          </div>
        </div>

        <div className="login-card-deck">
          <div className="login-mini" data-done="true">
            <span className="cb"></span>
            <div>
              <div className="tt">디자인 시스템 v2 리뷰</div>
              <div className="sb-line">완료 · 16:00</div>
            </div>
          </div>
          <div className="login-mini">
            <span className="cb"></span>
            <div>
              <div className="tt">Acme 미팅 자료 준비</div>
              <div className="sb-line">오늘 · 14:30</div>
            </div>
          </div>
          <div className="login-mini">
            <span className="cb"></span>
            <div>
              <div className="tt">엄마 생신 선물 주문</div>
              <div className="sb-line">지연 · 3일</div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form">
        <div className="login-form-inner">
          <h2>로그인</h2>
          <p className="sub">계속하려면 계정 정보를 입력해 주세요.</p>

          <div className="field">
            <label className="field-label">이메일</label>
            <div className="field-input">
              <IconMail />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@demodev.kr" />
            </div>
          </div>

          <div className="field">
            <label className="field-label">비밀번호</label>
            <div className="field-input">
              <IconLock />
              <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" />
            </div>
          </div>

          <div className="row" style={{ justifyContent: "space-between" }}>
            <label className="row gap-2" style={{ cursor: "pointer", font: "500 13px/1 var(--font-sans)", color: "var(--text-2)" }}>
              <span className="cbx-lg" aria-checked={remember} onClick={() => setRemember(!remember)} style={{ width: 18, height: 18, borderRadius: 5 }}></span>
              로그인 유지
            </label>
            <a href="#" style={{ font: "500 13px/1 var(--font-sans)", color: "var(--accent)", textDecoration: "none" }} onClick={e => e.preventDefault()}>비밀번호 찾기</a>
          </div>

          <button className="btn-primary-lg" style={{ marginTop: 4 }}>이메일로 로그인 →</button>

          <div className="divider">또는</div>

          <div className="social-row">
            <button className="social-btn social-naver">
              <img src="assets/icons/social/naver.png" alt="NAVER" /> NAVER
            </button>
            <button className="social-btn social-kakao">
              <img src="assets/icons/social/kakaotalk.svg" alt="KakaoTalk" /> KakaoTalk
            </button>
          </div>

          <div style={{ font: "500 13px/1.4 var(--font-sans)", color: "var(--text-3)", textAlign: "center", marginTop: 6 }}>
            아직 계정이 없으신가요? <a href="#" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }} onClick={e => e.preventDefault()}>회원가입</a>
          </div>
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
