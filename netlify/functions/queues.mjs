import { createHash } from 'node:crypto';

const branchIds = new Set(['cbz-kwame','cbz-samora','cbz-westgate','fbc-cbd','fbc-belgravia','zb-cbd','zb-avondale','cabs-first','cabs-avondale','stb-cbd','fcb-first']);
const services = new Set(['Cash withdrawal','Cash deposit','Account opening','Card services','General enquiries']);
const json = (statusCode, body) => ({ statusCode, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }, body: JSON.stringify(body) });
const minute = 60_000;

async function database(path, init = {}) {
  const root = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!root || !key || !process.env.REPORT_HASH_SECRET) throw new Error('Service is not configured');
  const response = await fetch(`${root}/rest/v1/${path}`, { ...init, headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json', ...(init.headers || {}) } });
  if (!response.ok) { const error = new Error(`Database request failed: ${response.status}`); error.status = response.status; throw error; }
  return response.status === 204 ? null : response.json();
}

export async function handler(event) {
  try {
    if (event.httpMethod === 'GET') {
      const cutoff = new Date(Date.now() - 60 * minute).toISOString();
      const rows = await database(`queue_reports?select=branch_id,service,wait_minutes,reported_at,reporter_hash&reported_at=gte.${encodeURIComponent(cutoff)}&order=reported_at.desc&limit=1000`);
      const groups = new Map();
      for (const row of rows) {
        const key = `${row.branch_id}:${row.service}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(row);
      }
      const estimates = [];
      for (const [key, group] of groups) {
        const distinct = new Set(group.map(r => r.reporter_hash)).size;
        if (distinct < 2) continue;
        const values = group.map(r => r.wait_minutes).sort((a,b) => a-b);
        const median = values[Math.floor(values.length / 2)];
        const [branchId, service] = key.split(':');
        estimates.push({ branchId, service, minutes: Math.round(median / 5) * 5, count: distinct, latest: group[0].reported_at });
      }
      return json(200, { estimates, updatedAt: new Date().toISOString() });
    }
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
    if ((event.body?.length || 0) > 1024) return json(413, { error: 'Report is too large' });
    let body;
    try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'Invalid JSON' }); }
    const { branchId, service, minutes } = body;
    if (!branchIds.has(branchId) || !services.has(service) || !Number.isInteger(minutes) || minutes < 0 || minutes > 240) return json(400, { error: 'Select a valid branch, service and wait time (0–240 minutes).' });
    const ip = event.headers['x-nf-client-connection-ip'];
    if (!ip) return json(503, { error: 'Reports require verified network information.' });
    const reporterHash = createHash('sha256').update(`${process.env.REPORT_HASH_SECRET}:${ip}`).digest('hex');
    const bucket = Math.floor(Date.now() / (30 * minute));
    const payload = { branch_id: branchId, service, wait_minutes: minutes, reporter_hash: reporterHash, report_bucket: bucket };
    await database('queue_reports', { method: 'POST', headers: { prefer: 'return=minimal' }, body: JSON.stringify(payload) });
    return json(201, { saved: true });
  } catch (error) {
    if (error.status === 409) return json(429, { error: 'You have already reported this branch and service recently.' });
    console.error('Queue service error:', error.message);
    return json(503, { error: 'Queue updates are temporarily unavailable. Please try again later.' });
  }
}
