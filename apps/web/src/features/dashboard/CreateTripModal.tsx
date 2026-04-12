import { useEffect, useState } from "react";
import { useT } from "@/shared/lib/i18n";
import { Modal } from "@/shared/ui/Modal";
import { Avatar } from "@/shared/ui/Avatar";

export type NewTripDraft = {
  title: string;
  dest: string;
  dates: string;
  cover: string;
  days: number;
};

type FormState = {
  title: string;
  dest: string;
  dateFrom: string;
  dateTo: string;
  cover: string;
};

export function CreateTripModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (draft: NewTripDraft) => void;
}) {
  const { t } = useT();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    title: "",
    dest: "",
    dateFrom: "",
    dateTo: "",
    cover: "",
  });

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep(0);
      setForm({ title: "", dest: "", dateFrom: "", dateTo: "", cover: "" });
    }
  }, [open]);

  const canNext =
    step === 0
      ? form.title.trim().length > 0 && form.dest.trim().length > 0
      : form.dateFrom.length > 0 && form.dateTo.length > 0;

  const submit = () => {
    onCreate({
      title: form.title,
      dest: form.dest,
      dates: `${form.dateFrom} — ${form.dateTo}`,
      cover: form.cover,
      days: 7,
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
          <MiniCalendar />
          <div
            style={{
              background: "var(--paper-2)",
              padding: 16,
              borderRadius: "var(--r-md)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Avatar id="me" size={32} ring={false} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Вы — организатор</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                друзей пригласите внутри поездки
              </div>
            </div>
          </div>
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
            disabled={!canNext}
            onClick={submit}
            style={{ opacity: canNext ? 1 : 0.4 }}
          >
            {t("dash.create.cta")}
          </button>
        )}
      </div>
    </Modal>
  );
}

function MiniCalendar() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const selStart = 12;
  const selEnd = 22;
  return (
    <div style={{ background: "var(--paper-2)", padding: 16, borderRadius: "var(--r-md)" }}>
      <div
        className="mono"
        style={{
          fontSize: 11,
          color: "var(--ink-3)",
          marginBottom: 10,
          letterSpacing: "0.06em",
        }}
      >
        июнь 2026
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          fontSize: 11,
        }}
      >
        {["п", "в", "с", "ч", "п", "с", "в"].map((d, i) => (
          <div
            key={i}
            className="mono"
            style={{ textAlign: "center", color: "var(--ink-3)" }}
          >
            {d}
          </div>
        ))}
        {days.map((d) => {
          const inRange = d >= selStart && d <= selEnd;
          const isEdge = d === selStart || d === selEnd;
          return (
            <div
              key={d}
              className="mono"
              style={{
                textAlign: "center",
                padding: "6px 0",
                background: isEdge
                  ? "var(--terracotta)"
                  : inRange
                    ? "oklch(from var(--terracotta) l c h / 0.18)"
                    : "transparent",
                color: isEdge ? "var(--paper)" : "var(--ink)",
                borderRadius: 6,
                fontWeight: isEdge ? 600 : 400,
              }}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
