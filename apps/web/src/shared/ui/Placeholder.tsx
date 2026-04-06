import type { CSSProperties } from "react";

export function Placeholder({
  label,
  height = 220,
  style = {},
}: {
  label: string;
  height?: number;
  style?: CSSProperties;
}) {
  return (
    <div className="imgph" style={{ height, ...style }}>
      <span className="imgph-label">{label}</span>
    </div>
  );
}
