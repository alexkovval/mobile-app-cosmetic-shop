# Cosmetics/Beauty Store — React Native MVP
## Architecture & Planning Document

**Status:** Planning phase — no code written yet. This document is for review and approval before implementation begins.

---

## 1. Final Architecture

### Mobile client
- **Framework:** React Native + Expo (managed workflow), TypeScript throughout. Expo is chosen over bare RN because it removes native build/config overhead (camera, permissions, icons) so the day's budget goes to app logic, not toolchain setup. Everything used here (`expo-camera`, navigation, etc.) can be ejected later without a rewrite.
- **Navigation:** React Navigation (native-stack + bottom-tabs).
- **Server state:** TanStack Query (React Query) v5 — all data that originates on the backend (products, cart, orders, auth session).
- **Local/UI state:** Zustand for small, feature-scoped stores (e.g. auth session token, checkout-in-progress flag) + `useState`/`useReducer` for component-local, throwaway UI state (search input, selected chip, modal visibility).
- **Form state:** React Hook Form + Zod resolvers (login/register, checkout shipping + card form).
- **API layer:** a thin typed service layer (`src/api/`) wrapping `fetch` with a shared client (base URL, auth header injection, error normalization, `AbortController` support). React Query calls into this layer; it never talks to `fetch` directly.
- **Styling:** plain `StyleSheet` + a small shared theme (colors, spacing, typography scale). No heavy UI kit — keeps the bundle lean and every component intentional.

### Backend
- **Runtime:** Node.js + Express, TypeScript.
- **ORM/DB:** Prisma + **PostgreSQL**, run locally via a single-service **Docker Compose** file (`docker compose up -d` starts Postgres, nothing else to install). This is closer to a real production setup than SQLite would be (real concurrency behavior, real `SERIALIZABLE`/row-locking semantics under the idempotency transaction in §7) while still costing nothing beyond one `docker compose up -d` — no cloud account, no hosted DB to provision for local dev.
- **Auth:** email + password, bcrypt hashing, JWT access token (long-lived, ~7 days, for MVP simplicity — no refresh-token rotation, called out as a cut corner below).
- **Validation:** Zod schemas per route, shared shape with the mobile form schemas where practical (copy, not a monorepo package — not worth the setup cost today).
- **Idempotency:** dedicated mechanism for order creation (detailed in §7).

### Why this split
This mirrors how a real product team would scope a one-day proof-of-concept: real HTTP boundary, real validation, a real relational database with real constraints and transactions — but the *infrastructure that isn't the point of the exercise* (a hosted DB, a cloud auth provider, a payment gateway) is local/mocked/simplified, because none of it demonstrates engineering judgment, it just costs setup time. Postgres is containerized rather than installed natively so "how to run this" is one Docker command regardless of what's on the reviewer's machine.

---

## 2. Recommended Folder Structure

```
cosmetics-app/
├── docker-compose.yml            # single Postgres service for local dev
├── backend/
├── mobile/
```

### Mobile (`mobile/`)

```
mobile/
├── App.tsx
├── app.json
├── tsconfig.json
├── src/
│   ├── api/                       # service layer — ONLY place that calls fetch
│   │   ├── client.ts              # base fetch wrapper: base URL, auth header, timeout, error mapping
│   │   ├── auth.api.ts
│   │   ├── products.api.ts
│   │   ├── cart.api.ts
│   │   └── orders.api.ts
│   ├── features/                  # feature-first organization
│   │   ├── auth/
│   │   │   ├── screens/ (LoginScreen, RegisterScreen)
│   │   │   ├── hooks/ (useLogin, useRegister — wrap React Query mutations)
│   │   │   └── validation/ (authSchemas.ts — zod)
│   │   ├── products/
│   │   │   ├── screens/ (ProductListScreen, ProductDetailScreen)
│   │   │   ├── components/ (ProductCard, CategoryChipRow, SearchBar)
│   │   │   └── hooks/ (useProducts, useProduct, useCategories)
│   │   ├── cart/
│   │   │   ├── screens/ (CartScreen)
│   │   │   ├── components/ (CartLineItem, CartSummary)
│   │   │   └── hooks/ (useCart, useAddToCart, useUpdateCartItem, useRemoveCartItem)
│   │   ├── checkout/
│   │   │   ├── screens/ (CheckoutScreen, CardScanScreen, OrderConfirmationScreen)
│   │   │   ├── components/ (ShippingForm, CardForm, CardScanOverlay)
│   │   │   ├── hooks/ (useCreateOrder)
│   │   │   └── validation/ (checkoutSchemas.ts)
│   │   ├── orders/
│   │   │   ├── screens/ (OrderListScreen, OrderDetailScreen)
│   │   │   └── hooks/ (useOrders, useOrder)
│   │   └── profile/
│   │       └── screens/ (ProfileScreen)
│   ├── components/                # cross-feature reusable UI
│   │   ├── Button/ Skeleton/ EmptyState/ ErrorState/ Toast/ Chip/
│   ├── navigation/
│   │   ├── RootNavigator.tsx  AuthNavigator.tsx  MainTabNavigator.tsx
│   ├── state/                     # zustand stores (small, feature-scoped)
│   │   ├── authStore.ts  checkoutStore.ts
│   ├── lib/
│   │   ├── queryClient.ts  errors.ts (ApiError type + normalizer)  idempotency.ts (uuid gen)
│   ├── theme/  (colors.ts, spacing.ts, typography.ts)
│   └── types/  (shared TS types mirroring backend DTOs)
└── __tests__/
    ├── cart.calculations.test.ts
    ├── checkoutSchemas.test.ts
    └── orderTotals.test.ts
```

