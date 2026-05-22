/* global React, CATEGORIES, CAT, CalendarScreen, StatsScreen,
   computeDueState, formatDueLabel,
   IconHome, IconCalendar, IconStats, IconUser, IconPlus, IconSearch, IconBell,
   IconStar, IconFlag, IconTrash, IconCheck */

// ── 할 일 추가 모달 ───────────────────────────────────────────────────
function MobAddModal({ onSubmit, onClose }) {
  const [title, setTitle]       = React.useState("");
  const [category, setCategory] = React.useState("");
  const [saving, setSaving]     = React.useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setSaving(true);
    await onSubmit({ title: t, category: category || null, priority: "medium" });
    setSaving(false);
    onClose();
  }

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: "100%", background: "var(--surface-1)", borderRadius: "16px 16px 0 0",
        padding: "20px 16px 32px", boxSizing: "border-box",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--line-1)", margin: "0 auto 16px" }}></div>
        <h3 style={{ margin: "0 0 16px", font: "600 16px/1 var(--font-sans)", color: "var(--text-1)" }}>새 할 일</h3>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="할 일을 입력하세요"
            style={{
              width: "100%", boxSizing: "border-box", padding: "12px 14px",
              borderRadius: 10, border: "1.5px solid var(--line-1)",
              font: "500 15px/1 var(--font-sans)", color: "var(--text-1)",
              background: "var(--surface-2)", marginBottom: 12, outline: "none",
            }}
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 10,
              border: "1px solid var(--line-1)", background: "var(--surface-2)",
              font: "500 14px/1 var(--font-sans)", color: "var(--text-2)", marginBottom: 16,
            }}
          >
            <option value="">카테고리 없음</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button
            type="submit"
            disabled={!title.trim() || saving}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: "var(--accent)", color: "#fff",
              font: "600 15px/1 var(--font-sans)", cursor: "pointer",
              opacity: !title.trim() || saving ? 0.6 : 1,
            }}
          >
            {saving ? "저장 중…" : "추가하기"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── 모바일 화면 ───────────────────────────────────────────────────────
function MobileScreen({ todos = [], addTodo, toggleDone, deleteTodo }) {
  const [activeTab,  setActiveTab]  = React.useState("today");
  const [showAdd,    setShowAdd]    = React.useState(false);
  const [bottomNav,  setBottomNav]  = React.useState("home"); // 'home'|'cal'|'stats'|'profile'

  const now = new Date();
  const days = ["일","월","화","수","목","금","토"];
  const dateLabel = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,"0")}.${String(now.getDate()).padStart(2,"0")}`;
  const todayLabel = `${now.getMonth()+1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`;

  // 탭별 필터
  const tabCounts = {
    today:   todos.filter(t => computeDueState(t.due_date) === "today"   && !t.done).length,
    soon:    todos.filter(t => computeDueState(t.due_date) === "soon"    && !t.done).length,
    overdue: todos.filter(t => computeDueState(t.due_date) === "overdue" && !t.done).length,
    inbox:   todos.filter(t => !t.category).length,
    done:    todos.filter(t => t.done).length,
  };

  const tabs = [
    { id: "today",   label: "오늘",       count: tabCounts.today   },
    { id: "soon",    label: "예정",       count: tabCounts.soon    },
    { id: "overdue", label: "지연",       count: tabCounts.overdue },
    { id: "inbox",   label: "받은편지함", count: tabCounts.inbox   },
    { id: "done",    label: "완료",       count: tabCounts.done    },
  ];

  // 현재 탭에 맞는 항목
  const visibleTodos = React.useMemo(() => {
    if (activeTab === "today")   return todos.filter(t => computeDueState(t.due_date) === "today"   && !t.done);
    if (activeTab === "soon")    return todos.filter(t => computeDueState(t.due_date) === "soon"    && !t.done);
    if (activeTab === "overdue") return todos.filter(t => computeDueState(t.due_date) === "overdue" && !t.done);
    if (activeTab === "inbox")   return todos.filter(t => !t.category);
    if (activeTab === "done")    return todos.filter(t => t.done);
    return todos.filter(t => !t.done);
  }, [todos, activeTab]);

  // 바텀 탭이 캘린더/통계이면 해당 화면 렌더링
  if (bottomNav === "cal") {
    return (
      <div className="todo-app mobile" style={{ position: "relative", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflow: "auto" }}>
          <CalendarScreen todos={todos} mobile={true} />
        </div>
        <BottomTabBar active={bottomNav} onSelect={setBottomNav} />
      </div>
    );
  }
  if (bottomNav === "stats") {
    return (
      <div className="todo-app mobile" style={{ position: "relative", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflow: "auto" }}>
          <StatsScreen todos={todos} mobile={true} />
        </div>
        <BottomTabBar active={bottomNav} onSelect={setBottomNav} />
      </div>
    );
  }

  return (
    <div className="todo-app mobile" style={{ position: "relative" }}>
      {/* 상태바 */}
      <div className="mob-statusbar">
        <span>{String(now.getHours()).padStart(2,"0")}:{String(now.getMinutes()).padStart(2,"0")}</span>
        <span className="right">
          <span style={{ font: "500 11px/1 var(--font-sans)" }}>5G</span>
          <span style={{ width: 22, height: 11, borderRadius: 2, border: "1px solid var(--text-2)", position: "relative", display: "inline-block" }}>
            <span style={{ position: "absolute", inset: 1, width: "70%", background: "var(--text-1)", borderRadius: 1 }}></span>
          </span>
        </span>
      </div>

      {/* 헤더 */}
      <div className="mob-head">
        <div className="mob-eyebrow">
          <span><span className="date">{dateLabel}</span> · {todayLabel}</span>
          <span style={{ display: "inline-flex", gap: 4 }}>
            <button className="iconbtn" style={{ width: 30, height: 30 }}><IconSearch /></button>
            <button className="iconbtn" style={{ width: 30, height: 30 }}><IconBell /></button>
          </span>
        </div>
        <h1>오늘 <span className="num">{tabCounts.today}개</span></h1>
      </div>

      {/* 탭 */}
      <div className="mob-tabs">
        {tabs.map(t => (
          <button key={t.id} aria-pressed={activeTab === t.id || undefined} onClick={() => setActiveTab(t.id)}>
            {t.label} <span style={{ font: "500 11px/1 var(--font-mono)", opacity: 0.7 }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div className="mob-list">
        {visibleTodos.length === 0 && (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-3)", font: "500 13px/1.6 var(--font-sans)" }}>
            이 탭에 할 일이 없습니다.
          </div>
        )}
        {visibleTodos.map(t => {
          const c = CAT[t.category] || { color: "var(--text-4)", name: "없음" };
          const dueLabel = formatDueLabel(t.due_date);
          const dueState = computeDueState(t.due_date);
          const subtasks = t.subtasks || [];
          return (
            <div key={t.id} className="mob-card todo-row" data-done={t.done || undefined}
                 style={{ display: "grid", gridTemplateColumns: "22px 1fr auto" }}>
              <span
                className="cbx-lg" aria-checked={t.done || false} data-priority={t.priority}
                onClick={() => toggleDone(t.id)}
                style={{ cursor: "pointer" }}
              />
              <div className="row-main">
                <div className="row-title">{t.title}</div>
                <div className="row-sub">
                  {dueLabel && <span className="due" data-state={dueState}>{dueLabel}</span>}
                  {dueLabel && <span className="dot"></span>}
                  <span className="cat">
                    <span className="cat-dot" style={{ background: c.color }}></span>
                    {c.name}
                  </span>
                  {subtasks.length > 0 && <>
                    <span className="dot"></span>
                    <span className="subc">{subtasks.filter(s => s.done).length}/{subtasks.length}</span>
                  </>}
                </div>
              </div>
              <div className="row-aside" style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                {t.starred && <IconStar style={{ width: 14, height: 14, fill: "var(--color-warning)", stroke: "#B89600" }} />}
                {t.priority === "high" && !t.done && <IconFlag className="flag" style={{ width: 14, height: 14 }} />}
                <button
                  className="iconbtn" style={{ width: 20, height: 20, opacity: 0.4 }}
                  onClick={() => deleteTodo(t.id)}
                >
                  <IconTrash style={{ width: 12, height: 12 }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <button className="mob-fab" onClick={() => setShowAdd(true)}><IconPlus /></button>

      {/* 바텀 탭바 */}
      <BottomTabBar active={bottomNav} onSelect={setBottomNav} />

      {/* 추가 모달 */}
      {showAdd && (
        <MobAddModal
          onSubmit={addTodo}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

// ── 바텀 탭바 ─────────────────────────────────────────────────────────
function BottomTabBar({ active, onSelect }) {
  return (
    <nav className="mob-tabbar">
      <a href="#" aria-current={active === "home" ? "page" : undefined}
         onClick={e => { e.preventDefault(); onSelect("home"); }}>
        <IconHome /><span>오늘</span>
      </a>
      <a href="#" aria-current={active === "cal" ? "page" : undefined}
         onClick={e => { e.preventDefault(); onSelect("cal"); }}>
        <IconCalendar /><span>캘린더</span>
      </a>
      <a href="#" aria-current={active === "stats" ? "page" : undefined}
         onClick={e => { e.preventDefault(); onSelect("stats"); }}>
        <IconStats /><span>통계</span>
      </a>
      <a href="#" aria-current={active === "profile" ? "page" : undefined}
         onClick={e => { e.preventDefault(); onSelect("profile"); }}>
        <IconUser /><span>나</span>
      </a>
    </nav>
  );
}

window.MobileScreen = MobileScreen;
