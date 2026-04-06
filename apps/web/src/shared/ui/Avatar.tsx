import { MEMBERS } from "@/shared/lib/demo";

export function Avatar({
  id,
  size = 32,
  ring = true,
}: {
  id: string;
  size?: number;
  ring?: boolean;
}) {
  const m = MEMBERS.find((x) => x.id === id) ?? { initials: "?", color: "var(--paper-3)" };
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: m.color,
        color: "oklch(0.20 0.02 60)",
        border: ring ? "2px solid var(--paper)" : "none",
      }}
    >
      {m.initials}
    </span>
  );
}

export function AvatarStack({
  ids,
  max = 5,
  size = 28,
}: {
  ids: string[];
  max?: number;
  size?: number;
}) {
  const shown = ids.slice(0, max);
  const overflow = ids.length - shown.length;
  return (
    <span className="avatar-stack" style={{ alignItems: "center" }}>
      {shown.map((id) => (
        <Avatar key={id} id={id} size={size} />
      ))}
      {overflow > 0 && (
        <span
          className="avatar"
          style={{
            width: size,
            height: size,
            fontSize: Math.round(size * 0.32),
            background: "var(--paper)",
            color: "var(--ink-2)",
            border: "2px solid var(--paper)",
            fontFamily: "var(--font-mono)",
          }}
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}
