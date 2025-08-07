-- Migration: Add version_id to shared_templates table
-- Created: 2025-01-05
-- Description: Add version_id column to support version-specific template sharing

-- Add version_id column to shared_templates table
ALTER TABLE shared_templates ADD COLUMN version_id TEXT;

-- Add foreign key constraint to template_versions table
-- Note: SQLite doesn't support adding foreign key constraints to existing tables
-- So we'll handle the relationship logically in the application

-- Create index for faster lookups by version
CREATE INDEX IF NOT EXISTS idx_shared_templates_version ON shared_templates(version_id);
