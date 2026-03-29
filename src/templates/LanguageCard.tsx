// src/templates/LanguageCard.tsx
/** @jsxImportSource react */

import { THEMES, type ThemeName } from '../lib/themes';
import type { LanguageData } from '../types/github';

export interface LanguageCardProps {
  languages: LanguageData;
  theme?: ThemeName;
  layout?: "normal" | "compact" | "pie";
  hideBorder?: boolean;
}

// ── Donut chart ───────────────────────────────────────────────────────────────

function DonutChart({
  segments,
  bg,
}: {
  segments: Array<{ color: string; ratio: number }>;
  bg: string;
}) {
  const r = 42;
  const cx = 54;
  const cy = 54;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const dash = seg.ratio * circumference;
    const arc = { color: seg.color, dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <svg width={108} height={108} viewBox="0 0 108 108">
      {/* Base ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={bg}
        strokeWidth={12}
        strokeOpacity={0.12}
      />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth={12}
          strokeDasharray={`${arc.dash} ${circumference}`}
          strokeDashoffset={-arc.offset + circumference * 0.25}
          transform="rotate(-90 54 54)"
        />
      ))}
    </svg>
  );
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
        width: 495,
        height: 195,
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
