import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for Node.js environment
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock crypto.subtle for hash-chain tests - must be deterministic
const mockCrypto = {
  subtle: {
    digest: jest.fn(async (algorithm, data) => {
      // Create a deterministic hash based on content
      const dataArray = new Uint8Array(data);
      const mockHash = new Uint8Array(32);
      
      // Simple but deterministic hash function
      let hash = 5381;
      for (let i = 0; i < dataArray.length; i++) {
        hash = ((hash << 5) + hash) ^ dataArray[i];
        hash = hash >>> 0; // Convert to unsigned 32-bit
      }
      
      // Spread the hash across 32 bytes
      for (let i = 0; i < 32; i++) {
        const seed = hash ^ (i * 2654435761);
        mockHash[i] = ((seed >>> (i % 4) * 8) & 0xff);
      }
      return mockHash.buffer;
    }),
  },
  getRandomValues: jest.fn((array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useParams: () => ({ id: 'test-id' }),
}));

// Mock Supabase
jest.mock('./lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      setSession: jest.fn(),
      refreshSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
  },
}));

