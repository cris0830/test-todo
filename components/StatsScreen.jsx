/* global React, CATEGORIES, TodoSidebar,
   IconCheck, IconClock, IconStats, IconFlag, IconStar */

function Donut({ items, total }) {
  const R = 52, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg className="donut-svg" viewBox="-66 -66 132 132">
      <circle r={R} fill="none" stroke="var(--surface-3)" strokeWidth="14" />
      {items.map((it, i) => {
        const len = (it.pct / 100) * C;
        const dash = `${len} ${C - len}`;
        const el = (
          <circle key={i} r={R} fill="none" strokeWidth="14"
                  stroke={it.color}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  transform="rotate(-90)"
                  strokeLinecap="butt" />
        );
        offset += len;
        return el;
      })}
      <text className="donut-center" textAnchor="middle" y="3">{total}</text>
      <text className="donut-center-sub" textAnchor="middle" y="18">완료</text>
    </svg>
  );
}

function StatsScreen({ todos = [], mobile }) {
  const now = new Date();

  // ── KPI 계산 ──────────────────────────────────────────────────────
  const total    = todos.length;
  const doneList = todos.filter(t => t.done);
  const donePct  = total > 0 ? Math.round(doneList.length / total * 100) : 0;

  // ── 카테고리 비율 ─────────────────────────────────────────────────
  const catStats = React.useMemo(() => {
    const counts = CATEGORIES.map(c => ({
      ...c,
      n: todos.filter(t => t.category === c.id).length,
    }));
    const catTotal = counts.reduce((s, c) => s + c.n, 0);
    return counts.map(c => ({
      ...c,
      pct: catTotal > 0 ? Math.round((c.n / catTotal) * 100) : 0,
    }));
  }, [todos]);

  // 카테고리별 완료율
  const catDoneRates = React.useMemo(() => {
    return Object.fromEntries(CATEGORIES.map(c => {
      const catTodos = todos.filter(t => t.category === c.id);
      const pct = catTodos.length > 0 ? Math.round(catTodos.filter(t => t.done).length / catTodos.length * 100) : 0;
      return [c.id, pct];
    }));
  }, [todos]);

  // ── 주간 막대 차트 (최근 7일) ─────────────────────────────────────
  const weekStats = React.useMemo(() => {
    const days = ["일","월","화","수","목","금","토"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const dayTodos = todos.filter(t => {
        const created = new Date(t.created_at);
        return created >= d && created < next;
      });
      return {
        d: days[d.getDay()],
        done: dayTodos.filter(t => t.done).length,
        pending: dayTodos.filter(t => !t.done).length,
        today: i === 6,
      };
    });
  }, [todos]);

  const maxBar = Math.max(...weekStats.map(w => w.done + w.pending), 1);

  // ── 12주 히트맵 ───────────────────────────────────────────────────
  const heatmap = React.useMemo(() => {
    // 오늘 기준 가장 가까운 일요일을 구함
    const todaySunday = new Date(now);
    todaySunday.setDate(now.getDate() - now.getDay());
    todaySunday.setHours(0, 0, 0, 0);
    const startDate = new Date(todaySunday);
    startDate.setDate(todaySunday.getDate() - 11 * 7);

    // 날짜별 생성 건수 맵
    const countByMs = {};
    todos.forEach(t => {
      const d = new Date(t.created_at);
      d.setHours(0, 0, 0, 0);
      countByMs[d.getTime()] = (countByMs[d.getTime()] || 0) + 1;
    });

    // 7행(요일) × 12열(주) 행렬
    const rows = [];
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const row = [];
      for (let week = 0; week < 12; week++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + week * 7 + dayOfWeek);
        const n = countByMs[d.getTime()] || 0;
        row.push(Math.min(n, 4));
      }
      rows.push(row);
    }
    return rows;
  }, [todos]);

  // 히트맵 날짜 레이블
  function heatmapLabel(weeksAgo) {
    const d = new Date(now);
    d.setDate(now.getDate() - weeksAgo * 7 - now.getDay());
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  }

  const statsContent = (
    <section className="stats">
      <div className="stats-head">
        <h1>이번 주 통계</h1>
        <p>
          {(() => {
            const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1);
            const sun = new Date(now); sun.setDate(now.getDate() - now.getDay() + 7);
            return `${now.getFullYear()}년 ${mon.getMonth()+1}월 ${mon.getDate()}일 — ${sun.getMonth()+1}월 ${sun.getDate()}일 · 7일간의 활동입니다.`;
          })()}
        </p>
      </div>

      <div className="stats-grid">
        {/* KPI 카드 */}
        <div className="stats-card span-3">
          <h3><IconCheck style={{ width: 14, height: 14 }} /> 완료한 할 일</h3>
          <div className="big">{doneList.length} <span className="unit">개</span></div>
          <div className="row gap-2">
            <span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--text-3)" }}>전체 {total}개 중</span>
          </div>
        </div>

        <div className="stats-card span-3">
          <h3><IconClock style={{ width: 14, height: 14 }} /> 미완료</h3>
          <div className="big">{total - doneList.length} <span className="unit">개</span></div>
          <div className="row gap-2">
            <span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--text-3)" }}>남은 할 일</span>
          </div>
        </div>

        <div className="stats-card span-3">
          <h3><IconStats style={{ width: 14, height: 14 }} /> 완료율</h3>
          <div className="big">{donePct}<span className="unit">%</span></div>
          <div className="row gap-2">
            <span className={donePct >= 70 ? "delta up" : "delta down"}>
              {donePct >= 70 ? "▲" : "▼"} {total > 0 ? `${total}개 중 ${doneList.length}개` : "할 일 없음"}
            </span>
          </div>
        </div>

        <div className="stats-card span-3">
          <h3><IconStar style={{ width: 14, height: 14 }} /> 별표 할 일</h3>
          <div className="big">{todos.filter(t => t.starred).length} <span className="unit">개</span></div>
          <div className="row gap-2">
            <span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--text-3)" }}>중요 표시됨</span>
          </div>
        </div>

        {/* 주간 막대 차트 */}
        <div className="stats-card span-8">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h3>요일별 생성/완료 추이</h3>
            <div style={{ display: "flex", gap: 14, font: "500 12px/1 var(--font-sans)", color: "var(--text-3)" }}>
              <span className="row gap-2"><i style={{ width: 10, height: 10, borderRadius: 3, background: "var(--accent)" }}></i>완료</span>
              <span className="row gap-2"><i style={{ width: 10, height: 10, borderRadius: 3, background: "var(--surface-3)" }}></i>미완료</span>
            </div>
          </div>
          <div className="wk-bars">
            {weekStats.map((w, i) => {
              const barTotal = w.done + w.pending;
              const doneH = barTotal > 0 ? (w.done    / maxBar) * 100 : 0;
              const pendH = barTotal > 0 ? (w.pending / maxBar) * 100 : 0;
              return (
                <div key={i} className="wk-bar" data-today={w.today || undefined}>
                  <div className="stack">
                    {w.pending > 0 && <i className="pending" style={{ height: pendH + "%" }}></i>}
                    <i className="done" style={{ height: Math.max(doneH, w.done > 0 ? 4 : 0) + "%" }}></i>
                  </div>
                  <div className="d">{w.d}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 카테고리 도넛 */}
        <div className="stats-card span-4">
          <h3>카테고리 비중</h3>
          <div className="donut">
            <Donut
              total={String(doneList.length)}
              items={catStats.filter(c => c.pct > 0).map(c => ({ pct: c.pct, color: c.color }))}
            />
            <div className="donut-legend">
              {catStats.map(c => (
                <div key={c.id} className="row">
                  <span className="sw" style={{ background: c.color, width: 10, height: 10, borderRadius: 3, marginRight: 8 }}></span>
                  <span style={{ flex: 1 }}>{c.name}</span>
                  <span className="v">{c.pct}% · {c.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 히트맵 */}
        <div className="stats-card span-8">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h3>최근 12주 활동</h3>
            <div className="row gap-2" style={{ font: "500 11px/1 var(--font-sans)", color: "var(--text-3)" }}>
              <span>적음</span>
              <span style={{ display: "inline-flex", gap: 3 }}>
                {[0,1,2,3,4].map(n => <i key={n} className="streak-cell" data-fill={n} style={{ width: 12, height: 12, flex: "none" }}></i>)}
              </span>
              <span>많음</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {heatmap.map((row, i) => (
              <div key={i} className="streak-row">
                {row.map((n, j) => <div key={j} className="streak-cell" data-fill={n}></div>)}
              </div>
            ))}
          </div>
          <div className="row" style={{ justifyContent: "space-between", font: "500 11px/1 var(--font-mono)", color: "var(--text-3)", marginTop: 4 }}>
            <span>{heatmapLabel(11)}</span>
            <span>{heatmapLabel(8)}</span>
            <span>{heatmapLabel(4)}</span>
            <span>{heatmapLabel(0)} · 오늘</span>
          </div>
        </div>

        {/* 카테고리별 완료율 */}
        <div className="stats-card span-4">
          <h3>카테고리별 완료율</h3>
          <div className="bar-list">
            {CATEGORIES.map(c => {
              const pct = catDoneRates[c.id] || 0;
              return (
                <div key={c.id} className="bar">
                  <span className="lbl">
                    <span className="cat-dot" style={{ background: c.color, width: 8, height: 8 }}></span>
                    {c.name}
                  </span>
                  <span className="track">
                    <i style={{ width: pct + "%", background: c.color }}></i>
                  </span>
                  <span className="val">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 인사이트 */}
        <div className="stats-card span-12" style={{ flexDirection: "row", alignItems: "center", gap: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--color-accent-soft)", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <IconFlag style={{ width: 22, height: 22 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ font: "600 13px/1 var(--font-sans)", color: "var(--text-3)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>요약 인사이트</div>
            <div style={{ font: "600 17px/1.45 var(--font-sans)", color: "var(--text-1)", letterSpacing: "-0.01em" }}>
              {donePct >= 80
                ? <><span style={{ color: "var(--accent)" }}>훌륭합니다!</span> 완료율 {donePct}% — 목표를 잘 달성하고 있습니다.</>
                : donePct >= 50
                ? <>완료율 {donePct}% — <span style={{ color: "var(--accent)" }}>미완료 항목</span>을 확인하고 마무리해 보세요.</>
                : total === 0
                ? <>아직 등록된 할 일이 없습니다. <span style={{ color: "var(--accent)" }}>새 할 일</span>을 추가해 보세요.</>
                : <>완료율 {donePct}% — 지금부터 하나씩 해결해 나가면 됩니다.</>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  if (mobile) return statsContent;

  return (
    <div className="todo-app" style={{ display: "grid", gridTemplateColumns: "248px 1fr", height: "100%" }}>
      <TodoSidebar current="stats" todos={todos} selectedCategory="all" onSelectCategory={() => {}} onNewTodo={() => {}} user={null} />
      {statsContent}
    </div>
  );
}

window.StatsScreen = StatsScreen;
