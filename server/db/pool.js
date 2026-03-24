const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { promisify } = require('util');

const dbPath = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath);

// Mimic the 'pg' query interface
const query = (text, params = []) => {
  return new Promise((resolve, reject) => {
    // Check if it's a SELECT/RETURNING or mutation
    const isSelect = text.trim().toUpperCase().startsWith('SELECT');
    const isReturning = text.toUpperCase().includes('RETURNING');

    if (isSelect || isReturning) {
      db.all(text, params, (err, rows) => {
        if (err) reject(err);
        else resolve({ rows });
      });
    } else {
      db.run(text, params, function(err) {
        if (err) reject(err);
        else resolve({ rows: [], lastID: this.lastID, changes: this.changes });
      });
    }
  });
};

// SQLite doesn't have a built-in pool connect for transactions in a simple way,
// but for this demo, we'll provide a mock to keep service layer happy.
const connect = async () => {
  return {
    query,
    release: () => {},
  };
};

module.exports = { query, connect, end: () => new Promise(res => db.close(res)) };
