const pool = require('../db/pool');
const { randomUUID } = require('crypto');

const findAll = async ({ search = '', sort = 'name', order = 'ASC', page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  const allowedSorts = { name: 'name', status: 'status', created_at: 'created_at' };
  const sortCol = allowedSorts[sort] || 'name';

  // SQLite LIKE is case-insensitive by default for ASCII
  const { rows } = await pool.query(
    `SELECT id, name, status, created_at
     FROM tenants
     WHERE name LIKE $1
     ORDER BY ${sortCol} ${order === 'DESC' ? 'DESC' : 'ASC'}
     LIMIT $2 OFFSET $3`,
    [`%${search}%`, limit, offset]
  );

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) as count FROM tenants WHERE name LIKE $1`,
    [`%${search}%`]
  );

  return { rows, total: parseInt(countRows[0].count) };
};

const findById = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM tenants WHERE id = $1`, [id]);
  return rows[0] || null;
};

const findByName = async (name) => {
  const { rows } = await pool.query(`SELECT id FROM tenants WHERE LOWER(name) = LOWER($1)`, [name]);
  return rows[0] || null;
};

const create = async ({ name, status = 'Active' }) => {
  const id = randomUUID();
  const { rows } = await pool.query(
    `INSERT INTO tenants (id, name, status) VALUES ($1, $2, $3) RETURNING *`,
    [id, name, status]
  );
  return rows[0];
};

const update = async (id, { name, status }) => {
  const { rows } = await pool.query(
    `UPDATE tenants SET
       name = COALESCE($1, name),
       status = COALESCE($2, status)
     WHERE id = $3 RETURNING *`,
    [name, status, id]
  );
  return rows[0] || null;
};

const remove = async (id) => {
  const { rows } = await pool.query(`DELETE FROM tenants WHERE id = $1 RETURNING id`, [id]);
  return rows[0] || null;
};

const stats = async () => {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS active,
       SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) AS inactive
     FROM tenants`
  );
  return rows[0];
};

module.exports = { findAll, findById, findByName, create, update, remove, stats };
