import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Roster from './pages/Roster';
import Admin from './pages/Admin';
import './index.css';

function LoadingScreen({ onLoaded }) {
  useEffect(() => {
    // Just preload the small logo, the video loads fast enough on its own
    const img = new Image();
    img.onload = () => setTimeout(() => onLoaded(), 300);
    img.onerror = () => setTimeout(() => onLoaded(), 300);
    img.src = '/virtue-flat-logo.png';
  }, [onLoaded]);

  return (
    <div className="loading-screen">
      <img src="/virtue-flat-logo.png" alt="Virtue" className="loading-logo" />
      <div className="loading-spinner"></div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <div className="app">
      {!isAdminPage && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/roster" element={<Roster />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const handleLoaded = () => {
    setFadeOut(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <Router>
      {loading && (
        <div className={`loading-overlay ${fadeOut ? 'fade-out' : ''}`}>
          <LoadingScreen onLoaded={handleLoaded} />
        </div>
      )}
      <AppContent />
    </Router>
  );
}

export default App;
