const DEVICE_ID_KEY = 'myh.device.id';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getOrCreateDeviceId() {
  if (!isBrowser()) {
    return 'server-device';
  }
  let id = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function detectPlatform(): 'IOS' | 'ANDROID' | 'WEB' {
  if (!isBrowser()) {
    return 'WEB';
  }
  const agent = navigator.userAgent || '';
  if (/android/i.test(agent)) return 'ANDROID';
  if (/iphone|ipad|ipod/i.test(agent)) return 'IOS';
  return 'WEB';
}

export function getDeviceMetadata(idleTimeoutSeconds = 900) {
  const platform = detectPlatform();
  return {
    deviceId: getOrCreateDeviceId(),
    deviceName: isBrowser() ? navigator.userAgent : 'server',
    platform,
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || 'web',
    idleTimeoutSeconds,
  };
}

