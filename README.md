# AuraInventory — Multi-Tenant Inventory Management System

A full-stack inventory management system built as part of a technical assessment. It supports multiple tenants with isolated data, and covers product catalog management, inventory tracking, and order processing with business rule enforcement.

GitHub: [https://github.com/HARSHA123361/INVENTORY-MANAGEMENT-SYSTEM](https://github.com/HARSHA123361/INVENTORY-MANAGEMENT-SYSTEM)

---

## What We Built

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

### 8. Assumptions Made

- SQLite was chosen over PostgreSQL for zero-setup local development. The pool wrapper makes swapping to Postgres a one-file change.
- No authentication layer was implemented — the assignment scope focused on multi-tenancy via tenant selection, not user login.
- Inventory records are auto-created (quantity = 0) when a product is created, ensuring every product always has a corresponding inventory row.
- Deleting a product cascades to its inventory and any associated orders (via `ON DELETE CASCADE` in the schema).
- The `Pending` status means "order saved but stock was insufficient at creation time" — it does not block the order from being confirmed later if stock is replenished.
