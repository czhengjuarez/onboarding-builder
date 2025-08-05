-- Migration: Add version support to shared templates
-- Created: 2025-01-04
-- Description: Add version_id column to shared_templates table for version-specific sharing

-- Add version_id column to shared_templates table
ALTER TABLE shared_templates ADD COLUMN version_id TEXT;

-- Add foreign key constraint to template_versions table
-- Note: SQLite doesn't support adding foreign key constraints to existing tables,
-- so we'll handle the relationship at the application level

-- Create index for faster lookups by version
CREATE INDEX IF NOT EXISTS idx_shared_templates_version ON shared_templates(version_id);
