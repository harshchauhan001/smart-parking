const Database = require("better-sqlite3");

const db = new Database("parksmart.db");

console.log("SQLite database connected successfully");


/* =========================================
   USERS TABLE
========================================= */

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    vehicle_number TEXT NOT NULL,
    license_number TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();


/* =========================================
   PARKING CENTRES TABLE
========================================= */

db.prepare(`
  CREATE TABLE IF NOT EXISTS parking_centres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    total_slots INTEGER NOT NULL,
    available_slots INTEGER NOT NULL,
    price INTEGER NOT NULL,
    contact TEXT NOT NULL,
    opening_time TEXT,
    closing_time TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (partner_id)
    REFERENCES users(id)
  )
`).run();


/* =========================================
   RESERVATIONS TABLE
========================================= */

db.prepare(`
  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    parking_id INTEGER NOT NULL,

    vehicle_number TEXT NOT NULL,

    slot_number INTEGER NOT NULL,

    payment_method TEXT NOT NULL,

    amount INTEGER NOT NULL,

    status TEXT NOT NULL DEFAULT 'confirmed',

    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(id),

    FOREIGN KEY (parking_id)
    REFERENCES parking_centres(id)
  )
`).run();


console.log("Database tables created successfully");


module.exports = db;