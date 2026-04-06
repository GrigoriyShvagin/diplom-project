/* global React, AvatarStack, MEMBERS */
const { useState } = React;

/* ============================================================
   Variation building blocks
   Each variation is wrapped in an isolated theme scope so
   palettes don't leak across artboards.
   ============================================================ */

function ThemeScope({ palette = "adventure", typeset = "editorial", children, style }) {
  return (
    <div data-palette={palette} data-typeset={typeset} style={{
      width: "100%", height: "100%",
      background: "var(--paper)",
      color: "var(--ink)",
      fontFamily: "var(--font-body)",
      ...style,
    }}>{children}</div>
  );
}

/* ---- HERO VARIATIONS ---- */

function HeroEditorial() {
  return (
    <ThemeScope palette="adventure" typeset="editorial" style={{ padding: 56, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 56 }}>
        <span className="eyebrow">friends journey · 01</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>v.editorial</span>
      </div>
      <h1 style={{ fontSize: 132, lineHeight: 0.92, marginBottom: 32, letterSpacing: "-0.025em" }}>
        Планируйте<br />поездки <span style={{ fontStyle: "italic", color: "var(--terracotta)" }}>вместе</span>
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 56, alignItems: "end" }}>
        <p style={{ fontSize: 22, lineHeight: 1.45, color: "var(--ink-2)", maxWidth: 540, margin: 0 }}>
          Карта, маршрут, голосования и расходы — в одном месте. Для групп от двух до шести человек.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button className="btn btn-primary btn-lg">Создать поездку →</button>
          <button className="btn btn-ghost btn-lg">Войти</button>
        </div>
      </div>
      <div style={{ marginTop: 56, height: 280, borderRadius: "var(--r-xl)", overflow: "hidden", border: "1px solid var(--line-2)", position: "relative", background: "linear-gradient(180deg, oklch(0.78 0.04 220), oklch(0.50 0.07 200))" }}>
        <svg viewBox="0 0 800 280" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <circle cx="640" cy="80" r="50" fill="oklch(0.86 0.10 75)" opacity="0.7" />
          <path d="M 0 200 L 100 130 L 220 170 L 380 110 L 540 170 L 700 130 L 800 170 L 800 280 L 0 280 Z" fill="var(--terracotta)" opacity="0.85" />
          <path d="M 0 240 L 140 200 L 320 230 L 480 200 L 700 220 L 800 210 L 800 280 L 0 280 Z" fill="oklch(0.20 0.04 220)" opacity="0.75" />
          <path d="M 60 245 Q 200 220 360 235 T 740 230" stroke="var(--paper)" strokeWidth="2" fill="none" strokeDasharray="3 4" />
        </svg>
      </div>
    </ThemeScope>
  );
}

