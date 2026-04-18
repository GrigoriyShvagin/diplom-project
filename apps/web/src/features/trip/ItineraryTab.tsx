import { useT } from "@/shared/lib/i18n";
import { ACTIVE_TRIP, type ItineraryDay, type ScheduleItem } from "@/shared/lib/demo";
import { TabHeader } from "./TabHeader";

const TYPE_ICON: Record<ScheduleItem["type"], string> = {
  flight: "✈",
  drive: "→",
  stay: "■",
  food: "▲",
  place: "●",
  walk: "→",
};

export function ItineraryTab({
  openDays,
  setOpenDays,
}: {
  openDays: Record<number, boolean>;
  setOpenDays: (d: Record<number, boolean>) => void;
}) {
  const { t } = useT();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <TabHeader
        eyebrow={`маршрут · ${ACTIVE_TRIP.itinerary.length} дней показано`}
        title="День за днём"
        italic="по часам"
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 880 }}>
        {ACTIVE_TRIP.itinerary.map((d) => (
          <DayCard
            key={d.day}
            day={d}
            open={Boolean(openDays[d.day])}
            onToggle={() => setOpenDays({ ...openDays, [d.day]: !openDays[d.day] })}
          />
        ))}
        <button
          className="card"
          style={{
            padding: 18,
            border: "1.5px dashed var(--line-2)",
            background: "transparent",
            color: "var(--ink-2)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          + {t("trip.itin.add")}
        </button>
      </div>
    </div>
  );
}

function DayCard({
  day,
  open,
  onToggle,
}: {
  day: ItineraryDay;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="card" style={{ overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: 20,
          textAlign: "left",
        }}
      >
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--r-md)",
            background: "var(--ink)",
            color: "var(--paper)",
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="mono"
            style={{ fontSize: 9, opacity: 0.6, letterSpacing: "0.1em" }}
          >
            ДЕНЬ
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              fontStyle: "italic",
            }}
          >
            {day.day}
          </span>
        </span>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 22, marginBottom: 2 }}>{day.city}</h3>
          <div
            className="mono"
            style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}
          >
            {day.date} · {day.items.length} пунктов
          </div>
        </div>
        <span
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)", fontSize: 18 }}
        >
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--line)" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {day.items.map((it, i) => (
              <div
                key={`${day.day}-${i}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 28px 1fr",
                  gap: 16,
                  alignItems: "flex-start",
                  padding: "16px 0",
                  borderBottom:
                    i < day.items.length - 1 ? "1px dashed var(--line)" : "none",
                }}
              >
                <span
                  className="mono"
                  style={{ fontSize: 13, color: "var(--ink-2)", paddingTop: 2 }}
                >
                  {it.time}
                </span>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    background: "var(--paper-2)",
                    border: "1px solid var(--line)",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "var(--terracotta)",
                  }}
                >
                  {TYPE_ICON[it.type] ?? "•"}
                </span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{it.title}</div>
                  {it.note && (
                    <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                      {it.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button
              style={{
                padding: "10px 0",
                textAlign: "left",
                fontSize: 13,
                color: "var(--terracotta)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              + Добавить пункт в этот день
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
