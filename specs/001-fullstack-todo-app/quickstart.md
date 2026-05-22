# Quickstart: 한국어 할 일 관리 앱 — 개발 환경 설정

## 1. Supabase 설정 (최초 1회)

### 1-1. 테이블 생성
Supabase Dashboard → SQL Editor → `data-model.md`의 SQL 스크립트 전체 실행

### 1-2. Auth 설정 확인
Dashboard → Authentication → Providers → Email: Enabled 확인

### 1-3. 연결 확인
```js
// 브라우저 콘솔에서 확인
window.supabaseClient.auth.getSession().then(console.log)
// → { data: { session: null }, error: null } 가 정상
```

---

## 2. 로컬 개발 실행

```bash
# Python
python -m http.server 8080

# 또는 Node
npx serve .
```

브라우저에서 `http://localhost:8080` 접속

---

## 3. Vercel 배포

### 3-1. Vercel CLI 설치 (최초 1회)
```bash
npm install -g vercel
```

### 3-2. 프로젝트 루트에 vercel.json 생성 (구현 단계에서 생성됨)

### 3-3. 배포
```bash
vercel --prod
```

또는 GitHub 저장소 연결 후 `git push` 시 자동 배포

---

## 4. 기능 검증 체크리스트

- [ ] 회원가입 → 이메일 수신 없이 즉시 로그인 화면으로 이동
- [ ] 로그인 → 메인 화면, 빈 할 일 목록 표시
- [ ] 할 일 추가 → Supabase Dashboard에서 todos 테이블에 레코드 확인
- [ ] 완료 체크 → done=true로 업데이트 확인
- [ ] 삭제 → 레코드 삭제 확인
- [ ] 로그아웃 → 로그인 화면으로 이동, 데이터 비표시
- [ ] 다른 계정으로 로그인 → 이전 계정 데이터 미표시 (RLS 검증)
- [ ] 캘린더 → 마감일 있는 할 일이 해당 날짜에 표시
- [ ] 통계 → 실데이터 기반 KPI·차트 표시
- [ ] 모바일(390px) → 탭바 전환·FAB 동작 확인
