import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import { getRemainingSearches } from '../utils/rateLimit';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const remaining = getRemainingSearches();

  const navLink = (path, label) => {
    const active = location.pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
        style={{
          padding: '6px 14px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
          background: active ? '#1e1e3a' : 'transparent',
          color: active ? '#f8fafc' : '#64748b',
          border: 'none',
          cursor: 'pointer',
          transition: 'color 0.15s, background 0.15s',
        }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#f8fafc'; }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#64748b'; }}
      >
        {label}
      </button>
    );
  };

  return (
    <nav style={{
      borderBottom: '1px solid rgba(30,30,58,0.6)',
      backdropFilter: 'blur(16px)',
      background: 'rgba(7,7,16,0.85)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '0 16px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BarChart2 style={{ width: 18, height: 18, color: 'white' }} />
          </div>
          <span style={{ color: '#f8fafc', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
            Stock<span style={{ color: '#a78bfa' }}>Pulse</span>
          </span>
        </button>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLink('/', 'Home')}
          {navLink('/pricing', 'Pricing')}

          {/* Remaining badge (only on home & results, hide on pricing) */}
          {location.pathname !== '/pricing' && remaining < 3 && remaining > 0 && (
            <span style={{
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.3)',
              color: '#a78bfa',
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 20,
              marginLeft: 4,
            }}>
              {remaining} left today
            </span>
          )}

          <button
            onClick={() => navigate('/pricing')}
            style={{
              marginLeft: 8,
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              padding: '7px 16px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Go Pro
          </button>
        </div>
      </div>
    </nav>
  );
}
