import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Roster from './pages/Roster';
import Admin from './pages/Admin';
import { EasterEggProvider, useEasterEgg } from './EasterEggContext';
import './index.css';

function LoadingScreen({ onLoaded }) {
  useEffect(() => {
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

function EasterEggEffects() {
  const { easterEgg } = useEasterEgg();

  useEffect(() => {
    if (easterEgg === 'fex') {
      document.documentElement.setAttribute('data-egg', 'fex');
    } else if (easterEgg === 'matt') {
      document.documentElement.setAttribute('data-egg', 'matt');
    } else {
      document.documentElement.removeAttribute('data-egg');
    }
    return () => document.documentElement.removeAttribute('data-egg');
  }, [easterEgg]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';
  const { easterEgg } = useEasterEgg();

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

      {/* Fex easter egg: sticky images */}
      {easterEgg === 'fex' && (
        <>
          <div className="egg-sticky-image egg-sticky-right">
            <img src="/click_fex_3.png" alt="" />
          </div>
          <div className="egg-sticky-image egg-sticky-left">
            <img src="/click_fex_2.png" alt="" />
          </div>
          <div className="egg-topleft-gif">
            <img src="/giphy.gif" alt="" />
          </div>
        </>
      )}
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
    <EasterEggProvider>
      <Router>
        <EasterEggEffects />
        {loading && (
          <div className={`loading-overlay ${fadeOut ? 'fade-out' : ''}`}>
            <LoadingScreen onLoaded={handleLoaded} />
          </div>
        )}
        <AppContent />
      </Router>
    </EasterEggProvider>
  );
}

export default App;
