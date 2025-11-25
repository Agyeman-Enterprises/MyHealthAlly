import type { AuthResponse } from '@myhealthally/shared';
import { decryptValue, encryptValue, clearVaultKey } from './token-vault';

const ACCESS_TOKEN_KEY = 'myh.auth.access';
const REFRESH_TOKEN_KEY = 'myh.auth.refresh';
const META_KEY = 'myh.auth.meta';
const BIOMETRIC_SECRET_KEY = 'myh.device.biometric';

export interface StoredAuthMeta {
  user: any;
  device?: any;
  session?: any;
}

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getStoredMetaSync(): StoredAuthMeta | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function persistAuthResponse(response: AuthResponse) {
  if (!isBrowser()) return;

  const meta: StoredAuthMeta = {
    user: response.user,
    device: response.device,
    session: response.session,
  };

  window.localStorage.setItem(META_KEY, JSON.stringify(meta));
  window.localStorage.setItem(
    ACCESS_TOKEN_KEY,
    await encryptValue(response.accessToken),
  );
  window.localStorage.setItem(
    REFRESH_TOKEN_KEY,
    await encryptValue(response.refreshToken),
  );
}

export async function updateAccessToken(
  accessToken: string,
  updates?: Partial<StoredAuthMeta>,
) {
  if (!isBrowser()) return;
  window.localStorage.setItem(
    ACCESS_TOKEN_KEY,
    await encryptValue(accessToken),
  );

  if (updates) {
    const current = getStoredMetaSync() || {};
    const merged = {
      ...current,
      ...updates,
    };
    window.localStorage.setItem(META_KEY, JSON.stringify(merged));
  }
}

export async function updateMeta(meta: StoredAuthMeta) {
  if (!isBrowser()) return;
  window.localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export async function getAccessToken(): Promise<string | null> {
  if (!isBrowser()) return null;
  const encrypted = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  return decryptValue(encrypted);
}

export async function getRefreshToken(): Promise<string | null> {
  if (!isBrowser()) return null;
  const encrypted = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  return decryptValue(encrypted);
}

export function getEncryptedRefreshBlob(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function clearAuthStorage() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(META_KEY);
  clearVaultKey();
}

export async function saveBiometricSecret(
  deviceRecordId: string,
  secret: string,
) {
  if (!isBrowser()) return;
  const encrypted = await encryptValue(secret);
  const raw = window.localStorage.getItem(BIOMETRIC_SECRET_KEY);
  const map = raw ? JSON.parse(raw) : {};
  map[deviceRecordId] = encrypted;
  window.localStorage.setItem(BIOMETRIC_SECRET_KEY, JSON.stringify(map));
}

export async function getBiometricSecret(
  deviceRecordId: string,
): Promise<string | null> {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(BIOMETRIC_SECRET_KEY);
  if (!raw) return null;
  const map = JSON.parse(raw);
  return decryptValue(map[deviceRecordId] || null);
}

export function removeBiometricSecret(deviceRecordId: string) {
  if (!isBrowser()) return;
  const raw = window.localStorage.getItem(BIOMETRIC_SECRET_KEY);
  if (!raw) return;
  const map = JSON.parse(raw);
  delete map[deviceRecordId];
  window.localStorage.setItem(BIOMETRIC_SECRET_KEY, JSON.stringify(map));
}