function HeroSplit() {
  return (
    <ThemeScope palette="sunset" typeset="modern" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr" }}>
      <div style={{ padding: 48, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <span className="eyebrow">friends journey · 02</span>
        <div>
          <h1 style={{ fontSize: 84, lineHeight: 1.0, fontWeight: 600, letterSpacing: "-0.03em", marginBottom: 20 }}>
            Куда едем<br />в этот раз?
          </h1>
          <p style={{ fontSize: 18, color: "var(--ink-2)", maxWidth: 420, marginBottom: 28 }}>
            Соберите идеи группы в один маршрут. Голосуйте, спорьте, делите счёт.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-lg">Создать поездку</button>
            <button className="btn btn-ghost btn-lg">Посмотреть пример</button>
          </div>
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em" }}>
          ▸ 1 200+ совместных маршрутов
        </div>
      </div>
      <div style={{ position: "relative", overflow: "hidden", background: "var(--terracotta)" }}>
        <svg viewBox="0 0 600 700" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs>
            <pattern id="hsplit" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="14" height="14" fill="oklch(0.42 0.12 38)" />
              <rect width="1" height="14" fill="oklch(0.30 0.08 38)" />
            </pattern>
          </defs>
          <rect width="600" height="700" fill="url(#hsplit)" />
          <circle cx="320" cy="240" r="120" fill="var(--paper)" opacity="0.94" />
          <path d="M 320 180 L 320 300 M 280 240 L 360 240 M 200 240 Q 260 180 320 180 Q 380 180 440 240 Q 380 300 320 300 Q 260 300 200 240 Z" stroke="oklch(0.20 0.02 30)" strokeWidth="2" fill="none" />
          <path d="M 80 600 Q 220 540 380 580 T 560 560" stroke="var(--paper)" strokeWidth="2" fill="none" strokeDasharray="4 5" />
          {[[100, 595], [240, 560], [400, 575], [540, 560]].map(([x,y], i) => (
            <g key={i}><circle cx={x} cy={y} r="6" fill="var(--paper)" /><circle cx={x} cy={y} r="3" fill="var(--terracotta)" /></g>
          ))}
        </svg>
        <div style={{ position: "absolute", bottom: 20, left: 20, color: "var(--paper)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em" }}>tbilisi → kazbegi · 612 км</div>
      </div>
    </ThemeScope>
  );
}

function HeroAlpine() {
  return (
    <ThemeScope palette="alpine" typeset="rounded" style={{ padding: 0, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, oklch(0.32 0.05 215) 0%, oklch(0.20 0.04 220) 100%)", color: "var(--paper)" }}>
      <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.4 }}>
        <path d="M 0 500 L 200 280 L 380 380 L 560 220 L 760 360 L 960 240 L 1200 340 L 1200 700 L 0 700 Z" fill="oklch(0.45 0.04 215)" />
        <path d="M 0 600 L 240 420 L 460 500 L 700 380 L 920 480 L 1200 420 L 1200 700 L 0 700 Z" fill="oklch(0.30 0.04 220)" />
        {/* Stars */}
        {Array.from({ length: 18 }).map((_, i) => <circle key={i} cx={50 + (i * 67) % 1100} cy={30 + (i * 23) % 180} r="1.5" fill="var(--paper)" opacity="0.5" />)}
      </svg>
      <div style={{ position: "relative", padding: 64, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <span className="eyebrow" style={{ color: "oklch(0.85 0.04 215)" }}>friends journey · 03</span>
          <h1 style={{ fontSize: 110, lineHeight: 0.95, fontWeight: 400, marginTop: 24, letterSpacing: "-0.025em", color: "var(--paper)" }}>
            Туда, где<br /><span style={{ fontStyle: "italic", color: "var(--terracotta)" }}>тише</span> всего
          </h1>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, alignItems: "end" }}>
          <p style={{ fontSize: 16, lineHeight: 1.5, color: "oklch(0.85 0.04 215)", margin: 0 }}>
            Платформа для друзей, у которых план — это не таблица, а живая карта.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn btn-primary btn-lg" style={{ justifyContent: "space-between" }}>Создать поездку →</button>
            <button className="btn btn-ghost btn-lg" style={{ borderColor: "oklch(0.45 0.04 215)", color: "var(--paper)", justifyContent: "space-between" }}>Войти →</button>
          </div>
          <div className="mono" style={{ fontSize: 10, color: "oklch(0.65 0.04 215)", letterSpacing: "0.08em" }}>
            <div style={{ marginBottom: 4 }}>▸ карта</div>
            <div style={{ marginBottom: 4 }}>▸ маршрут</div>
            <div style={{ marginBottom: 4 }}>▸ бюджет</div>
            <div>▸ голосования</div>
          </div>
        </div>
      </div>
    </ThemeScope>
  );
}

/* ---- TRIP CARD VARIATIONS ---- */

function TripCardA() {
  // Photo-cover with floating badges
  return (
    <ThemeScope palette="adventure" style={{ padding: 28, background: "var(--paper-2)" }}>
      <span className="eyebrow" style={{ marginBottom: 16, display: "block" }}>card · photo cover</span>
      <article className="card" style={{ overflow: "hidden", maxWidth: 360 }}>
        <div style={{ height: 200, position: "relative", background: "linear-gradient(135deg, oklch(0.62 0.135 40), oklch(0.42 0.12 30))" }}>
          <svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <circle cx="280" cy="60" r="32" fill="oklch(0.86 0.10 75)" opacity="0.55" />
            <path d="M 0 140 L 70 100 L 150 130 L 230 90 L 290 120 L 360 100 L 360 200 L 0 200 Z" fill="oklch(0.30 0.04 220)" opacity="0.7" />
            <path d="M 0 180 L 100 150 L 200 170 L 320 155 L 360 165 L 360 200 L 0 200 Z" fill="oklch(0.20 0.02 60)" opacity="0.6" />
          </svg>
          <span className="badge" style={{ position: "absolute", top: 14, left: 14, color: "var(--paper)", borderColor: "var(--paper)", background: "oklch(0.20 0.02 60 / 0.4)" }}>
            <span className="dot" />ПЛАНИРУЕТСЯ
          </span>
        </div>
        <div style={{ padding: 22 }}>
          <h3 style={{ fontSize: 26, marginBottom: 4 }}>Грузия: вино и горы</h3>
          <p style={{ fontSize: 13, color: "var(--ink-2)", margin: 0 }}>Тбилиси → Кахетия → Казбеги</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: "1px dashed var(--line)" }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>12 — 22 июня · 10д</span>
            <AvatarStack ids={["me","m1","m2","m3"]} size={26} max={4} />
          </div>
        </div>
      </article>
    </ThemeScope>
  );
}

