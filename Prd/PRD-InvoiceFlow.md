# Product Requirements Document
## InvoiceFlow — Invoicing & Business Management SaaS for South Asian Freelancers

**Version:** 4.0 (Final — Technical Build Spec)
**Owner:** Solo developer
**Status:** Approved for implementation
**Stack:** PostgreSQL · Prisma · NeonDB · BetterAuth · Docker · Redis · Express/Node.js (TypeScript) · React/Vite

---

## 1. Project Overview

### 1.1 What is InvoiceFlow
InvoiceFlow is a multi-tenant SaaS platform that lets freelancers and small business owners in South Asia create clients, build professional invoices, track payments, log expenses, and get AI-assisted writing help — replacing WhatsApp threads, Excel sheets, and manually formatted Word documents.

### 1.2 Problem Statement
- No single place to see who owes what → lost revenue tracking
- Manually formatted invoices → unprofessional impression, especially with international clients
- Repetitive manual work → retyping line items, chasing payments by hand
- No visibility → no answer to "how much am I owed right now?"

### 1.3 Target Users
| Persona | Profile | Core need |
|---|---|---|
| **Rafiq** (primary) — freelance designer/developer | Dhaka/Karachi/Bangalore, 3–15 clients, local + international mix | Create a professional invoice in under 2 minutes |
| **Nadia** (secondary) — small agency owner | Runs a 2–5 person operation under one business name | Track expenses alongside invoices to see real profit |

**Explicitly not targeted (v1):** enterprises, accounting firms, teams needing multi-seat/role-based access.

### 1.4 Business Model & Scale
- **Model:** SaaS, multi-tenant, sellable
- **Market:** South Asia (BDT/INR-friendly currency defaults, mobile-first UI)
- **Scale target:** up to ~1,000 users on v1 infrastructure
- **AI:** Free-tier Gemini API (hard constraint — see Section 7, Risks)
- **Timeline:** 1 week to MVP, solo developer

### 1.5 Success Criteria (see Section 4 for full metric list)
The MVP is successful if a user can complete the full loop — sign up → add a client → build an invoice → send it → record a payment → see it marked paid on the dashboard — without friction, in under 10 minutes total, on the first try.

---

## 2. JWT Authentication Flow

Authentication is implemented with **BetterAuth**, configured to issue **JWT-based sessions** stored in an **http-only, secure cookie** — combining BetterAuth's session management with a stateless JWT so `middlewares/auth.ts` can verify a request without a DB round-trip on every call.

### 2.1 Signup Flow
1. Client submits `{ name, email, password }` to `POST /api/auth/sign-up/email`
2. BetterAuth hashes the password (scrypt/bcrypt under the hood), creates the `User` row via Prisma
3. A `CompanySettings` row is lazily created on first access (see `ensure()` pattern, Section 3.4) — **not** at signup, to keep signup fast and side-effect-free
4. BetterAuth issues a signed JWT session token, sets it as an **http-only, `Secure` (prod), `SameSite=Lax/None`** cookie
5. Response returns the public user object (never the password hash)

### 2.2 Login Flow
1. Client submits `{ email, password }` to `POST /api/auth/sign-in/email`
2. BetterAuth verifies credentials against the stored hash
3. On success, a new JWT session cookie is issued (same shape as signup)
4. On failure, a generic `401 Invalid credentials` is returned — **never** reveal whether the email exists (prevents user enumeration)
5. `authLimiter` (Redis-backed, see Section 2.5) caps attempts to slow brute-force

### 2.3 Session Verification (every protected request)
```
Request → cookie parser reads session cookie
        → middlewares/auth.ts calls betterAuth.api.getSession({ headers })
        → valid?  → req.user = { id, email, name } → next()
        → invalid/expired? → AppError.unauthorized() → globalErrorHandler → 401 JSON
```
- No route ever trusts a client-supplied `userId` — it always comes from the verified session
- Every Prisma query in every module is scoped by `where: { userId: req.user.id }`

### 2.4 Logout & Expiry
- `POST /api/auth/sign-out` invalidates the session server-side and clears the cookie
- JWT has a bounded expiry (e.g. 7 days); BetterAuth handles silent rotation/refresh within its session-management layer so an active user isn't logged out mid-session
- Frontend: on any `401` response, redirect to `/login` and clear local auth state, preserving any in-progress form data in local component state where feasible

