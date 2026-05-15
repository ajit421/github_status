// src/utils/format.ts

/**
 * Formats a number with commas (e.g., 1000 -> 1,000).
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}
