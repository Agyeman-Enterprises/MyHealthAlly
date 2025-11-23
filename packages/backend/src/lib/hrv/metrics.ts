// Types will be available after Prisma client is regenerated
type HRVReading = {
  id: string;
  patientId: string;
  timestamp: Date;
  source: string;
  rmssdMs: number;
  sdnnMs?: number | null;
  context: string;
  createdAt: Date;
};

type VitalReading = {
  id: string;
  patientId: string;
  timestamp: Date;
  source: string;
  heartRate?: number | null;
  spo2?: number | null;
  respiration?: number | null;
  systolicBP?: number | null;
  diastolicBP?: number | null;
  createdAt: Date;
};

export function computeRecoveryScore(params: {
  hrv: HRVReading[];
  vitals: VitalReading[];
}): number {
  if (!params.hrv.length) return 0;
  const recent = params.hrv.slice(-7);
  const avgRmssd =
    recent.reduce((s, r) => s + r.rmssdMs, 0) / recent.length;

  // placeholder formula: 0–100
  const normalized = Math.max(0, Math.min(100, (avgRmssd / 120) * 100));
  return Math.round(normalized);
}

export function computeStressLevel(params: {
  hrv: HRVReading[];
  vitals: VitalReading[];
}): 'low' | 'moderate' | 'high' {
  if (!params.hrv.length) return 'moderate';
  const last = params.hrv[params.hrv.length - 1].rmssdMs;

  if (last >= 80) return 'low';
  if (last >= 50) return 'moderate';
  return 'high';
}