### Backend (`backend/`)

```
backend/
├── src/
│   ├── app.ts                     # express app, middleware wiring
│   ├── server.ts                  # entrypoint
│   ├── modules/
│   │   ├── auth/     (auth.routes.ts, auth.controller.ts, auth.service.ts, auth.schema.ts)
│   │   ├── products/ (products.routes.ts, products.controller.ts, products.service.ts)
│   │   ├── cart/     (cart.routes.ts, cart.controller.ts, cart.service.ts)
│   │   └── orders/   (orders.routes.ts, orders.controller.ts, orders.service.ts, orders.schema.ts)
│   ├── middleware/
│   │   ├── auth.middleware.ts     # verifies JWT, attaches req.user
│   │   ├── validate.middleware.ts # generic zod-schema validator
│   │   └── error.middleware.ts    # maps thrown errors → consistent JSON error shape
│   └── lib/
│       ├── prisma.ts
│       └── idempotency.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
└── tests/
    ├── orders.duplicate.test.ts
    ├── cart.service.test.ts
    └── orders.totals.test.ts
```

**Why feature-first on mobile, module-first on backend:** the mobile app's complexity is in screen-level user flows, so grouping by feature keeps everything a screen needs in one place. The backend's complexity is in data integrity and request handling, so grouping by resource (matching the REST surface) keeps routes/services/schemas co-located per entity.

---

## 3. Database Schema

```
User
  id            String  @id @default(cuid())
  email         String  @unique
  passwordHash  String
  name          String
  createdAt     DateTime @default(now())

Product
  id            String  @id @default(cuid())
  name          String
  description   String
  price         Int              // stored in cents to avoid float rounding
  imageUrl      String
  category      String           // simple string enum-like field for MVP
  stock         Int      @default(0)
  createdAt     DateTime @default(now())

CartItem
  id            String  @id @default(cuid())
  userId        String
  productId     String
  quantity      Int
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@unique([userId, productId])   // one row per product per user; quantity increments in place

Order
  id             String   @id @default(cuid())
  userId         String
  status         String   // "pending" | "paid" | "failed"
  subtotal       Int
  tax            Int
  shipping       Int
  total          Int
  idempotencyKey String   @unique   // client-generated UUID, one per checkout attempt
  createdAt      DateTime @default(now())

OrderItem
  id            String  @id @default(cuid())
  orderId       String
  productId     String
  nameSnapshot  String   // captured at order time — immutable even if product changes later
  priceSnapshot Int
  quantity      Int
```

Key decisions:
- **Prices in integer cents** everywhere (client and server) — avoids the classic floating-point money bug, which is exactly the kind of detail that signals care to a reviewer.
- **Order/OrderItem snapshot fields** (`nameSnapshot`, `priceSnapshot`) make an order immutable and historically accurate even if a product's price or name changes later — required by the prompt ("create an immutable order snapshot").
- **`idempotencyKey` unique constraint** is the actual duplicate-order guard — enforced at the database level, not just in application code, so it holds even under concurrent requests.
- **`CartItem` unique(userId, productId)** means "add to cart" is an upsert (increment quantity) rather than always inserting a new row.

---

## 4. API Endpoint Specification

