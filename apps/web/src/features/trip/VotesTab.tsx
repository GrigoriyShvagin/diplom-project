import { useT } from "@/shared/lib/i18n";
import type { Vote } from "@/shared/lib/demo";
import { AvatarStack } from "@/shared/ui/Avatar";
import { TabHeader } from "./TabHeader";

export function VotesTab({
  votes,
  castVote,
}: {
  votes: Vote[];
  castVote: (voteId: string, optionId: string) => void;
}) {
  const { t } = useT();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <TabHeader
        eyebrow={`голосования · ${votes.filter((v) => v.status === "open").length} активных`}
        title="Решаем"
        italic="вместе"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: 16,
          maxWidth: 1100,
        }}
      >
        {votes.map((v) => (
          <VoteCard key={v.id} vote={v} onVote={(oid) => castVote(v.id, oid)} />
        ))}
        <button
          className="card"
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
    </div>
  );
}

function VoteCard({ vote, onVote }: { vote: Vote; onVote: (optionId: string) => void }) {
  const { t } = useT();
  const total = vote.options.reduce((a, b) => a + b.votes, 0) || 1;
  const isResolved = vote.status === "resolved";
  const maxVotes = Math.max(...vote.options.map((x) => x.votes));
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
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            от {vote.author}
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
            {total} {total === 1 ? "голос" : "голоса"}
          </span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {vote.options.map((o) => {
          const pct = Math.round((o.votes / total) * 100);
          const isMy = vote.myVote === o.id;
          const isWinner = isResolved && o.votes === maxVotes;
          return (
            <button
              key={o.id}
              onClick={() => !isResolved && onVote(o.id)}
              disabled={isResolved}
              style={{
                position: "relative",
                padding: "12px 14px",
                borderRadius: "var(--r-md)",
                border: `1px solid ${isMy || isWinner ? "var(--terracotta)" : "var(--line)"}`,
                background: "var(--paper)",
                textAlign: "left",
                overflow: "hidden",
                cursor: isResolved ? "default" : "pointer",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isResolved && !isMy)
                  e.currentTarget.style.background = "var(--paper-2)";
              }}
              onMouseLeave={(e) => {
                if (!isResolved && !isMy)
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
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: isMy || isWinner ? 500 : 400,
                  }}
                >
                  {isMy && (
                    <span style={{ color: "var(--terracotta)", marginRight: 6 }}>✓</span>
                  )}
                  {o.label}
                </span>
                <span className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>
                  {pct}% · {o.votes}
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
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 6,
          }}
        >
          <AvatarStack
            ids={vote.myVote ? ["me", "m1"] : ["m1", "m2"]}
            size={22}
            max={4}
          />
          <span
            className="mono"
            style={{
              fontSize: 11,
              color: vote.myVote ? "var(--terracotta)" : "var(--ink-3)",
            }}
          >
            {vote.myVote
              ? `✓ ${t("trip.votes.voted").toLowerCase()}`
              : "вы ещё не голосовали"}
          </span>
        </div>
      )}
      {isResolved && vote.resolution && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: "var(--r-md)",
            background: "oklch(from var(--moss) l c h / 0.12)",
            color: "var(--moss)",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          → {vote.resolution}
        </div>
      )}
    </article>
  );
}
