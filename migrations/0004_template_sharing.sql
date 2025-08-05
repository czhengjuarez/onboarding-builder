-- Migration: Add template sharing functionality
-- Created: 2025-01-03
-- Description: Add shared_templates table for invite link system

CREATE TABLE IF NOT EXISTS shared_templates (
    id TEXT PRIMARY KEY,
    template_id TEXT,
    owner_user_id TEXT NOT NULL,
    invite_token TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    clone_count INTEGER DEFAULT 0,
    max_clones INTEGER DEFAULT NULL, -- NULL means unlimited
    FOREIGN KEY (template_id) REFERENCES onboarding_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups by invite token
CREATE INDEX IF NOT EXISTS idx_shared_templates_token ON shared_templates(invite_token);

-- Create index for faster lookups by owner
CREATE INDEX IF NOT EXISTS idx_shared_templates_owner ON shared_templates(owner_user_id);

-- Create index for active shared templates
CREATE INDEX IF NOT EXISTS idx_shared_templates_active ON shared_templates(is_active, expires_at);