### 2.5 Auth Hardening
- **Redis-backed rate limiting** (`authLimiter`): 30 attempts / 15 minutes per IP on sign-in/sign-up routes — Redis is required here (not in-memory) because the app may run multiple Docker container replicas, and rate-limit counters must be shared across them
- Passwords never logged, never returned in any API response
- CSRF exposure minimized by `SameSite` cookie policy + verifying `Origin`/`Referer` on state-changing requests

---

## 3. Business Logic Flow

This is the logic most likely to have subtle bugs if re-implemented carelessly — documented precisely so it is built once, correctly.

### 3.1 Money Math
```
round2(n) = Math.round((n + Number.EPSILON) * 100) / 100
```
Invoice total, computed in this exact order:
1. Per line item: `amount = round2(quantity × rate)`
2. `subtotal = round2(Σ amount)`
3. `discount = min(round2(discountInput), subtotal)` — **never** let discount exceed subtotal (prevents negative totals)
4. `taxableBase = round2(subtotal − discount)`
5. `taxAmount = round2(taxableBase × taxRate / 100)`
6. `total = round2(taxableBase + taxAmount)`

All money columns are Prisma `Decimal` (Postgres `NUMERIC(12,2)`) — never `Float`. Decimal values are cast to JS `Number` only at the API boundary (never mid-calculation, to avoid float drift).

### 3.2 Invoice Auto-Numbering (concurrency-safe)
Must execute inside a single Prisma `$transaction`:
```ts
prisma.$transaction(async (tx) => {
  await tx.companySettings.upsert({ where: { userId }, create: { userId }, update: {} });
  const settings = await tx.companySettings.update({
    where: { userId },
    data: { nextSeq: { increment: 1 } },
  });
  const seq = settings.nextSeq - 1;
  return `${settings.invoicePrefix}${String(seq).padStart(4, "0")}`;
});
```
The atomic `increment` inside a transaction guarantees two concurrent invoice-creation requests can never receive the same number — this is a **hard requirement**, not an optimization.

### 3.3 Effective Status (computed, not stored)
```
if status === "paid": return "paid"
if status === "sent" && dueDate < today (date-only comparison): return "overdue"
else: return status
```
`overdue` is **never written to the database** — it's derived on every read. This removes the need for a cron job and guarantees the value is never stale.

### 3.4 Settings "Ensure" Pattern
`CompanySettings.ensure(userId)`: `upsert` with an empty `update: {}` — creates a default-valued row on first need, otherwise returns the existing row untouched. Avoids special-casing settings creation at signup.

### 3.5 Settings Update — Whitelist Pattern
Only a fixed, explicit set of fields (`companyName`, `logoUrl`, `address`, `email`, `phone`, `currency`, `taxRate`, `invoicePrefix`, `accentColor`) may ever be written by a user-facing update call. `nextSeq`, `userId`, and timestamps are **never** accepted from client input — this whitelist is the only thing standing between a crafted request and a corrupted invoice-numbering sequence.

### 3.6 Payment Reconciliation
On inserting a `Payment` row, inside the same transaction:
```
paidSoFar = SUM(payments.amount WHERE invoiceId = X)
if paidSoFar >= invoice.total:
    invoice.status = "paid"; invoice.paidAt = now()
```
Must be transactional with the insert — a crash between the two steps must never leave an invoice fully paid in substance but `sent` in the database.

### 3.7 Line-Item Replace Strategy
Editing an invoice's items uses **delete-all-then-reinsert** (`deleteMany` on `invoiceItems` where `invoiceId`, then `createMany`) inside a transaction — simpler and safe at this data volume, and safe because `InvoiceItem.invoiceId` cascades on delete.

### 3.8 AI Prompt Discipline
- Every AI call starts by checking AI is configured (`requireAI()`) — fail fast, fail soft
- AI is always given **real, DB-computed data** — never asked to invent figures
- Temperature is tuned per task: `0.1` (receipt parsing — accuracy-critical, uses a JSON response schema, output re-validated with Zod before use) · `0.5` (business summary) · `0.6` (payment reminders) · `0.7` (notes/descriptions — pure writing task)
- AI output is always a **draft** — nothing is persisted to the database without explicit user confirmation

---

## 4. Core Functionality