```
Auth
  POST   /auth/register       { email, password, name } → { user, token }
  POST   /auth/login          { email, password }        → { user, token }
  GET    /auth/me             (auth)                      → { user }

Products
  GET    /products?search=&category=&page=&limit=        → { items[], page, limit, total }
  GET    /products/:id                                     → { product }
  GET    /categories                                       → { categories[] }

Cart                                                        (all auth-required)
  GET    /cart                                             → { items[], subtotal }
  POST   /cart/items          { productId, quantity }      → { items[], subtotal }
  PATCH  /cart/items/:id      { quantity }                 → { items[], subtotal }
  DELETE /cart/items/:id                                   → { items[], subtotal }

Orders                                                       (all auth-required)
  POST   /orders              { shippingInfo, cardLast4 }
         header: Idempotency-Key: <uuid>                   → { order } (201, or 200 if replayed)
  GET    /orders                                            → { orders[] }
  GET    /orders/:id                                        → { order, items[] }
```

Notes:
- `POST /orders` never accepts a client-computed total — it re-reads the cart server-side, re-prices every line against current `Product.price`, and computes `subtotal`/`tax`/`shipping`/`total` on the server. The client only sends shipping details and (mock) card metadata.
- Card data: only a masked/last-4 representation is ever sent to or stored by the backend. No PAN, no CVV, no expiry reaches the server — enforced by the request schema itself (the field is literally typed as 4 digits), not just by policy.
- Standard error shape from every endpoint: `{ error: { code, message, details? } }`, so the mobile error-normalizer has one shape to handle.

---

## 5. Screen / Navigation Structure

```
RootNavigator
├── AuthNavigator (unauthenticated)
│   ├── LoginScreen
│   └── RegisterScreen
└── MainTabNavigator (authenticated)
    ├── Tab: Home/Discover  → ProductListScreen → ProductDetailScreen
    ├── Tab: Search         → ProductListScreen (search-focused variant, same component)
    ├── Tab: Cart           → CartScreen → CheckoutScreen → CardScanScreen (modal) → OrderConfirmationScreen
    ├── Tab: Orders         → OrderListScreen → OrderDetailScreen
    └── Tab: Profile        → ProfileScreen (basic account info + logout)
```

`ProductDetailScreen`, `CheckoutScreen`, `OrderConfirmationScreen`, and `OrderDetailScreen` are pushed as stack screens above whichever tab initiated them, not nested tab screens themselves — standard RN pattern to keep the tab bar visible on list screens but hidden on detail/flow screens.

---

## 6. State Management Strategy

The prompt specifically asks *why* these are separated — this is the crux of the "senior-level" signal, so it's worth stating explicitly rather than just structurally:

| State type | Tool | Why not a single global store |
|---|---|---|
| **Server state** (products, cart, orders, session-derived data) | React Query | This data has a lifecycle a plain store doesn't give you for free: caching, background refetch, stale-while-revalidate, request de-duplication, retry-with-backoff, and — critically for this app — cancellation. Reimplementing that in Redux/Zustand means hand-rolling a worse version of React Query. |
| **Local/UI state** (selected category chip, search input before debounce, modal open/closed, camera-active flag) | `useState`/`useReducer`, Zustand for the few pieces shared cross-screen (e.g. "checkout in progress") | This state has nothing to do with the server and doesn't need caching or invalidation semantics — putting it in React Query would be a category error (there's no query to invalidate), and putting transient, screen-local state into a global store adds indirection with no benefit. |
| **Form state** (login, register, shipping address, card details) | React Hook Form + Zod | Forms re-render per keystroke by nature. RHF isolates that churn to the input components via uncontrolled refs instead of re-rendering the whole screen on every character, and Zod gives one validation schema that drives both inline field errors and the submit gate. Modeling form state as global state would force the rest of the screen to re-render on every keystroke. |

Concretely: `useProducts()` (React Query) never lives in Zustand, and "is the card-scan camera currently open" never lives in React Query — each tool is used only for the state shape it's actually good at.

---

## 7. Checkout Flow & Duplicate-Order Prevention

This is the most safety-critical flow in the app, so it's worth walking through end to end.

