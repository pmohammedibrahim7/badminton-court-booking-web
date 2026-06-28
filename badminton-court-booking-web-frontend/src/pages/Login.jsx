import React, { useState } from 'react';
import { api } from '../utils/api';
import { Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Login({ onLoginSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.post('/api/login', { email, password });
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '420px',
      width: '100%',
      margin: '60px auto',
      padding: '0 16px'
    }}>
      <button 
        onClick={onBack}
        className="btn-secondary"
        style={{
          marginBottom: '24px',
          padding: '8px 16px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <ArrowLeft size={16} /> Back to Booking
      </button>

      <div className="card" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Sign In</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Enter your credentials to access your booking panel
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--danger)',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="form-control"
                style={{ paddingLeft: '44px' }}
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="form-control"
                style={{ paddingLeft: '44px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} 
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center', 
          fontSize: '13px', 
          color: 'var(--text-muted)' 
        }}>
          <p>Super Admin: <strong>super@booking.com</strong> / password</p>
          <p style={{ marginTop: '4px' }}>Admin: <strong>admin@booking.com</strong> / password</p>
        </div>
      </div>
    </div>
  );
}
