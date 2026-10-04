"use client";

import React, { useState, useRef, useCallback } from "react";

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
  interestsHasDraft: boolean;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

interface TabDef {
  key: TabKey;
  label: string;
  pill?: string;
  hasDraft?: boolean;
  icon: React.ReactNode;
}

const ChevronLeft = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="square"
    strokeLinejoin="miter"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="square"
    strokeLinejoin="miter"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  baseHasDraft,
  scoringHasDraft,
  interestsHasDraft,
  theme,
  onToggleTheme,
}) => {
  const [expanded, setExpanded] = useState(false);
  const collapseTimer = useRef<NodeJS.Timeout | null>(null);

  const tabs: TabDef[] = [
    {
      key: "base-prompt",
      label: "Base Prompt",
      hasDraft: baseHasDraft,
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter">
          <path d="M14 2H6v20h12V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      key: "scoring-prompt",
      label: "Scoring Prompt",
      hasDraft: scoringHasDraft,
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      key: "interests",
      label: "Interests",
      hasDraft: interestsHasDraft,
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter">
          <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
          <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
          <path d="M12 5v13" />
          <path d="M16 8h2a2 2 0 0 1 2 2v1" />
          <path d="M8 8H6a2 2 0 0 0-2 2v1" />
        </svg>
      ),
    },
    {
      key: "lab",
      label: "Lab",
      pill: "Phase 2",
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter">
          <path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
        </svg>
      ),
    },
    {
      key: "analytics",
      label: "Analytics",
      pill: "Phase 3",
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      key: "settings",
      label: "Settings",
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
  ];

  const activeTabDef = tabs.find((t) => t.key === activeTab)!;

  const handleMouseEnter = useCallback(() => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
    setExpanded(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(() => {
      setExpanded(false);
    }, 300);
  }, []);

  const handleSelect = (key: TabKey) => {
    onSelectTab(key);
    setExpanded(false);
  };

  return (
    <aside
      className={`sidebar ${expanded ? "sidebar--expanded" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <nav className="sidebar-nav">
        {/* Collapsed trigger button / strip */}
        <button
          type="button"
          className={`sidebar-trigger ${expanded ? "sidebar-trigger--expanded" : ""}`}
          onClick={() => setExpanded((prev) => !prev)}
          title={expanded ? "Collapse menu" : "Expand menu"}
          aria-expanded={expanded}
        >
          {/* Standalone Chevron */}
          <span className="sidebar-chevron">
            {expanded ? <ChevronRight /> : <ChevronLeft />}
          </span>

          {/* Currently selected tab icon (shown when collapsed) */}
          <span
            className={`sidebar-active-label ${expanded ? "sidebar-active-label--hidden" : ""}`}
            title={activeTabDef.label}
          >
            <span className="sidebar-active-icon">
              {activeTabDef.icon}
            </span>
            {activeTabDef.hasDraft && <span className="draft-dot" title="Draft pending" />}
          </span>
        </button>

        {/* Expanded menu — floats directly below/beside trigger without gaps */}
        <div className={`sidebar-menu ${expanded ? "sidebar-menu--open" : ""}`}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`nav-item ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => handleSelect(tab.key)}
            >
              <div className="nav-label-group">
                {tab.icon}
                <span>{tab.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {tab.pill && <span className="stub-pill">{tab.pill}</span>}
                {tab.hasDraft && <span className="draft-dot" title="Draft pending" />}
              </div>
            </button>
          ))}

          {/* Footer inside expanded menu */}
          <div className="sidebar-footer">
            <button className="theme-toggle-btn" onClick={onToggleTheme} title="Switch theme">
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
        </div>
      </nav>
    </aside>
  );
};