1. User taps **Place Order** on `CheckoutScreen`.
2. The screen immediately (synchronously, before any network call) disables the button and flips a local `isSubmitting` flag — this is the first line of defense against double-tap, independent of anything server-side.
3. An **idempotency key** (UUID v4) is generated **once**, the first time the user enters the checkout screen for this cart — stored in a `useRef`/local state, *not* regenerated on retry. Every attempt to submit this same checkout session reuses the same key.
4. The order request is sent via a React Query `useMutation` with `retry: false` (mutations should never auto-retry blindly — a retried POST could double-submit if the first one actually succeeded server-side but the response was lost). The `Idempotency-Key` header carries the UUID.
5. **Server side:** before creating anything, the order service checks whether an `Order` with that `idempotencyKey` already exists.
   - If yes → return that existing order (200), do not touch the cart or create new rows. This makes retries — from a double-tap, an app relaunch after a network hiccup, anything — safe by construction.
   - If no → validate the cart is non-empty and all products still exist/in stock, re-price everything server-side, create the `Order` + `OrderItem` rows and clear the cart, all inside a single DB transaction (so a crash mid-way never leaves an order without its items, or a cleared cart without an order).
6. **Client side on response:**
   - Success → invalidate the `cart` query (so the tab badge and cart screen reflect the now-empty cart), navigate to `OrderConfirmationScreen`.
   - Network failure (no response at all) → show an inline "Couldn't reach the server — retry?" state. Retry reuses the *same* idempotency key, so even if the original request actually landed, the retry is a safe no-op that returns the same order.
   - Server-side validation failure (e.g., an item went out of stock between add-to-cart and checkout) → surface the specific error, let the user adjust the cart, do not let them resubmit with the same broken state silently.
   - Mock "payment declined" → treated as a distinct order `status: "failed"` outcome (still created, still deduped by idempotency key) so the flow demonstrates handling a business-logic failure, not just a network failure.

This directly satisfies "prevent duplicate order creation if the user accidentally taps the payment button multiple times" with defenses at three layers (UI disable, client-side single-key-per-session, server-side unique constraint) rather than relying on any single one.

---

## 8. Credit-Card "Scanning" Architecture

Real PCI-scope card capture and payment processing are explicitly out of scope for this MVP, so the goal is to demonstrate the *architecture* of a scan-to-autofill flow without building real payment infrastructure.

**Recommended approach for a one-day build:** a camera-based scan screen using `expo-camera` that overlays a card-shaped guide, "captures" after a short delay, and extracts a plausible mock card number/expiry to autofill the form — with the extraction logic sitting behind a small `CardScanner` interface (`scanCard(): Promise<{ number, expiry }>`). The mocked implementation satisfies that interface today; a real implementation (e.g. `react-native-vision-camera` + an ML Kit text-recognition frame processor) could be dropped in later without touching any calling code. This is called out explicitly rather than hidden, because pretending a one-day mock is real OCR would be the wrong kind of "polish."

Regardless of scan vs. manual entry, the resulting number is:
- **Validated client-side with a Luhn check** (real algorithm, not mocked — this is cheap to implement correctly and is a nice concrete "attention to detail" signal) plus expiry-date-in-future validation, via the same Zod schema used for manual entry.
- **Never sent to or stored by the backend beyond a masked last-4** — reinforcing the "no real card storage" constraint at the architecture level, not just as a policy note.

This is flagged in the "optional/cut-if-short-on-time" list (§11) as a place where scope can flex: a static illustration + manual-entry-only form is an acceptable fallback if the day runs long, since the camera flow is UX polish around a form that already works.

---

## 9. Error-Handling Strategy

- **API client (`src/api/client.ts`):** every response is normalized into a typed `ApiError { kind: 'network' | 'timeout' | 'validation' | 'server' | 'unauthorized', message, details? }` before it reaches React Query, so no screen ever pattern-matches on raw HTTP status codes.
- **React Query defaults:** GET queries retry twice with exponential backoff (transient network blips are common on mobile); mutations do not auto-retry (see §7 rationale).
- **Screen-level states:** every list/detail screen that depends on server data explicitly renders four states — loading (skeleton), error (`ErrorState` with a retry action wired to `refetch()`), empty (`EmptyState`, e.g. "No products match your search" / "Your cart is empty"), and success. This is enforced as a pattern via a small `useAsyncState`-style convention rather than ad hoc per screen.
- **Request cancellation:** search-as-you-type is debounced (~300ms) and passes React Query's `signal` through to the fetch call via `AbortController`, so a fast typist doesn't pile up stale in-flight requests; the same signal is used to cancel in-flight requests on screen unmount.
- **Form-level errors:** RHF + Zod handle field-level validation inline; server-side validation errors (e.g., "email already registered") are mapped back onto the relevant RHF field via `setError` rather than shown as a generic toast, where the API error shape allows it.
- **Toasts** are reserved for transient, non-blocking issues (e.g., "couldn't refresh cart, showing cached data") — blocking issues get an explicit `ErrorState`, not a toast that disappears before it's read.

