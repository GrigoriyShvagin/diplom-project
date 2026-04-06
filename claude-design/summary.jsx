/* global React, useT, Avatar, AvatarStack, MEMBERS, ACTIVE_TRIP */
const { useState: useStateSum } = React;

/* ============================================================
   SUMMARY TAB — "Сводка договоренностей" (Step 10)
   ============================================================ */
function SummaryTab({ onGoVotes }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 920, margin: "0 auto" }}>
      <div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>анализ чата · 124 сообщения · обновлено 2 мин назад</div>
        <h1 style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.15 }}>
          Сводка <span className="display-italic" style={{ color: "var(--terracotta)" }}>договорённостей</span>
        </h1>
        <p style={{ color: "var(--ink-3)", fontSize: 14, marginTop: 6 }}>
          Гид прочитал ваш чат и собрал ключевые договорённости. Нажмите «источник» рядом с пунктом — увидите сообщения, на которые он опирался.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
        <SumSection
          title="Предпочтительные направления"
          icon="📍"
          items={[
            { text: "Грузия — Тбилиси, Кахетия, Казбеги", srcs: 8, strong: true },
            { text: "Альтернатива: Армения (упоминалась 3 раза)", srcs: 3 },
          ]}
        />
        <SumSection
          title="Бюджет"
          icon="₽"
          items={[
            { text: "до 60 000 ₽ на участника", srcs: 5, strong: true },
            { text: "общий ужин делим на всех; такси — кто едет", srcs: 4 },
          ]}
        />
        <SumSection
          title="Даты"
          icon="◷"
          items={[
            { text: "12 – 22 июня (10 дней)", srcs: 7, strong: true },
            { text: "Маша может присоединиться с 14-го", srcs: 2 },
          ]}
        />
        <SumSection
          title="Интересы"
          icon="◇"
          items={[
            { text: "Природа и треккинг", srcs: 11, strong: true },
            { text: "Вино и местная кухня", srcs: 9, strong: true },
            { text: "Архитектура и старый город", srcs: 4 },
          ]}
        />
        <SumSection
          title="Ограничения"
          icon="!"
          items={[
            { text: "Лёша не ест мясо — учитывать в выборе ресторанов", srcs: 3 },
            { text: "Маша не водит — нужен трансфер из аэропорта", srcs: 2 },
          ]}
        />
        <SumSection
          title="Зоны разногласий"
          icon="⚡"
          tone="warn"
          items={[
            { text: "Ночёвка в Сигнахи или возврат в Тбилиси (2 за / 2 против)", srcs: 6, conflict: true },
            { text: "Подъём к Гергети пешком или на машине (3 за машину, 1 пешком)", srcs: 4, conflict: true },
          ]}
        />
      </div>

      {/* Action: create vote on conflict */}
      <div style={{
        padding: 18,
        background: "linear-gradient(180deg, oklch(from var(--terracotta) l c h / 0.05), transparent)",
        border: "1px solid oklch(from var(--terracotta) l c h / 0.25)",
        borderRadius: 12,
        display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>
            Есть 2 зоны разногласий
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
            Создайте голосование, чтобы группа договорилась.
          </div>
        </div>
        <button className="btn btn-primary" onClick={onGoVotes}>
          + Создать голосование
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, color: "var(--ink-3)", fontSize: 12 }}>
        <button style={ghostPill}>↻ Пересобрать сводку</button>
        <button style={ghostPill}>↗ Поделиться с группой</button>
        <button style={ghostPill}>⬇ Экспорт</button>
      </div>
    </div>
  );
}

