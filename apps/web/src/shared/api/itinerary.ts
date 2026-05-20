import { apiFetch } from "./client";

export type ApiScheduleItem = {
  id: string;
  type: "flight" | "stay" | "food" | "walk" | "drive" | "place" | "custom";
  title: string;
  description: string | null;
  startTime: string | null;
  endTime: string | null;
  sortOrder: number;
  lat: number | null;
  lng: number | null;
  address: string | null;
  tripDayId: string;
  placeCacheId: string | null;
};

export type ApiTripDay = {
  id: string;
  date: string;
  dayNumber: number;
  tripId: string;
  scheduleItems: ApiScheduleItem[];
};

export type CreateDayInput = {
  date: string;
  dayNumber: number;
};

export type CreateScheduleItemInput = {
  type: ApiScheduleItem["type"];
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  lat?: number;
  lng?: number;
  address?: string;
};

export function listDays(tripId: string) {
  return apiFetch<ApiTripDay[]>(`/trips/${tripId}/days`);
}

export function createDay(tripId: string, input: CreateDayInput) {
  return apiFetch<ApiTripDay>(`/trips/${tripId}/days`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteDay(tripId: string, dayId: string) {
  return apiFetch<void>(`/trips/${tripId}/days/${dayId}`, { method: "DELETE" });
}

export function createScheduleItem(
  tripId: string,
  dayId: string,
  input: CreateScheduleItemInput,
) {
  return apiFetch<ApiScheduleItem>(`/trips/${tripId}/days/${dayId}/items`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteScheduleItem(tripId: string, dayId: string, itemId: string) {
  return apiFetch<void>(`/trips/${tripId}/days/${dayId}/items/${itemId}`, {
    method: "DELETE",
  });
}
