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

export type AnalysisItem = {
  text: string;
  strong?: boolean;
  conflict?: boolean;
  sources?: number;
};

export type AnalysisSection = {
  key: "directions" | "budget" | "dates" | "interests" | "constraints" | "conflicts";
  title: string;
  items: AnalysisItem[];
};

export type ChatAnalysis = {
  id: string;
  summary: string | null;
  sections: AnalysisSection[];
  createdAt: string;
  messageCount: number;
};

export type ChatSummaryBlock = {
  id: string;
  blockNumber: number;
  fromIndex: number;
  toIndex: number;
  mood: string;
  summary: string;
  topics: string[];
  decisions: string[];
  questions: string[];
  createdAt: string;
};

export function getSummaries(tripId: string) {
  return apiFetch<ChatSummaryBlock[]>(`/trips/${tripId}/chat/summaries`);
}

export type ChatSuggestion = { title: string; text: string; ask: string };

export function getSuggestions(tripId: string) {
  return apiFetch<{ suggestions: ChatSuggestion[] }>(
    `/trips/${tripId}/chat/suggestions`,
    { method: "POST" },
  );
}

export function getAnalysis(tripId: string) {
  return apiFetch<ChatAnalysis | null>(`/trips/${tripId}/chat/analysis`);
}

export function runAnalysis(tripId: string) {
  return apiFetch<ChatAnalysis>(`/trips/${tripId}/chat/analyze`, { method: "POST" });
}
