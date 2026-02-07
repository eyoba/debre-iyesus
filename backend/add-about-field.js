const { Pool } = require('pg');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addAboutField() {
  try {
    console.log('Adding about_content column to church_info table...');
    await pool.query(`
      ALTER TABLE church_info
      ADD COLUMN IF NOT EXISTS about_content TEXT DEFAULT '';
    `);
    console.log('✓ about_content column added successfully');
  } catch (error) {
    console.error('Error adding about_content:', error);
  } finally {
    await pool.end();
  }
}

addAboutField();
