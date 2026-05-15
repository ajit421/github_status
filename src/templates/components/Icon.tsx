// src/templates/components/Icon.tsx
/** @jsxImportSource hono/jsx */

export function Icon({
  path,
  color,
  size = 14,
}: {
  path: string;
  color: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      style={{ fill: color, flexShrink: 0 }}
    >
      <path fillRule="evenodd" d={path} />
    </svg>
  );
}
