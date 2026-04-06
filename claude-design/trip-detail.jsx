/* global React, useT, Avatar, AvatarStack, StatusBadge, Modal, Placeholder, MEMBERS, ACTIVE_TRIP, Logo, LangSwitcher */
const { useState, useMemo } = React;

function TripDetail({ onNav }) {
  const { t } = useT();
  const [tab, setTab] = useState("chat");
  const [votes, setVotes] = useState(ACTIVE_TRIP.votes);
  const [expenses, setExpenses] = useState(ACTIVE_TRIP.expenses);
  const [openDays, setOpenDays] = useState({ 1: true, 2: false, 3: false });
  const [expenseModal, setExpenseModal] = useState(false);

  const tabs = [
    { id: "chat", label: "Чат", glyph: "@" },
    { id: "summary", label: "Сводка", glyph: "S" },
    { id: "map", label: t("trip.tab.map"), glyph: "M" },
    { id: "itin", label: t("trip.tab.itin"), glyph: "I" },
    { id: "votes", label: t("trip.tab.votes"), glyph: "V" },
    { id: "budget", label: t("trip.tab.budget"), glyph: "B" },
    { id: "members", label: t("trip.tab.members"), glyph: "P" },
    { id: "final", label: "Итоги", glyph: "F" },
  ];

  const castVote = (vid, oid) => {
    setVotes(votes.map(v => {
      if (v.id !== vid || v.status === "resolved") return v;
      // remove previous
      let opts = v.options.map(o => v.myVote === o.id ? { ...o, votes: Math.max(0, o.votes - 1) } : o);
      // toggle off
      if (v.myVote === oid) return { ...v, myVote: null, options: opts };
      opts = opts.map(o => o.id === oid ? { ...o, votes: o.votes + 1 } : o);
      return { ...v, myVote: oid, options: opts };
    }));
  };

  const addExpense = (e) => {
    setExpenses([{ id: `e${Date.now()}`, ...e, date: "сегодня" }, ...expenses]);
    setExpenseModal(false);
  };

  return (
    <div className="fade-in" style={{ minHeight: "100vh", background: "var(--paper)", display: "flex" }}>
      {/* SIDEBAR — minimal */}
      <aside style={{
        width: 220, flexShrink: 0,
        borderRight: "1px solid var(--line)",
        background: "var(--paper)",
        padding: "20px 12px",
        display: "flex", flexDirection: "column", gap: 18,
        position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 6px" }}>
          <button onClick={() => onNav("dashboard")} title="Все поездки"
            style={{ width: 28, height: 28, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)", fontSize: 16 }}>←</button>
          <button onClick={() => onNav("dashboard")} style={{ flex: 1, textAlign: "left" }}>
            <Logo size={22} />
          </button>
        </div>

        <div style={{ padding: "0 8px" }}>
          <h2 style={{ fontSize: 17, lineHeight: 1.2, fontWeight: 600 }}>{ACTIVE_TRIP.title}</h2>
          <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{ACTIVE_TRIP.subtitle}</p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {tabs.map(tb => {
            const active = tab === tb.id;
            return (
              <button key={tb.id} onClick={() => setTab(tb.id)} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                background: active ? "var(--paper-2)" : "transparent",
                color: active ? "var(--ink)" : "var(--ink-2)",
                fontSize: 14, fontWeight: active ? 600 : 400,
                textAlign: "left",
                position: "relative",
              }}>
                {active && <span style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 2, borderRadius: 2, background: "var(--terracotta)" }} />}
                {tb.label}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", padding: "0 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Avatar id="me" size={26} ring={false} />
          <LangSwitcher />
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, minWidth: 0, padding: "32px 40px" }}>
        {tab === "chat" && <ChatTab />}
        {tab === "summary" && <SummaryTab onGoVotes={() => setTab("votes")} />}
        {tab === "map" && <MapTab />}
        {tab === "itin" && <ItineraryTab openDays={openDays} setOpenDays={setOpenDays} />}
        {tab === "votes" && <VotesTab votes={votes} castVote={castVote} />}
        {tab === "budget" && <BudgetTab expenses={expenses} onAdd={() => setExpenseModal(true)} />}
        {tab === "members" && <MembersTab />}
        {tab === "final" && <FinalTab />}
      </main>

      <AddExpenseModal open={expenseModal} onClose={() => setExpenseModal(false)} onAdd={addExpense} />
    </div>
  );
}

/* ============================================================
   MAP TAB — stylized illustrated map
   ============================================================ */
function MapTab() {
  const { t } = useT();
  const days = [
    { id: 1, color: "var(--terracotta)", label: "День 1 · Тбилиси" },
    { id: 2, color: "var(--teal)",       label: "День 2 · Кахетия" },
    { id: 3, color: "var(--moss)",       label: "День 3 · Казбеги" },
  ];
  const [activeDay, setActiveDay] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "calc(100vh - 64px)" }}>
      <TabHeader eyebrow="карта · 03 / 11 дней" title="Маршрут" italic="по дням" />

      <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
        {/* Map canvas */}
        <div style={{
          flex: 1, position: "relative",
          borderRadius: "var(--r-lg)", overflow: "hidden",
          border: "1px solid var(--line)",
          background: "linear-gradient(180deg, oklch(0.93 0.02 100) 0%, oklch(0.88 0.025 95) 100%)",
        }}>
          <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {/* Terrain — soft contours */}
            <defs>
              <pattern id="topo" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 20 Q 20 10 40 20" stroke="oklch(0.78 0.04 90)" strokeWidth="0.5" fill="none" />
                <path d="M 0 32 Q 20 22 40 32" stroke="oklch(0.78 0.04 90)" strokeWidth="0.5" fill="none" />
              </pattern>
            </defs>
            <rect width="800" height="600" fill="url(#topo)" />
            {/* Water */}
            <path d="M 0 380 Q 100 360 220 390 T 420 400 T 600 380 T 800 410 L 800 600 L 0 600 Z"
              fill="oklch(0.78 0.04 220)" opacity="0.55" />
            {/* Roads */}
            <path d="M 60 480 Q 180 360 320 340 T 540 220 T 720 120"
              stroke="oklch(0.50 0.02 80)" strokeWidth="2" fill="none" strokeDasharray="2 4" opacity="0.4" />
            {/* Day routes (3 segments) */}
            {/* Day 1 — Tbilisi cluster */}
            <g opacity={activeDay === null || activeDay === 1 ? 1 : 0.25}>
              <path d="M 130 460 L 170 440 L 200 450 L 230 430 L 210 470" stroke="var(--terracotta)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {[[130, 460], [170, 440], [200, 450], [230, 430], [210, 470]].map((p, i) => <Pin key={i} x={p[0]} y={p[1]} color="var(--terracotta)" n={i+1} />)}
            </g>
            {/* Day 2 — Tbilisi to Kahetia */}
            <g opacity={activeDay === null || activeDay === 2 ? 1 : 0.25}>
              <path d="M 230 430 Q 350 380 480 320" stroke="var(--teal)" strokeWidth="3" fill="none" strokeDasharray="6 4" strokeLinecap="round" />
              <Pin x={350} y={380} color="var(--teal)" n="2a" />
              <Pin x={480} y={320} color="var(--teal)" n="2b" />
            </g>
            {/* Day 3 — to Kazbegi */}
            <g opacity={activeDay === null || activeDay === 3 ? 1 : 0.25}>
              <path d="M 230 430 Q 300 280 540 220 T 720 120" stroke="var(--moss)" strokeWidth="3" fill="none" strokeDasharray="6 4" strokeLinecap="round" />
              <Pin x={540} y={220} color="var(--moss)" n="3a" />
              <Pin x={720} y={120} color="var(--moss)" n="3b" big />
            </g>

            {/* Mountain ornaments */}
            <g opacity="0.5">
              <path d="M 600 80 L 640 30 L 680 75 L 720 50 L 760 90 Z" fill="oklch(0.50 0.04 80)" />
              <path d="M 600 80 L 640 30 L 660 55 L 640 80" fill="oklch(0.40 0.04 80)" />
            </g>

            {/* Compass */}
            <g transform="translate(740 530)">
              <circle r="22" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
              <path d="M 0 -16 L 4 0 L 0 16 L -4 0 Z" fill="var(--terracotta)" />
              <text textAnchor="middle" dy="-18" fill="var(--ink)" style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>С</text>
            </g>
          </svg>

          {/* Map placeholder note */}
          <div style={{
            position: "absolute", top: 14, left: 14,
            background: "var(--paper)", border: "1px solid var(--line)",
            borderRadius: "var(--r-pill)",
            padding: "6px 12px",
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--ink-3)", letterSpacing: "0.06em",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--moss)", display: "inline-block", marginRight: 8 }} />
            mapbox · стилизованная карта
          </div>
          {/* Zoom controls */}
          <div style={{
            position: "absolute", bottom: 14, right: 14,
            display: "flex", flexDirection: "column",
            background: "var(--paper)", border: "1px solid var(--line)",
            borderRadius: "var(--r-md)",
            overflow: "hidden",
          }}>
            <button style={{ padding: "8px 12px", borderBottom: "1px solid var(--line)", fontSize: 16 }}>+</button>
            <button style={{ padding: "8px 12px", fontSize: 16 }}>−</button>
          </div>
        </div>

        {/* Day legend */}
        <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="card" style={{ padding: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>дни маршрута</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {days.map(d => (
                <button key={d.id}
                  onMouseEnter={() => setActiveDay(d.id)}
                  onMouseLeave={() => setActiveDay(null)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: "var(--r-md)",
                    background: activeDay === d.id ? "var(--paper-2)" : "transparent",
                    transition: "background 0.12s",
                    textAlign: "left",
                  }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                  <span style={{ fontSize: 13 }}>{d.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>сводка</div>
            <Stat label="точек на маршруте" value="14" />
            <Stat label="км в общей сложности" value="612" />
            <Stat label="ночёвки" value="9" />
          </div>
          <div className="card" style={{ padding: 16, background: "var(--ink)", color: "var(--paper)", border: "none" }}>
            <div className="eyebrow" style={{ color: "oklch(0.65 0.012 65)", marginBottom: 8 }}>совет</div>
            <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
              На <span style={{ color: "var(--terracotta-soft)" }}>третий день</span> заложите запас по времени — Военно-Грузинская дорога часто перекрыта.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pin({ x, y, color, n, big }) {
  const r = big ? 14 : 10;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={color} />
      <circle cx={x} cy={y} r={r - 3} fill="var(--paper)" />
      <text x={x} y={y + 3} textAnchor="middle" style={{ fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 700, fill: color }}>{n}</text>
    </g>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--line)" }}>
      <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{label}</span>
      <span className="mono" style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

/* ============================================================
   ITINERARY TAB
   ============================================================ */
function ItineraryTab({ openDays, setOpenDays }) {
  const { t } = useT();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <TabHeader eyebrow={`маршрут · ${ACTIVE_TRIP.itinerary.length} дней показано`} title="День за днём" italic="по часам" />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 880 }}>
        {ACTIVE_TRIP.itinerary.map((d) => (
          <DayCard key={d.day} day={d} open={openDays[d.day]} onToggle={() => setOpenDays({ ...openDays, [d.day]: !openDays[d.day] })} />
        ))}
        <button className="card" style={{
          padding: 18, border: "1.5px dashed var(--line-2)",
          background: "transparent", color: "var(--ink-2)",
          fontSize: 14, fontWeight: 500,
        }}>+ {t("trip.itin.add")}</button>
      </div>
    </div>
  );
}

function DayCard({ day, open, onToggle }) {
  const typeIcon = {
    flight: "✈", drive: "→", stay: "■", food: "▲", place: "●", walk: "→",
  };
  return (
    <article className="card" style={{ overflow: "hidden" }}>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 16,
        padding: 20, textAlign: "left",
      }}>
        <span style={{
          width: 56, height: 56, borderRadius: "var(--r-md)",
          background: "var(--ink)", color: "var(--paper)",
          display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span className="mono" style={{ fontSize: 9, opacity: 0.6, letterSpacing: "0.1em" }}>ДЕНЬ</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontStyle: "italic" }}>{day.day}</span>
        </span>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 22, marginBottom: 2 }}>{day.city}</h3>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}>
            {day.date} · {day.items.length} пунктов
          </div>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)", fontSize: 18 }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--line)" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {day.items.map((it, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "60px 28px 1fr",
                gap: 16, alignItems: "flex-start",
                padding: "16px 0",
                borderBottom: i < day.items.length - 1 ? "1px dashed var(--line)" : "none",
              }}>
                <span className="mono" style={{ fontSize: 13, color: "var(--ink-2)", paddingTop: 2 }}>{it.time}</span>
                <span style={{
                  width: 28, height: 28,
                  background: "var(--paper-2)",
                  border: "1px solid var(--line)",
                  borderRadius: "50%",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "var(--terracotta)",
                }}>{typeIcon[it.type] || "•"}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{it.title}</div>
                  {it.note && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{it.note}</div>}
                </div>
              </div>
            ))}
            <button style={{
              padding: "10px 0", textAlign: "left",
              fontSize: 13, color: "var(--terracotta)",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>+ Добавить пункт в этот день</button>
          </div>
        </div>
      )}
    </article>
  );
}

