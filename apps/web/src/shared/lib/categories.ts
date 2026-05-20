export type ExpenseCategory =
  | "housing"
  | "food"
  | "transport"
  | "activities"
  | "other";

export const EXPENSE_CATEGORIES: {
  key: ExpenseCategory;
  label: string;
  color: string;
}[] = [
  { key: "housing", label: "Жильё", color: "var(--terracotta)" },
  { key: "food", label: "Еда", color: "var(--moss)" },
  { key: "transport", label: "Транспорт", color: "var(--teal)" },
  { key: "activities", label: "Активности", color: "oklch(0.65 0.10 80)" },
  { key: "other", label: "Другое", color: "var(--ink-3)" },
];

export function categoryMeta(key: string) {
  return (
    EXPENSE_CATEGORIES.find((c) => c.key === key) ?? {
      key: "other" as ExpenseCategory,
      label: "Другое",
      color: "var(--ink-3)",
    }
  );
}
