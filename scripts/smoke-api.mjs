#!/usr/bin/env node
/**
 * Smoke-test key Paisa API endpoints against a running backend.
 *
 * Usage:
 *   PAISA_API_URL=http://localhost:8001/api/v1 \
 *   PAISA_EMAIL=you@example.com \
 *   PAISA_PASSWORD=secret \
 *   node scripts/smoke-api.mjs
 */

const BASE = process.env.PAISA_API_URL ?? 'http://localhost:8001/api/v1';
const EMAIL = process.env.PAISA_EMAIL ?? 'smoke@example.com';
const PASSWORD = process.env.PAISA_PASSWORD ?? 'SmokeTest123!';

const month = new Date().toISOString().slice(0, 7);

async function request(method, path, { token, body, expectEnvelope = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 200)}`);
  }
  if (expectEnvelope && json && json.success === false) {
    throw new Error(`${method} ${path} envelope failure: ${json.message}`);
  }
  return json;
}

async function loginOrRegister() {
  try {
    const login = await request('POST', '/auth/login', {
      body: { email: EMAIL, password: PASSWORD },
    });
    return login.data.access_token;
  } catch {
    const regOpen = await request('GET', '/auth/registration-open');
    if (!regOpen.data?.open) {
      throw new Error('Login failed and registration is closed. Set PAISA_EMAIL / PAISA_PASSWORD.');
    }
    const reg = await request('POST', '/auth/register', {
      body: { email: EMAIL, password: PASSWORD, name: 'Smoke Tester' },
    });
    return reg.data.access_token;
  }
}

const checks = [];

async function check(name, fn) {
  try {
    await fn();
    checks.push({ name, ok: true });
    console.log(`✓ ${name}`);
  } catch (err) {
    checks.push({ name, ok: false, error: err.message });
    console.error(`✗ ${name}: ${err.message}`);
  }
}

async function main() {
  console.log(`Smoke testing ${BASE}\n`);

  let token = '';
  await check('health/live', async () => {
    await request('GET', '/health/live');
  });

  await check('auth', async () => {
    token = await loginOrRegister();
    if (!token) throw new Error('No access token');
  });

  if (!token) {
    console.error('\nCannot continue without auth token.');
    process.exit(1);
  }

  const authed = (method, path, opts = {}) => request(method, path, { ...opts, token });

  await check('profile', () => authed('GET', '/profile'));
  await check('categories', () => authed('GET', '/categories'));
  await check('transactions list', () => authed('GET', `/transactions?month=${month}`));
  await check('transactions summary', () => authed('GET', `/transactions/summary?month=${month}`));
  await check('dashboard/life', () => authed('GET', `/dashboard/life?month=${month}`));
  await check('budget', () => authed('GET', '/budget'));
  await check('budget summary', () => authed('GET', `/budget/summary?month=${month}`));
  await check('bills', () => authed('GET', `/bills?month=${month}`));
  await check('cards', () => authed('GET', '/cards'));
  await check('goals', () => authed('GET', '/goals'));
  await check('investments summary', () => authed('GET', '/investments/summary'));
  await check('ledger', () => authed('GET', '/ledger'));
  await check('groups', () => authed('GET', '/groups'));
  await check('calendar', () => authed('GET', `/calendar?month=${month}`));
  await check('heatmap', () => authed('GET', '/heatmap?weeks=4'));
  await check('insights health', () => authed('GET', `/insights/health?month=${month}`));
  await check('reports monthly', () => authed('GET', `/reports/monthly?month=${month}`));
  await check('notifications', () => authed('GET', '/notifications'));

  await check('create expense transaction', async () => {
    const cats = await authed('GET', '/categories');
    const expense = (cats.data ?? []).find((c) => c.kind === 'expense');
    if (!expense) throw new Error('No expense categories seeded');
    const created = await authed('POST', '/transactions', {
      body: {
        type: 'expense',
        category_id: expense.id,
        amount: '99.50',
        date: `${month}-02`,
        note: 'Smoke test expense',
      },
    });
    if (!created.data?.id) throw new Error('Transaction not created');
  });

  const failed = checks.filter((c) => !c.ok);
  console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
