// src/templates/cards/StatsCard.tsx
/** @jsxImportSource hono/jsx */

import { THEMES, type ThemeName } from '../../lib/themes';
import type { StatsData } from '../../types/github';
import { Icon } from '../components/Icon';
import { StatRow } from '../components/StatRow';
import { RankCircle } from '../components/RankCircle';
import { CARD_WIDTH, CARD_HEIGHT } from '../../config/constants';

// ── GitHub Octicon SVG paths (16×16 viewBox) ─────────────────────────────────

const ICON_PATHS = {
  star: "M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z",
  commits:
    "M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z",
  prs: "M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z",
  issues:
    "M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z",
};

// ── Props ─────────────────────────────────────────────────────────────────────

export interface StatsCardProps {
  stats: StatsData;
  theme?: ThemeName;
  hideBorder?: boolean;
  hideRank?: boolean;
  showIcons?: boolean;
  customTitle?: string;
  bgColor?: string;
  textColor?: string;
  titleColor?: string;
  iconColor?: string;
  borderColor?: string;
}

// ── Main card ─────────────────────────────────────────────────────────────────

export function StatsCard({
  stats,
  theme = "default",
  hideBorder = false,
  hideRank = false,
  showIcons = true,
  customTitle,
  bgColor,
  textColor,
  titleColor,
  iconColor,
  borderColor,
}: StatsCardProps) {
  const t = THEMES[theme];

  const bg = bgColor ? `#${bgColor}` : t.bg;
  const text = textColor ? `#${textColor}` : t.text;
  const title = titleColor ? `#${titleColor}` : t.title;
  const icon = iconColor ? `#${iconColor}` : t.icon;
  const border = borderColor ? `#${borderColor}` : t.border;

  const heading = customTitle ?? `${stats.name ?? "User"}'s GitHub Stats`;

  const rows: Array<{ path: string; label: string; value: number }> = [
    { path: ICON_PATHS.star, label: "Total Stars Earned", value: stats.totalStars },
    { path: ICON_PATHS.commits, label: "Total Commits (2024)", value: stats.totalCommits },
    { path: ICON_PATHS.prs, label: "Total PRs", value: stats.totalPRs },
    { path: ICON_PATHS.issues, label: "Total Issues", value: stats.totalIssues },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: bg,
        border: hideBorder ? "none" : `1px solid ${border}`,
        borderRadius: 6,
        padding: "20px 24px",
        fontFamily: "Inter",
        boxSizing: "border-box",
      }}
    >
      {/* Title */}
      <div
        style={{
          display: "flex",
          fontSize: 14,
          fontWeight: 600,
          color: title,
          marginBottom: 14,
        }}
      >
        {heading}
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Stats column */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {rows.map((row) => (
            <StatRow
              key={row.label}
              iconPath={row.path}
              label={row.label}
              value={row.value}
              iconColor={icon}
              textColor={text}
              showIcon={showIcons}
            />
          ))}
        </div>

        {/* Rank circle */}
        {!hideRank && (
          <RankCircle rank={stats.rank} ringColor={t.ring} textColor={text} />
        )}
      </div>
    </div>
  );
}
