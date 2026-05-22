/* global React, ReactDOM,
   LoginScreen, MainScreen, CalendarScreen, StatsScreen, MobileScreen,
   TweaksPanel, useTweaks, TweakSection, TweakColor, TweakRadio,
   supabaseClient, supabaseAuth, useTodos */

// Accent palette
const ACCENT_OPTIONS = {
  "#1571F3": { soft: "#E7F1FE" },
  "#4F46E5": { soft: "#EEF0FC" },
  "#10B884": { soft: "#DBF6EC" },
  "#F97316": { soft: "#FEEBD8" },
  "#E11D74": { soft: "#FEE7F0" },
};
const ACCENT_HEXES = Object.keys(ACCENT_OPTIONS);

function applyAccent(hex) {
  const opt = ACCENT_OPTIONS[hex] || ACCENT_OPTIONS[ACCENT_HEXES[0]];
  const v   = ACCENT_OPTIONS[hex] ? hex : ACCENT_HEXES[0];
  document.documentElement.style.setProperty("--accent", v);
  document.documentElement.style.setProperty("--color-accent-soft", opt.soft);
  document.documentElement.style.setProperty("--color-accent-500", v);
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme":   "light",
  "accent":  "#1571F3",
  "density": "comfortable"
}/*EDITMODE-END*/;

// ── 로딩 화면 ─────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16,
      background: "var(--surface-1, #fafaf9)",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "3px solid #e5e7eb",
        borderTopColor: "var(--accent, #1571F3)",
        animation: "ccSpin 0.75s linear infinite",
      }} />
      <p style={{ margin: 0, font: "500 13px/1 -apple-system, sans-serif", color: "#9ca3af" }}>
        불러오는 중…
      </p>
    </div>
  );
}

// ── 오프라인 배너 ─────────────────────────────────────────────────────
function OfflineBanner() {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
      background: "#F59E0B", color: "#fff",
      padding: "8px 20px", textAlign: "center",
      font: "500 13px/1.4 var(--font-sans, sans-serif)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    }}>
      오프라인 상태입니다. 마지막으로 불러온 데이터를 표시합니다.
    </div>
  );
}

// ── 앱 ────────────────────────────────────────────────────────────────
function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [user, setUser]               = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [isOffline, setIsOffline]     = React.useState(!navigator.onLine);
  const [screen, setScreen]           = React.useState("main"); // "main" | "calendar" | "stats"

  React.useEffect(() => { applyAccent(tweaks.accent); }, [tweaks.accent]);
  React.useEffect(() => {
    document.documentElement.dataset.density = tweaks.density;
  }, [tweaks.density]);

  // 초기 세션 확인 + 인증 상태 구독
  React.useEffect(() => {
    window.supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session ? session.user : null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = window.supabaseClient.auth.onAuthStateChange(
      (_event, session) => setUser(session ? session.user : null)
    );
    return () => subscription.unsubscribe();
  }, []);

  // 오프라인 감지
  React.useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline  = () => { setIsOffline(false); refetchRef.current && refetchRef.current(); };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online",  goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online",  goOnline);
    };
  }, []);

  // useTodos — hooks 규칙: 항상 최상위 호출
  const {
    todos, refetch,
    addTodo, updateTodo, deleteTodo,
    toggleDone, toggleStarred,
    addSubtask, toggleSubtaskDone, deleteSubtask,
  } = useTodos(user);

  const refetchRef = React.useRef(refetch);
  React.useEffect(() => { refetchRef.current = refetch; }, [refetch]);

  const theme = tweaks.theme;

  // ── 렌더링 ──────────────────────────────────────────────────────────
  if (authLoading) return <LoadingScreen />;

  // 로그인 전
  if (!user) {
    return (
      <div data-theme={theme} style={{ height: "100%" }}>
        <LoginScreen />
      </div>
    );
  }

  // 로그인 후 — 실제 앱 화면
  const todoProps = {
    todos, addTodo, updateTodo, deleteTodo,
    toggleDone, toggleStarred,
    addSubtask, toggleSubtaskDone, deleteSubtask,
    user,
  };

  return (
    <div data-theme={theme} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {isOffline && <OfflineBanner />}

      <div style={{ flex: 1, overflow: "hidden" }}>
        {screen === "main" && (
          <MainScreen {...todoProps} onNavigate={setScreen} />
        )}
        {screen === "calendar" && (
          <CalendarScreen todos={todos} user={user} onNavigate={setScreen} />
        )}
        {screen === "stats" && (
          <StatsScreen todos={todos} user={user} onNavigate={setScreen} />
        )}
      </div>

      {/* 테마 조절 패널 (우하단) */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="테마">
          <TweakRadio
            label="모드"
            value={tweaks.theme}
            onChange={v => setTweak("theme", v)}
            options={[
              { value: "light", label: "라이트" },
              { value: "dark",  label: "다크"   },
            ]}
          />
        </TweakSection>
        <TweakSection label="강조 색상">
          <TweakColor
            label="Accent"
            value={tweaks.accent}
            onChange={v => setTweak("accent", v)}
            options={ACCENT_HEXES}
          />
        </TweakSection>
        <TweakSection label="밀도">
          <TweakRadio
            label="행 간격"
            value={tweaks.density}
            onChange={v => setTweak("density", v)}
            options={[
              { value: "compact",     label: "촘촘" },
              { value: "comfortable", label: "기본" },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// 로딩 스피너 키프레임
if (!document.getElementById("cc-spin-style")) {
  const s = document.createElement("style");
  s.id = "cc-spin-style";
  s.textContent = "@keyframes ccSpin { to { transform: rotate(360deg); } }";
  document.head.appendChild(s);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
