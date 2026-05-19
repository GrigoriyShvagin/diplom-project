import { useState, type CSSProperties } from "react";
import { useMutation } from "@tanstack/react-query";
import { useT } from "@/shared/lib/i18n";
import { useAuth } from "@/shared/lib/auth-context";
import { Modal } from "@/shared/ui/Modal";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { createExpense, type ApiExpense } from "@/shared/api/expenses";
import type { ApiTripMember } from "@/shared/api/trips";

type FormState = {
  title: string;
  amount: string;
  payerId: string;
  split: string[];
};

const chipStyle = (selected: boolean, accent: "ink" | "terracotta" = "ink"): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 12px 6px 6px",
  borderRadius: "var(--r-pill)",
  border: `1px solid ${
    selected
      ? accent === "terracotta"
        ? "var(--terracotta)"
        : "var(--ink)"
      : "var(--line)"
  }`,
  background: selected
    ? accent === "terracotta"
      ? "oklch(from var(--terracotta) l c h / 0.1)"
      : "var(--paper-2)"
    : "var(--paper)",
  fontSize: 13,
  fontWeight: selected ? 500 : 400,
  opacity: selected || accent === "terracotta" ? 1 : 0.7,
});

export function AddExpenseModal({
  open,
  onClose,
  onCreated,
  tripId,
  members,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (expense: ApiExpense) => void;
  tripId: string;
  members: ApiTripMember[];
}) {
  const { t } = useT();
  const auth = useAuth();
  const defaultPayer = auth.user?.id ?? members[0]?.user.id ?? "";
  const defaultSplit = members.map((m) => m.user.id);
  const [form, setForm] = useState<FormState>({
    title: "",
    amount: "",
    payerId: defaultPayer,
    split: defaultSplit,
  });

  // re-init when the modal opens
  const openKey = open ? `${defaultPayer}-${defaultSplit.join(",")}` : "";
  const [seedKey, setSeedKey] = useState("");
  if (openKey && openKey !== seedKey) {
    setForm({
      title: "",
      amount: "",
      payerId: defaultPayer,
      split: defaultSplit,
    });
    setSeedKey(openKey);
  }

  const toggleSplit = (id: string) => {
    setForm((f) => ({
      ...f,
      split: f.split.includes(id)
        ? f.split.filter((x) => x !== id)
        : [...f.split, id],
    }));
  };

  const mutation = useMutation({
    mutationFn: () =>
      createExpense(tripId, {
        title: form.title.trim(),
        amount: Number(form.amount),
        payerId: form.payerId,
        splitUserIds: form.split,
      }),
    onSuccess: (expense) => onCreated(expense),
  });

  const amountNum = Number(form.amount);
  const valid =
    form.title.trim().length > 0 &&
    amountNum > 0 &&
    form.split.length > 0 &&
    members.some((m) => m.user.id === form.payerId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Новый расход"
      subtitle="Делим автоматически между выбранными участниками."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className="label">{t("trip.budget.expense")}</label>
          <input
            className="input"
            placeholder="Например: бензин"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t("trip.budget.amount")}</label>
          <input
            className="input"
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t("trip.budget.payer")}</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {members.map((m) => {
              const sel = form.payerId === m.user.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setForm({ ...form, payerId: m.user.id })}
                  style={chipStyle(sel, "terracotta")}
                >
                  <UserAvatar user={m.user} size={24} ring={false} />
                  {m.user.name}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="label">{t("trip.budget.split")}</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {members.map((m) => {
              const sel = form.split.includes(m.user.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleSplit(m.user.id)}
                  style={chipStyle(sel)}
                >
                  <UserAvatar user={m.user} size={24} ring={false} />
                  {m.user.name}
                </button>
              );
            })}
          </div>
          {form.split.length > 0 && amountNum > 0 && (
            <div
              className="mono"
              style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}
            >
              ≈ {Math.round(amountNum / form.split.length).toLocaleString("ru")} ₽ с
              человека
            </div>
          )}
        </div>
        {mutation.isError && (
          <div className="field-error">{String(mutation.error)}</div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginTop: 28,
          paddingTop: 20,
          borderTop: "1px solid var(--line)",
        }}
      >
        <button className="btn btn-ghost" onClick={onClose}>
          {t("common.cancel")}
        </button>
        <button
          className="btn btn-primary"
          disabled={!valid || mutation.isPending}
          style={{ opacity: !valid || mutation.isPending ? 0.4 : 1 }}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "…" : t("common.add")}
        </button>
      </div>
    </Modal>
  );
}
