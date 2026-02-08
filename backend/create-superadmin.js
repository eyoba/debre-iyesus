const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createSuperAdmin() {
  try {
    console.log('Creating superadmin user...');

    // Check if superadmin already exists
    const checkResult = await pool.query(
      "SELECT * FROM admins WHERE username = 'superadmin'"
    );

    if (checkResult.rows.length > 0) {
      console.log('⚠️  Superadmin user already exists. Updating to ensure super admin privileges...');
      await pool.query(
        "UPDATE admins SET is_super_admin = true WHERE username = 'superadmin'"
      );
      console.log('✓ Superadmin privileges updated');
    } else {
      // Create superadmin user
      const password = 'SuperAdmin123!'; // Default password - should be changed after first login
      const passwordHash = await bcrypt.hash(password, 10);

      await pool.query(`
        INSERT INTO admins (username, password_hash, full_name, email, is_super_admin, is_active)
        VALUES ($1, $2, $3, $4, true, true)
      `, ['superadmin', passwordHash, 'Super Administrator', 'superadmin@church.no']);

      console.log('✓ Superadmin user created successfully');
      console.log('');
      console.log('================================');
      console.log('SUPERADMIN CREDENTIALS:');
      console.log('Username: superadmin');
      console.log('Password: SuperAdmin123!');
      console.log('================================');
      console.log('');
      console.log('⚠️  IMPORTANT: Please change this password after first login!');
    }

    // Also ensure existing admin is marked as regular admin (not super admin)
    await pool.query(`
      UPDATE admins
      SET is_super_admin = false
      WHERE username != 'superadmin' AND is_super_admin IS NULL
    `);

    console.log('✓ Regular admin permissions verified');

  } catch (error) {
    console.error('Error creating superadmin:', error);
  } finally {
    await pool.end();
  }
}

createSuperAdmin();
