// src/templates/cards/ProductiveTimeCard.tsx
/** @jsxImportSource hono/jsx */

import { THEMES, type ThemeName } from '../../lib/themes';
import type { ProductiveTimeData } from '../../types/github';

export interface ProductiveTimeCardProps {
  data: ProductiveTimeData;
  theme?: ThemeName;
  hideBorder?: boolean;
  cardWidth?: number;
  cardHeight?: number;
}

const CHART_W = 430;
const CHART_H = 80;
const BAR_COUNT = 24;
const BAR_GAP = 2;
const BAR_W = Math.floor((CHART_W - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT);

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function ProductiveTimeCard({
  data,
  theme = 'default',
  hideBorder = false,
  cardWidth = 495,
  cardHeight = 195,
}: ProductiveTimeCardProps) {
  const t = THEMES[theme];

  const maxCount = Math.max(...data.byHour.map((h) => h.count), 1);

  const bars = data.byHour.map((h, i) => {
    const barH = Math.max(3, Math.round((h.count / maxCount) * CHART_H));
    const x = i * (BAR_W + BAR_GAP);
    const y = CHART_H - barH;
    const isPeak = h.hour === data.peakHour;
    return { x, y, h: barH, hour: h.hour, count: h.count, isPeak };
  });

  const labelHours = [0, 6, 12, 18, 23];

  const sign = data.utcOffset >= 0 ? '+' : '';
  const offsetLabel = `UTC ${sign}${data.utcOffset}`;

  const peakStart = `${pad2(data.peakHour)}:00`;
  const peakEnd = `${pad2((data.peakHour + 1) % 24)}:00`;

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
        padding: '18px 22px 14px',
        fontFamily: 'Inter',
        boxSizing: 'border-box',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: t.title }}>
          Commits ({offsetLabel})
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 11, color: t.text, opacity: 0.55 }}>
            Peak: {peakStart}–{peakEnd}
          </span>
          <span style={{ fontSize: 11, color: t.icon, fontWeight: 600 }}>
            {data.mostProductiveRange}
          </span>
        </div>
      </div>

      {/* Section label */}
      <span style={{ fontSize: 9, color: t.text, opacity: 0.4, letterSpacing: '0.06em', marginBottom: 6 }}>
        COMMITS BY HOUR OF DAY
      </span>

      {/* Bar chart */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <svg width={CHART_W} height={CHART_H}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = CHART_H - Math.round(ratio * CHART_H);
            return (
              <line
                key={ratio}
                x1={0} y1={y}
                x2={CHART_W} y2={y}
                stroke={t.border}
                strokeWidth={1}
                strokeOpacity={0.35}
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Bars */}
          {bars.map((bar) => (
            <rect
              key={bar.hour}
              x={bar.x}
              y={bar.y}
              width={BAR_W}
              height={bar.h}
              rx={2}
              ry={2}
              fill={bar.isPeak ? t.icon : t.bar}
              fillOpacity={bar.isPeak ? 1 : 0.55}
            />
          ))}

          {/* Peak indicator line */}
          {(() => {
            const peakBar = bars[data.peakHour];
            if (!peakBar) return null;
            return (
              <line
                x1={peakBar.x + BAR_W / 2}
                y1={0}
                x2={peakBar.x + BAR_W / 2}
                y2={peakBar.y}
                stroke={t.icon}
                strokeWidth={1}
                strokeOpacity={0.3}
                strokeDasharray="2 2"
              />
            );
          })()}
        </svg>

        {/* Hour labels */}
        <div style={{ display: 'flex', marginTop: 5, width: CHART_W, position: 'relative' }}>
          {labelHours.map((hour) => {
            const x =
              hour === 23
                ? CHART_W - 14
                : hour * (BAR_W + BAR_GAP);
            return (
              <span
                key={hour}
                style={{
                  position: 'absolute',
                  left: x,
                  fontSize: 9,
                  color: t.text,
                  opacity: 0.45,
                }}
              >
                {pad2(hour)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer stats */}
      <div
        style={{
          display: 'flex',
          gap: 18,
          marginTop: 10,
          paddingTop: 8,
          borderTop: `1px solid ${t.border}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: t.title }}>
            {data.totalCommits.toLocaleString()}
          </span>
          <span style={{ fontSize: 9, color: t.text, opacity: 0.5 }}>Total commits sampled</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: t.title }}>
            {data.peakCount}
          </span>
          <span style={{ fontSize: 9, color: t.text, opacity: 0.5 }}>Commits at peak hour</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: t.icon }}>
            {peakStart}
          </span>
          <span style={{ fontSize: 9, color: t.text, opacity: 0.5 }}>Most active hour</span>
        </div>
      </div>
    </div>
  );
}
