import { useT } from "@/shared/lib/i18n";
import { MEMBERS } from "@/shared/lib/demo";
import { Avatar } from "@/shared/ui/Avatar";
import { TabHeader } from "./TabHeader";

type RosterEntry = {
  id: string;
  role: "owner" | "member";
  joined: string;
  places: number;
};

const ROSTER: RosterEntry[] = [
  { id: "me", role: "owner", joined: "12.05", places: 5 },
  { id: "m1", role: "member", joined: "13.05", places: 3 },
  { id: "m2", role: "member", joined: "14.05", places: 4 },
  { id: "m3", role: "member", joined: "16.05", places: 2 },
];

export function MembersTab() {
  const { t } = useT();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <TabHeader
        eyebrow={`участники · ${ROSTER.length} / 6`}
        title="Команда"
        italic="поездки"
        action={<button className="btn btn-primary">+ {t("trip.members.invite")}</button>}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
          maxWidth: 1100,
        }}
      >
        {ROSTER.map((r) => {
          const m = MEMBERS.find((x) => x.id === r.id);
          return (
            <div
              key={r.id}
              className="card"
              style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}
            >
              <Avatar id={r.id} size={48} ring={false} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{m?.name}</div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--ink-3)",
                    letterSpacing: "0.04em",
                  }}
                >
                  с {r.joined} · {r.places} мест добавлено
                </div>
              </div>
              <span
                className="badge"
                style={{
                  color: r.role === "owner" ? "var(--terracotta)" : "var(--ink-3)",
                }}
              >
                <span className="dot" />
                {r.role === "owner"
                  ? t("trip.members.role.owner")
                  : t("trip.members.role.member")}
              </span>
            </div>
          );
        })}
        <button
          className="card"
          style={{
            padding: 20,
            border: "1.5px dashed var(--line-2)",
            background: "transparent",
            color: "var(--ink-2)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "var(--paper-2)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontFamily: "var(--font-display)",
            }}
          >
            +
          </span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{t("trip.members.invite")}</span>
        </button>
      </div>

      <div className="card" style={{ padding: 20, background: "var(--paper-2)" }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          ссылка-приглашение
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <code
            style={{
              flex: 1,
              padding: "10px 14px",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-md)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--ink-2)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            journey.app/join/k7-georgia-2026-9af
          </code>
          <button className="btn btn-ghost btn-sm">копировать</button>
        </div>
      </div>
    </div>
  );
}
