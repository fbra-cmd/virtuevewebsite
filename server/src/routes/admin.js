const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { adminAuth } = require('../middleware/auth');

// Login endpoint - verify password
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, token: password });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// All routes below require authentication
router.use(adminAuth);

// ============ LEADS ============

// Create lead
router.post('/leads', async (req, res) => {
  const { name, valhalla_clips, avatar_url, twitter_url, youtube_url } = req.body;
  try {
    const result = await query(
      `INSERT INTO leads (name, valhalla_clips, avatar_url, twitter_url, youtube_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, valhalla_clips || 0, avatar_url, twitter_url, youtube_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating lead:', err);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update lead
router.put('/leads/:id', async (req, res) => {
  const { id } = req.params;
  const { name, valhalla_clips, avatar_url, twitter_url, youtube_url } = req.body;
  try {
    const result = await query(
      `UPDATE leads SET name = $1, valhalla_clips = $2, avatar_url = $3,
       twitter_url = $4, youtube_url = $5 WHERE id = $6 RETURNING *`,
      [name, valhalla_clips || 0, avatar_url, twitter_url, youtube_url, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating lead:', err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Delete lead
router.delete('/leads/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM leads WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting lead:', err);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// ============ PLAYERS/EDITORS ============

// Create player/editor
router.post('/members', async (req, res) => {
  const { name, role, recent_vid, valhalla_clips, avatar_url, twitter_url, youtube_url } = req.body;
  try {
    const result = await query(
      `INSERT INTO players_editors (name, role, recent_vid, valhalla_clips, avatar_url, twitter_url, youtube_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, role || 'player', recent_vid, valhalla_clips || 0, avatar_url, twitter_url, youtube_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating member:', err);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// Update player/editor
router.put('/members/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, recent_vid, valhalla_clips, avatar_url, twitter_url, youtube_url } = req.body;
  try {
    const result = await query(
      `UPDATE players_editors SET name = $1, role = $2, recent_vid = $3, valhalla_clips = $4,
       avatar_url = $5, twitter_url = $6, youtube_url = $7 WHERE id = $8 RETURNING *`,
      [name, role, recent_vid, valhalla_clips || 0, avatar_url, twitter_url, youtube_url, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating member:', err);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete player/editor
router.delete('/members/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM players_editors WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting member:', err);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// ============ HOME PAGE SETTINGS ============

// Update home page settings (featured video + recent videos + player videos)
router.put('/home-settings', async (req, res) => {
  const { featuredVideoId, recentVideos, recentPlayerVideos } = req.body;

  try {
    // Update or insert featured video
    if (featuredVideoId !== undefined) {
      const existingFeatured = await query("SELECT key FROM settings WHERE key = 'home_featured_video'");
      if (existingFeatured.rows.length > 0) {
        await query("UPDATE settings SET value = $1 WHERE key = 'home_featured_video'", [featuredVideoId]);
      } else {
        await query("INSERT INTO settings (key, value) VALUES ('home_featured_video', $1)", [featuredVideoId]);
      }
    }

    // Update or insert recent videos
    if (recentVideos !== undefined) {
      const existingRecent = await query("SELECT key FROM settings WHERE key = 'home_recent_videos'");
      const videosJson = JSON.stringify(recentVideos);
      if (existingRecent.rows.length > 0) {
        await query("UPDATE settings SET value = $1 WHERE key = 'home_recent_videos'", [videosJson]);
      } else {
        await query("INSERT INTO settings (key, value) VALUES ('home_recent_videos', $1)", [videosJson]);
      }
    }

    // Update or insert recent player videos
    if (recentPlayerVideos !== undefined) {
      const existingPlayerVids = await query("SELECT key FROM settings WHERE key = 'home_recent_player_videos'");
      const playerVidsJson = JSON.stringify(recentPlayerVideos);
      if (existingPlayerVids.rows.length > 0) {
        await query("UPDATE settings SET value = $1 WHERE key = 'home_recent_player_videos'", [playerVidsJson]);
      } else {
        await query("INSERT INTO settings (key, value) VALUES ('home_recent_player_videos', $1)", [playerVidsJson]);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating home settings:', err);
    res.status(500).json({ error: 'Failed to update home settings' });
  }
});

// ============ FEATURED VALHALLA PLAYER ============

// Set featured player by name (also increments their valhalla_clips)
router.put('/featured-player', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Player name is required' });
  }

  try {
    // First check if player exists in leads
    let result = await query('SELECT * FROM leads WHERE LOWER(name) = LOWER($1)', [name]);
    let type = 'lead';

    // If not found in leads, check players_editors
    if (result.rows.length === 0) {
      result = await query('SELECT * FROM players_editors WHERE LOWER(name) = LOWER($1)', [name]);
      type = result.rows[0]?.role || 'player';
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const player = result.rows[0];

    // Update the featured player setting
    await query(
      "UPDATE settings SET value = $1 WHERE key = 'featured_valhalla_player'",
      [`${type}:${player.name}`]
    );

    // Increment the player's valhalla_clips count
    if (type === 'lead') {
      await query('UPDATE leads SET valhalla_clips = valhalla_clips + 1 WHERE id = $1', [player.id]);
    } else {
      await query('UPDATE players_editors SET valhalla_clips = valhalla_clips + 1 WHERE id = $1', [player.id]);
    }

    // Fetch updated player data
    let updatedPlayer;
    if (type === 'lead') {
      updatedPlayer = await query('SELECT * FROM leads WHERE id = $1', [player.id]);
    } else {
      updatedPlayer = await query('SELECT * FROM players_editors WHERE id = $1', [player.id]);
    }

    res.json({ success: true, player: updatedPlayer.rows[0], type });
  } catch (err) {
    console.error('Error setting featured player:', err);
    res.status(500).json({ error: 'Failed to set featured player' });
  }
});

module.exports = router;
