-- ============================================
-- DEBRE IYESUS CHURCH DATABASE SCHEMA
-- Single Church Website with Members Management
-- ============================================

-- Church Information Table (single church)
CREATE TABLE IF NOT EXISTS church_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'Debre Iyesus Church',
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(255),

    -- Pastor/Staff info
    pastor_name VARCHAR(100),
    pastor_phone VARCHAR(50),
    pastor_email VARCHAR(100),
    pastor_bio TEXT,

    -- Service times
    sunday_service_time VARCHAR(100),
    wednesday_service_time VARCHAR(100),
    other_service_times TEXT,

    -- Description
    description TEXT,
    mission_statement TEXT,

    -- Visual settings
    logo_url VARCHAR(500),
    background_color VARCHAR(20) DEFAULT '#3b82f6',

    -- Social media
    facebook VARCHAR(255),

    -- Navigation and content
    nav_title VARCHAR(255) DEFAULT 'Churches Directory',
    about_content TEXT,

    -- Customizable field labels
    field_label_pastor VARCHAR(100) DEFAULT 'Pastor',
    field_label_address VARCHAR(100) DEFAULT 'Address',
    field_label_phone VARCHAR(100) DEFAULT 'Phone',
    field_label_email VARCHAR(100) DEFAULT 'Email',
    field_label_website VARCHAR(100) DEFAULT 'Website',
    field_label_facebook VARCHAR(100) DEFAULT 'Facebook',

    -- Display options
    show_members_link BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table (for both church info and members management)
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(100),
    is_super_admin BOOLEAN DEFAULT false, -- Can manage church info
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News/Announcements
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES admins(id),
    published_date TIMESTAMP,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    location VARCHAR(255),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50),
    is_published BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photo gallery
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    uploaded_by INTEGER REFERENCES admins(id),
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members table (Norwegian church members with personnummer)
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    -- Personal Information
    full_name VARCHAR(200) NOT NULL,
    phone_number VARCHAR(20), -- Optional - can be NULL (e.g., children without phones)
    email VARCHAR(100),
    personnummer VARCHAR(11), -- Optional - can be NULL
    card_number VARCHAR(50) UNIQUE, -- Medlemskortnummer (EROTCHDEID)

    -- Address
    address VARCHAR(500),
    postal_code VARCHAR(10),
    city VARCHAR(100),

    -- Member Information
    member_since DATE,
    baptized BOOLEAN DEFAULT false,
    baptism_date DATE,
    sms_consent BOOLEAN DEFAULT true,
    notes TEXT,

    -- System fields
    consent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100)
);

-- Kontingent (membership fees) tracking
CREATE TABLE IF NOT EXISTS kontingent_payments (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    payment_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    paid BOOLEAN DEFAULT false,
    payment_date DATE,
    amount DECIMAL(10,2),
    notes TEXT,
    recorded_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, payment_month)
);

-- SMS logs table
CREATE TABLE IF NOT EXISTS sms_logs (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    recipient_count INTEGER NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_by VARCHAR(100),
    cost_estimate DECIMAL(10,2)
);

-- SMS recipients table (many-to-many)
CREATE TABLE IF NOT EXISTS sms_recipients (
    id SERIAL PRIMARY KEY,
    sms_log_id INTEGER NOT NULL REFERENCES sms_logs(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'sent',
    twilio_sid VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table for GDPR compliance
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    action VARCHAR(100),
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone_number);
CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(full_name);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(is_published, published_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_photos_published ON photos(is_published, display_order);
CREATE INDEX IF NOT EXISTS idx_sms_logs_sent_at ON sms_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_kontingent_month ON kontingent_payments(payment_month);

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default church info
INSERT INTO church_info (
    name,
    address,
    description,
    background_color
) VALUES (
    'Debre Iyesus Church',
    'Your Church Address',
    'Welcome to Debre Iyesus Church',
    '#3b82f6'
) ON CONFLICT DO NOTHING;

-- Insert default admin user
-- Username: admin
-- Password: admin123 (CHANGE THIS IN PRODUCTION!)
INSERT INTO admins (username, password_hash, full_name, email, is_super_admin)
VALUES (
    'admin',
    '$2b$10$YourHashWillBeReplacedByScript',
    'System Administrator',
    'admin@debreiyesus.no',
    true
)
ON CONFLICT (username) DO NOTHING;

-- Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO church_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO church_user;
