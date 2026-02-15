const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
  console.log('🔧 Setting up database schema...\n');

  try {
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Creating tables from schema.sql...');
    await pool.query(schemaSql);
    console.log('✅ All tables created successfully\n');

    // Check if superadmin exists
    const adminCheck = await pool.query(
      'SELECT * FROM admins WHERE username = $1',
      ['superadmin']
    );

    if (adminCheck.rows.length === 0) {
      // Create default superadmin
      console.log('👤 Creating default superadmin user...');
      const hashedPassword = await bcrypt.hash('superadmin123', 10);

      await pool.query(
        `INSERT INTO admins (username, password_hash, full_name, email, is_super_admin, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['superadmin', hashedPassword, 'Super Administrator', 'admin@debreiyesus.no', true, true]
      );

      console.log('✅ Default superadmin created');
      console.log('   Username: superadmin');
      console.log('   Password: superadmin123');
      console.log('   ⚠️  IMPORTANT: Change this password after first login!\n');
    } else {
      console.log('ℹ️  Superadmin user already exists\n');
    }

    // Check if regular admin exists
    const regularAdminCheck = await pool.query(
      'SELECT * FROM admins WHERE username = $1',
      ['admin']
    );

    if (regularAdminCheck.rows.length === 0) {
      console.log('👤 Creating regular admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await pool.query(
        `INSERT INTO admins (username, password_hash, full_name, email, is_super_admin, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['admin', hashedPassword, 'Regular Administrator', 'admin2@debreiyesus.no', false, true]
      );

      console.log('✅ Regular admin created');
      console.log('   Username: admin');
      console.log('   Password: admin123\n');
    } else {
      console.log('ℹ️  Regular admin user already exists\n');
    }

    // Initialize church_info if empty
    const churchCheck = await pool.query('SELECT COUNT(*) FROM church_info');
    if (parseInt(churchCheck.rows[0].count) === 0) {
      console.log('⛪ Initializing church_info table...');
      await pool.query(
        `INSERT INTO church_info (name, description)
         VALUES ($1, $2)`,
        ['Debre Iyesus Church', 'Welcome to our church community']
      );
      console.log('✅ Church info initialized\n');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log('   ✓ All tables created');
    console.log('   ✓ Default admin users ready');
    console.log('   ✓ Church info initialized');
    console.log('\n🚀 Ready to deploy to Azure!');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run setup
setupDatabase();
