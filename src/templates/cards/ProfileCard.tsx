// src/templates/cards/ProfileCard.tsx
/** @jsxImportSource hono/jsx */

import { THEMES, type ThemeName } from '../../lib/themes';
import type { ProfileData } from '../../types/github';
import { Icon } from '../components/Icon';

export interface ProfileCardProps {
  profile: ProfileData;
  theme?: ThemeName;
  hideBorder?: boolean;
  showAvatar?: boolean;
  showBio?: boolean;
  showLanguages?: boolean;
  showStats?: boolean;
  cardWidth?: number;
  cardHeight?: number;
}

export function ProfileCard({
  profile,
  theme = 'default',
  hideBorder = false,
  showAvatar = true,
  showBio = true,
  showLanguages = true,
  showStats = true,
  cardWidth = 495,
  cardHeight = 220,
}: ProfileCardProps) {
  const t = THEMES[theme];

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
      {/* Top row: avatar + name/bio */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        {showAvatar && (
          <img
            src={profile.avatarUrl}
            width={52}
            height={52}
            style={{ borderRadius: '50%', border: `2px solid ${t.border}`, flexShrink: 0 }}
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: t.title, lineHeight: 1.2 }}>
            {profile.name ?? profile.login}
          </span>
          <span style={{ fontSize: 11, color: t.text, opacity: 0.6, marginBottom: 3 }}>
            @{profile.login} · Joined {profile.joinedYear}
          </span>
          {showBio && profile.bio && (
            <span
              style={{
                fontSize: 11,
                color: t.text,
                opacity: 0.8,
                lineHeight: 1.4,
                overflow: 'hidden',
                display: '-webkit-box',
              }}
            >
              {profile.bio.length > 80 ? profile.bio.slice(0, 80) + '…' : profile.bio}
            </span>
          )}
          {profile.company && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Icon path="M2 1.5A1.5 1.5 0 0 1 3.5 0h9A1.5 1.5 0 0 1 14 1.5v13a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-13ZM3.5 1.5v12h9v-12h-9ZM5 3h2v2H5V3Zm4 0h2v2H9V3Zm-4 3h2v2H5V6Zm4 0h2v2H9V6Zm-4 3h2v2H5V9Zm4 0h2v2H9V9Z" color={t.text} size={12} />
              <span style={{ fontSize: 10, color: t.text, opacity: 0.55 }}>
                {profile.company}
              </span>
            </div>
          )}
        </div>
        {/* Contributions badge */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flexShrink: 0,
            background: `${t.bar}18`,
            borderRadius: 6,
            padding: '6px 10px',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: t.title }}>
            {profile.contributionsThisYear.toLocaleString()}
          </span>
          <span style={{ fontSize: 9, color: t.text, opacity: 0.6, textAlign: 'center' }}>
            contributions
          </span>
          <span style={{ fontSize: 9, color: t.text, opacity: 0.6, textAlign: 'center' }}>
            this year
          </span>
        </div>
      </div>

      {/* Stats row */}
      {showStats && (
        <div
          style={{
            display: 'flex',
            gap: 0,
            marginBottom: 12,
            borderTop: `1px solid ${t.border}`,
            borderBottom: `1px solid ${t.border}`,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          {[
            { label: 'Repos', value: profile.publicRepos },
            { label: 'Stars', value: profile.totalStars },
            { label: 'Followers', value: profile.followers },
            { label: 'Following', value: profile.following },
            { label: 'PRs', value: profile.totalPRs },
            { label: 'Issues', value: profile.totalIssues },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                borderRight: i < 5 ? `1px solid ${t.border}` : 'none',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: t.title }}>
                {stat.value.toLocaleString()}
              </span>
              <span style={{ fontSize: 9, color: t.text, opacity: 0.55 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Top languages */}
      {showLanguages && profile.topLanguages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, color: t.text, opacity: 0.45, marginBottom: 2, letterSpacing: '0.06em' }}>
            TOP LANGUAGES
          </span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {profile.topLanguages.map((lang) => (
              <div
                key={lang.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: `${lang.color}18`,
                  borderRadius: 20,
                  padding: '2px 8px',
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: lang.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 10, color: t.text }}>
                  {lang.name} {lang.percent.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
