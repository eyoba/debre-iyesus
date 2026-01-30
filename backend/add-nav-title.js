const { Pool } = require('pg');
const path = require('path');

// Load .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addNavTitle() {
  try {
    console.log('Connecting to database...');
    console.log('Adding nav_title column to church_info table...');

    await pool.query(`
      ALTER TABLE church_info
      ADD COLUMN IF NOT EXISTS nav_title VARCHAR(100) DEFAULT 'Churches Directory';
    `);

    console.log('✓ nav_title column added successfully');

    // Check the result
    const result = await pool.query(`
      SELECT nav_title FROM church_info LIMIT 1
    `);

    console.log('Current nav_title:', result.rows[0]);

  } catch (error) {
    console.error('Error adding nav_title:', error);
    console.error('Error details:', error.message);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

addNavTitle();
