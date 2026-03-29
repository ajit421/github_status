// src/templates/ActivityCard.tsx
/** @jsxImportSource react */

import { THEMES, type ThemeName } from "@/lib/themes";
import type { ActivityData } from "@/types/github";

export interface ActivityCardProps {
  activity: ActivityData;
  theme?: ThemeName;
  hideBorder?: boolean;
}

const CHART_WIDTH = 420;
const CHART_HEIGHT = 80;
const BAR_COUNT = 24;
const BAR_GAP = 2;
const BAR_WIDTH = Math.floor((CHART_WIDTH - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT); // ~16px

export function ActivityCard({
  activity,
  theme = "default",
  hideBorder = false,
}: ActivityCardProps) {
  const t = THEMES[theme];

  const maxCount = Math.max(...activity.byHour.map((h) => h.count), 1);

  const bars = activity.byHour.map((h, i) => {
    const barH = Math.max(4, Math.round((h.count / maxCount) * CHART_HEIGHT));
    const x = i * (BAR_WIDTH + BAR_GAP);
    const y = CHART_HEIGHT - barH;
    return { x, y, h: barH, hour: h.hour, count: h.count };
  });

  // Label every 4 hours: 0, 4, 8, 12, 16, 20
  const labelHours = [0, 4, 8, 12, 16, 20, 24];

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
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: t.title }}>
          Commit Activity by Hour
        </span>
        <span style={{ fontSize: 11, color: t.text, opacity: 0.65 }}>
          Peak: {activity.mostProductiveTime}
        </span>
      </div>

      {/* Bar chart */}
      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {/* Gridlines */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = CHART_HEIGHT - Math.round(ratio * CHART_HEIGHT);
            return (
              <line
                key={ratio}
                x1={0}
                y1={y}
                x2={CHART_WIDTH}
                y2={y}
                stroke={t.border}
                strokeWidth={1}
                strokeOpacity={0.4}
              />
            );
          })}

          {/* Bars */}
          {bars.map((bar) => (
            <rect
              key={bar.hour}
              x={bar.x}
              y={bar.y}
              width={BAR_WIDTH}
              height={bar.h}
              rx={2}
              ry={2}
              fill={bar.count === maxCount ? t.icon : t.bar}
              fillOpacity={bar.count === maxCount ? 1 : 0.6}
            />
          ))}
        </svg>

        {/* Hour labels */}
        <div
          style={{
            display: "flex",
            marginTop: 6,
            width: CHART_WIDTH,
            position: "relative",
          }}
        >
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
                  fontSize: 10,
                  color: t.text,
                  opacity: 0.55,
                  fontFamily: "Inter",
                }}
              >
                {hour}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
