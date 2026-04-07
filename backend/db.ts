import Database from "better-sqlite3";

const dbPath = process.env.DATABASE_PATH || "database.db";
const db = new Database(dbPath);

// Enable foreign keys (IMPORTANT for SQLite)
db.pragma("foreign_keys = ON");

// Create schema
db.exec(`
  -- ========================
  -- PRODUCTS
  -- ========================
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0)
  );

  -- ========================
  -- QUOTATION
  -- ========================
  CREATE TABLE IF NOT EXISTS quotation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    qtn_no TEXT UNIQUE,
    customer_name TEXT,
    attn TEXT,
    number TEXT,
    email TEXT,
    status TEXT DEFAULT 'pending'
  );

  -- ========================
  -- QUOTATION ITEMS
  -- ========================
  CREATE TABLE IF NOT EXISTS quotation_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    price REAL,
    unit TEXT,

    FOREIGN KEY (quotation_id) REFERENCES quotation(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  -- ========================
  -- DELIVERY
  -- ========================
  CREATE TABLE IF NOT EXISTS delivery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (quotation_id) REFERENCES quotation(id) ON DELETE CASCADE
  );

  -- ========================
  -- DELIVERY ITEMS
  -- ========================
  CREATE TABLE IF NOT EXISTS delivery_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    delivery_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),

    FOREIGN KEY (delivery_id) REFERENCES delivery(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  -- ========================
  -- INDEXES
  -- ========================
  CREATE INDEX IF NOT EXISTS idx_qi_quotation_id ON quotation_items(quotation_id);
  CREATE INDEX IF NOT EXISTS idx_qi_product_id ON quotation_items(product_id);

  CREATE INDEX IF NOT EXISTS idx_di_delivery_id ON delivery_items(delivery_id);
  CREATE INDEX IF NOT EXISTS idx_di_product_id ON delivery_items(product_id);

  CREATE INDEX IF NOT EXISTS idx_delivery_quotation_id ON delivery(quotation_id);
`);

export default db;
