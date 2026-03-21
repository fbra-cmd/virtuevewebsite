import './MemberCard.css';

function MemberCard({ member, showRecentVid = false }) {
  const hasAvatar = member.avatar_url && member.avatar_url.trim() !== '';

  return (
    <div className="member-card">
      <div className="member-avatar">
        {hasAvatar ? (
          <img
            src={member.avatar_url}
            alt={member.name}
          />
        ) : (
          <div className="default-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        )}
      </div>
      <div className="member-info">
        <h3 className="member-name">{member.name}</h3>
        <div className="member-stats">
          <span className="valhalla-clips">
            <span className="stat-value">{member.valhalla_clips || 0}</span>
            <span className="stat-label">
              Valhalla {member.valhalla_clips === 1 ? 'Clip' : 'Clips'}
            </span>
          </span>
        </div>
        <div className="member-socials">
          {member.twitter_url && (
            <a href={member.twitter_url} target="_blank" rel="noopener noreferrer" className="social-link">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          )}
          {member.youtube_url && (
            <a href={member.youtube_url} target="_blank" rel="noopener noreferrer" className="social-link">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          )}
          {showRecentVid && member.recent_vid && (
            <a href={member.recent_vid} target="_blank" rel="noopener noreferrer" className="recent-vid-link">
              Latest Video
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberCard;
