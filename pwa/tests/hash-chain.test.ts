/**
 * Hash Chain Tests
 * Verify hash chain integrity and canonical JSON
 */

import { calculateHash, createHashChainedEvent, verifyHashChain } from '../lib/auth/hash-chain';

describe('Hash Chain', () => {
  it('should create stable canonical JSON', async () => {
    const data1 = { b: 2, a: 1, c: 3 };
    const data2 = { a: 1, b: 2, c: 3 };
    
    const hash1 = await calculateHash(data1);
    const hash2 = await calculateHash(data2);
    
    // Should be identical despite different key order
    expect(hash1).toBe(hash2);
  });

  it('should create hash-chained events', async () => {
    const event1 = await createHashChainedEvent(
      'test_event',
      'test_entity',
      'entity-1',
      { data: 'test' },
      null
    );

    const event2 = await createHashChainedEvent(
      'test_event',
      'test_entity',
      'entity-2',
      { data: 'test2' },
      event1.hash
    );

    // Event 2 should link to event 1
    expect(event2.hash).toBeTruthy();
    expect(event1.hash).toBeTruthy();
    expect(event1.hash).not.toBe(event2.hash);
  });

  it('should verify hash chain integrity', async () => {
    // Mock Date.now for deterministic timestamps
    const mockTimestamp = '2024-01-01T00:00:00.000Z';
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockTimestamp);
    
    const event1 = await createHashChainedEvent(
      'test_event',
      'test_entity',
      'entity-1',
      { data: 'test' },
      null
    );

    const event2 = await createHashChainedEvent(
      'test_event',
      'test_entity',
      'entity-2',
      { data: 'test2' },
      event1.hash
    );

    // The data must match exactly what createHashChainedEvent uses internally
    const events = [
      {
        hash: event1.hash,
        previous_hash: null,
        data: { 
          event_type: 'test_event', 
          entity_type: 'test_entity', 
          entity_id: 'entity-1', 
          event_data: { data: 'test' }, 
          previous_hash: null,
          timestamp: mockTimestamp,
        },
      },
      {
        hash: event2.hash,
        previous_hash: event1.hash,
        data: { 
          event_type: 'test_event', 
          entity_type: 'test_entity', 
          entity_id: 'entity-2', 
          event_data: { data: 'test2' }, 
          previous_hash: event1.hash,
          timestamp: mockTimestamp,
        },
      },
    ];

    const result = await verifyHashChain(events);
    expect(result.valid).toBe(true);
    expect(result.invalidIndex).toBeNull();
    
    // Restore mock
    jest.restoreAllMocks();
  });

  it('should detect tampered hash chain', async () => {
    // Mock Date.now for deterministic timestamps
    const mockTimestamp = '2024-01-01T00:00:00.000Z';
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockTimestamp);
    
    const event1 = await createHashChainedEvent(
      'test_event',
      'test_entity',
      'entity-1',
      { data: 'test' },
      null
    );

    // Tampered data - original was { data: 'test' } but we changed it
    const events = [
      {
        hash: event1.hash,
        previous_hash: null,
        data: { 
          event_type: 'test_event', 
          entity_type: 'test_entity', 
          entity_id: 'entity-1', 
          event_data: { data: 'TAMPERED' },  // This is different!
          previous_hash: null,
          timestamp: mockTimestamp,
        },
      },
    ];

    const result = await verifyHashChain(events);
    expect(result.valid).toBe(false);
    expect(result.invalidIndex).toBe(0);
    
    // Restore mock
    jest.restoreAllMocks();
  });
});

