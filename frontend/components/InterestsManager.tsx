"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { InterestData, PublishResponse, api } from "@/lib/api";
import { useToast } from "./Toast";

interface InterestsManagerProps {
  onPublish: () => Promise<PublishResponse>;
  onInterestsChange?: (interests: InterestData[]) => void;
}

export const InterestsManager: React.FC<InterestsManagerProps> = ({
  onPublish,
  onInterestsChange,
}) => {
  const { showToast } = useToast();
  const [interests, setInterests] = useState<InterestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Active interest state
  const [content, setContent] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  // New Interest Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [creating, setCreating] = useState(false);

  // Rename inline state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameVal, setEditNameVal] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInterests = useCallback(async () => {
    try {
      const list = await api.getInterests();
      setInterests(list);
      onInterestsChange?.(list);
      if (list.length > 0 && (selectedId === null || !list.some((i) => i.id === selectedId))) {
        setSelectedId(list[0].id);
      }
    } catch (err: unknown) {
      console.error("Failed to load interests", err);
      showToast("Failed to load interests from API", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedId, onInterestsChange, showToast]);

  useEffect(() => {
    fetchInterests();
  }, []);

  const selectedInterest = interests.find((i) => i.id === selectedId) || null;

  // When selected interest changes, sync prompt content
  useEffect(() => {
    if (selectedInterest) {
      const activeText =
        selectedInterest.draft_prompt_text !== null && selectedInterest.draft_prompt_text !== undefined
          ? selectedInterest.draft_prompt_text
          : selectedInterest.prompt_text;
      setContent(activeText);
      setSaveStatus("saved");
      setIsEditingName(false);
      setEditNameVal(selectedInterest.name);
    }
  }, [selectedInterest?.id]);

  const triggerAutoSave = useCallback(
    (textToSave: string) => {
      if (!selectedInterest) return;
      setSaveStatus("saving");
      api
        .updateInterestDraft(selectedInterest.id, { draft_prompt_text: textToSave })
        .then((updated) => {
          setInterests((prev) => {
            const next = prev.map((i) => (i.id === updated.id ? updated : i));
            onInterestsChange?.(next);
            return next;
          });
          setSaveStatus("saved");
        })
        .catch((err) => {
          console.error("Auto-save interest failed", err);
          setSaveStatus("error");
          showToast("Failed to auto-save interest draft", "error");
        });
    },
    [selectedInterest, onInterestsChange, showToast]
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

  const handleToggleActive = async () => {
    if (!selectedInterest) return;
    try {
      const updated = await api.toggleInterestActive(selectedInterest.id);
      setInterests((prev) => {
        const next = prev.map((i) => (i.id === updated.id ? updated : i));
        onInterestsChange?.(next);
        return next;
      });
      showToast(
        `Interest "${updated.name}" is now ${updated.is_active ? "ACTIVE" : "INACTIVE"}`,
        "success"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle active status";
      showToast(msg, "error");
    }
  };

  const handleDiscard = async () => {
    if (!selectedInterest) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsDiscarding(true);
    try {
      const resetData = await api.discardInterestDraft(selectedInterest.id);
      setContent(resetData.prompt_text);
      setInterests((prev) => {
        const next = prev.map((i) => (i.id === resetData.id ? resetData : i));
        onInterestsChange?.(next);
        return next;
      });
      setSaveStatus("saved");
      showToast("Draft discarded — restored published interest prompt", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to discard draft";
      showToast(msg, "error");
    } finally {
      setIsDiscarding(false);
    }
  };

  const handlePublish = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsPublishing(true);
    try {
      if (selectedInterest) {
        await api.updateInterestDraft(selectedInterest.id, { draft_prompt_text: content });
      }
      const res = await onPublish();
      await fetchInterests();
      showToast(`Successfully published v${res.version}!`, "success");
      setSaveStatus("saved");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Publishing failed";
      showToast(msg, "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInterest) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the interest "${selectedInterest.name}"?`
    );
    if (!confirmDelete) return;

    try {
      await api.deleteInterest(selectedInterest.id);
      showToast(`Deleted "${selectedInterest.name}"`, "success");
      const remaining = interests.filter((i) => i.id !== selectedInterest.id);
      setInterests(remaining);
      onInterestsChange?.(remaining);
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
      } else {
        setSelectedId(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete interest";
      showToast(msg, "error");
    }
  };

  const handleSaveName = async () => {
    if (!selectedInterest) return;
    const trimmed = editNameVal.trim();
    if (!trimmed || trimmed === selectedInterest.name) {
      setIsEditingName(false);
      return;
    }
    try {
      const updated = await api.updateInterestDraft(selectedInterest.id, { name: trimmed });
      setInterests((prev) => {
        const next = prev.map((i) => (i.id === updated.id ? updated : i));
        onInterestsChange?.(next);
        return next;
      });
      setIsEditingName(false);
      showToast(`Renamed to "${trimmed}"`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to rename interest";
      showToast(msg, "error");
    }
  };

  const handleCreateInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const created = await api.createInterest(newName.trim(), newPrompt.trim());
      setInterests((prev) => {
        const next = [...prev, created];
        onInterestsChange?.(next);
        return next;
      });
      setSelectedId(created.id);
      setCreateModalOpen(false);
      setNewName("");
      setNewPrompt("");
      showToast(`Created interest "${created.name}"`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create interest";
      showToast(msg, "error");
    } finally {
      setCreating(false);
    }
  };

  const hasDraft = Boolean(
    selectedInterest &&
      (selectedInterest.has_draft_changes ||
        (content !== "" && content !== selectedInterest.prompt_text))
  );

  if (loading) {
    return (
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
        Loading interests...
      </div>
    );
  }

  return (
    <div className="editor-container">
      {/* Top Horizontal Bar: Chip Tabs + Add New Button (only shown when interests exist) */}
      {interests.length > 0 && (
        <div className="interests-top-bar">
          <div className="interests-tabs-group">
            {interests.map((interest) => {
              const isSelected = interest.id === selectedId;
              return (
                <button
                  key={interest.id}
                  className={`interest-tab-chip ${isSelected ? "active" : ""} ${
                    !interest.is_active ? "inactive" : ""
                  }`}
                  onClick={() => setSelectedId(interest.id)}
                  title={interest.is_active ? "Active in search" : "Inactive (excluded from search)"}
                >
                  {interest.has_draft_changes && (
                    <span className="draft-dot" title="Draft pending" />
                  )}
                  <span>{interest.name}</span>
                  {!interest.is_active && (
                    <span style={{ fontSize: "9px", opacity: 0.75 }}>[OFF]</span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            className="btn-add-interest"
            onClick={() => setCreateModalOpen(true)}
            title="Add a new interest topic"
          >
            <span>+ ADD NEW</span>
          </button>
        </div>
      )}

      {selectedInterest ? (
        <>
          {/* Selected Interest Header Bar */}
          <div className="editor-header-bar">
            <div className="header-meta">
              <div className="header-title-row">
                {isEditingName ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="text"
                      value={editNameVal}
                      onChange={(e) => setEditNameVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") setIsEditingName(false);
                      }}
                      autoFocus
                      style={{
                        background: "var(--bg-editor)",
                        border: "1px solid var(--border-bright)",
                        color: "var(--text-main)",
                        padding: "4px 8px",
                        fontFamily: "var(--font-display)",
                        fontSize: "18px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                      }}
                    />
                    <button className="btn-secondary" onClick={handleSaveName}>
                      Save
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => setIsEditingName(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : null}

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
                style={{
                  borderColor: selectedInterest.is_active
                    ? "var(--border-bright)"
                    : "var(--border-subtle)",
                  color: selectedInterest.is_active
                    ? "var(--text-main)"
                    : "var(--text-faint)",
                }}
                onClick={handleToggleActive}
                title="Toggle whether this interest is active in newsletter/eval runs"
              >
                {selectedInterest.is_active ? "● Active" : "○ Inactive"}
              </button>

              <button
                className="btn-secondary"
                onClick={() => setIsEditingName(true)}
                title="Rename interest"
              >
                Rename
              </button>

              <button
                className="btn-secondary"
                onClick={handleDelete}
                title="Delete this interest topic"
                style={{ color: "var(--text-muted)" }}
              >
                Delete
              </button>

              <button
                className="btn-secondary"
                onClick={handleDiscard}
                disabled={!hasDraft || isDiscarding || isPublishing}
                title="Revert draft changes to currently published prompt"
              >
                {isDiscarding ? "Reverting..." : "Discard Draft"}
              </button>

              <button
                className="btn-primary"
                onClick={handlePublish}
                disabled={isPublishing}
                title="Publish changes into a new immutable version snapshot"
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
                {saveStatus === "saved" && hasDraft && <span>DRAFT SAVED</span>}
                {saveStatus === "error" && <span>SAVE ERROR</span>}
              </div>
            </div>

            <textarea
              className="prompt-textarea"
              value={content}
              onChange={handleTextChange}
              spellCheck={false}
              placeholder="Describe what content to look for and what to filter out for this interest..."
            />
          </div>
        </>
      ) : (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            border: "1px dashed var(--border-medium)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "13.5px" }}>
            No interests configured yet.
          </p>
          <button className="btn-primary" onClick={() => setCreateModalOpen(true)}>
            + ADD YOUR FIRST INTEREST
          </button>
        </div>
      )}

      {/* Add New Interest Modal */}
      {createModalOpen && (
        <div className="modal-overlay" onClick={() => setCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Interest Topic</h3>
              <button
                className="btn-secondary"
                style={{ padding: "3px 8px" }}
                onClick={() => setCreateModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateInterest}>
              <div className="modal-body">
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "var(--text-faint)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Interest Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Systems, Mechanical Keyboards..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                    style={{
                      padding: "10px 12px",
                      background: "var(--bg-editor)",
                      border: "1px solid var(--border-bright)",
                      color: "var(--text-main)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "var(--text-faint)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Initial Prompt Guidance
                  </label>
                  <textarea
                    placeholder="Provide specific guidelines, keywords, preferred media types, or items to avoid..."
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    rows={6}
                    style={{
                      padding: "10px 12px",
                      background: "var(--bg-editor)",
                      border: "1px solid var(--border-medium)",
                      color: "var(--text-main)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12.5px",
                      lineHeight: "1.5",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={creating || !newName.trim()}
                >
                  {creating ? "Creating..." : "Create Interest"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
