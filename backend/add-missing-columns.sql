-- Add missing columns to church_info table
-- This migration adds columns that were added after initial schema

-- Add nav_title column (for custom navigation title)
ALTER TABLE church_info
ADD COLUMN IF NOT EXISTS nav_title VARCHAR(255) DEFAULT 'Churches Directory';

-- Add about_content column (for About section)
ALTER TABLE church_info
ADD COLUMN IF NOT EXISTS about_content TEXT;

-- Add facebook column
ALTER TABLE church_info
ADD COLUMN IF NOT EXISTS facebook VARCHAR(255);

-- Add show_members_link column
ALTER TABLE church_info
ADD COLUMN IF NOT EXISTS show_members_link BOOLEAN DEFAULT false;

-- Add customizable field labels
ALTER TABLE church_info
ADD COLUMN IF NOT EXISTS field_label_pastor VARCHAR(100) DEFAULT 'Pastor';

ALTER TABLE church_info
ADD COLUMN IF NOT EXISTS field_label_address VARCHAR(100) DEFAULT 'Address';

ALTER TABLE church_info
ADD COLUMN IF NOT EXISTS field_label_phone VARCHAR(100) DEFAULT 'Phone';

ALTER TABLE church_info
ADD COLUMN IF NOT EXISTS field_label_email VARCHAR(100) DEFAULT 'Email';

ALTER TABLE church_info
ADD COLUMN IF NOT EXISTS field_label_website VARCHAR(100) DEFAULT 'Website';

ALTER TABLE church_info
ADD COLUMN IF NOT EXISTS field_label_facebook VARCHAR(100) DEFAULT 'Facebook';
