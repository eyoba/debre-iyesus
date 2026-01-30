const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SmsClient } = require('@azure/communication-sms');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3010;

// Helper function to get base URL
const getBaseUrl = (req) => {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL;
  }
  const protocol = req.protocol || 'http';
  const host = req.get('host') || `localhost:${PORT}`;
  return `${protocol}://${host}`;
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5190',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Connected to PostgreSQL database');
  }
});

// Cloudinary configuration (optional)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Azure Communication Services SMS Client (optional)
let smsClient = null;
if (process.env.AZURE_COMMUNICATION_CONNECTION_STRING &&
    !process.env.AZURE_COMMUNICATION_CONNECTION_STRING.includes('your_connection_string_here')) {
  try {
    smsClient = new SmsClient(process.env.AZURE_COMMUNICATION_CONNECTION_STRING);
    console.log('✅ Azure Communication Services SMS client initialized');
    console.log(`📱 Alphanumeric Sender ID: ${process.env.AZURE_SMS_SENDER_ID || 'Not configured'}`);
  } catch (err) {
    console.log('⚠️  Azure SMS initialization failed:', err.message);
    console.log('⚠️  SMS features will be disabled');
  }
} else {
  console.log('⚠️  Azure Communication Services not configured - SMS features disabled');
}

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ============================================
// MIDDLEWARE
// ============================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireSuperAdmin(req, res, next) {
  if (!req.user || !req.user.is_super_admin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
}

