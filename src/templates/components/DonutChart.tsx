// src/templates/components/DonutChart.tsx
/** @jsxImportSource hono/jsx */

export function DonutChart({
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
