# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

한국어 할 일 관리(Todo) 웹앱 — demodev 디자인 시스템 기반의 프로토타입.
React 18 (CDN UMD) + Babel Standalone으로 빌드 없이 브라우저에서 바로 실행됩니다.

## Running

로컬 HTTP 서버가 필요합니다 (Babel이 `<script type="text/babel" src="…">` 파일을 fetch로 로드하기 때문에 `file://` 불가).

```bash
# Python
python -m http.server 8080

# Node
npx serve .
# 또는
npx http-server . -p 8080
```

## File Structure

```
index.html              # 진입점 — React/Babel CDN 로드 + JSX 파일 순서대로 로드
app.jsx                 # 최상위 App 컴포넌트, DesignCanvas 래퍼, Tweaks 패널 연결
design-canvas.jsx       # Figma 스타일 팬/줌 캔버스 (DCSection, DCArtboard 등)
tweaks-panel.jsx        # 우하단 Tweaks 플로팅 패널 (테마·악센트·밀도 조절)

styles/
  tokens.css            # 디자인 토큰 (색상·타이포·여백·그림자·반경)
  components.css        # 공용 컴포넌트 CSS (Button, Input, Chip, Alert 등)
  app.css               # 앱 전용 레이아웃·컴포넌트 스타일, 다크모드 오버라이드

components/
  data.jsx              # 목 데이터 (TODOS, CATEGORIES, CAL_EVENTS, STREAK 등) → window 전역 노출
  icons.jsx             # Lucide 스타일 SVG 아이콘 컴포넌트 → window 전역 노출
  LoginScreen.jsx       # 로그인 화면 (좌: 히어로 + 미니 카드 / 우: 폼)
  MainScreen.jsx        # 메인 3단 레이아웃 (TodoSidebar + ListPane + DetailPane)
  CalendarScreen.jsx    # 월간 캘린더 뷰
  StatsScreen.jsx       # 통계 뷰 (KPI 카드·막대·도넛·히트맵·인사이트)
  MobileScreen.jsx      # 모바일 단일 컬럼 + FAB + 탭바

assets/
  cover-bg.png          # 로그인 히어로 배경
  icons/social/         # NAVER, KakaoTalk 소셜 로그인 아이콘
```

## Architecture

### 데이터 흐름

모든 파일은 `window` 전역에 심볼을 노출하는 방식으로 의존성을 공유합니다 (`import` 없음).
로드 순서가 곧 의존성 순서이므로 `index.html`의 `<script>` 순서를 반드시 유지하세요.

```
data.jsx / icons.jsx  →  Screen 컴포넌트들  →  app.jsx
```

### 테마 / Tweaks

`app.jsx`의 `TWEAK_DEFAULTS`가 초기값입니다.  
`tweaks.theme` → 각 `<div data-theme={theme}>` → `app.css`의 `.todo-app[data-theme="dark"]` 오버라이드.  
`tweaks.accent` → `applyAccent()` → CSS 변수 `--accent`, `--color-accent-500`, `--color-accent-soft` 즉시 적용.

### 디자인 캔버스

`DesignCanvas` > `DCSection` > `DCArtboard` 계층.  
`DCArtboard`는 마커일 뿐이고 `DCArtboardFrame`이 실제 렌더링.  
뷰포트 상태(팬/줌)는 `localStorage`에 자동 저장.

## Key Design Tokens

- `--accent` / `--color-accent-500`: 주요 강조색 (기본 `#1571F3`)
- `--font-sans`: Pretendard Variable (한글 기본체)
- `--surface-1/2/3`: 배경 계층
- `--text-1/2/3/4`: 텍스트 계층
- `--line-1/2`: 테두리/구분선

다크모드는 `.todo-app[data-theme="dark"]`가 위 변수를 오버라이드합니다.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at `specs/001-fullstack-todo-app/plan.md`.
<!-- SPECKIT END -->
