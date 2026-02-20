import React, { useEffect, useRef } from 'react';

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const W = c.width;
    const H = c.height;
    let t = 0;
    let animationFrameId: number;

    function drawHelix() {
      ctx!.clearRect(0, 0, W, H);
      const cx = W / 2, r = 55, numPts = 24;
      for (let i = 0; i < numPts; i++) {
        const y = i * (H / numPts) + (t % (H / numPts));
        const phase = (i / numPts) * Math.PI * 4 + t * 0.04;
        const x1 = cx + Math.sin(phase) * r;
        const x2 = cx + Math.sin(phase + Math.PI) * r;
        const z1 = Math.cos(phase);
        const z2 = Math.cos(phase + Math.PI);
        const alpha1 = (z1 + 1) / 2 * 0.8 + 0.1;
        const alpha2 = (z2 + 1) / 2 * 0.8 + 0.1;
        const sz1 = 3 + z1 * 1.5;
        const sz2 = 3 + z2 * 1.5;
        
        ctx!.beginPath(); ctx!.arc(x1, y, Math.max(sz1, 1), 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(0,212,255,${alpha1})`;
        ctx!.shadowColor = '#00d4ff'; ctx!.shadowBlur = 10 * alpha1;
        ctx!.fill();
        
        ctx!.beginPath(); ctx!.arc(x2, y, Math.max(sz2, 1), 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(0,255,136,${alpha2})`;
        ctx!.shadowColor = '#00ff88'; ctx!.shadowBlur = 10 * alpha2;
        ctx!.fill();
        
        if (i % 3 === 0) {
          const rAlpha = Math.min(alpha1, alpha2) * 0.5;
          ctx!.beginPath(); ctx!.moveTo(x1, y); ctx!.lineTo(x2, y);
          ctx!.strokeStyle = `rgba(139,92,246,${rAlpha})`;
          ctx!.lineWidth = 1.5; ctx!.shadowBlur = 5; ctx!.shadowColor = '#8b5cf6';
          ctx!.stroke();
        }
      }
      ctx!.shadowBlur = 0;
      t += 0.5;
      animationFrameId = requestAnimationFrame(drawHelix);
    }
    drawHelix();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <section id="hero">
      <canvas ref={canvasRef} id="dnaCanvas" width="300" height="500"></canvas>
      <div className="hero-content">
        <div className="hero-badge">🧬 RIFT 2026 · Pharmacogenomics Track</div>
        <h1 className="hero-title">PharmaGuard</h1>
        <div className="hero-subtitle">AI-Powered Pharmacogenomic Risk Prediction</div>
        <p className="hero-tagline">Preventing adverse drug reactions through precision genomics. Upload your VCF file and discover your personalized drug risk profile in seconds.</p>
        <a href="#tool" className="btn-primary"><span>🧪</span><span>Start Analysis</span></a>
      </div>
    </section>
  );
}
