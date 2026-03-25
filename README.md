# AuraInventory — Multi-Tenant Inventory Management System

A full-stack inventory management system built as part of a technical assessment. It supports multiple tenants with isolated data, and covers product catalog management, inventory tracking, and order processing with business rule enforcement.

GitHub: [https://github.com/HARSHA123361/INVENTORY-MANAGEMENT-SYSTEM](https://github.com/HARSHA123361/INVENTORY-MANAGEMENT-SYSTEM)

---

## What I Built

A multi-tenant web application where each tenant (organization) has its own isolated view of:

- **Tenants** — create and manage organizational scopes
- **Products** — define a product catalog with SKU, category, cost, and reorder thresholds
- **Inventory** — track stock levels per product, with low-stock alerts
- **Orders** — place orders against active products with automatic status assignment based on available inventory

### Key Business Rules

- Only `Active` products can be ordered
- If `inventory >= requested quantity` → order status is `Created`
- If `inventory < requested quantity` → order status is `Pending`
- Confirming an order deducts inventory; cancelling leaves it unchanged
- Confirmed or Cancelled orders cannot be edited or re-transitioned
- Creating a product automatically creates its inventory record (starting at 0)
- Tenant names must be unique (enforced at DB and service layer)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| State Management | Redux Toolkit, RTK Query |
| Styling | Tailwind CSS, Framer Motion |
| Icons | Lucide React |
| Backend | Node.js, Express 5 |
| Database | SQLite (via sqlite3) |
| ORM/Query | Raw SQL with a pg-compatible pool wrapper |
| Routing | React Router v6 |

---

## Project Structure

```
├── client/                  # React frontend
│   └── src/
│       ├── api/             # RTK Query endpoint definitions
│       ├── components/
│       │   ├── layout/      # AppLayout, Sidebar, Header
│       │   └── shared/      # ActionMenu, Pagination, StatusBadge, etc.
│       ├── pages/
│       │   ├── tenants/
│       │   ├── products/
│       │   ├── inventory/
│       │   └── orders/
│       └── store/           # Redux store + tenantSlice
│
└── server/                  # Express backend
    ├── controllers/         # Request handling
    ├── services/            # Business logic
    ├── repositories/        # Database queries
    ├── routes/              # Express routers
    ├── middleware/          # Error handler
    ├── db/
    │   ├── pool.js          # SQLite connection + pg-compatible interface
    │   ├── migrations/      # Schema SQL
    │   └── seed.js          # Initial data
    └── utils/               # Response helpers
```

---

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher

---

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/HARSHA123361/INVENTORY-MANAGEMENT-SYSTEM.git
cd INVENTORY-MANAGEMENT-SYSTEM
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file (optional — defaults work out of the box):

```bash
cp .env.example .env
```

Initialize the database and seed sample data:

```bash
npm run db:init
```

This creates the SQLite database at `server/db/inventory.db` and inserts:
- 3 tenants: `Acme Corp`, `Global Tech`, `Nexus Industries`
- 6 products across those tenants
- Inventory records for each product

Start the server:

```bash
npm start
```

Server runs at `http://localhost:3001`

### 3. Set up the client

Open a new terminal tab:

```bash
cd client
npm install
npm run dev
```

Client runs at `http://localhost:5173`

### 4. Open the app

Go to [http://localhost:5173](http://localhost:5173) in your browser.

---

## Using the App

1. Navigate to **Tenants** and select or create a tenant
2. Use the **Tenant Dropdown** (top right of each list page) to scope data
3. Go to **Products** to add items to the catalog
4. Go to **Inventory** to view and update stock levels
5. Go to **Orders** to place orders — the system automatically sets status based on available stock
6. From an Order Detail page, use **Confirm** or **Cancel** to process the order

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tenants` | List tenants (search, sort, paginate) |
| POST | `/api/tenants` | Create tenant |
| PUT | `/api/tenants/:id` | Update tenant |
| DELETE | `/api/tenants/:id` | Delete tenant |
| GET | `/api/products?tenant_id=` | List products for tenant |
| GET | `/api/products/active?tenant_id=` | Active products only (for order form) |
| POST | `/api/products` | Create product (auto-creates inventory) |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/inventory?tenant_id=` | List inventory for tenant |
| GET | `/api/inventory/:id` | Get single inventory record |
| PUT | `/api/inventory/:id` | Update stock quantity |
| DELETE | `/api/inventory/:id` | Delete inventory record |
| GET | `/api/orders?tenant_id=` | List orders for tenant |
| GET | `/api/orders/:id` | Get order detail |
| POST | `/api/orders` | Create order (applies Created/Pending logic) |
| PUT | `/api/orders/:id` | Confirm, Cancel, or revise an order |
| DELETE | `/api/orders/:id` | Delete order |

---

## Architecture

The backend follows a strict layered pattern:

```
Request → Route → Controller → Service → Repository → SQLite
```

- **Routes** — define HTTP method and path, delegate to controller
- **Controllers** — parse request params/body, call service, send response
- **Services** — enforce business rules (active product check, inventory validation, status transitions)
- **Repositories** — all SQL queries, no business logic

Multi-tenancy is enforced at every layer — `tenant_id` is required on all scoped queries and validated in the service layer before any DB operation.

---

## How We Built This

### 1. Planning & Requirements Analysis

Started by reading through the full assignment requirements document carefully. Mapped out the four core entities — Tenant, Product, Inventory, Order — and their relationships before writing a single line of code. Identified the key business rules upfront (active-only ordering, Created vs Pending status logic, inventory deduction on confirm) so the data model and service layer could be designed around them from the start.

### 2. Database Design

Designed the SQLite schema first with all four tables and proper foreign key constraints:

- `tenants` — top-level organizational scope
- `products` — scoped to a tenant, with SKU uniqueness per tenant
- `inventory` — 1-to-1 with products, auto-created when a product is added
- `orders` — scoped to a tenant, references a product, status constrained via CHECK

Used a `pg`-compatible pool wrapper around SQLite so the query interface (`pool.query(sql, params)`) mirrors PostgreSQL — making a future migration to Postgres straightforward without touching any repository code.

### 3. Backend — Layered Architecture

Built the server following a strict separation of concerns:

- **Routes** — thin, just map HTTP verbs to controller functions
- **Controllers** — parse and normalize request inputs (handle both camelCase and snake_case field names from the client), call the service, return a consistent `{ data, meta }` response shape
- **Services** — all business logic lives here: duplicate name checks, active product validation, inventory comparison, status transition guards
- **Repositories** — pure SQL, no logic, just parameterized queries against the database

This pattern makes each layer independently testable and easy to reason about.

### 4. Frontend — React + Redux

Scaffolded the React app with Vite and set up the global layout first (sidebar, header) so every page had a consistent shell to drop into.

Used **RTK Query** for all API calls — it handles caching, loading states, and cache invalidation automatically. For example, creating an order invalidates both the `Order` and `Inventory` tags, so the inventory list refreshes without any manual refetch calls.

**Redux** stores the selected `tenant_id` globally so every page and API call can read it from the store without prop drilling.

Built shared components (`ActionMenu`, `Pagination`, `StatusBadge`, `ConfirmDialog`, `TenantDropdown`) once and reused them across all four modules.

### 5. Multi-Tenancy

Every list page (Products, Inventory, Orders) includes a `TenantDropdown` in the top right. Selecting a tenant updates the Redux store, which triggers all active RTK Query hooks to re-fetch with the new `tenant_id`. Data never leaks across tenants because:

- The frontend always passes `tenant_id` as a query param
- The service layer throws a 400 if `tenant_id` is missing
- All repository queries filter by `tenant_id` or join through a tenant-scoped table

### 6. Business Logic Implementation

The core order logic in `orderService.js`:

```
createOrder:
  1. Fetch product → must exist and be Active
  2. Fetch inventory for that product
  3. If inventory >= quantity → status = 'Created'
     If inventory <  quantity → status = 'Pending'

updateOrder (Confirm):
  1. Fetch existing order → must be Created or Pending
  2. Check inventory again at confirm time
  3. If sufficient → deduct inventory, set status = 'Confirmed'
  4. If insufficient → block with 400 error
```

### 7. UI & Styling

Used **Tailwind CSS** for all styling with a consistent violet/indigo design system. Added **Framer Motion** for smooth page transitions and row animations. Used **Lucide React** for icons throughout.

The design prioritizes clarity — status badges are color-coded (green = Active/Created, amber = Pending, red = Cancelled/Inactive), low-stock items are highlighted in the inventory list, and the header shows a live notification bell for items at or below their reorder threshold.

### 8. Assumptions, Gaps & Design Decisions

The requirements left several areas open to interpretation. Below are every assumption made and every gap addressed, along with the reasoning — ready to discuss at the interview.

---

#### Database & Backend

**SQLite instead of PostgreSQL**
The requirements listed PostgreSQL as preferred but said "any RDBMS" is acceptable. SQLite was chosen for zero-setup local development — no database server to install or configure. The pool layer (`db/pool.js`) wraps SQLite with a `pg`-compatible interface (`pool.query(sql, params)`), so migrating to PostgreSQL requires changing only that one file.

**Inventory auto-created on product creation**
The requirements did not specify when an inventory record should be created. We assumed it should be created automatically (with `quantity = 0`) at the same time as the product, inside a transaction. This ensures every product always has a corresponding inventory row and avoids null-reference errors when checking stock.

**Effective available stock = inventory − committed Created orders**
The requirements say "if inventory >= requested quantity → Created". This is ambiguous when multiple orders exist for the same product. We interpreted "inventory" as the *effective available* quantity — raw stock minus the sum of all existing `Created` orders for that product. This prevents over-committing stock across multiple simultaneous orders. The same logic is applied on the frontend display so the user sees the real available number before submitting.

**Confirming an order deducts inventory; creating does not**
The requirements only say to check inventory at creation time and assign a status. We assumed the actual stock deduction happens at `Confirm`, not at `Create`. This mirrors real-world warehouse behaviour where a `Created` order is a reservation intent, and `Confirmed` is the physical commitment.

**Pending orders can still be confirmed later**
The requirements do not say what happens to `Pending` orders after stock is replenished. We assumed a `Pending` order can be confirmed at any time — the system re-checks inventory at confirm time. If stock has been restocked since the order was placed, confirmation succeeds.

**Confirmed and Cancelled orders are terminal states**
The requirements do not explicitly say these are final. We assumed `Confirmed` and `Cancelled` are terminal — no further edits or status changes are allowed. This prevents inventory from being double-deducted or incorrectly restored.

**Deleting a product cascades to inventory and orders**
The requirements do not specify cascade behaviour. We used `ON DELETE CASCADE` on both `inventory` and `orders` foreign keys to `products`. This means deleting a product removes its inventory record and all associated orders. This was chosen over soft-delete for simplicity at assignment scope.

**SKU uniqueness is per-tenant, not global**
The requirements say SKU is a required field but do not specify uniqueness scope. We enforced `UNIQUE(tenant_id, sku)` at the database level — the same SKU can exist across different tenants but not within the same tenant.

---

#### Frontend & UX

**Tenant selection via dropdown, not authentication**
The requirements specify a Tenant Dropdown on every list page but do not mention login or session management. We assumed tenant scoping is done via UI selection stored in Redux, not via authenticated sessions. The selected tenant persists across page navigation within the same browser session.

**Inventory Edit navigates to the Detail page**
The requirements specify an action menu with `View`, `Edit`, and `Delete` on the Inventory list. There is no separate Inventory Edit form — the Detail page contains the inline stock update form. Both `View` and `Edit` in the action menu navigate to the same Detail page, which serves both purposes. This was a deliberate UX decision to avoid a redundant page.

**No separate Inventory Create page**
The requirements do not mention creating inventory records manually. Since inventory is auto-created with each product, there is no "Add Inventory" flow. Users manage stock levels through the Inventory Detail update form.

**Order Edit only allows revising product and quantity**
The requirements mention an Edit option for orders but do not define what fields are editable. We assumed only `product` and `quantity` can be revised (for `Created` or `Pending` orders), and the status is automatically re-evaluated. `Confirmed` and `Cancelled` orders cannot be edited.

**Tenant status toggle on Create form**
The requirements only mention `Tenant Name *` as a required field for creating a tenant. We added an optional `Status` toggle (Active/Inactive) on the create form as well, defaulting to `Active`. This was added for completeness since the field exists in the schema.

**No authentication or role-based access control**
The requirements do not mention authentication. No login, JWT, or RBAC was implemented. All API endpoints are open. This is noted as a production gap but is out of scope for this assessment.

**No import/export functionality**
The requirements explicitly state "there is no Import/Export functionality" for Products. This was respected — no CSV upload or download buttons exist anywhere in the app.

**No global top search bar**
The requirements explicitly say "Remove the global top search bar from all pages." The header contains only the app logo, a low-stock notification bell, and the user avatar. Each list page has its own local search input.

**Tenant List does not have a Tenant Dropdown**
The requirements say every list page for Products, Inventory, and Orders must have a Tenant Dropdown. The Tenant List itself is the source of tenants and does not need one — this was intentional and matches the wireframe reference.

**Performance metrics and projected out-of-stock on detail pages are placeholder UI**
The Product Detail page shows a bar chart ("Performance Metrics") and the Inventory Detail shows "Projected Out-of-Stock: ~14 Days". These are static placeholder visuals. The requirements do not specify analytics data, so real data was not wired up. These are clearly marked as UI enhancements and would be replaced with real data in a production system.

---

## Live Demo

[https://inventory-management-system-alpha-ten.vercel.app](https://inventory-management-system-alpha-ten.vercel.app)

---

## Deployment Architecture

The application is deployed using a split hosting approach — frontend and backend on separate platforms, with a cloud-hosted database.

```
Browser
  │
  ▼
Vercel (React frontend)
  │  HTTPS API calls
  ▼
Railway (Node.js / Express backend)
  │  libsql protocol
  ▼
Turso (Hosted SQLite database)
```

### Frontend — Vercel

The React client is deployed on Vercel, connected directly to the GitHub repository. Every push to `main` triggers an automatic redeploy. Vercel handles CDN distribution, HTTPS, and SPA routing (via `vercel.json` rewrites so page refreshes work correctly on all routes).

The API base URL is injected at build time via the `VITE_API_URL` environment variable, so the frontend always points to the correct Railway backend.

### Backend — Railway

The Express server is deployed on Railway with the root directory set to `/server`. Railway detects the Node.js app via `nixpacks`, installs dependencies, and runs `node index.js`. Environment variables (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `PORT`) are configured in the Railway dashboard and injected at runtime.

### Database — Turso (Hosted SQLite)

Instead of running a local SQLite file (which would reset on every Railway deployment), the database is hosted on [Turso](https://turso.tech) — a free, globally distributed SQLite-compatible cloud database. The `@libsql/client` package connects to it over HTTPS using a database URL and auth token.

The existing SQLite query interface was preserved — only `db/pool.js` was updated to use the libsql client instead of the local `sqlite3` file. All SQL queries, repositories, services, and controllers remained unchanged.

### Benefits of This Approach

- Data persists across deployments and server restarts — no more reset on refresh
- Zero cost — Vercel free tier, Railway free tier, Turso free tier
- Automatic deploys on every GitHub push — no manual deployment steps
- Frontend and backend scale independently
- SQLite-compatible queries — no migration to a different SQL dialect needed
- Turso's libsql protocol works over HTTPS, so no VPC or private networking required
