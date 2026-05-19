import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useT } from "@/shared/lib/i18n";
import {
  createDay,
  createScheduleItem,
  deleteScheduleItem,
  listDays,
  type ApiScheduleItem,
  type ApiTripDay,
} from "@/shared/api/itinerary";
import { TabHeader } from "./TabHeader";

const TYPE_ICON: Record<ApiScheduleItem["type"], string> = {
  flight: "✈",
  drive: "→",
  stay: "■",
  food: "▲",
  place: "●",
  walk: "→",
  custom: "•",
};

const TYPE_LABEL: Record<ApiScheduleItem["type"], string> = {
  flight: "перелёт",
  drive: "переезд",
  stay: "ночёвка",
  food: "еда",
  place: "место",
  walk: "прогулка",
  custom: "пункт",
};

export function ItineraryTab({ tripId }: { tripId: string }) {
  const { t } = useT();
  const queryClient = useQueryClient();
  const daysKey = ["trips", tripId, "days"] as const;

  const daysQuery = useQuery({
    queryKey: daysKey,
    queryFn: () => listDays(tripId),
  });

  const days = daysQuery.data ?? [];
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({});

  const addDayMutation = useMutation({
    mutationFn: () => {
      const today = new Date();
      const nextNumber = (days[days.length - 1]?.dayNumber ?? 0) + 1;
      const base = days[days.length - 1]?.date
        ? new Date(days[days.length - 1]!.date)
        : today;
      const next = new Date(base);
      if (days.length > 0) next.setDate(next.getDate() + 1);
      return createDay(tripId, {
        date: next.toISOString().slice(0, 10),
        dayNumber: nextNumber,
      });
    },
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: daysKey });
      setOpenDays((s) => ({ ...s, [created.id]: true }));
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <TabHeader
        eyebrow={
          daysQuery.isLoading
            ? "маршрут · загрузка…"
            : `маршрут · ${days.length} ${days.length === 1 ? "день" : "дней"}`
        }
        title="День за днём"
        italic="по часам"
        action={
          <button
            className="btn btn-primary"
            onClick={() => addDayMutation.mutate()}
            disabled={addDayMutation.isPending}
          >
            + День
          </button>
        }
      />

      {daysQuery.isError && (
        <div className="field-error">
          Не удалось загрузить дни поездки. {String(daysQuery.error)}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 880 }}>
        {days.length === 0 && daysQuery.isSuccess && (
          <div
            className="card"
            style={{
              padding: 32,
              textAlign: "center",
              background: "var(--paper-2)",
              border: "1.5px dashed var(--line-2)",
              color: "var(--ink-2)",
            }}
          >
            <div style={{ fontSize: 16, marginBottom: 6 }}>Маршрут пока пуст</div>
            <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
              Нажмите «+ День», чтобы начать
            </div>
          </div>
        )}

        {days.map((d) => (
          <DayCard
            key={d.id}
            day={d}
            tripId={tripId}
            open={Boolean(openDays[d.id])}
            onToggle={() => setOpenDays((s) => ({ ...s, [d.id]: !s[d.id] }))}
            onChanged={() => queryClient.invalidateQueries({ queryKey: daysKey })}
          />
        ))}

        {days.length > 0 && (
          <button
            className="card"
            onClick={() => addDayMutation.mutate()}
            disabled={addDayMutation.isPending}
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
        )}
      </div>
    </div>
  );
}

