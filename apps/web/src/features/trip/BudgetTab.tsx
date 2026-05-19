import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useT } from "@/shared/lib/i18n";
import { useAuth } from "@/shared/lib/auth-context";
import {
  deleteExpense,
  listExpenses,
  type ApiExpense,
} from "@/shared/api/expenses";
import { getTrip, type ApiTripMember } from "@/shared/api/trips";
import { UserAvatar, UserAvatarStack } from "@/shared/ui/UserAvatar";
import { TabHeader } from "./TabHeader";
import { AddExpenseModal } from "./AddExpenseModal";

export function BudgetTab({ tripId }: { tripId: string }) {
  const { t } = useT();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const expensesKey = ["trips", tripId, "expenses"] as const;
  const tripKey = ["trips", tripId] as const;

  const [addOpen, setAddOpen] = useState(false);

  const expensesQuery = useQuery({ queryKey: expensesKey, queryFn: () => listExpenses(tripId) });
  const tripQuery = useQuery({ queryKey: tripKey, queryFn: () => getTrip(tripId) });

  const expenses: ApiExpense[] = useMemo(
    () => expensesQuery.data ?? [],
    [expensesQuery.data],
  );
  const members: ApiTripMember[] = useMemo(
    () => tripQuery.data?.members ?? [],
    [tripQuery.data?.members],
  );

  const total = expenses.reduce((a, b) => a + b.amount, 0);
  const headcount = members.length || 1;
  const perPerson = Math.round(total / headcount);

  const balances = useMemo(() => {
    const bal: Record<string, number> = {};
    for (const m of members) bal[m.user.id] = 0;
    for (const e of expenses) {
      bal[e.createdBy.id] = (bal[e.createdBy.id] ?? 0) + e.amount;
      for (const s of e.splits) {
        bal[s.user.id] = (bal[s.user.id] ?? 0) - s.amount;
      }
    }
    return bal;
  }, [expenses, members]);

  const myId = auth.user?.id;
  const myBalance = myId ? (balances[myId] ?? 0) : 0;

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteExpense(tripId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expensesKey }),
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <TabHeader
        eyebrow={`бюджет · ${expenses.length} ${pluralRas(expenses.length)}`}
        title="Деньги"
        italic="без споров"
        action={
          <button onClick={() => setAddOpen(true)} className="btn btn-primary">
            + {t("trip.budget.add")}
          </button>
        }
      />

      {(expensesQuery.isLoading || tripQuery.isLoading) && (
        <div className="mono" style={{ color: "var(--ink-3)", fontSize: 13 }}>
          загрузка…
        </div>
      )}

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
          <div className="eyebrow" style={{ color: "oklch(0.65 0.012 65)", marginBottom: 14 }}>
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
          {members.length === 0 && (
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
              пока пусто
            </div>
          )}
          {members.map((m) => {
            const b = balances[m.user.id] ?? 0;
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 0",
                }}
              >
                <UserAvatar user={m.user} size={24} ring={false} />
                <span style={{ flex: 1, fontSize: 13 }}>{m.user.name}</span>
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
            );
          })}
        </div>
      </div>

      {expenses.length === 0 && expensesQuery.isSuccess ? (
        <div
          className="card"
          style={{
            padding: 32,
            textAlign: "center",
            background: "var(--paper-2)",
            border: "1.5px dashed var(--line-2)",
            color: "var(--ink-2)",
          }}
        >
          <div style={{ fontSize: 16, marginBottom: 6 }}>Расходов пока нет</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
            Нажмите «+ Добавить расход», чтобы начать
          </div>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 140px 200px 110px 40px",
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
            <span />
          </div>
          {expenses.map((e, i) => (
            <div
              key={e.id}
              style={{
                display: "grid",
                gridTemplateColumns: "60px 1fr 140px 200px 110px 40px",
                padding: "16px 20px",
                borderBottom: i < expenses.length - 1 ? "1px solid var(--line)" : "none",
                alignItems: "center",
                fontSize: 14,
              }}
            >
              <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                {formatExpenseDate(e.expenseDate ?? e.createdAt)}
              </span>
              <span style={{ fontWeight: 500 }}>{e.title}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <UserAvatar user={e.createdBy} size={22} ring={false} />
                <span
                  style={{
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {e.createdBy.name}
                </span>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center" }}>
                <UserAvatarStack users={e.splits.map((s) => s.user)} size={22} max={5} />
                <span
                  className="mono"
                  style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 8 }}
                >
                  ×{e.splits.length}
                </span>
              </span>
              <span
                className="mono"
                style={{ textAlign: "right", fontSize: 14, fontWeight: 600 }}
              >
                {e.amount.toLocaleString("ru")} ₽
              </span>
              <button
                onClick={() => {
                  if (confirm(`Удалить расход «${e.title}»?`)) {
                    removeMutation.mutate(e.id);
                  }
                }}
                title="Удалить"
                style={{
                  color: "var(--ink-3)",
                  fontSize: 16,
                  padding: "0 8px",
                  textAlign: "right",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <AddExpenseModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        tripId={tripId}
        members={members}
        onCreated={() => {
          setAddOpen(false);
          void queryClient.invalidateQueries({ queryKey: expensesKey });
        }}
      />
    </div>
  );
}

function pluralRas(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "расход";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "расхода";
  return "расходов";
}

function formatExpenseDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}
