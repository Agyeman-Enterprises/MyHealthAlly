const ACCESS_IV_LENGTH = 12;
const VAULT_KEY = 'myh.vault.key';

function base64Encode(buffer: ArrayBuffer | Uint8Array) {
  if (buffer instanceof Uint8Array) {
    return btoa(String.fromCharCode(...buffer));
  }
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64Decode(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getVaultKey(): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error('Crypto APIs are not available');
  }

  let storedKey = localStorage.getItem(VAULT_KEY);
  if (!storedKey) {
    const raw = window.crypto.getRandomValues(new Uint8Array(32));
    storedKey = base64Encode(raw);
    localStorage.setItem(VAULT_KEY, storedKey);
  }

  const rawKey = base64Decode(storedKey);
  return window.crypto.subtle.importKey(
    'raw',
    rawKey,
    'AES-GCM',
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptValue(value: string): Promise<string> {
  if (typeof window === 'undefined') {
    return value;
  }

  const key = await getVaultKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(ACCESS_IV_LENGTH));
  const encoded = new TextEncoder().encode(value);
  const cipher = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded,
  );

  return `${base64Encode(iv)}.${base64Encode(cipher)}`;
}

export async function decryptValue(payload: string | null): Promise<string | null> {
  if (!payload || typeof window === 'undefined') {
    return null;
  }

  const [ivPart, cipherPart] = payload.split('.');
  if (!ivPart || !cipherPart) {
    return null;
  }

  try {
    const key = await getVaultKey();
    const iv = base64Decode(ivPart);
    const cipherBytes = base64Decode(cipherPart);
    const buffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipherBytes,
    );

    return new TextDecoder().decode(buffer);
  } catch (error) {
    console.warn('TokenVault decrypt failed', error);
    return null;
  }
}

export function clearVaultKey() {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(VAULT_KEY);
}

