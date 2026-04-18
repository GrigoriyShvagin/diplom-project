import type { CSSProperties, ReactNode } from "react";
import { AvatarStack } from "@/shared/ui/Avatar";

const panel: CSSProperties = {
  background: "var(--paper)",
  border: "1px solid var(--line)",
  borderRadius: 12,
  padding: 16,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
};

const ghostPill: CSSProperties = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "transparent",
  border: "1px solid var(--line)",
  color: "var(--ink-2)",
  fontSize: 12,
};

const SCHEDULE = [
  { d: "12", w: "пт", title: "Прилёт · вечер в старом Тбилиси", n: 2 },
  {
    d: "13",
    w: "сб",
    title: "Серные бани, Нарикала, ужин у Велиаминова",
    n: 3,
    color: "var(--terracotta)",
  },
  { d: "14", w: "вс", title: "Кахетия — выезд утром", n: 2, color: "var(--teal)" },
  {
    d: "15",
    w: "пн",
    title: "Сигнахи, винодельни, Бодбе",
    n: 3,
    color: "var(--teal)",
  },
  { d: "16", w: "вт", title: "Возврат в Тбилиси, свободный день", n: 1 },
  { d: "17", w: "ср", title: "Казбеги — выезд по ВГД", n: 2, color: "var(--moss)" },
  { d: "18", w: "чт", title: "Гергети, Цминда Самеба", n: 2, color: "var(--moss)" },
  {
    d: "19",
    w: "пт",
    title: "Спуск к Жинвальскому водохранилищу",
    n: 1,
    color: "var(--moss)",
  },
  { d: "20", w: "сб", title: "Шопинг, сувениры, прощальный ужин", n: 1 },
  { d: "21", w: "вс", title: "Запас · отдых", n: 0 },
  { d: "22", w: "пн", title: "Вылет", n: 1 },
] as const;

const SPEND = [
  { l: "Жильё", v: 22400, c: "var(--terracotta)" },
  { l: "Еда", v: 18200, c: "var(--moss)" },
  { l: "Транспорт", v: 11800, c: "var(--teal)" },
  { l: "Активности", v: 5600, c: "oklch(0.65 0.10 80)" },
] as const;

export function FinalTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
            план готов · 12 – 22 июня 2026
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 600, marginTop: 2 }}>
            Итоги{" "}
            <span className="display-italic" style={{ color: "var(--terracotta)" }}>
              поездки
            </span>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={ghostPill}>↗ Поделиться</button>
          <button style={ghostPill}>⬇ Экспортировать</button>
          <button
            className="btn btn-primary"
            style={{ padding: "6px 14px", fontSize: 13 }}
          >
            ✓ Завершить
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.4fr) minmax(0, 0.9fr)",
          gap: 14,
        }}
      >
        <section style={panel}>
          <PanelHead title="Финальный маршрут" sub="3 города · 6 точек" />
          <div
            style={{
              flex: 1,
              minHeight: 320,
              background:
                "linear-gradient(180deg, oklch(0.93 0.02 100), oklch(0.88 0.025 95))",
              borderRadius: 10,
              position: "relative",
              overflow: "hidden",
              border: "1px solid var(--line)",
            }}
          >
            <svg
              viewBox="0 0 400 320"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            >
              <path
                d="M 0 200 Q 80 180 160 200 T 320 210 T 400 220"
                stroke="oklch(0.78 0.04 220)"
                strokeWidth="20"
                fill="none"
                opacity="0.4"
              />
              <path
                d="M 70 240 Q 130 200 200 180 T 320 100"
                stroke="var(--terracotta)"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray="5 4"
              />
              {(
                [
                  [70, 240, "Тбилиси"],
                  [200, 180, "Сигнахи"],
                  [320, 100, "Казбеги"],
                ] as const
              ).map(([x, y, n]) => (
                <g key={n}>
                  <circle
                    cx={x}
                    cy={y}
                    r="7"
                    fill="var(--paper)"
                    stroke="var(--terracotta)"
                    strokeWidth="2"
                  />
                  <circle cx={x} cy={y} r="3" fill="var(--terracotta)" />
                  <text
                    x={x + 12}
                    y={y + 4}
                    style={{ fontSize: 11, fill: "var(--ink)" }}
                  >
                    {n}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </section>

        <section style={panel}>
          <PanelHead title="Расписание" sub="10 дней · 18 событий" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SCHEDULE.map((d) => (
              <div
                key={d.d}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr auto",
                  gap: 10,
                  alignItems: "center",
                  padding: "6px 8px",
                  borderRadius: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{d.d}</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
                    {d.w}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--ink-2)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {"color" in d && d.color && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: d.color,
                        marginRight: 8,
                        verticalAlign: "middle",
                      }}
                    />
                  )}
                  {d.title}
                </div>
                <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
                  {d.n > 0 ? `${d.n} событий` : "—"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section style={panel}>
          <PanelHead title="Параметры" sub="ключевое" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ParamRow label="Даты" value="12 – 22 июня" mono="10 дней" />
            <ParamRow
              label="Направление"
              value="Грузия"
              mono="Тбилиси · Кахетия · Казбеги"
            />
            <ParamRow label="Бюджет" value="≈ 58 000 ₽" mono="на участника" />
            <ParamRow
              label="Состав"
              value={<AvatarStack ids={["m1", "m2", "m3", "m4"]} size={20} max={4} />}
              mono="4 человека"
            />
            <ParamRow label="Решений" value="12" mono="из 14 закрыто" />
          </div>

          <div
            style={{
              marginTop: 14,
              padding: 12,
              background: "var(--paper-2)",
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 6 }}>
              Сводка расходов
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SPEND.map((e) => {
                const max = 22400;
                return (
                  <div key={e.l}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        marginBottom: 3,
                      }}
                    >
                      <span style={{ color: "var(--ink-2)" }}>{e.l}</span>
                      <span className="mono" style={{ color: "var(--ink)" }}>
                        {e.v.toLocaleString("ru")} ₽
                      </span>
                    </div>
                    <div
                      style={{ height: 4, background: "var(--paper-3)", borderRadius: 999 }}
                    >
                      <div
                        style={{
                          width: `${(e.v / max) * 100}%`,
                          height: "100%",
                          background: e.c,
                          borderRadius: 999,
                        }}
                      />
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

function PanelHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600 }}>{title}</h3>
      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function ParamRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px dashed var(--line)",
      }}
    >
      <div>
        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{value}</div>
      </div>
      <div
        className="mono"
        style={{
          fontSize: 10,
          color: "var(--ink-3)",
          textAlign: "right",
          maxWidth: 140,
        }}
      >
        {mono}
      </div>
    </div>
  );
}
