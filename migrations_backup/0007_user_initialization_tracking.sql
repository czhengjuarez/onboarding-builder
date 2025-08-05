-- Migration: Add user initialization tracking
-- Created: 2025-01-04
-- Description: Add has_been_initialized flag to users table to prevent re-seeding starter content for intentionally empty accounts

-- Add has_been_initialized column to users table
ALTER TABLE users ADD COLUMN has_been_initialized BOOLEAN DEFAULT 0;

-- Set existing users as initialized (they already have accounts)
UPDATE users SET has_been_initialized = 1;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_initialized ON users(has_been_initialized);
