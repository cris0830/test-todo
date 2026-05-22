/* global React, TODOS, CAT, TODAY_LABEL,
   IconHome, IconCalendar, IconStats, IconUser, IconPlus, IconSearch, IconBell, IconStar, IconFlag */

function MobileScreen() {
  const tabs = [
    { id: "today",   label: "오늘",   count: 4 },
    { id: "soon",    label: "예정",   count: 12 },
    { id: "overdue", label: "지연",   count: 2 },
    { id: "inbox",   label: "받은편지함", count: 7 },
    { id: "done",    label: "완료",   count: 38 },
  ];
  const groups = [
    { id: "overdue", label: "지연",   items: TODOS.filter(t => t.dueState === "overdue") },
    { id: "today",   label: "오늘",   items: TODOS.filter(t => t.dueState === "today") },
    { id: "soon",    label: "예정",   items: TODOS.filter(t => t.dueState === "soon") },
  ];

  return (
    <div className="todo-app mobile" style={{ position: "relative" }}>
      <div className="mob-statusbar">
        <span>9:41</span>
        <span className="right">
          <span style={{ font: "500 11px/1 var(--font-sans)" }}>5G</span>
          <span style={{ width: 22, height: 11, borderRadius: 2, border: "1px solid var(--text-2)", position: "relative", display: "inline-block" }}>
            <span style={{ position: "absolute", inset: 1, width: "70%", background: "var(--text-1)", borderRadius: 1 }}></span>
          </span>
        </span>
      </div>

      <div className="mob-head">
        <div className="mob-eyebrow">
          <span><span className="date">2026.05.15</span> · {TODAY_LABEL}</span>
          <span style={{ display: "inline-flex", gap: 4 }}>
            <button className="iconbtn" style={{ width: 30, height: 30 }}><IconSearch /></button>
            <button className="iconbtn" style={{ width: 30, height: 30 }}><IconBell /></button>
          </span>
        </div>
        <h1>오늘 <span className="num">4개</span></h1>
      </div>

      <div className="mob-tabs">
        {tabs.map((t, i) => (
          <button key={t.id} aria-pressed={i === 0 || undefined}>
            {t.label} <span style={{ font: "500 11px/1 var(--font-mono)", opacity: 0.7 }}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="mob-list">
        {groups.map(g => (
          <React.Fragment key={g.id}>
            <div className="mob-group">{g.label} · {g.items.length}</div>
            {g.items.map(t => {
              const c = CAT[t.category];
              return (
                <div key={t.id} className="mob-card todo-row" data-done={t.done}
                     style={{ display: "grid", gridTemplateColumns: "22px 1fr auto" }}>
                  <span className="cbx-lg" aria-checked={t.done} data-priority={t.priority}></span>
                  <div className="row-main">
                    <div className="row-title">{t.title}</div>
                    <div className="row-sub">
                      {t.due && <span className="due" data-state={t.dueState}>{t.due}</span>}
                      <span className="dot"></span>
                      <span className="cat">
                        <span className="cat-dot" style={{ background: c.color }}></span>
                        {c.name}
                      </span>
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
            })}
          </React.Fragment>
        ))}
      </div>

      <button className="mob-fab"><IconPlus /></button>

      <nav className="mob-tabbar">
        <a href="#" aria-current="page" onClick={e => e.preventDefault()}><IconHome /><span>오늘</span></a>
        <a href="#" onClick={e => e.preventDefault()}><IconCalendar /><span>캘린더</span></a>
        <a href="#" onClick={e => e.preventDefault()}><IconStats /><span>통계</span></a>
        <a href="#" onClick={e => e.preventDefault()}><IconUser /><span>나</span></a>
      </nav>
    </div>
  );
}

window.MobileScreen = MobileScreen;
