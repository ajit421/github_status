// src/templates/renderCard.ts
import satori from "satori";
import type { ReactNode } from "react";
import type { SatoriOptions } from "satori";

// ── Font loading ──────────────────────────────────────────────────────────────
// Fetched once per cold start and reused across invocations in the same instance.
// Inter Regular + SemiBold from Google Fonts CDN (WOFF2, supported by Satori ≥0.10).

let regularFontCache: ArrayBuffer | null = null;
let semiBoldFontCache: ArrayBuffer | null = null;

async function loadFonts(): Promise<[ArrayBuffer, ArrayBuffer]> {
  const [regular, semiBold] = await Promise.all([
    regularFontCache
      ? Promise.resolve(regularFontCache)
      : fetch(
          "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
        )
          .then((r) => r.arrayBuffer())
          .then((buf) => {
            regularFontCache = buf;
            return buf;
          }),
    semiBoldFontCache
      ? Promise.resolve(semiBoldFontCache)
      : fetch(
          "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFmUUE.woff2"
        )
          .then((r) => r.arrayBuffer())
          .then((buf) => {
            semiBoldFontCache = buf;
            return buf;
          }),
  ]);
  return [regular, semiBold];
}

// ── renderCard ────────────────────────────────────────────────────────────────

export interface RenderOptions {
  width?: number;
  height?: number;
}

/**
 * Renders a JSX element to an SVG string via Satori.
 * Accepts any React-compatible JSX element (hono/jsx elements are compatible).
 */
export async function renderCard(
  element: ReactNode,
  { width = 495, height = 195 }: RenderOptions = {}
): Promise<string> {
  const [regularFont, semiBoldFont] = await loadFonts();

  const options: SatoriOptions = {
    width,
    height,
    fonts: [
      {
        name: "Inter",
        data: regularFont,
        weight: 400,
        style: "normal",
      },
      {
        name: "Inter",
        data: semiBoldFont,
        weight: 600,
        style: "normal",
      },
    ],
  };

  return satori(element, options);
}
