const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://church_user:Debreiyesus2026@churchserverdevelopment.postgres.database.azure.com:5432/debre_iyesus_db?sslmode=require'
});

async function runSchema() {
  const client = await pool.connect();

  try {
    console.log('📦 Connected to Azure PostgreSQL database: debre_iyesus_db');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');

    // Replace the placeholder hash with the actual generated hash
    const actualHash = '$2b$10$m3skhaFP1yF/qkp5QlMpt.VZgTO8qvE52GucHOg3fXVgweY7769Ei';
    schema = schema.replace('$2b$10$YourHashWillBeReplacedByScript', actualHash);

    console.log('🔄 Running database schema...');

    // Execute the schema
    await client.query(schema);

    console.log('✅ Schema executed successfully!');
    console.log('\n📊 Database tables created:');
    console.log('  - church_info');
    console.log('  - admins');
    console.log('  - news');
    console.log('  - events');
    console.log('  - photos');
    console.log('  - members');
    console.log('  - kontingent_payments');
    console.log('  - sms_logs');
    console.log('  - sms_recipients');
    console.log('  - audit_log');
    console.log('\n🔐 Default admin credentials:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');

  } catch (err) {
    console.error('❌ Error running schema:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSchema();
