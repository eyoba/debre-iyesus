const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function resetSuperAdminPassword() {
  try {
    console.log('Resetting superadmin password...');

    // Check if superadmin exists
    const checkResult = await pool.query(
      "SELECT * FROM admins WHERE username = 'superadmin'"
    );

    if (checkResult.rows.length === 0) {
      console.log('❌ Superadmin user not found. Creating new one...');

      const password = 'SuperAdmin123!';
      const passwordHash = await bcrypt.hash(password, 10);

      await pool.query(`
        INSERT INTO admins (username, password_hash, full_name, email, is_super_admin, is_active)
        VALUES ($1, $2, $3, $4, true, true)
      `, ['superadmin', passwordHash, 'Super Administrator', 'superadmin@church.no']);

      console.log('✓ Superadmin user created successfully');
    } else {
      console.log('✓ Superadmin user found. Updating password...');

      const password = 'SuperAdmin123!';
      const passwordHash = await bcrypt.hash(password, 10);

      await pool.query(
        "UPDATE admins SET password_hash = $1, is_super_admin = true, is_active = true WHERE username = 'superadmin'",
        [passwordHash]
      );

      console.log('✓ Password updated successfully');
    }

    console.log('');
    console.log('================================');
    console.log('SUPERADMIN CREDENTIALS:');
    console.log('Username: superadmin');
    console.log('Password: SuperAdmin123!');
    console.log('================================');
    console.log('');
    console.log('⚠️  IMPORTANT: Please change this password after first login!');

  } catch (error) {
    console.error('Error resetting superadmin password:', error);
  } finally {
    await pool.end();
  }
}

resetSuperAdminPassword();
