"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TabBar, TabKey } from "@/components/TabBar";
import { PromptEditor } from "@/components/PromptEditor";
import { InterestsManager } from "@/components/InterestsManager";
import { LabStub, AnalyticsStub, SettingsTab } from "@/components/Stubs";
import { PromptData, PublishResponse, api } from "@/lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("base-prompt");
  const [basePrompt, setBasePrompt] = useState<PromptData | null>(null);
  const [scoringPrompt, setScoringPrompt] = useState<PromptData | null>(null);
  const [interestsHasDraft, setInterestsHasDraft] = useState(false);
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

  const fetchPromptsAndInterests = useCallback(async () => {
    try {
      setError(null);
      const [base, scoring, interestsList] = await Promise.all([
        api.getBasePrompt(),
        api.getScoringPrompt(),
        api.getInterests().catch(() => []),
      ]);
      setBasePrompt(base);
      setScoringPrompt(scoring);
      setInterestsHasDraft(interestsList.some((i) => i.has_draft_changes));
    } catch (err: unknown) {
      console.error("Failed to fetch initial prompts", err);
      const msg = err instanceof Error ? err.message : "Failed to load prompts from API";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromptsAndInterests();
  }, [fetchPromptsAndInterests]);

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
    await fetchPromptsAndInterests();
    return res;
  };

  return (
    <main className="app-container">
      <TabBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        baseHasDraft={!!basePrompt?.has_draft_changes}
        scoringHasDraft={!!scoringPrompt?.has_draft_changes}
        interestsHasDraft={interestsHasDraft}
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
            <button className="btn-secondary" onClick={() => fetchPromptsAndInterests()}>
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {activeTab === "base-prompt" && (
              <PromptEditor
                key="base"
                type="base"
                promptData={basePrompt}
                onSaveDraft={handleSaveBaseDraft}
                onDiscardDraft={handleDiscardBaseDraft}
                onPublish={handlePublish}
              />
            )}

            {activeTab === "scoring-prompt" && (
              <PromptEditor
                key="scoring"
                type="scoring"
                promptData={scoringPrompt}
                onSaveDraft={handleSaveScoringDraft}
                onDiscardDraft={handleDiscardScoringDraft}
                onPublish={handlePublish}
              />
            )}

            {activeTab === "interests" && (
              <InterestsManager
                onPublish={handlePublish}
                onInterestsChange={(list) =>
                  setInterestsHasDraft(list.some((i) => i.has_draft_changes))
                }
              />
            )}

            {activeTab === "lab" && <LabStub />}
            {activeTab === "analytics" && <AnalyticsStub />}
            {activeTab === "settings" && <SettingsTab />}
          </>
        )}
      </section>

      {/* Fixed bottom-left theme toggle */}
      <button
        className="theme-toggle-fixed"
        onClick={handleToggleTheme}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </main>
  );
}
