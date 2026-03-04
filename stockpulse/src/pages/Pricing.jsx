import { useNavigate } from 'react-router-dom';
import { Check, Zap, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

const FREE_FEATURES = [
  '3 analyses per day',
  'What Happened summary',
  'Bull & Bear case breakdown',
  'Live stock price display',
  'Source article links',
  'Mobile-friendly design',
];

const PRO_FEATURES = [
  'Unlimited analyses',
  'Everything in Free',
  'Priority AI processing',
  'Historical context (coming soon)',
  'Email digest (coming soon)',
  'API access (coming soon)',
];

export default function Pricing() {
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    try {
      const res = await fetch('/api/create-checkout', { method: 'POST' });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        alert(json.error || 'Stripe is not configured yet. Add your STRIPE_SECRET_KEY to enable payments.');
      }
    } catch {
      alert('Could not connect to payment provider. Make sure STRIPE_SECRET_KEY is set.');
    }
  };

  return (
    <div className="min-h-screen hero-bg">
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 16px 80px' }}>

        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: '#64748b', background: 'none', border: 'none',
            cursor: 'pointer', marginBottom: 40, fontSize: 14,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back
        </button>

        {/* Header */}
        <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: 52 }}>
          <h1 style={{ color: '#f8fafc', fontWeight: 900, fontSize: 'clamp(2rem, 6vw, 3rem)', marginBottom: 12 }}>
            Simple, transparent pricing
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 18, maxWidth: 480, margin: '0 auto' }}>
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          maxWidth: 720,
          margin: '0 auto 40px',
        }}>

          {/* Free */}
          <div className="glass-card animate-fade-in-up-delay-1"
               style={{ padding: 36, display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ color: '#f8fafc', fontWeight: 700, fontSize: 20, margin: '0 0 16px' }}>Free</h2>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                <span style={{ color: '#f8fafc', fontSize: 52, fontWeight: 900, lineHeight: 1 }}>$0</span>
                <span style={{ color: '#64748b', marginBottom: 6 }}>/month</span>
              </div>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>No credit card required</p>
            </div>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, margin: '0 0 28px', padding: 0, listStyle: 'none' }}>
              {FREE_FEATURES.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 14 }}>
                  <Check style={{ width: 16, height: 16, color: '#34d399', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>

            <button onClick={() => navigate('/')} className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
              Get Started Free
            </button>
          </div>

          {/* Pro */}
          <div className="glass-card glow-purple animate-fade-in-up-delay-2"
               style={{ padding: 36, display: 'flex', flexDirection: 'column', borderColor: 'rgba(124,58,237,0.5)', position: 'relative', overflow: 'visible' }}>

            {/* Popular badge */}
            <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>
              <span style={{
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                padding: '5px 14px',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
                letterSpacing: '0.05em',
              }}>
                <Zap style={{ width: 11, height: 11 }} /> MOST POPULAR
              </span>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ color: '#f8fafc', fontWeight: 700, fontSize: 20, margin: '0 0 16px' }}>Pro</h2>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                <span style={{ color: '#f8fafc', fontSize: 52, fontWeight: 900, lineHeight: 1 }}>$7</span>
                <span style={{ color: '#64748b', marginBottom: 6 }}>/month</span>
              </div>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>Cancel anytime — no contracts</p>
            </div>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, margin: '0 0 28px', padding: 0, listStyle: 'none' }}>
              {PRO_FEATURES.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 14 }}>
                  <Check style={{ width: 16, height: 16, color: '#a78bfa', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>

            <button onClick={handleUpgrade} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Upgrade to Pro →
            </button>
          </div>
        </div>

        <p className="animate-fade-in-up-delay-3" style={{ textAlign: 'center', color: '#475569', fontSize: 13 }}>
          Questions? Reach us at{' '}
          <a href="mailto:hello@stockpulse.ai" style={{ color: '#7c3aed', textDecoration: 'none' }}>
            hello@stockpulse.ai
          </a>
        </p>

      </div>
    </div>
  );
}
