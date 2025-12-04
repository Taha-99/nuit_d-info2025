import { syncOfflinePayloads } from './apiService';

export const syncQueuedPayloads = async (db) => {
  if (!db) return { synced: 0 };
  const queue = await db.getAll('queue');
  if (!queue.length) {
    return { synced: 0 };
  }

  const payloads = queue.map((item) => item.payload);
  const result = await syncOfflinePayloads(payloads);

  const tx = db.transaction('queue', 'readwrite');
  await tx.store.clear();
  await tx.done;
  return result;
};
