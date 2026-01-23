import { useState, useEffect } from 'react';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || '';

function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [roster, setRoster] = useState({ leads: [], players: [], editors: [] });
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(null);
  const [featuredPlayer, setFeaturedPlayer] = useState(null);
  const [featuredPlayerName, setFeaturedPlayerName] = useState('');
  const [featuredError, setFeaturedError] = useState('');
  const [featuredSuccess, setFeaturedSuccess] = useState('');

  // Tab state
  const [activeTab, setActiveTab] = useState('roster');

  // Home page settings state
  const [homeSettings, setHomeSettings] = useState({
    featuredVideoId: '',
    recentVideos: [
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
      { id: '', title: '' },
    ],
    recentPlayerVideos: [
      { id: '', title: '', playerName: '' },
      { id: '', title: '', playerName: '' },
      { id: '', title: '', playerName: '' },
      { id: '', title: '', playerName: '' },
    ],
  });
  const [homeSaving, setHomeSaving] = useState(false);
  const [homeError, setHomeError] = useState('');
  const [homeSuccess, setHomeSuccess] = useState('');

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
      fetchRoster(token);
      fetchHomeSettings();
    }
  }, []);

  const fetchRoster = async (token) => {
    try {
      const [rosterRes, featuredRes] = await Promise.all([
        fetch(`${API_URL}/api/roster`),
        fetch(`${API_URL}/api/featured-player`)
      ]);
      const rosterData = await rosterRes.json();
      const featuredData = await featuredRes.json();
      setRoster(rosterData);
      setFeaturedPlayer(featuredData.player);
    } catch (err) {
      console.error('Failed to fetch roster:', err);
    }
  };

  const fetchHomeSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/home-settings`);
      const data = await res.json();
      // Ensure we always have 4 video slots
      const videos = data.recentVideos || [];
      while (videos.length < 4) {
        videos.push({ id: '', title: '' });
      }
      // Ensure we always have 4 player video slots
      const playerVideos = data.recentPlayerVideos || [];
      while (playerVideos.length < 4) {
        playerVideos.push({ id: '', title: '', playerName: '' });
      }
      setHomeSettings({
        featuredVideoId: data.featuredVideoId || '',
        recentVideos: videos.slice(0, 4),
        recentPlayerVideos: playerVideos.slice(0, 4),
      });
    } catch (err) {
      console.error('Failed to fetch home settings:', err);
    }
  };

  const handleSaveHomeSettings = async (e) => {
    e.preventDefault();
    setHomeSaving(true);
    setHomeError('');
    setHomeSuccess('');

    try {
      const res = await fetch(`${API_URL}/api/admin/home-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(homeSettings),
      });

      if (res.ok) {
        setHomeSuccess('Home page settings saved successfully!');
        setTimeout(() => setHomeSuccess(''), 3000);
      } else {
        const err = await res.json();
        setHomeError(err.error || 'Failed to save settings');
      }
    } catch (err) {
      setHomeError('Failed to save settings');
    }
    setHomeSaving(false);
  };

  const updateRecentVideo = (index, field, value) => {
    const newVideos = [...homeSettings.recentVideos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    setHomeSettings({ ...homeSettings, recentVideos: newVideos });
  };

  const updatePlayerVideo = (index, field, value) => {
    const newVideos = [...homeSettings.recentPlayerVideos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    setHomeSettings({ ...homeSettings, recentPlayerVideos: newVideos });
  };

  const handleSetFeaturedPlayer = async (e) => {
    e.preventDefault();
    setFeaturedError('');
    setFeaturedSuccess('');

    if (!featuredPlayerName.trim()) {
      setFeaturedError('Please enter a player name');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/featured-player`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: featuredPlayerName }),
      });

      if (res.ok) {
        const data = await res.json();
        setFeaturedPlayer(data.player);
        setFeaturedPlayerName('');
        setFeaturedSuccess(`${data.player.name} is now the featured player (+1 Valhalla Clip)`);
        fetchRoster(getToken()); // Refresh to show updated clip count
        setTimeout(() => setFeaturedSuccess(''), 3000);
      } else {
        const err = await res.json();
        setFeaturedError(err.error || 'Player not found');
      }
    } catch (err) {
      setFeaturedError('Failed to update featured player');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
        fetchRoster(data.token);
        fetchHomeSettings();
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Connection error');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setPassword('');
  };

  const getToken = () => localStorage.getItem('adminToken');

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    const endpoint = type === 'lead' ? 'leads' : 'members';
    try {
      const res = await fetch(`${API_URL}/api/admin/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (res.ok) {
        fetchRoster(getToken());
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleSave = async (type, data) => {
    const endpoint = type === 'lead' ? 'leads' : 'members';
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id
      ? `${API_URL}/api/admin/${endpoint}/${data.id}`
      : `${API_URL}/api/admin/${endpoint}`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setEditingItem(null);
        setShowAddForm(null);
        fetchRoster(getToken());
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login">
        <form onSubmit={handleLogin} className="login-form">
          <h1>Admin Access</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Checking...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          Roster
        </button>
        <button
          className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Home Page
        </button>
      </div>

      {/* Roster Tab Content */}
      {activeTab === 'roster' && (
        <>
          {/* Featured Valhalla Player Section */}
      <section className="admin-section featured-section">
        <div className="section-header">
          <h2>Most Recent Valhalla Clip</h2>
        </div>
        <div className="featured-current">
          {featuredPlayer ? (
            <span>Current: <strong>{featuredPlayer.name}</strong> ({featuredPlayer.valhalla_clips} clips)</span>
          ) : (
            <span>No featured player set</span>
          )}
        </div>
        <form onSubmit={handleSetFeaturedPlayer} className="featured-form">
          <input
            type="text"
            placeholder="Enter player name..."
            value={featuredPlayerName}
            onChange={(e) => setFeaturedPlayerName(e.target.value)}
          />
          <button type="submit" className="change-btn">Change</button>
        </form>
        {featuredError && <p className="featured-error">{featuredError}</p>}
        {featuredSuccess && <p className="featured-success">{featuredSuccess}</p>}
      </section>

      {/* Leaders Section */}
      <section className="admin-section">
        <div className="section-header">
          <h2>Leaders</h2>
          <button onClick={() => setShowAddForm('lead')} className="add-btn">+ Add Leader</button>
        </div>

        {showAddForm === 'lead' && (
          <EditForm
            type="lead"
            onSave={(data) => handleSave('lead', data)}
            onCancel={() => setShowAddForm(null)}
          />
        )}

        <div className="members-list">
          {roster.leads.map((lead) => (
            <div key={lead.id} className="member-item">
              {editingItem?.id === lead.id && editingItem?.type === 'lead' ? (
                <EditForm
                  type="lead"
                  initialData={lead}
                  onSave={(data) => handleSave('lead', { ...data, id: lead.id })}
                  onCancel={() => setEditingItem(null)}
                />
              ) : (
                <>
                  <div className="member-info">
                    <span className="member-name">{lead.name}</span>
                    <span className="member-clips">{lead.valhalla_clips} clips</span>
                  </div>
                  <div className="member-actions">
                    <button onClick={() => setEditingItem({ id: lead.id, type: 'lead' })}>Edit</button>
                    <button onClick={() => handleDelete('lead', lead.id)} className="delete-btn">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Players Section */}
      <section className="admin-section">
        <div className="section-header">
          <h2>Players</h2>
          <button onClick={() => setShowAddForm('player')} className="add-btn">+ Add Player</button>
        </div>

        {showAddForm === 'player' && (
          <EditForm
            type="player"
            onSave={(data) => handleSave('member', { ...data, role: 'player' })}
            onCancel={() => setShowAddForm(null)}
          />
        )}

        <div className="members-list">
          {roster.players.map((player) => (
            <div key={player.id} className="member-item">
              {editingItem?.id === player.id && editingItem?.type === 'player' ? (
                <EditForm
                  type="player"
                  initialData={player}
                  onSave={(data) => handleSave('member', { ...data, id: player.id, role: 'player' })}
                  onCancel={() => setEditingItem(null)}
                />
              ) : (
                <>
                  <div className="member-info">
                    <span className="member-name">{player.name}</span>
                    <span className="member-clips">{player.valhalla_clips} clips</span>
                  </div>
                  <div className="member-actions">
                    <button onClick={() => setEditingItem({ id: player.id, type: 'player' })}>Edit</button>
                    <button onClick={() => handleDelete('member', player.id)} className="delete-btn">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Editors Section */}
      <section className="admin-section">
        <div className="section-header">
          <h2>Editors</h2>
          <button onClick={() => setShowAddForm('editor')} className="add-btn">+ Add Editor</button>
        </div>

        {showAddForm === 'editor' && (
          <EditForm
            type="editor"
            onSave={(data) => handleSave('member', { ...data, role: 'editor' })}
            onCancel={() => setShowAddForm(null)}
          />
        )}

        <div className="members-list">
          {roster.editors.map((editor) => (
            <div key={editor.id} className="member-item">
              {editingItem?.id === editor.id && editingItem?.type === 'editor' ? (
                <EditForm
                  type="editor"
                  initialData={editor}
                  onSave={(data) => handleSave('member', { ...data, id: editor.id, role: 'editor' })}
                  onCancel={() => setEditingItem(null)}
                />
              ) : (
                <>
                  <div className="member-info">
                    <span className="member-name">{editor.name}</span>
                    <span className="member-clips">{editor.valhalla_clips} clips</span>
                  </div>
                  <div className="member-actions">
                    <button onClick={() => setEditingItem({ id: editor.id, type: 'editor' })}>Edit</button>
                    <button onClick={() => handleDelete('member', editor.id)} className="delete-btn">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
        </>
      )}

      {/* Home Page Tab Content */}
      {activeTab === 'home' && (
        <div className="home-settings">
          <form onSubmit={handleSaveHomeSettings} className="home-settings-form">
            {/* Featured Video Section */}
            <section className="admin-section home-video-section">
              <div className="section-header">
                <h2>Featured Video</h2>
              </div>
              <p className="section-description">
                The main video displayed in the hero section on the home page.
              </p>
              <div className="video-input-group">
                <label>YouTube Video ID</label>
                <input
                  type="text"
                  placeholder="e.g., exvWgTTb61w"
                  value={homeSettings.featuredVideoId}
                  onChange={(e) =>
                    setHomeSettings({ ...homeSettings, featuredVideoId: e.target.value })
                  }
                />
                {homeSettings.featuredVideoId && (
                  <div className="video-preview">
                    <img
                      src={`https://img.youtube.com/vi/${homeSettings.featuredVideoId}/mqdefault.jpg`}
                      alt="Video preview"
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Recent Videos Section */}
            <section className="admin-section home-video-section">
              <div className="section-header">
                <h2>Recent Videos</h2>
              </div>
              <p className="section-description">
                The 4 video thumbnails displayed below the featured video.
              </p>
              <div className="recent-videos-grid">
                {homeSettings.recentVideos.map((video, index) => (
                  <div key={index} className="recent-video-item">
                    <h3>Video {index + 1}</h3>
                    <div className="video-input-group">
                      <label>YouTube Video ID</label>
                      <input
                        type="text"
                        placeholder="e.g., wqFkG48AHB4"
                        value={video.id}
                        onChange={(e) => updateRecentVideo(index, 'id', e.target.value)}
                      />
                    </div>
                    <div className="video-input-group">
                      <label>Title (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g., Recent Video 1"
                        value={video.title}
                        onChange={(e) => updateRecentVideo(index, 'title', e.target.value)}
                      />
                    </div>
                    {video.id && (
                      <div className="video-preview">
                        <img
                          src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                          alt={`Video ${index + 1} preview`}
                          onError={(e) => (e.target.style.display = 'none')}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Player Videos Section */}
            <section className="admin-section home-video-section">
              <div className="section-header">
                <h2>Recent Player Videos</h2>
              </div>
              <p className="section-description">
                Player highlight videos with player names displayed below. These appear under "Recent Player Vids" on the home page.
              </p>
              <div className="recent-videos-grid">
                {homeSettings.recentPlayerVideos.map((video, index) => (
                  <div key={index} className="recent-video-item player-video-item">
                    <h3>Player Video {index + 1}</h3>
                    <div className="video-input-group">
                      <label>YouTube Video ID</label>
                      <input
                        type="text"
                        placeholder="e.g., wqFkG48AHB4"
                        value={video.id}
                        onChange={(e) => updatePlayerVideo(index, 'id', e.target.value)}
                      />
                    </div>
                    <div className="video-input-group">
                      <label>Player Name</label>
                      <input
                        type="text"
                        placeholder="e.g., PlayerOne"
                        value={video.playerName}
                        onChange={(e) => updatePlayerVideo(index, 'playerName', e.target.value)}
                      />
                    </div>
                    <div className="video-input-group">
                      <label>Title (optional)</label>
                      <input
                        type="text"
                        placeholder="e.g., Insane Clip"
                        value={video.title}
                        onChange={(e) => updatePlayerVideo(index, 'title', e.target.value)}
                      />
                    </div>
                    {video.id && (
                      <div className="video-preview">
                        <img
                          src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                          alt={`Player Video ${index + 1} preview`}
                          onError={(e) => (e.target.style.display = 'none')}
                        />
                        {video.playerName && (
                          <span className="preview-player-name">{video.playerName}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {homeError && <p className="home-error">{homeError}</p>}
            {homeSuccess && <p className="home-success">{homeSuccess}</p>}

            <button type="submit" className="save-home-btn" disabled={homeSaving}>
              {homeSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// Edit Form Component
function EditForm({ type, initialData = {}, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    valhalla_clips: initialData.valhalla_clips || 0,
    avatar_url: initialData.avatar_url || '',
    twitter_url: initialData.twitter_url || '',
    youtube_url: initialData.youtube_url || '',
    recent_vid: initialData.recent_vid || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Valhalla Clips"
        value={formData.valhalla_clips}
        onChange={(e) => setFormData({ ...formData, valhalla_clips: parseInt(e.target.value) || 0 })}
      />
      <input
        type="url"
        placeholder="Avatar URL"
        value={formData.avatar_url}
        onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
      />
      <input
        type="url"
        placeholder="Twitter URL"
        value={formData.twitter_url}
        onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
      />
      <input
        type="url"
        placeholder="YouTube URL"
        value={formData.youtube_url}
        onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
      />
      {type !== 'lead' && (
        <input
          type="url"
          placeholder="Recent Video URL"
          value={formData.recent_vid}
          onChange={(e) => setFormData({ ...formData, recent_vid: e.target.value })}
        />
      )}
      <div className="form-actions">
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default Admin;