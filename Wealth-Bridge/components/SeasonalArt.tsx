'use client';

import React from 'react';
import Image from 'next/image';
import { useSeasonalTheme } from '@/components/SeasonalThemeProvider';

/**
 * Seasonal artwork, shared by the home hero and the auth pages.
 *
 * Which image shows is decided by SeasonalThemeProvider, which already reads
 * live conditions from Open-Meteo (falling back to the calendar month) to pick
 * the palette. Keeping the artwork on that same hook means one source of truth
 * and no second weather lookup.
 */
export const SEASONAL_ART = {
  fall: {
    src: '/hero-fall.webp',
    alt: 'A wooden footbridge over a stream running through autumn woodland',
  },
  winter: {
    src: '/hero-winter.webp',
    alt: 'A wooden footbridge over a stream running through snow-covered woodland',
  },
} as const;

export function useSeasonalArt() {
  const { theme } = useSeasonalTheme();
  return SEASONAL_ART[theme] ?? SEASONAL_ART.fall;
}

/**
 * Full-bleed seasonal backdrop for the sign-in and sign-up pages.
 *
 * The card and headings sit on top, so a warm scrim is layered over the photo
 * to keep white text readable against the bright snow and foliage.
 */
export default function SeasonalAuthBackdrop() {
  const art = useSeasonalArt();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        key={art.src}
        src={art.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Brand-tinted scrim. Deliberately light enough to keep the artwork
          readable, but weighted toward the middle of the page where the
          headline and card sit. Contrast of the heading against this is
          checked in the verification pass. */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/70 via-secondary/45 to-darkwood/70" />
    </div>
  );
}
