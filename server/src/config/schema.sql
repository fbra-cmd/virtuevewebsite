-- Database schema for Virtue Roster

-- Players and Editors table
CREATE TABLE IF NOT EXISTS players_editors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('player', 'editor')),
    recent_vid VARCHAR(500),
    valhalla_clips INTEGER DEFAULT 0,
    avatar_url VARCHAR(500),
    twitter_url VARCHAR(500),
    youtube_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    valhalla_clips INTEGER DEFAULT 0,
    avatar_url VARCHAR(500),
    twitter_url VARCHAR(500),
    youtube_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table (stores home page config, featured player, etc.)
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
