/* global React, ReactDOM, DesignCanvas, DCSection, DCArtboard,
   LoginScreen, MainScreen, CalendarScreen, StatsScreen, MobileScreen,
   TweaksPanel, useTweaks, TweakSection, TweakColor, TweakRadio, TweakToggle, TweakSelect */

// Accent palette (curated, design-system aligned)
// Keyed by hex — TweakColor emits the hex string back to onChange.
const ACCENT_OPTIONS = {
  "#1571F3": { soft: "#E7F1FE" },  // demodev default
  "#4F46E5": { soft: "#EEF0FC" },
  "#10B884": { soft: "#DBF6EC" },
  "#F97316": { soft: "#FEEBD8" },
  "#E11D74": { soft: "#FEE7F0" },
};
const ACCENT_HEXES = Object.keys(ACCENT_OPTIONS);

function applyAccent(hex) {
  const opt = ACCENT_OPTIONS[hex] || ACCENT_OPTIONS[ACCENT_HEXES[0]];
  const v = ACCENT_OPTIONS[hex] ? hex : ACCENT_HEXES[0];
  document.documentElement.style.setProperty("--accent", v);
  document.documentElement.style.setProperty("--color-accent-soft", opt.soft);
  document.documentElement.style.setProperty("--color-accent-500", v);
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme":  "light",
  "accent": "#1571F3",
  "density": "comfortable"
}/*EDITMODE-END*/;

function ArtboardWrap({ theme, children, style }) {
  return <div data-theme={theme} style={{ width: "100%", height: "100%", ...style }}>{children}</div>;
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => { applyAccent(tweaks.accent); }, [tweaks.accent]);

  // density just maps to a CSS var on root for now
  React.useEffect(() => {
    document.documentElement.dataset.density = tweaks.density;
  }, [tweaks.density]);

  const theme = tweaks.theme; // "light" | "dark"

  return (
    <>
      <DesignCanvas>
        <DCSection id="auth" title="01 · 로그인" subtitle="이메일 + 소셜 로그인 (NAVER / KakaoTalk)">
          <DCArtboard id="login" label="로그인 · 1280×800" width={1280} height={800}>
            <ArtboardWrap theme={theme}>
              <div className="todo-app" data-theme={theme} style={{ height: "100%" }}>
                <LoginScreen />
              </div>
            </ArtboardWrap>
          </DCArtboard>
        </DCSection>

        <DCSection id="main" title="02 · 메인 — 3단 레이아웃" subtitle="왼쪽 네비 · 가운데 리스트 · 오른쪽 상세">
          <DCArtboard id="main-desktop" label="데스크톱 · 1440×900" width={1440} height={900}>
            <ArtboardWrap theme={theme}>
              <MainScreen />
            </ArtboardWrap>
          </DCArtboard>

          <DCArtboard id="mobile" label="모바일 · 390×844" width={390} height={844}>
            <ArtboardWrap theme={theme}>
              <MobileScreen />
            </ArtboardWrap>
          </DCArtboard>
        </DCSection>

        <DCSection id="calendar" title="03 · 캘린더 뷰" subtitle="2026년 5월 — 월간">
          <DCArtboard id="calendar-desktop" label="캘린더 · 1440×900" width={1440} height={900}>
            <ArtboardWrap theme={theme}>
              <CalendarScreen />
            </ArtboardWrap>
          </DCArtboard>
        </DCSection>

        <DCSection id="stats" title="04 · 통계 뷰" subtitle="주간 KPI · 카테고리 비중 · 12주 활동 히트맵">
          <DCArtboard id="stats-desktop" label="통계 · 1440×1000" width={1440} height={1000}>
            <ArtboardWrap theme={theme}>
              <StatsScreen />
            </ArtboardWrap>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="테마">
          <TweakRadio
            label="모드"
            value={tweaks.theme}
            onChange={v => setTweak("theme", v)}
            options={[
              { value: "light", label: "라이트" },
              { value: "dark",  label: "다크" },
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
              { value: "compact",      label: "촘촘" },
              { value: "comfortable",  label: "기본" },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
