import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useT } from "@/shared/lib/i18n";
import { Logo } from "@/shared/ui/Logo";
import { LangSwitcher } from "@/shared/ui/LangSwitcher";
import { useAuth } from "@/shared/lib/auth-context";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { getTrip } from "@/shared/api/trips";
import { ApiError } from "@/shared/api/client";
import { formatTripDates } from "@/shared/lib/format";
import { ChatTab } from "@/features/trip/ChatTab";
import { SummaryTab } from "@/features/trip/SummaryTab";
import { MapTab } from "@/features/trip/MapTab";
import { ItineraryTab } from "@/features/trip/ItineraryTab";
import { VotesTab } from "@/features/trip/VotesTab";
import { BudgetTab } from "@/features/trip/BudgetTab";
import { MembersTab } from "@/features/trip/MembersTab";
import { FinalTab } from "@/features/trip/FinalTab";

type TabId =
  | "chat"
  | "summary"
  | "map"
  | "itin"
  | "votes"
  | "budget"
  | "members"
  | "final";

export function TripDetailPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const auth = useAuth();
  const { id } = useParams<{ id: string }>();
  const tripId = id ?? "";

  const tripQuery = useQuery({
    queryKey: ["trips", tripId] as const,
    queryFn: () => getTrip(tripId),
    enabled: tripId.length > 0,
  });

  const [tab, setTab] = useState<TabId>("itin");

  const tabs: { id: TabId; label: string }[] = [
    { id: "chat", label: "Чат" },
    { id: "summary", label: "Сводка" },
    { id: "map", label: t("trip.tab.map") },
    { id: "itin", label: t("trip.tab.itin") },
    { id: "votes", label: t("trip.tab.votes") },
    { id: "budget", label: t("trip.tab.budget") },
    { id: "members", label: t("trip.tab.members") },
    { id: "final", label: "Итоги" },
  ];

  if (tripQuery.isLoading) {
    return <CenteredNote text="загрузка…" />;
  }

  if (tripQuery.isError) {
    const err = tripQuery.error;
    const status = err instanceof ApiError ? err.status : 0;
    return (
      <CenteredNote
        text={
          status === 404
            ? "Поездка не найдена"
            : status === 403
              ? "Нет доступа к этой поездке"
              : "Не удалось загрузить поездку"
        }
        sub={<Link to="/trips" className="btn btn-ghost btn-sm">← На дашборд</Link>}
      />
    );
  }

  const trip = tripQuery.data;
  if (!trip) return <CenteredNote text="Поездка не найдена" />;

  const subtitle = [
    trip.destinationLabel,
    formatTripDates(trip.startDate, trip.endDate),
    `${trip.members.length} ${trip.members.length === 1 ? "человек" : "человек"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="fade-in"
      style={{ minHeight: "100vh", background: "var(--paper)", display: "flex" }}
    >
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid var(--line)",
          background: "var(--paper)",
          padding: "20px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 6px" }}>
          <button
            onClick={() => navigate("/trips")}
            title="Все поездки"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-3)",
              fontSize: 16,
            }}
          >
            ←
          </button>
          <button onClick={() => navigate("/trips")} style={{ flex: 1, textAlign: "left" }}>
            <Logo size={22} />
          </button>
        </div>

        <div style={{ padding: "0 8px" }}>
          <h2 style={{ fontSize: 17, lineHeight: 1.2, fontWeight: 600 }}>{trip.title}</h2>
          <p style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{subtitle}</p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {tabs.map((tb) => {
            const active = tab === tb.id;
            return (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: active ? "var(--paper-2)" : "transparent",
                  color: active ? "var(--ink)" : "var(--ink-2)",
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  textAlign: "left",
                  position: "relative",
                }}
              >
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 8,
                      bottom: 8,
                      width: 2,
                      borderRadius: 2,
                      background: "var(--terracotta)",
                    }}
                  />
                )}
                {tb.label}
              </button>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: "auto",
            padding: "0 8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {auth.user && <UserAvatar user={auth.user} size={26} ring={false} />}
          <LangSwitcher />
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "32px 40px" }}>
        {tab === "chat" && <ChatTab tripId={tripId} />}
        {tab === "summary" && (
          <SummaryTab tripId={tripId} onGoVotes={() => setTab("votes")} />
        )}
        {tab === "map" && <MapTab />}
        {tab === "itin" && <ItineraryTab tripId={tripId} />}
        {tab === "votes" && <VotesTab tripId={tripId} />}
        {tab === "budget" && <BudgetTab tripId={tripId} />}
        {tab === "members" && <MembersTab tripId={tripId} />}
        {tab === "final" && <FinalTab />}
      </main>
    </div>
  );
}

function CenteredNote({ text, sub }: { text: string; sub?: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        color: "var(--ink-3)",
      }}
    >
      <div className="mono" style={{ fontSize: 13 }}>{text}</div>
      {sub}
    </div>
  );
}
