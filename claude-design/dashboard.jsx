/* global React, useT, Avatar, AvatarStack, StatusBadge, Modal, MEMBERS, TRIPS, Logo, LangSwitcher */
const { useState } = React;

function Dashboard({ onNav, onOpenTrip }) {
  const { t } = useT();
  const [filter, setFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [trips, setTrips] = useState(TRIPS);

  const filtered = trips.filter(tr => filter === "all" || tr.status === filter);

  return (
    <div className="fade-in" style={{ minHeight: "100vh", background: "var(--paper)" }}>
      {/* Top bar */}
      <header style={{
        borderBottom: "1px solid var(--line)",
        background: "oklch(from var(--paper) l c h / 0.85)",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{
          maxWidth: 1320, margin: "0 auto",
          padding: "16px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <button onClick={() => onNav("landing")}><Logo /></button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button className="btn btn-ghost btn-sm" style={{ padding: "8px 12px" }}>🔔</button>
            <LangSwitcher />
            <Avatar id="me" size={36} ring={false} />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "40px 32px" }}>
        {/* Greeting */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, gap: 24, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 36, lineHeight: 1.1, fontWeight: 600 }}>
            {t("dash.greet")}, <span className="display-italic" style={{ color: "var(--terracotta)" }}>Аня</span>
          </h1>
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            + {t("nav.create")}
          </button>
        </div>

        {/* Filters */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { id: "all", label: t("dash.filter.all"), count: trips.length },
              { id: "planning", label: t("dash.filter.planning"), count: trips.filter(x=>x.status==="planning").length },
              { id: "active", label: t("dash.filter.active"), count: trips.filter(x=>x.status==="active").length },
              { id: "done", label: t("dash.filter.done"), count: trips.filter(x=>x.status==="done").length },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{
                padding: "6px 14px",
                borderRadius: 999,
                background: filter === f.id ? "var(--paper-2)" : "transparent",
                color: filter === f.id ? "var(--ink)" : "var(--ink-3)",
                fontSize: 13,
                fontWeight: filter === f.id ? 500 : 400,
              }}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input className="input" placeholder={t("common.search") + "..."} style={{ width: 240, padding: "8px 14px", fontSize: 13 }} />
          </div>
        </div>

        {/* Trip grid or empty */}
        {filtered.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20,
          }}>
            {filtered.map((tr, i) => (
              <TripCard key={tr.id} trip={tr} index={i} onOpen={() => onOpenTrip(tr.id)} />
            ))}
            <NewTripCard onClick={() => setCreateOpen(true)} />
          </div>
        )}
      </main>

      <CreateTripModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(t) => {
          const newTrip = { ...t, id: `t${Date.now()}`, status: "planning", members: ["me"], cover: t.cover || "новая поездка" };
          setTrips([newTrip, ...trips]);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

function TripCard({ trip, index, onOpen }) {
  const tints = [
    "linear-gradient(135deg, oklch(0.55 0.10 200), oklch(0.35 0.06 215))",
    "linear-gradient(135deg, oklch(0.62 0.135 40), oklch(0.42 0.12 30))",
    "linear-gradient(135deg, oklch(0.50 0.07 145), oklch(0.35 0.06 160))",
    "linear-gradient(135deg, oklch(0.40 0.04 60), oklch(0.25 0.02 50))",
  ];
  const stripeColor = ["oklch(0.42 0.12 38)", "oklch(0.30 0.04 220)", "oklch(0.32 0.06 145)", "oklch(0.18 0.02 60)"];
  const tint = tints[index % tints.length];
  const sc = stripeColor[index % stripeColor.length];
  return (
    <article onClick={onOpen} className="card" style={{
      cursor: "pointer",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      transition: "transform 0.18s ease, box-shadow 0.18s ease",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      {/* Cover — clean color block */}
      <div style={{
        height: 120,
        background: tint,
        position: "relative",
      }}>
        {trip.status === "active" && (
          <span style={{
            position: "absolute", top: 12, left: 14,
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 9px", borderRadius: 999,
            background: "oklch(1 0 0 / 0.18)", backdropFilter: "blur(8px)",
            color: "var(--paper)", fontSize: 11,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "oklch(0.78 0.13 145)" }} />
            в пути
          </span>
        )}
      </div>
      {/* Body */}
      <div style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 19, marginBottom: 4, fontWeight: 600 }}>{trip.title}</h3>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>{trip.dest} · {trip.dates}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <AvatarStack ids={trip.members} size={22} max={5} />
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{trip.days} дней</span>
        </div>
      </div>
    </article>
  );
}

function NewTripCard({ onClick }) {
  return (
    <button onClick={onClick} style={{
      border: "1.5px dashed var(--line-2)",
      borderRadius: "var(--r-lg)",
      background: "transparent",
      minHeight: 220,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 10, color: "var(--ink-3)",
      transition: "background 0.15s, border-color 0.15s, color 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "var(--paper-2)"; e.currentTarget.style.borderColor = "var(--terracotta)"; e.currentTarget.style.color = "var(--terracotta)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.borderColor = ""; e.currentTarget.style.color = "var(--ink-3)"; }}
    >
      <span style={{ fontSize: 28, fontWeight: 300, lineHeight: 1 }}>+</span>
      <span style={{ fontSize: 14 }}>Новая поездка</span>
    </button>
  );
}

function EmptyState({ onCreate }) {
  const { t } = useT();
  return (
    <div style={{
      padding: "80px 32px",
      textAlign: "center",
      border: "1px dashed var(--line-2)",
      borderRadius: "var(--r-xl)",
      background: "var(--paper-2)",
    }}>
      <svg width="120" height="80" viewBox="0 0 120 80" style={{ marginBottom: 24 }}>
        <path d="M10 60 L 30 30 L 50 50 L 75 25 L 110 60 L 110 70 L 10 70 Z" fill="var(--paper-3)" stroke="var(--line-2)" />
        <circle cx="90" cy="22" r="8" fill="var(--terracotta)" opacity="0.6" />
        <path d="M20 65 Q 50 50 80 60 T 105 60" stroke="var(--terracotta)" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
      </svg>
      <h3 style={{ fontSize: 32, marginBottom: 8 }}>{t("dash.empty.h")}</h3>
      <p style={{ color: "var(--ink-2)", maxWidth: 420, margin: "0 auto 24px" }}>{t("dash.empty.d")}</p>
      <button className="btn btn-primary" onClick={onCreate}>+ {t("nav.create")}</button>
    </div>
  );
}

function CreateTripModal({ open, onClose, onCreate }) {
  const { t } = useT();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title: "", dest: "", dateFrom: "", dateTo: "", cover: "" });

  React.useEffect(() => { if (open) { setStep(0); setForm({ title: "", dest: "", dateFrom: "", dateTo: "", cover: "" }); } }, [open]);

  const canNext = step === 0 ? form.title.trim() && form.dest.trim() : form.dateFrom && form.dateTo;
  const submit = () => {
    onCreate({
      title: form.title,
      dest: form.dest,
      dates: `${form.dateFrom} — ${form.dateTo}`,
      cover: form.cover,
      days: 7,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={t("dash.create.h")} subtitle={t("dash.create.sub")} width={560}>
      {/* Step indicator */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            flex: 1, height: 3,
            background: i <= step ? "var(--terracotta)" : "var(--paper-3)",
            borderRadius: 999, transition: "background 0.2s",
          }} />
        ))}
      </div>

      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="label">{t("common.title")}</label>
            <input className="input" placeholder="Например: Грузия, июнь" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">{t("dash.create.dest")}</label>
            <input className="input" placeholder={t("common.placeholder.dest")} value={form.dest} onChange={e => setForm({ ...form, dest: e.target.value })} />
          </div>
          <div>
            <label className="label">{t("dash.create.cover")} <span className="mono" style={{ color: "var(--ink-3)", fontSize: 11 }}>· {t("dash.create.cover.hint")}</span></label>
            <div className="imgph" style={{ height: 120, cursor: "pointer" }}>
              <span className="imgph-label">перетащите фото · или нажмите</span>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="label">{t("common.date")}</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr", gap: 8, alignItems: "center" }}>
              <input className="input" type="date" value={form.dateFrom} onChange={e => setForm({ ...form, dateFrom: e.target.value })} />
              <span style={{ textAlign: "center", color: "var(--ink-3)" }}>→</span>
              <input className="input" type="date" value={form.dateTo} onChange={e => setForm({ ...form, dateTo: e.target.value })} />
            </div>
          </div>
          <MiniCalendar />
          <div style={{
            background: "var(--paper-2)", padding: 16, borderRadius: "var(--r-md)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <Avatar id="me" size={32} ring={false} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Вы — организатор</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>друзей пригласите внутри поездки</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
        <button className="btn btn-ghost" onClick={step === 0 ? onClose : () => setStep(0)}>
          {step === 0 ? t("common.cancel") : "← Назад"}
        </button>
        {step === 0 ? (
          <button className="btn btn-primary" disabled={!canNext} onClick={() => setStep(1)} style={{ opacity: canNext ? 1 : 0.4 }}>
            Дальше →
          </button>
        ) : (
          <button className="btn btn-primary" disabled={!canNext} onClick={submit} style={{ opacity: canNext ? 1 : 0.4 }}>
            {t("dash.create.cta")}
          </button>
        )}
      </div>
    </Modal>
  );
}

function MiniCalendar() {
  // Simple decorative June 2026 calendar showing a selected range
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const selStart = 12, selEnd = 22;
  return (
    <div style={{ background: "var(--paper-2)", padding: 16, borderRadius: "var(--r-md)" }}>
      <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 10, letterSpacing: "0.06em" }}>июнь 2026</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, fontSize: 11 }}>
        {["п","в","с","ч","п","с","в"].map((d, i) => <div key={i} className="mono" style={{ textAlign: "center", color: "var(--ink-3)" }}>{d}</div>)}
        {days.map(d => {
          const inRange = d >= selStart && d <= selEnd;
          const isEdge = d === selStart || d === selEnd;
          return (
            <div key={d} className="mono" style={{
              textAlign: "center",
              padding: "6px 0",
              background: isEdge ? "var(--terracotta)" : inRange ? "oklch(from var(--terracotta) l c h / 0.18)" : "transparent",
              color: isEdge ? "var(--paper)" : "var(--ink)",
              borderRadius: 6,
              fontWeight: isEdge ? 600 : 400,
            }}>{d}</div>
          );
        })}
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
