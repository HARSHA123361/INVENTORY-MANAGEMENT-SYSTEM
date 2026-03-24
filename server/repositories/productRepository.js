const pool = require('../db/pool');
const { randomUUID } = require('crypto');

const findAll = async ({ tenantId, search = '', sort = 'name', order = 'ASC', page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  const allowedSorts = { name: 'p.name', sku: 'p.sku', category: 'p.category', status: 'p.status' };
  const sortCol = allowedSorts[sort] || 'p.name';

  const { rows } = await pool.query(
    `SELECT p.id, p.tenant_id, p.name, p.sku, p.category, p.status,
            p.reorder_threshold, p.cost_per_unit, p.created_at
     FROM products p
     WHERE p.tenant_id = $1
       AND (p.name LIKE $2 OR p.sku LIKE $2)
     ORDER BY ${sortCol} ${order === 'DESC' ? 'DESC' : 'ASC'}
     LIMIT $3 OFFSET $4`,
    [tenantId, `%${search}%`, limit, offset]
  );

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) as count FROM products WHERE tenant_id = $1 AND (name LIKE $2 OR sku LIKE $2)`,
    [tenantId, `%${search}%`]
  );

  return { rows, total: parseInt(countRows[0].count) };
};

const findById = async (id, tenantId = null) => {
  let sql = `SELECT p.*, i.quantity AS inventory_quantity, i.id AS inventory_id
     FROM products p
     LEFT JOIN inventory i ON i.product_id = p.id
     WHERE p.id = $1`;
  const params = [id];
  if (tenantId) {
    sql += ` AND p.tenant_id = $2`;
    params.push(tenantId);
  }
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
};

const findActiveByTenant = async (tenantId) => {
  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.sku, i.quantity
     FROM products p
     LEFT JOIN inventory i ON i.product_id = p.id
     WHERE p.tenant_id = $1 AND p.status = 'Active'
     ORDER BY p.name`,
    [tenantId]
  );
  return rows;
};

const create = async ({ tenantId, name, sku, category, status = 'Active', reorderThreshold, costPerUnit }) => {
  const productId = randomUUID();
  const inventoryId = randomUUID();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO products (id, tenant_id, name, sku, category, status, reorder_threshold, cost_per_unit)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [productId, tenantId, name, sku, category, status, reorderThreshold, costPerUnit]
    );
    const product = rows[0];
    // Auto-create an inventory record
    await client.query(`INSERT INTO inventory (id, product_id, quantity) VALUES ($1, $2, 0)`, [inventoryId, product.id]);
    await client.query('COMMIT');
    return product;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const update = async (id, { name, sku, category, status, reorderThreshold, costPerUnit }) => {
  const { rows } = await pool.query(
    `UPDATE products SET
       name = COALESCE($1, name),
       sku = COALESCE($2, sku),
       category = COALESCE($3, category),
       status = COALESCE($4, status),
       reorder_threshold = COALESCE($5, reorder_threshold),
       cost_per_unit = COALESCE($6, cost_per_unit)
     WHERE id = $7 RETURNING *`,
    [name, sku, category, status, reorderThreshold, costPerUnit, id]
  );
  return rows[0] || null;
};

const remove = async (id) => {
  const { rows } = await pool.query(`DELETE FROM products WHERE id = $1 RETURNING id`, [id]);
  return rows[0] || null;
};

const stats = async (tenantId) => {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS active,
       SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) AS inactive
     FROM products WHERE tenant_id = $1`,
    [tenantId]
  );
  return rows[0];
};

module.exports = { findAll, findById, findActiveByTenant, create, update, remove, stats };
