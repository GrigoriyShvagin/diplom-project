import { useEffect, useState } from "react";
import { useT } from "@/shared/lib/i18n";
import { MEMBERS, ACTIVE_TRIP } from "@/shared/lib/demo";
import { Modal } from "@/shared/ui/Modal";
import { Avatar } from "@/shared/ui/Avatar";

export type NewExpense = {
  title: string;
  amount: number;
  payer: string;
  split: string[];
};

const INITIAL = {
  title: "",
  amount: "",
  payer: "me",
  split: ["me", "m1", "m2", "m3"] as string[],
};

export function AddExpenseModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (e: NewExpense) => void;
}) {
  const { t } = useT();
  const [form, setForm] = useState(INITIAL);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setForm(INITIAL);
  }, [open]);

  const toggleSplit = (id: string) => {
    setForm((f) => ({
      ...f,
      split: f.split.includes(id) ? f.split.filter((x) => x !== id) : [...f.split, id],
    }));
  };
  const valid = form.title.trim() && Number(form.amount) > 0 && form.split.length > 0;
  const submit = () => {
    onAdd({
      title: form.title,
      amount: Number(form.amount),
      payer: form.payer,
      split: form.split,
    });
  };

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
            placeholder="0"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t("trip.budget.payer")}</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ACTIVE_TRIP.members.map((id) => {
              const m = MEMBERS.find((x) => x.id === id);
              const sel = form.payer === id;
              return (
                <button
                  key={id}
                  onClick={() => setForm({ ...form, payer: id })}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px 6px 6px",
                    borderRadius: "var(--r-pill)",
                    border: `1px solid ${sel ? "var(--terracotta)" : "var(--line)"}`,
                    background: sel
                      ? "oklch(from var(--terracotta) l c h / 0.1)"
                      : "var(--paper)",
                    fontSize: 13,
                    fontWeight: sel ? 500 : 400,
                  }}
                >
                  <Avatar id={id} size={24} ring={false} />
                  {m?.name}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="label">{t("trip.budget.split")}</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ACTIVE_TRIP.members.map((id) => {
              const m = MEMBERS.find((x) => x.id === id);
              const sel = form.split.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleSplit(id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px 6px 6px",
                    borderRadius: "var(--r-pill)",
                    border: `1px solid ${sel ? "var(--ink)" : "var(--line)"}`,
                    background: sel ? "var(--paper-2)" : "var(--paper)",
                    fontSize: 13,
                    opacity: sel ? 1 : 0.55,
                  }}
                >
                  <Avatar id={id} size={24} ring={false} />
                  {m?.name}
                </button>
              );
            })}
          </div>
          {form.split.length > 0 && Number(form.amount) > 0 && (
            <div
              className="mono"
              style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}
            >
              ≈ {Math.round(Number(form.amount) / form.split.length).toLocaleString("ru")}{" "}
              ₽ с человека
            </div>
          )}
        </div>
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
          disabled={!valid}
          style={{ opacity: valid ? 1 : 0.4 }}
          onClick={submit}
        >
          {t("common.add")}
        </button>
      </div>
    </Modal>
  );
}
