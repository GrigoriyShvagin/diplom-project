import { apiFetch } from "./client";

export type ApiUserMini = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type ApiExpenseSplit = {
  id: string;
  amount: number;
  status: string;
  user: ApiUserMini;
};

export type ApiExpense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  currency: string;
  expenseDate: string | null;
  note: string | null;
  createdAt: string;
  tripId: string;
  createdBy: ApiUserMini;
  splits: ApiExpenseSplit[];
};

export type CreateExpenseInput = {
  title: string;
  amount: number;
  payerId: string;
  splitUserIds: string[];
  category?: string;
  expenseDate?: string;
  note?: string;
};

export function listExpenses(tripId: string) {
  return apiFetch<ApiExpense[]>(`/trips/${tripId}/expenses`);
}

export function createExpense(tripId: string, input: CreateExpenseInput) {
  return apiFetch<ApiExpense>(`/trips/${tripId}/expenses`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteExpense(tripId: string, id: string) {
  return apiFetch<void>(`/trips/${tripId}/expenses/${id}`, { method: "DELETE" });
}
