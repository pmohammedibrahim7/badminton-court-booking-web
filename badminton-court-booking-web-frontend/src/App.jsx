import React, { useState, useEffect } from 'react';
import { api } from './utils/api';
import PublicBooking from './pages/PublicBooking';
import Login from './pages/Login';
import MemberDashboard from './pages/MemberDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import { Shield, Sparkles, LogIn } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('booking'); // booking | login
  const [appInfo, setAppInfo] = useState({ app_name: 'Smash Badminton Club', app_logo: '' });
  const [checkingSession, setCheckingSession] = useState(true);

  // Check user session & app branding info on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await api.get('/api/me');
        if (data.user) {
          setUser(data.user);
        }
      } catch (err) {
        // Not logged in or session expired
        setUser(null);
      } finally {
        setCheckingSession(false);
      }
    };

    const fetchAppInfo = async () => {
      try {
        const data = await api.get('/api/super/app-info');
        setAppInfo({
          app_name: data.app_name || 'Smash Badminton Club',
          app_logo: data.app_logo || ''
        });
      } catch (err) {
        console.error('App info fetch error:', err);
      }
    };

    checkSession();
    fetchAppInfo();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/logout');
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      setView('booking');
    }
  };

  if (checkingSession) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-secondary)'
      }}>
        Initializing booking portal session...
      </div>
    );
  }

  // Determine what panel to show
  const renderMainContent = () => {
    if (user) {
      switch (user.role) {
        case 'super_admin':
          return <SuperAdminDashboard user={user} onLogout={handleLogout} />;
        case 'admin':
          return <AdminDashboard user={user} onLogout={handleLogout} />;
        case 'member':
          return <MemberDashboard user={user} onLogout={handleLogout} />;
        default:
          return <PublicBooking onGoToLogin={() => setView('login')} />;
      }
    }

    if (view === 'login') {
      return <Login onLoginSuccess={handleLoginSuccess} onBack={() => setView('booking')} />;
    }

    return <PublicBooking onGoToLogin={() => setView('login')} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Dynamic Navigation Bar */}
      <nav className="navbar">
        <div className="container navbar-container">
          <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => !user && setView('booking')}>
            {appInfo.app_logo ? (
              <img src={appInfo.app_logo} alt={appInfo.app_name} />
            ) : (
              <Shield className="brand-shuttle" size={28} />
            )}
            <span style={{ fontSize: '20px', fontWeight: 800, textTransform: 'uppercase' }}>
              {appInfo.app_name}
            </span>
          </div>

          <div className="nav-links">
            {!user ? (
              view === 'booking' ? (
                <button className="btn-primary" onClick={() => setView('login')} style={{ padding: '8px 18px', fontSize: '14px' }}>
                  <LogIn size={15} style={{ marginRight: '6px' }} /> Member / Admin Sign In
                </button>
              ) : (
                <button className="btn-secondary" onClick={() => setView('booking')} style={{ padding: '8px 18px', fontSize: '14px' }}>
                  Book Courts
                </button>
              )
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Hello, <strong style={{ color: '#fff' }}>{user.name}</strong> 
                  <span style={{ 
                    marginLeft: '8px', 
                    fontSize: '11px', 
                    color: 'var(--accent)', 
                    backgroundColor: 'var(--accent-glow)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {user.role.replace('_', ' ')}
                  </span>
                </span>
                <button className="btn-secondary" onClick={handleLogout} style={{ padding: '6px 14px', fontSize: '13px' }}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Panel Viewport */}
      <div style={{ flex: 1 }}>
        {renderMainContent()}
      </div>

    </div>
  );
}
