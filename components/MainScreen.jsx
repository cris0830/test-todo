/* global React, TODOS, CAT, CATEGORIES, TODAY_LABEL,
   IconInbox, IconSun, IconCalendar, IconClock, IconCheck, IconAlert, IconStats,
   IconSettings, IconSearch, IconPlus, IconChevL, IconChevR, IconChevD, IconFlag,
   IconPaper, IconMore, IconBell, IconFilter, IconShare, IconArchive, IconTrash,
   IconStar, IconLink, IconRepeat, IconTag */

// ── Sidebar ────────────────────────────────────────────────────────
function TodoSidebar({ current }) {
  const views = [
    { id: "today",    label: "오늘",       Icon: IconSun,      count: 4,  tone: "accent" },
    { id: "upcoming", label: "예정",       Icon: IconCalendar, count: 12 },
    { id: "overdue",  label: "지연",       Icon: IconAlert,    count: 2,  tone: "danger" },
    { id: "done",     label: "완료",       Icon: IconCheck,    count: 38 },
    { id: "inbox",    label: "받은편지함", Icon: IconInbox,    count: 7  },
  ];
  const other = [
    { id: "cal",   label: "캘린더", Icon: IconCalendar },
    { id: "stats", label: "통계",   Icon: IconStats },
  ];
  return (
    <aside className="sb">
      <div className="sb-brand">
        <span className="sb-brand-mark">T</span>
        <span className="sb-brand-name">TODO</span>
        <span className="sb-brand-sub">v1.4</span>
      </div>

      <div className="sb-quick" style={{ paddingTop: 0 }}>
        <button className="sb-quick-btn">
          <IconPlus style={{ width: 15, height: 15, strokeWidth: 2.5 }} />
          <span>새 할 일</span>
          <span className="kbd">⌘ N</span>
        </button>
      </div>

      <div className="sb-section">뷰</div>
      <nav className="sb-nav">
        {views.map(({ id, label, Icon, count, tone }) => (
          <a key={id} href="#" className="sb-item"
             aria-current={current === id ? "page" : undefined}
             data-tone={tone}
             onClick={e => e.preventDefault()}>
            <Icon /><span>{label}</span>
            <span className="count">{count}</span>
          </a>
        ))}
      </nav>

      <div className="sb-section">카테고리</div>
      <nav className="sb-nav">
        {CATEGORIES.map(c => (
          <a key={c.id} href="#" className="sb-item" onClick={e => e.preventDefault()}>
            <span className="cat-dot" style={{ background: c.color }}></span>
            <span>{c.name}</span>
            <span className="count">{c.count}</span>
          </a>
        ))}
        <a href="#" className="sb-item" onClick={e => e.preventDefault()} style={{ color: "var(--text-3)" }}>
          <IconPlus /><span>카테고리 추가</span>
        </a>
      </nav>

      <div className="sb-section">기타</div>
      <nav className="sb-nav">
        {other.map(({ id, label, Icon }) => (
          <a key={id} href="#" className="sb-item" onClick={e => e.preventDefault()}>
            <Icon /><span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="sb-foot">
        <span className="sb-avatar">민</span>
        <div className="sb-foot-meta">
          <div className="n">박민지</div>
          <div className="e">minji@demodev.kr</div>
        </div>
        <button className="iconbtn"><IconSettings /></button>
      </div>
    </aside>
  );
}

// ── List Pane ──────────────────────────────────────────────────────
function TodoRow({ t, onClick, selected }) {
  const c = CAT[t.category];
  return (
    <div className="todo-row" data-done={t.done} aria-selected={selected} onClick={onClick}>
      <span className={"cbx-lg"} aria-checked={t.done} data-priority={t.priority}></span>
      <div className="row-main">
        <div className="row-title">{t.title}</div>
        <div className="row-sub">
          {t.due && <span className="due" data-state={t.dueState}>{t.due}</span>}
          <span className="dot"></span>
          <span className="cat">
            <span className="cat-dot" style={{ background: c.color }}></span>
            {c.name}
          </span>
          {t.subcategory && <>
            <span className="dot"></span>
            <span className="subc">{t.subcategory}</span>
          </>}
          {t.subs && t.subs.length > 0 && <>
            <span className="dot"></span>
            <span className="subc">{t.subs.filter(s => s.done).length}/{t.subs.length}</span>
          </>}
        </div>
      </div>
      <div className="row-aside">
        {t.starred && <IconStar style={{ width: 14, height: 14, fill: "var(--color-warning)", stroke: "#B89600" }} />}
        {t.priority === "high" && !t.done && <IconFlag className="flag" style={{ width: 14, height: 14 }} />}
      </div>
    </div>
  );
}

function ListPane({ selectedId, onSelect }) {
  const groups = [
    { id: "overdue", label: "지연 · 2",   items: TODOS.filter(t => t.dueState === "overdue") },
    { id: "today",   label: "오늘 · 4",  items: TODOS.filter(t => t.dueState === "today") },
    { id: "soon",    label: "예정 · 4",   items: TODOS.filter(t => t.dueState === "soon") },
    { id: "past",    label: "완료 · 2",  items: TODOS.filter(t => t.dueState === "past") },
  ];

  return (
    <section className="list-pane">
      <div className="list-head">
        <div className="list-eyebrow">
          <span className="date">2026.05.15</span>
          <span>·</span>
          <span>{TODAY_LABEL}</span>
        </div>
        <h1 className="list-title">
          오늘 <span className="num">{TODOS.filter(t => t.dueState === "today").length}개</span>
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
        {groups.map(g => (
          <React.Fragment key={g.id}>
            <div className="list-group">{g.label}</div>
            {g.items.map(t => (
              <TodoRow key={t.id} t={t} onClick={() => onSelect(t.id)} selected={selectedId === t.id} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

// ── Detail Pane ────────────────────────────────────────────────────
function DetailPane({ task }) {
  if (!task) return <section className="detail" />;
  const c = CAT[task.category];

  const PRI = { high: { label: "높음", cls: "pri-high" }, medium: { label: "보통", cls: "pri-medium" }, low: { label: "낮음", cls: "pri-low" } };
  const pri = PRI[task.priority];

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
          <button className="iconbtn"><IconStar /></button>
          <button className="iconbtn"><IconShare /></button>
          <button className="iconbtn"><IconArchive /></button>
          <button className="iconbtn"><IconMore /></button>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-title-row">
          <span className="cbx-lg" aria-checked={task.done}></span>
          <h1 className="detail-title">{task.title}</h1>
        </div>

        <dl className="detail-meta">
          <dt><IconCalendar style={{ width: 14, height: 14 }}/> 마감</dt>
          <dd>
            <span className="date">2026.05.15</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>{task.due}</span>
            <span style={{ marginLeft: "auto", color: "var(--text-3)", font: "500 12px/1 var(--font-mono)" }}>D-0</span>
          </dd>

          <dt><IconFlag style={{ width: 14, height: 14 }}/> 우선순위</dt>
          <dd><span className={"pri-chip " + pri.cls}>{pri.label}</span></dd>

          <dt><IconTag style={{ width: 14, height: 14 }}/> 카테고리</dt>
          <dd>
            <span className="cat-chip">
              <span className="cat-dot" style={{ background: c.color }}></span>
              {c.name}
            </span>
            {task.subcategory && <span style={{ color: "var(--text-3)", font: "500 12px/1 var(--font-mono)" }}>· {task.subcategory}</span>}
          </dd>

          <dt><IconRepeat style={{ width: 14, height: 14 }}/> 반복</dt>
          <dd>{task.repeat || <span style={{ color: "var(--text-3)" }}>없음</span>}</dd>

          <dt><IconBell style={{ width: 14, height: 14 }}/> 알림</dt>
          <dd>마감 30분 전 · 푸시</dd>
        </dl>

        {task.subs && task.subs.length > 0 && (
          <div className="detail-section">
            <h3>서브태스크 <span className="ct">{task.subs.filter(s => s.done).length}/{task.subs.length}</span></h3>
            <div>
              {task.subs.map((s, i) => (
                <div key={i} className="subtask" data-done={s.done}>
                  <span className="cbx-lg" style={{ width: 18, height: 18, borderRadius: 5 }} aria-checked={s.done}></span>
                  <span className="lbl">{s.t}</span>
                  <span className="hint">{s.done ? "✓" : ""}</span>
                </div>
              ))}
              <div className="add-row">
                <span className="plus"><IconPlus style={{ width: 11, height: 11, strokeWidth: 2.5 }} /></span>
                서브태스크 추가
              </div>
            </div>
          </div>
        )}

        {task.notes && (
          <div className="detail-section">
            <h3>메모</h3>
            <div className="note-card">{task.notes}</div>
          </div>
        )}

        {task.activity && (
          <div className="detail-section">
            <h3>활동 <span className="ct">{task.activity.length}</span></h3>
            <div>
              {task.activity.map((a, i) => (
                <div key={i} className="activity">
                  <span className="av">{a.who[0]}</span>
                  <div style={{ flex: 1, color: "var(--text-2)" }}>
                    <b>{a.who}</b>{a.what}
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{a.when}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Main shell ─────────────────────────────────────────────────────
function MainScreen() {
  const [selected, setSelected] = React.useState("t1");
  const task = TODOS.find(t => t.id === selected);
  return (
    <div className="todo-app shell">
      <TodoSidebar current="today" />
      <ListPane selectedId={selected} onSelect={setSelected} />
      <DetailPane task={task} />
    </div>
  );
}

Object.assign(window, { MainScreen, TodoSidebar });
