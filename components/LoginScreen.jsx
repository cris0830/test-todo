/* global React, IconMail, IconLock, supabaseAuth, supabaseErrors */

function LoginScreen() {
  const [email, setEmail]     = React.useState("");
  const [pw, setPw]           = React.useState("");
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState("");

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

          <div className="social-row">
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
