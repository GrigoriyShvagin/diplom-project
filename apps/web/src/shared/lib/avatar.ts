export function colorFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(h) % 360;
  return `oklch(0.74 0.10 ${hue})`;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const out = parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
  return out || "?";
}
