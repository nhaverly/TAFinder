// Appraisal of one listing against the nightly-paid placement it replaces.
// Runs on the server only: asking prices and full postcodes never leave it.

export const DEFAULT_ASSUMPTIONS = {
  pwlb_mode: 'live',              // 'live' = DMO certainty rate, 'fixed' = the council's own rate
  pwlb_fixed_rate_pct: 5.0,
  pwlb_term_years: 40,
  pwlb_certainty_discount_pct: 0.2,
  mrp_pct: 2.5,
  purchase_costs_pct: 6,
  mm_pct_of_lha_rent: 30,
  rent_loss_pct: 5,
  subsidy_pct_of_2011_lha: 90,
  nightly_mode: 'area',           // 'area' = average for the area the home is in, 'own' = the council's own rate
  nightly_own_rate: 100,
  nightly_cost_outside_london: 75,
  min_annual_saving: 0,
};

// What a council may change, with the range allowed.
export const EDITABLE = {
  pwlb_mode: { type: 'enum', values: ['live', 'fixed'] },
  pwlb_fixed_rate_pct: { type: 'num', min: 0, max: 15 },
  pwlb_term_years: { type: 'num', min: 5, max: 50, int: true },
  mrp_pct: { type: 'num', min: 0, max: 10 },
  purchase_costs_pct: { type: 'num', min: 0, max: 20 },
  mm_pct_of_lha_rent: { type: 'num', min: 0, max: 100 },
  rent_loss_pct: { type: 'num', min: 0, max: 50 },
  subsidy_pct_of_2011_lha: { type: 'num', min: 0, max: 100 },
  nightly_mode: { type: 'enum', values: ['area', 'own'] },
  nightly_own_rate: { type: 'num', min: 0, max: 1000 },
  nightly_cost_outside_london: { type: 'num', min: 0, max: 1000 },
  min_annual_saving: { type: 'num', min: 0, max: 1000000 },
};

export function cleanAssumptions(input) {
  const out = {};
  const errors = [];
  for (const [k, rule] of Object.entries(EDITABLE)) {
    if (!(k in input)) continue;
    const v = input[k];
    if (rule.type === 'enum') {
      if (rule.values.includes(v)) out[k] = v; else errors.push(k);
    } else {
      const n = Number(v);
      if (!Number.isFinite(n) || n < rule.min || n > rule.max || (rule.int && !Number.isInteger(n))) errors.push(k);
      else out[k] = n;
    }
  }
  return { out, errors };
}

// Inner and central London BRMAs take the £500 weekly subsidy cap; elsewhere £375.
const CAP500 = new Set(['Central London', 'Inner East London', 'Inner North London',
  'Inner South East London', 'Inner South West London', 'Inner West London']);

export function appraise(l, a, rate, nightlyByArea) {
  const capital = l.asking_price * (1 + a.purchase_costs_pct / 100) + l.works_cost;
  const financing = capital * (rate.pct + a.mrp_pct) / 100;
  const rentGross = l.lha_now * 52;
  const ownNet = financing + rentGross * a.mm_pct_of_lha_rent / 100 - rentGross * (1 - a.rent_loss_pct / 100);
  let nightly, nightlyBasis;
  if (a.nightly_mode === 'own') { nightly = a.nightly_own_rate; nightlyBasis = 'own'; }
  else if (nightlyByArea[l.area]) { nightly = nightlyByArea[l.area]; nightlyBasis = 'area'; }
  else { nightly = a.nightly_cost_outside_london; nightlyBasis = 'assumed'; }
  const subWk = Math.min(l.lha_2011 * a.subsidy_pct_of_2011_lha / 100, CAP500.has(l.brma) ? 500 : 375);
  const taNet = nightly * 365 - subWk * 52;
  const saving = taNet - ownNet;
  return { capital, ownNet, taNet, saving, nightly, nightlyBasis, subWk, breakeven: (ownNet + subWk * 52) / 365 };
}

// What an officer sees for a home: derived figures only, rounded so the asking price can't be worked back.
const r100 = (v) => Math.round(v / 100) * 100;
const r5 = (v) => Math.round(v / 5) * 5;

export function priceBand(p) {
  const step = p < 1_000_000 ? 25_000 : 100_000;
  const lo = Math.floor(p / step) * step;
  const f = (v) => v >= 1_000_000 ? '£' + (v / 1e6).toFixed(1).replace(/\.0$/, '') + 'm' : '£' + Math.round(v / 1000) + 'k';
  return f(lo) + ' to ' + f(lo + step);
}

export function district(postcode) {
  return String(postcode).trim().toUpperCase().split(/\s+/)[0];
}

export function publicRow(l, res) {
  return {
    area: l.area,
    region: l.region,
    district: district(l.postcode),
    property: l.beds + ' bed ' + String(l.property_type).toLowerCase(),
    beds: l.beds,
    price_band: priceBand(l.asking_price),
    epc: l.epc || null,
    new: (l.days_listed ?? 99) <= 7,
    nightly: Math.round(res.nightly),
    nightly_basis: res.nightlyBasis,
    own_net: r100(res.ownNet),
    ta_net: r100(res.taNet),
    saving: r100(res.saving),
    breakeven: r5(res.breakeven),
    link: l.listing_url || null,
    sample: !!l.is_sample,
  };
}
