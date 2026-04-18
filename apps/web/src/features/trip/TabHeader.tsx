import type { ReactNode } from "react";

export function TabHeader({
  eyebrow,
  title,
  italic,
  action,
}: {
  eyebrow: string;
  title: string;
  italic: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: 16,
        paddingBottom: 16,
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1 style={{ fontSize: 56, marginTop: 8, lineHeight: 1.0 }}>
          {title}{" "}
          <span className="display-italic" style={{ color: "var(--terracotta)" }}>
            {italic}
          </span>
        </h1>
      </div>
      {action}
    </div>
  );
}
