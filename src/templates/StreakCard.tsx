// src/templates/StreakCard.tsx
/** @jsxImportSource react */

import { THEMES, type ThemeName } from "@/lib/themes";
import type { StreakData } from "@/types/github";

export interface StreakCardProps {
  streakData: StreakData;
  theme?: ThemeName;
  hideBorder?: boolean;
}

function StatBlock({
  value,
  label,
  valueColor,
  labelColor,
}: {
  value: number;
  label: string;
  valueColor: string;
  labelColor: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        gap: 4,
      }}
    >
      <span style={{ fontSize: 22, fontWeight: 700, color: valueColor }}>
        {value.toLocaleString()}
      </span>
      <span
        style={{ fontSize: 11, color: labelColor, textAlign: "center" }}
      >
        {label}
      </span>
    </div>
  );
}

function RingProgress({
  ratio,
  ringColor,
  fireColor,
  streak,
  textColor,
}: {
  ratio: number;
  ringColor: string;
  fireColor: string;
  streak: number;
  textColor: string;
}) {
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(1, ratio)) * circumference;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
      }}
    >
      <svg width={110} height={110} viewBox="0 0 110 110">
        {/* Track ring */}
        <circle
          cx={55}
          cy={55}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={5}
          strokeOpacity={0.2}
        />
        {/* Progress ring */}
        <circle
          cx={55}
          cy={55}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
          transform="rotate(-90 55 55)"
        />
        {/* Fire emoji stand-in — coloured dot */}
        <circle cx={55} cy={34} r={6} fill={fireColor} />
        {/* Streak number */}
        <text
          x={55}
          y={55}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={22}
          fontWeight={700}
          fill={textColor}
          fontFamily="Inter"
        >
          {streak}
        </text>
        <text
          x={55}
          y={72}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fill={textColor}
          fontFamily="Inter"
          fillOpacity={0.65}
        >
          day streak
        </text>
      </svg>
    </div>
  );
}

export function StreakCard({
  streakData,
  theme = "default",
  hideBorder = false,
}: StreakCardProps) {
  const t = THEMES[theme];

  const ratio =
    streakData.longestStreak > 0
      ? streakData.currentStreak / streakData.longestStreak
      : 0;

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
        fontFamily: "Inter",
        boxSizing: "border-box",
      }}
    >
      {/* Body row */}
      <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
        {/* Total contributions */}
        <StatBlock
          value={streakData.totalContributions}
          label="Total Contributions"
          valueColor={t.side}
          labelColor={t.text}
        />

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 80,
            background: t.border,
            opacity: 0.5,
            flexShrink: 0,
          }}
        />

        {/* Current streak ring */}
        <RingProgress
          ratio={ratio}
          ringColor={t.ring}
          fireColor={t.fire}
          streak={streakData.currentStreak}
          textColor={t.currStreak}
        />

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 80,
            background: t.border,
            opacity: 0.5,
            flexShrink: 0,
          }}
        />

        {/* Longest streak */}
        <StatBlock
          value={streakData.longestStreak}
          label="Longest Streak"
          valueColor={t.side}
          labelColor={t.text}
        />
      </div>
    </div>
  );
}
