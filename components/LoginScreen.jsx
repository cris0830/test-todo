/* global React, IconMail, IconLock, supabaseAuth, supabaseErrors */

function LoginScreen() {
  const [email, setEmail]     = React.useState("");
  const [pw, setPw]           = React.useState("");
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [error, setError]     = React.useState("");

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      const { error } = await window.supabaseAuth.signInWithGoogle();
      if (error) setError(window.supabaseErrors.getKoreanError(error));
      // 성공 시 브라우저가 Google 인증 페이지로 이동함
    } catch (err) {
      setError(window.supabaseErrors.getKoreanError(err));
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !pw) { setError("이메일과 비밀번호를 입력해 주세요."); return; }
    setError("");
    setLoading(true);
    try {
      const result = isSignUp
        ? await window.supabaseAuth.signUp(email, pw)
        : await window.supabaseAuth.signIn(email, pw);

      if (result.error) {
        setError(window.supabaseErrors.getKoreanError(result.error));
        return;
      }
      // 회원가입 성공 시 이메일 확인 안내 (Supabase 기본 설정)
      if (isSignUp && result.data && !result.data.session) {
        setError("가입 확인 이메일을 발송했습니다. 받은편지함을 확인해 주세요.");
      }
      // 로그인 성공 → app.jsx의 onAuthStateChange가 user 상태를 업데이트함
    } catch (err) {
      setError(window.supabaseErrors.getKoreanError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      {/* ── 히어로 패널 ── */}
      <div className="login-hero">
        <div className="login-hero-top">
          <span className="mk">T</span>
          <span>TODO · demodev</span>
        </div>

        <div className="login-hero-headline">
          <h1>오늘 할 일을<br/>가장 가볍게.</h1>
          <p>하루를 빠르게 정리하고, 중요한 것을 놓치지 않게 도와줍니다. 계정으로 로그인하세요.</p>
        </div>

        <div className="login-hero-foot">
          <div className="row">
            <span>v 2.0.0</span>
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

      {/* ── 폼 패널 ── */}
      <div className="login-form">
        <div className="login-form-inner">
          <h2>{isSignUp ? "회원가입" : "로그인"}</h2>
          <p className="sub">
            {isSignUp
              ? "이메일과 비밀번호를 입력해 계정을 만드세요."
              : "계속하려면 계정 정보를 입력해 주세요."}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">이메일</label>
              <div className="field-input">
                <IconMail />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label">비밀번호</label>
              <div className="field-input">
                <IconLock />
                <input
                  type="password"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
              </div>
            </div>

            {/* 오류 메시지 */}
            {error && (
              <div style={{
                marginBottom: 12, padding: "10px 14px",
                background: error.includes("이메일을 발송") ? "var(--color-success-soft, #dbf6ec)" : "var(--color-danger-soft, #fee8ea)",
                color: error.includes("이메일을 발송") ? "var(--color-success, #10b884)" : "var(--color-danger, #ef4444)",
                borderRadius: 8, font: "500 13px/1.4 var(--font-sans, sans-serif)",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary-lg"
              style={{ marginTop: 4 }}
              disabled={loading}
            >
              {loading
                ? (isSignUp ? "가입 중…" : "로그인 중…")
                : (isSignUp ? "이메일로 회원가입 →" : "이메일로 로그인 →")}
            </button>
          </form>

          <div className="divider">또는</div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading || googleLoading}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, padding: "10px 16px", borderRadius: 10,
              border: "1.5px solid var(--line-1)", background: "var(--surface-1)",
              font: "600 14px/1 var(--font-sans, sans-serif)", color: "var(--text-1)",
              cursor: loading || googleLoading ? "not-allowed" : "pointer",
              opacity: loading || googleLoading ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {/* Google 'G' 로고 SVG */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2045C17.64 8.5663 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.2045Z" fill="#4285F4"/>
              <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
              <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.5931 3.68182 9C3.68182 8.4069 3.78409 7.83 3.96409 7.29V4.9582H0.957275C0.347727 6.1731 0 7.5477 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
              <path d="M9 3.5795C10.3214 3.5795 11.5077 4.0336 12.4405 4.9255L15.0218 2.344C13.4632 0.8918 11.4259 0 9 0C5.48182 0 2.43818 2.0168 0.957275 4.9582L3.96409 7.29C4.67182 5.1627 6.65591 3.5795 9 3.5795Z" fill="#EA4335"/>
            </svg>
            {googleLoading ? "Google로 이동 중…" : "Google로 계속하기"}
          </button>

          <div className="social-row" style={{ marginTop: 10 }}>
            <button className="social-btn social-naver" disabled>
              <img src="assets/icons/social/naver.png" alt="NAVER" /> NAVER
            </button>
            <button className="social-btn social-kakao" disabled>
              <img src="assets/icons/social/kakaotalk.svg" alt="KakaoTalk" /> KakaoTalk
            </button>
          </div>

          <div style={{
            font: "500 13px/1.4 var(--font-sans, sans-serif)",
            color: "var(--text-3)",
            textAlign: "center",
            marginTop: 6,
          }}>
            {isSignUp ? (
              <>
                이미 계정이 있으신가요?{" "}
                <a
                  href="#"
                  style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}
                  onClick={e => { e.preventDefault(); setIsSignUp(false); setError(""); }}
                >
                  로그인
                </a>
              </>
            ) : (
              <>
                아직 계정이 없으신가요?{" "}
                <a
                  href="#"
                  style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}
                  onClick={e => { e.preventDefault(); setIsSignUp(true); setError(""); }}
                >
                  회원가입
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
