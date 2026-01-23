const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all leads
router.get('/leads', async (req, res) => {
  try {
    const result = await query('SELECT * FROM leads ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get all players
router.get('/players', async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM players_editors WHERE role = 'player' ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching players:', err);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Get all editors
router.get('/editors', async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM players_editors WHERE role = 'editor' ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching editors:', err);
    res.status(500).json({ error: 'Failed to fetch editors' });
  }
});

// Get full roster (all in one call)
router.get('/roster', async (req, res) => {
  try {
    const [leads, players, editors] = await Promise.all([
      query('SELECT * FROM leads ORDER BY name ASC'),
      query("SELECT * FROM players_editors WHERE role = 'player' ORDER BY name ASC"),
      query("SELECT * FROM players_editors WHERE role = 'editor' ORDER BY name ASC"),
    ]);
    res.json({
      leads: leads.rows,
      players: players.rows,
      editors: editors.rows,
    });
  } catch (err) {
    console.error('Error fetching roster:', err);
    res.status(500).json({ error: 'Failed to fetch roster' });
  }
});

// Get home page settings (featured video + recent videos + player videos)
router.get('/home-settings', async (req, res) => {
  try {
    const [featuredResult, recentResult, playerVidsResult] = await Promise.all([
      query("SELECT value FROM settings WHERE key = 'home_featured_video'"),
      query("SELECT value FROM settings WHERE key = 'home_recent_videos'"),
      query("SELECT value FROM settings WHERE key = 'home_recent_player_videos'")
    ]);

    const featuredVideoId = featuredResult.rows[0]?.value || 'exvWgTTb61w';
    let recentVideos = [];
    let recentPlayerVideos = [];

    if (recentResult.rows[0]?.value) {
      try {
        recentVideos = JSON.parse(recentResult.rows[0].value);
      } catch (e) {
        recentVideos = [];
      }
    }

    if (playerVidsResult.rows[0]?.value) {
      try {
        recentPlayerVideos = JSON.parse(playerVidsResult.rows[0].value);
      } catch (e) {
        recentPlayerVideos = [];
      }
    }

    // Default videos if none set
    if (recentVideos.length === 0) {
      recentVideos = [
        { id: 'wqFkG48AHB4', title: 'Recent Video 1' },
        { id: 'W27bosQ6Nhw', title: 'Recent Video 2' },
        { id: 'ZB2mFI3kroc', title: 'Recent Video 3' },
        { id: '2ck8ymKZOmk', title: 'Recent Video 4' },
      ];
    }

    res.json({ featuredVideoId, recentVideos, recentPlayerVideos });
  } catch (err) {
    console.error('Error fetching home settings:', err);
    res.status(500).json({ error: 'Failed to fetch home settings' });
  }
});

// Get featured valhalla player
router.get('/featured-player', async (req, res) => {
  try {
    const setting = await query("SELECT value FROM settings WHERE key = 'featured_valhalla_player'");
    if (!setting.rows[0]?.value) {
      return res.json({ player: null });
    }

    const [type, name] = setting.rows[0].value.split(':');
    let player = null;

    if (type === 'lead') {
      const result = await query('SELECT * FROM leads WHERE name = $1', [name]);
      player = result.rows[0] || null;
    } else {
      const result = await query('SELECT * FROM players_editors WHERE name = $1', [name]);
      player = result.rows[0] || null;
    }

    res.json({ player, type });
  } catch (err) {
    console.error('Error fetching featured player:', err);
    res.status(500).json({ error: 'Failed to fetch featured player' });
  }
});

module.exports = router;
