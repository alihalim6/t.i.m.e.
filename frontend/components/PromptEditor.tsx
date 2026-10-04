"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { PromptData, PublishResponse, SnapshotData, api } from "@/lib/api";
import { useToast } from "./Toast";

interface PromptEditorProps {
  type: "base" | "scoring";
  promptData: PromptData | null;
  onSaveDraft: (draftText: string) => Promise<PromptData>;
  onDiscardDraft: () => Promise<PromptData>;
  onPublish: () => Promise<PublishResponse>;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  type,
  promptData,
  onSaveDraft,
  onDiscardDraft,
  onPublish,
}) => {
  const { showToast } = useToast();

  // Initialize directly from promptData
  const [content, setContent] = useState<string>(() => {
    if (!promptData) return "";
    return promptData.draft_prompt_text !== null && promptData.draft_prompt_text !== undefined
      ? promptData.draft_prompt_text
      : promptData.prompt_text;
  });

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<SnapshotData[]>([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);

  // Sync text when promptData id or version changes
  useEffect(() => {
    if (promptData) {
      const activeText =
        promptData.draft_prompt_text !== null && promptData.draft_prompt_text !== undefined
          ? promptData.draft_prompt_text
          : promptData.prompt_text;
      setContent(activeText);
      setSaveStatus("saved");
    }
  }, [promptData?.id, promptData?.version]);

  // Debounced auto-save ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutoSave = useCallback(
    (textToSave: string) => {
      setSaveStatus("saving");
      onSaveDraft(textToSave)
        .then(() => {
          setSaveStatus("saved");
        })
        .catch((err) => {
          console.error("Auto-save failed", err);
          setSaveStatus("error");
          showToast("Failed to auto-save draft", "error");
        });
    },
    [onSaveDraft, showToast]
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setContent(newText);
    setSaveStatus("saving");

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      triggerAutoSave(newText);
    }, 1000);
  };

  const handlePublish = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsPublishing(true);
    try {
      await onSaveDraft(content);
      const res = await onPublish();
      showToast(`Successfully published v${res.version}!`, "success");
      setSaveStatus("saved");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Publishing failed";
      showToast(msg, "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscard = async () => {
    if (!promptData) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsDiscarding(true);
    try {
      const resetData = await onDiscardDraft();
      setContent(resetData.prompt_text);
      setSaveStatus("saved");
      showToast("Draft discarded — restored published version", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to discard draft";
      showToast(msg, "error");
    } finally {
      setIsDiscarding(false);
    }
  };

  const openHistory = async () => {
    setHistoryOpen(true);
    setLoadingSnapshots(true);
    try {
      const list = await api.getSnapshots();
      setSnapshots(list);
    } catch (err) {
      console.error(err);
      showToast("Failed to load snapshots", "error");
    } finally {
      setLoadingSnapshots(false);
    }
  };

  const hasDraft = Boolean(
    promptData &&
    (promptData.has_draft_changes || (content !== "" && content !== promptData.prompt_text))
  );

  return (
    <div className="editor-container">
      {/* Header Bar */}
      <div className="editor-header-bar">
        <div className="header-meta">
          <div className="header-title-row">
            {hasDraft && (
              <span className="draft-status-badge">
                <span className="draft-dot" />
                Draft Pending
              </span>
            )}
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={openHistory}
            title="View published prompt snapshots"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Snapshots
          </button>

          <button
            className="btn-secondary"
            onClick={handleDiscard}
            disabled={!hasDraft || isDiscarding || isPublishing}
            title="Revert draft changes to the currently published prompt"
          >
            {isDiscarding ? "Reverting..." : "Discard Draft"}
          </button>

          <button
            className="btn-primary"
            onClick={handlePublish}
            disabled={!hasDraft || isPublishing}
          >
            {isPublishing ? "Publishing..." : "Publish Changes"}
          </button>
        </div>
      </div>

      {/* Code Editor Panel */}
      <div className="editor-frame">
        <div className="editor-toolbar">
          <div className="auto-save-status">
            {saveStatus === "saving" && (
              <>
                <span className="draft-dot" />
                <span>SAVING DRAFT...</span>
              </>
            )}
            {saveStatus === "saved" && hasDraft && (
              <span>DRAFT SAVED</span>
            )}
            {saveStatus === "error" && <span>SAVE ERROR</span>}
          </div>
        </div>

        <textarea
          className="prompt-textarea"
          value={content}
          onChange={handleTextChange}
          spellCheck={false}
          placeholder="Enter prompt instructions..."
        />
      </div>

      {/* History / Snapshots Modal */}
      {historyOpen && (
        <div className="modal-overlay" onClick={() => setHistoryOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Published Prompt Snapshots</h3>
              <button
                className="btn-secondary"
                style={{ padding: "3px 8px" }}
                onClick={() => setHistoryOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {loadingSnapshots ? (
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Loading snapshots...</p>
              ) : snapshots.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No snapshots found.</p>
              ) : (
                snapshots.map((snap) => {
                  const textToShow =
                    type === "base" ? snap.global_prompt_text : snap.scoring_prompt_text;
                  const dateStr = new Date(snap.published_at).toLocaleString();
                  return (
                    <div
                      key={snap.id}
                      style={{
                        background: "var(--bg-editor)",
                        border: "1px solid var(--border-subtle)",
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "10px",
                          alignItems: "center",
                        }}
                      >
                        <span className="version-badge">Version {snap.version_number}</span>
                        <span style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase" }}>
                          {dateStr}
                        </span>
                      </div>
                      <pre
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          maxHeight: "140px",
                          overflowY: "auto",
                          whiteSpace: "pre-wrap",
                          background: "var(--bg-panel)",
                          border: "1px solid var(--border-subtle)",
                          padding: "10px",
                        }}
                      >
                        {textToShow}
                      </pre>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