### 4.1 MVP (Week 1, Must-have)
| # | Feature | Notes |
|---|---|---|
| 1 | Auth (BetterAuth: signup, login, logout, session persistence) | Section 2 |
| 2 | Client CRUD | Scoped per user |
| 3 | Invoice Builder — line items, live totals, tax/discount | Section 3.1 |
| 4 | Auto-numbering & status (draft/sent/paid/overdue) | Section 3.2, 3.3 |
| 5 | Payments ledger with auto-reconciliation | Section 3.6 |
| 6 | PDF export | Server-rendered, downloadable |
| 7 | Minimal dashboard — revenue, outstanding, overdue count | Redis-cached (Section 10) |

### 4.2 Should-have (Week 2–3)
- Reusable service/product catalog items
- Expense logging by category with monthly totals
- AI-drafted payment reminder emails (tone-selectable)
- AI-written line-item descriptions / payment terms

### 4.3 Could-have (Later phase)
- AI receipt scanning (image/PDF → expense or invoice draft)
- AI plain-English monthly business summary
- CSV export of reports
- Receivables aging + top-clients analytics

### 4.4 Out-of-Scope (v1)
Online payment gateway integration (Stripe/bKash/Nagad) · multi-user/team seats or roles · recurring/subscription invoices · multi-language UI · outbound email-sending infrastructure (AI drafts text; sending is copy-paste) · CSV export/aging analytics (deferred) · AI receipt scanning (deferred — most fragile under a free API quota) · paid subscription billing mechanics · native mobile app.

---

## 5. Product Data Model (PRD Style)

### 5.1 Entities

| Entity | Purpose |
|---|---|
| `User` | Account owner — identity, managed by BetterAuth + Prisma |
| `CompanySettings` | 1:1 business profile per user — branding, tax, invoice numbering state |
| `Client` | A user's customers |
| `Invoice` | Invoice header — totals, status, dates |
| `InvoiceItem` | Line items belonging to an invoice |
| `CatalogItem` | Reusable service/product templates |
| `Expense` | Business expense log |
| `Payment` | Payments recorded against invoices |

