import { apiFetch } from "./client";

export type ApiAuthor = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type ApiMessage = {
  id: string;
  text: string;
  isBot: boolean;
  createdAt: string;
  tripId: string;
  author: ApiAuthor | null;
};

export type SendResult = {
  messages: ApiMessage[];
  aiError?: string;
};

export function listMessages(tripId: string) {
  return apiFetch<ApiMessage[]>(`/trips/${tripId}/chat/messages`);
}

export function sendMessage(tripId: string, text: string) {
  return apiFetch<SendResult>(`/trips/${tripId}/chat/messages`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function getAiStatus() {
  return apiFetch<{ enabled: boolean }>("/ai/status");
}
