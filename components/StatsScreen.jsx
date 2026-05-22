/* global React, WEEK_STATS, STREAK, CATEGORIES, CATEGORY_USAGE, TodoSidebar,
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
          <circle key={i}
                  r={R} fill="none" strokeWidth="14"
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

function StatsScreen() {
  const maxBar = Math.max(...WEEK_STATS.map(w => w.done + w.pending));

  return (
    <div className="todo-app" style={{ display: "grid", gridTemplateColumns: "248px 1fr", height: "100%" }}>
      <TodoSidebar current="stats" />
      <section className="stats">
        <div className="stats-head">
          <h1>이번 주 통계</h1>
          <p>2026년 5월 9일 — 5월 15일 · 7일간의 활동입니다.</p>
        </div>

        <div className="stats-grid">
          {/* Top KPI row */}
          <div className="stats-card span-3">
            <h3><IconCheck style={{ width: 14, height: 14 }} /> 완료한 할 일</h3>
            <div className="big">35 <span className="unit">개</span></div>
            <div className="row gap-2">
              <span className="delta up">▲ 12%</span>
              <span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--text-3)" }}>지난 주 대비</span>
            </div>
          </div>

          <div className="stats-card span-3">
            <h3><IconClock style={{ width: 14, height: 14 }} /> 평균 처리 시간</h3>
            <div className="big">1.4 <span className="unit">일</span></div>
            <div className="row gap-2">
              <span className="delta down">▼ 0.3일</span>
              <span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--text-3)" }}>마감 전 평균 완료</span>
            </div>
          </div>

          <div className="stats-card span-3">
            <h3><IconStats style={{ width: 14, height: 14 }} /> 완료율</h3>
            <div className="big">87<span className="unit">%</span></div>
            <div className="row gap-2">
              <span className="delta up">▲ 5%p</span>
              <span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--text-3)" }}>40개 중 35개</span>
            </div>
          </div>

          <div className="stats-card span-3">
            <h3><IconStar style={{ width: 14, height: 14 }} /> 연속 기록</h3>
            <div className="big">14 <span className="unit">일</span></div>
            <div className="row gap-2">
              <span style={{ font: "500 12px/1 var(--font-sans)", color: "var(--color-success)", background: "var(--color-success-soft)", padding: "3px 8px", borderRadius: 6 }}>🔥 최장 기록 갱신</span>
            </div>
          </div>

          {/* Weekly bar chart */}
          <div className="stats-card span-8">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h3>요일별 완료 추이</h3>
              <div style={{ display: "flex", gap: 14, font: "500 12px/1 var(--font-sans)", color: "var(--text-3)" }}>
                <span className="row gap-2"><i style={{ width: 10, height: 10, borderRadius: 3, background: "var(--accent)" }}></i>완료</span>
                <span className="row gap-2"><i style={{ width: 10, height: 10, borderRadius: 3, background: "var(--surface-3)" }}></i>미완료</span>
              </div>
            </div>
            <div className="wk-bars">
              {WEEK_STATS.map((w, i) => {
                const total = w.done + w.pending;
                const doneH = (w.done / maxBar) * 100;
                const pendH = (w.pending / maxBar) * 100;
                return (
                  <div key={i} className="wk-bar" data-today={w.today || undefined}>
                    <div className="stack">
                      {w.pending > 0 && <i className="pending" style={{ height: pendH + "%" }}></i>}
                      <i className="done" style={{ height: doneH + "%" }}></i>
                    </div>
                    <div className="d">{w.d}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category donut */}
          <div className="stats-card span-4">
            <h3>카테고리 비중</h3>
            <div className="donut">
              <Donut total="296" items={CATEGORY_USAGE.map(u => ({ pct: u.pct, color: CATEGORIES.find(c => c.id === u.id).color }))} />
              <div className="donut-legend">
                {CATEGORY_USAGE.map(u => {
                  const c = CATEGORIES.find(cc => cc.id === u.id);
                  return (
                    <div key={u.id} className="row">
                      <span className="sw" style={{ background: c.color, width: 10, height: 10, borderRadius: 3, marginRight: 8 }}></span>
                      <span style={{ flex: 1 }}>{c.name}</span>
                      <span className="v">{u.pct}% · {u.n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Streak heatmap */}
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
              {STREAK.map((row, i) => (
                <div key={i} className="streak-row">
                  {row.map((n, j) => <div key={j} className="streak-cell" data-fill={n}></div>)}
                </div>
              ))}
            </div>
            <div className="row" style={{ justifyContent: "space-between", font: "500 11px/1 var(--font-mono)", color: "var(--text-3)", marginTop: 4 }}>
              <span>2월 24일</span>
              <span>3월 24일</span>
              <span>4월 21일</span>
              <span>5월 15일 · 오늘</span>
            </div>
          </div>

          {/* Category bars */}
          <div className="stats-card span-4">
            <h3>카테고리별 완료</h3>
            <div className="bar-list">
              {CATEGORIES.map(c => {
                const pct = { work: 92, personal: 80, study: 70, health: 65, shopping: 50 }[c.id];
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

          {/* Insight */}
          <div className="stats-card span-12" style={{ flexDirection: "row", alignItems: "center", gap: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--color-accent-soft)", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <IconFlag style={{ width: 22, height: 22 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ font: "600 13px/1 var(--font-sans)", color: "var(--text-3)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>이번 주 인사이트</div>
              <div style={{ font: "600 17px/1.45 var(--font-sans)", color: "var(--text-1)", letterSpacing: "-0.01em" }}>
                목요일 오전에 가장 많이 완료합니다. 중요한 작업은 <span style={{ color: "var(--accent)" }}>목요일 10시</span>에 배치해 보세요.
              </div>
            </div>
            <button className="sb-quick-btn" style={{ width: "auto", height: 36, padding: "0 14px" }}>
              <span>리포트 보기</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

window.StatsScreen = StatsScreen;
