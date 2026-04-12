import { useT } from "@/shared/lib/i18n";

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  const { t } = useT();
  return (
    <div
      style={{
        padding: "80px 32px",
        textAlign: "center",
        border: "1px dashed var(--line-2)",
        borderRadius: "var(--r-xl)",
        background: "var(--paper-2)",
      }}
    >
      <svg width="120" height="80" viewBox="0 0 120 80" style={{ marginBottom: 24 }}>
        <path
          d="M10 60 L 30 30 L 50 50 L 75 25 L 110 60 L 110 70 L 10 70 Z"
          fill="var(--paper-3)"
          stroke="var(--line-2)"
        />
        <circle cx="90" cy="22" r="8" fill="var(--terracotta)" opacity="0.6" />
        <path
          d="M20 65 Q 50 50 80 60 T 105 60"
          stroke="var(--terracotta)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="3 3"
        />
      </svg>
      <h3 style={{ fontSize: 32, marginBottom: 8 }}>{t("dash.empty.h")}</h3>
      <p style={{ color: "var(--ink-2)", maxWidth: 420, margin: "0 auto 24px" }}>
        {t("dash.empty.d")}
      </p>
      <button className="btn btn-primary" onClick={onCreate}>
        + {t("nav.create")}
      </button>
    </div>
  );
}
