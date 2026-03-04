export default function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Dual-ring spinner */}
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        {/* Outer ring (static) */}
        <div style={{
          position: 'absolute', inset: 0,
          border: '3px solid rgba(30,30,58,0.8)',
          borderRadius: '50%',
        }} />
        {/* Outer ring (spinning) */}
        <div style={{
          position: 'absolute', inset: 0,
          border: '3px solid transparent',
          borderTopColor: '#7c3aed',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
        }} />
        {/* Inner ring (spinning reverse) */}
        <div style={{
          position: 'absolute', inset: 10,
          border: '3px solid transparent',
          borderTopColor: '#22d3ee',
          borderRadius: '50%',
          animation: 'spin 1.4s linear infinite reverse',
        }} />
      </div>

      {/* Pulsing dots */}
      <div style={{ display: 'flex', gap: 5 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: '#7c3aed',
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
