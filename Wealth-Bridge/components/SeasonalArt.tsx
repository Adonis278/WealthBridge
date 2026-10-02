'use client';

import React from 'react';
import { useSeasonalTheme } from '@/components/SeasonalThemeProvider';

/**
 * Seasonal artwork, shared by the home hero and the auth pages.
 *
 * Which image shows is decided by SeasonalThemeProvider, which already reads
 * live conditions from Open-Meteo (falling back to the calendar month) to pick
 * the palette. Keeping the artwork on that same hook means one source of truth
 * and no second weather lookup.
 *
 * These use a plain <img> with a hand-built srcset rather than next/image.
 * Firebase App Hosting builds with the Next image optimiser disabled —
 * /_next/image returns 404 there — so <Image> would have shipped the full-size
 * original to every visitor. The variants in /public are generated ahead of
 * time instead, which is platform-independent.
 */
interface Art {
  src: string;
  /** Pre-generated widths that exist in /public as `<name>-<w>.webp`. */
  widths: number[];
  /** Intrinsic width of the full-size original, for the final srcset entry. */
  intrinsicWidth: number;
  alt: string;
}

export const SEASONAL_ART: Record<'fall' | 'winter', Art> = {
  fall: {
    src: '/hero-fall.webp',
    widths: [640],
    intrinsicWidth: 705,
    alt: 'A wooden footbridge over a stream running through autumn woodland',
  },
  winter: {
    src: '/hero-winter.webp',
    widths: [640, 960, 1280],
    intrinsicWidth: 1600,
    alt: 'A wooden footbridge over a stream running through snow-covered woodland',
  },
};

export function useSeasonalArt(): Art {
  const { theme } = useSeasonalTheme();
  return SEASONAL_ART[theme] ?? SEASONAL_ART.fall;
}

function buildSrcSet(art: Art): string {
  const base = art.src.replace(/\.webp$/, '');
  const entries = art.widths.map((w) => `${base}-${w}.webp ${w}w`);
  entries.push(`${art.src} ${art.intrinsicWidth}w`);
  return entries.join(', ');
}

const fillStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
};

/** The artwork itself, sized to fill its positioned parent. */
export function SeasonalImage({ sizes, className = '' }: { sizes: string; className?: string }) {
  const art = useSeasonalArt();

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={art.src}
      src={art.src}
      srcSet={buildSrcSet(art)}
      sizes={sizes}
      alt=""
      fetchPriority="high"
      decoding="async"
      style={fillStyle}
      className={`object-cover object-center ${className}`}
    />
  );
}

/**
 * Full-bleed seasonal backdrop for the sign-in and sign-up pages.
 *
 * The card and headings sit on top, so a warm scrim is layered over the photo
 * to keep white text readable against the bright snow and foliage.
 */
export default function SeasonalAuthBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <SeasonalImage sizes="100vw" />
      {/* Brand-tinted scrim. Deliberately light enough to keep the artwork
          readable, but weighted toward the middle of the page where the
          headline and card sit. */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/70 via-secondary/45 to-darkwood/70" />
    </div>
  );
}
