"use client";

import React from "react";

export type TabKey =
  | "base-prompt"
  | "scoring-prompt"
  | "interests"
  | "lab"
  | "analytics"
  | "settings";

interface SidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  baseHasDraft: boolean;
  scoringHasDraft: boolean;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  baseHasDraft,
  scoringHasDraft,
  theme,
  onToggleTheme,
}) => {
  return (
    <aside className="sidebar">
      {/* Sidebar navigation vertically centered */}
      <nav className="sidebar-nav">
        {/* Tab 1: Base Prompt */}
        <button
          className={`nav-item ${activeTab === "base-prompt" ? "active" : ""}`}
          onClick={() => onSelectTab("base-prompt")}
        >
          <div className="nav-label-group">
            <svg
              className="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <path d="M14 2H6v20h12V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Base Prompt</span>
          </div>
          {baseHasDraft && <span className="draft-dot" title="Draft pending" />}
        </button>

        {/* Tab 2: Scoring Prompt */}
        <button
          className={`nav-item ${activeTab === "scoring-prompt" ? "active" : ""}`}
          onClick={() => onSelectTab("scoring-prompt")}
        >
          <div className="nav-label-group">
            <svg
              className="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>Scoring Prompt</span>
          </div>
          {scoringHasDraft && <span className="draft-dot" title="Draft pending" />}
        </button>

        {/* Tab 3: Interests (Brain Icon) */}
        <button
          className={`nav-item ${activeTab === "interests" ? "active" : ""}`}
          onClick={() => onSelectTab("interests")}
        >
          <div className="nav-label-group">
            <svg
              className="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              {/* Brain icon */}
              <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
              <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
              <path d="M12 5v13" />
              <path d="M16 8h2a2 2 0 0 1 2 2v1" />
              <path d="M8 8H6a2 2 0 0 0-2 2v1" />
            </svg>
            <span>Interests</span>
          </div>
          <span className="stub-pill">Phase 2</span>
        </button>

        {/* Tab 4: Lab */}
        <button
          className={`nav-item ${activeTab === "lab" ? "active" : ""}`}
          onClick={() => onSelectTab("lab")}
        >
          <div className="nav-label-group">
            <svg
              className="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
            </svg>
            <span>Lab</span>
          </div>
          <span className="stub-pill">Phase 2</span>
        </button>

        {/* Tab 5: Analytics */}
        <button
          className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => onSelectTab("analytics")}
        >
          <div className="nav-label-group">
            <svg
              className="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Analytics</span>
          </div>
          <span className="stub-pill">Phase 3</span>
        </button>

        {/* Tab 6: Settings */}
        <button
          className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => onSelectTab("settings")}
        >
          <div className="nav-label-group">
            <svg
              className="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Settings</span>
          </div>
        </button>
      </nav>

      {/* Footer with theme toggle and status */}
      <div className="sidebar-footer">
        <button
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title="Switch theme"
        >
          {theme === "dark" ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span>Dark Mode</span>
            </>
          )}
        </button>

        <div className="status-row">
          <div className="status-indicator">
            <span className="status-bullet" />
            <span>Lab Online</span>
          </div>
          <span>v0.1.0</span>
        </div>
      </div>
    </aside>
  );
};
