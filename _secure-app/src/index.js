// TA Acquisition Finder: secure version for named council officers.
//
// Cloudflare Access sits in front of this Worker and signs each request with a JWT.
// The Worker checks that JWT, then checks the email against the named-officer list in D1.
// Listing data stays in D1: officers only ever receive derived, rounded results.

import { DEFAULT_ASSUMPTIONS, EDITABLE, cleanAssumptions, appraise, publicRow } from './appraise.js';
import { PAGE } from './page.js';

const PAGE_SIZE = 25;
const MAX_PAGES = 20;           // at most 500 homes per search
const SEARCHES_PER_MINUTE = 30;
const RATES_URL = 'https://gist.githubusercontent.com/nhaverly/2221652235336db07f5df927d45ffad5/raw/rates.json';

export default {
  async fetch(request, env, ctx) {
    try {
      return await handle(request, env, ctx);
    } catch (err) {
      console.error(err && err.stack || err);
      return json({ error: 'Something went wrong. Please try again.' }, 500);
    }
  },
};

async function handle(request, env, ctx) {
  const url = new URL(request.url);

  // Same-origin check for anything that changes data.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const origin = request.headers.get('Origin');
    if (origin && origin !== url.origin) return json({ error: 'Request refused.' }, 403);
    const ct = request.headers.get('Content-Type') || '';
    if (!ct.includes('application/json')) return json({ error: 'Request refused.' }, 415);
  }

  const who = await identify(request, env, url);
  if (who.error) {
    return url.pathname.startsWith('/api/') ? json({ error: who.error }, who.status) : message(who.error, who.status);
  }
  const user = await loadUser(env, who.email);
  if (!user) {
    await audit(env, who.email, null, 'refused', 'not on the named-officer list');
    const msg = 'Your email address (' + who.email + ') is not on the list of named officers for this service. Ask your council\'s administrator to add you.';
    return url.pathname.startsWith('/api/') ? json({ error: msg }, 403) : message(msg, 403);
  }
  if (user.role !== 'owner' && user.subscription_ends && user.subscription_ends < today()) {
    const msg = 'Your council\'s subscription ended on ' + user.subscription_ends + '. Contact your account manager to renew.';
    return url.pathname.startsWith('/api/') ? json({ error: msg }, 403) : message(msg, 403);
  }

  // The owner can work as any council, for demonstrations and support.
  let councilId = user.council_id;
  const asCouncil = url.searchParams.get('council');
  if (user.role === 'owner' && asCouncil) {
    const c = await env.DB.prepare('SELECT id FROM councils WHERE id = ?').bind(asCouncil).first();
    if (c) councilId = c.id;
  }

  const p = url.pathname;
  const m = request.method;

  if (m === 'GET' && (p === '/' || p === '/index.html')) return html(PAGE);
  if (m === 'GET' && p === '/api/me') return json(await me(env, user, councilId));
  if (m === 'POST' && p === '/api/terms') {
    await env.DB.prepare("UPDATE users SET terms_accepted_at = datetime('now') WHERE email = ?").bind(user.email).run();
    await audit(env, user.email, councilId, 'terms', 'accepted');
    return json({ ok: true });
  }

  // Everything below needs the terms of use accepted.
  if (!user.terms_accepted_at) return json({ error: 'Please accept the terms of use first.' }, 403);

  if (m === 'GET' && p === '/api/assumptions') {
    const a = await assumptionsFor(env, councilId);
    const rate = await pwlbRate(env, a);
    return json({ assumptions: a, defaults: DEFAULT_ASSUMPTIONS, editable: Object.keys(EDITABLE), rate, can_edit: canEdit(user) });
  }
  if (m === 'PUT' && p === '/api/assumptions') {
    if (!canEdit(user)) return json({ error: 'Only your council\'s administrator can change the assumptions.' }, 403);
    const body = await readJson(request);
    const { out, errors } = cleanAssumptions(body || {});
    if (errors.length) return json({ error: 'Some values are outside the allowed range: ' + errors.join(', ') + '.' }, 400);
    const current = await assumptionsFor(env, councilId);
    const merged = { ...current, ...out };
    await env.DB.prepare(
      "INSERT INTO assumptions (council_id, json, updated_by, updated_at) VALUES (?, ?, ?, datetime('now')) " +
      "ON CONFLICT(council_id) DO UPDATE SET json = excluded.json, updated_by = excluded.updated_by, updated_at = excluded.updated_at"
    ).bind(councilId, JSON.stringify(merged), user.email).run();
    await audit(env, user.email, councilId, 'assumptions', JSON.stringify(out));
    return json({ ok: true, assumptions: merged, rate: await pwlbRate(env, merged) });
  }
  if (m === 'POST' && p === '/api/assumptions/reset') {
    if (!canEdit(user)) return json({ error: 'Only your council\'s administrator can change the assumptions.' }, 403);
    await env.DB.prepare('DELETE FROM assumptions WHERE council_id = ?').bind(councilId).run();
    await audit(env, user.email, councilId, 'assumptions', 'reset to defaults');
    const a = await assumptionsFor(env, councilId);
    return json({ ok: true, assumptions: a, rate: await pwlbRate(env, a) });
  }

  if (m === 'POST' && p === '/api/areas') {
    const body = (await readJson(request)) || {};
    return json(await areaCounts(env, councilId, epcOf(body.epc)));
  }
  if (m === 'POST' && p === '/api/search') {
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM audit WHERE email = ? AND action = 'search' AND ts > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-60 seconds')"
    ).bind(user.email).first();
    if (recent && recent.n >= SEARCHES_PER_MINUTE) return json({ error: 'Too many searches in the last minute. Please wait a moment.' }, 429);
    const body = (await readJson(request)) || {};
    const res = await search(env, councilId, body);
    await audit(env, user.email, councilId, 'search',
      JSON.stringify({ areas: res.areas_searched, epc: epcOf(body.epc), page: res.page, rows: res.rows.length }));
    return json(res);
  }

  // Owner tools: councils, named officers and the audit log.
  if (p.startsWith('/api/admin')) {
    if (user.role !== 'owner') return json({ error: 'Not available.' }, 403);
    if (m === 'GET' && p === '/api/admin') {
      const councils = (await env.DB.prepare('SELECT * FROM councils ORDER BY name').all()).results;
      const users = (await env.DB.prepare('SELECT email, council_id, role, active, terms_accepted_at, added_at FROM users ORDER BY council_id, email').all()).results;
      const log = (await env.DB.prepare('SELECT * FROM audit ORDER BY ts DESC LIMIT 200').all()).results;
      return json({ councils, users, audit: log });
    }
    if (m === 'POST' && p === '/api/admin/councils') {
      const b = (await readJson(request)) || {};
      const id = String(b.id || '').trim().toLowerCase();
      const name = String(b.name || '').trim();
      const ends = b.subscription_ends ? String(b.subscription_ends) : null;
      if (!/^[a-z0-9-]{2,40}$/.test(id) || !name || (ends && !/^\d{4}-\d{2}-\d{2}$/.test(ends))) return json({ error: 'Give a short id (letters, numbers, hyphens), a name and an end date as YYYY-MM-DD.' }, 400);
      await env.DB.prepare('INSERT INTO councils (id, name, subscription_ends) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, subscription_ends = excluded.subscription_ends')
        .bind(id, name, ends).run();
      await audit(env, user.email, id, 'admin', 'council ' + id + ' saved');
      return json({ ok: true });
    }
    if (m === 'POST' && p === '/api/admin/users') {
      const b = (await readJson(request)) || {};
      const email = String(b.email || '').trim().toLowerCase();
      const role = ['officer', 'admin', 'owner'].includes(b.role) ? b.role : 'officer';
      const active = b.active === false ? 0 : 1;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'Enter a valid email address.' }, 400);
      const c = await env.DB.prepare('SELECT id FROM councils WHERE id = ?').bind(String(b.council_id || '')).first();
      if (!c) return json({ error: 'Choose a council.' }, 400);
      await env.DB.prepare('INSERT INTO users (email, council_id, role, active) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET council_id = excluded.council_id, role = excluded.role, active = excluded.active')
        .bind(email, c.id, role, active).run();
      await audit(env, user.email, c.id, 'admin', (active ? 'user saved: ' : 'user removed: ') + email + ' (' + role + ')');
      return json({ ok: true });
    }
  }

  return json({ error: 'Not found.' }, 404);
}

