const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateSuperAdminPassword() {
  try {
    console.log('Updating superadmin password...');

    const newPassword = 'superadmin123';
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE admins SET password_hash = $1 WHERE username = 'superadmin'",
      [passwordHash]
    );

    console.log('✓ Superadmin password updated successfully');
    console.log('');
    console.log('================================');
    console.log('NEW SUPERADMIN CREDENTIALS:');
    console.log('Username: superadmin');
    console.log('Password: superadmin123');
    console.log('================================');
    console.log('');

  } catch (error) {
    console.error('Error updating superadmin password:', error);
  } finally {
    await pool.end();
  }
}

updateSuperAdminPassword();
