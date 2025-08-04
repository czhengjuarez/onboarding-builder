-- Add password authentication support to users table
-- This allows users to register with email/password in addition to Google OAuth

-- Add password_hash column for email/password authentication
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Make email unique to prevent duplicate accounts
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Update existing Google OAuth users to have NULL password_hash (they use OAuth only)
-- New users can register with either Google OAuth or email/password