function TripCardB() {
  // Wide horizontal — minimal, type-led
  return (
    <ThemeScope palette="sunset" typeset="modern" style={{ padding: 28, background: "var(--paper-2)" }}>
      <span className="eyebrow" style={{ marginBottom: 16, display: "block" }}>card · type-led</span>
      <article className="card" style={{ padding: 24, maxWidth: 480, display: "flex", gap: 20, alignItems: "stretch" }}>
        <div style={{ width: 80, flexShrink: 0, background: "var(--terracotta)", borderRadius: "var(--r-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--paper)" }}>
          <span className="mono" style={{ fontSize: 9, opacity: 0.7, letterSpacing: "0.1em" }}>ИЮН</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 38, fontStyle: "italic", lineHeight: 1 }}>12</span>
          <span className="mono" style={{ fontSize: 9, opacity: 0.7 }}>10 дн.</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <h3 style={{ fontSize: 22, fontWeight: 600 }}>Грузия: вино и горы</h3>
              <span className="badge" style={{ color: "var(--teal)" }}><span className="dot" />план</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "6px 0 0" }}>Тбилиси → Кахетия → Казбеги</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <AvatarStack ids={["me","m1","m2","m3"]} size={26} max={4} />
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>14 точек · 612км</span>
          </div>
        </div>
      </article>
    </ThemeScope>
  );
}

