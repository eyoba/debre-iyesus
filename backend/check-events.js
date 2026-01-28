const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkEvents() {
  try {
    const result = await pool.query('SELECT id, title, event_date, is_published FROM events ORDER BY created_at DESC');

    console.log('\n📅 Events in database:');
    console.log('='.repeat(80));

    if (result.rows.length === 0) {
      console.log('No events found in database.');
    } else {
      result.rows.forEach((event, index) => {
        console.log(`\n${index + 1}. ${event.title}`);
        console.log(`   Event Date: ${event.event_date}`);
        console.log(`   Published: ${event.is_published}`);
        console.log(`   Is Future Event: ${new Date(event.event_date) >= new Date()}`);
      });
    }

    console.log('\n' + '='.repeat(80));

    const publicEvents = await pool.query(`
      SELECT * FROM events
      WHERE event_date >= NOW() AND is_published = true
      ORDER BY event_date ASC
    `);

    console.log(`\nPublic events (shown on homepage): ${publicEvents.rows.length}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkEvents();
