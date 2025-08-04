-- Initial schema for onboarding-builder application
-- Migrating from Firebase to Cloudflare D1

-- Users table for authentication and profile management
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    profile_image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Onboarding templates table
CREATE TABLE IF NOT EXISTS onboarding_templates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    period TEXT NOT NULL, -- 'firstDay', 'firstWeek', 'firstMonth', etc.
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- JTBD (Jobs To Be Done) resources table
CREATE TABLE IF NOT EXISTS jtbd_resources (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    resource_type TEXT DEFAULT 'link', -- 'link', 'document', 'video', etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_user_id ON onboarding_templates (user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_templates_period ON onboarding_templates (period);
CREATE INDEX IF NOT EXISTS idx_jtbd_resources_user_id ON jtbd_resources (user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
