import { useT } from "@/shared/lib/i18n";
import type { TripStatus } from "@/shared/lib/demo";

export function StatusBadge({ status }: { status: TripStatus }) {
  const { t } = useT();
  const map: Record<TripStatus, { label: string; color: string }> = {
    planning: { label: t("status.planning"), color: "var(--teal)" },
    active: { label: t("status.active"), color: "var(--terracotta)" },
    done: { label: t("status.done"), color: "var(--ink-3)" },
  };
  const s = map[status];
  return (
    <span className="badge" style={{ color: s.color }}>
      <span className="dot" />
      {s.label}
    </span>
  );
}
