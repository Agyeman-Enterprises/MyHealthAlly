import { fetchAPI } from '@/lib/utils';
import { getStoredMetaSync } from '@/lib/auth-storage';

export async function getPatientDashboardData() {
  try {
    const meta = getStoredMetaSync();
    if (!meta?.user) return {};

    const patientId = meta.user.patientId || meta.user.id;

    if (!patientId) return {};

    const [vitals, carePlan, visits, messages] = await Promise.all([
      fetchAPI(`/patients/${patientId}/measurements?limit=10`).catch(() => []),
      fetchAPI(`/patients/${patientId}/care-plans`).catch(() => []),
      fetchAPI(`/visits/patient/${patientId}?status=PLANNED`).catch(() => []),
      fetchAPI('/messaging/threads').catch(() => []),
    ]);

    return {
      vitals,
      carePlan: carePlan?.[0] || null,
      upcomingVisit: visits?.[0] || null,
      messages: messages.slice(0, 2),
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {};
  }
}

