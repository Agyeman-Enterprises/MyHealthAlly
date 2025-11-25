import { fetchAPI } from '@/lib/utils';

export interface TriageNotification {
  id: string;
  userId: string;
  taskId: string;
  type: 'MA_ACTION' | 'MD_OVERRIDE' | 'TASK_COMPLETED' | 'TASK_OVERDUE';
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  read: boolean;
  createdAt: string;
}

export async function sendTriageNotification(data: {
  userId: string;
  taskId: string;
  type: TriageNotification['type'];
  message: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}): Promise<TriageNotification> {
  return fetchAPI('/triage/notifications', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      priority: data.priority || 'MEDIUM',
    }),
  });
}

export async function getTriageNotifications(userId?: string): Promise<TriageNotification[]> {
  const url = userId ? `/triage/notifications?userId=${userId}` : '/triage/notifications';
  return fetchAPI(url);
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  return fetchAPI(`/triage/notifications/${notificationId}/read`, {
    method: 'POST',
  });
}

