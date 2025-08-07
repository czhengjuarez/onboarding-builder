-- Migration: Add clone source tracking
-- Created: 2025-01-07
-- Description: Add source_shared_token field to template_versions table to track which shared templates have been cloned

-- Add source_shared_token to template_versions table to track the original shared template
ALTER TABLE template_versions ADD COLUMN source_shared_token TEXT;

-- Create index for faster lookups by source token
CREATE INDEX IF NOT EXISTS idx_template_versions_source_token ON template_versions(source_shared_token);

-- Create composite index for user + source token lookups (for duplicate detection)
CREATE INDEX IF NOT EXISTS idx_template_versions_user_source ON template_versions(user_id, source_shared_token);
