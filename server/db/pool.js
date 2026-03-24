const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Convert $1,$2 placeholders to ?
const toLibsql = (text, params = []) => ({
  sql: text.replace(/\$(\d+)/g, '?'),
  args: params.map((v) => (v === undefined ? null : v)),
});

// Map libsql result to plain row objects
const mapRows = (result) =>
  result.rows.map((row) => {
    const obj = {};
    result.columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });

// Single query — pg-compatible interface
const query = async (text, params = []) => {
  const result = await client.execute(toLibsql(text, params));
  return {
    rows: mapRows(result),
    lastID: result.lastInsertRowid,
    changes: result.rowsAffected,
  };
};

// Batch multiple statements atomically (replaces BEGIN/COMMIT pattern)
const batch = async (statements) => {
  // statements = [{ sql, params }, ...]
  const libsqlStmts = statements.map(({ sql, params = [] }) => toLibsql(sql, params));
  const results = await client.batch(libsqlStmts, 'write');
  return results.map((r) => ({ rows: mapRows(r) }));
};

// Kept for backward compat — not used for real transactions anymore
const connect = async () => ({
  query,
  release: () => {},
});

module.exports = { query, batch, connect, end: async () => {} };
