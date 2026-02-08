const { Pool } = require('pg');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixAdminRole() {
  try {
    console.log('Fixing admin roles...\n');

    // Set regular 'admin' user to NOT be superadmin
    await pool.query(`
      UPDATE admins
      SET is_super_admin = false
      WHERE username = 'admin'
    `);

    console.log('✓ Updated "admin" user to regular admin (is_super_admin = false)');

    // Ensure 'superadmin' is marked as super admin
    await pool.query(`
      UPDATE admins
      SET is_super_admin = true
      WHERE username = 'superadmin'
    `);

    console.log('✓ Ensured "superadmin" user has superadmin privileges (is_super_admin = true)');

    // Show results
    console.log('\nVerifying changes...\n');
    const result = await pool.query(`
      SELECT username, is_super_admin
      FROM admins
      ORDER BY username
    `);

    result.rows.forEach(admin => {
      console.log(`  ${admin.username}: is_super_admin = ${admin.is_super_admin === true ? 'YES ✓' : 'NO ✗'}`);
    });

    console.log('\n✅ Admin roles fixed successfully!');
    console.log('\nYou can now login with:');
    console.log('  - "admin" = Regular admin (limited access)');
    console.log('  - "superadmin" = Super admin (full access)');

  } catch (error) {
    console.error('Error fixing admin roles:', error);
  } finally {
    await pool.end();
  }
}

fixAdminRole();
