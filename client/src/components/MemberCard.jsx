import { useRef, useState, useEffect, useCallback } from 'react';
import { useEasterEgg } from '../EasterEggContext';
import './MemberCard.css';

function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const start = performance.now();
          const end = value;

          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return <span ref={ref}>{display}</span>;
}

function MemberCard({ member, showRecentVid = false }) {
  const hasAvatar = member.avatar_url && member.avatar_url.trim() !== '';
  const { triggerEgg } = useEasterEgg();
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    triggerEgg(member.name);
  };

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTilt({ x: rotateX, y: rotateY });
    setShine({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }, []);

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setShine({ x: 50, y: 50 });
  };

  const cardStyle = {
    transform: isHovered
      ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.03, 1.03, 1.03)`
      : 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
  };

  const shineStyle = {
    background: isHovered
      ? `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)`
      : 'none',
    opacity: isHovered ? 1 : 0,
  };

  const holoStyle = {
    backgroundPosition: isHovered
      ? `${shine.x}% ${shine.y}%`
      : '50% 50%',
    opacity: isHovered ? 0.12 : 0,
  };

  return (
    <div
      ref={cardRef}
      className="member-card"
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={cardStyle}
    >
      <div className="card-shine" style={shineStyle} />
      <div className="card-holo" style={holoStyle} />

      <div className="card-inner">
        <div className="card-top-border" />

        <div className="member-avatar">
          {hasAvatar ? (
            <img src={member.avatar_url} alt={member.name} />
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

          <div className="card-divider" />

          <div className="member-stats">
            <span className="valhalla-clips">
              <span className="stat-value">
                <AnimatedNumber value={member.valhalla_clips || 0} />
              </span>
              <span className="stat-label">
                Valhalla {member.valhalla_clips === 1 ? 'Clip' : 'Clips'}
              </span>
            </span>
          </div>

          <div className="member-socials">
            {member.twitter_url && (
              <a href={member.twitter_url} target="_blank" rel="noopener noreferrer" className="social-link" onClick={(e) => e.stopPropagation()}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}
            {member.youtube_url && (
              <a href={member.youtube_url} target="_blank" rel="noopener noreferrer" className="social-link" onClick={(e) => e.stopPropagation()}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}
            {showRecentVid && member.recent_vid && (
              <a href={member.recent_vid} target="_blank" rel="noopener noreferrer" className="recent-vid-link" onClick={(e) => e.stopPropagation()}>
                Latest Video
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberCard;