/* ============================================================
   VOTES TAB
   ============================================================ */
function VotesTab({ votes, castVote }) {
  const { t } = useT();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <TabHeader eyebrow={`голосования · ${votes.filter(v => v.status === "open").length} активных`} title="Решаем" italic="вместе" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16, maxWidth: 1100 }}>
        {votes.map(v => <VoteCard key={v.id} vote={v} onVote={(oid) => castVote(v.id, oid)} />)}
        <button className="card" style={{
          padding: 24, border: "1.5px dashed var(--line-2)", background: "transparent",
          minHeight: 220, color: "var(--ink-2)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          <span style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "var(--paper-2)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontFamily: "var(--font-display)",
          }}>+</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{t("trip.votes.add")}</span>
        </button>
      </div>
    </div>
  );
}

function VoteCard({ vote, onVote }) {
  const { t } = useT();
  const total = vote.options.reduce((a, b) => a + b.votes, 0) || 1;
  const isResolved = vote.status === "resolved";
  return (
    <article className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>от {vote.author}</div>
          <h3 style={{ fontSize: 20, lineHeight: 1.2 }}>{vote.title}</h3>
        </div>
        {isResolved
          ? <span className="badge" style={{ color: "var(--moss)" }}><span className="dot" />{t("trip.votes.resolved")}</span>
          : <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{total} {total === 1 ? "голос" : "голоса"}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {vote.options.map((o) => {
          const pct = Math.round((o.votes / total) * 100);
          const isMy = vote.myVote === o.id;
          const isWinner = isResolved && o.votes === Math.max(...vote.options.map(x => x.votes));
          return (
            <button key={o.id} onClick={() => !isResolved && onVote(o.id)} disabled={isResolved}
              style={{
                position: "relative",
                padding: "12px 14px",
                borderRadius: "var(--r-md)",
                border: `1px solid ${isMy || isWinner ? "var(--terracotta)" : "var(--line)"}`,
                background: "var(--paper)",
                textAlign: "left",
                overflow: "hidden",
                cursor: isResolved ? "default" : "pointer",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={e => { if (!isResolved && !isMy) e.currentTarget.style.background = "var(--paper-2)"; }}
              onMouseLeave={e => { if (!isResolved && !isMy) e.currentTarget.style.background = "var(--paper)"; }}
            >
              <div style={{
                position: "absolute", inset: 0,
                width: `${pct}%`,
                background: isMy || isWinner ? "oklch(from var(--terracotta) l c h / 0.15)" : "oklch(from var(--ink) l c h / 0.05)",
                transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }} />
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: isMy || isWinner ? 500 : 400 }}>
                  {isMy && <span style={{ color: "var(--terracotta)", marginRight: 6 }}>✓</span>}
                  {o.label}
                </span>
                <span className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>{pct}% · {o.votes}</span>
              </div>
            </button>
          );
        })}
      </div>
      {!isResolved && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6 }}>
          <AvatarStack ids={vote.myVote ? ["me", "m1"] : ["m1", "m2"]} size={22} max={4} />
          <span className="mono" style={{ fontSize: 11, color: vote.myVote ? "var(--terracotta)" : "var(--ink-3)" }}>
            {vote.myVote ? `✓ ${t("trip.votes.voted").toLowerCase()}` : "вы ещё не голосовали"}
          </span>
        </div>
      )}
      {isResolved && vote.resolution && (
        <div style={{
          padding: "10px 12px", borderRadius: "var(--r-md)",
          background: "oklch(from var(--moss) l c h / 0.12)",
          color: "var(--moss)", fontSize: 13, fontWeight: 500,
        }}>→ {vote.resolution}</div>
      )}
    </article>
  );
}

