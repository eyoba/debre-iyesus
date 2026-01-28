const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createBaptismTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS baptism_records (
        id SERIAL PRIMARY KEY,
        event_date DATE NOT NULL,
        child_baptism_name VARCHAR(200) NOT NULL,
        child_call_name VARCHAR(200),
        father_name VARCHAR(200),
        mother_name VARCHAR(200),
        parents_nationality VARCHAR(100),
        child_birth_date DATE,
        child_baptism_date DATE,
        godparent_name VARCHAR(200),
        baptism_church VARCHAR(200),
        priest_name VARCHAR(200),
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(100)
      );

      CREATE INDEX IF NOT EXISTS idx_baptism_event_date ON baptism_records(event_date DESC);
      CREATE INDEX IF NOT EXISTS idx_baptism_child_name ON baptism_records(child_baptism_name);
      CREATE INDEX IF NOT EXISTS idx_baptism_active ON baptism_records(is_active);
    `);

    console.log('✅ Baptism records table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createBaptismTable();