function TripCardC() {
  // Itinerary preview embedded
  return (
    <ThemeScope palette="alpine" style={{ padding: 28, background: "var(--paper-2)" }}>
      <span className="eyebrow" style={{ marginBottom: 16, display: "block" }}>card · itinerary peek</span>
      <article className="card" style={{ padding: 22, maxWidth: 360 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 22 }}>Грузия: вино и горы</h3>
            <p style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>10 дней · 4 человека</p>
          </div>
          <span className="badge" style={{ color: "var(--terracotta)" }}><span className="dot" />план</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          {[
            { d: "12.06", c: "Тбилиси",       n: 5 },
            { d: "13.06", c: "Кахетия",       n: 4 },
            { d: "14.06", c: "Казбеги",       n: 3 },
            { d: "+7 дн.", c: "ещё на маршруте", n: null },
          ].map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 28px", alignItems: "center", padding: "6px 0", borderBottom: i < 3 ? "1px dashed var(--line)" : "none", opacity: i === 3 ? 0.55 : 1 }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{row.d}</span>
              <span style={{ fontSize: 13 }}>{row.c}</span>
              {row.n && <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)", textAlign: "right" }}>{row.n}</span>}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <AvatarStack ids={["me","m1","m2","m3"]} size={24} max={4} />
          <button className="btn btn-ink btn-sm">Открыть →</button>
        </div>
      </article>
    </ThemeScope>
  );
}

/* ---- FEATURE CARD VARIATIONS ---- */

function FeatureRowA() {
  return (
    <ThemeScope palette="adventure" style={{ padding: 28, background: "var(--paper-2)" }}>
      <span className="eyebrow" style={{ marginBottom: 16, display: "block" }}>features · grid 4-up</span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { n: "01", t: "Совместное планирование", c: "var(--ink)" },
          { n: "02", t: "Карта маршрута", c: "var(--terracotta)" },
          { n: "03", t: "Голосования", c: "var(--teal)" },
          { n: "04", t: "Бюджет и расходы", c: "var(--moss)" },
        ].map((f, i) => (
          <div key={i} className="card" style={{ padding: 20, minHeight: 180, background: f.c, color: "var(--paper)", border: "none", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <span className="mono" style={{ fontSize: 11, opacity: 0.6, letterSpacing: "0.1em" }}>{f.n}</span>
            <h4 style={{ fontSize: 22, color: "var(--paper)", lineHeight: 1.1 }}>{f.t}</h4>
          </div>
        ))}
      </div>
    </ThemeScope>
  );
}

function FeatureRowB() {
  return (
    <ThemeScope palette="sunset" typeset="modern" style={{ padding: 28, background: "var(--paper-2)" }}>
      <span className="eyebrow" style={{ marginBottom: 16, display: "block" }}>features · numbered list</span>
      <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid var(--line-2)" }}>
        {[
          { n: "01", t: "Совместное планирование", d: "Один маршрут на всех" },
          { n: "02", t: "Карта маршрута", d: "Дни в разных цветах" },
          { n: "03", t: "Голосования", d: "Решаем спорное вместе" },
          { n: "04", t: "Бюджет и расходы", d: "Делим автоматически" },
        ].map(f => (
          <div key={f.n} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 40px", gap: 24, padding: "20px 0", borderBottom: "1px solid var(--line-2)", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--terracotta)", letterSpacing: "0.06em" }}>{f.n}</span>
            <h4 style={{ fontSize: 24, fontWeight: 600 }}>{f.t}</h4>
            <p style={{ fontSize: 13, color: "var(--ink-2)", margin: 0 }}>{f.d}</p>
            <span style={{ fontSize: 18, color: "var(--ink-3)", textAlign: "right" }}>→</span>
          </div>
        ))}
      </div>
    </ThemeScope>
  );
}

function FeatureRowC() {
  return (
    <ThemeScope palette="alpine" style={{ padding: 28, background: "var(--paper-2)" }}>
      <span className="eyebrow" style={{ marginBottom: 16, display: "block" }}>features · feature stack</span>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
        <div className="card" style={{ padding: 28, background: "var(--ink)", color: "var(--paper)", border: "none", minHeight: 320, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <span className="mono" style={{ fontSize: 11, opacity: 0.6 }}>01 · ОСНОВА</span>
          <div>
            <h4 style={{ fontSize: 36, color: "var(--paper)", lineHeight: 1.05 }}>Совместное<br /><span className="display-italic" style={{ color: "var(--terracotta)" }}>планирование</span></h4>
            <p style={{ fontSize: 14, opacity: 0.75, marginTop: 12, maxWidth: 280 }}>Любой участник добавляет точку, согласует время, оставляет заметки.</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { t: "Карта маршрута" },
            { t: "Голосования" },
            { t: "Бюджет" },
          ].map((f, i) => (
            <div key={i} className="card" style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>0{i+2}</span>
              <h4 style={{ fontSize: 18, fontWeight: 600 }}>{f.t}</h4>
            </div>
          ))}
        </div>
      </div>
    </ThemeScope>
  );
}

/* ---- VOTE CARD VARIATIONS ---- */

