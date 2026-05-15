// src/templates/cards/LanguageCard.tsx
/** @jsxImportSource hono/jsx */

import { THEMES, type ThemeName } from '../../lib/themes';
import type { LanguageData } from '../../types/github';
import { DonutChart } from '../components/DonutChart';
import { CARD_WIDTH, CARD_HEIGHT } from '../../config/constants';

export interface LanguageCardProps {
  languages: LanguageData;
  theme?: ThemeName;
  layout?: "normal" | "compact" | "pie";
  hideBorder?: boolean;
}

// ── Language row ──────────────────────────────────────────────────────────────

function LangRow({
  name,
  percent,
  color,
  barColor,
  textColor,
  compact,
}: {
  name: string;
  percent: number;
  color: string;
  barColor: string;
  textColor: string;
  compact: boolean;
}) {
  const label = `${name} ${percent.toFixed(1)}%`;

  if (compact) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 11, color: textColor, flex: 1 }}>{label}</span>
        <div
          style={{
            width: Math.round(percent * 1.2),
            height: 6,
            borderRadius: 3,
            background: barColor,
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 12, color: textColor, flex: 1 }}>{name}</span>
      <span
        style={{ fontSize: 12, color: textColor, opacity: 0.7, width: 42, textAlign: "right" }}
      >
        {percent.toFixed(1)}%
      </span>
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────

export function LanguageCard({
  languages,
  theme = "default",
  layout = "normal",
  hideBorder = false,
}: LanguageCardProps) {
  const t = THEMES[theme];

  const entries = Object.entries(languages);
  const totalBytes = entries.reduce((s, [, { size }]) => s + size, 0);

  const langRows = entries.map(([name, { size, color }]) => ({
    name,
    color,
    percent: (size / totalBytes) * 100,
    ratio: size / totalBytes,
  }));

  const isCompact = layout === "compact";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: t.bg,
        border: hideBorder ? "none" : `1px solid ${t.border}`,
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
          color: t.title,
          marginBottom: 14,
        }}
      >
        Most Used Languages
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Language list */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {langRows.map((lang) => (
            <LangRow
              key={lang.name}
              name={lang.name}
              percent={lang.percent}
              color={lang.color}
              barColor={t.bar}
              textColor={t.text}
              compact={isCompact}
            />
          ))}
        </div>

        {/* Donut chart (normal + pie modes) */}
        {layout !== "compact" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 108,
              flexShrink: 0,
            }}
          >
            <DonutChart
              segments={langRows.map(({ ratio, color }) => ({ ratio, color }))}
              bg={t.text}
            />
          </div>
        )}
      </div>
    </div>
  );
}
