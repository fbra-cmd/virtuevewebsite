import { useState, useEffect } from 'react';
import MemberCard from '../components/MemberCard';
import { useEasterEgg } from '../EasterEggContext';
import './Roster.css';

const API_URL = import.meta.env.VITE_API_URL || '';

// Mock data for development/demo (when database isn't connected)
const MOCK_DATA = {
  leads: [
    {
      id: 1,
      name: 'Leader Name',
      valhalla_clips: 250,
      avatar_url: 'https://via.placeholder.com/1000x1000/1a1a1a/ffffff?text=Leader',
      twitter_url: 'https://twitter.com',
      youtube_url: 'https://youtube.com',
    },
  ],
  players: [
    {
      id: 1,
      name: 'Player 1',
      valhalla_clips: 180,
      avatar_url: 'https://via.placeholder.com/1000x1000/1a1a1a/ffffff?text=P1',
      twitter_url: 'https://twitter.com',
      youtube_url: 'https://youtube.com',
      recent_vid: 'https://youtu.be/example',
    },
    {
      id: 2,
      name: 'Player 2',
      valhalla_clips: 145,
      avatar_url: 'https://via.placeholder.com/1000x1000/1a1a1a/ffffff?text=P2',
      twitter_url: 'https://twitter.com',
      youtube_url: 'https://youtube.com',
      recent_vid: 'https://youtu.be/example',
    },
  ],
  editors: [
    {
      id: 1,
      name: 'Editor 1',
      valhalla_clips: 95,
      avatar_url: 'https://via.placeholder.com/1000x1000/1a1a1a/ffffff?text=E1',
      twitter_url: 'https://twitter.com',
      youtube_url: 'https://youtube.com',
      recent_vid: 'https://youtu.be/example',
    },
  ],
};

function Roster() {
  const { easterEgg } = useEasterEgg();
  const [roster, setRoster] = useState({ leads: [], players: [], editors: [] });
  const [featuredPlayer, setFeaturedPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter function
  const filterByName = (members) => {
    if (!searchQuery.trim()) return members;
    return members.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredLeads = filterByName(roster.leads);
  const filteredPlayers = filterByName(roster.players);
  const filteredEditors = filterByName(roster.editors);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/roster`).then((res) => {
        if (!res.ok) throw new Error('Failed to fetch roster');
        return res.json();
      }),
      fetch(`${API_URL}/api/featured-player`).then((res) => res.json()).catch(() => ({ player: null }))
    ])
      .then(([rosterData, featuredData]) => {
        setRoster(rosterData);
        setFeaturedPlayer(featuredData.player);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching roster, using mock data:', err);
        setRoster(MOCK_DATA);
        setUsingMockData(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="roster">
        <div className="loading">Loading roster...</div>
      </div>
    );
  }

  return (
    <div className="roster">
      <div className="roster-container">
        <h1 className="roster-title">Our Team</h1>

        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          )}
        </div>

        {usingMockData && (
          <p className="mock-notice">Demo mode - connect database for real data</p>
        )}

        {featuredPlayer && !searchQuery && (
          <section className="featured-valhalla-section">
            <h2 className="featured-title">Most Recent Valhalla Clip</h2>
            <div className="featured-player-container">
              <MemberCard member={featuredPlayer} />
            </div>
          </section>
        )}

        {filteredLeads.length > 0 && (
          <section className="roster-section">
            <h2 className="section-title">Leaders</h2>
            <div className="members-grid">
              {filteredLeads.map((lead) => (
                <MemberCard key={lead.id} member={lead} />
              ))}
            </div>
          </section>
        )}

        {filteredPlayers.length > 0 && (
          <section className="roster-section">
            <h2 className="section-title">Players</h2>
            <div className="members-grid">
              {filteredPlayers.map((player) => (
                <MemberCard key={player.id} member={player} showRecentVid />
              ))}
            </div>
          </section>
        )}

        {filteredEditors.length > 0 && (
          <section className="roster-section">
            <h2 className="section-title">Editors</h2>
            <div className="members-grid">
              {filteredEditors.map((editor) => (
                <MemberCard key={editor.id} member={editor} showRecentVid />
              ))}
            </div>
          </section>
        )}

        {searchQuery && filteredLeads.length === 0 && filteredPlayers.length === 0 && filteredEditors.length === 0 && (
          <p className="no-results">No members found for "{searchQuery}"</p>
        )}

        {easterEgg === 'fex' && (
          <div className="egg-roster-bottom">
            <img src="/click_fex_2.png" alt="" />
          </div>
        )}
      </div>
    </div>
  );
}

export default Roster;
