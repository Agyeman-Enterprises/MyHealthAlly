import { fetchAPI } from '@/lib/utils';

export async function getPatientDashboardData() {
  try {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!userStr) return {};
    
    const user = JSON.parse(userStr);
    const patientId = user.patientId || user.id;

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

