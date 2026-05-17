// src/templates/cards/ActivityGraphCard.tsx
/** @jsxImportSource hono/jsx */

import { THEMES, type ThemeName } from '../../lib/themes';
import type { ContributionGraphData } from '../../types/github';
import { CARD_WIDTH, CARD_HEIGHT } from '../../config/constants';

export interface ActivityGraphCardProps {
  data: ContributionGraphData;
  username: string;
  theme?: ThemeName;
  hideBorder?: boolean;
  hideTitle?: boolean;
  customTitle?: string;
  bgColor?: string;
  textColor?: string;
  titleColor?: string;
  lineColor?: string;
  pointColor?: string;
  areaColor?: string;
}

export function ActivityGraphCard({
  data,
  username,
  theme = "default",
  hideBorder = false,
  hideTitle = false,
  customTitle,
  bgColor,
  textColor,
  titleColor,
  lineColor,
  pointColor,
  areaColor,
}: ActivityGraphCardProps) {
  const t = THEMES[theme];

  const bg = bgColor ? `#${bgColor}` : t.bg;
  const text = textColor ? `#${textColor}` : t.text;
  const title = titleColor ? `#${titleColor}` : t.title;
  const line = lineColor ? `#${lineColor}` : (t.currStreak || t.icon);
  const point = pointColor ? `#${pointColor}` : (t.fire || t.icon);
  const area = areaColor ? `#${areaColor}` : (t.bar || t.icon);

  const heading = customTitle ?? `${username}'s Contribution Graph`;

  if (!data.days || data.days.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          background: bg,
          border: hideBorder ? "none" : `1px solid ${t.border}`,
          borderRadius: 6,
          padding: "20px 24px",
          fontFamily: "Inter",
          boxSizing: "border-box",
          alignItems: "center",
          justifyContent: "center",
          color: text,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: title, marginBottom: 10 }}>{heading}</div>
        <div style={{ fontSize: 12, opacity: 0.6 }}>No contribution data available</div>
      </div>
    );
  }

  // Graph dimensions
  const paddingX = 40;
  const paddingY = 60;
  const graphWidth = CARD_WIDTH - paddingX * 2;
  const graphHeight = CARD_HEIGHT - paddingY - 30;
  const startX = paddingX;
  const startY = CARD_HEIGHT - 30;

  const maxCount = Math.max(...data.days.map(d => d.contributionCount), 1);
  const stepX = graphWidth / (data.days.length - 1);

  const points = data.days.map((d, i) => {
    const x = startX + i * stepX;
    const y = startY - (d.contributionCount / maxCount) * graphHeight;
    return { x, y, count: d.contributionCount, date: d.date };
  });

  // Build the path string for the line
  let pathD = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    pathD += ` C ${cp1x} ${prev.y}, ${cp1x} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  // Path for the gradient area
  const areaD = `${pathD} L ${points[points.length - 1]!.x} ${startY} L ${points[0]!.x} ${startY} Z`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: bg,
        border: hideBorder ? "none" : `1px solid ${t.border}`,
        borderRadius: 6,
        padding: "20px 24px",
        fontFamily: "Inter",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {!hideTitle && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: title,
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          {heading}
        </div>
      )}

      {/* Y-axis Label (using div for Satori compatibility) */}
      <div
        style={{
          position: "absolute",
          left: -35,
          top: startY - graphHeight / 2,
          transform: "rotate(-90deg)",
          color: text,
          fontSize: 10,
          opacity: 0.6,
          width: 100,
          textAlign: "center",
        }}
      >
        Contributions
      </div>

      <svg
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        style={{ position: "absolute", top: 0, left: 0 }}
        viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
      >
        <defs>
          <linearGradient id="fill-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={area} stopOpacity="0.4" />
            <stop offset="100%" stopColor={area} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines (horizontal) */}
        {[0, 0.5, 1].map(r => (
          <line
            key={r}
            x1={startX} y1={startY - r * graphHeight}
            x2={startX + graphWidth} y2={startY - r * graphHeight}
            stroke={t.border} strokeWidth="1" strokeOpacity="0.2" strokeDasharray="3,3"
          />
        ))}

        {/* Area fill */}
        <path d={areaD} fill="url(#fill-grad)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke={line} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points (soft glow effect) */}
        {points.filter((_, i) => i % 5 === 0 || i === points.length - 1).map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={point} opacity="0.2" />
            <circle cx={p.x} cy={p.y} r="2" fill={point} />
          </g>
        ))}
      </svg>

      {/* X-axis Labels */}
      <div style={{ position: "absolute", left: startX, top: startY + 5, fontSize: 9, color: text, opacity: 0.5 }}>
        {points[0]!.date.split('-').slice(1).join('/')}
      </div>
      <div style={{ position: "absolute", left: startX + graphWidth / 2 - 15, top: startY + 5, fontSize: 9, color: text, opacity: 0.5 }}>
        Days
      </div>
      <div style={{ position: "absolute", left: startX + graphWidth - 30, top: startY + 5, fontSize: 9, color: text, opacity: 0.5 }}>
        {points[points.length - 1]!.date.split('-').slice(1).join('/')}
      </div>
    </div>
  );
}
