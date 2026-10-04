export interface PromptData {
  id: number;
  version: number;
  prompt_text: string;
  draft_prompt_text: string | null;
  has_draft_changes: boolean;
  updated_at: string | null;
}

export interface PublishResponse {
  message: string;
  version: number;
  published_at: string;
}

export interface SnapshotData {
  id: number;
  version_number: number;
  global_prompt_text: string;
  scoring_prompt_text: string;
  interest_prompts_json: unknown[];
  published_at: string;
}

export interface RatingTag {
  id: number;
  name: string;
  label: string;
  weight: number;
  is_active: boolean;
  created_at: string;
}

export interface InterestData {
  id: number;
  name: string;
  prompt_text: string;
  draft_prompt_text: string | null;
  has_draft_changes: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `API error (${response.status})`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorDetail = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const api = {
  getBasePrompt: () => request<PromptData>("/api/prompts/base"),
  updateBasePromptDraft: (draft_prompt_text: string) =>
    request<PromptData>("/api/prompts/base", {
      method: "PUT",
      body: JSON.stringify({ draft_prompt_text }),
    }),
  discardBasePromptDraft: () =>
    request<PromptData>("/api/prompts/base/discard", {
      method: "POST",
    }),

  getScoringPrompt: () => request<PromptData>("/api/prompts/scoring"),
  updateScoringPromptDraft: (draft_prompt_text: string) =>
    request<PromptData>("/api/prompts/scoring", {
      method: "PUT",
      body: JSON.stringify({ draft_prompt_text }),
    }),
  discardScoringPromptDraft: () =>
    request<PromptData>("/api/prompts/scoring/discard", {
      method: "POST",
    }),

  publishPrompts: () =>
    request<PublishResponse>("/api/prompts/publish", {
      method: "POST",
    }),

  getSnapshots: () => request<SnapshotData[]>("/api/prompts/snapshots"),

  getRatingTags: () => request<RatingTag[]>("/api/tags"),

  // Interests
  getInterests: () => request<InterestData[]>("/api/interests"),
  createInterest: (name: string, prompt_text: string = "") =>
    request<InterestData>("/api/interests", {
      method: "POST",
      body: JSON.stringify({ name, prompt_text }),
    }),
  getInterest: (id: number) => request<InterestData>(`/api/interests/${id}`),
  updateInterestDraft: (id: number, data: { name?: string; draft_prompt_text?: string }) =>
    request<InterestData>(`/api/interests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  discardInterestDraft: (id: number) =>
    request<InterestData>(`/api/interests/${id}/discard`, {
      method: "POST",
    }),
  toggleInterestActive: (id: number, is_active?: boolean) =>
    request<InterestData>(`/api/interests/${id}/toggle`, {
      method: "PATCH",
      body: is_active !== undefined ? JSON.stringify({ is_active }) : undefined,
    }),
  deleteInterest: (id: number) =>
    request<void>(`/api/interests/${id}`, {
      method: "DELETE",
    }),
};
