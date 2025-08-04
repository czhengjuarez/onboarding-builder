-- Update JTBD Resources schema to support Jobs To Be Done framework
-- This migration adds support for resource categories with job statements

-- Drop the old simple jtbd_resources table
DROP TABLE IF EXISTS jtbd_resources;

-- Create new JTBD resource categories table
CREATE TABLE IF NOT EXISTS jtbd_categories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    job TEXT NOT NULL,           -- "When I need to..."
    situation TEXT NOT NULL,     -- "I want..."
    outcome TEXT NOT NULL,       -- "So I can..."
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create resources table that belongs to categories
CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,          -- 'guide', 'tool', 'reference', 'template', 'database'
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES jtbd_categories (id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jtbd_categories_user_id ON jtbd_categories (user_id);
CREATE INDEX IF NOT EXISTS idx_resources_category_id ON resources (category_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources (type);
