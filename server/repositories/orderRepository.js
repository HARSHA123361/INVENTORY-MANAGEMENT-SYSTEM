const pool = require('../db/pool');
const { randomUUID } = require('crypto');

const findAll = async ({ tenantId, search = '', page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  const like = `%${search}%`;
  const { rows } = await pool.query(
    `SELECT o.id, o.tenant_id, o.product_id, o.quantity, o.status, o.created_at,
            p.name AS product_name, p.sku, p.cost_per_unit,
            i.quantity AS inventory_quantity
     FROM orders o
     JOIN products p ON p.id = o.product_id
     LEFT JOIN inventory i ON i.product_id = o.product_id
     WHERE o.tenant_id = $1
       AND (p.name LIKE $2 OR p.sku LIKE $2 OR CAST(o.id AS TEXT) LIKE $2)
     ORDER BY o.created_at DESC
     LIMIT $3 OFFSET $4`,
    [tenantId, like, limit, offset]
  );

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) as count FROM orders o
     JOIN products p ON p.id = o.product_id
     WHERE o.tenant_id = $1
       AND (p.name LIKE $2 OR p.sku LIKE $2 OR CAST(o.id AS TEXT) LIKE $2)`,
    [tenantId, like]
  );

  return { rows, total: parseInt(countRows[0].count) };
};

const findById = async (id, tenantId = null) => {
  let sql = `SELECT o.id, o.tenant_id, o.product_id, o.quantity, o.status, o.created_at,
            p.name AS product_name, p.sku, p.cost_per_unit, p.status AS product_status,
            i.quantity AS inventory_quantity
     FROM orders o
     JOIN products p ON p.id = o.product_id
     LEFT JOIN inventory i ON i.product_id = o.product_id
     WHERE o.id = $1`;
  const params = [id];
  if (tenantId) {
    sql += ` AND o.tenant_id = $2`;
    params.push(tenantId);
  }
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
};

const create = async ({ tenantId, productId, quantity, status }) => {
  const id = randomUUID();
  const { rows } = await pool.query(
    `INSERT INTO orders (id, tenant_id, product_id, quantity, status) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [id, tenantId, productId, quantity, status]
  );
  return rows[0];
};

const update = async (id, { status }) => {
  const { rows } = await pool.query(
    `UPDATE orders SET status = COALESCE($1, status) WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return rows[0] || null;
};

const updateLine = async (id, { productId, quantity, status }) => {
  const { rows } = await pool.query(
    `UPDATE orders SET product_id = $1, quantity = $2, status = $3 WHERE id = $4 RETURNING *`,
    [productId, quantity, status, id]
  );
  return rows[0] || null;
};

const remove = async (id, tenantId = null) => {
  let sql = `DELETE FROM orders WHERE id = $1`;
  const params = [id];
  if (tenantId) {
    sql += ` AND tenant_id = $2`;
    params.push(tenantId);
  }
  sql += ` RETURNING id`;
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
};

const statsForTenant = async (tenantId) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN status = 'Created' THEN 1 ELSE 0 END), 0) AS created,
            COALESCE(SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END), 0) AS pending,
            COALESCE(SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END), 0) AS cancelled
     FROM orders WHERE tenant_id = $1`,
    [tenantId]
  );
  return rows[0];
};

/** Sum of quantities in Created orders for a product (committed but not yet confirmed) */
const committedQtyForProduct = async (productId) => {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(quantity), 0) AS committed
     FROM orders
     WHERE product_id = $1 AND status = 'Created'`,
    [productId]
  );
  return parseInt(rows[0].committed);
};

module.exports = { findAll, findById, create, update, updateLine, remove, statsForTenant, committedQtyForProduct };