// Audit Logging Function
async function logAudit(userId, action, tableName, recordId, oldValues, newValues, ipAddress) {
  try {
    await pool.query(`
      INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [userId, action, tableName, recordId, JSON.stringify(oldValues), JSON.stringify(newValues), ipAddress]);
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}

// ============================================
// PUBLIC ROUTES - Church Website
// ============================================

// Get church info (public)
app.get('/api/church', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM church_info LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Church info not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get church news (published only)
app.get('/api/news', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.*, a.full_name as author_name
      FROM news n
      LEFT JOIN admins a ON n.author_id = a.id
      WHERE n.is_published = true
      ORDER BY n.published_date DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get church events (upcoming)
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM events
      WHERE event_date >= NOW() AND is_published = true
      ORDER BY event_date ASC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get church photos
app.get('/api/photos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM photos
      WHERE is_published = true
      ORDER BY display_order, created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// AUTH ROUTES
// ============================================

// Admin Login (unified for both church info and members management)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM admins WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        is_super_admin: user.is_super_admin || false
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        is_super_admin: user.is_super_admin || false
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// ADMIN ROUTES - CHURCH INFO MANAGEMENT
// ============================================

// Get dashboard stats
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
  try {
    const [church, newsCount, eventsCount, membersCount, photosCount, recentNews, recentEvents] = await Promise.all([
      pool.query('SELECT * FROM church_info LIMIT 1'),
      pool.query('SELECT COUNT(*) FROM news'),
      pool.query('SELECT COUNT(*) FROM events WHERE event_date >= NOW()'),
      pool.query('SELECT COUNT(*) FROM members WHERE is_active = true'),
      pool.query('SELECT COUNT(*) FROM photos'),
      pool.query('SELECT id, title, created_at FROM news ORDER BY created_at DESC LIMIT 5'),
      pool.query('SELECT id, title, event_date FROM events WHERE event_date >= NOW() ORDER BY event_date ASC LIMIT 5')
    ]);

    // Get all active members to calculate ages
    const membersResult = await pool.query('SELECT personnummer FROM members WHERE is_active = true AND personnummer IS NOT NULL');

    console.log('DEBUG: Total members with personnummer:', membersResult.rows.length);
    membersResult.rows.forEach((m, i) => {
      console.log(`DEBUG: Member ${i + 1}: personnummer = "${m.personnummer}"`);
    });

    let members18Plus = 0;
    let membersUnder18 = 0;

    // Calculate age from personnummer (DDMMYY format - first 6 digits)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const currentDay = now.getDate();

    console.log('DEBUG: Current date:', `${currentDay}.${currentMonth}.${currentYear}`);

    membersResult.rows.forEach((member, index) => {
      if (member.personnummer && member.personnummer.length >= 6) {
        const day = parseInt(member.personnummer.substring(0, 2));
        const month = parseInt(member.personnummer.substring(2, 4));
        const yearShort = parseInt(member.personnummer.substring(4, 6));

        // Determine century: if year is > current year's last 2 digits, it's 1900s, otherwise 2000s
        const currentYearShort = currentYear % 100;
        let birthYear;

        if (yearShort > currentYearShort) {
          // Born in 1900s (e.g., 95 = 1995, when current year is 2026)
          birthYear = 1900 + yearShort;
        } else {
          // Born in 2000s (e.g., 10 = 2010, when current year is 2026)
          birthYear = 2000 + yearShort;
        }

        // Calculate age
        let age = currentYear - birthYear;

        // Adjust if birthday hasn't occurred this year yet
        if (currentMonth < month || (currentMonth === month && currentDay < day)) {
          age--;
        }

        console.log(`DEBUG: Member ${index + 1}: ${member.personnummer.substring(0, 6)} -> Birth: ${day}.${month}.${birthYear} -> Age: ${age}`);

        if (age >= 18) {
          members18Plus++;
        } else if (age >= 0) {
          membersUnder18++;
        }
      } else {
        console.log(`DEBUG: Member ${index + 1}: Invalid personnummer (length: ${member.personnummer?.length || 0})`);
      }
    });

    console.log('DEBUG: Final counts - 18+:', members18Plus, 'Under 18:', membersUnder18);

    res.json({
      church: church.rows[0] || {},
      stats: {
        news: parseInt(newsCount.rows[0].count),
        upcoming_events: parseInt(eventsCount.rows[0].count),
        members: parseInt(membersCount.rows[0].count),
        members_18_plus: members18Plus,
        members_under_18: membersUnder18,
        photos: parseInt(photosCount.rows[0].count)
      },
      recent_news: recentNews.rows,
      recent_events: recentEvents.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update church info (requires super admin)
app.put('/api/admin/church-info', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    console.log('Received church info update:', JSON.stringify(req.body, null, 2));

    const {
      name, address, phone, email, website, logo_url,
      pastor_name, pastor_phone, pastor_email, pastor_bio,
      sunday_service_time, wednesday_service_time, other_service_times,
      description, mission_statement, background_color, show_members_link,
      facebook,
      field_label_pastor, field_label_address, field_label_phone,
      field_label_email, field_label_website, field_label_facebook
    } = req.body;

    console.log('Field labels received:', { field_label_pastor, field_label_address, field_label_phone, field_label_email, field_label_website, field_label_facebook });

    // First, ensure the field_label columns exist
    try {
      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='church_info' AND column_name='field_label_pastor') THEN
            ALTER TABLE church_info
              ADD COLUMN field_label_pastor VARCHAR(100) DEFAULT 'Pastor',
              ADD COLUMN field_label_address VARCHAR(100) DEFAULT 'Address',
              ADD COLUMN field_label_phone VARCHAR(100) DEFAULT 'Phone',
              ADD COLUMN field_label_email VARCHAR(100) DEFAULT 'Email',
              ADD COLUMN field_label_website VARCHAR(100) DEFAULT 'Website',
              ADD COLUMN field_label_facebook VARCHAR(100) DEFAULT 'Facebook',
              ADD COLUMN facebook VARCHAR(255),
              ADD COLUMN show_members_link BOOLEAN DEFAULT false;
          END IF;
        END$$;
      `);
    } catch (err) {
      console.log('Field labels columns may already exist:', err.message);
    }

    const result = await pool.query(`
      UPDATE church_info SET
        name = $1, address = $2, phone = $3, email = $4, website = $5, logo_url = $6,
        pastor_name = $7, pastor_phone = $8, pastor_email = $9, pastor_bio = $10,
        sunday_service_time = $11, wednesday_service_time = $12, other_service_times = $13,
        description = $14, mission_statement = $15, background_color = $16,
        facebook = $17, show_members_link = $18,
        field_label_pastor = $19, field_label_address = $20, field_label_phone = $21,
        field_label_email = $22, field_label_website = $23, field_label_facebook = $24,
        updated_at = NOW()
      WHERE id = 1
      RETURNING *
    `, [name, address, phone, email, website, logo_url,
        pastor_name, pastor_phone, pastor_email, pastor_bio,
        sunday_service_time, wednesday_service_time, other_service_times,
        description, mission_statement, background_color || '#3b82f6',
        facebook, show_members_link !== undefined ? show_members_link : false,
        field_label_pastor || 'Pastor', field_label_address || 'Address',
        field_label_phone || 'Phone', field_label_email || 'Email',
        field_label_website || 'Website', field_label_facebook || 'Facebook']);

    await logAudit(req.user.username, 'UPDATE', 'church_info', 1, null, result.rows[0], req.ip);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating church info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload church logo
app.post('/api/admin/upload-logo', authenticateToken, requireSuperAdmin, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fs = require('fs');
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `logo-${Date.now()}${path.extname(req.file.originalname)}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);

    const logoUrl = `${getBaseUrl(req)}/uploads/${fileName}`;

    await pool.query(`
      UPDATE church_info SET logo_url = $1, updated_at = NOW() WHERE id = 1
    `, [logoUrl]);

    res.json({ url: logoUrl, message: 'Logo uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// NEWS MANAGEMENT
// ============================================

app.get('/api/admin/news', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM news ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/news', authenticateToken, async (req, res) => {
  try {
    const { title, content, is_published } = req.body;
    const result = await pool.query(`
      INSERT INTO news (title, content, author_id, is_published, published_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [title, content, req.user.id, is_published, is_published ? new Date() : null]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/news/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, is_published } = req.body;
    const result = await pool.query(`
      UPDATE news SET
        title = $1, content = $2, is_published = $3,
        published_date = CASE WHEN $3 = true AND published_date IS NULL THEN NOW() ELSE published_date END,
        updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [title, content, is_published, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/news/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM news WHERE id = $1', [req.params.id]);
    res.json({ message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EVENTS MANAGEMENT
// ============================================

app.get('/api/admin/events', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY event_date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/events', authenticateToken, async (req, res) => {
  try {
    const { title, description, event_date, end_date, location, is_recurring, recurrence_pattern, is_published } = req.body;
    const result = await pool.query(`
      INSERT INTO events (title, description, event_date, end_date, location, is_recurring, recurrence_pattern, created_by, is_published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [title, description, event_date, end_date, location, is_recurring, recurrence_pattern, req.user.id, is_published]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/events/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, event_date, end_date, location, is_recurring, recurrence_pattern, is_published } = req.body;
    const result = await pool.query(`
      UPDATE events SET
        title = $1, description = $2, event_date = $3, end_date = $4,
        location = $5, is_recurring = $6, recurrence_pattern = $7, is_published = $8
      WHERE id = $9
      RETURNING *
    `, [title, description, event_date, end_date, location, is_recurring, recurrence_pattern, is_published, req.params.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/events/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PHOTO GALLERY MANAGEMENT
// ============================================

app.get('/api/admin/photos', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM photos ORDER BY display_order, created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/photos', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fs = require('fs');
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `photo-${Date.now()}${path.extname(req.file.originalname)}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);

    const photoUrl = `${getBaseUrl(req)}/uploads/${fileName}`;
    const { caption, is_published } = req.body;
    const title = caption || fileName;

    const result = await pool.query(`
      INSERT INTO photos (title, description, image_url, thumbnail_url, uploaded_by, is_published)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, caption || '', photoUrl, photoUrl, req.user.id, is_published === 'true' || is_published === true]);

    res.json({
      photo: result.rows[0],
      message: 'Photo uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/photos/:id', authenticateToken, async (req, res) => {
  try {
    const fs = require('fs');

    const photo = await pool.query('SELECT image_url FROM photos WHERE id = $1', [req.params.id]);

    if (photo.rows.length > 0) {
      const imageUrl = photo.rows[0].image_url;
      if (imageUrl.includes('localhost') && imageUrl.includes('/uploads/')) {
        const filename = imageUrl.split('/uploads/')[1];
        const filePath = path.join(__dirname, 'public', 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await pool.query('DELETE FROM photos WHERE id = $1', [req.params.id]);
    res.json({ message: 'Photo deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MEMBERS MANAGEMENT ROUTES
// ============================================

// Get all members
app.get('/api/members', authenticateToken, async (req, res) => {
  try {
    const { search, active } = req.query;

    let query = 'SELECT * FROM members WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (active !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      params.push(active === 'true');
      paramCount++;
    }

    if (search) {
      query += ` AND (full_name ILIKE $${paramCount} OR phone_number ILIKE $${paramCount} OR personnummer ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY full_name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get members error:', err);
    res.status(500).json({ error: 'Failed to retrieve members' });
  }
});

// Get single member
app.get('/api/members/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM members WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get member error:', err);
    res.status(500).json({ error: 'Failed to retrieve member' });
  }
});

// Create member
app.post('/api/members', authenticateToken, async (req, res) => {
  try {
    const {
      full_name, phone_number, email, personnummer, card_number,
      address, postal_code, city, card_issue_date,
      sms_consent, notes
    } = req.body;

    if (!/^\d{11}$/.test(personnummer)) {
      return res.status(400).json({ error: 'Personnummer must be 11 digits' });
    }

    const duplicateCheck = await pool.query(
      'SELECT id FROM members WHERE phone_number = $1',
      [phone_number]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Member with this phone number already exists' });
    }

    if (card_number) {
      const cardNumberCheck = await pool.query(
        'SELECT id FROM members WHERE card_number = $1',
        [card_number]
      );

      if (cardNumberCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Card number already exists' });
      }
    }

    const result = await pool.query(`
      INSERT INTO members (
        full_name, phone_number, email, personnummer, card_number,
        address, postal_code, city, card_issue_date,
        sms_consent, notes,
        created_by, updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)
      RETURNING id
    `, [
      full_name, phone_number, email || null, personnummer, card_number || null,
      address || null, postal_code || null, city || null, card_issue_date || null,
      sms_consent !== undefined ? sms_consent : true,
      notes || null, req.user.username
    ]);

    const newId = result.rows[0].id;

    await logAudit(req.user.username, 'CREATE', 'members', newId, null, req.body, req.ip);

    res.status(201).json({ id: newId, message: 'Member created successfully' });
  } catch (err) {
    console.error('Create member error:', err);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// Update member
app.put('/api/members/:id', authenticateToken, async (req, res) => {
  try {
    const memberId = req.params.id;

    const oldResult = await pool.query('SELECT * FROM members WHERE id = $1', [memberId]);

    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const {
      full_name, phone_number, email, personnummer, card_number,
      address, postal_code, city, card_issue_date,
      sms_consent, is_active, notes
    } = req.body;

    if (card_number && card_number !== oldResult.rows[0].card_number) {
      const cardNumberCheck = await pool.query(
        'SELECT id FROM members WHERE card_number = $1 AND id != $2',
        [card_number, memberId]
      );

      if (cardNumberCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Card number already exists' });
      }
    }

    await pool.query(`
      UPDATE members SET
        full_name = $1,
        phone_number = $2,
        email = $3,
        personnummer = $4,
        card_number = $5,
        address = $6,
        postal_code = $7,
        city = $8,
        card_issue_date = $9,
        sms_consent = $10,
        is_active = $11,
        notes = $12,
        updated_by = $13,
        updated_at = NOW()
      WHERE id = $14
    `, [
      full_name, phone_number, email || null, personnummer, card_number || null,
      address || null, postal_code || null, city || null, card_issue_date || null,
      sms_consent !== undefined ? sms_consent : true,
      is_active !== undefined ? is_active : true, notes || null,
      req.user.username, memberId
    ]);

    await logAudit(req.user.username, 'UPDATE', 'members', memberId, oldResult.rows[0], req.body, req.ip);

    res.json({ message: 'Member updated successfully' });
  } catch (err) {
    console.error('Update member error:', err);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete member (soft delete)
app.delete('/api/members/:id', authenticateToken, async (req, res) => {
  try {
    const memberId = req.params.id;

    await pool.query(`
      UPDATE members SET
        is_active = false,
        updated_by = $1,
        updated_at = NOW()
      WHERE id = $2
    `, [req.user.username, memberId]);

    await logAudit(req.user.username, 'DELETE', 'members', memberId, null, { is_active: false }, req.ip);

    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    console.error('Delete member error:', err);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// ============================================
// BAPTISM RECORDS ROUTES
// ============================================

// Get all baptism records
app.get('/api/baptism-records', authenticateToken, async (req, res) => {
  try {
    const { active } = req.query;
    let query = 'SELECT * FROM baptism_records';
    const params = [];

    if (active !== undefined) {
      query += ' WHERE is_active = $1';
      params.push(active === 'true');
    }

    query += ' ORDER BY event_date DESC, id DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get baptism records error:', err);
    res.status(500).json({ error: 'Failed to retrieve baptism records' });
  }
});

// Get single baptism record
app.get('/api/baptism-records/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM baptism_records WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Baptism record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get baptism record error:', err);
    res.status(500).json({ error: 'Failed to retrieve baptism record' });
  }
});

// Create baptism record
app.post('/api/baptism-records', authenticateToken, async (req, res) => {
  try {
    const {
      event_date, child_baptism_name, child_call_name, father_name,
      mother_name, parents_nationality, child_birth_date, child_baptism_date,
      godparent_name, baptism_church, priest_name, notes
    } = req.body;

    if (!event_date || !child_baptism_name) {
      return res.status(400).json({ error: 'Event date and child baptism name are required' });
    }

    const result = await pool.query(`
      INSERT INTO baptism_records (
        event_date, child_baptism_name, child_call_name, father_name,
        mother_name, parents_nationality, child_birth_date, child_baptism_date,
        godparent_name, baptism_church, priest_name, notes,
        created_by, updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
      RETURNING id
    `, [
      event_date, child_baptism_name, child_call_name || null, father_name || null,
      mother_name || null, parents_nationality || null, child_birth_date || null,
      child_baptism_date || null, godparent_name || null, baptism_church || null,
      priest_name || null, notes || null, req.user.username
    ]);

    const newId = result.rows[0].id;
    await logAudit(req.user.username, 'CREATE', 'baptism_records', newId, null, req.body, req.ip);

    res.status(201).json({ id: newId, message: 'Baptism record created successfully' });
  } catch (err) {
    console.error('Create baptism record error:', err);
    res.status(500).json({ error: 'Failed to create baptism record' });
  }
});

// Update baptism record
app.put('/api/baptism-records/:id', authenticateToken, async (req, res) => {
  try {
    const recordId = req.params.id;

    const oldResult = await pool.query('SELECT * FROM baptism_records WHERE id = $1', [recordId]);

    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Baptism record not found' });
    }

    const {
      event_date, child_baptism_name, child_call_name, father_name,
      mother_name, parents_nationality, child_birth_date, child_baptism_date,
      godparent_name, baptism_church, priest_name, notes, is_active
    } = req.body;

    await pool.query(`
      UPDATE baptism_records SET
        event_date = $1,
        child_baptism_name = $2,
        child_call_name = $3,
        father_name = $4,
        mother_name = $5,
        parents_nationality = $6,
        child_birth_date = $7,
        child_baptism_date = $8,
        godparent_name = $9,
        baptism_church = $10,
        priest_name = $11,
        notes = $12,
        is_active = $13,
        updated_by = $14,
        updated_at = NOW()
      WHERE id = $15
    `, [
      event_date, child_baptism_name, child_call_name || null, father_name || null,
      mother_name || null, parents_nationality || null, child_birth_date || null,
      child_baptism_date || null, godparent_name || null, baptism_church || null,
      priest_name || null, notes || null, is_active !== undefined ? is_active : true,
      req.user.username, recordId
    ]);

    await logAudit(req.user.username, 'UPDATE', 'baptism_records', recordId, oldResult.rows[0], req.body, req.ip);

    res.json({ message: 'Baptism record updated successfully' });
  } catch (err) {
    console.error('Update baptism record error:', err);
    res.status(500).json({ error: 'Failed to update baptism record' });
  }
});

// Delete baptism record (soft delete)
app.delete('/api/baptism-records/:id', authenticateToken, async (req, res) => {
  try {
    const recordId = req.params.id;

    await pool.query(`
      UPDATE baptism_records SET
        is_active = false,
        updated_by = $1,
        updated_at = NOW()
      WHERE id = $2
    `, [req.user.username, recordId]);

    await logAudit(req.user.username, 'DELETE', 'baptism_records', recordId, null, { is_active: false }, req.ip);

    res.json({ message: 'Baptism record deleted successfully' });
  } catch (err) {
    console.error('Delete baptism record error:', err);
    res.status(500).json({ error: 'Failed to delete baptism record' });
  }
});

// ============================================
// ADMIN MANAGEMENT ROUTES (Super Admin Only)
// ============================================

app.get('/api/admins', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, full_name, email, is_active, is_super_admin, created_at
      FROM admins
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get admins error:', err);
    res.status(500).json({ error: 'Failed to retrieve admins' });
  }
});

app.post('/api/admins', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { username, password, full_name, email, is_super_admin } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const duplicateCheck = await pool.query(
      'SELECT id FROM admins WHERE username = $1',
      [username]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(`
      INSERT INTO admins (username, password_hash, full_name, email, is_super_admin)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, full_name, email, is_active, is_super_admin, created_at
    `, [username, passwordHash, full_name || null, email || null, is_super_admin || false]);

    await logAudit(req.user.username, 'CREATE', 'admins', result.rows[0].id, null, result.rows[0], req.ip);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

app.put('/api/admins/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const adminId = req.params.id;
    const { username, full_name, email, is_active, is_super_admin, password } = req.body;

    if (is_super_admin === false) {
      const superAdminCount = await pool.query(
        'SELECT COUNT(*) FROM admins WHERE is_super_admin = true AND is_active = true AND id != $1',
        [adminId]
      );

      if (parseInt(superAdminCount.rows[0].count) === 0) {
        return res.status(400).json({ error: 'Cannot remove super admin status from the last super admin' });
      }
    }

    const oldResult = await pool.query('SELECT * FROM admins WHERE id = $1', [adminId]);

    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    let updateQuery = `
      UPDATE admins
      SET username = $1, full_name = $2, email = $3, is_active = $4, is_super_admin = $5
    `;
    let params = [username, full_name || null, email || null, is_active !== undefined ? is_active : true, is_super_admin !== undefined ? is_super_admin : false];

    if (password && password.trim().length > 0) {
      const passwordHash = await bcrypt.hash(password, 10);
      updateQuery += `, password_hash = $${params.length + 1}`;
      params.push(passwordHash);
    }

    updateQuery += ` WHERE id = $${params.length + 1} RETURNING id, username, full_name, email, is_active, is_super_admin, created_at`;
    params.push(adminId);

    const result = await pool.query(updateQuery, params);

    await logAudit(req.user.username, 'UPDATE', 'admins', adminId, oldResult.rows[0], result.rows[0], req.ip);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update admin error:', err);
    res.status(500).json({ error: 'Failed to update admin' });
  }
});

app.delete('/api/admins/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const adminId = req.params.id;

    if (parseInt(adminId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    const admin = await pool.query('SELECT is_super_admin FROM admins WHERE id = $1', [adminId]);

    if (admin.rows.length > 0 && admin.rows[0].is_super_admin) {
      const superAdminCount = await pool.query(
        'SELECT COUNT(*) FROM admins WHERE is_super_admin = true AND is_active = true AND id != $1',
        [adminId]
      );

      if (parseInt(superAdminCount.rows[0].count) === 0) {
        return res.status(400).json({ error: 'Cannot delete the last super admin' });
      }
    }

    await pool.query('UPDATE admins SET is_active = false WHERE id = $1', [adminId]);

    await logAudit(req.user.username, 'DELETE', 'admins', adminId, null, { is_active: false }, req.ip);

    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

// ============================================
// SMS ROUTES
// ============================================

app.post('/api/sms/send', authenticateToken, async (req, res) => {
  try {
    const { member_ids, message } = req.body;

    if (!member_ids || member_ids.length === 0) {
      return res.status(400).json({ error: 'No recipients selected' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!smsClient) {
      return res.status(503).json({ error: 'SMS service not configured' });
    }

    const placeholders = member_ids.map((_, i) => `$${i + 1}`).join(',');
    const result = await pool.query(`
      SELECT id, full_name, phone_number
      FROM members
      WHERE id IN (${placeholders})
      AND sms_consent = true
      AND is_active = true
    `, member_ids);

    const recipients = result.rows;

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No eligible recipients found' });
    }

    const costPerMessage = parseFloat(process.env.SMS_COST_PER_MESSAGE) || 0.16;
    const logResult = await pool.query(`
      INSERT INTO sms_logs (message, recipient_count, sent_by, cost_estimate)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [message, recipients.length, req.user.username, recipients.length * costPerMessage]);

    const smsLogId = logResult.rows[0].id;

    const sendPromises = recipients.map(async (recipient) => {
      try {
        const senderID = process.env.AZURE_SMS_SENDER_ID || 'SMS';

        const sendResults = await smsClient.send({
          from: senderID,
          to: [recipient.phone_number],
          message: message
        });

        const result = sendResults[0];

        if (result.successful) {
          console.log(`✅ SMS sent via Azure to: ${recipient.phone_number}`);

          await pool.query(`
            INSERT INTO sms_recipients (sms_log_id, member_id, phone_number, status, twilio_sid)
            VALUES ($1, $2, $3, $4, $5)
          `, [smsLogId, recipient.id, recipient.phone_number, 'sent', result.messageId]);

          return { success: true, recipient: recipient.full_name, messageId: result.messageId };
        } else {
          throw new Error(result.errorMessage || 'Unknown error');
        }
      } catch (err) {
        console.error(`❌ SMS send error for ${recipient.phone_number}:`, err.message);

        await pool.query(`
          INSERT INTO sms_recipients (sms_log_id, member_id, phone_number, status)
          VALUES ($1, $2, $3, $4)
        `, [smsLogId, recipient.id, recipient.phone_number, 'failed']);

        return { success: false, recipient: recipient.full_name, error: err.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;

    res.json({
      message: `SMS sent to ${successCount} of ${recipients.length} recipients`,
      sent: successCount,
      failed: recipients.length - successCount,
      details: results
    });
  } catch (err) {
    console.error('SMS send error:', err);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// Get SMS logs
app.get('/api/sms/logs', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT
        sl.*,
        json_agg(
          json_build_object(
            'id', sr.id,
            'full_name', m.full_name,
            'phone_number', sr.phone_number,
            'status', sr.status,
            'twilio_sid', sr.twilio_sid
          )
        ) FILTER (WHERE sr.id IS NOT NULL) as recipients
      FROM sms_logs sl
      LEFT JOIN sms_recipients sr ON sr.sms_log_id = sl.id
      LEFT JOIN members m ON sr.member_id = m.id
      GROUP BY sl.id
      ORDER BY sl.sent_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json(result.rows);
  } catch (err) {
    console.error('Get SMS logs error:', err);
    res.status(500).json({ error: 'Failed to retrieve SMS logs' });
  }
});

// Get SMS statistics
app.get('/api/sms/stats', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(recipient_count), 0)::integer as total_sent,
        COALESCE(SUM(CASE WHEN sent_at >= date_trunc('month', CURRENT_DATE) THEN recipient_count ELSE 0 END), 0)::integer as this_month,
        COALESCE(SUM(cost_estimate), 0) as total_cost
      FROM sms_logs
    `);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get SMS stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

// ============================================
// KONTINGENT (MEMBERSHIP FEES) ROUTES
// ============================================

app.get('/api/kontingent/:month', authenticateToken, async (req, res) => {
  try {
    const { month } = req.params;

    const result = await pool.query(`
      SELECT
        m.id as member_id,
        m.full_name,
        m.phone_number,
        m.personnummer,
        COALESCE(kp.paid, false) as paid,
        kp.payment_date,
        kp.amount,
        kp.notes,
        kp.recorded_by,
        kp.id as payment_id
      FROM members m
      LEFT JOIN kontingent_payments kp ON kp.member_id = m.id AND kp.payment_month = $1
      WHERE m.is_active = true
      ORDER BY m.full_name ASC
    `, [month]);

    res.json(result.rows);
  } catch (err) {
    console.error('Get kontingent error:', err);
    res.status(500).json({ error: 'Failed to retrieve kontingent data' });
  }
});

app.post('/api/kontingent/update', authenticateToken, async (req, res) => {
  try {
    const { memberId, month, paid, amount, notes } = req.body;

    if (!memberId || !month) {
      return res.status(400).json({ error: 'Member ID and month are required' });
    }

    const paymentDate = paid ? new Date().toISOString().split('T')[0] : null;

    const result = await pool.query(`
      INSERT INTO kontingent_payments (member_id, payment_month, paid, payment_date, amount, notes, recorded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (member_id, payment_month)
      DO UPDATE SET
        paid = $3,
        payment_date = $4,
        amount = $5,
        notes = $6,
        recorded_by = $7,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [memberId, month, paid, paymentDate, amount || null, notes || null, req.user.username]);

    await logAudit(
      req.user.username,
      paid ? 'MARK_PAID' : 'MARK_UNPAID',
      'kontingent_payments',
      result.rows[0].id,
      null,
      { memberId, month, paid, amount },
      req.ip
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update kontingent error:', err);
    res.status(500).json({ error: 'Failed to update kontingent payment' });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Debre Iyesus Church Backend',
    features: {
      church_info: 'enabled',
      members: 'enabled',
      sms: smsClient ? 'enabled (Azure)' : 'disabled'
    }
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Debre Iyesus Church Backend              ║
║   ✅ Running on port ${PORT}                ║
║   📡 API: http://localhost:${PORT}/api     ║
╚════════════════════════════════════════════╝
  `);
});
