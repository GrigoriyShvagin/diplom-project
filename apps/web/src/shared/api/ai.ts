import { apiFetch } from "./client";

export type AskGuideInput = {
  question: string;
  recentMessages?: { author: string; text: string; isBot?: boolean }[];
};

export function getAiStatus() {
  return apiFetch<{ enabled: boolean }>("/ai/status");
}

export function askGuide(tripId: string, input: AskGuideInput) {
  return apiFetch<{ reply: string }>(`/trips/${tripId}/chat/ask`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