function SumSection({ title, icon, items, tone }) {
  const accent = tone === "warn" ? "oklch(0.62 0.135 40)" : "var(--ink)";
  return (
    <section style={{
      padding: 16,
      background: "var(--paper)",
      border: "1px solid var(--line)",
      borderRadius: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{
          width: 26, height: 26, borderRadius: 8,
          background: tone === "warn" ? "oklch(from var(--terracotta) l c h / 0.14)" : "var(--paper-2)",
          color: accent, display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 600,
        }}>{icon}</span>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>{title}</h3>
      </div>
      <ul style={{ display: "flex", flexDirection: "column", gap: 8, margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((it, i) => (
          <li key={i} style={{
            display: "flex", justifyContent: "space-between", gap: 12,
            alignItems: "flex-start", fontSize: 13,
            color: it.strong ? "var(--ink)" : "var(--ink-2)",
            fontWeight: it.strong ? 500 : 400,
            lineHeight: 1.45,
            paddingBottom: 8, borderBottom: i < items.length - 1 ? "1px dashed var(--line)" : "none",
          }}>
            <span style={{ flex: 1 }}>
              {it.conflict && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 999, background: "var(--terracotta)", marginRight: 8, verticalAlign: "middle" }} />}
              {it.text}
            </span>
            <button style={srcLink}>источник · {it.srcs}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

const srcLink = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  color: "var(--ink-3)",
  textDecoration: "underline",
  textUnderlineOffset: 3,
  flexShrink: 0,
  whiteSpace: "nowrap",
};

const ghostPill = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "transparent",
  border: "1px solid var(--line)",
  color: "var(--ink-2)",
  fontSize: 12,
};

/* ============================================================
   FINAL TAB — "Итоги поездки" (Step 11)
   ============================================================ */
function FinalTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Action bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>план готов · 12 – 22 июня 2026</div>
          <h1 style={{ fontSize: 28, fontWeight: 600, marginTop: 2 }}>
            Итоги <span className="display-italic" style={{ color: "var(--terracotta)" }}>поездки</span>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={ghostPill}>↗ Поделиться</button>
          <button style={ghostPill}>⬇ Экспортировать</button>
          <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 13 }}>✓ Завершить</button>
        </div>
      </div>

      {/* 3-column block */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.4fr) minmax(0, 0.9fr)", gap: 14 }}>
        {/* Map */}
        <section style={panel}>
          <PanelHead title="Финальный маршрут" sub="3 города · 6 точек" />
          <div style={{
            flex: 1, minHeight: 320,
            background: "linear-gradient(180deg, oklch(0.93 0.02 100), oklch(0.88 0.025 95))",
            borderRadius: 10, position: "relative", overflow: "hidden",
            border: "1px solid var(--line)",
          }}>
            <svg viewBox="0 0 400 320" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <path d="M 0 200 Q 80 180 160 200 T 320 210 T 400 220" stroke="oklch(0.78 0.04 220)" strokeWidth="20" fill="none" opacity="0.4" />
              {/* Route */}
              <path d="M 70 240 Q 130 200 200 180 T 320 100" stroke="var(--terracotta)" strokeWidth="2.5" fill="none" strokeDasharray="5 4" />
              {/* Pins */}
              {[[70,240,"Тбилиси"],[200,180,"Сигнахи"],[320,100,"Казбеги"]].map(([x,y,n], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="7" fill="var(--paper)" stroke="var(--terracotta)" strokeWidth="2" />
                  <circle cx={x} cy={y} r="3" fill="var(--terracotta)" />
                  <text x={x + 12} y={y + 4} style={{ fontSize: 11, fill: "var(--ink)" }}>{n}</text>
                </g>
              ))}
            </svg>
          </div>
        </section>

        {/* Timeline */}
        <section style={panel}>
          <PanelHead title="Расписание" sub="10 дней · 18 событий" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { d: "12", w: "пт", title: "Прилёт · вечер в старом Тбилиси", n: 2 },
              { d: "13", w: "сб", title: "Серные бани, Нарикала, ужин у Велиаминова", n: 3, color: "var(--terracotta)" },
              { d: "14", w: "вс", title: "Кахетия — выезд утром", n: 2, color: "var(--teal)" },
              { d: "15", w: "пн", title: "Сигнахи, винодельни, Бодбе", n: 3, color: "var(--teal)" },
              { d: "16", w: "вт", title: "Возврат в Тбилиси, свободный день", n: 1 },
              { d: "17", w: "ср", title: "Казбеги — выезд по ВГД", n: 2, color: "var(--moss)" },
              { d: "18", w: "чт", title: "Гергети, Цминда Самеба", n: 2, color: "var(--moss)" },
              { d: "19", w: "пт", title: "Спуск к Жинвальскому водохранилищу", n: 1, color: "var(--moss)" },
              { d: "20", w: "сб", title: "Шопинг, сувениры, прощальный ужин", n: 1 },
              { d: "21", w: "вс", title: "Запас · отдых", n: 0 },
              { d: "22", w: "пн", title: "Вылет", n: 1 },
            ].map((d, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 10,
                alignItems: "center", padding: "6px 8px",
                borderRadius: 6,
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{d.d}</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{d.w}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {d.color && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 999, background: d.color, marginRight: 8, verticalAlign: "middle" }} />}
                  {d.title}
                </div>
                <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{d.n > 0 ? `${d.n} событий` : "—"}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Key params */}
        <section style={panel}>
          <PanelHead title="Параметры" sub="ключевое" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ParamRow label="Даты" value="12 – 22 июня" mono="10 дней" />
            <ParamRow label="Направление" value="Грузия" mono="Тбилиси · Кахетия · Казбеги" />
            <ParamRow label="Бюджет" value="≈ 58 000 ₽" mono="на участника" />
            <ParamRow label="Состав" value={<AvatarStack ids={["m1","m2","m3","m4"]} size={20} max={4} />} mono="4 человека" />
            <ParamRow label="Решений" value="12" mono="из 14 закрыто" />
          </div>

          <div style={{ marginTop: 14, padding: 12, background: "var(--paper-2)", borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 6 }}>Сводка расходов</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { l: "Жильё",  v: 22400, c: "var(--terracotta)" },
                { l: "Еда",    v: 18200, c: "var(--moss)" },
                { l: "Транспорт", v: 11800, c: "var(--teal)" },
                { l: "Активности", v: 5600, c: "oklch(0.65 0.10 80)" },
              ].map((e, i) => {
                const max = 22400;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: "var(--ink-2)" }}>{e.l}</span>
                      <span className="mono" style={{ color: "var(--ink)" }}>{e.v.toLocaleString("ru")} ₽</span>
                    </div>
                    <div style={{ height: 4, background: "var(--paper-3)", borderRadius: 999 }}>
                      <div style={{ width: `${(e.v / max) * 100}%`, height: "100%", background: e.c, borderRadius: 999 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function PanelHead({ title, sub }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600 }}>{title}</h3>
      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}
function ParamRow({ label, value, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px dashed var(--line)" }}>
      <div>
        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{value}</div>
      </div>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", textAlign: "right", maxWidth: 140 }}>{mono}</div>
    </div>
  );
}

const panel = {
  background: "var(--paper)",
  border: "1px solid var(--line)",
  borderRadius: 12,
  padding: 16,
  display: "flex", flexDirection: "column",
  minHeight: 0,
};

window.SummaryTab = SummaryTab;
window.FinalTab = FinalTab;
