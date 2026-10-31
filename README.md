# TA Acquisition Finder

A screening tool for local authorities. It lists homes on the market that would cost less to own than the nightly-paid temporary accommodation they replace, ranked by net annual saving.

**This is a demonstration version.** The properties are sample listings, not homes currently for sale.

## What it does

1. **Search:** choose the council areas to buy in and a minimum EPC rating.
2. **Results:** see how many homes create a saving, the capital needed, the combined annual saving and a ranked list of every home.
3. **Method:** every assumption and data source behind the figures.

For each home, the saving compares:

- **Owning it:** PWLB borrowing repaid as an annuity, management and maintenance at a share of LHA rent, less rent at the current LHA rate for the postcode and bedroom size.
- **The nightly-paid placement it replaces:** the area's average gross cost per household per night, less Housing Benefit subsidy at 90% of the January 2011 LHA rate, capped at £500 a week in inner and central London and £375 elsewhere.

## Data sources

- **Listings:** sample properties at real postcodes. Prices, works costs, floor areas and EPC ratings are illustrative.
- **LHA rates:** 2026/27 and January 2011 weekly rates for each postcode, from the Valuation Office Agency's LHA Direct.
- **Nightly TA costs:** London boroughs' 2024-25 revenue outturn (RO4) spend on nightly-paid self-contained TA, divided by average households in that category (TA1), as compiled by the [London TA Atlas](https://github.com/hackney-data-stories/london-ta-atlas). Boroughs whose returns can't isolate nightly-paid costs use the London average of £94. Outside London, £75 a night is an assumption.

Contains public sector information licensed under the Open Government Licence v3.0.

## Publishing

The whole tool is the single file `index.html`. To publish it with GitHub Pages, go to **Settings > Pages**, set the source to **Deploy from a branch**, and choose the `main` branch and the root folder.

Figures are illustrative screening estimates, not financial advice.