// ---------- Identity ----------

let JWKS_CACHE = { at: 0, keys: [] };

async function identify(request, env, url) {
  // Local development only: wrangler dev on localhost with LOCAL_DEV_EMAIL set.
  if (env.LOCAL_DEV_EMAIL && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
    return { email: env.LOCAL_DEV_EMAIL.toLowerCase() };
  }
  if (!env.TEAM_DOMAIN || !env.POLICY_AUD) {
    return { error: 'This service is not set up yet: Cloudflare Access settings are missing.', status: 503 };
  }
  const token = request.headers.get('Cf-Access-Jwt-Assertion') || cookie(request, 'CF_Authorization');
  if (!token) return { error: 'Please sign in.', status: 401 };
  try {
    const payload = await verifyAccessJwt(token, env);
    if (!payload.email) return { error: 'Your sign-in did not include an email address.', status: 403 };
    return { email: String(payload.email).toLowerCase() };
  } catch (e) {
    return { error: 'Your sign-in could not be verified. Please sign in again.', status: 401 };
  }
}

async function verifyAccessJwt(token, env) {
  const team = env.TEAM_DOMAIN.replace(/\/$/, '');
  const [h64, p64, s64] = token.split('.');
  if (!h64 || !p64 || !s64) throw new Error('malformed');
  const header = JSON.parse(b64urlText(h64));
  const payload = JSON.parse(b64urlText(p64));
  if (header.alg !== 'RS256') throw new Error('alg');
  const now = Math.floor(Date.now() / 1000);
  if (payload.iss !== team) throw new Error('iss');
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(env.POLICY_AUD)) throw new Error('aud');
  if (typeof payload.exp !== 'number' || payload.exp < now - 30) throw new Error('exp');
  if (typeof payload.nbf === 'number' && payload.nbf > now + 30) throw new Error('nbf');
  const key = await accessKey(team, header.kid);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlBytes(s64), new TextEncoder().encode(h64 + '.' + p64));
  if (!ok) throw new Error('signature');
  return payload;
}

