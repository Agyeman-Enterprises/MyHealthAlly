import { fetchAPI } from '@/lib/utils';

export interface DashboardVisit {
  id: string;
  patientId: string;
  patientName: string;
  startTime: string;
  status: string;
  visitType: string;
  visitMode: string;
  reason: string;
  provider?: {
    id: string;
    name: string;
  };
}

export interface DashboardMessage {
  id: string;
  patientId: string;
  patientName: string;
  lastMessageSnippet: string;
  lastMessageTime: string;
  unreadCount: number;
  channel: 'portal' | 'sms' | 'call';
}

export interface DashboardPatient {
  id: string;
  name: string;
  riskLevel: 'low' | 'moderate' | 'high';
  lastVisit?: string;
  nextVisit?: string;
}

export async function getTodayVisits(providerId?: string): Promise<DashboardVisit[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const params = new URLSearchParams();
    params.append('startDate', today.toISOString());
    params.append('endDate', tomorrow.toISOString());
    params.append('status', 'PLANNED');

    if (providerId) {
      const visits = await fetchAPI(`/visits/provider/${providerId}?${params.toString()}`);
      return visits.map((visit: any) => ({
        id: visit.id,
        patientId: visit.patientId,
        patientName: visit.patient?.firstName && visit.patient?.lastName
          ? `${visit.patient.firstName} ${visit.patient.lastName}`
          : 'Unknown Patient',
        startTime: visit.slot?.startTime || visit.createdAt,
        status: visit.status,
        visitType: visit.visitType,
        visitMode: visit.visitMode,
        reason: visit.reasonText || '',
        provider: visit.provider ? {
          id: visit.provider.id,
          name: visit.provider.name || 'Provider',
        } : undefined,
      }));
    }

    // If no providerId, get all visits for clinic (would need clinic endpoint)
    return [];
  } catch (error) {
    console.error('Failed to fetch today visits:', error);
    return [];
  }
}

export async function getHighRiskPatients(): Promise<DashboardPatient[]> {
  try {
    // Get patients with active alerts
    const alerts = await fetchAPI('/alerts');
    const highRiskAlerts = alerts.filter((alert: any) => 
      alert.severity === 'critical' || alert.severity === 'high'
    );

    // Get unique patient IDs
    const patientIds: string[] = Array.from(new Set<string>(highRiskAlerts.map((alert: any) => alert.patientId as string)));

    // Fetch patient details
    const patientPromises = patientIds.map(async (patientId: string) => {
      try {
        const patient = await fetchAPI(`/patients/${patientId}`);
        return {
          id: patient.id,
          name: patient.firstName && patient.lastName
            ? `${patient.firstName} ${patient.lastName}`
            : 'Unknown Patient',
          riskLevel: 'high' as const,
          lastVisit: patient.visits?.[0]?.createdAt,
          nextVisit: patient.visits?.[0]?.slot?.startTime,
        } as DashboardPatient;
      } catch (error) {
        console.error(`Failed to fetch patient ${patientId}:`, error);
        return null;
      }
    });

    const patients = await Promise.all(patientPromises);
    return patients.filter((p): p is DashboardPatient => p !== null);
  } catch (error) {
    console.error('Failed to fetch high-risk patients:', error);
    return [];
  }
}

export async function getRecentMessages(): Promise<DashboardMessage[]> {
  try {
    const threads = await fetchAPI('/messaging/threads');
    
    return threads.slice(0, 5).map((thread: any) => {
      const lastMessage = thread.messages?.[0];
      const patient = thread.patient;
      
      return {
        id: thread.id,
        patientId: thread.patientId,
        patientName: patient?.firstName && patient?.lastName
          ? `${patient.firstName} ${patient.lastName}`
          : 'Unknown Patient',
        lastMessageSnippet: lastMessage?.content?.substring(0, 100) || 'No messages',
        lastMessageTime: lastMessage?.createdAt || thread.lastMessageAt || thread.createdAt,
        unreadCount: thread.unreadCount || 0,
        channel: 'portal' as const,
      };
    });
  } catch (error) {
    console.error('Failed to fetch recent messages:', error);
    return [];
  }
}

export async function getUnreviewedLabsCount(): Promise<number> {
  try {
    // This would need a labs endpoint that returns unreviewed count
    // For now, return 0
    return 0;
  } catch (error) {
    console.error('Failed to fetch unreviewed labs count:', error);
    return 0;
  }
}

