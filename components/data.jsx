/* global window */
// Mock data for the demodev Todo app. All copy in Korean.

const CATEGORIES = [
  { id: "work",     name: "업무",   color: "#1571F3", soft: "#E7F1FE", count: 12 },
  { id: "personal", name: "개인",   color: "#27C961", soft: "#DBF8E6", count: 6  },
  { id: "study",    name: "학습",   color: "#A855F7", soft: "#F2E6FE", count: 4  },
  { id: "health",   name: "건강",   color: "#F59E0B", soft: "#FEF2D8", count: 3  },
  { id: "shopping", name: "쇼핑",   color: "#EF4444", soft: "#FEE8EA", count: 2  },
];
const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

// today = 2026-05-15 (Friday). Dates relative to that.
const TODAY_LABEL = "5월 15일 금요일";

const TODOS = [
  {
    id: "t1",
    title: "디자인 시스템 v2 컴포넌트 리뷰",
    done: false, priority: "high", category: "work", subcategory: "Sprint 14",
    due: "오늘 16:00", dueState: "today",
    notes: "Button, Input, Chip 변경 사항을 디자인 토큰 변경분과 함께 검토합니다.\n특히 dark theme 토큰 매핑이 맞는지 다시 확인이 필요합니다.",
    subs: [
      { t: "Button.tsx 변경분 코멘트 정리", done: true },
      { t: "Input 포커스 링 컬러 토큰 확인", done: true },
      { t: "Chip 사이즈 spec 회의록과 대조", done: false },
      { t: "Storybook 스크린샷 첨부",     done: false },
    ],
    activity: [
      { who: "민지", what: "님이 이 작업에 코멘트를 남겼습니다.", when: "오전 9:42" },
      { who: "준호", what: "님이 서브태스크 2개를 완료했습니다.", when: "오전 11:15" },
    ],
    starred: true,
    repeat: "매주 금요일",
    selected: true,
  },
  { id: "t2", title: "클라이언트 미팅 자료 준비", done: false, priority: "high",   category: "work", subcategory: "Acme Co.",  due: "오늘 14:30", dueState: "today",   subs: [{t:"키노트 슬라이드 14p", done:true},{t:"질의응답 시나리오", done:false}], starred: false },
  { id: "t3", title: "데일리 스탠드업 노트 정리",   done: false, priority: "medium", category: "work", subcategory: "Sprint 14", due: "오늘",       dueState: "today",   subs: [{t:"블로커 정리", done:false}] },
  { id: "t4", title: "타이포그래피 가이드 작성 (Pretendard)", done: true, priority: "medium", category: "study", due: "오늘 11:00", dueState: "today", subs: [{t:"본문 스케일 표", done:true},{t:"한영 혼용 예시", done:true}] },

  { id: "t5", title: "토스 카드 결제 자동이체 변경", done: false, priority: "high", category: "personal", due: "내일",   dueState: "soon", subs: [] },
  { id: "t6", title: "치과 정기검진 예약 (강남점)",   done: false, priority: "low",  category: "health",   due: "5월 18일", dueState: "soon", subs: [], starred: true },
  { id: "t7", title: "TOEIC 단어장 3챕터 마무리",     done: false, priority: "medium", category: "study", due: "5월 20일", dueState: "soon", subs: [{t:"챕터 1 복습", done:true},{t:"챕터 2 학습", done:true},{t:"챕터 3 학습", done:false}] },
  { id: "t8", title: "주말 등산용 새 등산화 알아보기", done: false, priority: "low",  category: "shopping",  due: "5월 22일", dueState: "soon", subs: [] },

  { id: "t9", title: "엄마 생신 선물 주문",          done: false, priority: "high", category: "personal", due: "5월 12일", dueState: "overdue", subs: [], starred: true },
  { id: "t10",title: "헬스장 PT 결제 갱신",            done: false, priority: "medium", category: "health", due: "5월 13일", dueState: "overdue", subs: [] },

  { id: "t11",title: "이번 주 회고 노션에 기록",        done: true, priority: "low", category: "work", due: "5월 14일", dueState: "past", subs: [] },
  { id: "t12",title: "분리수거 (재활용)",                done: true, priority: "low", category: "personal", due: "5월 14일", dueState: "past", subs: [] },
];

