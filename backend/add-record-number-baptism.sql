-- Add record_number (ተ.ቁ) column to baptism_records table

ALTER TABLE baptism_records
ADD COLUMN IF NOT EXISTS record_number VARCHAR(50);
