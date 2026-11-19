// The single page officers use. All data arrives from the API; nothing sensitive is in this file.
export const PAGE = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>TA Acquisition Finder</title>
<style>
/* Layout: navy band with sign-in details and page tabs; one column of panels below. */
:root{
  --navy:#090F54; --cyan:#1DB6D0; --ink:#0B090A; --muted:#4A5070;
  --bg:#F5F6FA; --surface:#FFFFFF; --surface-2:#EEF0F6; --rule:rgb(9 15 84 / .16);
  --good:#1E7A4F; --warn:#9A5B00; --bad:#A3302B;
  --f-display:Georgia,"Times New Roman",serif; --f-body:Arial,"Helvetica Neue",sans-serif;
  color-scheme:light;
}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--ink)}
body{font-family:var(--f-body);font-size:15px;line-height:1.5;padding-bottom:env(safe-area-inset-bottom,0px)}
button,input,select{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}
[hidden]{display:none!important}
.wrap{max-width:1180px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
.band{background:var(--navy);color:#fff;padding-top:env(safe-area-inset-top,0px)}
.band .wrap{padding-block:18px 0;display:grid;gap:14px}
.top{display:flex;flex-wrap:wrap;gap:8px 20px;align-items:baseline;justify-content:space-between}
.title{font-family:var(--f-display);font-size:clamp(22px,3.4vw,30px);margin:0;font-weight:700}
.who{font-size:13px;color:#C9CEEC;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center}
.who a{color:#fff}
.who select{background:var(--navy);color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:3px;padding:3px 6px;font-size:13px}
.tabs{display:flex;flex-wrap:wrap;gap:2px}
.tabs button{background:transparent;border:0;border-bottom:3px solid transparent;color:#C9CEEC;padding:10px 14px;cursor:pointer;font-size:14px}
.tabs button[aria-current="page"]{color:#fff;border-bottom-color:var(--cyan);font-weight:600}
main .wrap{padding-block:24px 48px;display:grid;gap:20px}
.view{display:grid;gap:18px}
h2{font-family:var(--f-display);font-size:24px;margin:0}
h3{font-size:16px;margin:0}
.note{margin:0;font-size:13px;color:var(--muted);max-width:85ch}
.panel{background:var(--surface);border:1px solid var(--rule);padding:20px;display:grid;gap:14px;min-width:0}
.panel-head{display:flex;flex-wrap:wrap;gap:8px 20px;align-items:baseline;justify-content:space-between}
.banner{margin:0;padding:10px 14px;border-left:4px solid var(--cyan);background:#E8F7FA;font-size:14px}
.banner.warn{border-left-color:var(--warn);background:#FBF1E0}
.lnk{background:none;border:0;padding:0;color:var(--navy);text-decoration:underline;text-underline-offset:3px;cursor:pointer;font-size:13px}
.lnks{display:flex;flex-wrap:wrap;gap:14px}
.row{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center}
.field{display:grid;gap:4px;min-width:0}
.field label{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.field input,.field select{padding:8px 10px;border:1px solid var(--rule);border-radius:3px;background:var(--surface);min-width:0;width:100%}
.field .hint{font-size:12px;color:var(--muted)}
.pick{display:grid;gap:16px;max-height:26rem;overflow:auto;padding-right:4px}
.grp{display:grid;gap:8px}
.grp-head{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:baseline}
.grp-head strong{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--navy)}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{font-size:13px;padding:5px 11px;border:1px solid var(--rule);border-radius:3px;background:var(--surface);cursor:pointer;display:inline-flex;gap:7px;align-items:baseline}
.chip:hover{border-color:var(--navy)}
.chip[aria-pressed="true"]{background:var(--navy);border-color:var(--navy);color:#fff}
.chip .c{font-variant-numeric:tabular-nums;opacity:.75}
.go{display:flex;flex-wrap:wrap;gap:14px 24px;align-items:center;justify-content:space-between;background:var(--navy);color:#fff;padding:20px 24px}
.go p{margin:0;font-size:16px}
.go b{color:var(--cyan);font-variant-numeric:tabular-nums}
.primary{font-weight:700;padding:11px 20px;border-radius:3px;border:0;background:var(--cyan);color:var(--navy);cursor:pointer}
.secondary{font-size:14px;padding:8px 14px;border-radius:3px;border:1px solid var(--navy);background:var(--surface);color:var(--navy);cursor:pointer}
.secondary:disabled,.primary:disabled{opacity:.5;cursor:default}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr));gap:14px}
.tile{background:var(--surface);border:1px solid var(--rule);border-top:4px solid var(--navy);padding:16px;display:grid;gap:4px;align-content:start}
.tile .k{margin:0;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.tile .v{margin:0;font-family:var(--f-display);font-size:28px;line-height:1.1;color:var(--navy);font-variant-numeric:tabular-nums}
.tile .s{margin:0;font-size:12.5px;color:var(--muted)}
.tablebox{overflow:auto;border:1px solid var(--rule)}
table{width:100%;border-collapse:collapse;font-size:13.5px;font-variant-numeric:tabular-nums}
th{position:sticky;top:0;background:var(--navy);color:#fff;text-align:left;font-weight:600;padding:9px 10px;white-space:nowrap}
td{padding:8px 10px;border-bottom:1px solid var(--rule);vertical-align:top;background:var(--surface)}
th.n,td.n{text-align:right}
td.save{font-weight:700;color:var(--navy)}
tr.miss td{color:var(--muted)}
.tag{display:inline-block;font-size:11px;font-weight:700;padding:1px 6px;border-radius:3px;background:#E3F3EA;color:var(--good);margin-left:6px}
.sub{display:block;font-size:12px;color:var(--muted)}
.why{display:block;font-size:12px;color:var(--warn)}
@media (max-width:820px){.opt{display:none}}
.form{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr));gap:14px 20px}
.rate{font-size:14px;margin:0}
.rate b{font-variant-numeric:tabular-nums}
.toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(20px + env(safe-area-inset-bottom,0px));background:var(--ink);color:#fff;padding:10px 16px;border-radius:3px;font-size:14px;z-index:30}
.err{color:var(--bad);font-size:14px;margin:0}
dl.vals{margin:0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 16px;font-size:14px}
dl.vals dt{color:var(--muted)} dl.vals dd{margin:0;text-align:right;font-weight:600;font-variant-numeric:tabular-nums}
.method{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr));gap:16px}
.method p{margin:0;font-size:14px}
footer{border-top:1px solid var(--rule)}
footer .wrap{padding-block:16px 28px;font-size:12.5px;color:var(--muted);display:grid;gap:4px}
footer p{margin:0}
.gate{max-width:680px}
.gate ul{margin:0;padding-left:20px;display:grid;gap:6px}
</style>
</head>
<body>
<header class="band">
  <div class="wrap">
    <div class="top">
      <h1 class="title">TA Acquisition Finder</h1>
      <div class="who"><span id="who-email"></span><span id="who-council"></span><label id="as-wrap" hidden>Working as <select id="as-council"></select></label><a href="/cdn-cgi/access/logout">Sign out</a></div>
    </div>
    <nav class="tabs" id="tabs" aria-label="Pages" hidden>
      <button type="button" data-view="search">1. Search</button>
      <button type="button" data-view="results">2. Results</button>
      <button type="button" data-view="assumptions">Our assumptions</button>
      <button type="button" data-view="method">How it works</button>
      <button type="button" data-view="admin" id="tab-admin" hidden>Admin</button>
    </nav>
  </div>
</header>

<main><div class="wrap">
  <p class="err" id="fatal" hidden></p>

  <section class="view gate panel" id="gate" hidden aria-labelledby="h-gate">
    <h2 id="h-gate">Terms of use</h2>
    <p class="note">Before you start, please confirm that you will use the finder in line with the data licence.</p>
    <ul>
      <li>Listing information is provided under licence for your council's own use in finding homes to buy.</li>
      <li>You will not copy, export, scrape or share listing information outside your council.</li>
      <li>Your use is recorded, including the searches you run and changes to your council's assumptions.</li>
      <li>Results are screening estimates, not a financial appraisal or advice.</li>
    </ul>
    <div><button type="button" class="primary" id="accept">I agree</button></div>
  </section>

  <section class="view" id="search" hidden aria-labelledby="h-search">
    <h2 id="h-search">Set up your search</h2>
    <p class="banner warn" id="sample-banner" hidden>Demonstration data. These are sample listings at real postcodes, not homes currently for sale, so they have no listing links. LHA rates, nightly costs and the PWLB rate are real.</p>
    <div class="panel">
      <div class="panel-head">
        <div><h3>1. Areas to search</h3><p class="note">The number on each area is how many homes there would create a saving, using your council's assumptions.</p></div>
        <div class="lnks"><button type="button" class="lnk" id="pick-all">Select every area</button><button type="button" class="lnk" id="pick-none">Clear all</button></div>
      </div>
      <div class="row">
        <div class="field" style="flex:0 1 18rem"><label for="area-q">Find an area</label><input type="search" id="area-q" autocomplete="off"></div>
        <p class="note" id="sel-count"></p>
      </div>
      <div class="pick" id="picker"><p class="note">Loading areas…</p></div>
    </div>
    <div class="panel">
      <h3>2. Energy rating</h3>
      <p class="note">Leave out homes below this EPC rating. Homes rated D or E may need works to reach C.</p>
      <div class="field" style="max-width:18rem"><label for="epc-min">Minimum EPC rating</label>
        <select id="epc-min"><option value="">Any rating</option><option value="B">B or better</option><option value="C">C or better</option><option value="D">D or better</option><option value="E">E or better</option></select></div>
    </div>
    <div class="go">
      <p><b id="go-n">0</b> homes in your search would create a saving.</p>
      <button type="button" class="primary" id="run">See the results</button>
    </div>
  </section>

  <section class="view" id="results" hidden aria-labelledby="h-results">
    <div class="panel-head">
      <div><h2 id="h-results">Results</h2><p class="note" id="crit"></p><p class="note" id="rate-line"></p></div>
      <button type="button" class="secondary" data-go="search">Change search</button>
    </div>
    <p class="note" id="no-search">Choose your areas on the search page, then select See the results.</p>
    <div class="tiles" id="tiles" hidden>
      <div class="tile"><p class="k">Homes that create a saving</p><p class="v" id="k-n">0</p><p class="s">Any price, any size</p></div>
      <div class="tile"><p class="k">Combined saving a year</p><p class="v" id="k-s">£0</p><p class="s">If all were bought, to the nearest £1,000</p></div>
      <div class="tile"><p class="k">Capital required</p><p class="v" id="k-c">£0</p><p class="s">Price, purchase costs and works</p></div>
      <div class="tile"><p class="k">Best single home</p><p class="v" id="k-b">—</p><p class="s">Net saving a year</p></div>
    </div>
    <div class="panel" id="table-panel" hidden>
      <div class="panel-head">
        <div><h3>Ranked by net annual saving</h3><p class="note">Net cost of owning is borrowing costs and MRP plus management and maintenance, less rent. The nightly-paid equivalent is a year of the placement the home replaces, less Housing Benefit subsidy. The saving is the difference. Figures are rounded to the nearest £100.</p></div>
        <label class="note"><input type="checkbox" id="show-miss"> Show homes with no saving</label>
      </div>
      <div class="tablebox">
        <table>
          <thead><tr>
            <th class="n">#</th><th>Home</th><th>Area</th><th>Price band</th><th>EPC</th>
            <th class="n opt">TA /night</th><th class="n">Net cost of owning /yr</th><th class="n">Nightly-paid equivalent /yr</th>
            <th class="n">Saving /yr</th><th class="n opt">Break-even /night</th><th>Listing</th>
          </tr></thead>
          <tbody id="rows"></tbody>
        </table>
      </div>
      <div class="row"><button type="button" class="secondary" id="more" hidden>Show more homes</button><p class="note" id="page-note"></p></div>
    </div>
  </section>

  <section class="view" id="assumptions" hidden aria-labelledby="h-ass">
    <div class="panel-head">
      <div><h2 id="h-ass">Our assumptions</h2><p class="note" id="ass-note"></p></div>
    </div>
    <div class="panel">
      <h3>Borrowing</h3>
      <p class="rate" id="rate-box"></p>
      <div class="form">
        <div class="field"><label for="a-pwlb_mode">Borrowing rate</label><select id="a-pwlb_mode"><option value="live">PWLB certainty rate, updated daily</option><option value="fixed">Our own rate</option></select></div>
        <div class="field"><label for="a-pwlb_term_years">PWLB loan term (years)</label><input id="a-pwlb_term_years" type="number" min="5" max="50" step="1"><span class="hint">Maturity loan. The rate for the nearest published term is used.</span></div>
        <div class="field"><label for="a-pwlb_fixed_rate_pct">Our own borrowing rate (%)</label><input id="a-pwlb_fixed_rate_pct" type="number" min="0" max="15" step="0.01"><span class="hint">Used when the borrowing rate is set to our own rate.</span></div>
        <div class="field"><label for="a-mrp_pct">Minimum revenue provision (% of capital a year)</label><input id="a-mrp_pct" type="number" min="0" max="10" step="0.1"></div>
      </div>
    </div>
    <div class="panel">
      <h3>Buying and running the home</h3>
      <div class="form">
        <div class="field"><label for="a-purchase_costs_pct">Purchase costs (% of price)</label><input id="a-purchase_costs_pct" type="number" min="0" max="20" step="0.5"><span class="hint">Stamp duty, legal fees and surveys.</span></div>
        <div class="field"><label for="a-mm_pct_of_lha_rent">Management and maintenance (% of rent)</label><input id="a-mm_pct_of_lha_rent" type="number" min="0" max="100" step="1"></div>
        <div class="field"><label for="a-rent_loss_pct">Rent loss and voids (%)</label><input id="a-rent_loss_pct" type="number" min="0" max="50" step="0.5"></div>
      </div>
    </div>
    <div class="panel">
      <h3>The placement it replaces</h3>
      <div class="form">
        <div class="field"><label for="a-nightly_mode">Nightly-paid cost</label><select id="a-nightly_mode"><option value="area">Average for the area the home is in</option><option value="own">Our own nightly cost</option></select></div>
        <div class="field"><label for="a-nightly_own_rate">Our own nightly cost (£ per household per night)</label><input id="a-nightly_own_rate" type="number" min="0" max="1000" step="1"></div>
        <div class="field"><label for="a-nightly_cost_outside_london">Nightly cost outside London (£)</label><input id="a-nightly_cost_outside_london" type="number" min="0" max="1000" step="1"><span class="hint">Used for areas with no published average.</span></div>
        <div class="field"><label for="a-subsidy_pct_of_2011_lha">Housing Benefit subsidy (% of January 2011 LHA)</label><input id="a-subsidy_pct_of_2011_lha" type="number" min="0" max="100" step="1"><span class="hint">Capped at £500 a week in central and inner London and Outer South West London, and £375 elsewhere.</span></div>
        <div class="field"><label for="a-min_annual_saving">Show homes saving more than (£ a year)</label><input id="a-min_annual_saving" type="number" min="0" step="500"></div>
      </div>
    </div>
    <div class="row">
      <button type="button" class="primary" id="ass-save">Save our assumptions</button>
      <button type="button" class="secondary" id="ass-reset">Reset to defaults</button>
      <p class="err" id="ass-err" hidden></p>
    </div>
  </section>

  <section class="view" id="method" hidden aria-labelledby="h-method">
    <h2 id="h-method">How the saving is worked out</h2>
    <div class="method">
      <div class="panel"><h3>Owning the home</h3>
        <p>The council borrows the full cost of buying the home, including purchase costs and any works, and sets aside minimum revenue provision each year. It lets the home at the current Local Housing Allowance rate for its postcode and size, and pays management and maintenance as a share of that rent.</p>
        <dl class="vals" id="m-own"></dl></div>
      <div class="panel"><h3>The placement it replaces</h3>
        <p>The avoided cost is a year of nightly-paid self-contained accommodation, less Housing Benefit subsidy at a share of the January 2011 LHA rate for the home's size and area.</p>
        <dl class="vals" id="m-ta"></dl></div>
      <div class="panel"><h3>What you see</h3>
        <p>Each home shows its area, postcode district, size, price band and EPC rating, with the link to the full listing. Savings and costs are rounded to the nearest £100. Full details are on the listing itself.</p>
        <p>These are screening figures. A full appraisal adds HRA or General Fund treatment, repairs and void profiles, rent growth against a frozen LHA and a sensitivity range on the nightly cost.</p></div>
    </div>
    <div class="panel"><h3>Where the data comes from</h3>
      <p class="note">Listings: licensed listing data, refreshed weekly. LHA rates: the Valuation Office Agency's current and January 2011 weekly rates for each postcode. PWLB: the DMO's published standard rate, refreshed each working day, less the 0.20% certainty discount. Nightly costs: each London borough's 2024-25 revenue outturn (RO4) spend on nightly-paid self-contained accommodation divided by its average households in that category (TA1), as compiled by the London TA Atlas; boroughs whose returns can't isolate nightly-paid costs use the London average. Contains public sector information licensed under the Open Government Licence v3.0.</p></div>
  </section>

  <section class="view" id="admin" hidden aria-labelledby="h-admin">
    <h2 id="h-admin">Admin</h2>
    <div class="panel">
      <h3>Add or update a named officer</h3>
      <div class="form">
        <div class="field"><label for="u-email">Email</label><input id="u-email" type="email" autocomplete="off"></div>
        <div class="field"><label for="u-council">Council</label><select id="u-council"></select></div>
        <div class="field"><label for="u-role">Role</label><select id="u-role"><option value="officer">Officer</option><option value="admin">Council admin (can change assumptions)</option></select></div>
      </div>
      <div class="row"><button type="button" class="primary" id="u-save">Save officer</button><p class="err" id="u-err" hidden></p></div>
    </div>
    <div class="panel">
      <h3>Named officers</h3>
      <div class="tablebox"><table><thead><tr><th>Email</th><th>Council</th><th>Role</th><th>Terms accepted</th><th></th></tr></thead><tbody id="u-rows"></tbody></table></div>
    </div>
    <div class="panel">
      <h3>Add or update a council</h3>
      <div class="form">
        <div class="field"><label for="c-id">Short id</label><input id="c-id" placeholder="e.g. westminster" autocomplete="off"></div>
        <div class="field"><label for="c-name">Name</label><input id="c-name" autocomplete="off"></div>
        <div class="field"><label for="c-ends">Subscription ends</label><input id="c-ends" type="date"></div>
      </div>
      <div class="row"><button type="button" class="primary" id="c-save">Save council</button><p class="err" id="c-err" hidden></p></div>
    </div>
    <div class="panel">
      <h3>Recent activity</h3>
      <div class="tablebox" style="max-height:28rem"><table><thead><tr><th>When (UTC)</th><th>Who</th><th>Council</th><th>Action</th><th>Detail</th></tr></thead><tbody id="log-rows"></tbody></table></div>
    </div>
  </section>
</div></main>

<footer><div class="wrap">
  <p>Listing information is licensed for your council's own use. Do not copy or share it outside your council.</p>
  <p id="data-line"></p>
</div></footer>
<div class="toast" id="toast" hidden></div>

<script>
(function () {
  const $ = (id) => document.getElementById(id);
  const el = (tag, props, ...kids) => { const e = document.createElement(tag); if (props) for (const [k, v] of Object.entries(props)) { if (k === 'class') e.className = v; else if (k in e) e[k] = v; else e.setAttribute(k, v); } kids.forEach((c) => e.append(c)); return e; };
  const gbp = (v) => (v < 0 ? '−£' : '£') + Math.round(Math.abs(v)).toLocaleString('en-GB');
  const gbpm = (v) => '£' + (v / 1e6).toFixed(1) + 'm';
  const fmtDate = (iso) => { if (!iso) return ''; const d = new Date(iso.length === 10 ? iso + 'T12:00:00Z' : iso.replace(' ', 'T') + (iso.endsWith('Z') ? '' : 'Z')); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); };
  let tt; const toast = (t) => { const e = $('toast'); e.textContent = t; e.hidden = false; clearTimeout(tt); tt = setTimeout(() => e.hidden = true, 2600); };

  const S = { me: null, council: null, areas: [], chosen: null, epc: '', q: '', page: 0, pages: 0, rows: [], misses: false, ass: null, rate: null, searched: false };

  async function api(path, opts = {}) {
    const u = new URL(path, location.origin);
    if (S.me && S.me.role === 'owner' && S.council) u.searchParams.set('council', S.council);
    const r = await fetch(u, { method: opts.method || 'GET', headers: opts.body ? { 'Content-Type': 'application/json' } : {}, body: opts.body ? JSON.stringify(opts.body) : undefined, credentials: 'same-origin' });
    let j = null; try { j = await r.json(); } catch (e) {}
    if (!r.ok) throw new Error((j && j.error) || 'Something went wrong. Please try again.');
    return j;
  }
  const fail = (e) => { $('fatal').textContent = e.message; $('fatal').hidden = false; };

  // ---------- Pages ----------
  const VIEWS = ['search', 'results', 'assumptions', 'method', 'admin'];
  function show(v) {
    if (!VIEWS.includes(v) || (v === 'admin' && S.me.role !== 'owner')) v = 'search';
    VIEWS.forEach((x) => $(x).hidden = x !== v);
    document.querySelectorAll('#tabs [data-view]').forEach((b) => b.dataset.view === v ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
    if (v === 'admin') loadAdmin().catch(fail);
    window.scrollTo({ top: 0 });
  }
  document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => show(b.dataset.view)));
  document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => show(b.dataset.go)));

  // ---------- Choice of areas, remembered per council in this browser ----------
  const key = () => 'taf-areas-' + (S.council || '');
  function loadChosen() {
    try { const s = JSON.parse(localStorage.getItem(key()) || 'null'); if (Array.isArray(s)) return new Set(s); } catch (e) {}
    return null;
  }
  function saveChosen() { try { localStorage.setItem(key(), JSON.stringify([...S.chosen])); } catch (e) {} }

  function renderPicker() {
    const box = $('picker'); box.replaceChildren();
    const regions = [...new Set(S.areas.map((a) => a.region))];
    let shown = 0;
    regions.forEach((region) => {
      const areas = S.areas.filter((a) => a.region === region);
      const list = areas.filter((a) => !S.q || a.area.toLowerCase().includes(S.q));
      if (!list.length) return;
      shown += list.length;
      const names = areas.map((a) => a.area);
      const on = names.filter((n) => S.chosen.has(n)).length;
      const all = el('button', { type: 'button', class: 'lnk', textContent: 'Select all' });
      all.onclick = () => { names.forEach((n) => S.chosen.add(n)); changed(); };
      const none = el('button', { type: 'button', class: 'lnk', textContent: 'Clear' });
      none.onclick = () => { names.forEach((n) => S.chosen.delete(n)); changed(); };
      const chips = el('div', { class: 'chips' });
      list.forEach((a) => {
        const b = el('button', { type: 'button', class: 'chip' }, el('span', { textContent: a.area }), el('span', { class: 'c', textContent: String(a.homes) }));
        b.setAttribute('aria-pressed', String(S.chosen.has(a.area)));
        b.onclick = () => { S.chosen.has(a.area) ? S.chosen.delete(a.area) : S.chosen.add(a.area); changed(); };
        chips.append(b);
      });
      box.append(el('div', { class: 'grp' }, el('div', { class: 'grp-head' }, el('strong', { textContent: region }), el('span', { class: 'note', textContent: on + ' of ' + areas.length + ' chosen' }), all, none), chips));
    });
    if (!shown) box.append(el('p', { class: 'note', textContent: S.areas.length ? 'No area matches that search.' : 'No listings loaded yet.' }));
    const n = S.chosen.size, t = S.areas.length;
    $('sel-count').textContent = n === t ? 'All ' + t + ' areas chosen' : n === 0 ? 'No areas chosen' : n + ' of ' + t + ' areas chosen';
    $('go-n').textContent = S.areas.filter((a) => S.chosen.has(a.area)).reduce((s, a) => s + a.homes, 0).toLocaleString('en-GB');
    $('run').disabled = n === 0;
  }
  function changed() { saveChosen(); S.searched = false; renderPicker(); }

  async function loadAreas() {
    const r = await api('/api/areas', { method: 'POST', body: { epc: S.epc } });
    S.areas = r.areas;
    if (!S.chosen) S.chosen = loadChosen() || new Set(S.areas.map((a) => a.area));
    S.chosen = new Set([...S.chosen].filter((n) => S.areas.some((a) => a.area === n)));
    renderPicker();
  }

  $('pick-all').onclick = () => { S.areas.forEach((a) => S.chosen.add(a.area)); changed(); };
  $('pick-none').onclick = () => { S.chosen.clear(); changed(); };
  $('area-q').addEventListener('input', (e) => { S.q = e.target.value.trim().toLowerCase(); renderPicker(); });
  $('epc-min').addEventListener('change', (e) => { S.epc = e.target.value; S.searched = false; loadAreas().catch(fail); });

  // ---------- Results ----------
  function rateText(rate) {
    if (!rate) return '';
    if (rate.source === 'council') return 'Borrowing: your council\\'s own rate of ' + rate.pct.toFixed(2) + '%';
    const when = rate.as_of ? fmtDate(rate.as_of) : '';
    return 'Borrowing: PWLB certainty rate ' + rate.pct.toFixed(2) + '% (' + rate.term + '-year maturity, DMO rates of ' + when + ')' + (rate.live ? '' : ', the latest rate could not be loaded');
  }
  async function runSearch(page) {
    const r = await api('/api/search', { method: 'POST', body: { areas: [...S.chosen], epc: S.epc, page, include_no_saving: S.misses } });
    S.page = r.page; S.pages = r.pages; S.searched = true; S.rate = r.rate;
    S.rows = page === 0 ? r.rows : S.rows.concat(r.rows);
    const n = S.chosen.size, t = S.areas.length;
    $('crit').textContent = (n === t ? 'All ' + t + ' areas' : n + ' of ' + t + ' areas') + ' · ' + (S.epc ? 'EPC ' + S.epc + ' or better' : 'Any EPC rating') + ' · Any price and size';
    $('rate-line').textContent = rateText(r.rate) + ', plus MRP at ' + S.ass.mrp_pct + '% a year.';
    $('no-search').hidden = true; $('tiles').hidden = false; $('table-panel').hidden = false;
    $('k-n').textContent = r.totals.homes.toLocaleString('en-GB');
    $('k-s').textContent = gbp(r.totals.saving);
    $('k-c').textContent = gbpm(r.totals.capital);
    $('k-b').textContent = r.totals.best == null ? '—' : gbp(r.totals.best);
    renderRows();
    $('more').hidden = S.page + 1 >= S.pages;
    $('page-note').textContent = S.rows.length ? 'Showing ' + S.rows.length + ' homes' + (r.capped && S.page + 1 >= S.pages ? '. Narrow your search to see more.' : '.') : '';
  }
  function renderRows() {
    const tb = $('rows'); tb.replaceChildren();
    if (!S.rows.length) { tb.append(el('tr', {}, el('td', { colSpan: 11, class: 'note', textContent: 'No homes in the chosen areas create a saving.' }))); return; }
    S.rows.forEach((x) => {
      const home = el('td', {}, x.property); if (x.new) home.append(el('span', { class: 'tag', textContent: 'New' }));
      if (x.rank == null) home.append(el('span', { class: 'why', textContent: 'Costs more than nightly-paid accommodation' }));
      const area = el('td', {}, x.area, el('span', { class: 'sub', textContent: x.district }));
      const night = el('td', { class: 'n opt', textContent: gbp(x.nightly) });
      if (x.nightly_basis !== 'area') night.append(el('span', { class: 'sub', textContent: x.nightly_basis === 'own' ? 'your rate' : 'assumed' }));
      const link = el('td', {});
      if (x.link && /^https:\\/\\/(www\\.)?rightmove\\.co\\.uk\\//.test(x.link)) link.append(el('a', { href: x.link, target: '_blank', rel: 'noopener noreferrer', textContent: 'View on Rightmove' }));
      else link.append(el('span', { class: 'sub', textContent: x.sample ? 'Sample, no link' : '—' }));
      tb.append(el('tr', { class: x.rank == null ? 'miss' : '' },
        el('td', { class: 'n', textContent: x.rank == null ? '–' : String(x.rank) }), home, area,
        el('td', { textContent: x.price_band }), el('td', { textContent: x.epc || '–' }), night,
        el('td', { class: 'n', textContent: gbp(x.own_net) }), el('td', { class: 'n', textContent: gbp(x.ta_net) }),
        el('td', { class: 'n save', textContent: gbp(x.saving) }), el('td', { class: 'n opt', textContent: gbp(x.breakeven) }), link));
    });
  }
  $('run').onclick = () => { show('results'); runSearch(0).catch(fail); };
  $('more').onclick = () => runSearch(S.page + 1).catch(fail);
  $('show-miss').addEventListener('change', (e) => { S.misses = e.target.checked; if (S.searched) runSearch(0).catch(fail); });

  // ---------- Assumptions ----------
  const FIELDS = ['pwlb_mode', 'pwlb_term_years', 'pwlb_fixed_rate_pct', 'mrp_pct', 'purchase_costs_pct', 'mm_pct_of_lha_rent', 'rent_loss_pct', 'nightly_mode', 'nightly_own_rate', 'nightly_cost_outside_london', 'subsidy_pct_of_2011_lha', 'min_annual_saving'];
  function renderAss() {
    const a = S.ass;
    FIELDS.forEach((k) => { const f = $('a-' + k); f.value = a[k]; f.disabled = !S.me.can_edit; });
    $('a-pwlb_fixed_rate_pct').disabled = !S.me.can_edit || a.pwlb_mode !== 'fixed';
    $('a-pwlb_term_years').disabled = !S.me.can_edit || a.pwlb_mode !== 'live';
    $('a-nightly_own_rate').disabled = !S.me.can_edit || a.nightly_mode !== 'own';
    $('ass-save').hidden = $('ass-reset').hidden = !S.me.can_edit;
    $('ass-note').textContent = S.me.can_edit ? 'These apply to everyone at ' + (S.me.council && S.me.council.name) + '. Changes are recorded.' : 'Set by your council\\'s administrator. Ask them if a figure should change.';
    $('rate-box').textContent = rateText(S.rate) + '.';
    const r = (k, v) => [el('dt', { textContent: k }), el('dd', { textContent: v })];
    $('m-own').replaceChildren(...[
      ...r('Borrowing rate', S.rate ? S.rate.pct.toFixed(2) + '%' : '—'), ...r('Minimum revenue provision', a.mrp_pct + '% a year'),
      ...r('Purchase costs', a.purchase_costs_pct + '% of price'), ...r('Management and maintenance', a.mm_pct_of_lha_rent + '% of rent'), ...r('Rent loss and voids', a.rent_loss_pct + '%')].flat());
    $('m-ta').replaceChildren(...[
      ...r('Nightly-paid cost', a.nightly_mode === 'own' ? gbp(a.nightly_own_rate) + ' a night (your rate)' : 'Average for the area'),
      ...r('Outside London (assumed)', gbp(a.nightly_cost_outside_london) + ' a night'), ...r('Housing Benefit subsidy', a.subsidy_pct_of_2011_lha + '% of January 2011 LHA'),
      ...r('Weekly subsidy cap', '£500 central, inner and Outer South West London; £375 elsewhere')].flat());
  }
  async function loadAss() { const r = await api('/api/assumptions'); S.ass = r.assumptions; S.rate = r.rate; renderAss(); }
  ['pwlb_mode', 'nightly_mode'].forEach((k) => $('a-' + k).addEventListener('change', (e) => { S.ass[k] = e.target.value; renderAss(); }));
  $('ass-save').onclick = async () => {
    const body = {}; FIELDS.forEach((k) => { const v = $('a-' + k).value; body[k] = (k.endsWith('_mode')) ? v : Number(v); });
    try { const r = await api('/api/assumptions', { method: 'PUT', body }); S.ass = r.assumptions; S.rate = r.rate; $('ass-err').hidden = true; renderAss(); toast('Assumptions saved'); await afterAssChange(); }
    catch (e) { $('ass-err').textContent = e.message; $('ass-err').hidden = false; }
  };
  $('ass-reset').onclick = async () => {
    try { const r = await api('/api/assumptions/reset', { method: 'POST', body: {} }); S.ass = r.assumptions; S.rate = r.rate; renderAss(); toast('Assumptions reset to defaults'); await afterAssChange(); }
    catch (e) { $('ass-err').textContent = e.message; $('ass-err').hidden = false; }
  };
  async function afterAssChange() { await loadAreas(); if (S.searched) await runSearch(0); }

  // ---------- Admin (owner only) ----------
  async function loadAdmin() {
    const r = await api('/api/admin');
    $('u-council').replaceChildren(...r.councils.map((c) => el('option', { value: c.id, textContent: c.name })));
    const names = Object.fromEntries(r.councils.map((c) => [c.id, c.name]));
    $('u-rows').replaceChildren(...r.users.filter((u) => u.active).map((u) => {
      const rm = el('button', { type: 'button', class: 'lnk', textContent: 'Remove' });
      rm.onclick = async () => { await api('/api/admin/users', { method: 'POST', body: { email: u.email, council_id: u.council_id, role: u.role, active: false } }); toast('Removed ' + u.email); loadAdmin().catch(fail); };
      return el('tr', {}, el('td', { textContent: u.email }), el('td', { textContent: names[u.council_id] || u.council_id }), el('td', { textContent: u.role }),
        el('td', { textContent: u.terms_accepted_at ? fmtDate(u.terms_accepted_at) : 'Not yet' }), el('td', {}, u.role === 'owner' ? '' : rm));
    }));
    $('log-rows').replaceChildren(...r.audit.map((x) => el('tr', {}, el('td', { textContent: x.ts.replace('T', ' ').slice(0, 19) }), el('td', { textContent: x.email }),
      el('td', { textContent: x.council_id || '' }), el('td', { textContent: x.action }), el('td', { textContent: (x.detail || '').slice(0, 160) }))));
  }
  $('u-save').onclick = async () => {
    try { await api('/api/admin/users', { method: 'POST', body: { email: $('u-email').value, council_id: $('u-council').value, role: $('u-role').value } }); $('u-err').hidden = true; $('u-email').value = ''; toast('Officer saved'); loadAdmin().catch(fail); }
    catch (e) { $('u-err').textContent = e.message; $('u-err').hidden = false; }
  };
  $('c-save').onclick = async () => {
    try { await api('/api/admin/councils', { method: 'POST', body: { id: $('c-id').value, name: $('c-name').value, subscription_ends: $('c-ends').value || null } }); $('c-err').hidden = true; toast('Council saved'); await refreshMe(); loadAdmin().catch(fail); }
    catch (e) { $('c-err').textContent = e.message; $('c-err').hidden = false; }
  };

  // ---------- Start ----------
  async function refreshMe() {
    S.me = await api('/api/me');
    if (!S.council) S.council = S.me.council && S.me.council.id;
    $('who-email').textContent = S.me.email;
    $('who-council').textContent = S.me.role === 'owner' ? '' : (S.me.council ? S.me.council.name : '');
    if (S.me.role === 'owner' && S.me.councils) {
      $('as-wrap').hidden = false;
      $('as-council').replaceChildren(...S.me.councils.map((c) => el('option', { value: c.id, textContent: c.name })));
      $('as-council').value = S.council;
      $('tab-admin').hidden = false;
    }
    $('sample-banner').hidden = !(S.me.listings && S.me.listings.sample);
    $('data-line').textContent = S.me.listings && S.me.listings.count ? S.me.listings.count.toLocaleString('en-GB') + ' listings, last loaded ' + fmtDate(S.me.listings.loaded_at) + '.' : '';
  }
  $('as-council').addEventListener('change', async (e) => {
    S.council = e.target.value; S.chosen = null; S.searched = false; S.rows = [];
    $('no-search').hidden = false; $('tiles').hidden = true; $('table-panel').hidden = true;
    try { await refreshMe(); await loadAss(); await loadAreas(); show('search'); } catch (err) { fail(err); }
  });
  async function enter() {
    $('gate').hidden = true; $('tabs').hidden = false;
    await loadAss(); await loadAreas(); show('search');
  }
  $('accept').onclick = async () => { try { await api('/api/terms', { method: 'POST', body: {} }); await refreshMe(); await enter(); } catch (e) { fail(e); } };
  (async () => {
    try {
      await refreshMe();
      if (!S.me.terms_accepted) { $('gate').hidden = false; return; }
      await enter();
    } catch (e) { fail(e); }
  })();
})();
</script>
</body>
</html>`;
