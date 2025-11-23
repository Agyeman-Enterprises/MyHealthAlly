type DeviceProvider = 'APPLE' | 'OURA' | 'FITBIT' | 'GARMIN' | 'WITHINGS';

export function normalizeHRVToRmssdMs(params: {
  provider: DeviceProvider;
  rmssdMs?: number;
  sdnnMs?: number;
}): { rmssdMs: number; sdnnMs?: number } | null {
  const { provider, rmssdMs, sdnnMs } = params;

  if (provider === 'OURA' || provider === 'FITBIT' || provider === 'GARMIN') {
    if (!rmssdMs) return null;
    return { rmssdMs, sdnnMs };
  }

  if (provider === 'APPLE') {
    if (!sdnnMs) return null;
    // simple linear approximation: RMSSD ≈ SDNN * 0.85 (can be tuned later)
    return { rmssdMs: sdnnMs * 0.85, sdnnMs };
  }

  return null;
}

export function computeBMI(weightKg: number, heightCm: number): number | null {
  const h = heightCm / 100;
  if (!h) return null;
  return weightKg / (h * h);
}

