/**
 * MotaLink Offline Sync Engine
 * Handles client-side queuing in IndexedDB for rural/low-signal Zimbabwean routes,
 * and syncs payloads automatically to /api/sync once network connection is restored.
 */

export interface OfflineTripPayload {
  syncUuid: string;
  tripId: string;
  driverId: string;
  vehicleId: string;
  endOdometerKm: number;
  endFuelLevelL: number;
  fuelAddedL?: number;
  fuelCostUSD?: number;
  timestamp: string;
  pings: Array<{
    latitude: number;
    longitude: number;
    speedKmh: number;
    timestamp: string;
  }>;
}

const STORAGE_KEY = 'motalink_offline_queue_v1';

export function getOfflineQueue(): OfflineTripPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading offline queue:', e);
    return [];
  }
}

export function queueOfflineRecord(record: OfflineTripPayload): void {
  if (typeof window === 'undefined') return;
  const queue = getOfflineQueue();
  queue.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

export async function processOfflineSync(): Promise<{ success: boolean; syncedCount: number; errors: any[] }> {
  if (typeof window === 'undefined') return { success: false, syncedCount: 0, errors: ['Server side'] };
  
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { success: true, syncedCount: 0, errors: [] };
  }

  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: queue }),
    });

    const resData = await response.json();
    if (response.ok && resData.success) {
      clearOfflineQueue();
      return { success: true, syncedCount: queue.length, errors: [] };
    } else {
      return { success: false, syncedCount: 0, errors: [resData.message || 'Sync failed'] };
    }
  } catch (error: any) {
    console.error('Offline sync network error:', error);
    return { success: false, syncedCount: 0, errors: [error.message || 'Network unreachable'] };
  }
}
