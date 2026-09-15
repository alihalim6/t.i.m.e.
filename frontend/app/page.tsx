"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar, TabKey } from "@/components/Sidebar";
import { PromptEditor } from "@/components/PromptEditor";
import { InterestsStub, LabStub, AnalyticsStub, SettingsTab } from "@/components/Stubs";
import { PromptData, PublishResponse, api } from "@/lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("base-prompt");
  const [basePrompt, setBasePrompt] = useState<PromptData | null>(null);
  const [scoringPrompt, setScoringPrompt] = useState<PromptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("time_theme") as "dark" | "light" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("time_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const fetchPrompts = useCallback(async () => {
    try {
      setError(null);
      const [base, scoring] = await Promise.all([
        api.getBasePrompt(),
        api.getScoringPrompt(),
      ]);
      setBasePrompt(base);
      setScoringPrompt(scoring);
    } catch (err: unknown) {
      console.error("Failed to fetch initial prompts", err);
      const msg = err instanceof Error ? err.message : "Failed to load prompts from API";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // Base prompt handlers
  const handleSaveBaseDraft = async (draftText: string): Promise<PromptData> => {
    const updated = await api.updateBasePromptDraft(draftText);
    setBasePrompt(updated);
    return updated;
  };

  const handleDiscardBaseDraft = async (): Promise<PromptData> => {
    const reverted = await api.discardBasePromptDraft();
    setBasePrompt(reverted);
    return reverted;
  };

  // Scoring prompt handlers
  const handleSaveScoringDraft = async (draftText: string): Promise<PromptData> => {
    const updated = await api.updateScoringPromptDraft(draftText);
    setScoringPrompt(updated);
    return updated;
  };

  const handleDiscardScoringDraft = async (): Promise<PromptData> => {
    const reverted = await api.discardScoringPromptDraft();
    setScoringPrompt(reverted);
    return reverted;
  };

  // Unified Publish handler
  const handlePublish = async (): Promise<PublishResponse> => {
    const res = await api.publishPrompts();
    await fetchPrompts();
    return res;
  };

  return (
    <main className="app-container">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        baseHasDraft={!!basePrompt?.has_draft_changes}
        scoringHasDraft={!!scoringPrompt?.has_draft_changes}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <section className="main-viewport">
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--text-muted)",
              fontSize: "12.5px",
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              gap: "10px",
            }}
          >
            <span className="draft-dot" />
            Connecting to T.I.M.E. backend...
          </div>
        ) : error ? (
          <div
            style={{
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-bright)",
                color: "var(--text-main)",
                padding: "20px 24px",
                fontSize: "13px",
                maxWidth: "600px",
              }}
            >
              <strong style={{ textTransform: "uppercase" }}>Connection Error:</strong> {error}
              <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--text-muted)" }}>
                Make sure the FastAPI backend is running on <code>http://localhost:8000</code>.
              </div>
            </div>
            <button className="btn-secondary" onClick={() => fetchPrompts()}>
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {activeTab === "base-prompt" && (
              <PromptEditor
                key="base"
                type="base"
                title="Base Prompt"
                subtitle="Fetcher Agent: Discovers candidate content via search grounding and generates article summaries."
                promptData={basePrompt}
                onSaveDraft={handleSaveBaseDraft}
                onDiscardDraft={handleDiscardBaseDraft}
                onPublish={handlePublish}
                placeholderChips={["{interest_prompt}", "<base_instructions>", "<non_exhaustive_item_type_list>"]}
              />
            )}

            {activeTab === "scoring-prompt" && (
              <PromptEditor
                key="scoring"
                type="scoring"
                title="Scoring Prompt"
                subtitle="Scorer Agent: Evaluates summary quality against the rubric (50 is minimum eligibility threshold)."
                promptData={scoringPrompt}
                onSaveDraft={handleSaveScoringDraft}
                onDiscardDraft={handleDiscardScoringDraft}
                onPublish={handlePublish}
                placeholderChips={["{items}", "{area_of_interest}", "{interest_prompt}", "<rubric>"]}
              />
            )}

            {activeTab === "interests" && <InterestsStub />}
            {activeTab === "lab" && <LabStub />}
            {activeTab === "analytics" && <AnalyticsStub />}
            {activeTab === "settings" && <SettingsTab />}
          </>
        )}
      </section>
    </main>
  );
}
