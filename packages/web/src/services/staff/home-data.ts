import { fetchAPI } from '@/lib/utils';

export async function getStaffHomeData() {
  try {
    const [alerts, visitRequests, activeSessions, messages] = await Promise.all([
      fetchAPI('/alerts?status=ACTIVE').catch(() => []),
      fetchAPI('/visit-requests?status=NEW').catch(() => []),
      fetchAPI('/virtual-visits/active').catch(() => []),
      fetchAPI('/messaging/threads').catch(() => []),
    ]);

    return {
      alerts: alerts.slice(0, 10),
      visitRequests: visitRequests.slice(0, 10),
      activeSessions,
      messages: messages.slice(0, 5),
    };
  } catch (error) {
    console.error('Error fetching staff home data:', error);
    return {};
  }
}

