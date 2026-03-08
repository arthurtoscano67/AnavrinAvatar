# AnavrinAvatar

Sui Move package for the `anavrin::avatar` module.

## Contents

- `sources/avatar.move`: avatar minting, attachment equipment, XP, stat spending, and admin controls
- `Move.toml`: package metadata and named address configuration
- `frontend/`: standalone React dashboard for reading `MintConfig` and testing the first admin actions

## Build

```bash
sui move build
```

Strict lint build:

```bash
sui move build --warnings-are-errors
```

## Frontend

The frontend is a separate React app inside `frontend/` so it does not share code or build output with any other site.

Install and run:

```bash
cd frontend
npm install
npm run dev
```

Default local URL:

```bash
http://127.0.0.1:4174
```

## Module

- Package name: `anavrin`
- Module: `anavrin::avatar`
- Named address: `anavrin = 0xc4eb339c26f7d48d803a369c0da9aff09db346ba62916b915eb68df74d808b76`

## Notes

- The package uses the standard `sources/` directory. A stale duplicate `source/` tree was removed.
- The current Sui framework on this machine does not expose a `kiosk_lock_rule` module, so transfer policy setup matches the installed framework APIs.
