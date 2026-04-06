export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "var(--ink)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <span
          style={{
            width: size * 0.5,
            height: 2,
            background: "var(--terracotta)",
            transform: "rotate(45deg)",
            position: "absolute",
          }}
        />
        <span
          style={{
            width: 2,
            height: size * 0.5,
            background: "var(--paper)",
            transform: "rotate(45deg)",
            position: "absolute",
          }}
        />
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: size * 0.7,
          fontStyle: "italic",
          letterSpacing: "-0.02em",
        }}
      >
        journey
      </span>
    </span>
  );
}
