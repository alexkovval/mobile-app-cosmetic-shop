# Build Plan — Cosmetics/Beauty Store MVP (Implementation Steps & Phases)

**Status:** For your review. I paused after starting Phase 1 scaffolding — no further phases have been touched. Nothing further will run until you confirm.

This is the execution plan that turns `ARCHITECTURE_PLAN.md` into concrete, ordered build steps. It sequences the work already agreed in the architecture doc — it doesn't revisit those decisions (Expo + TS client, Express + Prisma/Postgres-via-Docker-Compose backend, React Query/Zustand/RHF split, idempotent checkout, mocked card-scan).

**One environment note that affects how this runs:** this workspace has no network access to package registries (npm, etc. are blocked by the sandbox's egress policy) — confirmed while starting Phase 1. That means I can write and structure all the code, but I can't run `npm install`, boot the servers, or execute tests from inside this session. You'll run those steps yourself once you have the files (`npm install`, `npm run dev`, `npm test`) on your own machine, where normal internet access is available. I'll still write every config and test file so those commands work correctly once you do.

## Repo layout

```
cosmetics-app/
├── ARCHITECTURE_PLAN.md
├── BUILD_PLAN.md
├── docker-compose.yml     # single Postgres service for local dev
├── backend/
└── mobile/
```

## Phase 1 — Backend scaffold + schema + seed  *(currently in progress — package.json, tsconfig, Prisma schema, error/auth/validate middleware, pricing helper, app.ts/server.ts, and seed.ts are written; not yet installed or run; being updated now for Postgres)*
- `docker-compose.yml` at the repo root: one `postgres:16` service, persisted named volume, exposed on `5432`.
- Express + TypeScript project structure, Prisma schema targeting **PostgreSQL** (User, Product, CartItem, Order, OrderItem — cents-based pricing, unique idempotency key, unique cart line per product).
- Seed script: ~17 products across 4 categories + one demo user.
- **You'll verify:** `docker compose up -d` (starts Postgres) → `cd backend && npm install && npx prisma migrate dev && npm run dev` boots cleanly; seed data present via `npx prisma studio`.

## Phase 2 — Backend: auth, products, cart endpoints
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me` (JWT).
- `GET /products` (search/category/pagination), `GET /products/:id`, `GET /categories`.
- `GET/POST/PATCH/DELETE /cart` family, all behind auth, upserting by `[userId, productId]`.
- **You'll verify:** exercise each route with curl/Postman — register → login → browse/search products → add/update/remove cart items.

## Phase 3 — Backend: orders + idempotency
- Idempotency-key lookup before creating anything; if the key already exists, return the existing order instead of creating a duplicate.
- Otherwise, in a single DB transaction: re-price the cart from current product prices, reject on empty cart/out-of-stock, create Order + OrderItem snapshot rows, clear the cart.
- Backend test written now (not deferred): submitting the same idempotency key twice results in exactly one order.
- **You'll verify:** `npm test` — the duplicate-order test passes.

## Phase 4 — Mobile scaffold
- `create-expo-app` (TypeScript template) + React Query, Zustand, React Hook Form, Zod, React Navigation, expo-camera, expo-secure-store.
- Theme, typed API client (auth header injection, error normalization, abort-signal support), auth store, navigation shell with placeholder screens for every route.
- **You'll verify:** app boots in Expo Go/simulator; shows Login when logged out, tab bar when a session exists.

## Phase 5 — Mobile: auth feature
- Login/Register screens via React Hook Form + Zod, wired to the backend through React Query mutations; session persisted via `expo-secure-store`.
- **You'll verify:** register/login against the real backend; session survives an app reload.

## Phase 6 — Mobile: products (list, search, category, detail)
- Debounced search + category chips + product grid, all four states (loading/error/empty/success) on every data screen.
- **You'll verify:** search/filter round-trip to the backend; killing the backend briefly shows the error+retry path recovering.

## Phase 7 — Mobile: cart
- Cart screen with optimistic add/update/remove, invalidated against the server on settle.
- **You'll verify:** cart mutations stay consistent with a fresh `GET /cart` (no optimistic-update drift).

## Phase 8 — Mobile: checkout + duplicate-prevention + card scan
- One idempotency key generated per checkout session; Place Order disables synchronously on tap; mutation has `retry:false`; network failures offer a retry that reuses the same key.
- Card-scan screen: camera preview + overlay, mocked capture behind a swappable `CardScanner` interface, feeding the same Luhn+expiry validation as manual entry.
- **You'll verify:** rapid double-tap on Place Order produces exactly one order; airplane-mode mid-checkout shows safe retry behavior.

## Phase 9 — Mobile: orders + confirmation
- Order list/detail/confirmation screens showing the immutable snapshot data.
- **You'll verify:** change a product's price after placing an order — the historical order stays unaffected.

## Phase 10 — Cross-cutting polish pass
- Sweep every screen against the loading/error/empty/success checklist; consistent skeletons/spacing.

## Phase 11 — Tests
- Backend: order totals, duplicate-order guard (from Phase 3), cart validation.
- Mobile: cart calculations, Luhn/Zod schema validation, a couple of component smoke tests.
- **You'll verify:** `npm test` green in both `backend/` and `mobile/`.

## Phase 12 — README + screenshots
- Recruiter-facing README per the architecture doc's outline; screenshots/GIF from the running simulator.

## Scope flex if time is short
Cut in this order: card-scan camera (→ manual entry only) → skeleton loaders (→ plain spinner) → mobile test suite (→ keep only the backend duplicate-order test, since that's the one that most directly proves the checkout-reliability requirement).

---

Let me know if you want any phase reordered, split differently, or scoped down — otherwise, tell me to continue and I'll pick back up at Phase 1 completion / Phase 2.