function VoteCardA() {
  return (
    <ThemeScope palette="adventure" style={{ padding: 28, background: "var(--paper-2)" }}>
      <span className="eyebrow" style={{ marginBottom: 16, display: "block" }}>vote · bars-in-row</span>
      <article className="card" style={{ padding: 22, maxWidth: 380 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>от Ани · 3 голоса</div>
        <h3 style={{ fontSize: 18, lineHeight: 1.25, marginBottom: 14 }}>Где ужинаем во второй вечер?</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { l: "Шавi Lomi", v: 2, p: 66, sel: true },
            { l: "Барбарестан", v: 1, p: 33 },
            { l: "Самикитно", v: 0, p: 0 },
          ].map((o, i) => (
            <div key={i} style={{ position: "relative", padding: "10px 12px", borderRadius: "var(--r-md)", border: `1px solid ${o.sel ? "var(--terracotta)" : "var(--line)"}`, overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, width: `${o.p}%`, background: o.sel ? "oklch(from var(--terracotta) l c h / 0.15)" : "oklch(from var(--ink) l c h / 0.05)" }} />
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: o.sel ? 500 : 400 }}>{o.sel && "✓ "}{o.l}</span>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>{o.p}%</span>
              </div>
            </div>
          ))}
        </div>
      </article>
    </ThemeScope>
  );
}

function VoteCardB() {
  return (
    <ThemeScope palette="sunset" style={{ padding: 28, background: "var(--paper-2)" }}>
      <span className="eyebrow" style={{ marginBottom: 16, display: "block" }}>vote · stacked bar</span>
      <article className="card" style={{ padding: 22, maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <h3 style={{ fontSize: 18, lineHeight: 1.25 }}>Где ужинаем?</h3>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>3/4</span>
        </div>
        <div style={{ display: "flex", height: 12, borderRadius: 999, overflow: "hidden", marginBottom: 14, background: "var(--paper-3)" }}>
          <div style={{ flex: 2, background: "var(--terracotta)" }} />
          <div style={{ flex: 1, background: "var(--teal)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { l: "Шавi Lomi", c: "var(--terracotta)", n: 2 },
            { l: "Барбарестан", c: "var(--teal)", n: 1 },
            { l: "Самикитно", c: "var(--ink-3)", n: 0 },
          ].map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 2 ? "1px dashed var(--line)" : "none" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: o.c }} />
              <span style={{ flex: 1, fontSize: 13 }}>{o.l}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{o.n}</span>
            </div>
          ))}
        </div>
      </article>
    </ThemeScope>
  );
}

function VoteCardC() {
  return (
    <ThemeScope palette="alpine" style={{ padding: 28, background: "var(--paper-2)" }}>
      <span className="eyebrow" style={{ marginBottom: 16, display: "block" }}>vote · avatar-led</span>
      <article className="card" style={{ padding: 22, maxWidth: 380 }}>
        <h3 style={{ fontSize: 18, lineHeight: 1.25, marginBottom: 16 }}>Где ужинаем во второй вечер?</h3>
        {[
          { l: "Шавi Lomi", voters: ["m1","m2"], sel: true },
          { l: "Барбарестан", voters: ["m3"] },
          { l: "Самикитно", voters: [] },
        ].map((o, i) => (
          <button key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            width: "100%", padding: "12px 14px",
            border: `1px solid ${o.sel ? "var(--terracotta)" : "var(--line)"}`,
            borderRadius: "var(--r-md)", marginBottom: 8, textAlign: "left",
            background: o.sel ? "oklch(from var(--terracotta) l c h / 0.1)" : "var(--paper)",
          }}>
            <span style={{ width: 16, height: 16, borderRadius: "50%", border: "1.5px solid var(--ink-3)", background: o.sel ? "var(--terracotta)" : "transparent", borderColor: o.sel ? "var(--terracotta)" : "var(--ink-3)" }} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: o.sel ? 500 : 400 }}>{o.l}</span>
            {o.voters.length > 0 && <AvatarStack ids={o.voters} size={20} max={4} />}
          </button>
        ))}
      </article>
    </ThemeScope>
  );
}

window.Variations = {
  HeroEditorial, HeroSplit, HeroAlpine,
  TripCardA, TripCardB, TripCardC,
  FeatureRowA, FeatureRowB, FeatureRowC,
  VoteCardA, VoteCardB, VoteCardC,
};
