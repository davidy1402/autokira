# Vehicle catalogue

The search catalogue is derived from Malaysian Road Transport Department (JPJ) car registration transactions, published by data.gov.my under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Source: https://data.gov.my/data-catalogue/registration_transactions_car. The import aggregates registrations by maker, model and fuel group; it omits individual registration rows and does not infer model year, trim, consumption, price or technical specifications.

## JPJ Dataset & Update Workflow

- Run `python3 scripts/updateVehicleCatalog.py` to download the current year's CSV and merge with `src/data/jpjVehicles.json`. When run without arguments (e.g. in GitHub Actions), it fetches the current year's transactions and merges them into the existing historical catalogue, preserving registrations from prior years without requiring multi-hundred-megabyte re-downloads.
- `--years 2020-2026` or `--all-years` downloads and compiles the complete multi-year archive. The bundled snapshot covers 2020 through late 2026, comprising over 1,200 unique vehicle models across more than 5.1 million registrations.
- `--input PATH` uses a local source for offline reproduction.
- If the current calendar year returns a 404 (such as early in a new year), the script gracefully falls back to the preceding year.
- The GitHub Pages workflow refreshes the source at build time and schedules a monthly build. Automatic production updates start after changes are pushed and the workflow runs. No user data is transmitted to JPJ when searching.

## Specifications and Estimation Policy

1. **Verified Presets**:
   - Electric vehicles (EV) and Internal Combustion Engine vehicles (ICE, Hybrid, Diesel) with known Malaysian market specifications are provided in `src/data/presets.ts` and `src/data/icePresets.ts`.
   - Figures are drawn from official Malaysian distributor brochures and releases (e.g. Perodua, Proton, UMW Toyota, Honda Malaysia, Sime Darby Motors, Bermaz, Pro-Net, SAIC Motor Malaysia).
   - Test cycles (WLTP, MDC, or combined) and manufacturer citations are explicitly stated on presets.

2. **Name-Only JPJ Search & Reference Approximations**:
   - The raw JPJ registration transactions do not provide fuel consumption, battery size, or prices.
   - When a user searches for an unpreset vehicle found in JPJ registrations (including petrol, hybrid, and diesel models), they can choose an existing reference vehicle as an approximation.
   - The selected basis is explicitly marked on input and result screens (e.g. `Perodua Kancil (estimate: Perodua Viva 1.0)`) to prevent misleading users into believing the numbers are exact manufacturer claims.
   - Diesel vehicles (e.g. Toyota Hilux, Isuzu D-Max, Ford Ranger, Mitsubishi Triton) now support the estimation flow using verified diesel reference presets and automatically assign Euro 5 Diesel pricing (RM 2.95/L).
