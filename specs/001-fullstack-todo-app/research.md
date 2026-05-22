# Research: 한국어 할 일 관리 앱 전체 기능 구현

## 1. 배포 전략: Vercel 정적 호스팅

**Decision**: Vercel에 빌드 없는 정적 파일(HTML/CSS/JS)을 직접 배포한다.

**Rationale**: Vercel은 Next.js 전용이 아니며 순수 정적 파일도 지원한다. `vercel.json`을 루트에 추가하면 `index.html`로 라우팅이 처리된다. 빌드 스텝 없이 `git push`만으로 자동 배포된다.

**Alternatives considered**:
- GitHub Pages: 무료이지만 커스텀 헤더 설정이 제한적
- Netlify: Vercel과 유사하나 사용자가 Vercel을 명시 선택
- Firebase Hosting: Supabase와 이중 Firebase 관리 불필요

**Config required**:
```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 2. Supabase Auth: 이메일/비밀번호 인증

**Decision**: Supabase Auth의 내장 이메일/비밀번호 방식을 사용한다. 세션은 `localStorage`에 자동 저장된다.

**Rationale**: `window.supabaseClient`는 이미 프로젝트에 설정되어 있다. CDN 앱에서 `supabase.auth.signUp()`, `supabase.auth.signInWithPassword()`, `supabase.auth.signOut()`으로 모든 인증 흐름이 완결된다. 서버 사이드 코드가 필요 없다.

**Key APIs**:
- `supabase.auth.signUp({ email, password })` — 회원가입
- `supabase.auth.signInWithPassword({ email, password })` — 로그인
- `supabase.auth.signOut()` — 로그아웃
- `supabase.auth.getSession()` — 현재 세션 확인
- `supabase.auth.onAuthStateChange(callback)` — 인증 상태 변화 감지

**Session persistence**: Supabase 클라이언트가 `localStorage`에 자동 저장하므로 페이지 새로고침 후에도 로그인 상태 유지.

---

## 3. 데이터 격리: Row Level Security (RLS)

**Decision**: Supabase RLS를 사용해 사용자가 자신의 데이터만 접근하도록 강제한다.

**Rationale**: 퍼블릭 키(publishable key)는 클라이언트에 노출되므로, RLS가 없으면 누구나 다른 사용자 데이터를 읽을 수 있다. RLS는 PostgreSQL 레벨에서 `auth.uid() = user_id` 조건으로 자동 필터링한다.

**Pattern**:
```sql
CREATE POLICY "own_data" ON todos
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 4. 오프라인 처리

**Decision**: 복잡한 Service Worker 캐시 대신 React state를 in-memory 캐시로 활용한다. 앱 로드 시 데이터를 불러와 state에 유지하고, 네트워크 오류 시 기존 state를 그대로 표시한다.

**Rationale**: CDN + Babel 앱에서 Service Worker 구현은 복잡성이 높다. 페이지 세션 내에서 state가 유지되는 것만으로 오프라인 요구사항(FR-024)을 충족할 수 있다.

---

## 5. 인증 상태 관리 패턴

**Decision**: `app.jsx`에서 `supabase.auth.onAuthStateChange`로 전역 인증 상태를 관리하고, `window.currentUser`로 노출한다.

**Rationale**: 기존 CDN 앱의 `window` 전역 패턴을 그대로 따른다. `app.jsx`가 `user` state를 보유하고, 인증 여부에 따라 `LoginScreen`과 `MainScreen` 중 하나를 렌더링한다.

```jsx
// app.jsx 패턴
const [user, setUser] = React.useState(null);
const [loading, setLoading] = React.useState(true);

React.useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
    setLoading(false);
  });
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}, []);
```

---

## 6. Constitution 원칙 IV 적용 범위 조정

**Decision**: 인증 이후에는 목 데이터 폴백을 제거하고 실제 Supabase 데이터만 사용한다. 인증 전 상태(로그인 화면)가 사실상 "Supabase 없는 폴백 화면" 역할을 한다.

**Rationale**: 스펙이 명시적으로 "기존 목 데이터는 실제 데이터로 교체"를 요구한다. 네트워크 오류 시에는 로드된 React state가 캐시 역할을 한다. Complexity Tracking에 기록.