---

## 10. Testing Strategy

Deliberately narrow, per the prompt's own instruction not to spend the day on tests — focused on the logic that's actually risky if wrong:

**Backend (Jest + Supertest):**
- Order total calculation (subtotal/tax/shipping/total arithmetic, integer-cents rounding).
- Duplicate order prevention: same idempotency key submitted twice → second call returns the first order, no second row created, cart not double-cleared.
- Cart validation: adding an out-of-stock or nonexistent product is rejected.

**Mobile (Jest + React Native Testing Library, minimal):**
- Cart total calculation on the client (mirrors backend logic — should agree).
- Zod schema validation (checkout form, Luhn check on card number).
- One or two component smoke tests (`EmptyState`, `ErrorState` render with given props) — enough to prove the pattern, not exhaustive coverage.

Explicitly **not** covered given the one-day budget: end-to-end/Detox tests, visual regression, exhaustive edge-case coverage of every screen.

---

## 11. Development Order & Time Estimate

Estimated for a focused, uninterrupted working day (~9–10 hours) rather than a strict 8-hour box — noted honestly below rather than pretending an 8-hour estimate is realistic for a fully polished result.

| Phase | Work | Est. |
|---|---|---|
| 1 | Backend scaffold: Docker Compose Postgres + Express + Prisma schema + seed data | 50 min |
| 2 | Backend endpoints: auth, products, cart | 1 h |
| 3 | Backend orders endpoint + idempotency + transaction | 45 min |
| 4 | Mobile scaffold: navigation shell, theme, API client, React Query setup, auth store | 1 h |
| 5 | Auth screens (login/register) end to end | 45 min |
| 6 | Product list + search + category chips + detail screen, with loading/empty/error states | 1.5 h |
| 7 | Cart screen + mutations (add/update/remove) | 1 h |
| 8 | Checkout flow: shipping form, card form + Luhn validation, card-scan mock, duplicate-prevention wiring | 1.5 h |
| 9 | Orders list + detail + confirmation screen | 45 min |
| 10 | Cross-cutting polish: skeletons, empty/error states consistency pass | 45 min |
| 11 | Tests (backend + mobile, as scoped in §10) | 1 h |
| 12 | README + screenshots | 45 min |
| **Total** | | **~10.5 h** |

If genuinely time-boxed to 8 hours, the first things to cut are, in order: card-scan camera flow (fall back to manual entry only), skeleton loaders (fall back to a simple spinner), and the mobile-side test suite (keep only the backend duplicate-order test, since that's the one that most directly demonstrates the checkout-reliability requirement).

---

## 12. MVP Scope vs. Optional

**In scope (MVP):**
- Register/login, persisted session
- Product list with search + category filter, product detail
- Cart CRUD, quantity updates
- Checkout with server-side pricing, immutable order snapshot, three-layer duplicate-order prevention
- Order history + order detail
- Loading/error/empty states across all data-driven screens
- Card-scan *screen* with mock capture + real Luhn validation, clearly documented as mocked
- Focused test suite per §10
- README per §13 below

**Optional / first to cut if time runs short:**
- Refresh-token rotation (long-lived JWT is an accepted MVP shortcut)
- Real on-device OCR for card scanning (vs. the mocked capture)
- Infinite-scroll pagination (simple "Load more" button is an acceptable substitute)
- Profile editing (read-only profile screen is sufficient)
- Order cancellation
- Sort options beyond search/category filter
- Skeleton-loader polish (a plain spinner is an acceptable fallback)

**Explicitly excluded per the constraint (not "optional," just out of scope):** real payment processing, real card storage, microservices, cloud infra beyond a single deployable API, an admin dashboard, social features, a reviews system, push notifications, advanced animation.

---

## 13. README Outline (for later, once implementation is done)

Project overview → Features → Tech stack → Architecture → Project structure → API overview → Authentication flow → Cart/order architecture → Checkout flow → Credit-card scanning approach (with the "this is mocked, here's why, here's the swap-in point" note from §8) → Key technical decisions → Challenges & solutions → How to run → Screenshots.

---

### Open questions for you before implementation starts

1. Any preference between **Expo Go** (fastest to demo, some native-module limits) vs. a **dev client build** (slightly more setup, no limits) for running the card-scan camera feature?
2. Is a recruiter-facing **video/GIF walkthrough** wanted in addition to static screenshots in the README?

Everything else above reflects a concrete recommendation rather than an open choice, so implementation can start as soon as you confirm the plan (and once I know where to save this file).
