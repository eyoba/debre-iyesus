const { Pool } = require('pg');
const path = require('path');

// Load .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addFieldLabels() {
  try {
    console.log('Connecting to database...');

    console.log('Adding field label columns to church_info table...');

    await pool.query(`
      ALTER TABLE church_info
      ADD COLUMN IF NOT EXISTS field_label_pastor VARCHAR(100) DEFAULT 'Pastor',
      ADD COLUMN IF NOT EXISTS field_label_address VARCHAR(100) DEFAULT 'Address',
      ADD COLUMN IF NOT EXISTS field_label_phone VARCHAR(100) DEFAULT 'Phone',
      ADD COLUMN IF NOT EXISTS field_label_email VARCHAR(100) DEFAULT 'Email',
      ADD COLUMN IF NOT EXISTS field_label_website VARCHAR(100) DEFAULT 'Website',
      ADD COLUMN IF NOT EXISTS field_label_facebook VARCHAR(100) DEFAULT 'Facebook',
      ADD COLUMN IF NOT EXISTS facebook VARCHAR(255),
      ADD COLUMN IF NOT EXISTS show_members_link BOOLEAN DEFAULT false;
    `);

    console.log('✓ Field label columns added successfully');

    // Check the result
    const result = await pool.query(`
      SELECT field_label_pastor, field_label_address, field_label_phone,
             field_label_email, field_label_website, field_label_facebook
      FROM church_info LIMIT 1
    `);

    console.log('Current field labels:', result.rows[0]);

  } catch (error) {
    console.error('Error adding field labels:', error);
    console.error('Error details:', error.message);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

addFieldLabels();
