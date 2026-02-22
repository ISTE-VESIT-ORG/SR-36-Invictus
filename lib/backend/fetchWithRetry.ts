// Shared fetch wrapper with timeout, retries, and exponential backoff
export interface FetchRetryOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  // Optional metric name to record timings/Failures
  metricName?: string;
}

export async function fetchWithRetry<T = any>(url: string, opts: FetchRetryOptions = {}): Promise<T> {
  const { timeoutMs = 5000, retries = 2, ...init } = opts;

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const start = Date.now();

    try {
      const response = await fetch(url, { ...init, signal: controller.signal } as RequestInit);
      clearTimeout(timeoutId);
      const duration = Date.now() - start;
      if (opts.metricName) {
        try { (await import('./metrics')).recordFetchMetric(opts.metricName, duration, response.ok, false); } catch (_) {}
      }

      if (!response.ok) {
        const err = new Error(`HTTP ${response.status}`);
        (err as any).status = response.status;
        throw err;
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return (await response.json()) as T;
      }

      const text = await response.text();
      return text as unknown as T;

    } catch (err: any) {
      clearTimeout(timeoutId);
      const duration = Date.now() - (opts as any).__startTime || 0;
      const isAbort = err.name === 'AbortError' || err.code === 'ABORT_ERR' || err.type === 'aborted';
      if (opts.metricName) {
        try { (await import('./metrics')).recordFetchMetric(opts.metricName, Date.now() - start, false, !!isAbort); } catch (_) {}
      }

      if (attempt === retries) throw err;

      const backoffMs = 300 * 2 ** attempt;
      try { await sleep(backoffMs); } catch (_) {}
      // continue to next attempt
    }
  }

  // Shouldn't reach here
  throw new Error('fetchWithRetry: exhausted retries');
}
