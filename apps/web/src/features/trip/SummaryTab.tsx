import { type CSSProperties } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAnalysis,
  runAnalysis,
  type AnalysisItem,
  type AnalysisSection,
} from "@/shared/api/chat";

const ghostPill: CSSProperties = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "transparent",
  border: "1px solid var(--line)",
  color: "var(--ink-2)",
  fontSize: 12,
};

const SECTION_ICON: Record<AnalysisSection["key"], string> = {
  directions: "📍",
  budget: "₽",
  dates: "◷",
  interests: "◇",
  constraints: "!",
  conflicts: "⚡",
};

export function SummaryTab({
  tripId,
  onGoVotes,
}: {
  tripId: string;
  onGoVotes: () => void;
}) {
  const queryClient = useQueryClient();
  const analysisKey = ["trips", tripId, "analysis"] as const;

  const analysisQuery = useQuery({
    queryKey: analysisKey,
    queryFn: () => getAnalysis(tripId),
  });

  const analyzeMutation = useMutation({
    mutationFn: () => runAnalysis(tripId),
    onSuccess: (result) => {
      queryClient.setQueryData(analysisKey, result);
    },
  });

  const analysis = analysisQuery.data;
  const conflictsCount =
    analysis?.sections.find((s) => s.key === "conflicts")?.items.length ?? 0;

  const running = analyzeMutation.isPending;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxWidth: 920,
        margin: "0 auto",
      }}
    >
      <div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>
          {analysis
            ? `анализ чата · ${analysis.messageCount} сообщений · ${formatWhen(analysis.createdAt)}`
            : "анализ чата ещё не запускался"}
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.15 }}>
          Сводка{" "}
          <span className="display-italic" style={{ color: "var(--terracotta)" }}>
            договорённостей
          </span>
        </h1>
        <p style={{ color: "var(--ink-3)", fontSize: 14, marginTop: 6 }}>
          Гид читает ваш чат и собирает ключевые договорённости и разногласия.
        </p>
      </div>

      {analyzeMutation.isError && (
        <div className="field-error">{String(analyzeMutation.error)}</div>
      )}

      {!analysis && !analysisQuery.isLoading && (
        <EmptyAnalysis onRun={() => analyzeMutation.mutate()} running={running} />
      )}

      {analysisQuery.isLoading && (
        <div className="mono" style={{ color: "var(--ink-3)", fontSize: 13 }}>
          загрузка…
        </div>
      )}

      {analysis && (
        <>
          {analysis.summary && (
            <div
              className="card"
              style={{
                padding: 18,
                background: "var(--paper-2)",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {analysis.summary}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            {analysis.sections
              .filter((s) => s.items.length > 0)
              .map((s) => (
                <SumSection key={s.key} section={s} />
              ))}
          </div>

          {conflictsCount > 0 && (
            <div
              style={{
                padding: 18,
                background:
                  "linear-gradient(180deg, oklch(from var(--terracotta) l c h / 0.05), transparent)",
                border: "1px solid oklch(from var(--terracotta) l c h / 0.25)",
                borderRadius: 12,
                display: "flex",
                gap: 16,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 240 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--ink)",
                    marginBottom: 2,
                  }}
                >
                  {conflictsCount}{" "}
                  {conflictsCount === 1 ? "зона разногласий" : "зоны разногласий"}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                  Создайте голосование, чтобы группа договорилась.
                </div>
              </div>
              <button className="btn btn-primary" onClick={onGoVotes}>
                + Создать голосование
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, color: "var(--ink-3)", fontSize: 12 }}>
            <button
              style={ghostPill}
              onClick={() => analyzeMutation.mutate()}
              disabled={running}
            >
              {running ? "↻ собираю…" : "↻ Пересобрать сводку"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyAnalysis({ onRun, running }: { onRun: () => void; running: boolean }) {
  return (
    <div
      className="card"
      style={{
        padding: 40,
        textAlign: "center",
        background: "var(--paper-2)",
        border: "1.5px dashed var(--line-2)",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 12 }}>🧭</div>
      <h3 style={{ fontSize: 22, marginBottom: 8 }}>Сводки пока нет</h3>
      <p
        style={{
          color: "var(--ink-2)",
          maxWidth: 420,
          margin: "0 auto 20px",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        Когда в чате накопятся обсуждения, гид прочитает их и соберёт
        договорённости, бюджет, даты и спорные моменты.
      </p>
      <button className="btn btn-primary" onClick={onRun} disabled={running}>
        {running ? "Анализирую…" : "Проанализировать чат"}
      </button>
    </div>
  );
}

function SumSection({ section }: { section: AnalysisSection }) {
  const tone = section.key === "conflicts" ? "warn" : undefined;
  const accent = tone === "warn" ? "oklch(0.62 0.135 40)" : "var(--ink)";
  return (
    <section
      style={{
        padding: 16,
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderRadius: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background:
              tone === "warn"
                ? "oklch(from var(--terracotta) l c h / 0.14)"
                : "var(--paper-2)",
            color: accent,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {SECTION_ICON[section.key]}
        </span>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>{section.title}</h3>
      </div>
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        {section.items.map((it, i) => (
          <SumItem key={i} item={it} last={i === section.items.length - 1} />
        ))}
      </ul>
    </section>
  );
}

function SumItem({ item, last }: { item: AnalysisItem; last: boolean }) {
  return (
    <li
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "flex-start",
        fontSize: 13,
        color: item.strong ? "var(--ink)" : "var(--ink-2)",
        fontWeight: item.strong ? 500 : 400,
        lineHeight: 1.45,
        paddingBottom: 8,
        borderBottom: last ? "none" : "1px dashed var(--line)",
      }}
    >
      <span style={{ flex: 1 }}>
        {item.conflict && (
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "var(--terracotta)",
              marginRight: 8,
              verticalAlign: "middle",
            }}
          />
        )}
        {item.text}
      </span>
      {item.sources != null && item.sources > 0 && (
        <span
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--ink-3)",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          ~{item.sources} упом.
        </span>
      )}
    </li>
  );
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
