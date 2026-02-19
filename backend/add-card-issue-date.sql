-- Add card_issue_date column to members table
-- This field stores when the membership card was issued

ALTER TABLE members
ADD COLUMN IF NOT EXISTS card_issue_date DATE;
