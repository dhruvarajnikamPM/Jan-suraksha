import React from 'react';

export default function Footer() {
  return (
    <footer>
      <div className="footer-logo">⬡ PHARMAGUARD</div>
      <div className="footer-text">AI-Powered Pharmacogenomic Risk Prediction System</div>
      <div className="footer-text" style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>Built for RIFT 2026 Hackathon · Pharmacogenomics / Explainable AI Track</div>
      <div className="footer-badges">
        <span className="footer-badge">#RIFT2026</span>
        <span className="footer-badge">#PharmaGuard</span>
        <span className="footer-badge">#Pharmacogenomics</span>
        <span className="footer-badge">#AIinHealthcare</span>
      </div>
      <div style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: '#334155' }}>
        ⚠ For educational and research purposes only. Not for clinical use without physician oversight.
      </div>
    </footer>
  );
}
