# Mutsara

**Check the queue before you go.** A React/Vite pilot interface for comparing Zimbabwean bank branch queues by bank and service.

## Run locally

```bash
npm install
npm run dev
```

Build with `npm run build`.

## Pilot limitations

- Branch entries are illustrative and must be verified before public launch.
- Visitor reports are saved in the browser's `localStorage`, **not shared between people**. The app never claims these are live bank figures.
- An estimate requires at least two reports for the same branch and service in the preceding hour. This is for testing the interface, not a validated queue prediction model.
- Before a real launch, add a shared backend, authentication or anti-spam controls, verified branch and service data, moderation, and a more robust wait-time model. Bank feeds or partnerships can later replace crowdsourced estimates.
- The map button opens a Google Maps search, not a verified bank location pin.

## Product flow

Choose bank → choose service → search branch/area → inspect report freshness → share your actual wait.
