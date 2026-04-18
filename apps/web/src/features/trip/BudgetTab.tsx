import { useMemo } from "react";
import { useT } from "@/shared/lib/i18n";
import { MEMBERS, type Expense } from "@/shared/lib/demo";
import { Avatar, AvatarStack } from "@/shared/ui/Avatar";
import { TabHeader } from "./TabHeader";

export function BudgetTab({
  expenses,
  onAdd,
}: {
  expenses: Expense[];
  onAdd: () => void;
}) {
  const { t } = useT();
  const total = expenses.reduce((a, b) => a + b.amount, 0);
  const perPerson = Math.round(total / 4);

  const balances = useMemo(() => {
    const ids = ["me", "m1", "m2", "m3"];
    const bal: Record<string, number> = Object.fromEntries(ids.map((id) => [id, 0]));
    expenses.forEach((e) => {
      const share = e.amount / e.split.length;
      e.split.forEach((s) => {
        bal[s] = (bal[s] ?? 0) - share;
      });
      bal[e.payer] = (bal[e.payer] ?? 0) + e.amount;
    });
    return bal;
  }, [expenses]);

  const myBalance = balances.me ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <TabHeader
        eyebrow={`бюджет · ${expenses.length} расход.`}
        title="Деньги"
        italic="без споров"
        action={
          <button onClick={onAdd} className="btn btn-primary">
            + {t("trip.budget.add")}
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", gap: 12 }}>
        <div
          className="card"
          style={{
            padding: 24,
            background: "var(--ink)",
            color: "var(--paper)",
            border: "none",
          }}
        >
          <div
            className="eyebrow"
            style={{ color: "oklch(0.65 0.012 65)", marginBottom: 14 }}
          >
            {t("trip.budget.total")}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 64,
                lineHeight: 1,
                fontStyle: "italic",
              }}
            >
              {total.toLocaleString("ru")}
            </span>
            <span className="mono" style={{ fontSize: 14, opacity: 0.6 }}>
              ₽
            </span>
          </div>
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: "oklch(0.75 0.012 65)",
              marginTop: 16,
              letterSpacing: "0.06em",
            }}
          >
            ~ {perPerson.toLocaleString("ru")} ₽ {t("trip.budget.perPerson")}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            {t("trip.budget.balance")}
          </div>
          {Math.abs(myBalance) < 1 ? (
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                color: "var(--moss)",
              }}
            >
              {t("trip.budget.settled")}
            </div>
          ) : (
            <>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 36,
                  color: myBalance > 0 ? "var(--moss)" : "var(--terracotta)",
                  fontStyle: "italic",
                }}
              >
                {myBalance > 0 ? "+" : ""}
                {Math.round(myBalance).toLocaleString("ru")} ₽
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  marginTop: 8,
                  letterSpacing: "0.06em",
                }}
              >
                {myBalance > 0 ? t("trip.budget.owesYou") : t("trip.budget.youOwe")}
              </div>
            </>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            по участникам
          </div>
          {Object.entries(balances).map(([id, b]) => (
            <div
              key={id}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}
            >
              <Avatar id={id} size={24} ring={false} />
              <span style={{ flex: 1, fontSize: 13 }}>
                {MEMBERS.find((m) => m.id === id)?.name}
              </span>
              <span
                className="mono"
                style={{
                  fontSize: 12,
                  color: b >= 0 ? "var(--moss)" : "var(--terracotta)",
                }}
              >
                {b >= 0 ? "+" : ""}
                {Math.round(b).toLocaleString("ru")}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 120px 200px 100px",
            padding: "14px 20px",
            borderBottom: "1px solid var(--line)",
            background: "var(--paper-2)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-3)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <span>дата</span>
          <span>расход</span>
          <span>кто платил</span>
          <span>поделено</span>
          <span style={{ textAlign: "right" }}>сумма</span>
        </div>
        {expenses.map((e, i) => (
          <div
            key={e.id}
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 120px 200px 100px",
              padding: "16px 20px",
              borderBottom:
                i < expenses.length - 1 ? "1px solid var(--line)" : "none",
              alignItems: "center",
              fontSize: 14,
            }}
          >
            <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
              {e.date}
            </span>
            <span style={{ fontWeight: 500 }}>{e.title}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Avatar id={e.payer} size={22} ring={false} />
              <span style={{ fontSize: 13 }}>
                {MEMBERS.find((m) => m.id === e.payer)?.name}
              </span>
            </span>
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              <AvatarStack ids={e.split} size={22} max={5} />
              <span
                className="mono"
                style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 8 }}
              >
                ×{e.split.length}
              </span>
            </span>
            <span
              className="mono"
              style={{ textAlign: "right", fontSize: 14, fontWeight: 600 }}
            >
              {e.amount.toLocaleString("ru")} ₽
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
