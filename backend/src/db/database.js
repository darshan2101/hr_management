const Database = require('better-sqlite3');
const path = require('path');
const { initializeSchema } = require('./schema');

let db = null;

function getDb() {
  if (!db) {
    const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : path.join(__dirname, '../../hr.db');
    db = new Database(dbPath);
    initializeSchema(db);
  }
  return db;
}

function resetDb() { 
  if (db) { db.close(); db = null; } 
}

module.exports = { getDb, resetDb };