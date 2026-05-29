/* global window, React */
// 앱 공용 데이터: 카테고리 정의 + useTodos 훅 + 날짜 헬퍼
// 목 데이터(TODOS, CAL_EVENTS 등)는 하단에 남아 있으나 실제 앱에서는 미사용

// ── 카테고리 정의 ─────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "work",     name: "업무",   color: "#1571F3", soft: "#E7F1FE" },
  { id: "personal", name: "개인",   color: "#27C961", soft: "#DBF8E6" },
  { id: "study",    name: "학습",   color: "#A855F7", soft: "#F2E6FE" },
  { id: "health",   name: "건강",   color: "#F59E0B", soft: "#FEF2D8" },
  { id: "shopping", name: "쇼핑",   color: "#EF4444", soft: "#FEE8EA" },
];
const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// ── 날짜 헬퍼 ─────────────────────────────────────────────────────────
/**
 * due_date(ISO 문자열)로부터 dueState 계산
 * @returns {string|null} 'overdue'|'today'|'soon'|'future'|null
 */
function computeDueState(due_date) {
  if (!due_date) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(due_date);
  const dueDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((dueDay - today) / 86400000);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 7) return "soon";
  return "future";
}

/**
 * due_date(ISO 문자열)를 한국어 표시 문자열로 변환
 * @returns {string|null}
 */
