import type { CSSProperties } from "react";

type SumItem = { text: string; srcs: number; strong?: boolean; conflict?: boolean };

const srcLink: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  color: "var(--ink-3)",
  textDecoration: "underline",
  textUnderlineOffset: 3,
  flexShrink: 0,
  whiteSpace: "nowrap",
};

const ghostPill: CSSProperties = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "transparent",
  border: "1px solid var(--line)",
  color: "var(--ink-2)",
  fontSize: 12,
};

export function SummaryTab({ onGoVotes }: { onGoVotes: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxWidth: 920,
        margin: "0 auto",
      }}
    >
      <div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>
          анализ чата · 124 сообщения · обновлено 2 мин назад
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.15 }}>
          Сводка{" "}
          <span className="display-italic" style={{ color: "var(--terracotta)" }}>
            договорённостей
          </span>
        </h1>
        <p style={{ color: "var(--ink-3)", fontSize: 14, marginTop: 6 }}>
          Гид прочитал ваш чат и собрал ключевые договорённости. Нажмите «источник» рядом
          с пунктом — увидите сообщения, на которые он опирался.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 14,
        }}
      >
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
            {
              text: "Ночёвка в Сигнахи или возврат в Тбилиси (2 за / 2 против)",
              srcs: 6,
              conflict: true,
            },
            {
              text: "Подъём к Гергети пешком или на машине (3 за машину, 1 пешком)",
              srcs: 4,
              conflict: true,
            },
          ]}
        />
      </div>

      <div
        style={{
          padding: 18,
          background:
            "linear-gradient(180deg, oklch(from var(--terracotta) l c h / 0.05), transparent)",
          border: "1px solid oklch(from var(--terracotta) l c h / 0.25)",
          borderRadius: 12,
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 240 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--ink)",
              marginBottom: 2,
            }}
          >
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

function SumSection({
  title,
  icon,
  items,
  tone,
}: {
  title: string;
  icon: string;
  items: SumItem[];
  tone?: "warn";
}) {
  const accent = tone === "warn" ? "oklch(0.62 0.135 40)" : "var(--ink)";
  return (
    <section
      style={{
        padding: 16,
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background:
              tone === "warn"
                ? "oklch(from var(--terracotta) l c h / 0.14)"
                : "var(--paper-2)",
            color: accent,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {icon}
        </span>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>{title}</h3>
      </div>
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        {items.map((it, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "flex-start",
              fontSize: 13,
              color: it.strong ? "var(--ink)" : "var(--ink-2)",
              fontWeight: it.strong ? 500 : 400,
              lineHeight: 1.45,
              paddingBottom: 8,
              borderBottom: i < items.length - 1 ? "1px dashed var(--line)" : "none",
            }}
          >
            <span style={{ flex: 1 }}>
              {it.conflict && (
                <span
                  style={{
                    display: "inline-block",
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: "var(--terracotta)",
                    marginRight: 8,
                    verticalAlign: "middle",
                  }}
                />
              )}
              {it.text}
            </span>
            <button style={srcLink}>источник · {it.srcs}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
