-- Drop existing tables if they exist
DROP TABLE IF EXISTS players_editors;
DROP TABLE IF EXISTS leads;

-- Create leads table
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    valhalla_clips INTEGER DEFAULT 0,
    avatar_url VARCHAR(500),
    twitter_url VARCHAR(500),
    youtube_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create players_editors table
CREATE TABLE players_editors (
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

-- Insert leads (fex, zorz, matt)
INSERT INTO leads (name) VALUES
('Fex'),
('Zorz'),
('Matt');

-- Insert players (unique names from airs.txt, excluding leads)
INSERT INTO players_editors (name, role) VALUES
('Airs', 'player'),
('Angela', 'player'),
('Arche', 'player'),
('Bails', 'player'),
('Bxn', 'player'),
('Clue', 'player'),
('Copes', 'player'),
('Crakrz', 'player'),
('Exlcs', 'player'),
('Lukso', 'player'),
('Gerilla', 'player'),
('Hage', 'player'),
('Hyb', 'player'),
('Inks', 'player'),
('Jokr', 'player'),
('Josh', 'player'),
('Kezr', 'player'),
('Leyko', 'player'),
('Murdr', 'player'),
('Parks', 'player'),
('Pexi', 'player'),
('Pr1n', 'player'),
('Pred', 'player'),
('Prmzy', 'player'),
('Raids', 'player'),
('Rcky', 'player'),
('Sfty', 'player'),
('Smthy', 'player'),
('Stx', 'player'),
('T7ue', 'player'),
('Teqhzi', 'player'),
('Truth', 'player'),
('Txnm', 'player'),
('Vaasto', 'player'),
('Virus', 'player'),
('Wags', 'player'),
('Wavy', 'player'),
('Wigi', 'player'),
('Slu', 'player'),
('Cub', 'player'),
('Wayne', 'player'),
('Luke', 'player'),
('Tenaz', 'player'),
('Sfz', 'player'),
('xRec', 'player'),
('Serv', 'player'),
('Yeka', 'player'),
('Skyzz', 'player'),
('Eros', 'player'),
('Declan', 'player'),
('Fred', 'player'),
('Brady', 'player'),
('Zkrm', 'player'),
('Jyn', 'player');
