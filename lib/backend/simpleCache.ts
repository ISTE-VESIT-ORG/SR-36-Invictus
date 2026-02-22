/**
 * Tiny in-process cache with background refresh support.
 * Not durable across process restarts but useful to avoid repeated external API latency.
 */
import { recordCacheEvent } from '@/lib/backend/metrics';
type CacheEntry<T> = { ts: number; data: T };

const cache = new Map<string, CacheEntry<any>>();

export function getCached<T>(key: string, maxAgeMs: number): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  const age = Date.now() - entry.ts;
  if (age > maxAgeMs) return entry.data; // return stale data (caller decides) 
  try { recordCacheEvent(key, true); } catch (e) {}
  return entry.data;
}

export function getIfFresh<T>(key: string, maxAgeMs: number): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  const age = Date.now() - entry.ts;
  if (age > maxAgeMs) return null;
  try { recordCacheEvent(key, true); } catch (e) {}
  return entry.data;
}

export function setCache<T>(key: string, data: T) {
  cache.set(key, { ts: Date.now(), data });
}

export async function fetchWithBackgroundRefresh<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const entry = cache.get(key);

  if (entry) {
    const age = Date.now() - entry.ts;
    if (age < ttlMs) {
      // fresh
      try { recordCacheEvent(key, true); } catch (e) {}
      return entry.data as T;
    }

    // stale: return stale immediately, but refresh in background
    try { recordCacheEvent(key, true); } catch (e) {}
    (async () => {
      try {
        const data = await fetcher();
        setCache(key, data);
        console.info(`[simpleCache] Background refresh for ${key} completed`);
      } catch (err) {
        console.warn(`[simpleCache] Background refresh for ${key} failed:`, err);
      }
    })();

    return entry.data as T;
  }

  // No cache: fetch synchronously and populate
  try { recordCacheEvent(key, false); } catch (e) {}
  const data = await fetcher();
  setCache(key, data);
  return data;
}

export function clearCache(key?: string) {
  if (key) cache.delete(key);
  else cache.clear();
}
