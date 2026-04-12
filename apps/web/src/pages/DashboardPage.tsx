import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useT } from "@/shared/lib/i18n";
import { TRIPS, type TripSummary, type TripStatus } from "@/shared/lib/demo";
import { Logo } from "@/shared/ui/Logo";
import { LangSwitcher } from "@/shared/ui/LangSwitcher";
import { Avatar } from "@/shared/ui/Avatar";
import { TripCard, NewTripCard } from "@/features/dashboard/TripCard";
import { EmptyState } from "@/features/dashboard/EmptyState";
import { CreateTripModal } from "@/features/dashboard/CreateTripModal";

type Filter = "all" | TripStatus;

export function DashboardPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [trips, setTrips] = useState<TripSummary[]>(TRIPS);

  const filtered = trips.filter((tr) => filter === "all" || tr.status === filter);

  return (
    <div className="fade-in" style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <header
        style={{
          borderBottom: "1px solid var(--line)",
          background: "oklch(from var(--paper) l c h / 0.85)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button onClick={() => navigate("/")}>
            <Logo />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button className="btn btn-ghost btn-sm" style={{ padding: "8px 12px" }}>
              🔔
            </button>
            <LangSwitcher />
            <Avatar id="me" size={36} ring={false} />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1320, margin: "0 auto", padding: "40px 32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ fontSize: 36, lineHeight: 1.1, fontWeight: 600 }}>
            {t("dash.greet")},{" "}
            <span className="display-italic" style={{ color: "var(--terracotta)" }}>
              Аня
            </span>
          </h1>
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            + {t("nav.create")}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            {(
              [
                { id: "all", label: t("dash.filter.all"), count: trips.length },
                {
                  id: "planning",
                  label: t("dash.filter.planning"),
                  count: trips.filter((x) => x.status === "planning").length,
                },
                {
                  id: "active",
                  label: t("dash.filter.active"),
                  count: trips.filter((x) => x.status === "active").length,
                },
                {
                  id: "done",
                  label: t("dash.filter.done"),
                  count: trips.filter((x) => x.status === "done").length,
                },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: filter === f.id ? "var(--paper-2)" : "transparent",
                  color: filter === f.id ? "var(--ink)" : "var(--ink-3)",
                  fontSize: 13,
                  fontWeight: filter === f.id ? 500 : 400,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              className="input"
              placeholder={t("common.search") + "..."}
              style={{ width: 240, padding: "8px 14px", fontSize: 13 }}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            {filtered.map((tr, i) => (
              <TripCard
                key={tr.id}
                trip={tr}
                index={i}
                onOpen={() => navigate(`/trips/${tr.id}`)}
              />
            ))}
            <NewTripCard onClick={() => setCreateOpen(true)} />
          </div>
        )}
      </main>

      <CreateTripModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(draft) => {
          const newTrip: TripSummary = {
            id: `t${Date.now()}`,
            title: draft.title,
            dest: draft.dest,
            dates: draft.dates,
            status: "planning",
            members: ["me"],
            cover: draft.cover || "новая поездка",
            days: draft.days,
          };
          setTrips([newTrip, ...trips]);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}
