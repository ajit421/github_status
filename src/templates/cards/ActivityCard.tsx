// src/templates/cards/ActivityCard.tsx
/** @jsxImportSource hono/jsx */

import { THEMES, type ThemeName } from '../../lib/themes';
import type { ActivityData } from '../../types/github';
import {
  CARD_WIDTH,
  ACTIVITY_CARD_HEIGHT,
  CHART_WIDTH,
  CHART_HEIGHT,
  BAR_COUNT,
  BAR_GAP,
  BAR_WIDTH,
  DAY_CHART_HEIGHT,
  DAY_BAR_GAP,
  DAY_BAR_WIDTH,
} from '../../config/constants';

export interface ActivityCardProps {
  activity: ActivityData;
  theme?: ThemeName;
  hideBorder?: boolean;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function ActivityCard({
  activity,
  theme = "default",
  hideBorder = false,
}: ActivityCardProps) {
  const t = THEMES[theme];

  // ── Hour bar chart ──────────────────────────────────────────────────────────
  const maxHourCount = Math.max(...activity.byHour.map((h) => h.count), 1);

  const hourBars = activity.byHour.map((h, i) => {
    const barH = Math.max(4, Math.round((h.count / maxHourCount) * CHART_HEIGHT));
    const x = i * (BAR_WIDTH + BAR_GAP);
    const y = CHART_HEIGHT - barH;
    return { x, y, h: barH, hour: h.hour, count: h.count };
  });

  // Label every 4 hours: 0, 4, 8, 12, 16, 20, 24
  const labelHours = [0, 4, 8, 12, 16, 20, 24];

  // ── Day bar chart ───────────────────────────────────────────────────────────
  // [3E] byDay data is now rendered as a weekly activity bar chart below the
  // hourly chart, adding visible value instead of computing and discarding it.
  const maxDayCount = Math.max(...activity.byDay.map((d) => d.count), 1);

  const dayBars = activity.byDay.map((d, i) => {
    const barH = Math.max(3, Math.round((d.count / maxDayCount) * DAY_CHART_HEIGHT));
    const x = i * (DAY_BAR_WIDTH + DAY_BAR_GAP);
    const y = DAY_CHART_HEIGHT - barH;
    return { x, y, h: barH, day: d.day, count: d.count };
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: CARD_WIDTH,
        height: ACTIVITY_CARD_HEIGHT,
        background: t.bg,
        border: hideBorder ? "none" : `1px solid ${t.border}`,
        borderRadius: 6,
        padding: "20px 24px",
        fontFamily: "Inter",
        boxSizing: "border-box",
      }}
    >
      {/* Title row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: t.title }}>
          Commit Activity
        </span>
        <span style={{ fontSize: 11, color: t.text, opacity: 0.65 }}>
          Peak: {activity.mostProductiveTime}
        </span>
      </div>

      {/* Section label: by hour */}
      <span style={{ fontSize: 10, color: t.text, opacity: 0.5, marginBottom: 4 }}>
        BY HOUR
      </span>

      {/* Hour bar chart */}
      <div style={{ display: "flex", flexDirection: "column", marginBottom: 12 }}>
        <svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {/* Gridlines */}
          {[0.5, 1].map((ratio) => {
            const y = CHART_HEIGHT - Math.round(ratio * CHART_HEIGHT);
            return (
              <line
                key={ratio}
                x1={0} y1={y}
                x2={CHART_WIDTH} y2={y}
                stroke={t.border}
                strokeWidth={1}
                strokeOpacity={0.4}
              />
            );
          })}
          {/* Bars */}
          {hourBars.map((bar) => (
            <rect
              key={bar.hour}
              x={bar.x} y={bar.y}
              width={BAR_WIDTH} height={bar.h}
              rx={2} ry={2}
              fill={bar.count === maxHourCount ? t.icon : t.bar}
              fillOpacity={bar.count === maxHourCount ? 1 : 0.6}
            />
          ))}
        </svg>
        {/* Hour labels */}
        <div style={{ display: "flex", marginTop: 4, width: CHART_WIDTH, position: "relative" }}>
          {labelHours.map((hour) => {
            const x = hour === 24
              ? CHART_WIDTH - 10
              : hour * (BAR_WIDTH + BAR_GAP);
            return (
              <span
                key={hour}
                style={{
                  position: "absolute",
                  left: x,
                  fontSize: 9,
                  color: t.text,
                  opacity: 0.5,
                }}
              >
                {hour}
              </span>
            );
          })}
        </div>
      </div>

      {/* Section label: by day */}
      <span style={{ fontSize: 10, color: t.text, opacity: 0.5, marginBottom: 4 }}>
        BY DAY OF WEEK
      </span>

      {/* Day bar chart */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <svg width={CHART_WIDTH} height={DAY_CHART_HEIGHT}>
          {dayBars.map((bar) => (
            <rect
              key={bar.day}
              x={bar.x} y={bar.y}
              width={DAY_BAR_WIDTH} height={bar.h}
              rx={2} ry={2}
              fill={bar.count === maxDayCount ? t.icon : t.bar}
              fillOpacity={bar.count === maxDayCount ? 1 : 0.6}
            />
          ))}
        </svg>
        {/* Day labels */}
        <div style={{ display: "flex", marginTop: 4, width: CHART_WIDTH, position: "relative" }}>
          {DAY_LABELS.map((label, i) => (
            <span
              key={label}
              style={{
                position: "absolute",
                left: i * (DAY_BAR_WIDTH + DAY_BAR_GAP),
                fontSize: 9,
                color: t.text,
                opacity: 0.5,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
