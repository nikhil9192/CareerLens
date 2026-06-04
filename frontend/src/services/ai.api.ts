import { apiDelete, apiGet, apiPost } from "../lib/api";

export interface AiChatMessage {
  role: "user" | "assistant";
  message: string;
  created_at?: string;
}

export interface AiChatResponse {
  response: string;
  studentName: string;
}

export async function fetchAiHistory(): Promise<AiChatMessage[]> {
  const data = (await apiGet("/api/ai/history")) as { messages: AiChatMessage[] };
  return data.messages ?? [];
}

export async function sendAiMessage(message: string): Promise<AiChatResponse> {
  return (await apiPost("/api/ai/chat", { message })) as AiChatResponse;
}

export async function clearAiHistory(): Promise<void> {
  await apiDelete("/api/ai/clear");
}

export async function fetchAiSuggestions(): Promise<string[]> {
  const data = (await apiGet("/api/ai/suggestions")) as { suggestions: string[] };
  return data.suggestions ?? [];
}
