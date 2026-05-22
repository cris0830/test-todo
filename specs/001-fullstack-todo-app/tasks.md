---
description: "Task list for 한국어 할 일 관리 앱 전체 기능 구현"
---

# Tasks: 한국어 할 일 관리 앱 전체 기능 구현

**Input**: Design documents from `specs/001-fullstack-todo-app/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/supabase-api.md ✅

**Tests**: 수동 브라우저 테스트 (TDD 미적용 — spec에 별도 요청 없음)

**Organization**: 사용자 스토리별로 그룹화하여 독립적 구현·검증 가능

---

## Phase 1: Setup (공유 인프라)

**Purpose**: Supabase DB 초기화, Vercel 배포 설정, Supabase 클라이언트 기반 작업

- [ ] T001 Supabase Dashboard SQL Editor에서 `specs/001-fullstack-todo-app/data-model.md`의 SQL 스크립트 전체 실행 (todos 테이블, subtasks 테이블, 인덱스, RLS 정책)
- [x] T002 프로젝트 루트에 `vercel.json` 생성 — `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- [x] T003 `utils/supabase/errors.js` 생성 — `contracts/supabase-api.md`의 한국어 오류 메시지 매핑 테이블 구현, `window.supabaseErrors`로 노출
- [x] T004 `utils/supabase/auth.js` 생성 — `signUp(email, password)`, `signIn(email, password)`, `signOut()` 헬퍼 함수 구현, `window.supabaseAuth`로 노출
- [x] T005 `utils/supabase/client.js` 수정 — `createClient` 옵션에 `auth: { persistSession: true, autoRefreshToken: true }` 추가
- [x] T006 `index.html` 수정 — `<script src="utils/supabase/errors.js">`, `<script src="utils/supabase/auth.js">` 를 `client.js` 로드 다음 순서로 추가

**Checkpoint**: Supabase Dashboard에서 todos/subtasks 테이블 확인, 브라우저 콘솔에서 `window.supabaseAuth` 접근 가능

---

## Phase 2: Foundational (모든 스토리의 선행 조건)

**Purpose**: 인증 상태 전역 관리 — 이 단계 완료 전 US1 이외 작업 불가

**⚠️ CRITICAL**: 이 단계가 완료되어야 US1 이후 모든 스토리 작업 가능

- [x] T007 `app.jsx` 수정 — `React.useState(null)`로 `user` state 추가, `React.useState(true)`로 `authLoading` state 추가
- [x] T008 `app.jsx` 수정 — `React.useEffect`에서 `supabase.auth.getSession()`으로 초기 세션 확인 후 `setUser` / `setAuthLoading(false)` 처리
- [x] T009 `app.jsx` 수정 — `supabase.auth.onAuthStateChange`로 인증 상태 변화 구독, 컴포넌트 언마운트 시 `subscription.unsubscribe()` cleanup
- [x] T010 `app.jsx` 수정 — `authLoading` 중에는 로딩 화면 렌더링, `user`가 null이면 `<LoginScreen>`, 아니면 기존 `<DesignCanvas>` 렌더링

**Checkpoint**: 브라우저에서 로그인 전 LoginScreen 표시, 로그인 후 메인 화면 표시, 새로고침 후에도 세션 유지 확인

---

## Phase 3: User Story 1 — 회원가입 및 로그인 (Priority: P1) 🎯 MVP

**Goal**: 이메일+비밀번호로 계정 생성·로그인·로그아웃

**Independent Test**: 회원가입 → 메인 화면 진입 → 로그아웃 → 로그인 화면 복귀까지 독립 검증

### Implementation for User Story 1

- [x] T011 [US1] `components/LoginScreen.jsx` 수정 — `email`, `password`, `isSignUp`, `error`, `loading` state 추가
- [x] T012 [US1] `components/LoginScreen.jsx` 수정 — 폼 onSubmit 핸들러에서 `isSignUp` 분기: `supabaseAuth.signUp()` 또는 `supabaseAuth.signIn()` 호출
- [x] T013 [US1] `components/LoginScreen.jsx` 수정 — Supabase 에러 발생 시 `supabaseErrors` 매핑으로 한국어 메시지를 폼 하단에 표시
- [x] T014 [US1] `components/LoginScreen.jsx` 수정 — `loading` 중 버튼 비활성화 + "로그인 중…" / "가입 중…" 텍스트 표시
- [x] T015 [US1] `components/MainScreen.jsx` 수정 — 헤더 또는 사이드바에 로그아웃 버튼 추가, 클릭 시 `supabaseAuth.signOut()` 호출

**Checkpoint**: 신규 이메일로 회원가입 → 메인 화면 표시, 로그아웃 → 로그인 화면, 잘못된 비밀번호 → 한국어 오류 메시지 확인

---

## Phase 4: User Story 2 — 할 일 CRUD (Priority: P1) 🎯 MVP

**Goal**: 할 일 생성·조회·수정·삭제·완료·별표, 서브태스크 관리

**Independent Test**: 할 일 추가 → Supabase Dashboard todos 레코드 확인 → 완료 토글 → done=true 확인 → 삭제 → 레코드 삭제 확인

