# Supabase Client API Contracts

모든 호출은 `window.supabaseClient`(= `supabase`)를 통해 이루어진다.

## Auth

### 회원가입
```js
const { data, error } = await supabase.auth.signUp({ email, password });
// data.user: User 객체 | null
// error: AuthError | null — 중복 이메일 시 "User already registered"
```

### 로그인
```js
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
// data.session: Session | null
// error: "Invalid login credentials" 시 에러
```

### 로그아웃
```js
const { error } = await supabase.auth.signOut();
```

### 세션 확인
```js
const { data: { session } } = await supabase.auth.getSession();
// session: Session | null
```

### 인증 상태 구독
```js
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  // event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED'
});
// cleanup: subscription.unsubscribe()
```

---

## Todos

### 전체 조회 (RLS가 자동으로 user_id 필터 적용)
```js
const { data, error } = await supabase
  .from('todos')
  .select('*, subtasks(*)')
  .order('created_at', { ascending: false });
```

### 카테고리별 조회
```js
const { data, error } = await supabase
  .from('todos')
  .select('*, subtasks(*)')
  .eq('category', category)
  .order('created_at', { ascending: false });
```

### 생성
```js
const { data, error } = await supabase
  .from('todos')
  .insert({ title, category, priority, due_date, notes, starred, repeat, user_id: user.id })
  .select('*, subtasks(*)')
  .single();
```

### 수정
```js
const { data, error } = await supabase
  .from('todos')
  .update({ title, category, priority, due_date, notes, done, starred })
  .eq('id', todoId)
  .select()
  .single();
```

### 삭제
```js
const { error } = await supabase
  .from('todos')
  .delete()
  .eq('id', todoId);
```

---

## Subtasks

### 생성
```js
const { data, error } = await supabase
  .from('subtasks')
  .insert({ todo_id: todoId, title, position })
  .select()
  .single();
```

### 완료 토글
```js
const { error } = await supabase
  .from('subtasks')
  .update({ done })
  .eq('id', subtaskId);
```

### 삭제
```js
const { error } = await supabase
  .from('subtasks')
  .delete()
  .eq('id', subtaskId);
```

---

## 에러 처리 패턴

```js
// 모든 Supabase 호출에 적용할 표준 패턴
async function callSupabase(fn) {
  try {
    const { data, error } = await fn();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase]', err.message);
    // 한국어 오류 메시지 매핑은 utils/supabase/errors.js에서 관리
    return null;
  }
}
```

---

## 한국어 오류 메시지 매핑

| Supabase 에러 | 표시 메시지 |
|---------------|-------------|
| Invalid login credentials | 이메일 또는 비밀번호가 올바르지 않습니다 |
| User already registered | 이미 가입된 이메일입니다 |
| Password should be at least 6 characters | 비밀번호는 6자 이상이어야 합니다 |
| Unable to validate email address | 유효한 이메일 주소를 입력해 주세요 |
| Network request failed | 네트워크 연결을 확인해 주세요 |
