/* Smoke test for /api/impact/summary
   - Resets metrics
   - Clears cache
   - Runs phase: cold request, warm requests
   - Dumps metrics
*/

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function postResetMetrics() {
  try {
    const res = await fetch(`${BASE}/api/admin/metrics`, {
      method: 'POST',
      headers: ADMIN_TOKEN ? { 'x-admin-token': ADMIN_TOKEN } : {}
    });
    return res.ok;
  } catch (e) {
    console.error('reset metrics failed', e);
    return false;
  }
}

async function postClearCache() {
  try {
    const res = await fetch(`${BASE}/api/admin/cache`, {
      method: 'POST',
      headers: ADMIN_TOKEN ? { 'x-admin-token': ADMIN_TOKEN } : {}
    });
    return res.ok;
  } catch (e) {
    console.error('clear cache failed', e);
    return false;
  }
}

async function hitImpact(i) {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE}/api/impact/summary`);
    const body = await res.text();
    const took = Date.now() - start;
    console.log(`Request ${i} took ${took}ms (status ${res.status})`);
    return { ok: res.ok, status: res.status, took, body };
  } catch (err) {
    const took = Date.now() - start;
    console.error(`Request ${i} failed after ${took}ms`, err);
    return { ok: false, status: 0, took };
  }
}

async function fetchMetrics() {
  try {
    const res = await fetch(`${BASE}/api/admin/metrics`);
    return await res.json();
  } catch (e) {
    console.error('fetch metrics failed', e);
    return null;
  }
}

async function run() {
  console.log('Resetting metrics and clearing cache...');
  await postResetMetrics();
  await postClearCache();

  console.log('\nPhase 1: Cold cache (single request)');
  await hitImpact(1);

  console.log('\nPhase 2: Warm cache (4 requests with small delay)');
  for (let i = 2; i <= 5; i++) {
    await sleep(1500);
    await hitImpact(i);
  }

  console.log('\nFetching metrics snapshot...');
  const metrics = await fetchMetrics();
  console.dir(metrics, { depth: null });

  console.log('\nDone.');
}

run();
