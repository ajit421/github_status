// src/templates/components/RankCircle.tsx
/** @jsxImportSource hono/jsx */

export function RankCircle({
  rank,
  ringColor,
  textColor,
}: {
  rank: string;
  ringColor: string;
  textColor: string;
}) {
  const r = 38;
  const circumference = 2 * Math.PI * r;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: 100,
        flexShrink: 0,
        position: "relative",
      }}
    >
      <svg width={100} height={100} viewBox="0 0 100 100">
        {/* Track */}
        <circle
          cx={50}
          cy={50}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={5}
          strokeOpacity={0.2}
        />
        {/* Progress arc */}
        <circle
          cx={50}
          cy={50}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={5}
          strokeDasharray={`${circumference * 0.85} ${circumference * 0.15}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      {/* Text overlay — Satori does not support SVG <text> nodes */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 100,
          height: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 700, color: textColor, fontFamily: "Inter" }}>
          {rank}
        </span>
        <span style={{ fontSize: 10, color: textColor, fontFamily: "Inter", opacity: 0.7 }}>
          RANK
        </span>
      </div>
    </div>
  );
}
