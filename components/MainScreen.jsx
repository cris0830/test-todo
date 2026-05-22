/* global React, CATEGORIES, CAT, computeDueState, formatDueLabel, supabaseAuth,
   IconInbox, IconSun, IconCalendar, IconClock, IconCheck, IconAlert, IconStats,
   IconSettings, IconSearch, IconPlus, IconChevL, IconChevR, IconChevD, IconFlag,
   IconPaper, IconMore, IconBell, IconFilter, IconShare, IconArchive, IconTrash,
   IconStar, IconLink, IconRepeat, IconTag */

// ── 사이드바 ──────────────────────────────────────────────────────────
function TodoSidebar({ todos, selectedCategory, onSelectCategory, onNewTodo, user, onNavigate, currentScreen }) {
  const done    = todos.filter(t => t.done).length;
  const overdue = todos.filter(t => computeDueState(t.due_date) === "overdue" && !t.done).length;
  const today   = todos.filter(t => computeDueState(t.due_date) === "today"   && !t.done).length;
  const soon    = todos.filter(t => computeDueState(t.due_date) === "soon"    && !t.done).length;
  const inbox   = todos.filter(t => !t.category).length;

  const views = [
    { id: "all",      label: "전체",       Icon: IconSun,      count: todos.filter(t => !t.done).length, tone: "accent" },
    { id: "_today",   label: "오늘",       Icon: IconSun,      count: today  },
    { id: "_upcoming",label: "예정",       Icon: IconCalendar, count: soon   },
    { id: "_overdue", label: "지연",       Icon: IconAlert,    count: overdue, tone: overdue > 0 ? "danger" : undefined },
    { id: "_done",    label: "완료",       Icon: IconCheck,    count: done   },
    { id: "_inbox",   label: "받은편지함", Icon: IconInbox,    count: inbox  },
  ];

  // 카테고리별 미완료 개수
  const catCounts = Object.fromEntries(
    CATEGORIES.map(c => [c.id, todos.filter(t => t.category === c.id && !t.done).length])
  );

  const emailInitial = user && user.email ? user.email[0].toUpperCase() : "?";
  const emailDisplay = user && user.email ? user.email : "";

  return (
    <aside className="sb">
      <div className="sb-brand">
        <span className="sb-brand-mark">T</span>
        <span className="sb-brand-name">TODO</span>
        <span className="sb-brand-sub">v2.0</span>
      </div>

      <div className="sb-quick" style={{ paddingTop: 0 }}>
        <button className="sb-quick-btn" onClick={onNewTodo}>
          <IconPlus style={{ width: 15, height: 15, strokeWidth: 2.5 }} />
          <span>새 할 일</span>
          <span className="kbd">⌘ N</span>
        </button>
      </div>

      <div className="sb-section">뷰</div>
      <nav className="sb-nav">
        {views.map(({ id, label, Icon, count, tone }) => (
          <a key={id} href="#" className="sb-item"
             aria-current={selectedCategory === id ? "page" : undefined}
             data-tone={tone}
             onClick={e => { e.preventDefault(); onSelectCategory(id); }}>
            <Icon /><span>{label}</span>
            {count > 0 && <span className="count">{count}</span>}
          </a>
        ))}
      </nav>

      <div className="sb-section">카테고리</div>
      <nav className="sb-nav">
        {CATEGORIES.map(c => (
          <a key={c.id} href="#" className="sb-item"
             aria-current={selectedCategory === c.id ? "page" : undefined}
             onClick={e => { e.preventDefault(); onSelectCategory(c.id); }}>
            <span className="cat-dot" style={{ background: c.color }}></span>
            <span>{c.name}</span>
            {catCounts[c.id] > 0 && <span className="count">{catCounts[c.id]}</span>}
          </a>
        ))}
      </nav>

      <div className="sb-section">기타</div>
      <nav className="sb-nav">
        <a href="#" className="sb-item"
           aria-current={currentScreen === "calendar" ? "page" : undefined}
           onClick={e => { e.preventDefault(); onNavigate && onNavigate("calendar"); }}>
          <IconCalendar /><span>캘린더</span>
        </a>
        <a href="#" className="sb-item"
           aria-current={currentScreen === "stats" ? "page" : undefined}
           onClick={e => { e.preventDefault(); onNavigate && onNavigate("stats"); }}>
          <IconStats /><span>통계</span>
        </a>
      </nav>

      <div className="sb-foot">
        <span className="sb-avatar">{emailInitial}</span>
        <div className="sb-foot-meta">
          <div className="n" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {emailDisplay}
          </div>
          <div className="e">demodev Todo</div>
        </div>
        <button
          className="iconbtn"
          title="로그아웃"
          onClick={() => window.supabaseAuth.signOut()}
          style={{ flexShrink: 0 }}
        >
          <IconSettings />
        </button>
      </div>
    </aside>
  );
}

