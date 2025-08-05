-- Template Versions Migration
-- Add support for multiple template versions per user

-- Create template_versions table
CREATE TABLE IF NOT EXISTS template_versions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Add version_id to onboarding_templates table
ALTER TABLE onboarding_templates ADD COLUMN version_id TEXT;

-- Add version_id to jtbd_categories table  
ALTER TABLE jtbd_categories ADD COLUMN version_id TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_template_versions_user_id ON template_versions (user_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_user_default ON template_versions (user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_version_id ON onboarding_templates (version_id);
CREATE INDEX IF NOT EXISTS idx_jtbd_categories_version_id ON jtbd_categories (version_id);

-- Add foreign key constraints for version_id
-- Note: SQLite doesn't support adding foreign key constraints to existing tables
-- So we'll handle this constraint in the application logic

-- Create a default version for existing users
-- This will be handled in the application migration logic
