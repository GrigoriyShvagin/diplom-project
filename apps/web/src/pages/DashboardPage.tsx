import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useT } from "@/shared/lib/i18n";
import { useAuth } from "@/shared/lib/auth-context";
import { listTrips, createTrip, type ApiTrip } from "@/shared/api/trips";
import { ApiError } from "@/shared/api/client";
import { Logo } from "@/shared/ui/Logo";
import { LangSwitcher } from "@/shared/ui/LangSwitcher";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { TripCard, NewTripCard } from "@/features/dashboard/TripCard";
import { EmptyState } from "@/features/dashboard/EmptyState";
import { CreateTripModal } from "@/features/dashboard/CreateTripModal";

type Filter = "all" | "draft" | "planning" | "active" | "done";

const tripsKey = ["trips"] as const;

export function DashboardPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const tripsQuery = useQuery({
    queryKey: tripsKey,
    queryFn: listTrips,
  });

  const createMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tripsKey });
      setCreateOpen(false);
      setCreateError(null);
    },
    onError: (err: unknown) => {
      setCreateError(err instanceof Error ? err.message : "Не удалось создать поездку");
    },
  });

  const trips = useMemo(() => tripsQuery.data ?? [], [tripsQuery.data]);
  const counts = useMemo(() => countByStatus(trips), [trips]);
  const filtered = trips.filter((tr) => filter === "all" || tr.status === filter);

  const firstName = auth.user?.name?.split(/\s+/)[0] ?? "";

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
            <button
              className="btn btn-ghost btn-sm"
              style={{ padding: "8px 12px" }}
              onClick={() => void auth.logout().then(() => navigate("/"))}
              title="Выйти"
            >
              ⎋
            </button>
            <LangSwitcher />
            {auth.user && <UserAvatar user={auth.user} size={36} ring={false} />}
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
              {firstName}
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
                { id: "planning", label: t("dash.filter.planning"), count: counts.planning },
                { id: "active", label: t("dash.filter.active"), count: counts.active },
                { id: "done", label: t("dash.filter.done"), count: counts.done },
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

        {tripsQuery.isLoading && (
          <div
            className="mono"
            style={{ color: "var(--ink-3)", fontSize: 13, padding: "60px 0", textAlign: "center" }}
          >
            загрузка…
          </div>
        )}

        {tripsQuery.isError && (
          <div
            style={{
              padding: "60px 24px",
              textAlign: "center",
              color: "var(--terracotta-ink)",
              fontSize: 14,
            }}
          >
            Не удалось получить список поездок. Проверьте, что API запущен.
            <div
              className="mono"
              style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}
            >
              {errorMessage(tripsQuery.error)}
            </div>
          </div>
        )}

        {tripsQuery.isSuccess && filtered.length === 0 ? (
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
            {tripsQuery.isSuccess && (
              <NewTripCard onClick={() => setCreateOpen(true)} />
            )}
          </div>
        )}
      </main>

      <CreateTripModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateError(null);
        }}
        onCreate={(draft) => createMutation.mutate(draft)}
        submitting={createMutation.isPending}
        error={createError}
      />
    </div>
  );
}

function countByStatus(trips: ApiTrip[]) {
  const counts = { draft: 0, planning: 0, active: 0, done: 0 };
  for (const t of trips) {
    if (t.status in counts) counts[t.status as keyof typeof counts] += 1;
  }
  return counts;
}

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return `${err.status} · ${err.message}`;
  if (err instanceof Error) return err.message;
  return String(err);
}