### Implementation for User Story 2

- [x] T016 [US2] `components/data.jsx` 수정 — `useTodos(user)` 훅 구현
- [x] T017 [P] [US2] `components/data.jsx` 수정 — `addTodo(fields)`
- [x] T018 [P] [US2] `components/data.jsx` 수정 — `updateTodo(id, changes)`
- [x] T019 [P] [US2] `components/data.jsx` 수정 — `deleteTodo(id)`
- [x] T020 [P] [US2] `components/data.jsx` 수정 — `toggleDone(id)`
- [x] T021 [P] [US2] `components/data.jsx` 수정 — `toggleStarred(id)`
- [x] T022 [P] [US2] `components/data.jsx` 수정 — `addSubtask(todoId, title)`
- [x] T023 [P] [US2] `components/data.jsx` 수정 — `toggleSubtaskDone(subtaskId, done)`
- [x] T024 [P] [US2] `components/data.jsx` 수정 — `deleteSubtask(subtaskId)`
- [x] T025 [US2] `app.jsx` 수정 — `useTodos(user)` 호출 + props 전달
- [x] T026 [US2] `components/MainScreen.jsx` 수정 — 할 일 추가 폼 연결
- [x] T027 [US2] `components/MainScreen.jsx` 수정 — 체크박스 → `toggleDone`
- [x] T028 [US2] `components/MainScreen.jsx` 수정 — 별표 → `toggleStarred`
- [x] T029 [US2] `components/MainScreen.jsx` 수정 — 상세 패널 필드 편집 → `updateTodo`
- [x] T030 [US2] `components/MainScreen.jsx` 수정 — 서브태스크 CRUD 연결
- [x] T031 [US2] `components/MainScreen.jsx` 수정 — 삭제 버튼 → `deleteTodo`

**Checkpoint**: 할 일 추가·완료·삭제가 Supabase Dashboard에 즉시 반영됨. 페이지 새로고침 후에도 데이터 유지 확인

---

## Phase 5: User Story 3 — 카테고리 필터 (Priority: P2)

**Goal**: 카테고리별 필터링 + 실시간 개수 반영

**Independent Test**: 업무 카테고리 클릭 → 업무 할 일만 표시, 할 일 추가 후 사이드바 개수 증가 확인

### Implementation for User Story 3

- [x] T032 [US3] `components/MainScreen.jsx` 수정 — `selectedCategory` state 추가
- [x] T033 [US3] `components/MainScreen.jsx` 수정 — `filteredTodos` 계산
- [x] T034 [US3] `components/MainScreen.jsx` TodoSidebar 수정 — 카테고리 클릭 → `setSelectedCategory`
- [x] T035 [US3] `components/MainScreen.jsx` TodoSidebar 수정 — 실시간 카테고리 개수 계산

**Checkpoint**: 카테고리 전환 시 목록 필터링 확인, 할 일 추가/완료 후 사이드바 숫자 즉시 변경 확인

---

## Phase 6: User Story 4 — 캘린더 뷰 (Priority: P2)

**Goal**: 마감일 기준 월간 캘린더 표시 + 날짜 클릭 할 일 조회

**Independent Test**: 마감일 있는 할 일 생성 → 캘린더 탭에서 해당 날짜에 이벤트 표시 확인

### Implementation for User Story 4

- [x] T036 [US4] `app.jsx` 수정 — `todos` state를 `CalendarScreen`에 props로 전달
- [x] T037 [US4] `components/CalendarScreen.jsx` 수정 — calEvents 맵 생성
- [x] T038 [US4] `components/CalendarScreen.jsx` 수정 — 날짜 클릭 → 팝오버 표시
- [x] T039 [US4] `components/CalendarScreen.jsx` 수정 — 이전/다음 월 버튼 + currentMonth state

**Checkpoint**: 마감일 설정된 할 일이 캘린더 날짜에 표시됨, 날짜 클릭 시 해당 할 일 목록 확인

---

## Phase 7: User Story 5 — 통계 뷰 (Priority: P3)

**Goal**: 실데이터 기반 완료율 KPI·카테고리 비율·주간 현황·히트맵

**Independent Test**: 할 일 완료 후 통계 탭에서 완료율 수치 변경 확인

### Implementation for User Story 5

- [x] T040 [US5] `app.jsx` 수정 — `todos` state를 `StatsScreen`에 props로 전달
- [x] T041 [US5] `components/StatsScreen.jsx` 수정 — 완료율 KPI 실데이터 계산
- [x] T042 [US5] `components/StatsScreen.jsx` 수정 — 카테고리 비율 도넛 실데이터 계산
- [x] T043 [US5] `components/StatsScreen.jsx` 수정 — 주간 막대 차트 실데이터 집계
- [x] T044 [US5] `components/StatsScreen.jsx` 수정 — 12주 히트맵 실데이터 매핑

**Checkpoint**: 할 일 10개 완료 후 통계 탭에서 완료율 증가, 카테고리·주간 현황이 실데이터 기반임을 목 데이터와 비교 확인

