import { fetchAPI } from '@/lib/utils';
import type { DeviceSummary } from '@myhealthally/shared';

export interface DeviceWithSessions extends DeviceSummary {
  sessions?: { id: string; lastActiveAt: string; expiresAt: string }[];
}

export async function getUserDevices(): Promise<DeviceWithSessions[]> {
  const response = await fetchAPI('/auth/devices');
  return response?.map?.((device: DeviceWithSessions) => device) ?? [];
}

export async function updateDevicePin(payload: {
  deviceRecordId: string;
  pin?: string;
  remove?: boolean;
  encryptedKeyBlob?: string;
}): Promise<DeviceSummary | null> {
  return fetchAPI('/auth/device/pin', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateDeviceBiometric(payload: {
  deviceRecordId: string;
  biometricToken?: string;
  remove?: boolean;
  encryptedKeyBlob?: string;
}): Promise<DeviceSummary | null> {
  return fetchAPI('/auth/device/biometric', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function unlockWithDevice(payload: {
  deviceRecordId: string;
  method: 'PIN' | 'BIOMETRIC';
  pin?: string;
  biometricToken?: string;
}) {
  return fetchAPI('/auth/device/unlock', {
    method: 'POST',
    skipAuth: true,
    body: JSON.stringify(payload),
  });
}

