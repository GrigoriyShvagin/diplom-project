import type { ApiTrip } from "@/shared/api/trips";
import { UserAvatarStack } from "@/shared/ui/UserAvatar";
import { formatTripDates, tripDayCount } from "@/shared/lib/format";

const TINTS = [
  "linear-gradient(135deg, oklch(0.55 0.10 200), oklch(0.35 0.06 215))",
  "linear-gradient(135deg, oklch(0.62 0.135 40), oklch(0.42 0.12 30))",
  "linear-gradient(135deg, oklch(0.50 0.07 145), oklch(0.35 0.06 160))",
  "linear-gradient(135deg, oklch(0.40 0.04 60), oklch(0.25 0.02 50))",
];

export function TripCard({
  trip,
  index,
  onOpen,
}: {
  trip: ApiTrip;
  index: number;
  onOpen: () => void;
}) {
  const tint = TINTS[index % TINTS.length];
  const dates = formatTripDates(trip.startDate, trip.endDate);
  const days = tripDayCount(trip.startDate, trip.endDate);
  const dest = trip.destinationLabel ?? "направление не указано";
  return (
    <article
      onClick={onOpen}
      className="card"
      style={{
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div style={{ height: 120, background: tint, position: "relative" }}>
        {trip.status === "active" && (
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 9px",
              borderRadius: 999,
              background: "oklch(1 0 0 / 0.18)",
              backdropFilter: "blur(8px)",
              color: "var(--paper)",
              fontSize: 11,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "oklch(0.78 0.13 145)",
              }}
            />
            в пути
          </span>
        )}
      </div>
      <div style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 19, marginBottom: 4, fontWeight: 600 }}>{trip.title}</h3>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>
            {dest} · {dates}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          <UserAvatarStack users={trip.members.map((m) => m.user)} size={22} max={5} />
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
            {days != null ? `${days} дней` : `${trip.members.length} чел`}
          </span>
        </div>
      </div>
    </article>
  );
}

export function NewTripCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1.5px dashed var(--line-2)",
        borderRadius: "var(--r-lg)",
        background: "transparent",
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        color: "var(--ink-3)",
        transition: "background 0.15s, border-color 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--paper-2)";
        e.currentTarget.style.borderColor = "var(--terracotta)";
        e.currentTarget.style.color = "var(--terracotta)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "";
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.color = "var(--ink-3)";
      }}
    >
      <span style={{ fontSize: 28, fontWeight: 300, lineHeight: 1 }}>+</span>
      <span style={{ fontSize: 14 }}>Новая поездка</span>
    </button>
  );
}
