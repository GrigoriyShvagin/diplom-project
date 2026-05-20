import { type CSSProperties, type ReactNode, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTrip } from "@/shared/api/trips";
import { listDays } from "@/shared/api/itinerary";
import { listExpenses } from "@/shared/api/expenses";
import { listVotes } from "@/shared/api/votes";
import { UserAvatarStack } from "@/shared/ui/UserAvatar";
import { categoryMeta } from "@/shared/lib/categories";
import { formatTripDates, tripDayCount } from "@/shared/lib/format";

const panel: CSSProperties = {
  background: "var(--paper)",
  border: "1px solid var(--line)",
  borderRadius: 12,
  padding: 16,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
};

const RU_MONTHS_SHORT = [
  "янв",
  "фев",
  "мар",
  "апр",
  "мая",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
];

export function FinalTab({ tripId }: { tripId: string }) {
  const tripQuery = useQuery({ queryKey: ["trips", tripId] as const, queryFn: () => getTrip(tripId) });
  const daysQuery = useQuery({ queryKey: ["trips", tripId, "days"] as const, queryFn: () => listDays(tripId) });
  const expensesQuery = useQuery({
    queryKey: ["trips", tripId, "expenses"] as const,
    queryFn: () => listExpenses(tripId),
  });
  const votesQuery = useQuery({ queryKey: ["trips", tripId, "votes"] as const, queryFn: () => listVotes(tripId) });

  const trip = tripQuery.data;
  const days = daysQuery.data ?? [];
  const expenses = useMemo(() => expensesQuery.data ?? [], [expensesQuery.data]);
  const votes = votesQuery.data ?? [];

  const totalItems = days.reduce((s, d) => s + d.scheduleItems.length, 0);
  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
  const memberCount = trip?.members.length ?? 0;
  const perPerson = memberCount > 0 ? Math.round(totalSpend / memberCount) : 0;
  const resolvedVotes = votes.filter((v) => v.resolvedAt).length;
  const dayCount = trip ? tripDayCount(trip.startDate, trip.endDate) ?? days.length : days.length;

  const spendByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    }
    const rows = [...map.entries()]
      .map(([key, value]) => ({ ...categoryMeta(key), value }))
      .sort((a, b) => b.value - a.value);
    const max = rows.reduce((m, r) => Math.max(m, r.value), 0) || 1;
    return { rows, max };
  }, [expenses]);

  if (tripQuery.isLoading) {
    return (
      <div className="mono" style={{ color: "var(--ink-3)", fontSize: 13 }}>
        загрузка…
      </div>
    );
  }

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
            {trip ? formatTripDates(trip.startDate, trip.endDate) : "—"}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 600, marginTop: 2 }}>
            Итоги{" "}
            <span className="display-italic" style={{ color: "var(--terracotta)" }}>
              поездки
            </span>
          </h1>
        </div>
      </div>

      {/* Stat row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 12,
        }}
      >
        <StatCard label="дней" value={dayCount != null ? String(dayCount) : String(days.length)} />
        <StatCard label="пунктов" value={String(totalItems)} />
        <StatCard label="участников" value={String(memberCount)} />
        <StatCard
          label="голосований решено"
          value={votes.length ? `${resolvedVotes}/${votes.length}` : "—"}
        />
        <StatCard label="бюджет, ₽" value={totalSpend.toLocaleString("ru")} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
          gap: 14,
        }}
      >
        {/* Schedule */}
        <section style={panel}>
          <PanelHead
            title="Расписание"
            sub={`${days.length} ${plural(days.length, "день", "дня", "дней")} · ${totalItems} ${plural(totalItems, "пункт", "пункта", "пунктов")}`}
          />
          {days.length === 0 ? (
            <EmptyNote text="Дни ещё не добавлены — соберите маршрут на вкладке «Маршрут»." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {days.map((d) => (
                <div
                  key={d.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px 1fr auto",
                    gap: 10,
                    alignItems: "start",
                    padding: "8px",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>{d.dayNumber}</span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
                      {shortDate(d.date)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--ink-2)",
                      lineHeight: 1.45,
                    }}
                  >
                    {d.scheduleItems.length === 0
                      ? "—"
                      : d.scheduleItems
                          .map((it) => (it.startTime ? `${it.startTime} ` : "") + it.title)
                          .join(" · ")}
                  </div>
                  <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>
                    {d.scheduleItems.length || "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Params + spend */}
        <section style={panel}>
          <PanelHead title="Параметры" sub="ключевое" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ParamRow
              label="Даты"
              value={trip ? formatTripDates(trip.startDate, trip.endDate) : "—"}
              mono={dayCount != null ? `${dayCount} дней` : "—"}
            />
            <ParamRow
              label="Направление"
              value={trip?.destinationLabel ?? "не указано"}
              mono={trip?.title ?? ""}
            />
            <ParamRow
              label="Бюджет"
              value={`${totalSpend.toLocaleString("ru")} ₽`}
              mono={`≈ ${perPerson.toLocaleString("ru")} ₽ / чел`}
            />
            <ParamRow
              label="Состав"
              value={
                trip ? (
                  <UserAvatarStack users={trip.members.map((m) => m.user)} size={20} max={5} />
                ) : (
                  "—"
                )
              }
              mono={`${memberCount} ${plural(memberCount, "человек", "человека", "человек")}`}
            />
            <ParamRow
              label="Решений"
              value={votes.length ? `${resolvedVotes}` : "0"}
              mono={votes.length ? `из ${votes.length} закрыто` : "нет голосований"}
            />
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
            {spendByCategory.rows.length === 0 ? (
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                расходов пока нет
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {spendByCategory.rows.map((r) => (
                  <div key={r.key}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        marginBottom: 3,
                      }}
                    >
                      <span style={{ color: "var(--ink-2)" }}>{r.label}</span>
                      <span className="mono" style={{ color: "var(--ink)" }}>
                        {r.value.toLocaleString("ru")} ₽
                      </span>
                    </div>
                    <div style={{ height: 4, background: "var(--paper-3)", borderRadius: 999 }}>
                      <div
                        style={{
                          width: `${(r.value / spendByCategory.max) * 100}%`,
                          height: "100%",
                          background: r.color,
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div
        style={{ fontFamily: "var(--font-display)", fontSize: 28, lineHeight: 1, fontStyle: "italic" }}
      >
        {value}
      </div>
      <div
        className="mono"
        style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 6, letterSpacing: "0.04em" }}
      >
        {label}
      </div>
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 13, color: "var(--ink-3)", padding: "12px 4px", lineHeight: 1.5 }}>
      {text}
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
        style={{ fontSize: 10, color: "var(--ink-3)", textAlign: "right", maxWidth: 160 }}
      >
        {mono}
      </div>
    </div>
  );
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${RU_MONTHS_SHORT[d.getMonth()]}`;
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