function DayCard({
  day,
  tripId,
  open,
  onToggle,
  onChanged,
}: {
  day: ApiTripDay;
  tripId: string;
  open: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const [adding, setAdding] = useState(false);

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
          <span className="mono" style={{ fontSize: 9, opacity: 0.6, letterSpacing: "0.1em" }}>
            ДЕНЬ
          </span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontStyle: "italic" }}>
            {day.dayNumber}
          </span>
        </span>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 22, marginBottom: 2 }}>{formatDayHeading(day.date)}</h3>
          <div
            className="mono"
            style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}
          >
            {day.scheduleItems.length} {pluralПункт(day.scheduleItems.length)}
          </div>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)", fontSize: 18 }}>
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--line)" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {day.scheduleItems.map((it, i) => (
              <ItemRow
                key={it.id}
                item={it}
                tripId={tripId}
                isLast={i === day.scheduleItems.length - 1}
                onDeleted={onChanged}
              />
            ))}

            {adding ? (
              <AddItemForm
                tripId={tripId}
                dayId={day.id}
                onDone={() => {
                  setAdding(false);
                  onChanged();
                }}
                onCancel={() => setAdding(false)}
              />
            ) : (
              <button
                onClick={() => setAdding(true)}
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
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function ItemRow({
  item,
  tripId,
  isLast,
  onDeleted,
}: {
  item: ApiScheduleItem;
  tripId: string;
  isLast: boolean;
  onDeleted: () => void;
}) {
  const del = useMutation({
    mutationFn: () => deleteScheduleItem(tripId, item.tripDayId, item.id),
    onSuccess: () => onDeleted(),
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60px 28px 1fr auto",
        gap: 16,
        alignItems: "flex-start",
        padding: "16px 0",
        borderBottom: isLast ? "none" : "1px dashed var(--line)",
      }}
    >
      <span className="mono" style={{ fontSize: 13, color: "var(--ink-2)", paddingTop: 2 }}>
        {item.startTime ?? "—"}
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
        {TYPE_ICON[item.type]}
      </span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{item.title}</div>
        {item.description && (
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
            {item.description}
          </div>
        )}
      </div>
      <button
        onClick={() => del.mutate()}
        title="Удалить"
        disabled={del.isPending}
        style={{
          color: "var(--ink-3)",
          fontSize: 16,
          padding: "0 8px",
          opacity: del.isPending ? 0.4 : 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

function AddItemForm({
  tripId,
  dayId,
  onDone,
  onCancel,
}: {
  tripId: string;
  dayId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<{
    type: ApiScheduleItem["type"];
    title: string;
    startTime: string;
    description: string;
  }>({ type: "place", title: "", startTime: "", description: "" });

  const mutation = useMutation({
    mutationFn: () =>
      createScheduleItem(tripId, dayId, {
        type: form.type,
        title: form.title.trim(),
        startTime: form.startTime || undefined,
        description: form.description.trim() || undefined,
      }),
    onSuccess: () => onDone(),
  });

  const canSave = form.title.trim().length > 0;

  return (
    <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "120px 100px 1fr", gap: 8 }}>
        <select
          className="input"
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value as ApiScheduleItem["type"] })
          }
          style={{ padding: "8px 10px", fontSize: 13 }}
        >
          {(Object.keys(TYPE_LABEL) as ApiScheduleItem["type"][]).map((k) => (
            <option key={k} value={k}>
              {TYPE_LABEL[k]}
            </option>
          ))}
        </select>
        <input
          className="input"
          type="time"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          style={{ padding: "8px 10px", fontSize: 13 }}
        />
        <input
          className="input"
          placeholder="Что: например, Гергети"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          style={{ padding: "8px 10px", fontSize: 13 }}
        />
      </div>
      <input
        className="input"
        placeholder="Заметка (необязательно)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        style={{ padding: "8px 10px", fontSize: 13 }}
      />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>
          Отмена
        </button>
        <button
          className="btn btn-primary btn-sm"
          disabled={!canSave || mutation.isPending}
          onClick={() => mutation.mutate()}
          style={{ opacity: !canSave || mutation.isPending ? 0.4 : 1 }}
        >
          {mutation.isPending ? "…" : "Добавить"}
        </button>
      </div>
      {mutation.isError && (
        <div className="field-error">{String(mutation.error)}</div>
      )}
    </div>
  );
}

function pluralПункт(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "пункт";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "пункта";
  return "пунктов";
}

function formatDayHeading(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  return `${day} ${months[d.getMonth()]}`;
}
