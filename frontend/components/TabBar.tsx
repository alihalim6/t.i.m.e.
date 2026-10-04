"use client";

import React from "react";

export type TabKey =
  | "base-prompt"
  | "scoring-prompt"
  | "interests"
  | "lab"
  | "analytics"
  | "settings";

interface TabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  baseHasDraft: boolean;
  scoringHasDraft: boolean;
  interestsHasDraft: boolean;
}

interface TabDef {
  key: TabKey;
  label: string;
  pill?: string;
  hasDraft?: boolean;
  icon: React.ReactNode;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onSelectTab,
  baseHasDraft,
  scoringHasDraft,
  interestsHasDraft,
}) => {
  const tabs: TabDef[] = [
    {
      key: "base-prompt",
      label: "Base Prompt",
      hasDraft: baseHasDraft,
      icon: (
        <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter">
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
        <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      key: "interests",
      label: "Interests",
      hasDraft: interestsHasDraft,
      icon: (
        <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter">
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
        <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter">
          <path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
        </svg>
      ),
    },
    {
      key: "analytics",
      label: "Analytics",
      pill: "Phase 3",
      icon: (
        <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter">
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
        <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
  ];

  return (
    <header className="tab-bar">
      <nav className="tab-bar-nav">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-item ${activeTab === tab.key ? "tab-item--active" : ""}`}
            onClick={() => onSelectTab(tab.key)}
            title={tab.label}
          >
            {tab.icon}
            <span className="tab-label">{tab.label}</span>
            {tab.pill && <span className="stub-pill">{tab.pill}</span>}
            {tab.hasDraft && <span className="draft-dot" title="Draft pending" />}
          </button>
        ))}
      </nav>

    </header>
  );
};
