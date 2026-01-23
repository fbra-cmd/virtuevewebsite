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

-- Sample data for testing (optional - remove in production)
INSERT INTO leads (name, valhalla_clips, avatar_url, twitter_url, youtube_url) VALUES
('Leader1', 150, 'https://via.placeholder.com/1000', 'https://twitter.com/leader1', 'https://youtube.com/@leader1');

INSERT INTO players_editors (name, role, recent_vid, valhalla_clips, avatar_url, twitter_url, youtube_url) VALUES
('Player1', 'player', 'https://youtu.be/example1', 120, 'https://via.placeholder.com/1000', 'https://twitter.com/player1', 'https://youtube.com/@player1'),
('Editor1', 'editor', 'https://youtu.be/example2', 80, 'https://via.placeholder.com/1000', 'https://twitter.com/editor1', 'https://youtube.com/@editor1');
