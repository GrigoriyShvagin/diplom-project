import { apiFetch } from "./client";

export type ApiTripMember = {
  id: string;
  role: string;
  joinedAt: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
};

export type ApiTrip = {
  id: string;
  title: string;
  description: string | null;
  destinationLabel: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: string;
  ownerId: string;
  members: ApiTripMember[];
};

export type CreateTripInput = {
  title: string;
  description?: string;
  destinationLabel?: string;
  startDate?: string;
  endDate?: string;
};

export function listTrips() {
  return apiFetch<ApiTrip[]>("/trips");
}

export function getTrip(id: string) {
  return apiFetch<ApiTrip>(`/trips/${id}`);
}

export function createTrip(input: CreateTripInput) {
  return apiFetch<ApiTrip>("/trips", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