---

## Phase 8: User Story 6 — 모바일 뷰 (Priority: P3)

**Goal**: 모바일 단일 컬럼에서 탭바 전환 + FAB 할 일 추가

**Independent Test**: 모바일 DevTools (390px)에서 탭바 전환·FAB 클릭·할 일 추가 전체 흐름 확인

### Implementation for User Story 6

- [x] T045 [US6] `app.jsx` 수정 — todos + 액션 props를 MobileScreen에 전달
- [x] T046 [US6] `components/MobileScreen.jsx` 수정 — props.todos로 목록 렌더링
- [x] T047 [US6] `components/MobileScreen.jsx` 수정 — FAB 슬라이드업 모달 + addTodo 연결
- [x] T048 [US6] `components/MobileScreen.jsx` 수정 — 체크박스 → toggleDone, 삭제 → deleteTodo
- [x] T049 [US6] `components/MobileScreen.jsx` 수정 — 하단 탭바: 캘린더·통계 전환 렌더링

**Checkpoint**: 모바일 390px에서 할 일 추가(FAB) → 목록 표시 → 완료 체크 → 탭 전환 전체 흐름 확인

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: 오프라인 처리, 목 데이터 정리, Vercel 배포 검증

- [x] T050 [P] `app.jsx` 수정 — 오프라인 감지 + 배너 표시
- [x] T051 [P] `app.jsx` 수정 — 온라인 복구 감지 + 자동 refetch
- [x] T052 `components/data.jsx` 수정 — 목 데이터 전역 노출 최소화 (레거시 유지, 새 컴포넌트 미사용)
- [ ] T053 `quickstart.md` 기능 검증 체크리스트 — 브라우저 직접 확인 (수동)
- [ ] T054 [P] git commit + push + Vercel 배포 확인

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 즉시 시작 가능 — T001(Supabase SQL)은 독립, T002~T006은 병렬 가능
- **Foundational (Phase 2)**: Phase 1 완료 후 — T007~T010은 순차 (app.jsx 동일 파일)
- **US1 (Phase 3)**: Phase 2 완료 후 시작 가능
- **US2 (Phase 4)**: Phase 2 완료 후 시작 가능 (US1과 병렬 가능)
- **US3 (Phase 5)**: US2(T016 useTodos 훅) 완료 후
- **US4 (Phase 6)**: US2(T025 app.jsx todos state) 완료 후
- **US5 (Phase 7)**: US2(T025) 완료 후
- **US6 (Phase 8)**: US2(T025) 완료 후
- **Polish (Phase 9)**: 원하는 스토리 완료 후 언제든 적용 가능

### User Story Dependencies

- **US1 (P1)**: Phase 2 완료 후 — 다른 스토리에 의존 없음
- **US2 (P1)**: Phase 2 완료 후 — US1과 독립적으로 병렬 작업 가능
- **US3 (P2)**: US2 완료 후 — `todos` state 의존
- **US4 (P2)**: US2 완료 후 — `todos` state 의존
- **US5 (P3)**: US2 완료 후 — `todos` state 의존
- **US6 (P3)**: US2 완료 후 — `todos` state + 액션 함수 의존

### Within Each Story

- data.jsx 훅(T016~T024) → app.jsx 연결(T025) → 컴포넌트 와이어링 순서

---

## Parallel Example: User Story 2

```
병렬 실행 가능한 useTodos 액션 함수들 (모두 data.jsx, 서로 독립):
  T017 addTodo
  T018 updateTodo
  T019 deleteTodo
  T020 toggleDone
  T021 toggleStarred
  T022 addSubtask
  T023 toggleSubtaskDone
  T024 deleteSubtask

→ T025 (app.jsx 연결) 완료 후
→ T026~T031 (MainScreen 와이어링, 순차 권장 — 같은 파일)
```

---

## Implementation Strategy

### MVP First (US1 + US2만 완성)

1. Phase 1 완료 (Supabase DB + 클라이언트 설정)
2. Phase 2 완료 (app.jsx 인증 상태)
3. Phase 3 완료 (로그인/회원가입)
4. **STOP & VALIDATE**: 로그인 후 메인 화면 진입 확인
5. Phase 4 완료 (할 일 CRUD)
6. **STOP & VALIDATE**: 할 일 추가·완료·삭제 전체 흐름 확인
7. → 이 시점에서 Vercel 배포 가능

### Incremental Delivery

1. MVP (US1 + US2) → 배포·검증
2. US3 카테고리 필터 추가 → 검증
3. US4 캘린더 + US5 통계 → 검증
4. US6 모바일 → 검증
5. Polish → 최종 배포

---

## Notes

- `[P]` 태스크 = 서로 다른 파일, 의존성 없음 → 동시 작업 가능
- `[US?]` 레이블 = 해당 사용자 스토리와 연결
- 모든 Supabase 오류는 `supabaseErrors` 매핑으로 한국어 표시
- T001은 수동 작업 (Supabase Dashboard SQL Editor) — 코드 작업 아님
- 각 Phase 체크포인트에서 검증 후 다음 Phase 진행
