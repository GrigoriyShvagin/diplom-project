import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useT } from "@/shared/lib/i18n";
import {
  castAnswer,
  createVote,
  listVotes,
  type ApiVote,
} from "@/shared/api/votes";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { Modal } from "@/shared/ui/Modal";
import { TabHeader } from "./TabHeader";

export function VotesTab({ tripId }: { tripId: string }) {
  const { t } = useT();
  const queryClient = useQueryClient();
  const votesKey = ["trips", tripId, "votes"] as const;
  const [createOpen, setCreateOpen] = useState(false);

  const votesQuery = useQuery({
    queryKey: votesKey,
    queryFn: () => listVotes(tripId),
  });

  const votes = votesQuery.data ?? [];

  const answerMutation = useMutation({
    mutationFn: ({ voteId, optionId }: { voteId: string; optionId: string }) =>
      castAnswer(tripId, voteId, optionId),
    onSuccess: (updated) => {
      queryClient.setQueryData<ApiVote[]>(votesKey, (prev) =>
        prev ? prev.map((v) => (v.id === updated.id ? updated : v)) : prev,
      );
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <TabHeader
        eyebrow={`голосования · ${votes.filter((v) => !v.resolvedAt).length} активных`}
        title="Решаем"
        italic="вместе"
        action={
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            + {t("trip.votes.add")}
          </button>
        }
      />

      {votesQuery.isLoading && (
        <div className="mono" style={{ color: "var(--ink-3)", fontSize: 13 }}>
          загрузка…
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: 16,
          maxWidth: 1100,
        }}
      >
        {votes.map((v) => (
          <VoteCard
            key={v.id}
            vote={v}
            onVote={(oid) =>
              answerMutation.mutate({ voteId: v.id, optionId: oid })
            }
            voting={
              answerMutation.isPending &&
              answerMutation.variables?.voteId === v.id
            }
          />
        ))}

        <button
          className="card"
          onClick={() => setCreateOpen(true)}
          style={{
            padding: 24,
            border: "1.5px dashed var(--line-2)",
            background: "transparent",
            minHeight: 220,
            color: "var(--ink-2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              width: 44,
              height: 44,
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
          <span style={{ fontSize: 14, fontWeight: 500 }}>{t("trip.votes.add")}</span>
        </button>
      </div>

      <CreateVoteModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          void queryClient.invalidateQueries({ queryKey: votesKey });
        }}
        tripId={tripId}
      />
    </div>
  );
}

function VoteCard({
  vote,
  onVote,
  voting,
}: {
  vote: ApiVote;
  onVote: (optionId: string) => void;
  voting: boolean;
}) {
  const { t } = useT();
  const total = vote.total || 1;
  const isResolved = Boolean(vote.resolvedAt);
  const maxCount = Math.max(...vote.options.map((o) => o.count));

  return (
    <article
      className="card"
      style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="eyebrow"
            style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}
          >
            <UserAvatar user={vote.createdBy} size={16} ring={false} />
            <span>{vote.createdBy.name}</span>
          </div>
          <h3 style={{ fontSize: 20, lineHeight: 1.2 }}>{vote.title}</h3>
        </div>
        {isResolved ? (
          <span className="badge" style={{ color: "var(--moss)" }}>
            <span className="dot" />
            {t("trip.votes.resolved")}
          </span>
        ) : (
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
            {vote.total} {pluralГолос(vote.total)}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {vote.options.map((o) => {
          const pct = Math.round((o.count / total) * 100);
          const isMy = vote.myAnswer === o.id;
          const isWinner = isResolved && o.count === maxCount && o.count > 0;
          return (
            <button
              key={o.id}
              onClick={() => !isResolved && !voting && onVote(o.id)}
              disabled={isResolved || voting}
              style={{
                position: "relative",
                padding: "12px 14px",
                borderRadius: "var(--r-md)",
                border: `1px solid ${isMy || isWinner ? "var(--terracotta)" : "var(--line)"}`,
                background: "var(--paper)",
                textAlign: "left",
                overflow: "hidden",
                cursor: isResolved || voting ? "default" : "pointer",
                opacity: voting ? 0.7 : 1,
                transition: "border-color 0.15s, background 0.15s, opacity 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isResolved && !voting && !isMy)
                  e.currentTarget.style.background = "var(--paper-2)";
              }}
              onMouseLeave={(e) => {
                if (!isResolved && !voting && !isMy)
                  e.currentTarget.style.background = "var(--paper)";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${pct}%`,
                  background:
                    isMy || isWinner
                      ? "oklch(from var(--terracotta) l c h / 0.15)"
                      : "oklch(from var(--ink) l c h / 0.05)",
                  transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: isMy || isWinner ? 500 : 400 }}>
                  {isMy && (
                    <span style={{ color: "var(--terracotta)", marginRight: 6 }}>✓</span>
                  )}
                  {o.label}
                </span>
                <span className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>
                  {pct}% · {o.count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {!isResolved && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: 6,
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: 11,
              color: vote.myAnswer ? "var(--terracotta)" : "var(--ink-3)",
            }}
          >
            {vote.myAnswer
              ? `✓ ${t("trip.votes.voted").toLowerCase()}`
              : "вы ещё не голосовали"}
          </span>
        </div>
      )}
    </article>
  );
}

function CreateVoteModal({
  open,
  onClose,
  onCreated,
  tripId,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  tripId: string;
}) {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  const mutation = useMutation({
    mutationFn: () =>
      createVote(tripId, {
        title: title.trim(),
        options: options.map((o) => o.trim()).filter((o) => o.length > 0),
      }),
    onSuccess: () => {
      setTitle("");
      setOptions(["", ""]);
      onCreated();
    },
  });

  const cleanedOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);
  const canSubmit = title.trim().length > 0 && cleanedOptions.length >= 2;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Новое голосование"
      subtitle="Сформулируйте вопрос и добавьте варианты ответа"
      width={520}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className="label">Вопрос</label>
          <input
            className="input"
            placeholder="Где ужинаем во второй вечер?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Варианты</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {options.map((opt, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  className="input"
                  placeholder={`Вариант ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const next = [...options];
                    next[i] = e.target.value;
                    setOptions(next);
                  }}
                />
                {options.length > 2 && (
                  <button
                    onClick={() => setOptions(options.filter((_, j) => j !== i))}
                    style={{
                      color: "var(--ink-3)",
                      fontSize: 16,
                      padding: "0 8px",
                    }}
                    title="Убрать"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setOptions([...options, ""])}
              style={{
                alignSelf: "flex-start",
                fontSize: 13,
                color: "var(--terracotta)",
                padding: "4px 0",
              }}
            >
              + ещё вариант
            </button>
          </div>
        </div>
        {mutation.isError && (
          <div className="field-error">{String(mutation.error)}</div>
        )}
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
        <button className="btn btn-ghost" onClick={onClose} disabled={mutation.isPending}>
          Отмена
        </button>
        <button
          className="btn btn-primary"
          onClick={() => mutation.mutate()}
          disabled={!canSubmit || mutation.isPending}
          style={{ opacity: !canSubmit || mutation.isPending ? 0.4 : 1 }}
        >
          {mutation.isPending ? "…" : "Создать"}
        </button>
      </div>
    </Modal>
  );
}

function pluralГолос(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "голос";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "голоса";
  return "голосов";
}
