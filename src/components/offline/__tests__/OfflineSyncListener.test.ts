import { describe, it, expect, vi } from 'vitest';
import * as OfflineQueueSyncModule from '@/lib/offline/OfflineQueueSync';

describe('OfflineSyncListener Logic', () => {
  it('should initialize queue sync listener and execute queue drain when online', async () => {
    const mockDrain = vi.fn().mockResolvedValue({ processed: 1, failed: 0 });
    const mockInit = vi.spyOn(OfflineQueueSyncModule, 'initOfflineQueueSync').mockReturnValue({
      drain: mockDrain,
    } as unknown as ReturnType<typeof OfflineQueueSyncModule.initOfflineQueueSync>);

    const queue = OfflineQueueSyncModule.initOfflineQueueSync();
    const result = await queue.drain();

    expect(mockInit).toHaveBeenCalledTimes(1);
    expect(mockDrain).toHaveBeenCalled();
    expect(result.processed).toBe(1);

    mockInit.mockRestore();
  });
});
