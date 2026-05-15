// src/templates/components/StatRow.tsx
/** @jsxImportSource hono/jsx */
import { Icon } from './Icon';
import { formatNumber } from '../../utils/format';

export function StatRow({
  iconPath,
  label,
  value,
  iconColor,
  textColor,
  showIcon,
}: {
  iconPath: string;
  label: string;
  value: number;
  iconColor: string;
  textColor: string;
  showIcon: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 6,
      }}
    >
      {showIcon && <Icon path={iconPath} color={iconColor} />}
      <span style={{ fontSize: 13, color: textColor, flex: 1 }}>{label}</span>
      <span style={{ fontSize: 13, color: textColor, fontWeight: 600 }}>
        {formatNumber(value)}
      </span>
    </div>
  );
}
