'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type SeasonalTheme = 'fall' | 'winter';

interface SeasonalThemeContextValue {
  theme: SeasonalTheme;
  setTheme: (theme: SeasonalTheme) => void;
}

const SeasonalThemeContext = createContext<SeasonalThemeContextValue | undefined>(undefined);

const SNOW_WEATHER_CODES = new Set([71, 73, 75, 77, 85, 86]);

function getSeasonFromDate(date: Date): SeasonalTheme {
  const month = date.getMonth();
  return month === 11 || month === 0 || month === 1 ? 'winter' : 'fall';
}

function shouldUseWinterTheme(payload: {
  current?: { temperature_2m?: number; weather_code?: number };
  daily?: { temperature_2m_min?: number[]; snowfall_sum?: number[] };
}): boolean {
  const currentTemp = payload.current?.temperature_2m;
  const currentCode = payload.current?.weather_code;

  if (typeof currentCode === 'number' && SNOW_WEATHER_CODES.has(currentCode)) {
    return true;
  }

  if (typeof currentTemp === 'number' && currentTemp <= 5) {
    return true;
  }

  const minTemps = payload.daily?.temperature_2m_min ?? [];
  const snowfall = payload.daily?.snowfall_sum ?? [];

  for (let i = 0; i < Math.min(minTemps.length, 5); i += 1) {
    if (typeof minTemps[i] === 'number' && minTemps[i] <= 2) {
      return true;
    }
  }

  for (let i = 0; i < Math.min(snowfall.length, 5); i += 1) {
    if (typeof snowfall[i] === 'number' && snowfall[i] > 0) {
      return true;
    }
  }

  return false;
}

function applyThemeClass(theme: SeasonalTheme) {
  const root = document.documentElement;
  root.classList.toggle('theme-winter', theme === 'winter');
  root.classList.toggle('theme-fall', theme === 'fall');
}

async function fetchSeasonFromWeather(latitude: number, longitude: number): Promise<SeasonalTheme | null> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('current', 'temperature_2m,weather_code');
  url.searchParams.set('daily', 'temperature_2m_min,snowfall_sum');
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url.toString());
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return shouldUseWinterTheme(data) ? 'winter' : 'fall';
}

export default function SeasonalThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<SeasonalTheme>(() => getSeasonFromDate(new Date()));

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    const fallbackTheme = getSeasonFromDate(new Date());
    setTheme(fallbackTheme);

    if (!navigator?.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const nextTheme = await fetchSeasonFromWeather(
            position.coords.latitude,
            position.coords.longitude,
          );

          if (!cancelled && nextTheme) {
            setTheme(nextTheme);
          }
        } catch {
          if (!cancelled) {
            setTheme(fallbackTheme);
          }
        }
      },
      () => {
        if (!cancelled) {
          setTheme(fallbackTheme);
        }
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <SeasonalThemeContext.Provider value={value}>
      {children}
    </SeasonalThemeContext.Provider>
  );
}

export function useSeasonalTheme() {
  const context = useContext(SeasonalThemeContext);
  if (!context) {
    throw new Error('useSeasonalTheme must be used within SeasonalThemeProvider');
  }
  return context;
}
