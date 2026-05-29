/* global React, CATEGORIES, CAT, TodoSidebar, computeDueState,
   IconChevL, IconChevR, IconPlus, IconFilter, IconMore, IconCalendar */

const MONTH_NAMES_KO = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const MONTH_NAMES_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/** year, month(1-indexed)에 해당하는 달력 셀 배열 생성 */
function buildCalCells(year, month) {
  const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrev  = new Date(year, month - 1, 0).getDate();

  const cells = [];
  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ d: daysInPrev - i, out: true, prev: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ d, out: false });
  }
  // 마지막 줄을 7의 배수로 채우기
  let trailing = 1;
  while (cells.length % 7 !== 0) cells.push({ d: trailing++, out: true, next: true });
  return cells.map((c, i) => ({ ...c, col: i % 7 }));
}

function CalendarScreen({ todos = [], mobile, onNavigate, user }) {
  const now = new Date();
  const [currentYear,  setCurrentYear]  = React.useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = React.useState(now.getMonth() + 1); // 1-indexed
  const [selectedDay,  setSelectedDay]  = React.useState(null);

  const cells = React.useMemo(() => buildCalCells(currentYear, currentMonth), [currentYear, currentMonth]);

  // todos에서 due_date 기준으로 이벤트 맵 구성: { day → [todo, ...] }
  const calEvents = React.useMemo(() => {
    const map = {};
    (todos || []).forEach(t => {
      if (!t.due_date) return;
      const d = new Date(t.due_date);
      if (d.getFullYear() !== currentYear || d.getMonth() + 1 !== currentMonth) return;
      const day = d.getDate();
      if (!map[day]) map[day] = [];
      map[day].push(t);
    });
    return map;
  }, [todos, currentYear, currentMonth]);

  // 선택된 날짜의 todos
  const selectedTodos = selectedDay ? (calEvents[selectedDay] || []) : [];

  function prevMonth() {
    if (currentMonth === 1) { setCurrentYear(y => y - 1); setCurrentMonth(12); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (currentMonth === 12) { setCurrentYear(y => y + 1); setCurrentMonth(1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  }

  const todayYear  = now.getFullYear();
  const todayMonth = now.getMonth() + 1;
  const todayDate  = now.getDate();

  const calBody = (
    <section className="cal">
      <div className="cal-bar">
        <button className="iconbtn lg" onClick={prevMonth}><IconChevL /></button>
        <h1>{currentYear}년 {MONTH_NAMES_KO[currentMonth - 1]}</h1>
        <span className="month">{MONTH_NAMES_EN[currentMonth - 1]} · {MONTH_NAMES_KO[currentMonth - 1]}</span>
        <button className="iconbtn lg" onClick={nextMonth}><IconChevR /></button>
        <div className="right">
          <div className="seg">
            <button>일</button>
            <button>주</button>
            <button aria-pressed="true">월</button>
            <button>년</button>
          </div>
          <button className="iconbtn lg"><IconFilter /></button>
          <button className="iconbtn lg"><IconMore /></button>
          <button
            className="sb-quick-btn"
            style={{ width: "auto", height: 36, padding: "0 14px", marginLeft: 4 }}
            onClick={() => onNavigate && onNavigate("main")}
          >
            <IconPlus style={{ width: 14, height: 14, strokeWidth: 2.5 }} />
            <span>새 할 일</span>
          </button>
        </div>
      </div>

      <div className="cal-dow">
        {["일","월","화","수","목","금","토"].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="cal-body">
        {cells.map((cell, i) => {
          const events = !cell.out ? (calEvents[cell.d] || []) : [];
          const isToday = !cell.out && cell.d === todayDate && currentYear === todayYear && currentMonth === todayMonth;
          const isSelected = !cell.out && cell.d === selectedDay;
          const weekend = cell.col === 0 ? "sun" : cell.col === 6 ? "sat" : undefined;
          return (
            <div
              key={i} className="cal-cell"
              data-out={cell.out || undefined}
              data-today={isToday || undefined}
              data-weekend={!cell.out ? weekend : undefined}
              style={isSelected ? { outline: "2px solid var(--accent)", outlineOffset: -2, borderRadius: 6 } : undefined}
              onClick={() => !cell.out && setSelectedDay(cell.d === selectedDay ? null : cell.d)}
            >
              <div className="d">{cell.d}</div>
              {events.slice(0, 3).map((ev, j) => {
                const cat = CAT[ev.category] || { color: "var(--text-4)" };
                return (
                  <div key={j} className="cal-event" data-done={ev.done || undefined}>
                    <span className="cat-dot" style={{ background: cat.color }}></span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</span>
                  </div>
                );
              })}
              {events.length > 3 && <div className="cal-more">+{events.length - 3}개</div>}
            </div>
          );
        })}
      </div>

      {/* 날짜 클릭 시 해당 날짜 할 일 목록 */}
      {selectedDay && selectedTodos.length > 0 && (
        <div style={{
          position: "absolute", bottom: 16, right: 16,
          background: "var(--surface-1)", borderRadius: 12,
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)", padding: "14px 16px",
          minWidth: 240, maxWidth: 320, zIndex: 10,
          border: "1px solid var(--line-1)",
        }}>
          <div style={{ font: "600 13px/1 var(--font-sans)", color: "var(--text-2)", marginBottom: 10 }}>
            {currentMonth}월 {selectedDay}일 · {selectedTodos.length}개
          </div>
          {selectedTodos.map(t => {
            const cat = CAT[t.category] || { color: "var(--text-4)", name: "없음" };
            return (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderTop: "1px solid var(--line-2)" }}>
                <span className="cat-dot" style={{ background: cat.color, width: 8, height: 8, borderRadius: "50%", flexShrink: 0 }}></span>
                <span style={{ font: "500 13px/1.4 var(--font-sans)", color: t.done ? "var(--text-4)" : "var(--text-1)", textDecoration: t.done ? "line-through" : "none", flex: 1 }}>
                  {t.title}
                </span>
              </div>
            );
          })}
          <button
            onClick={() => setSelectedDay(null)}
            style={{ marginTop: 10, width: "100%", padding: "6px 0", borderRadius: 6, border: "1px solid var(--line-1)", background: "var(--surface-2)", font: "500 12px/1 var(--font-sans)", color: "var(--text-3)", cursor: "pointer" }}
          >
            닫기
          </button>
        </div>
      )}
    </section>
  );

  if (mobile) return calBody;

  return (
    <div className="todo-app" style={{ display: "grid", gridTemplateColumns: "248px 1fr", height: "100%", position: "relative" }}>
      <TodoSidebar current="all" todos={todos} selectedCategory="all" onSelectCategory={() => {}} onNewTodo={() => {}} user={user} onNavigate={onNavigate} currentScreen="calendar" />
      {calBody}
    </div>
  );
}

window.CalendarScreen = CalendarScreen;
