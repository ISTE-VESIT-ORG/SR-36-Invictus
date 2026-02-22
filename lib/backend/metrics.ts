type MetricBucket = {
  count: number;
  failures: number;
  timeouts: number;
  totalDurationMs: number;
  lastSampleMs?: number;
};

const metricsStore: Record<string, MetricBucket> = {};

function ensure(bucket: string) {
  if (!metricsStore[bucket]) {
    metricsStore[bucket] = { count: 0, failures: 0, timeouts: 0, totalDurationMs: 0 };
  }
}

export function recordFetchMetric(name: string, durationMs: number, success = true, timeout = false) {
  try {
    ensure(name);
    const b = metricsStore[name];
    b.count += 1;
    if (!success) b.failures += 1;
    if (timeout) b.timeouts += 1;
    b.totalDurationMs += durationMs;
    b.lastSampleMs = durationMs;
  } catch (e) {
    // swallow
  }
}

// Record cache hit/miss under a cache-specific bucket
export function recordCacheEvent(name: string, hit: boolean) {
  try {
    const key = `cache.${name}`;
    ensure(key);
    const b = metricsStore[key];
    b.count += 1; // total cache checks
    if (!hit) b.failures += 1; // treat miss as a failure counter for visibility
    b.lastSampleMs = 0;
  } catch (e) {
    // swallow
  }
}

export function getMetrics() {
  // Return a shallow copy to avoid mutation
  const out: Record<string, MetricBucket & { avgMs: number }> = {};
  for (const k of Object.keys(metricsStore)) {
    const v = metricsStore[k];
    out[k] = { ...v, avgMs: v.count ? Math.round(v.totalDurationMs / v.count) : 0 };
  }
  return out;
}

export function resetMetrics() {
  for (const k of Object.keys(metricsStore)) delete metricsStore[k];
}