// Calendar events for May 2026
// May 1 (Fri) — May 31 (Sun); today = 2026-05-15 Fri
// We'll generate a 35-cell grid starting from previous month's last Sunday-week start
const CAL_MONTH = { year: 2026, month: 5, today: 15 };
const CAL_EVENTS = {
  3:  [{ t: "주간 회고",       c: "work" }],
  4:  [{ t: "Sprint 14 시작",   c: "work" }, { t: "치과 예약 확인",  c: "health" }],
  5:  [{ t: "어린이날 휴무",     c: "personal" }],
  6:  [{ t: "디자인 리뷰 10:30",c: "work" }],
  7:  [{ t: "Acme 미팅 14:00", c: "work" }, { t: "도서관 반납",  c: "study" }],
  8:  [{ t: "어버이날 식사 18:30", c: "personal" }],
  11: [{ t: "토스 자동이체 변경",   c: "personal", done: true }],
  12: [{ t: "엄마 생신 선물 주문", c: "personal" }],
  13: [{ t: "헬스장 PT 결제",   c: "health" }],
  14: [{ t: "주간 회고 기록",     c: "work", done: true }, { t: "분리수거",  c: "personal", done: true }],
  15: [{ t: "디자인 시스템 v2 리뷰 16:00", c: "work" }, { t: "Acme 미팅 14:30", c: "work" }, { t: "타이포 가이드 작성",  c: "study", done: true }],
  18: [{ t: "치과 검진 예약",    c: "health" }],
  19: [{ t: "Sprint 14 데모",     c: "work" }],
  20: [{ t: "TOEIC 챕터 3",      c: "study" }, { t: "회식 19:00",  c: "personal" }],
  21: [{ t: "분기 OKR 회의",      c: "work" }],
  22: [{ t: "등산화 구매",         c: "shopping" }, { t: "주말 등산 준비",  c: "personal" }],
  25: [{ t: "Sprint 15 킥오프",   c: "work" }],
  26: [{ t: "프로젝트 회고 11:00", c: "work" }],
  28: [{ t: "월말 정산",           c: "work" }, { t: "독서 모임",  c: "study" }],
  29: [{ t: "TOEIC 모의시험",     c: "study" }],
};

// Build a 6-week × 7-day matrix for the calendar grid.
// May 2026: May 1 is Friday. So first row has 5 leading days from April: 26,27,28,29,30 (Sun-Thu)
// then May 1 (Fri) and May 2 (Sat).
function buildCalendarCells() {
  const cells = [];
  // April 26-30 (Sun-Thu)
  for (let d = 26; d <= 30; d++) cells.push({ d, out: true, prev: true });
  // May 1-31
  for (let d = 1; d <= 31; d++) cells.push({ d, out: false });
  // June 1-6 to fill last row (35 cells total: 5 prev + 31 = 36, so we only need 4 trailing)
  // Total cells: 5 + 31 = 36 → need to fill to a multiple of 7. 42 - 36 = 6 trailing.
  for (let d = 1; d <= 6; d++) cells.push({ d, out: true, next: true });
  // Mark weekdays: column index 0=Sun, 6=Sat
  return cells.map((c, i) => ({ ...c, col: i % 7 }));
}
const CAL_CELLS = buildCalendarCells();

// Weekly stats (last 7 days, ending today Fri May 15)
const WEEK_STATS = [
  { d: "토", done: 4, pending: 1, today: false },
  { d: "일", done: 2, pending: 2, today: false },
  { d: "월", done: 7, pending: 1, today: false },
  { d: "화", done: 5, pending: 2, today: false },
  { d: "수", done: 6, pending: 0, today: false },
  { d: "목", done: 8, pending: 1, today: false },
  { d: "금", done: 3, pending: 4, today: true },
];

// Streak heatmap — last 12 weeks × 7 days; 0–4 intensity
function buildStreak() {
  const seed = [
    "0102232342",
    "1213342344",
    "0001122334",
    "2233442230",
    "0011224433",
    "1232434231",
    "0011232300",
    "1232343424",
  ];
  // 7 rows × 12 cols (84 cells)
  const rows = [];
  for (let r = 0; r < 7; r++) {
    const row = [];
    for (let c = 0; c < 12; c++) {
      const ch = seed[r % seed.length][c % seed[r % seed.length].length];
      row.push(parseInt(ch, 10));
    }
    rows.push(row);
  }
  return rows;
}
const STREAK = buildStreak();

const CATEGORY_USAGE = [
  { id: "work",     pct: 48, n: 142 },
  { id: "personal", pct: 22, n: 65 },
  { id: "study",    pct: 14, n: 41 },
  { id: "health",   pct: 10, n: 30 },
  { id: "shopping", pct: 6,  n: 18 },
];

Object.assign(window, {
  CATEGORIES, CAT, TODAY_LABEL, TODOS, CAL_MONTH, CAL_EVENTS, CAL_CELLS,
  WEEK_STATS, STREAK, CATEGORY_USAGE,
});
