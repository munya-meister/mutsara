# Mutsara

**Check the queue before you go.** A React/Vite pilot for comparing community reported waits at Zimbabwean bank branches by bank and service.

## Local frontend

```bash
npm install
npm run dev
```

`npm run build` produces the static site. The frontend will show “Live updates unavailable” until the API is configured.

## Shared reporting setup

1. Create a Supabase project and run `supabase/schema.sql` in its SQL editor.
2. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a long random `REPORT_HASH_SECRET` in **Netlify server environment variables**. See `.env.example`. Do not expose these as `VITE_` variables.
3. Deploy the repo on Netlify. `netlify.toml` builds the React app and routes `/api/queues` to the server function. For local end-to-end testing, use `netlify dev` with your local environment configured.
4. Schedule deletion of reports older than 24 hours using the SQL statement in `supabase/schema.sql` and a trusted scheduler.

The API accepts one report per network address, branch, service, and 30-minute bucket. It uses a salted one-way hash; raw IP addresses are not stored. GET returns a median rounded to five minutes only after at least two distinct reporters in the previous hour. Reports are not proof of bank conditions.

## Pilot limitations

- Branch entries and service availability are illustrative and must be verified with each bank before public launch.
- This pilot uses community reports, not bank queue feeds. Visitors can misreport; network-address limits may also group unrelated people behind shared mobile networks. Add moderation, stronger abuse controls, and an observed field test before presenting estimates as dependable.
- The Google Maps button searches for a branch; it is not a verified location pin.
- If the backend is not configured or reachable, the interface displays no estimates rather than sample figures.
