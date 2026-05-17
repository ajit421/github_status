// src/templates/cards/RepoCard.tsx
/** @jsxImportSource hono/jsx */

import { THEMES, type ThemeName } from '../../lib/themes';
import type { RepoData } from '../../types/github';
import { Icon } from '../components/Icon';

export interface RepoCardProps {
  repo: RepoData;
  theme?: ThemeName;
  hideBorder?: boolean;
  showDescription?: boolean;
  showLanguage?: boolean;
  showStars?: boolean;
  showForks?: boolean;
  showIssues?: boolean;
  showTopics?: boolean;
  showLicense?: boolean;
  cardWidth?: number;
  cardHeight?: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatSize(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function RepoCard({
  repo,
  theme = 'default',
  hideBorder = false,
  showDescription = true,
  showLanguage = true,
  showStars = true,
  showForks = true,
  showIssues = true,
  showTopics = true,
  showLicense = true,
  cardWidth = 495,
  cardHeight = 195,
}: RepoCardProps) {
  const t = THEMES[theme];

  const visibleStats = [
    showStars && { iconPath: 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.312a.75.75 0 0 1 .416 1.279l-3.146 2.925.84 4.153a.75.75 0 0 1-1.088.791L8 12.347l-3.786 2.597a.75.75 0 0 1-1.088-.791l.84-4.153-3.146-2.925a.75.75 0 0 1 .416-1.279l4.21-.312L7.327.668A.75.75 0 0 1 8 .25Z', label: repo.stars.toLocaleString() },
    showForks && { iconPath: 'M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z', label: repo.forks.toLocaleString() },
    showIssues && { iconPath: 'M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm9 0ZM6.92 6.085c.081-.16.19-.299.34-.398.145-.097.371-.187.74-.187.28 0 .553.087.738.225.183.136.282.351.282.64 0 .34-.144.606-.299.789l-.261.27c-.201.202-.455.45-.668.742-.191.261-.31.597-.31 1.056h1.5c0-.184.053-.332.148-.46.096-.13.228-.27.387-.43.199-.2.457-.457.697-.768.24-.312.443-.728.443-1.2 0-.671-.274-1.284-.716-1.616-.445-.337-1.077-.514-1.802-.514-.72 0-1.287.166-1.696.442-.408.275-.688.68-.823 1.151l1.48.358Z', label: repo.openIssues.toLocaleString() },
    { iconPath: 'M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2ZM1.679 7.993c.457.694 1.36 1.935 2.624 3.024C5.556 12.102 7.155 13 8 13c1.845 0 3.444-.898 4.697-1.983 1.264-1.089 2.167-2.33 2.624-3.024a.12.12 0 0 0 0-.135c-.457-.694-1.36-1.935-2.624-3.024C11.444 3.898 9.845 3 8 3c-1.845 0-3.444.898-4.697 1.983-1.264 1.089-2.167 2.33-2.624 3.024a.12.12 0 0 0 0 .135ZM8 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z', label: repo.watchers.toLocaleString() },
  ].filter(Boolean) as { iconPath: string; label: string }[];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: cardWidth,
        height: cardHeight,
        background: t.bg,
        border: hideBorder ? 'none' : `1px solid ${t.border}`,
        borderRadius: 6,
        padding: '18px 22px',
        fontFamily: 'Inter',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {/* Repo icon */}
        <svg width={14} height={14} viewBox="0 0 16 16" style={{ fill: t.icon, flexShrink: 0 }}>
          <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
        </svg>
        <span style={{ fontSize: 14, fontWeight: 700, color: t.title, flex: 1 }}>
          {repo.fullName}
        </span>
        {repo.isForked && (
          <span
            style={{
              fontSize: 10,
              color: t.text,
              opacity: 0.6,
              background: `${t.border}80`,
              padding: '2px 6px',
              borderRadius: 20,
            }}
          >
            Fork
          </span>
        )}
      </div>

      {/* Description */}
      {showDescription && repo.description && (
        <span
          style={{
            fontSize: 12,
            color: t.text,
            opacity: 0.8,
            marginBottom: 10,
            lineHeight: 1.4,
          }}
        >
          {repo.description.length > 100 ? repo.description.slice(0, 100) + '…' : repo.description}
        </span>
      )}

      {/* Topics */}
      {showTopics && repo.topics.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {repo.topics.slice(0, 5).map((topic) => (
            <span
              key={topic}
              style={{
                fontSize: 10,
                color: t.bar,
                background: `${t.bar}18`,
                padding: '2px 8px',
                borderRadius: 20,
              }}
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom stats row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        {/* Language */}
        {showLanguage && repo.language && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: repo.languageColor,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 11, color: t.text, opacity: 0.8 }}>{repo.language}</span>
          </div>
        )}

        {/* Stats */}
        {visibleStats.map((stat) => (
          <div key={stat.iconPath} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icon path={stat.iconPath} color={t.icon} size={14} />
            <span style={{ fontSize: 11, color: t.text, opacity: 0.8 }}>{stat.label}</span>
          </div>
        ))}

        {/* License */}
        {showLicense && repo.license && (
          <span style={{ fontSize: 10, color: t.text, opacity: 0.55 }}>⚖ {repo.license}</span>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Updated */}
        <span style={{ fontSize: 10, color: t.text, opacity: 0.45 }}>
          Updated {formatDate(repo.updatedAt)}
        </span>
      </div>

      {/* Branch + size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
        <span style={{ fontSize: 10, color: t.text, opacity: 0.4 }}>
          ⎇ {repo.defaultBranch}
        </span>
        <span style={{ fontSize: 10, color: t.text, opacity: 0.4 }}>
          · {formatSize(repo.size)}
        </span>
      </div>
    </div>
  );
}
