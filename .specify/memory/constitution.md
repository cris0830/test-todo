<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0 (initial ratification)
Modified principles: N/A — initial creation
Added sections:
  - Core Principles (I–V)
  - Tech Stack & Constraints
  - Development Workflow
  - Governance
Removed sections: N/A
Templates reviewed:
  ✅ .specify/templates/plan-template.md — Constitution Check gates align
  ✅ .specify/templates/spec-template.md — no principle-driven mandatory sections needed
  ✅ .specify/templates/tasks-template.md — task categories (Setup/Foundational/Story/Polish) fit CDN project
Follow-up TODOs: none
-->

# TODO — demodev Constitution

## Core Principles

### I. CDN-First, No-Build Architecture

이 프로젝트는 번들러·빌드 도구 없이 브라우저에서 직접 실행된다.
모든 런타임 의존성은 CDN `<script>` 태그로 로드하고, 컴포넌트 간 의존성은
`window` 전역 노출로 해결한다.

- 새 파일은 반드시 `index.html`의 `<script>` 순서에 맞게 추가해야 한다.
- `import` / `export` 구문을 사용해서는 안 된다.
- 로컬 HTTP 서버(`python -m http.server 8080` 등) 없이는 실행할 수 없으므로,
  `file://` 프로토콜을 전제한 코드를 작성해서는 안 된다.
- npm 패키지는 앱 런타임이 아닌 개발 도구(CLI, scripts) 용도로만 허용한다.

**Rationale**: 설치 없이 파일만으로 실행 가능한 프로토타입 특성을 유지하고,
진입 장벽을 최소화한다.

### II. Korean-First UX

모든 사용자 대면 텍스트는 한국어로 작성한다. 폰트는 Pretendard Variable만
사용하고 영문 fallback(`-apple-system, sans-serif`)을 유지한다.

- UI 복사(copy), 레이블, 오류 메시지, 빈 상태 메시지 모두 한국어 MUST.
- 날짜·시간 표기는 한국 로케일(`ko-KR`) 형식을 따른다.
- 코드 내부 식별자(변수명, 함수명)는 영어로 작성한다.

**Rationale**: 한국 사용자 대상 프로토타입이므로 UX 언어 일관성이 신뢰를 높인다.

### III. demodev 디자인 시스템 준수

모든 시각 요소는 `styles/tokens.css`에 정의된 디자인 토큰만 사용한다.
하드코딩된 색상·여백·타이포 값을 직접 CSS에 작성해서는 안 된다.

- 색상: `--accent`, `--color-accent-*`, `--surface-1/2/3`, `--text-1/2/3/4`,
  `--line-1/2` 토큰을 사용한다.
- 다크모드: `.todo-app[data-theme="dark"]` 오버라이드 패턴을 따른다.
- 강조색 변경은 `applyAccent()` 함수를 통해 CSS 변수에만 적용한다.
- 신규 컴포넌트는 `styles/components.css` 패턴을 먼저 확인하고 재사용한다.

**Rationale**: 토큰 기반 시스템은 테마·악센트·밀도 조절 기능과 연동되어 있으므로,
직접 값을 사용하면 Tweaks 패널이 동작하지 않는다.

### IV. Supabase 통합은 점진적으로

`window.supabaseClient`를 통해 데이터를 읽고 쓸 수 있지만, 앱은 Supabase
없이도 목(mock) 데이터(`components/data.jsx`)로 동작해야 한다.

- 네트워크 요청 실패 시 반드시 목 데이터로 폴백한다.
- Supabase 관련 코드는 `utils/supabase/` 디렉터리에만 위치한다.
- API 키(`SUPABASE_KEY`)는 퍼블릭 퍼블리셔블 키만 사용하며, 서비스 롤 키는
  절대 클라이언트 코드에 포함시키지 않는다.
- 인증 흐름이 필요하면 별도 스펙을 통해 설계한다.

**Rationale**: CDN 앱은 오프라인·로컬 시연이 잦으므로 백엔드 의존성을
선택적으로 만들어야 한다.

### V. 단순성 — YAGNI

요청된 기능만 구현한다. 미래 확장을 위한 추상화나 설정 가능성은 만들지 않는다.

- 한 번만 쓰이는 코드에 추상화를 도입해서는 안 된다.
- 50줄로 해결 가능한 것을 200줄로 작성했다면 리팩터링한다.
- 인접 코드를 "개선" 하지 않는다 — 변경은 요청된 범위에만 국한한다.
- 에러 처리는 실제로 발생 가능한 시나리오에만 추가한다.

**Rationale**: 프로토타입 단계에서 과도한 구조는 속도를 낮추고 코드베이스를
무겁게 만든다.

## Tech Stack & Constraints

**런타임**: 브라우저 (Chrome/Edge 최신 버전 기준)

**프레임워크**: React 18.3.1 (CDN UMD), Babel Standalone 7.29.0

**스타일링**: 순수 CSS + CSS 변수 기반 디자인 토큰 (PostCSS/Sass 사용 안 함)

**백엔드**: Supabase (프로젝트 ref: `qozrxkfviuochlhpcnvk`) — 선택적

**아이콘**: 인라인 SVG 컴포넌트 (`components/icons.jsx`)

**폰트**: Pretendard Variable (CDN)

**개발 서버**: `python -m http.server 8080` 또는 `npx serve .`

**금지 사항**:
- `import` / `export` (ESM 모듈 불가)
- Webpack / Vite / esbuild 등 번들러
- TypeScript (Babel JSX만 허용)
- 서비스 롤 Supabase 키를 클라이언트에 노출

## Development Workflow

1. **기능 스펙 작성** (`/speckit-specify`) → 2. **구현 계획** (`/speckit-plan`)
   → 3. **태스크 생성** (`/speckit-tasks`) → 4. **구현** (`/speckit-implement`)

- 모든 변경 사항은 로컬 HTTP 서버에서 브라우저로 직접 검증한다.
- 새 컴포넌트는 `DCArtboard`에 등록하고 `index.html`에 올바른 순서로 추가한다.
- 변경 후 GitHub(`cris0830/test-todo`)에 커밋·푸시한다.
- PR 생성 전 다크모드·라이트모드·모바일 뷰 세 가지를 모두 확인한다.

## Governance

이 헌법은 프로젝트의 모든 개발 관행보다 우선한다.
원칙 수정은 다음 절차를 따른다:

1. 변경 이유와 영향 범위를 명시한 PR을 작성한다.
2. 버전을 시맨틱 버저닝 규칙에 따라 올린다.
   - MAJOR: 원칙 삭제 또는 하위 호환 불가 재정의
   - MINOR: 원칙 추가 또는 실질적 확장
   - PATCH: 명확화·오탈자 수정
3. `LAST_AMENDED_DATE`를 갱신한다.
4. 의존 템플릿(plan, spec, tasks)을 동기화한다.

모든 PR 리뷰는 이 헌법 준수 여부를 확인해야 한다.
복잡성이 필요한 경우 plan.md의 Complexity Tracking 섹션에 정당성을 기록한다.

**Version**: 1.0.0 | **Ratified**: 2026-05-22 | **Last Amended**: 2026-05-22
