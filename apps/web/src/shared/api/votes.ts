import { apiFetch } from "./client";

export type ApiVoteOption = {
  id: string;
  label: string;
  count: number;
};

export type ApiVote = {
  id: string;
  tripId: string;
  title: string;
  createdAt: string;
  resolvedAt: string | null;
  createdBy: { id: string; name: string; email: string; avatarUrl: string | null };
  options: ApiVoteOption[];
  myAnswer: string | null;
  total: number;
};

export function listVotes(tripId: string) {
  return apiFetch<ApiVote[]>(`/trips/${tripId}/votes`);
}

export function createVote(tripId: string, input: { title: string; options: string[] }) {
  return apiFetch<ApiVote>(`/trips/${tripId}/votes`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function castAnswer(tripId: string, voteId: string, optionId: string) {
  return apiFetch<ApiVote>(`/trips/${tripId}/votes/${voteId}/answer`, {
    method: "POST",
    body: JSON.stringify({ optionId }),
  });
}

export function clearAnswer(tripId: string, voteId: string) {
  return apiFetch<ApiVote>(`/trips/${tripId}/votes/${voteId}/answer`, {
    method: "DELETE",
  });
}
