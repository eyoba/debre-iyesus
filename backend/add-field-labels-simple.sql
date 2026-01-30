-- Add field label columns to church_info table
ALTER TABLE church_info
ADD COLUMN IF NOT EXISTS field_label_pastor VARCHAR(100) DEFAULT 'Pastor',
ADD COLUMN IF NOT EXISTS field_label_address VARCHAR(100) DEFAULT 'Address',
ADD COLUMN IF NOT EXISTS field_label_phone VARCHAR(100) DEFAULT 'Phone',
ADD COLUMN IF NOT EXISTS field_label_email VARCHAR(100) DEFAULT 'Email',
ADD COLUMN IF NOT EXISTS field_label_website VARCHAR(100) DEFAULT 'Website',
ADD COLUMN IF NOT EXISTS field_label_facebook VARCHAR(100) DEFAULT 'Facebook',
ADD COLUMN IF NOT EXISTS facebook VARCHAR(255),
ADD COLUMN IF NOT EXISTS show_members_link BOOLEAN DEFAULT false;

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'church_info'
  AND column_name LIKE 'field_label%'
ORDER BY column_name;
