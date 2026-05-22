/* global React, CAL_CELLS, CAL_EVENTS, CAL_MONTH, CAT, TodoSidebar,
   IconChevL, IconChevR, IconPlus, IconFilter, IconMore, IconCalendar */

function CalendarScreen() {
  const cells = CAL_CELLS;

  return (
    <div className="todo-app" style={{ display: "grid", gridTemplateColumns: "248px 1fr", height: "100%" }}>
      <TodoSidebar current="cal" />
      <section className="cal">
        <div className="cal-bar">
          <button className="iconbtn lg"><IconChevL /></button>
          <h1>2026년 5월</h1>
          <span className="month">May · 5월</span>
          <button className="iconbtn lg"><IconChevR /></button>
          <div className="right">
            <div className="seg">
              <button>일</button>
              <button>주</button>
              <button aria-pressed="true">월</button>
              <button>년</button>
            </div>
            <button className="iconbtn lg"><IconFilter /></button>
            <button className="iconbtn lg"><IconMore /></button>
            <button className="sb-quick-btn" style={{ width: "auto", height: 36, padding: "0 14px", marginLeft: 4 }}>
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
            const events = !cell.out ? (CAL_EVENTS[cell.d] || []) : [];
            const isToday = !cell.out && cell.d === CAL_MONTH.today;
            const weekend = cell.col === 0 ? "sun" : cell.col === 6 ? "sat" : undefined;
            return (
              <div key={i} className="cal-cell"
                   data-out={cell.out || undefined}
                   data-today={isToday || undefined}
                   data-weekend={!cell.out ? weekend : undefined}>
                <div className="d">{cell.d}</div>
                {events.slice(0, 3).map((e, j) => {
                  const c = CAT[e.c];
                  return (
                    <div key={j} className="cal-event" data-done={e.done || undefined}>
                      <span className="cat-dot" style={{ background: c.color }}></span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{e.t}</span>
                    </div>
                  );
                })}
                {events.length > 3 && <div className="cal-more">+{events.length - 3}개</div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

window.CalendarScreen = CalendarScreen;
