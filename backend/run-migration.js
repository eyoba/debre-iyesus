const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  console.log('🔧 Running database migration...\n');

  try {
    // Read migration SQL
    const migrationPath = path.join(__dirname, 'add-missing-columns.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Adding missing columns to church_info table...');
    await pool.query(migrationSql);
    console.log('✅ Migration completed successfully!\n');

    // Verify columns were added
    const result = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'church_info'
      ORDER BY column_name
    `);

    console.log('📊 Current church_info columns:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}`);
    });

    console.log('\n✅ Database is now up to date!');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