async function accessKey(team, kid) {
  const fresh = Date.now() - JWKS_CACHE.at < 3600_000;
  let jwk = fresh && JWKS_CACHE.keys.find((k) => k.kid === kid);
  if (!jwk) {
    const r = await fetch(team + '/cdn-cgi/access/certs');
    if (!r.ok) throw new Error('certs');
    const j = await r.json();
    JWKS_CACHE = { at: Date.now(), keys: j.keys || [] };
    jwk = JWKS_CACHE.keys.find((k) => k.kid === kid);
  }
  if (!jwk) throw new Error('kid');
  return crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
}

function b64urlBytes(s) {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '='));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}
function b64urlText(s) { return new TextDecoder().decode(b64urlBytes(s)); }
function cookie(request, name) {
  const c = request.headers.get('Cookie') || '';
  const m = c.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? m[1] : null;
}

async function loadUser(env, email) {
  return env.DB.prepare(
    'SELECT u.email, u.council_id, u.role, u.terms_accepted_at, c.name AS council_name, c.subscription_ends ' +
    'FROM users u JOIN councils c ON c.id = u.council_id WHERE u.email = ? AND u.active = 1'
  ).bind(email).first();
}

const canEdit = (user) => user.role === 'admin' || user.role === 'owner';

async function me(env, user, councilId) {
  const c = await env.DB.prepare('SELECT id, name FROM councils WHERE id = ?').bind(councilId).first();
  const out = { email: user.email, role: user.role, council: c, terms_accepted: !!user.terms_accepted_at, can_edit: canEdit(user) };
  if (user.role === 'owner') out.councils = (await env.DB.prepare('SELECT id, name FROM councils ORDER BY name').all()).results;
  const s = await env.DB.prepare('SELECT COUNT(*) AS n, MAX(loaded_at) AS loaded, SUM(is_sample) AS samples FROM listings').first();
  out.listings = { count: s.n, loaded_at: s.loaded, sample: s.samples > 0 };
  return out;
}

// ---------- Assumptions and rates ----------

async function assumptionsFor(env, councilId) {
  const rows = (await env.DB.prepare("SELECT council_id, json FROM assumptions WHERE council_id IN ('_default', ?)").bind(councilId).all()).results;
  const d = rows.find((r) => r.council_id === '_default');
  const c = rows.find((r) => r.council_id === councilId);
  return { ...DEFAULT_ASSUMPTIONS, ...(d ? JSON.parse(d.json) : {}), ...(c ? JSON.parse(c.json) : {}) };
}

