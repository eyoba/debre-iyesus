-- Make phone_number field optional in members table
-- This allows adding members without a phone number (e.g., children)

ALTER TABLE members
ALTER COLUMN phone_number DROP NOT NULL;
