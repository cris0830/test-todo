# Implementation Plan: 한국어 할 일 관리 앱 전체 기능 구현

**Branch**: `001-fullstack-todo-app` | **Date**: 2026-05-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-fullstack-todo-app/spec.md`

## Summary

현재 React 18 CDN + Babel Standalone 기반의 UI 프로토타입에 Supabase(Auth + PostgreSQL + RLS)를
백엔드로 연결하고, Vercel 정적 호스팅으로 배포한다. 목 데이터를 실제 사용자 데이터로 교체하고,
6개의 사용자 스토리(인증·CRUD·카테고리·캘린더·통계·모바일)를 순차적으로 구현한다.

## Technical Context

**Language/Version**: JavaScript (JSX, Babel Standalone 7.29.0)

**Primary Dependencies**: React 18.3.1 (CDN UMD), Supabase JS v2 (CDN UMD)

**Storage**: Supabase PostgreSQL — `todos`, `subtasks` 테이블 + Row Level Security

**Testing**: 수동 브라우저 테스트 (로컬 HTTP 서버 + 브라우저 DevTools)

**Target Platform**: 브라우저 (Chrome/Edge 최신), Vercel 정적 호스팅

**Project Type**: CDN 단일 페이지 앱 (빌드 도구 없음)

**Performance Goals**: 할 일 추가·수정·완료 처리 1초 이내 화면 반영

**Constraints**: `import/export` 금지, 번들러 금지, 서비스 롤 키 클라이언트 노출 금지

**Scale/Scope**: 단일 사용자 프로토타입, Supabase 무료 티어 기준

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 상태 | 비고 |
|------|------|------|
| I. CDN-First | ✅ PASS | Vercel은 정적 파일 서빙 — 빌드 스텝 없음 |
| II. Korean-First UX | ✅ PASS | 신규 UI 텍스트·오류 메시지 모두 한국어 |
| III. demodev 토큰 준수 | ✅ PASS | 신규 UI 요소도 기존 CSS 변수 토큰 사용 |
| IV. Supabase 점진적 | ⚠️ JUSTIFIED | 목 데이터 교체는 이 스펙의 명시적 목표 (Complexity Tracking 참조) |
| V. 단순성 YAGNI | ✅ PASS | 스펙 범위 내에서만 구현, 과도한 추상화 없음 |

## Project Structure

### Documentation (this feature)

```text
specs/001-fullstack-todo-app/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — 아키텍처 결정
├── data-model.md        # Phase 1 — DB 스키마 + SQL
├── quickstart.md        # Phase 1 — 환경 설정 가이드
├── contracts/
│   └── supabase-api.md  # Phase 1 — Supabase API 계약
└── tasks.md             # /speckit-tasks 생성 예정
```

### Source Code (repository root)

```text
index.html                       # 변경 없음 (Supabase CDN 이미 추가됨)
vercel.json                      # NEW: Vercel SPA 라우팅 설정

utils/supabase/
├── client.js                    # 수정: 인증 세션 옵션 추가
├── auth.js                      # NEW: signUp / signIn / signOut 헬퍼
└── errors.js                    # NEW: 한국어 오류 메시지 매핑

components/
├── data.jsx                     # 수정: useTodos() 훅으로 Supabase 연결
├── LoginScreen.jsx              # 수정: 회원가입·로그인 폼 실제 Auth 연결
├── MainScreen.jsx               # 수정: 할 일 CRUD 실제 동작 연결
├── CalendarScreen.jsx           # 수정: todos state에서 마감일 이벤트 생성
├── StatsScreen.jsx              # 수정: todos state에서 통계 계산
└── MobileScreen.jsx             # 수정: 실제 데이터 + FAB → 할 일 추가

app.jsx                          # 수정: 인증 상태(user) 관리, 조건부 화면 렌더링
```

**Structure Decision**: 기존 CDN 단일 페이지 앱 구조를 그대로 유지. 신규 파일은
`utils/supabase/`에만 추가하고, 기존 컴포넌트는 props/state 변경으로 실제 데이터를
받도록 최소 수정한다. 새 컴포넌트 파일 생성은 없다.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| 원칙 IV: 목 데이터 교체 | 스펙 명시 목표 — 실제 백엔드 없이 인증/데이터 격리 불가 | 목 데이터 유지 시 인증의 의미 없음 |
| auth 상태 전역 관리(app.jsx) | 모든 화면이 인증 여부에 따라 다른 데이터 표시 | 컴포넌트별 개별 세션 체크는 중복 과다 |
