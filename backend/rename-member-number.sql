-- Rename member_number to card_number to match frontend/backend code
-- This allows the medlemskortnummer (EROTCHDEID) field to work properly

ALTER TABLE members
RENAME COLUMN member_number TO card_number;
