-- TA Acquisition Finder: secure version
-- Councils and their named officers, per-council assumptions, listings, nightly costs and an audit log.

CREATE TABLE IF NOT EXISTS councils (
  id TEXT PRIMARY KEY,               -- short slug, e.g. 'westminster'
  name TEXT NOT NULL,
  subscription_ends TEXT             -- ISO date; access stops after this date
);

CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,            -- lower case
  council_id TEXT NOT NULL REFERENCES councils(id),
  role TEXT NOT NULL CHECK (role IN ('officer', 'admin', 'owner')),
  active INTEGER NOT NULL DEFAULT 1,
  terms_accepted_at TEXT,
  added_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One row per council; '_default' holds the defaults every council starts from.
CREATE TABLE IF NOT EXISTS assumptions (
  council_id TEXT PRIMARY KEY,
  json TEXT NOT NULL,
  updated_by TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS nightly_costs (
  area TEXT PRIMARY KEY,
  cost_per_night REAL NOT NULL,
  basis TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS listings (
  listing_id TEXT PRIMARY KEY,
  area TEXT NOT NULL,                -- borough or town
  region TEXT NOT NULL,              -- Inner London, Outer London, Outside London
  postcode TEXT NOT NULL,            -- full postcode, never sent to users
  brma TEXT NOT NULL,
  property_type TEXT NOT NULL,
  beds INTEGER NOT NULL,
  asking_price INTEGER NOT NULL,     -- never sent to users; shown as a band
  works_cost INTEGER NOT NULL DEFAULT 0,
  epc TEXT,
  days_listed INTEGER,
  lha_now REAL NOT NULL,             -- weekly, current year
  lha_2011 REAL NOT NULL,            -- weekly, January 2011
  listing_url TEXT,                  -- link to the listing; null for sample data
  is_sample INTEGER NOT NULL DEFAULT 0,
  loaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS listings_area ON listings(area);

CREATE TABLE IF NOT EXISTS audit (
  ts TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  email TEXT NOT NULL,
  council_id TEXT,
  action TEXT NOT NULL,
  detail TEXT
);
CREATE INDEX IF NOT EXISTS audit_email_ts ON audit(email, ts);
