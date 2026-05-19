import { useEffect, useState } from "react";
import { useT } from "@/shared/lib/i18n";
import { Modal } from "@/shared/ui/Modal";

export type NewTripDraft = {
  title: string;
  destinationLabel?: string;
  startDate?: string;
  endDate?: string;
};

type FormState = {
  title: string;
  dest: string;
  dateFrom: string;
  dateTo: string;
};

export function CreateTripModal({
  open,
  onClose,
  onCreate,
  submitting = false,
  error = null,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (draft: NewTripDraft) => void;
  submitting?: boolean;
  error?: string | null;
}) {
  const { t } = useT();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    title: "",
    dest: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(0);
      setForm({ title: "", dest: "", dateFrom: "", dateTo: "" });
    }
  }, [open]);

  const canNext =
    step === 0
      ? form.title.trim().length > 0 && form.dest.trim().length > 0
      : form.dateFrom.length > 0 && form.dateTo.length > 0;

  const submit = () => {
    onCreate({
      title: form.title.trim(),
      destinationLabel: form.dest.trim() || undefined,
      startDate: form.dateFrom || undefined,
      endDate: form.dateTo || undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("dash.create.h")}
      subtitle={t("dash.create.sub")}
      width={560}
    >
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              background: i <= step ? "var(--terracotta)" : "var(--paper-3)",
              borderRadius: 999,
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="label">{t("common.title")}</label>
            <input
              className="input"
              placeholder="Например: Грузия, июнь"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">{t("dash.create.dest")}</label>
            <input
              className="input"
              placeholder={t("common.placeholder.dest")}
              value={form.dest}
              onChange={(e) => setForm({ ...form, dest: e.target.value })}
            />
          </div>
          <div>
            <label className="label">
              {t("dash.create.cover")}{" "}
              <span className="mono" style={{ color: "var(--ink-3)", fontSize: 11 }}>
                · {t("dash.create.cover.hint")}
              </span>
            </label>
            <div className="imgph" style={{ height: 120, cursor: "pointer" }}>
              <span className="imgph-label">перетащите фото · или нажмите</span>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="label">{t("common.date")}</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 24px 1fr",
                gap: 8,
                alignItems: "center",
              }}
            >
              <input
                className="input"
                type="date"
                value={form.dateFrom}
                onChange={(e) => setForm({ ...form, dateFrom: e.target.value })}
              />
              <span style={{ textAlign: "center", color: "var(--ink-3)" }}>→</span>
              <input
                className="input"
                type="date"
                value={form.dateTo}
                onChange={(e) => setForm({ ...form, dateTo: e.target.value })}
              />
            </div>
          </div>
          <div
            style={{
              background: "var(--paper-2)",
              padding: 16,
              borderRadius: "var(--r-md)",
              fontSize: 13,
              color: "var(--ink-2)",
            }}
          >
            Вы будете назначены организатором. Друзей пригласите внутри поездки.
          </div>
          {error && <div className="field-error">{error}</div>}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 28,
          paddingTop: 20,
          borderTop: "1px solid var(--line)",
        }}
      >
        <button
          className="btn btn-ghost"
          onClick={step === 0 ? onClose : () => setStep(0)}
          disabled={submitting}
        >
          {step === 0 ? t("common.cancel") : "← Назад"}
        </button>
        {step === 0 ? (
          <button
            className="btn btn-primary"
            disabled={!canNext}
            onClick={() => setStep(1)}
            style={{ opacity: canNext ? 1 : 0.4 }}
          >
            Дальше →
          </button>
        ) : (
          <button
            className="btn btn-primary"
            disabled={!canNext || submitting}
            onClick={submit}
            style={{ opacity: !canNext || submitting ? 0.4 : 1 }}
          >
            {submitting ? "..." : t("dash.create.cta")}
          </button>
        )}
      </div>
    </Modal>
  );
}