async function pwlbRate(env, a) {
  if (a.pwlb_mode === 'fixed') return { pct: a.pwlb_fixed_rate_pct, source: 'council', live: false };
  const fallback = { pct: Number(env.PWLB_FALLBACK_PCT || 6.38), as_of: env.PWLB_FALLBACK_AS_OF || '2026-10-30', source: 'fallback', live: false, term: a.pwlb_term_years };
  try {
    const r = await fetch(RATES_URL, { cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!r.ok) return fallback;
    const j = await r.json();
    const curve = Array.isArray(j.pwlbMaturityCurve) ? j.pwlbMaturityCurve : [];
    const pt = curve.reduce((best, x) => (!best || Math.abs(x.term - a.pwlb_term_years) < Math.abs(best.term - a.pwlb_term_years) ? x : best), null);
    const std = pt && Number(pt.rate);
    if (!(std > 0 && std < 0.2)) return fallback;
    return { pct: Math.round((std * 100 - a.pwlb_certainty_discount_pct) * 100) / 100, standard_pct: Math.round(std * 10000) / 100,
             as_of: j.asOf || null, source: 'dmo', live: true, term: pt.term };
  } catch (e) {
    return fallback;
  }
}

async function nightlyByArea(env) {
  const rows = (await env.DB.prepare('SELECT area, cost_per_night FROM nightly_costs').all()).results;
  return Object.fromEntries(rows.map((r) => [r.area, r.cost_per_night]));
}

// ---------- Search ----------

const epcOf = (v) => (['A', 'B', 'C', 'D', 'E', 'F'].includes(v) ? v : '');

async function areaCounts(env, councilId, epc) {
  const a = await assumptionsFor(env, councilId);
  const rate = await pwlbRate(env, a);
  const costs = await nightlyByArea(env);
  const rows = (await env.DB.prepare('SELECT * FROM listings').all()).results;
  const byArea = new Map();
  for (const l of rows) {
    if (!byArea.has(l.area)) byArea.set(l.area, { area: l.area, region: l.region, homes: 0 });
    if (epc && !(l.epc && l.epc <= epc)) continue;
    if (appraise(l, a, rate, costs).saving > a.min_annual_saving) byArea.get(l.area).homes++;
  }
  const order = { 'Inner London': 0, 'Outer London': 1, 'Outside London': 2 };
  return { areas: [...byArea.values()].sort((x, y) => (order[x.region] ?? 9) - (order[y.region] ?? 9) || x.area.localeCompare(y.area)) };
}

async function search(env, councilId, body) {
  const areas = Array.isArray(body.areas) ? body.areas.filter((x) => typeof x === 'string').slice(0, 400) : [];
  const epc = epcOf(body.epc);
  const page = Math.max(0, Math.min(MAX_PAGES - 1, Number.isInteger(body.page) ? body.page : 0));
  const includeNoSaving = body.include_no_saving === true;
  const a = await assumptionsFor(env, councilId);
  const rate = await pwlbRate(env, a);
  const empty = { rows: [], totals: { homes: 0, saving: 0, capital: 0, best: null }, page: 0, pages: 0, rate, areas_searched: areas.length };
  if (!areas.length) return empty;

  const costs = await nightlyByArea(env);
  const listings = (await env.DB.prepare(
    'SELECT * FROM listings WHERE area IN (SELECT value FROM json_each(?))'
  ).bind(JSON.stringify(areas)).all()).results.filter((l) => !epc || (l.epc && l.epc <= epc));

  const all = listings.map((l) => ({ l, res: appraise(l, a, rate, costs) })).sort((x, y) => y.res.saving - x.res.saving);
  const saving = all.filter((x) => x.res.saving > a.min_annual_saving);
  const shown = includeNoSaving ? all : saving;
  const pages = Math.min(MAX_PAGES, Math.ceil(shown.length / PAGE_SIZE));
  const slice = shown.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const rows = slice.map((x, i) => ({
    rank: x.res.saving > a.min_annual_saving ? page * PAGE_SIZE + i + 1 : null,
    ...publicRow(x.l, x.res),
  }));
  // Totals rounded so they can't be used to back out individual prices.
  const totalSaving = Math.round(saving.reduce((s, x) => s + x.res.saving, 0) / 1000) * 1000;
  const capital = Math.round(saving.reduce((s, x) => s + x.res.capital, 0) / 100000) * 100000;
  const best = saving.length ? Math.round(saving[0].res.saving / 100) * 100 : null;
  return { rows, totals: { homes: saving.length, saving: totalSaving, capital, best }, page, pages, rate, areas_searched: areas.length,
           capped: shown.length > MAX_PAGES * PAGE_SIZE };
}

// ---------- Helpers ----------

async function audit(env, email, councilId, action, detail) {
  try {
    await env.DB.prepare('INSERT INTO audit (email, council_id, action, detail) VALUES (?, ?, ?, ?)').bind(email, councilId, action, detail || null).run();
  } catch (e) { console.error('audit', e); }
}

async function readJson(request) {
  try { return await request.json(); } catch (e) { return null; }
}

const today = () => new Date().toISOString().slice(0, 10);

const SECURITY_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...SECURITY_HEADERS } });
}

function html(body, status = 200) {
  return new Response(body, { status, headers: {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    ...SECURITY_HEADERS } });
}

function message(text, status) {
  const esc = String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  return html(`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>TA Acquisition Finder</title>
<style>body{margin:0;font-family:Arial,"Helvetica Neue",sans-serif;background:#F5F6FA;color:#0B090A}header{background:#090F54;color:#fff;padding:20px 24px;font-family:Georgia,serif;font-size:22px}main{max-width:640px;margin:40px auto;padding:0 24px}p{line-height:1.5}a{color:#090F54}</style></head>
<body><header>TA Acquisition Finder</header><main><p>${esc}</p><p><a href="/cdn-cgi/access/logout">Sign out</a></p></main></body></html>`, status);
}