/* ============================================================
   BUDGET TAB
   ============================================================ */
function BudgetTab({ expenses, onAdd }) {
  const { t } = useT();
  const total = expenses.reduce((a, b) => a + b.amount, 0);
  const perPerson = Math.round(total / 4);

  // balance: how much each member is owed/owes
  const balances = useMemo(() => {
    const ids = ["me", "m1", "m2", "m3"];
    const bal = Object.fromEntries(ids.map(id => [id, 0]));
    expenses.forEach(e => {
      const share = e.amount / e.split.length;
      e.split.forEach(s => { bal[s] -= share; });
      bal[e.payer] += e.amount;
    });
    return bal;
  }, [expenses]);

  const myBalance = balances.me;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <TabHeader eyebrow={`бюджет · ${expenses.length} расход.`} title="Деньги" italic="без споров"
        action={<button onClick={onAdd} className="btn btn-primary">+ {t("trip.budget.add")}</button>}
      />

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", gap: 12 }}>
        <div className="card" style={{ padding: 24, background: "var(--ink)", color: "var(--paper)", border: "none" }}>
          <div className="eyebrow" style={{ color: "oklch(0.65 0.012 65)", marginBottom: 14 }}>{t("trip.budget.total")}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 64, lineHeight: 1, fontStyle: "italic" }}>
              {total.toLocaleString("ru")}
            </span>
            <span className="mono" style={{ fontSize: 14, opacity: 0.6 }}>₽</span>
          </div>
          <div className="mono" style={{ fontSize: 11, color: "oklch(0.75 0.012 65)", marginTop: 16, letterSpacing: "0.06em" }}>
            ~ {perPerson.toLocaleString("ru")} ₽ {t("trip.budget.perPerson")}
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{t("trip.budget.balance")}</div>
          {Math.abs(myBalance) < 1 ? (
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--moss)" }}>{t("trip.budget.settled")}</div>
          ) : (
            <>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 36,
                color: myBalance > 0 ? "var(--moss)" : "var(--terracotta)",
                fontStyle: "italic",
              }}>
                {myBalance > 0 ? "+" : ""}{Math.round(myBalance).toLocaleString("ru")} ₽
              </div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8, letterSpacing: "0.06em" }}>
                {myBalance > 0 ? t("trip.budget.owesYou") : t("trip.budget.youOwe")}
              </div>
            </>
          )}
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>по участникам</div>
          {Object.entries(balances).map(([id, b]) => (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
              <Avatar id={id} size={24} ring={false} />
              <span style={{ flex: 1, fontSize: 13 }}>{MEMBERS.find(m=>m.id===id)?.name}</span>
              <span className="mono" style={{ fontSize: 12, color: b >= 0 ? "var(--moss)" : "var(--terracotta)" }}>
                {b >= 0 ? "+" : ""}{Math.round(b).toLocaleString("ru")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Expense list */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "60px 1fr 120px 200px 100px",
          padding: "14px 20px", borderBottom: "1px solid var(--line)",
          background: "var(--paper-2)",
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)",
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          <span>дата</span>
          <span>расход</span>
          <span>кто платил</span>
          <span>поделено</span>
          <span style={{ textAlign: "right" }}>сумма</span>
        </div>
        {expenses.map((e, i) => (
          <div key={e.id} style={{
            display: "grid", gridTemplateColumns: "60px 1fr 120px 200px 100px",
            padding: "16px 20px", borderBottom: i < expenses.length - 1 ? "1px solid var(--line)" : "none",
            alignItems: "center", fontSize: 14,
          }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{e.date}</span>
            <span style={{ fontWeight: 500 }}>{e.title}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Avatar id={e.payer} size={22} ring={false} />
              <span style={{ fontSize: 13 }}>{MEMBERS.find(m=>m.id===e.payer)?.name}</span>
            </span>
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              <AvatarStack ids={e.split} size={22} max={5} />
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 8 }}>×{e.split.length}</span>
            </span>
            <span className="mono" style={{ textAlign: "right", fontSize: 14, fontWeight: 600 }}>{e.amount.toLocaleString("ru")} ₽</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddExpenseModal({ open, onClose, onAdd }) {
  const { t } = useT();
  const [form, setForm] = useState({ title: "", amount: "", payer: "me", split: ["me","m1","m2","m3"] });
  React.useEffect(() => { if (open) setForm({ title: "", amount: "", payer: "me", split: ["me","m1","m2","m3"] }); }, [open]);
  const toggleSplit = (id) => {
    setForm(f => ({ ...f, split: f.split.includes(id) ? f.split.filter(x => x !== id) : [...f.split, id] }));
  };
  const valid = form.title.trim() && Number(form.amount) > 0 && form.split.length > 0;
  const submit = () => {
    onAdd({ title: form.title, amount: Number(form.amount), payer: form.payer, split: form.split });
  };
  return (
    <Modal open={open} onClose={onClose} title="Новый расход" subtitle="Делим автоматически между выбранными участниками.">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className="label">{t("trip.budget.expense")}</label>
          <input className="input" placeholder="Например: бензин" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="label">{t("trip.budget.amount")}</label>
          <input className="input" type="number" placeholder="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
        </div>
        <div>
          <label className="label">{t("trip.budget.payer")}</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ACTIVE_TRIP.members.map(id => {
              const m = MEMBERS.find(x => x.id === id);
              const sel = form.payer === id;
              return (
                <button key={id} onClick={() => setForm({ ...form, payer: id })} style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "6px 12px 6px 6px", borderRadius: "var(--r-pill)",
                  border: `1px solid ${sel ? "var(--terracotta)" : "var(--line)"}`,
                  background: sel ? "oklch(from var(--terracotta) l c h / 0.1)" : "var(--paper)",
                  fontSize: 13, fontWeight: sel ? 500 : 400,
                }}>
                  <Avatar id={id} size={24} ring={false} />
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="label">{t("trip.budget.split")}</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ACTIVE_TRIP.members.map(id => {
              const m = MEMBERS.find(x => x.id === id);
              const sel = form.split.includes(id);
              return (
                <button key={id} onClick={() => toggleSplit(id)} style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "6px 12px 6px 6px", borderRadius: "var(--r-pill)",
                  border: `1px solid ${sel ? "var(--ink)" : "var(--line)"}`,
                  background: sel ? "var(--paper-2)" : "var(--paper)",
                  fontSize: 13, opacity: sel ? 1 : 0.55,
                }}>
                  <Avatar id={id} size={24} ring={false} />
                  {m.name}
                </button>
              );
            })}
          </div>
          {form.split.length > 0 && Number(form.amount) > 0 && (
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}>
              ≈ {Math.round(Number(form.amount) / form.split.length).toLocaleString("ru")} ₽ с человека
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
        <button className="btn btn-ghost" onClick={onClose}>{t("common.cancel")}</button>
        <button className="btn btn-primary" disabled={!valid} style={{ opacity: valid ? 1 : 0.4 }} onClick={submit}>{t("common.add")}</button>
      </div>
    </Modal>
  );
}

/* ============================================================
   MEMBERS TAB
   ============================================================ */
function MembersTab() {
  const { t } = useT();
  const roster = [
    { id: "me", role: "owner", joined: "12.05", places: 5 },
    { id: "m1", role: "member", joined: "13.05", places: 3 },
    { id: "m2", role: "member", joined: "14.05", places: 4 },
    { id: "m3", role: "member", joined: "16.05", places: 2 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <TabHeader eyebrow={`участники · ${roster.length} / 6`} title="Команда" italic="поездки"
        action={<button className="btn btn-primary">+ {t("trip.members.invite")}</button>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, maxWidth: 1100 }}>
        {roster.map(r => {
          const m = MEMBERS.find(x => x.id === r.id);
          return (
            <div key={r.id} className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar id={r.id} size={48} ring={false} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{m.name}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}>
                  с {r.joined} · {r.places} мест добавлено
                </div>
              </div>
              <span className="badge" style={{ color: r.role === "owner" ? "var(--terracotta)" : "var(--ink-3)" }}>
                <span className="dot" />
                {r.role === "owner" ? t("trip.members.role.owner") : t("trip.members.role.member")}
              </span>
            </div>
          );
        })}
        <button className="card" style={{
          padding: 20, border: "1.5px dashed var(--line-2)",
          background: "transparent", color: "var(--ink-2)",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <span style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "var(--paper-2)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontFamily: "var(--font-display)",
          }}>+</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{t("trip.members.invite")}</span>
        </button>
      </div>

      {/* Invite link */}
      <div className="card" style={{ padding: 20, background: "var(--paper-2)" }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>ссылка-приглашение</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <code style={{
            flex: 1, padding: "10px 14px",
            background: "var(--paper)", border: "1px solid var(--line)",
            borderRadius: "var(--r-md)",
            fontFamily: "var(--font-mono)", fontSize: 12,
            color: "var(--ink-2)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>journey.app/join/k7-georgia-2026-9af</code>
          <button className="btn btn-ghost btn-sm">копировать</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Tab header utility
   ============================================================ */
function TabHeader({ eyebrow, title, italic, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, paddingBottom: 16, borderBottom: "1px solid var(--line)" }}>
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1 style={{ fontSize: 56, marginTop: 8, lineHeight: 1.0 }}>
          {title} <span className="display-italic" style={{ color: "var(--terracotta)" }}>{italic}</span>
        </h1>
      </div>
      {action}
    </div>
  );
}

window.TripDetail = TripDetail;
