-- Add baptism name and godparent name columns to members table

-- ስም ጥምቀት (ክርስትና) - Baptism/Christening name
ALTER TABLE members
ADD COLUMN IF NOT EXISTS baptism_name VARCHAR(200);

-- ስም ኣቦ ንስሓ - Godfather/Godparent name
ALTER TABLE members
ADD COLUMN IF NOT EXISTS godparent_name VARCHAR(200);
