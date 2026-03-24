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
