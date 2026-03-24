const pool = require('./pool');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations/001_init.sql'), 'utf8');
  // SQLite .Database doesn't support multiple statements in one call easily in some wrappers,
  // but my pool.js uses db.all/run which usually handles one at a time.
  // We'll split by semicolon for safety.
  const statements = sql.split(';').filter(s => s.trim());
  for (const s of statements) {
    await pool.query(s);
  }
  console.log('✅ Migrations ran successfully');
}

async function seed() {
  try {
    // Insert tenants
    const tenantIds = [];
    const tenants = [['Acme Corp', 'Active'], ['Global Tech', 'Active'], ['Nexus Industries', 'Inactive']];

    for (const [name, status] of tenants) {
      const id = randomUUID();
      await pool.query(
        `INSERT INTO tenants (id, name, status) VALUES ($1, $2, $3)`,
        [id, name, status]
      );
      tenantIds.push(id);
    }

    // Products per tenant
    const productsData = [
      [tenantIds[0], 'Industrial Adhesive', 'ADH-100', 'Chemicals', 'Active', 50, 12.99],
      [tenantIds[0], 'Aluminum Sheet', 'ALM-500', 'Metals', 'Active', 20, 45.00],
      [tenantIds[0], 'Safety Gloves', 'SGV-200', 'Safety', 'Inactive', 100, 8.50],
      [tenantIds[1], 'Circuit Board A', 'CBA-001', 'Electronics', 'Active', 30, 75.00],
      [tenantIds[1], 'Power Supply 12V', 'PSU-012', 'Electronics', 'Active', 15, 25.50],
      [tenantIds[2], 'Steel Rod 10mm', 'STR-010', 'Metals', 'Active', 40, 18.75],
    ];

    for (const [tenant_id, name, sku, category, status, reorder_threshold, cost_per_unit] of productsData) {
      const pId = randomUUID();
      await pool.query(
        `INSERT INTO products (id, tenant_id, name, sku, category, status, reorder_threshold, cost_per_unit)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [pId, tenant_id, name, sku, category, status, reorder_threshold, cost_per_unit]
      );
      // Create inventory record for each product
      await pool.query(
        `INSERT INTO inventory (id, product_id, quantity) VALUES ($1, $2, $3)`,
        [randomUUID(), pId, Math.floor(Math.random() * 200) + 10]
      );
    }

    console.log('✅ Seed data inserted successfully');
  } catch (e) {
    console.error('❌ Seed error:', e.message);
    throw e;
  }
}

async function run() {
  try {
    await migrate();
    await seed();
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await pool.end();
  }
}

run();
