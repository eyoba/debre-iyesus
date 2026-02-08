const { Pool } = require('pg');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAdmins() {
  try {
    console.log('Checking all admin users...\n');

    const result = await pool.query(`
      SELECT id, username, full_name, email, is_super_admin, is_active, created_at
      FROM admins
      ORDER BY created_at DESC
    `);

    console.log('Total admins:', result.rows.length);
    console.log('\n================================');

    result.rows.forEach((admin, index) => {
      console.log(`\nAdmin #${index + 1}:`);
      console.log(`  ID: ${admin.id}`);
      console.log(`  Username: ${admin.username}`);
      console.log(`  Full Name: ${admin.full_name || 'N/A'}`);
      console.log(`  Email: ${admin.email || 'N/A'}`);
      console.log(`  Is Super Admin: ${admin.is_super_admin === true ? 'YES ✓' : 'NO ✗'}`);
      console.log(`  Is Active: ${admin.is_active === true ? 'YES ✓' : 'NO ✗'}`);
      console.log(`  Created: ${admin.created_at}`);
    });

    console.log('\n================================\n');

  } catch (error) {
    console.error('Error checking admins:', error);
  } finally {
    await pool.end();
  }
}

checkAdmins();
