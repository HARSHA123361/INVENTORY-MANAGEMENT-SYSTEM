const pool = require('../db/pool');

const findAll = async ({ tenantId, search = '', page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  const like = `%${search}%`;
  const { rows } = await pool.query(
    `SELECT i.id, i.product_id, i.quantity, i.updated_at,
            p.name AS product_name, p.sku, p.cost_per_unit, p.reorder_threshold, p.tenant_id
     FROM inventory i
     JOIN products p ON p.id = i.product_id
     WHERE p.tenant_id = $1
       AND (p.name LIKE $2 OR p.sku LIKE $3)
     ORDER BY p.name
     LIMIT $4 OFFSET $5`,
    [tenantId, like, like, limit, offset]
  );

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) as c FROM inventory i JOIN products p ON p.id = i.product_id
     WHERE p.tenant_id = $1 AND (p.name LIKE $2 OR p.sku LIKE $3)`,
    [tenantId, like, like]
  );

  return { rows, total: parseInt(countRows[0].c) };
};

const findById = async (id, tenantId = null) => {
  let sql = `SELECT i.id, i.product_id, i.quantity, i.updated_at,
            p.name AS product_name, p.sku, p.cost_per_unit, p.reorder_threshold,
            p.category, p.status AS product_status, p.tenant_id
     FROM inventory i
     JOIN products p ON p.id = i.product_id
     WHERE i.id = $1`;
  const params = [id];
  if (tenantId) {
    sql += ` AND p.tenant_id = $2`;
    params.push(tenantId);
  }
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
};

const findByProductId = async (productId) => {
  const { rows } = await pool.query(
    `SELECT * FROM inventory WHERE product_id = $1`,
    [productId]
  );
  return rows[0] || null;
};

const update = async (id, quantity) => {
  const { rows } = await pool.query(
    `UPDATE inventory SET quantity = $1, updated_at = datetime('now') WHERE id = $2 RETURNING *`,
    [quantity, id]
  );
  return rows[0] || null;
};

const remove = async (id) => {
  const { rows } = await pool.query(`DELETE FROM inventory WHERE id = $1 RETURNING id`, [id]);
  return rows[0] || null;
};

const statsForTenant = async (tenantId) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS totalItems,
            COALESCE(SUM(CASE WHEN i.quantity <= p.reorder_threshold THEN 1 ELSE 0 END), 0) AS lowStockItems
     FROM inventory i
     JOIN products p ON p.id = i.product_id
     WHERE p.tenant_id = $1`,
    [tenantId]
  );
  return rows[0];
};

module.exports = { findAll, findById, findByProductId, update, remove, statsForTenant };