// ── 할 일 추가 폼 ─────────────────────────────────────────────────────
function AddTodoForm({ onSubmit, onCancel }) {
  const [title, setTitle]       = React.useState("");
  const [category, setCategory] = React.useState("");
  const [priority, setPriority] = React.useState("medium");
  const [dueDate, setDueDate]   = React.useState("");
  const [saving, setSaving]     = React.useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onSubmit({
      title: title.trim(),
      category: category || null,
      priority,
      due_date: dueDate || null,
    });
    setSaving(false);
  }

  return (
    <div style={{
      margin: "0 0 4px 0", padding: "12px 16px",
      background: "var(--surface-2)", borderRadius: 10,
      border: "1.5px solid var(--accent)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}>
      <form onSubmit={handleSubmit}>
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === "Escape" && onCancel()}
          placeholder="할 일 제목을 입력하세요"
          style={{
            width: "100%", boxSizing: "border-box",
            border: "none", background: "transparent", outline: "none",
            font: "500 14px/1.5 var(--font-sans)", color: "var(--text-1)",
            marginBottom: 8,
          }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ font: "500 12px/1 var(--font-sans)", padding: "4px 8px", borderRadius: 6, border: "1px solid var(--line-1)", background: "var(--surface-1)", color: "var(--text-2)" }}
          >
            <option value="">카테고리 없음</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            style={{ font: "500 12px/1 var(--font-sans)", padding: "4px 8px", borderRadius: 6, border: "1px solid var(--line-1)", background: "var(--surface-1)", color: "var(--text-2)" }}
          >
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            style={{ font: "500 12px/1 var(--font-sans)", padding: "4px 8px", borderRadius: 6, border: "1px solid var(--line-1)", background: "var(--surface-1)", color: "var(--text-2)" }}
          />

          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid var(--line-1)", background: "var(--surface-1)", font: "500 12px/1 var(--font-sans)", color: "var(--text-2)", cursor: "pointer" }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "var(--accent)", color: "#fff", font: "500 12px/1 var(--font-sans)", cursor: "pointer", opacity: !title.trim() || saving ? 0.6 : 1 }}
            >
              {saving ? "저장 중…" : "추가"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── 할 일 행 ──────────────────────────────────────────────────────────
function TodoRow({ t, onClick, selected, onToggleDone, onToggleStarred }) {
  const c = CAT[t.category] || { color: "var(--text-4)", name: "없음" };
  const dueState = computeDueState(t.due_date);
  const dueLabel = formatDueLabel(t.due_date);
  const subtasks = t.subtasks || [];

  return (
    <div className="todo-row" data-done={t.done || undefined} aria-selected={selected || undefined}
         onClick={onClick}>
      <span
        className="cbx-lg" aria-checked={t.done || false} data-priority={t.priority}
        onClick={e => { e.stopPropagation(); onToggleDone(t.id); }}
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
      <div className="row-aside">
        {t.starred && (
          <IconStar
            style={{ width: 14, height: 14, fill: "var(--color-warning)", stroke: "#B89600" }}
            onClick={e => { e.stopPropagation(); onToggleStarred(t.id); }}
          />
        )}
        {!t.starred && (
          <span onClick={e => { e.stopPropagation(); onToggleStarred(t.id); }}
                style={{ width: 14, height: 14, display: "inline-flex", opacity: 0, cursor: "pointer" }}>
            <IconStar style={{ width: 14, height: 14 }} />
          </span>
        )}
        {t.priority === "high" && !t.done && (
          <IconFlag className="flag" style={{ width: 14, height: 14 }} />
        )}
      </div>
    </div>
  );
}

// ── 목록 패널 ─────────────────────────────────────────────────────────
function ListPane({ todos, selectedCategory, selectedId, onSelect, onToggleDone, onToggleStarred, addTodo, showAddForm, onHideAddForm }) {
  // selectedCategory에 따라 필터 + 그룹화
  function filterAndGroup(allTodos) {
    let items = allTodos;
    if (selectedCategory && selectedCategory !== "all") {
      if (selectedCategory.startsWith("_")) {
        const view = selectedCategory.slice(1);
        if (view === "today")    items = allTodos.filter(t => computeDueState(t.due_date) === "today" && !t.done);
        else if (view === "upcoming") items = allTodos.filter(t => computeDueState(t.due_date) === "soon"    && !t.done);
        else if (view === "overdue")  items = allTodos.filter(t => computeDueState(t.due_date) === "overdue" && !t.done);
        else if (view === "done")     items = allTodos.filter(t => t.done);
        else if (view === "inbox")    items = allTodos.filter(t => !t.category);
      } else {
        items = allTodos.filter(t => t.category === selectedCategory);
      }
    }

    // 그룹화 (done=true는 항상 마지막)
    const overdue = items.filter(t => computeDueState(t.due_date) === "overdue" && !t.done);
    const today   = items.filter(t => computeDueState(t.due_date) === "today"   && !t.done);
    const soon    = items.filter(t => computeDueState(t.due_date) === "soon"    && !t.done);
    const future  = items.filter(t => computeDueState(t.due_date) === "future"  && !t.done);
    const noDue   = items.filter(t => !t.due_date && !t.done);
    const done    = items.filter(t => t.done);

    const groups = [];
    if (overdue.length) groups.push({ id: "overdue", label: `지연 · ${overdue.length}`, items: overdue });
    if (today.length)   groups.push({ id: "today",   label: `오늘 · ${today.length}`,   items: today   });
    if (soon.length)    groups.push({ id: "soon",    label: `예정 · ${soon.length}`,    items: soon    });
    if (future.length)  groups.push({ id: "future",  label: `이후 · ${future.length}`,  items: future  });
    if (noDue.length)   groups.push({ id: "noDue",   label: `기한 없음 · ${noDue.length}`, items: noDue });
    if (done.length)    groups.push({ id: "done",    label: `완료 · ${done.length}`,    items: done    });
    return groups;
  }

  const groups = filterAndGroup(todos);
  const todayCount = todos.filter(t => computeDueState(t.due_date) === "today" && !t.done).length;
  const now = new Date();
  const dateLabel = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,"0")}.${String(now.getDate()).padStart(2,"0")}`;
  const dayNames = ["일","월","화","수","목","금","토"];
  const korDateLabel = `${now.getMonth()+1}월 ${now.getDate()}일 ${dayNames[now.getDay()]}요일`;

  return (
    <section className="list-pane">
      <div className="list-head">
        <div className="list-eyebrow">
          <span className="date">{dateLabel}</span>
          <span>·</span>
          <span>{korDateLabel}</span>
        </div>
        <h1 className="list-title">
          오늘 <span className="num">{todayCount}개</span>
        </h1>
        <div className="list-meta">
          <div className="seg">
            <button aria-pressed="true">전체</button>
            <button>마감순</button>
            <button>우선순위</button>
          </div>
          <button className="iconbtn"><IconFilter /></button>
          <button className="iconbtn" style={{ marginLeft: "auto" }}><IconMore /></button>
        </div>
      </div>
      <div className="list-search">
        <div className="list-search-box">
          <IconSearch />
          <input placeholder="제목 또는 #태그 검색" />
          <span className="kbd">⌘ F</span>
        </div>
      </div>

      <div className="list-body">
        {showAddForm && (
          <AddTodoForm
            onSubmit={async (fields) => { await addTodo(fields); onHideAddForm(); }}
            onCancel={onHideAddForm}
          />
        )}

        {groups.length === 0 && !showAddForm && (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-3)", font: "500 13px/1.6 var(--font-sans)" }}>
            할 일이 없습니다.<br/>상단의 <strong>새 할 일</strong> 버튼으로 추가해 보세요.
          </div>
        )}

        {groups.map(g => (
          <React.Fragment key={g.id}>
            <div className="list-group">{g.label}</div>
            {g.items.map(t => (
              <TodoRow
                key={t.id} t={t}
                onClick={() => onSelect(t.id)}
                selected={selectedId === t.id}
                onToggleDone={onToggleDone}
                onToggleStarred={onToggleStarred}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

// ── 상세 패널 ─────────────────────────────────────────────────────────
function DetailPane({ task, updateTodo, deleteTodo, addSubtask, toggleSubtaskDone, deleteSubtask }) {
  const [newSubtask, setNewSubtask] = React.useState("");
  const [editTitle, setEditTitle]   = React.useState(task ? task.title : "");
  const [editNotes, setEditNotes]   = React.useState(task ? (task.notes || "") : "");

  // 선택된 할 일이 바뀌면 편집 상태 초기화
  React.useEffect(() => {
    setEditTitle(task ? task.title : "");
    setEditNotes(task ? (task.notes || "") : "");
    setNewSubtask("");
  }, [task && task.id]);

  if (!task) {
    return (
      <section className="detail" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-4)", font: "500 13px/1 var(--font-sans)" }}>할 일을 선택하면 상세 내용이 표시됩니다</p>
      </section>
    );
  }

  const c = CAT[task.category] || { color: "var(--text-4)", name: "없음" };
  const PRI = { high: { label: "높음", cls: "pri-high" }, medium: { label: "보통", cls: "pri-medium" }, low: { label: "낮음", cls: "pri-low" } };
  const pri = PRI[task.priority] || PRI.medium;
  const dueLabel = formatDueLabel(task.due_date);
  const subtasks = task.subtasks || [];

  async function handleAddSubtask(e) {
    e.preventDefault();
    const t = newSubtask.trim();
    if (!t) return;
    setNewSubtask("");
    await addSubtask(task.id, t);
  }

  async function handleDelete() {
    await deleteTodo(task.id);
  }

  // ISO date to input[type=date] value (YYYY-MM-DD)
  const dueDateValue = task.due_date ? task.due_date.slice(0, 10) : "";

  return (
    <section className="detail">
      <div className="detail-bar">
        <button className="iconbtn"><IconChevL /></button>
        <div className="breadcrumb">
          <span>오늘</span>
          <IconChevR style={{ width: 12, height: 12, opacity: 0.7 }} />
          <strong>{c.name}</strong>
        </div>
        <div className="right">
          <button
            className="iconbtn"
            title={task.starred ? "별표 해제" : "별표"}
            onClick={() => updateTodo(task.id, { starred: !task.starred })}
          >
            <IconStar style={task.starred ? { fill: "var(--color-warning)", stroke: "#B89600" } : {}} />
          </button>
          <button className="iconbtn" title="삭제" onClick={handleDelete}>
            <IconTrash />
          </button>
          <button className="iconbtn"><IconMore /></button>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-title-row">
          <span
            className="cbx-lg" aria-checked={task.done || false}
            onClick={() => updateTodo(task.id, { done: !task.done })}
            style={{ cursor: "pointer" }}
          />
          <input
            className="detail-title"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={() => { if (editTitle.trim() && editTitle !== task.title) updateTodo(task.id, { title: editTitle.trim() }); }}
            style={{ background: "transparent", border: "none", outline: "none", width: "100%", font: "inherit" }}
          />
        </div>

        <dl className="detail-meta">
          <dt><IconCalendar style={{ width: 14, height: 14 }}/> 마감</dt>
          <dd>
            <input
              type="date"
              value={dueDateValue}
              onChange={e => updateTodo(task.id, { due_date: e.target.value || null })}
              style={{ font: "500 13px/1 var(--font-sans)", border: "none", background: "transparent", color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}
            />
          </dd>

          <dt><IconFlag style={{ width: 14, height: 14 }}/> 우선순위</dt>
          <dd>
            <select
              value={task.priority || "medium"}
              onChange={e => updateTodo(task.id, { priority: e.target.value })}
              style={{ font: "500 12px/1 var(--font-sans)", border: "none", background: "transparent", cursor: "pointer" }}
            >
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
          </dd>

          <dt><IconTag style={{ width: 14, height: 14 }}/> 카테고리</dt>
          <dd>
            <select
              value={task.category || ""}
              onChange={e => updateTodo(task.id, { category: e.target.value || null })}
              style={{ font: "500 12px/1 var(--font-sans)", border: "none", background: "transparent", cursor: "pointer" }}
            >
              <option value="">없음</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </dd>

          <dt><IconRepeat style={{ width: 14, height: 14 }}/> 반복</dt>
          <dd>
            <input
              defaultValue={task.repeat || ""}
              onBlur={e => updateTodo(task.id, { repeat: e.target.value || null })}
              placeholder="없음"
              style={{ font: "500 13px/1 var(--font-sans)", border: "none", background: "transparent", color: "var(--text-2)", width: "100%" }}
            />
          </dd>
        </dl>

        {/* 서브태스크 */}
        <div className="detail-section">
          <h3>서브태스크 <span className="ct">{subtasks.filter(s => s.done).length}/{subtasks.length}</span></h3>
          <div>
            {subtasks.map(s => (
              <div key={s.id} className="subtask" data-done={s.done || undefined}>
                <span
                  className="cbx-lg"
                  aria-checked={s.done || false}
                  onClick={() => toggleSubtaskDone(s.id, !s.done)}
                  style={{ cursor: "pointer", width: 18, height: 18, borderRadius: 5 }}
                />
                <span className="lbl">{s.title}</span>
                <button
                  className="iconbtn" style={{ width: 20, height: 20, marginLeft: "auto", opacity: 0.4 }}
                  onClick={() => deleteSubtask(s.id)}
                  title="삭제"
                >
                  <IconTrash style={{ width: 12, height: 12 }} />
                </button>
              </div>
            ))}
            <form onSubmit={handleAddSubtask} className="add-row" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="plus"><IconPlus style={{ width: 11, height: 11, strokeWidth: 2.5 }} /></span>
              <input
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                placeholder="서브태스크 추가"
                style={{ flex: 1, border: "none", background: "transparent", font: "500 13px/1 var(--font-sans)", color: "var(--text-2)", outline: "none" }}
              />
            </form>
          </div>
        </div>

        {/* 메모 */}
        <div className="detail-section">
          <h3>메모</h3>
          <textarea
            className="note-card"
            value={editNotes}
            onChange={e => setEditNotes(e.target.value)}
            onBlur={() => { if (editNotes !== (task.notes || "")) updateTodo(task.id, { notes: editNotes || null }); }}
            placeholder="메모를 입력하세요…"
            style={{ resize: "vertical", minHeight: 80, width: "100%", boxSizing: "border-box", font: "500 13px/1.6 var(--font-sans)", background: "var(--surface-2)", border: "1px solid var(--line-1)", borderRadius: 8, padding: "10px 12px", color: "var(--text-1)" }}
          />
        </div>
      </div>
    </section>
  );
}

// ── 메인 화면 ─────────────────────────────────────────────────────────
function MainScreen({ todos, addTodo, updateTodo, deleteTodo, toggleDone, toggleStarred, addSubtask, toggleSubtaskDone, deleteSubtask, user, onNavigate }) {
  const [selectedId, setSelectedId]         = React.useState(null);
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [showAddForm, setShowAddForm]        = React.useState(false);

  const task = selectedId ? todos.find(t => t.id === selectedId) || null : null;

  return (
    <div className="todo-app shell">
      <TodoSidebar
        todos={todos}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onNewTodo={() => setShowAddForm(true)}
        user={user}
        onNavigate={onNavigate}
        currentScreen="main"
      />
      <ListPane
        todos={todos}
        selectedCategory={selectedCategory}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onToggleDone={toggleDone}
        onToggleStarred={toggleStarred}
        addTodo={addTodo}
        showAddForm={showAddForm}
        onHideAddForm={() => setShowAddForm(false)}
      />
      <DetailPane
        key={selectedId}
        task={task}
        updateTodo={updateTodo}
        deleteTodo={deleteTodo}
        addSubtask={addSubtask}
        toggleSubtaskDone={toggleSubtaskDone}
        deleteSubtask={deleteSubtask}
      />
    </div>
  );
}

Object.assign(window, { MainScreen, TodoSidebar });
