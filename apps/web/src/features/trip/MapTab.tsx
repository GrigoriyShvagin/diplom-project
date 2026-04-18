import { useState } from "react";
import { TabHeader } from "./TabHeader";

type Day = { id: number; color: string; label: string };

const DAYS: Day[] = [
  { id: 1, color: "var(--terracotta)", label: "День 1 · Тбилиси" },
  { id: 2, color: "var(--teal)", label: "День 2 · Кахетия" },
  { id: 3, color: "var(--moss)", label: "День 3 · Казбеги" },
];

export function MapTab() {
  const [activeDay, setActiveDay] = useState<number | null>(null);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        height: "calc(100vh - 64px)",
      }}
    >
      <TabHeader eyebrow="карта · 03 / 11 дней" title="Маршрут" italic="по дням" />

      <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
        <div
          style={{
            flex: 1,
            position: "relative",
            borderRadius: "var(--r-lg)",
            overflow: "hidden",
            border: "1px solid var(--line)",
            background:
              "linear-gradient(180deg, oklch(0.93 0.02 100) 0%, oklch(0.88 0.025 95) 100%)",
          }}
        >
          <svg
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            <defs>
              <pattern id="topo" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 0 20 Q 20 10 40 20"
                  stroke="oklch(0.78 0.04 90)"
                  strokeWidth="0.5"
                  fill="none"
                />
                <path
                  d="M 0 32 Q 20 22 40 32"
                  stroke="oklch(0.78 0.04 90)"
                  strokeWidth="0.5"
                  fill="none"
                />
              </pattern>
            </defs>
            <rect width="800" height="600" fill="url(#topo)" />
            <path
              d="M 0 380 Q 100 360 220 390 T 420 400 T 600 380 T 800 410 L 800 600 L 0 600 Z"
              fill="oklch(0.78 0.04 220)"
              opacity="0.55"
            />
            <path
              d="M 60 480 Q 180 360 320 340 T 540 220 T 720 120"
              stroke="oklch(0.50 0.02 80)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="2 4"
              opacity="0.4"
            />
            <g opacity={activeDay === null || activeDay === 1 ? 1 : 0.25}>
              <path
                d="M 130 460 L 170 440 L 200 450 L 230 430 L 210 470"
                stroke="var(--terracotta)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {(
                [
                  [130, 460],
                  [170, 440],
                  [200, 450],
                  [230, 430],
                  [210, 470],
                ] as const
              ).map(([x, y], i) => (
                <Pin key={`d1-${i}`} x={x} y={y} color="var(--terracotta)" n={i + 1} />
              ))}
            </g>
            <g opacity={activeDay === null || activeDay === 2 ? 1 : 0.25}>
              <path
                d="M 230 430 Q 350 380 480 320"
                stroke="var(--teal)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
              <Pin x={350} y={380} color="var(--teal)" n="2a" />
              <Pin x={480} y={320} color="var(--teal)" n="2b" />
            </g>
            <g opacity={activeDay === null || activeDay === 3 ? 1 : 0.25}>
              <path
                d="M 230 430 Q 300 280 540 220 T 720 120"
                stroke="var(--moss)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
              <Pin x={540} y={220} color="var(--moss)" n="3a" />
              <Pin x={720} y={120} color="var(--moss)" n="3b" big />
            </g>
            <g opacity="0.5">
              <path
                d="M 600 80 L 640 30 L 680 75 L 720 50 L 760 90 Z"
                fill="oklch(0.50 0.04 80)"
              />
              <path
                d="M 600 80 L 640 30 L 660 55 L 640 80"
                fill="oklch(0.40 0.04 80)"
              />
            </g>
            <g transform="translate(740 530)">
              <circle r="22" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
              <path d="M 0 -16 L 4 0 L 0 16 L -4 0 Z" fill="var(--terracotta)" />
              <text
                textAnchor="middle"
                dy="-18"
                fill="var(--ink)"
                style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
              >
                С
              </text>
            </g>
          </svg>

          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-pill)",
              padding: "6px 12px",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--ink-3)",
              letterSpacing: "0.06em",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--moss)",
                display: "inline-block",
                marginRight: 8,
              }}
            />
            mapbox · стилизованная карта
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 14,
              right: 14,
              display: "flex",
              flexDirection: "column",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-md)",
              overflow: "hidden",
            }}
          >
            <button
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid var(--line)",
                fontSize: 16,
              }}
            >
              +
            </button>
            <button style={{ padding: "8px 12px", fontSize: 16 }}>−</button>
          </div>
        </div>

        <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="card" style={{ padding: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              дни маршрута
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {DAYS.map((d) => (
                <button
                  key={d.id}
                  onMouseEnter={() => setActiveDay(d.id)}
                  onMouseLeave={() => setActiveDay(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: "var(--r-md)",
                    background: activeDay === d.id ? "var(--paper-2)" : "transparent",
                    transition: "background 0.12s",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: d.color,
                    }}
                  />
                  <span style={{ fontSize: 13 }}>{d.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              сводка
            </div>
            <Stat label="точек на маршруте" value="14" />
            <Stat label="км в общей сложности" value="612" />
            <Stat label="ночёвки" value="9" />
          </div>
          <div
            className="card"
            style={{
              padding: 16,
              background: "var(--ink)",
              color: "var(--paper)",
              border: "none",
            }}
          >
            <div
              className="eyebrow"
              style={{ color: "oklch(0.65 0.012 65)", marginBottom: 8 }}
            >
              совет
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
              На{" "}
              <span style={{ color: "var(--terracotta-soft)" }}>третий день</span>{" "}
              заложите запас по времени — Военно-Грузинская дорога часто перекрыта.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pin({
  x,
  y,
  color,
  n,
  big,
}: {
  x: number;
  y: number;
  color: string;
  n: number | string;
  big?: boolean;
}) {
  const r = big ? 14 : 10;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={color} />
      <circle cx={x} cy={y} r={r - 3} fill="var(--paper)" />
      <text
        x={x}
        y={y + 3}
        textAnchor="middle"
        style={{
          fontSize: 9,
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fill: color,
        }}
      >
        {n}
      </text>
    </g>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px dashed var(--line)",
      }}
    >
      <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{label}</span>
      <span className="mono" style={{ fontSize: 13, fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}
