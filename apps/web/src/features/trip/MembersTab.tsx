import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useT } from "@/shared/lib/i18n";
import { useAuth } from "@/shared/lib/auth-context";
import { getTrip, inviteMember, removeMember, type ApiTripMember } from "@/shared/api/trips";
import { ApiError } from "@/shared/api/client";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { Modal } from "@/shared/ui/Modal";
import { TabHeader } from "./TabHeader";

export function MembersTab({ tripId }: { tripId: string }) {
  const { t } = useT();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const tripKey = ["trips", tripId] as const;
  const [inviteOpen, setInviteOpen] = useState(false);

  const tripQuery = useQuery({
    queryKey: tripKey,
    queryFn: () => getTrip(tripId),
  });

  const trip = tripQuery.data;
  const members: ApiTripMember[] = trip?.members ?? [];
  const isOwner = trip?.ownerId === auth.user?.id;
  const inviteLink = `${window.location.origin}/trips/${tripId}/join`;

  const inviteMutation = useMutation({
    mutationFn: (email: string) => inviteMember(tripId, email),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tripKey });
      setInviteOpen(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => removeMember(tripId, memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tripKey });
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <TabHeader
        eyebrow={`участники · ${members.length}`}
        title="Команда"
        italic="поездки"
        action={
          <button className="btn btn-primary" onClick={() => setInviteOpen(true)}>
            + {t("trip.members.invite")}
          </button>
        }
      />

      {tripQuery.isLoading && (
        <div className="mono" style={{ color: "var(--ink-3)", fontSize: 13 }}>
          загрузка…
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
          maxWidth: 1100,
        }}
      >
        {members.map((m) => (
          <div
            key={m.id}
            className="card"
            style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}
          >
            <UserAvatar user={m.user} size={48} ring={false} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{m.user.name}</div>
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  letterSpacing: "0.04em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={m.user.email}
              >
                {m.user.email}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                className="badge"
                style={{
                  color: m.role === "owner" ? "var(--terracotta)" : "var(--ink-3)",
                }}
              >
                <span className="dot" />
                {m.role === "owner"
                  ? t("trip.members.role.owner")
                  : t("trip.members.role.member")}
              </span>
              {isOwner && m.role !== "owner" && (
                <button
                  onClick={() => {
                    if (confirm(`Удалить ${m.user.name} из поездки?`)) {
                      removeMutation.mutate(m.id);
                    }
                  }}
                  title="Удалить участника"
                  style={{
                    color: "var(--ink-3)",
                    fontSize: 16,
                    padding: "0 4px",
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          onClick={() => setInviteOpen(true)}
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
            {inviteLink}
          </code>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => void navigator.clipboard?.writeText(inviteLink)}
          >
            копировать
          </button>
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}>
          (ссылка-приглашение — будущая фича. Пока приглашайте по email через кнопку выше.)
        </div>
      </div>

      <InviteByEmailModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSubmit={(email) => inviteMutation.mutate(email)}
        submitting={inviteMutation.isPending}
        error={
          inviteMutation.error instanceof ApiError
            ? inviteMutation.error.status === 404
              ? "Пользователь с таким email ещё не зарегистрирован"
              : inviteMutation.error.status === 409
                ? "Уже участник этой поездки"
                : inviteMutation.error.message
            : inviteMutation.error
              ? "Не удалось пригласить участника"
              : null
        }
      />
    </div>
  );
}

function InviteByEmailModal({
  open,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [email, setEmail] = useState("");
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Пригласить друга"
      subtitle="Введите email уже зарегистрированного пользователя"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          placeholder="friend@journey.io"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
        {error && <div className="field-error">{error}</div>}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid var(--line)",
        }}
      >
        <button className="btn btn-ghost" onClick={onClose} disabled={submitting}>
          Отмена
        </button>
        <button
          className="btn btn-primary"
          disabled={!ok || submitting}
          style={{ opacity: !ok || submitting ? 0.4 : 1 }}
          onClick={() => onSubmit(email.trim())}
        >
          {submitting ? "…" : "Пригласить"}
        </button>
      </div>
    </Modal>
  );
}
