# TA Acquisition Finder: secure version

The version for named officers at subscribing councils. It runs as a Cloudflare Worker with Cloudflare Access in front of it.

- **Sign-in:** officers sign in with their council email. Cloudflare emails them a one-time code; no passwords.
- **Named officers only:** the Worker checks every request against its own list of named officers, so removing someone takes effect immediately.
- **Listing data stays on the server.** Officers see derived figures only: area, postcode district, size, price band, EPC, rounded costs and savings, and the link to the listing. Exact prices and full postcodes never leave the server.
- **Each council sets its own assumptions:** borrowing (live PWLB certainty rate or its own rate), MRP, purchase costs, management and maintenance, voids, subsidy share and its own nightly cost if it prefers. Council admins can change them; officers can view them.
- **Controls for the data licence:** terms of use accepted at first sign-in, no download or export, 25 homes per page and 500 per search, a limit of 30 searches a minute, and an audit log of every search and change.

The folder name starts with `_` so GitHub Pages does not publish it.

## One-time setup (about 15 minutes in the Cloudflare dashboard)

The database (`ta-finder`) already exists and holds the sample listings, the 2024-25 nightly costs, a demo council, Westminster City Council and the owner account (nick.haverly@haverlyconsulting.co.uk).

1. **Deploy the Worker from this repository.** In Cloudflare, go to **Workers & Pages > Create > Import a repository**, choose `nhaverly/TAFinder`, set the **root directory** to `_secure-app`, and deploy. The Worker is named `ta-finder` and appears at `https://ta-finder.nick-haverly.workers.dev`. Every push to `main` redeploys it.
2. **Switch on Cloudflare Access.** Open the `ta-finder` Worker, go to **Settings > Domains & Routes**, and next to `workers.dev` select **Enable Cloudflare Access**.
3. **Set who may reach the sign-in page.** Select **Manage Cloudflare Access** and edit the policy to include your own email address and, for each subscribing council, **Emails ending in** its domain (for example `@westminster.gov.uk`). The Worker's own list still decides which named officers get in.
4. **Copy two values** from **Zero Trust > Access > Applications > ta-finder**: the **Application Audience (AUD) tag**, and your **team domain** (it looks like `https://yourteam.cloudflareaccess.com`). Put them in `wrangler.jsonc` as `POLICY_AUD` and `TEAM_DOMAIN`, and push. Until they're set, the Worker refuses every request.
5. **Sign in** at the Worker's address, accept the terms of use, and use the **Admin** tab to add named officers and councils.

## Running locally

`npx wrangler dev` with `LOCAL_DEV_EMAIL` set to an email on the officer list. That bypass only works on `localhost`.

## Still to build

- **Weekly import of the licensed listings file.** Once the data licence and file format are agreed, a scheduled job will load each week's file into the `listings` table, replacing the sample rows (`is_sample = 1`).
- **A custom domain**, such as `finder.haverlyconsulting.co.uk`, once the domain's DNS is on Cloudflare.
