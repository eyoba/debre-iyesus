-- Make personnummer field optional in members table
-- This allows adding members without a personnummer

ALTER TABLE members
ALTER COLUMN personnummer DROP NOT NULL;
