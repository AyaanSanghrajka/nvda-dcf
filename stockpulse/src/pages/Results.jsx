import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Info, ExternalLink, RefreshCw, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { checkRateLimit, incrementUsage } from '../utils/rateLimit';

function PriceTag({ quote }) {
  if (!quote || !quote.price) return null;
  const up = quote.change >= 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ color: '#f8fafc', fontSize: 28, fontWeight: 800, fontFamily: 'monospace' }}>
        ${quote.price.toFixed(2)}
      </span>
      <span style={{
        color: up ? '#34d399' : '#f87171',
        background: up ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
        border: `1px solid ${up ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
        borderRadius: 6,
        padding: '2px 8px',
        fontSize: 13,
        fontWeight: 600,
      }}>
        {up ? '+' : ''}{quote.change?.toFixed(2)} ({up ? '+' : ''}{quote.changePercent?.toFixed(2)}%)
      </span>
    </div>
  );
}

const LOADING_MESSAGES = [
  'Scanning recent headlines…',
  'Pulling news from Finnhub…',
  'Feeding articles to Claude AI…',
  'Generating bull & bear analysis…',
  'Almost there…',
];

export default function Results() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalysis();
  }, [ticker]);

  // Cycle loading messages for UX polish
  useEffect(() => {
    if (!loading) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[i]);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError('');
    setData(null);

    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      setError('rate_limit');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/analyze?ticker=${encodeURIComponent(ticker)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Analysis failed.');
      incrementUsage();
      setData(json);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading state ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen hero-bg" style={{ display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <LoadingSpinner />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#f8fafc', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>
              Analyzing <span style={{ fontFamily: 'monospace', color: '#a78bfa' }}>{ticker}</span>
            </p>
            <p style={{ color: '#64748b', fontSize: 14 }}>{loadingMsg}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error state ───────────────────────────────────────────── */
  if (error) {
    const isRateLimit = error === 'rate_limit';
    return (
      <div className="min-h-screen hero-bg" style={{ display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
          <div className="glass-card" style={{ maxWidth: 420, width: '100%', padding: 36, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{isRateLimit ? '⏱️' : '⚠️'}</div>
            <h2 style={{ color: '#f8fafc', fontWeight: 700, fontSize: 20, marginBottom: 10 }}>
              {isRateLimit ? 'Daily limit reached' : 'Analysis failed'}
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 15, lineHeight: 1.6 }}>
              {isRateLimit
                ? "You've used all 3 free analyses for today. Upgrade to Pro for unlimited access."
                : error}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/')} className="btn-outline">
                <ArrowLeft style={{ width: 16, height: 16 }} /> Back
              </button>
              {isRateLimit ? (
                <button onClick={() => navigate('/pricing')} className="btn-primary">
                  Upgrade to Pro
                </button>
              ) : (
                <button onClick={fetchAnalysis} className="btn-primary">
                  <RefreshCw style={{ width: 16, height: 16 }} /> Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Results ───────────────────────────────────────────────── */
  return (
    <div className="min-h-screen hero-bg">
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 16px 64px' }}>

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: '#64748b', background: 'none', border: 'none',
            cursor: 'pointer', marginBottom: 28, fontSize: 14,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back to search
        </button>

        {/* Header */}
        <div className="animate-fade-in-up" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h1 style={{ color: '#f8fafc', fontSize: 40, fontWeight: 900, fontFamily: 'monospace', margin: 0 }}>
                  {data.ticker}
                </h1>
                <span style={{
                  background: 'rgba(124,58,237,0.15)',
                  border: '1px solid rgba(124,58,237,0.35)',
                  color: '#a78bfa',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 20,
                }}>
                  AI Analysis
                </span>
              </div>
              <PriceTag quote={data.quote} />
              <p style={{ color: '#475569', fontSize: 13, marginTop: 6 }}>
                Based on {data.newsCount} recent article{data.newsCount !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => { navigate('/'); }}
              className="btn-outline"
              style={{ fontSize: 14, padding: '8px 18px' }}
            >
              <Search style={{ width: 14, height: 14 }} /> New search
            </button>
          </div>
        </div>

        {/* What Happened */}
        <div className="glass-card animate-fade-in-up" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Info style={{ width: 18, height: 18, color: '#818cf8' }} />
            </div>
            <h2 style={{ color: '#f8fafc', fontWeight: 700, fontSize: 20, margin: 0 }}>What Happened</h2>
          </div>
          <p style={{ color: '#94a3b8', lineHeight: 1.75, fontSize: 15, margin: 0 }}>
            {data.analysis.whatHappened}
          </p>
        </div>

        {/* Bull / Bear grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>

          {/* Bull Case */}
          <div className="glass-card glow-green animate-fade-in-up-delay-1"
               style={{ padding: 28, borderColor: 'rgba(52,211,153,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp style={{ width: 18, height: 18, color: '#34d399' }} />
              </div>
              <h2 style={{ color: '#34d399', fontWeight: 700, fontSize: 20, margin: 0, flex: 1 }}>Bull Case</h2>
              <span style={{ color: 'rgba(52,211,153,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>UPSIDE</span>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: 0, padding: 0, listStyle: 'none' }}>
              {data.analysis.bullCase.map((point, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, color: '#94a3b8', fontSize: 14, lineHeight: 1.65 }}>
                  <span style={{ color: '#34d399', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>↑</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bear Case */}
          <div className="glass-card glow-red animate-fade-in-up-delay-2"
               style={{ padding: 28, borderColor: 'rgba(239,68,68,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingDown style={{ width: 18, height: 18, color: '#f87171' }} />
              </div>
              <h2 style={{ color: '#f87171', fontWeight: 700, fontSize: 20, margin: 0, flex: 1 }}>Bear Case</h2>
              <span style={{ color: 'rgba(248,113,113,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>DOWNSIDE</span>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: 0, padding: 0, listStyle: 'none' }}>
              {data.analysis.bearCase.map((point, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, color: '#94a3b8', fontSize: 14, lineHeight: 1.65 }}>
                  <span style={{ color: '#f87171', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>↓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Source articles */}
        {data.articles && data.articles.length > 0 && (
          <div className="glass-card animate-fade-in-up-delay-3" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ color: '#f8fafc', fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Source Articles</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {data.articles.slice(0, 5).map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    gap: 12, padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(14,14,31,0.8)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="line-clamp-2" style={{ color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                      {article.headline}
                    </p>
                    <p style={{ color: '#475569', fontSize: 11, marginTop: 3 }}>{article.source}</p>
                  </div>
                  <ExternalLink style={{ width: 14, height: 14, color: '#475569', flexShrink: 0, marginTop: 2 }} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Pro upsell */}
        <div className="glass-card" style={{
          padding: 24,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(99,102,241,0.08))',
          borderColor: 'rgba(124,58,237,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <p style={{ color: '#f8fafc', fontWeight: 600, margin: '0 0 4px' }}>Want unlimited analyses?</p>
            <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Upgrade to Pro for just $7/month — no limits.</p>
          </div>
          <button onClick={() => navigate('/pricing')} className="btn-primary" style={{ fontSize: 14 }}>
            Upgrade to Pro →
          </button>
        </div>

      </div>
    </div>
  );
}
