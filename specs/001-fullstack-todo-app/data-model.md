# Data Model: 한국어 할 일 관리 앱

## Entities

### 1. User (auth.users — Supabase 관리)

Supabase Auth가 자동으로 관리하며 직접 테이블을 생성하지 않는다.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK (auth.uid()로 참조) |
| email | TEXT | 이메일 주소 |
| created_at | TIMESTAMPTZ | 가입일시 |

---

### 2. todos

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 할 일 고유 ID |
| user_id | UUID | FK → auth.users(id) ON DELETE CASCADE, NOT NULL | 소유 사용자 |
| title | TEXT | NOT NULL | 할 일 제목 |
| category | TEXT | CHECK IN ('work','personal','study','health','shopping') | 카테고리 |
| priority | TEXT | CHECK IN ('high','medium','low'), DEFAULT 'medium' | 우선순위 |
| due_date | TIMESTAMPTZ | NULLABLE | 마감일 |
| notes | TEXT | NULLABLE | 메모 |
| done | BOOLEAN | DEFAULT false | 완료 여부 |
| starred | BOOLEAN | DEFAULT false | 별표(즐겨찾기) |
| repeat | TEXT | NULLABLE | 반복 설정 (저장만, v1에서 자동 생성 없음) |
| created_at | TIMESTAMPTZ | DEFAULT now() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT now() | 수정일시 |

**Indexes**: `(user_id)`, `(user_id, category)`, `(user_id, due_date)`

---

### 3. subtasks

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 서브태스크 고유 ID |
| todo_id | UUID | FK → todos(id) ON DELETE CASCADE, NOT NULL | 소속 할 일 |
| title | TEXT | NOT NULL | 서브태스크 제목 |
| done | BOOLEAN | DEFAULT false | 완료 여부 |
| position | INTEGER | DEFAULT 0 | 표시 순서 |

---

## Relationships

```
auth.users (1) ──< todos (N) ──< subtasks (N)
```

---

## State Transitions

### Todo 상태
```
미완료(done=false) ←→ 완료(done=true)
```

### 인증 상태
```
미인증 → [회원가입/로그인] → 인증됨 → [로그아웃] → 미인증
```

---

## Supabase SQL 스크립트

```sql
-- 1. todos 테이블 생성
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('work','personal','study','health','shopping')),
  priority TEXT CHECK (priority IN ('high','medium','low')) DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  notes TEXT,
  done BOOLEAN DEFAULT false,
  starred BOOLEAN DEFAULT false,
  repeat TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. subtasks 테이블 생성
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  done BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0
);

-- 3. 인덱스
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_user_category ON todos(user_id, category);
CREATE INDEX idx_todos_user_due ON todos(user_id, due_date);

-- 4. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. RLS 활성화
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- 6. todos RLS 정책
CREATE POLICY "todos_own_all" ON todos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. subtasks RLS 정책
CREATE POLICY "subtasks_own_all" ON subtasks FOR ALL
  USING (todo_id IN (SELECT id FROM todos WHERE user_id = auth.uid()))
  WITH CHECK (todo_id IN (SELECT id FROM todos WHERE user_id = auth.uid()));
```

---

## Validation Rules

| 규칙 | 적용 위치 |
|------|-----------|
| 제목은 1자 이상 255자 이하 | 클라이언트 + DB NOT NULL |
| 카테고리는 5가지 고정값 중 하나 | 클라이언트 + DB CHECK |
| 우선순위는 3가지 고정값 중 하나 | 클라이언트 + DB CHECK |
| 서브태스크는 todo당 최대 10개 | 클라이언트 |
| 마감일은 과거 날짜도 허용(이미 지난 할 일 존재) | 제한 없음 |
