"use client";

import React, { useEffect, useState } from "react";
import { RatingTag, api } from "@/lib/api";

export const InterestsStub: React.FC = () => {
  return (
    <div className="stub-container">
      <div className="stub-hero">
        <div className="stub-badge-row">
          <span className="phase-pill">Phase 2</span>
        </div>
        <h2>Interests Management</h2>
        <p>
          Configure and toggle specific personal topics of interest (e.g. AI systems, mechanical
          keyboards, distributed consensus). Each interest defines its own domain focus, custom
          guidance, and active status.
        </p>
      </div>

      <div className="data-table-card" style={{ padding: "32px", textAlign: "center" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              border: "1px solid var(--border-bright)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-main)",
            }}
          >
            {/* Brain icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
              <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
              <path d="M12 5v13" />
              <path d="M16 8h2a2 2 0 0 1 2 2v1" />
              <path d="M8 8H6a2 2 0 0 0-2 2v1" />
            </svg>
          </div>
          <h3 style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Interest Topics Pipeline
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            In Phase 2, you can add individual interests that are combined with the Base Prompt
            during discovery runs.
          </p>
        </div>
      </div>
    </div>
  );
};

export const LabStub: React.FC = () => {
  return (
    <div className="stub-container">
      <div className="stub-hero">
        <div className="stub-badge-row">
          <span className="phase-pill">Phase 2</span>
        </div>
        <h2>Evaluation Lab</h2>
        <p>
          Trigger on-demand batch evaluation runs across all active interests. Inspect candidate
          articles, evaluate model scores, and assign multi-select tags to train domain affinity.
        </p>
      </div>

      <div className="data-table-card" style={{ padding: "32px", textAlign: "center" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              border: "1px solid var(--border-bright)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-main)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
            </svg>
          </div>
          <h3 style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Interactive Prompt Eval Sandbox
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            Batch testing requires a published snapshot of Base & Scoring prompts. You can publish
            v1 directly from the Base Prompt tab.
          </p>
        </div>
      </div>
    </div>
  );
};

export const AnalyticsStub: React.FC = () => {
  return (
    <div className="stub-container">
      <div className="stub-hero">
        <div className="stub-badge-row">
          <span className="phase-pill">Phase 3</span>
        </div>
        <h2>Analytics & Prompt Version Diffs</h2>
        <p>
          Compare curation yield across prompt versions, track domain running averages, and inspect
          side-by-side prompt diffs to analyze how rubric adjustments affect article scoring.
        </p>
      </div>

      <div className="data-table-card" style={{ padding: "32px", textAlign: "center" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              border: "1px solid var(--border-bright)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-main)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <h3 style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Domain Affinity & Metrics Tracking
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            Quality trends and domain affinity scores will populate here as evaluations are recorded.
          </p>
        </div>
      </div>
    </div>
  );
};

export const SettingsTab: React.FC = () => {
  const [tags, setTags] = useState<RatingTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getRatingTags()
      .then((res) => setTags(res))
      .catch((err) => console.error("Failed to load tags:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="stub-container">
      {/* Stub Hero has been removed as requested */}

      {/* System Parameters Card */}
      <div className="data-table-card">
        <div className="table-header">
          <h3>Core Evaluation Thresholds</h3>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Configured Value</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: "600" }}>Score Threshold</td>
              <td>
                <span className="weight-badge weight-pos">50</span>
              </td>
              <td style={{ color: "var(--text-muted)" }}>
                Minimum model score required for curation eligibility.
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: "600" }}>Affinity K-Factor</td>
              <td>
                <span className="weight-badge weight-pos">3</span>
              </td>
              <td style={{ color: "var(--text-muted)" }}>
                Scaling divisor for domain affinity bonus: (domain_avg - 50) / K.
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: "600" }}>Max Items Per Run</td>
              <td>
                <span className="weight-badge" style={{ background: "var(--badge-bg)" }}>
                  10
                </span>
              </td>
              <td style={{ color: "var(--text-muted)" }}>
                Top items selected after scoring & affinity post-processing.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Rating Tags Card */}
      <div className="data-table-card">
        <div className="table-header">
          <h3>Rating Tags (Active Seed Configuration)</h3>
          <span style={{ fontSize: "11px", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {tags.length} TAGS REGISTERED
          </span>
        </div>
        {loading ? (
          <div style={{ padding: "20px", color: "var(--text-muted)", fontSize: "13px" }}>
            Loading tags from backend...
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tag Name</th>
                <th>Label</th>
                <th>Score Weight</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td style={{ fontWeight: "600" }}>{tag.name}</td>
                  <td>{tag.label}</td>
                  <td>
                    <span
                      className={`weight-badge ${tag.weight >= 0 ? "weight-pos" : "weight-neg"}`}
                    >
                      {tag.weight > 0 ? `+${tag.weight}` : tag.weight}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-main)",
                        fontWeight: "700",
                        textTransform: "uppercase",
                      }}
                    >
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