function formatDueLabel(due_date) {
  if (!due_date) return null;
  const d = new Date(due_date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((dueDay - today) / 86400000);
  // UTC 기준으로 시간 유무 판단: date-only 값("YYYY-MM-DD")은 UTC 자정으로 파싱됨
  // 로컬 getHours()를 쓰면 KST(UTC+9)에서 항상 9시로 인식되는 버그가 생김
  const hasTime = d.getUTCHours() !== 0 || d.getUTCMinutes() !== 0;
  const hh = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, "0");
  const timeStr = hasTime ? ` ${hh}:${mm}` : "";
  if (diff === 0) return `오늘${timeStr}`;
  if (diff === 1) return `내일${timeStr}`;
  if (diff === -1) return `어제`;
  if (diff < 0) return `${Math.abs(diff)}일 전`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일${timeStr}`;
}

// ── useTodos 훅 ───────────────────────────────────────────────────────
/**
 * Supabase todos + subtasks 전체 CRUD 관리 훅
 * @param {object|null} user - Supabase auth user (null이면 빈 배열 반환)
 */
function useTodos(user) {
  const [todos, setTodos] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const supabase = window.supabaseClient;

  // 전체 todos 조회
  const fetchTodos = React.useCallback(async () => {
    if (!user) { setTodos([]); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("todos")
        .select("*, subtasks(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTodos(data || []);
    } catch (err) {
      console.error("useTodos fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => { fetchTodos(); }, [fetchTodos]);

  // ── CRUD 함수들 ──────────────────────────────────────────────────────

  const addTodo = React.useCallback(async (fields) => {
    if (!user) return null;
    const insert = {
      user_id: user.id,
      title: fields.title,
      category: fields.category || null,
      priority: fields.priority || "medium",
      due_date: fields.due_date || null,
      notes: fields.notes || null,
      repeat: fields.repeat || null,
      done: false,
      starred: false,
    };
    const { data, error } = await supabase
      .from("todos")
      .insert(insert)
      .select("*, subtasks(*)")
      .single();
    if (error) { console.error("addTodo error:", error); return null; }
    setTodos(prev => [data, ...prev]);
    return data;
  }, [user]);

  const updateTodo = React.useCallback(async (id, changes) => {
    const patch = { ...changes, updated_at: new Date().toISOString() };
    const { error } = await supabase
      .from("todos")
      .update(patch)
      .eq("id", id);
    if (error) { console.error("updateTodo error:", error); return null; }
    // 로컬 상태만 병합 — subtasks는 건드리지 않음 (불필요한 JOIN 방지)
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    return id;
  }, []);

  const deleteTodo = React.useCallback(async (id) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) { console.error("deleteTodo error:", error); return; }
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleDone = React.useCallback(async (id) => {
    // 낙관적 업데이트: 현재 state에서 done 값을 읽어서 반전
    let newDone;
    setTodos(prev => {
      const todo = prev.find(t => t.id === id);
      if (!todo) return prev;
      newDone = !todo.done;
      return prev.map(t => t.id === id ? { ...t, done: newDone } : t);
    });
    // DB 업데이트 (setTimeout 0으로 newDone이 확정된 후 실행)
    setTimeout(async () => {
      if (newDone === undefined) return;
      const { error } = await supabase
        .from("todos")
        .update({ done: newDone, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) {
        console.error("toggleDone error:", error);
        // 실패 시 롤백
        setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !newDone } : t));
      }
    }, 0);
  }, []);

  const toggleStarred = React.useCallback(async (id) => {
    let newStarred;
    setTodos(prev => {
      const todo = prev.find(t => t.id === id);
      if (!todo) return prev;
      newStarred = !todo.starred;
      return prev.map(t => t.id === id ? { ...t, starred: newStarred } : t);
    });
    setTimeout(async () => {
      if (newStarred === undefined) return;
      const { error } = await supabase
        .from("todos")
        .update({ starred: newStarred, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) {
        console.error("toggleStarred error:", error);
        setTodos(prev => prev.map(t => t.id === id ? { ...t, starred: !newStarred } : t));
      }
    }, 0);
  }, []);

  const addSubtask = React.useCallback(async (todoId, title) => {
    const { data, error } = await supabase
      .from("subtasks")
      .insert({ todo_id: todoId, title, done: false })
      .select()
      .single();
    if (error) { console.error("addSubtask error:", error); return null; }
    setTodos(prev => prev.map(t =>
      t.id === todoId ? { ...t, subtasks: [...(t.subtasks || []), data] } : t
    ));
    return data;
  }, []);

  const toggleSubtaskDone = React.useCallback(async (subtaskId, done) => {
    const { error } = await supabase
      .from("subtasks")
      .update({ done })
      .eq("id", subtaskId);
    if (error) { console.error("toggleSubtaskDone error:", error); return; }
    setTodos(prev => prev.map(t => ({
      ...t,
      subtasks: (t.subtasks || []).map(s => s.id === subtaskId ? { ...s, done } : s),
    })));
  }, []);

  const deleteSubtask = React.useCallback(async (subtaskId) => {
    const { error } = await supabase.from("subtasks").delete().eq("id", subtaskId);
    if (error) { console.error("deleteSubtask error:", error); return; }
    setTodos(prev => prev.map(t => ({
      ...t,
      subtasks: (t.subtasks || []).filter(s => s.id !== subtaskId),
    })));
  }, []);

  return {
    todos,
    loading,
    refetch: fetchTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleDone,
    toggleStarred,
    addSubtask,
    toggleSubtaskDone,
    deleteSubtask,
  };
}

// ── 목 데이터 (레거시 — 새 컴포넌트에서는 미사용) ──────────────────────
const TODAY_LABEL = "5월 15일 금요일";

const TODOS_MOCK = [
  { id: "t1",  title: "디자인 시스템 v2 컴포넌트 리뷰",    done: false, priority: "high",   category: "work",     due: "오늘 16:00", dueState: "today",   subtasks: [{id:"s1",title:"Button.tsx 변경분 코멘트 정리", done:true},{id:"s2",title:"Input 포커스 링 컬러 토큰 확인",done:true},{id:"s3",title:"Chip 사이즈 spec 회의록과 대조",done:false},{id:"s4",title:"Storybook 스크린샷 첨부",done:false}], starred: true, repeat: "매주 금요일", notes: "Button, Input, Chip 변경 사항을 디자인 토큰 변경분과 함께 검토합니다.\n특히 dark theme 토큰 매핑이 맞는지 다시 확인이 필요합니다." },
  { id: "t2",  title: "클라이언트 미팅 자료 준비",           done: false, priority: "high",   category: "work",     due: "오늘 14:30", dueState: "today",   subtasks: [{id:"s5",title:"키노트 슬라이드 14p",done:true},{id:"s6",title:"질의응답 시나리오",done:false}], starred: false },
  { id: "t5",  title: "토스 카드 결제 자동이체 변경",        done: false, priority: "high",   category: "personal", due: "내일",       dueState: "soon",    subtasks: [] },
  { id: "t9",  title: "엄마 생신 선물 주문",                 done: false, priority: "high",   category: "personal", due: "5월 12일",   dueState: "overdue", subtasks: [], starred: true },
];

// Calendar mock cells (레거시)
const CAL_MONTH = { year: 2026, month: 5, today: 15 };
const CAL_EVENTS = {};
function buildCalendarCells() {
  const cells = [];
  for (let d = 26; d <= 30; d++) cells.push({ d, out: true, prev: true });
  for (let d = 1; d <= 31; d++) cells.push({ d, out: false });
  for (let d = 1; d <= 6; d++) cells.push({ d, out: true, next: true });
  return cells.map((c, i) => ({ ...c, col: i % 7 }));
}
const CAL_CELLS = buildCalendarCells();

// Streak mock (레거시)
function buildStreak() {
  const rows = [];
  for (let r = 0; r < 7; r++) {
    rows.push(Array.from({ length: 12 }, () => Math.floor(Math.random() * 3)));
  }
  return rows;
}
const STREAK = buildStreak();
const WEEK_STATS = [
  { d: "토", done: 4, pending: 1 }, { d: "일", done: 2, pending: 2 },
  { d: "월", done: 7, pending: 1 }, { d: "화", done: 5, pending: 2 },
  { d: "수", done: 6, pending: 0 }, { d: "목", done: 8, pending: 1 },
  { d: "금", done: 3, pending: 4, today: true },
];
const CATEGORY_USAGE = [
  { id: "work", pct: 48, n: 142 }, { id: "personal", pct: 22, n: 65 },
  { id: "study", pct: 14, n: 41 }, { id: "health", pct: 10, n: 30 },
  { id: "shopping", pct: 6, n: 18 },
];

Object.assign(window, {
  CATEGORIES, CAT, TODAY_LABEL,
  TODOS: TODOS_MOCK,  // 레거시 — 새 컴포넌트에서는 useTodos() 사용
  CAL_MONTH, CAL_EVENTS, CAL_CELLS,
  WEEK_STATS, STREAK, CATEGORY_USAGE,
  // 새 API
  useTodos, computeDueState, formatDueLabel,
});
