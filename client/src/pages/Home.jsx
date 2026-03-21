import { useState, useEffect } from 'react';
import MemberCard from '../components/MemberCard';
import './Home.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const HERO_VIDEOS = ['/hero-7.mp4', '/hero-9.mp4'];

function Home() {
  const [topMembers, setTopMembers] = useState([]);
  const [featuredVideoId, setFeaturedVideoId] = useState('exvWgTTb61w');
  const [heroVideo] = useState(() => HERO_VIDEOS[Math.floor(Math.random() * HERO_VIDEOS.length)]);
  const [recentVideos, setRecentVideos] = useState([
    { id: 'wqFkG48AHB4', title: 'Recent Video 1' },
    { id: 'W27bosQ6Nhw', title: 'Recent Video 2' },
    { id: 'ZB2mFI3kroc', title: 'Recent Video 3' },
    { id: '2ck8ymKZOmk', title: 'Recent Video 4' },
  ]);
  const [recentPlayerVideos, setRecentPlayerVideos] = useState([
    { id: 'GUKDI4VYncQ', title: 'Joined VE', playerName: 'ZKRM' },
    { id: 'pcWnVDQ2_Xc', title: 'Fex - [ZJ] Response', playerName: 'Fex' },
    { id: 'wimM0LDqZEo', title: 'BEST OF WW2', playerName: 'Prmzy' },
    { id: '6z4fPrgcMFU', title: 'Forget Her', playerName: 'Jokr' },
  ]);

  useEffect(() => {
    // Fetch roster data
    fetch(`${API_URL}/api/roster`)
      .then((res) => res.json())
      .then((data) => {
        // Combine all members and sort by valhalla_clips
        const allMembers = [
          ...data.leads,
          ...data.players,
          ...data.editors,
        ];
        const sorted = allMembers
          .sort((a, b) => (b.valhalla_clips || 0) - (a.valhalla_clips || 0))
          .slice(0, 3);
        setTopMembers(sorted);
      })
      .catch((err) => {
        console.error('Error fetching top members:', err);
      });

    // Fetch home page settings
    fetch(`${API_URL}/api/home-settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.featuredVideoId) {
          setFeaturedVideoId(data.featuredVideoId);
        }
        if (data.recentVideos && data.recentVideos.length > 0) {
          // Filter out empty videos
          const validVideos = data.recentVideos.filter((v) => v.id);
          if (validVideos.length > 0) {
            setRecentVideos(validVideos);
          }
        }
        if (data.recentPlayerVideos && data.recentPlayerVideos.length > 0) {
          const validPlayerVideos = data.recentPlayerVideos.filter((v) => v.id);
          if (validPlayerVideos.length > 0) {
            setRecentPlayerVideos(validPlayerVideos);
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching home settings:', err);
      });
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">VIRTUE</h1>
          <p className="hero-subtitle">Valhalla</p>
        </div>
        <div className="hero-video">
          <a
            href="https://youtu.be/exvWgTTb61w?si=1QBXOUnTpoYERF0x"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-gif-link"
          >
            <video
              src={heroVideo}
              autoPlay
              loop
              muted
              playsInline
              className="hero-gif"
            />
          </a>
        </div>
      </section>

      <section className="recent-videos">
        <h2 className="section-title">Recent Videos</h2>
        <div className="videos-grid">
          {recentVideos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="video-card"
            >
              <div className="video-thumbnail">
                <img
                  src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                  alt={video.title}
                  onError={(e) => {
                    e.target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                  }}
                />
                <div className="play-overlay">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {recentPlayerVideos.some((v) => v.id) && (
        <section className="player-videos">
          <h2 className="section-title">Recent Player Videos</h2>
          <div className="player-videos-grid">
            {recentPlayerVideos
              .filter((video) => video.id)
              .map((video) => (
                <a
                  key={video.id}
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="player-video-card"
                >
                  <div className="player-video-thumbnail">
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                      alt={video.title || video.playerName}
                      onError={(e) => {
                        e.target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                      }}
                    />
                    <div className="play-overlay">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="player-video-info">
                    <span className="player-name">{video.playerName}</span>
                  </div>
                </a>
              ))}
          </div>
        </section>
      )}

      {topMembers.length > 0 && (
        <section className="top-members">
          <h2 className="section-title">Most Valhalla Clips</h2>
          <div className="top-members-grid">
            {topMembers.map((member, index) => (
              <div key={member.id} className={`top-member-wrapper rank-${index + 1}`}>
                <div className="rank-badge">{index + 1}</div>
                <MemberCard member={member} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;