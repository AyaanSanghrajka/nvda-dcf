import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Zap, Search, TrendingUp, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getRemainingSearches } from '../utils/rateLimit';

const POPULAR = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META', 'GOOGL'];

export default function Landing() {
  const [ticker, setTicker] = useState('');
  const [error, setError] = useState('');
  const [upgraded, setUpgraded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.search.includes('upgraded=true')) setUpgraded(true);
  }, [location.search]);

  const handleAnalyze = () => {
    const t = ticker.trim().toUpperCase();
    if (!t) { setError('Please enter a stock ticker symbol.'); return; }
    if (!/^[A-Z]{1,5}$/.test(t)) { setError('Enter a valid ticker (letters only, e.g. AAPL).'); return; }
    navigate(`/results/${t}`);
  };

  const remaining = getRemainingSearches();

  return (
    <div className="min-h-screen hero-bg">
      <Navbar />

      {/* Upgrade toast */}
      {upgraded && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#10b981] text-white px-6 py-3 rounded-full font-semibold shadow-lg animate-fade-in-up">
          🎉 You're now on Pro! Unlimited analyses unlocked.
        </div>
      )}

      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] px-4 pt-6 pb-24">

        {/* Badge */}
        <div className="animate-fade-in-up flex items-center gap-2 bg-[#7c3aed]/10 border border-[#7c3aed]/30 rounded-full px-4 py-1.5 mb-8">
          <Zap className="w-3.5 h-3.5 text-[#a78bfa]" />
          <span className="text-sm text-[#a78bfa] font-medium">Powered by Claude AI</span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up-delay-1 text-center font-black tracking-tight mb-5 max-w-4xl"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1.1 }}>
          <span style={{ color: '#f8fafc' }}>Stock News,</span>
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #a78bfa, #818cf8, #67e8f9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Decoded by AI
          </span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-in-up-delay-2 text-center text-lg max-w-2xl mb-12 leading-relaxed"
           style={{ color: '#94a3b8' }}>
          Type any ticker. We scan the latest news and deliver{' '}
          <span style={{ color: '#f8fafc', fontWeight: 500 }}>plain-English insights</span>
          {' '}— what happened, the bull case, and the bear case.
        </p>

        {/* Search box */}
        <div className="animate-fade-in-up-delay-3 w-full max-w-lg mb-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={ticker}
              onChange={(e) => { setTicker(e.target.value.toUpperCase()); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="Enter ticker symbol (e.g. AAPL)"
              className="ticker-input"
              maxLength={5}
              autoFocus
            />
            <button onClick={handleAnalyze} className="btn-primary whitespace-nowrap">
              Analyze <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
          {error && <p style={{ color: '#f87171', fontSize: 14, marginTop: 8, marginLeft: 4 }}>{error}</p>}
        </div>

        {/* Remaining searches indicator */}
        {remaining < 3 && (
          <p className="animate-fade-in-up-delay-3 text-sm mb-3" style={{ color: '#64748b' }}>
            {remaining === 0
              ? <span style={{ color: '#f87171' }}>Daily limit reached. <button onClick={() => navigate('/pricing')} style={{ color: '#a78bfa', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Upgrade to Pro</button> for unlimited.</span>
              : <>{remaining} free {remaining === 1 ? 'search' : 'searches'} remaining today</>
            }
          </p>
        )}

        {/* Popular tickers */}
        <div className="animate-fade-in-up-delay-3 flex flex-wrap justify-center gap-2 mb-16">
          <span style={{ color: '#475569', fontSize: 13, alignSelf: 'center' }}>Try:</span>
          {POPULAR.map((t) => (
            <button
              key={t}
              onClick={() => { setTicker(t); setError(''); }}
              style={{
                background: '#0e0e1f',
                border: '1px solid #1e1e3a',
                color: '#94a3b8',
                borderRadius: 8,
                padding: '4px 12px',
                fontSize: 13,
                fontFamily: 'monospace',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#f8fafc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e1e3a'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid gap-4 w-full max-w-3xl px-2"
             style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {[
            {
              icon: <Search style={{ width: 18, height: 18, color: '#a78bfa' }} />,
              color: '#7c3aed',
              title: 'Real-time News',
              desc: 'Pulls the latest headlines and summaries from trusted financial sources.',
            },
            {
              icon: <TrendingUp style={{ width: 18, height: 18, color: '#34d399' }} />,
              color: '#10b981',
              title: 'Bull & Bear Cases',
              desc: 'Balanced analysis of upside potential and downside risks — all in one view.',
            },
            {
              icon: <Shield style={{ width: 18, height: 18, color: '#67e8f9' }} />,
              color: '#22d3ee',
              title: 'Plain English',
              desc: 'Zero jargon. Clear, concise insights you can actually use.',
            },
          ].map((f, i) => (
            <div key={i} className="glass-card" style={{ padding: '20px' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: '#0e0e1f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                {f.icon}
              </div>
              <h3 style={{ color: '#f8fafc', fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
