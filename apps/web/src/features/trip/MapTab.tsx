import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listDays } from "@/shared/api/itinerary";
import { getTrip } from "@/shared/api/trips";
import { TabHeader } from "./TabHeader";
import { MapboxMap, type MapMarker } from "./MapboxMap";

const DAY_COLORS = [
  "var(--terracotta)",
  "var(--teal)",
  "var(--moss)",
  "oklch(0.65 0.10 80)",
  "oklch(0.60 0.12 320)",
  "oklch(0.55 0.10 25)",
];

export function MapTab({ tripId }: { tripId: string }) {
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const hasToken = typeof token === "string" && token.length > 0;

  const daysQuery = useQuery({
    queryKey: ["trips", tripId, "days"] as const,
    queryFn: () => listDays(tripId),
  });
  const tripQuery = useQuery({
    queryKey: ["trips", tripId] as const,
    queryFn: () => getTrip(tripId),
  });

  const days = useMemo(() => daysQuery.data ?? [], [daysQuery.data]);

  const { markers, center, pinnedCount, totalItems } = useMemo(() => {
    const markers: MapMarker[] = [];
    let totalItems = 0;
    days.forEach((d, di) => {
      const color = DAY_COLORS[di % DAY_COLORS.length] ?? "var(--terracotta)";
      d.scheduleItems.forEach((it) => {
        totalItems += 1;
        if (it.lat != null && it.lng != null) {
          markers.push({
            id: it.id,
            lng: it.lng,
            lat: it.lat,
            color,
            label: d.dayNumber,
          });
        }
      });
    });
    const visible =
      activeDay == null
        ? markers
        : markers.filter((m) => m.label === activeDay);
    const center: [number, number] | undefined = markers.length
      ? [markers[0]!.lng, markers[0]!.lat]
      : undefined;
    return { markers: visible, center, pinnedCount: markers.length, totalItems };
  }, [days, activeDay]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        height: "calc(100vh - 64px)",
      }}
    >
      <TabHeader
        eyebrow={`карта · ${pinnedCount} из ${totalItems} точек с координатами`}
        title="Маршрут"
        italic="по дням"
      />

      <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
        <div
          style={{
            flex: 1,
            position: "relative",
            borderRadius: "var(--r-lg)",
            overflow: "hidden",
            border: "1px solid var(--line)",
            background: "var(--paper-2)",
          }}
        >
          {hasToken ? (
            <MapboxMap token={token} markers={markers} center={center} zoom={center ? 8 : 4} />
          ) : (
            <NoToken />
          )}

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
              zIndex: 1,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: hasToken ? "var(--moss)" : "var(--ink-3)",
                display: "inline-block",
                marginRight: 8,
              }}
            />
            {hasToken ? "mapbox · live" : "mapbox · не настроен"}
          </div>

          {hasToken && pinnedCount === 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-md)",
                  padding: "12px 18px",
                  fontSize: 13,
                  color: "var(--ink-2)",
                  textAlign: "center",
                  maxWidth: 320,
                  boxShadow: "var(--shadow-md)",
                }}
              >
                Пока ни у одного пункта нет координат. На вкладке «Маршрут»
                добавьте место через поиск — и оно появится тут.
              </div>
            </div>
          )}
        </div>

        <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="card" style={{ padding: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              дни маршрута
            </div>
            {days.length === 0 ? (
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                дней пока нет
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {days.map((d, di) => {
                  const color = DAY_COLORS[di % DAY_COLORS.length];
                  const pinned = d.scheduleItems.filter(
                    (it) => it.lat != null && it.lng != null,
                  ).length;
                  return (
                    <button
                      key={d.id}
                      onMouseEnter={() => setActiveDay(d.dayNumber)}
                      onMouseLeave={() => setActiveDay(null)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        borderRadius: "var(--r-md)",
                        background:
                          activeDay === d.dayNumber ? "var(--paper-2)" : "transparent",
                        transition: "background 0.12s",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ flex: 1, fontSize: 13 }}>
                        День {d.dayNumber}
                      </span>
                      <span
                        className="mono"
                        style={{ fontSize: 10, color: "var(--ink-3)" }}
                      >
                        {pinned}/{d.scheduleItems.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              сводка
            </div>
            <Stat label="дней" value={String(days.length)} />
            <Stat label="точек с координатами" value={String(pinnedCount)} />
            <Stat label="пунктов всего" value={String(totalItems)} />
          </div>

          {tripQuery.data?.destinationLabel && (
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
                направление
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                {tripQuery.data.destinationLabel}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NoToken() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: 360,
          color: "var(--ink-2)",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 12 }}>🗺️</div>
        Карта Mapbox не настроена. Добавьте <code>VITE_MAPBOX_TOKEN</code> в{" "}
        <code>apps/web/.env</code> и перезапустите dev-сервер.
      </div>
    </div>
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
