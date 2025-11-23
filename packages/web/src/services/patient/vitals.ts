import { fetchAPI } from '@/lib/utils';

export type Metric = {
  id: string;
  label: string;
  value: string | number;
  status: 'in-range' | 'high' | 'low';
  unit?: string;
};

export async function getPatientVitalsSummary(metricIds?: string[]): Promise<Metric[]> {
  try {
    // Get patient ID from auth context or pass it as parameter
    // For now, we'll need to get it from localStorage or context
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!userStr) return [];
    
    const user = JSON.parse(userStr);
    const patientId = user.patientId || user.id;

    if (!patientId) return [];

    const measurements = await fetchAPI(`/patients/${patientId}/measurements?limit=50`);
    
    // Get latest measurement for each type
    const latest: { [key: string]: any } = {};
    measurements.forEach((m: any) => {
      if (!latest[m.type] || new Date(m.timestamp) > new Date(latest[m.type].timestamp)) {
        latest[m.type] = m;
      }
    });

    const metricMap: { [key: string]: { label: string; unit: string } } = {
      HEART_RATE: { label: 'Heart Rate', unit: 'bpm' },
      BLOOD_PRESSURE: { label: 'Blood Pressure', unit: 'mmHg' },
      OXYGEN_SATURATION: { label: 'O₂ Saturation', unit: '%' },
      WEIGHT: { label: 'Weight', unit: 'lbs' },
      GLUCOSE: { label: 'Glucose', unit: 'mg/dL' },
    };

    const result: Metric[] = [];
    const typesToShow = metricIds?.length ? metricIds : Object.keys(metricMap);

    typesToShow.forEach((type) => {
      const measurement = latest[type];
      if (!measurement) return;

      const config = metricMap[type];
      if (!config) return;

      let value: string | number;
      let status: 'in-range' | 'high' | 'low' = 'in-range';

      if (type === 'BLOOD_PRESSURE' && typeof measurement.value === 'object') {
        const bp = measurement.value as { systolic: number; diastolic: number };
        value = `${bp.systolic}/${bp.diastolic}`;
        // Simple status check
        status = bp.systolic > 130 || bp.diastolic > 80 ? 'high' : 'in-range';
      } else {
        value = measurement.value as number;
        // Simple status checks (can be enhanced)
        if (type === 'HEART_RATE') {
          status = value > 100 ? 'high' : value < 60 ? 'low' : 'in-range';
        } else if (type === 'OXYGEN_SATURATION') {
          status = value < 95 ? 'low' : 'in-range';
        } else if (type === 'GLUCOSE') {
          status = value > 140 ? 'high' : value < 70 ? 'low' : 'in-range';
        }
      }

      result.push({
        id: type,
        label: config.label,
        value,
        status,
        unit: config.unit,
      });
    });

    return result;
  } catch (error) {
    console.error('Error fetching vitals summary:', error);
    return [];
  }
}