### 5.2 Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o| COMPANY_SETTINGS : has
    USER ||--o{ CLIENT : owns
    USER ||--o{ CATALOG_ITEM : owns
    USER ||--o{ EXPENSE : logs
    USER ||--o{ INVOICE : creates
    USER ||--o{ PAYMENT : records
    CLIENT ||--o{ INVOICE : "billed via"
    INVOICE ||--o{ INVOICE_ITEM : contains
    INVOICE ||--o{ PAYMENT : "paid via"

    USER {
        string id PK
        string email
        string name
    }
    COMPANY_SETTINGS {
        string userId PK_FK
        string companyName
        string currency
        decimal taxRate
        string invoicePrefix
        int nextSeq
    }
    CLIENT {
        string id PK
        string userId FK
        string name
        string email
    }
    INVOICE {
        string id PK
        string userId FK
        string clientId FK
        string invoiceNumber
        string status
        date dueDate
        decimal total
    }
    INVOICE_ITEM {
        string id PK
        string invoiceId FK
        string description
        decimal quantity
        decimal rate
        decimal amount
    }
    CATALOG_ITEM {
        string id PK
        string userId FK
        string name
        decimal rate
    }
    EXPENSE {
        string id PK
        string userId FK
        string vendor
        string category
        decimal amount
    }
    PAYMENT {
        string id PK
        string userId FK
        string invoiceId FK
        decimal amount
        string method
        date paidOn
    }
```

### 5.3 Prisma Schema (authoritative)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // NeonDB connection string
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // BetterAuth-managed relations (sessions, accounts) omitted here —
  // generated by the BetterAuth Prisma adapter CLI.

  companySettings CompanySettings?
  clients         Client[]
  invoices        Invoice[]
  catalogItems    CatalogItem[]
  expenses        Expense[]
  payments        Payment[]

  @@map("users")
}

model CompanySettings {
  userId        String   @id
  companyName   String   @default("")
  logoUrl       String   @default("")
  address       String   @default("")
  email         String   @default("")
  phone         String   @default("")
  currency      String   @default("BDT")
  taxRate       Decimal  @default(0) @db.Decimal(6, 3)
  invoicePrefix String   @default("INV-")
  nextSeq       Int      @default(1)
  accentColor   String   @default("")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("company_settings")
}

model Client {
  id        String   @id @default(cuid())
  userId    String
  name      String
  email     String   @default("")
  company   String   @default("")
  phone     String   @default("")
  address   String   @default("")
  notes     String   @default("")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  invoices Invoice[]

  @@index([userId])
  @@map("clients")
}

model Invoice {
  id            String    @id @default(cuid())
  userId        String
  clientId      String?
  invoiceNumber String
  status        String    @default("draft") // draft | sent | paid
  issueDate     DateTime  @default(now()) @db.Date
  dueDate       DateTime? @db.Date
  currency      String    @default("BDT")
  taxRate       Decimal   @default(0) @db.Decimal(6, 3)
  discount      Decimal   @default(0) @db.Decimal(12, 2)
  subtotal      Decimal   @default(0) @db.Decimal(12, 2)
  taxAmount     Decimal   @default(0) @db.Decimal(12, 2)
  total         Decimal   @default(0) @db.Decimal(12, 2)
  notes         String    @default("")
  terms         String    @default("")
  paidAt        DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user     User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  client   Client?       @relation(fields: [clientId], references: [id], onDelete: SetNull)
  items    InvoiceItem[]
  payments Payment[]

  @@unique([userId, invoiceNumber])
  @@index([userId])
  @@index([clientId])
  @@map("invoices")
}

model InvoiceItem {
  id          String  @id @default(cuid())
  invoiceId   String
  description String  @default("")
  quantity    Decimal @default(1) @db.Decimal(12, 2)
  rate        Decimal @default(0) @db.Decimal(12, 2)
  amount      Decimal @default(0) @db.Decimal(12, 2)
  position    Int     @default(0)

  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
  @@map("invoice_items")
}

model CatalogItem {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String   @default("")
  rate        Decimal  @default(0) @db.Decimal(12, 2)
  unit        String   @default("")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("catalog_items")
}

model Expense {
  id          String   @id @default(cuid())
  userId      String
  vendor      String   @default("")
  category    String   @default("General")
  expenseDate DateTime @default(now()) @db.Date
  amount      Decimal  @default(0) @db.Decimal(12, 2)
  currency    String   @default("BDT")
  notes       String   @default("")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("expenses")
}

model Payment {
  id        String   @id @default(cuid())
  userId    String
  invoiceId String
  amount    Decimal  @default(0) @db.Decimal(12, 2)
  method    String   @default("")
  paidOn    DateTime @default(now()) @db.Date
  notes     String   @default("")
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([invoiceId])
  @@map("payments")
}
```

---

## 6. Relationship Summary

| Relationship | Type | Delete behavior |
|---|---|---|
| User → CompanySettings | 1 : 1 | Cascade — settings deleted with user |
| User → Client | 1 : N | Cascade |
| User → CatalogItem | 1 : N | Cascade |
| User → Expense | 1 : N | Cascade |
| User → Invoice | 1 : N | Cascade |
| User → Payment | 1 : N | Cascade |
| Client → Invoice | 1 : N | **SetNull** — deleting a client preserves invoice history |
| Invoice → InvoiceItem | 1 : N | Cascade |
| Invoice → Payment | 1 : N | Cascade |

**Why `SetNull` on `Client → Invoice`:** revenue history must survive a client being deleted. Every other relationship cascades because those child records are meaningless without their parent user/invoice.

---

## 7. Business Rules

1. **Tenant isolation is absolute.** Every query in every module filters by `userId` from the verified session — never from a client-supplied parameter. No exceptions, ever.
2. **`company_settings.userId` is a 1:1 primary key.** A user can never have more than one settings row.
3. **Discount can never exceed subtotal.** Enforced in `computeTotals`, not just in the UI.
4. **Invoice numbers are unique per user** (`@@unique([userId, invoiceNumber])`) and assigned only via the atomic transaction in Section 3.2 — never assigned client-side or guessed.
5. **`overdue` is a computed status, never a stored one.** Only `draft | sent | paid` are ever written to `Invoice.status`.
6. **A payment cannot un-pay an invoice.** Reconciliation only moves a status toward `paid`; there is no automatic downgrade path (manual correction is an admin/future concern).
7. **Deleting a client never deletes financial history.** Invoices survive with `clientId = null`.
8. **AI never invents numbers.** Every AI call is seeded only with data already computed from the database.
9. **AI output is always a draft.** No AI response is written to the database without explicit user confirmation.
10. **Free-tier AI quota is a shared, app-wide resource**, not a per-user allocation — rate limits (Section 8) must be tuned conservatively below the provider's ceiling.
11. **Money is never a `Float`.** All monetary values are `Decimal`/`NUMERIC(12,2)` end-to-end; conversion to JS `Number` happens only at the API response boundary.

---

## 8. API Endpoints

All routes are prefixed `/api`. Protected routes require a valid session cookie (Section 2).

```
Auth (BetterAuth-managed)
POST   /api/auth/sign-up/email
POST   /api/auth/sign-in/email
POST   /api/auth/sign-out
GET    /api/auth/get-session

Clients
GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PATCH  /api/clients/:id
DELETE /api/clients/:id

Invoices
GET    /api/invoices
POST   /api/invoices
GET    /api/invoices/:id
PATCH  /api/invoices/:id
DELETE /api/invoices/:id
GET    /api/invoices/:id/pdf

Payments
POST   /api/invoices/:id/payments
GET    /api/invoices/:id/payments

Catalog Items
GET    /api/items
POST   /api/items
PATCH  /api/items/:id
DELETE /api/items/:id

Expenses
GET    /api/expenses
POST   /api/expenses
PATCH  /api/expenses/:id
DELETE /api/expenses/:id
GET    /api/expenses/summary?month=YYYY-MM

Settings
GET    /api/settings
PATCH  /api/settings

Dashboard
GET    /api/dashboard          # revenue, outstanding, overdue count (Redis-cached)

Reports (Should-have)
GET    /api/reports/revenue-vs-expense
GET    /api/reports/export.csv

AI (rate-limited, free-tier aware)
POST   /api/ai/business-summary
POST   /api/ai/payment-reminder
POST   /api/ai/write-note
POST   /api/ai/receipt-parse    # multipart upload via middlewares/upload.ts

System
GET    /api/health
```

---

## 9. Project Structure

Modular, feature-first architecture (TypeScript), adapted from the team's established module pattern:

```
src/
├── config/
│   └── index.ts                    # env vars: DATABASE_URL, REDIS_URL, BETTER_AUTH_SECRET, GEMINI_API_KEY, isProd
├── lib/
│   ├── prisma.ts                   # Prisma client singleton (NeonDB connection, pooled)
│   ├── redis.ts                    # ioredis client — rate-limit store + dashboard cache
│   ├── auth.ts                     # BetterAuth instance config (JWT plugin, cookie options)
│   └── cloudinary.ts               # Cloudinary SDK config (logo uploads)
├── errors/
│   ├── AppError.ts                 # custom error class + static HTTP-code shortcuts
│   ├── handlePrismaError.ts        # maps Prisma known errors (P2002 unique, P2025 not found, ...)
│   ├── handlePrismaValidationError.ts
│   └── handleZodError.ts           # formats Zod validation issues
├── interface/
│   └── error.ts                    # shared error/response type definitions
├── middlewares/
│   ├── auth.ts                     # session verification via BetterAuth + req.user
│   ├── rateLimiter.ts              # Redis-backed aiLimiter, authLimiter
│   ├── upload.ts                   # Multer config (memory storage, file filter, size limit)
│   ├── globalErrorHandler.ts       # central error → JSON response formatter
│   ├── notFound.ts                 # 404 handler
│   └── validateRequest.ts          # Zod validation middleware
├── modules/
│   ├── Auth/                        # thin wrapper routes around BetterAuth handler
│   │   └── auth.route.ts
│   ├── Client/
│   │   ├── client.controller.ts
│   │   ├── client.route.ts
│   │   ├── client.service.ts
│   │   ├── client.interface.ts
│   │   └── client.validation.ts
│   ├── Company/                     # CompanySettings module
│   │   ├── company.controller.ts
│   │   ├── company.route.ts
│   │   ├── company.service.ts       # ensure(), update() whitelist logic
│   │   └── company.validation.ts
│   ├── Invoice/
│   │   ├── invoice.controller.ts
│   │   ├── invoice.route.ts
│   │   ├── invoice.service.ts       # computeTotals, nextInvoiceNumber, effectiveStatus
│   │   ├── invoice.utils.ts         # round2, serializeInvoice
│   │   ├── invoice.interface.ts
│   │   └── invoice.validation.ts
│   ├── Payment/
│   │   ├── payment.controller.ts
│   │   ├── payment.route.ts
│   │   ├── payment.service.ts       # reconciliation logic (Section 3.6)
│   │   └── payment.validation.ts
│   ├── CatalogItem/
│   │   ├── catalogItem.controller.ts
│   │   ├── catalogItem.route.ts
│   │   ├── catalogItem.service.ts
│   │   └── catalogItem.validation.ts
│   ├── Expense/
│   │   ├── expense.controller.ts
│   │   ├── expense.route.ts
│   │   ├── expense.service.ts
│   │   └── expense.validation.ts
│   ├── Dashboard/
│   │   ├── dashboard.controller.ts
│   │   ├── dashboard.route.ts
│   │   └── dashboard.service.ts     # Redis-cached aggregate queries
│   ├── Report/
│   │   ├── report.controller.ts
│   │   ├── report.route.ts
│   │   └── report.service.ts
│   └── AI/
│       ├── ai.controller.ts
│       ├── ai.route.ts
│       ├── ai.service.ts            # Gemini calls: businessSummary, parseReceipt, writeNote, paymentReminder
│       └── ai.validation.ts
├── routes/
│   └── index.ts                     # route aggregator — mounts every module router
├── utils/
│   ├── catchAsync.ts                # async error wrapper
│   └── sendResponse.ts              # standardized response formatter (Section 13)
├── app.ts                           # Express app setup, middleware wiring, BetterAuth mount
└── server.ts                        # server entry point, Prisma/Redis connection bootstrap
```

**Companion root-level structure:**
```
InvoiceFlow/
├── docker-compose.yml       # local Postgres (parity with NeonDB) + Redis + app container
├── Dockerfile
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/                     # as above
├── .env.example
└── package.json
```

---

## 10. Technical Specifications

| Concern | Choice | Rationale |
|---|---|---|
| Database | PostgreSQL via **NeonDB** | Serverless Postgres — branching for preview environments, scales to zero in dev, no server to patch |
| ORM | **Prisma** | Type-safe queries, migrations, and the `Decimal` type needed for money math |
| Auth | **BetterAuth** | Handles password hashing, session/JWT issuance, and cookie security out of the box — avoids hand-rolling `bcrypt`/`jsonwebtoken` glue code |
| Cache / Rate limiting store | **Redis** | Shared, cross-instance store for `authLimiter`/`aiLimiter` counters and dashboard-aggregate caching — required once the app runs behind more than one container |
| Containerization | **Docker** (+ Docker Compose for local dev) | Local Postgres + Redis + app parity with production; single deployable image |
| File uploads | Multer (memory storage) → Cloudinary | Receipt images and company logos; memory storage avoids disk I/O concerns in ephemeral containers |
| Validation | Zod | Shared validation schemas between request validation and AI response schema validation |
| AI provider | Gemini API (free tier) | See Section 7, rule 10, and Section 14 risk notes |

### 10.1 Redis Usage (specific)
- **Rate limiting:** `aiLimiter` (15 req/min per user), `authLimiter` (30 req/15min per IP) — counters stored as Redis keys with TTL, shared across all app instances
- **Dashboard caching:** `GET /api/dashboard` aggregate result cached per user for ~60 seconds to avoid recomputing revenue/outstanding sums on every page load

### 10.2 Docker Usage (specific)
- `docker-compose.yml` runs: `app` (Node/Express), `postgres` (local dev parity — production uses NeonDB directly), `redis`
- Production deploys the `app` image only, pointed at NeonDB + a managed/hosted Redis instance

---

## 11. Dependencies

**Backend (`package.json`, indicative)**
```
express, typescript, ts-node-dev
prisma, @prisma/client
better-auth
ioredis
zod
multer
cloudinary
cors, cookie-parser, helmet, morgan
```

**Frontend**
```
react, vite, react-router-dom
axios
tailwindcss
zod (shared validation shapes with backend, optional)
recharts or chart.js (dashboard charts)
```

**Dev/Infra**
```
docker, docker-compose
eslint, prettier
```

---

## 12. Business Logic Rules

*(Code-level enforcement rules, distinct from the domain rules in Section 7 — these govern how the code itself must behave.)*

1. **No silent catch blocks.** Every error either becomes an `AppError` with a correct HTTP status or is passed to `next(err)` for `globalErrorHandler` to format — never swallowed.
2. **Every mutating route call is wrapped in `catchAsync`.** No bare `async (req, res) => {}` route handlers.
3. **Prisma errors are translated, not leaked.** `handlePrismaError.ts` maps known Prisma error codes (e.g. `P2002` unique constraint → 409 Conflict, `P2025` not found → 404) into `AppError` before they reach the client — a raw Prisma stack trace must never reach an HTTP response.
4. **Zod validation happens before any DB or AI call**, via `validateRequest` middleware — reject cheap, before spending a DB round-trip or an AI-quota unit.
5. **All monetary calculations happen server-side.** The frontend may preview totals for UX responsiveness, but the persisted total is always recalculated server-side from the submitted line items — never trust a client-computed total.
6. **Transactions wrap every multi-step write** (invoice numbering, payment reconciliation, line-item replace) — see Section 3.

---

## 13. Response Format

All API responses use a single, consistent envelope via `utils/sendResponse.ts`:

**Success**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": { "...": "..." },
  "meta": { "page": 1, "limit": 20, "total": 47 }
}
```
`meta` is included only for paginated list endpoints; omitted otherwise.

**Error** (produced by `globalErrorHandler`)
```json
{
  "success": false,
  "message": "Invoice not found",
  "errorDetails": null,
  "stack": "... (development only, stripped in production)"
}
```
- `errorDetails` carries structured Zod field errors when applicable (e.g. `{ "field": "email", "issue": "Invalid email" }`)
- `stack` is present only when `config.isProd === false`

---

## 14. Deployment Checklist

- [ ] `DATABASE_URL` points to the NeonDB production branch (not a dev branch)
- [ ] `BETTER_AUTH_SECRET`, `GEMINI_API_KEY`, `CLOUDINARY_*` set as production secrets (never committed)
- [ ] Redis instance provisioned (managed Redis, not the Docker Compose local one) and `REDIS_URL` set
- [ ] `prisma migrate deploy` run against production DB before first request
- [ ] Cookie flags confirmed: `Secure: true`, correct `SameSite` for the deployed frontend/backend domain relationship
- [ ] CORS `origin` locked to the actual frontend domain — not `*`
- [ ] `aiLimiter`/`authLimiter` thresholds re-verified against the current Gemini free-tier quota before go-live
- [ ] `/api/health` returns 200 and is wired to the hosting platform's health check
- [ ] Error responses confirmed to strip `stack` traces in production
- [ ] Database backup/point-in-time-recovery confirmed available via NeonDB's branching/restore feature
- [ ] Smoke test the full core loop end-to-end in the deployed environment: signup → client → invoice → payment → PDF

---

## 15. Future Considerations (Post-v1)

- **Monetization:** pricing tiers, subscription billing (likely via a payment provider webhook, once online payments are in scope)
- **AI quota strategy:** upgrade path off the free Gemini tier once usage approaches the shared quota ceiling; consider per-user AI usage caps independent of the provider's own limits
- **Online payment collection:** Stripe and/or local rails (bKash, Nagad) for automated invoice payment, replacing manual payment recording
- **Team accounts:** multi-seat access with role-based permissions (owner/accountant/viewer)
- **Recurring invoices:** scheduled auto-generation for retainer-style clients
- **Localization:** Bangla/Hindi UI, locale-aware number/date formatting
- **Advanced analytics:** receivables aging, top-clients, cohort revenue retention
- **Native mobile app:** if usage patterns show significant mobile-only demand beyond the responsive web app

---

## Appendix: Frontend Design Inspiration

Since InvoiceFlow's backend is a clients/invoices/payments/dashboard structure, the most relevant UI references are invoice-specific SaaS dashboards rather than generic admin templates. A few strong starting points (searchable directly — Pinterest boards change too often to link reliably, but these sources are curated and stable):

- **Dribbble — "Invo: Invoice Tracker Dashboard"** by Irfan Baig — a clean invoice/revenue dashboard concept matching this PRD's dashboard scope (revenue trend, outstanding, payment overview)
- **Dribbble — "InvoicePilot: AI-Powered Invoice Automation Dashboard"** — closely matches the AI + invoicing combination in this PRD
- **Dribbble — search tag "invoices"** (dribbble.com/tags/invoices) — a continuously updated feed of invoice-specific UI concepts
- **SaaSUI (saasui.design)** — curated *real, shipped* SaaS dashboard screens organized by screen type (dashboards, settings, empty states) — more reliable than concept shots for a real build
- **Mobbin (mobbin.com)** — full real app flows, useful for seeing an entire invoice-creation flow screen-by-screen, not just a hero shot

**For Pinterest specifically:** Pinterest's own search works best directly in-app/in-browser since boards are curated by individuals and change constantly — searching `"invoice dashboard UI"`, `"SaaS invoice app design"`, or `"invoice mobile app UI"` directly on pinterest.com will surface current, relevant boards; a static link here would go stale quickly.
