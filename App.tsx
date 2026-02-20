import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Stats from './components/Stats';
import AnalysisTool from './components/AnalysisTool';
import Results from './components/Results';
import GenesInfo from './components/GenesInfo';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';

export default function App() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);

  useEffect(() => {
    const c = document.getElementById('particleCanvas') as HTMLCanvasElement;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let W = c.width = window.innerWidth;
    let H = c.height = window.innerHeight;
    
    const handleResize = () => {
      W = c.width = window.innerWidth;
      H = c.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    
    const particles: any[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - .5) * 0.3, vy: (Math.random() - .5) * 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        color: ['#00d4ff', '#00ff88', '#8b5cf6', '#f472b6'][Math.floor(Math.random() * 4)]
      });
    }
    
    let animationFrameId: number;
    function draw() {
      ctx!.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = p.color; ctx!.globalAlpha = p.alpha; ctx!.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      });
      ctx!.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = 'rgba(0,212,255,' + (0.08 * (1 - d / 120)) + ')';
            ctx!.lineWidth = 0.5; ctx!.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleAnalyze = async (vcfContent: string, selectedDrugs: string[]) => {
    setIsLoading(true);
    setLoadingStep(1);
    
    try {
      const formData = new FormData();
      const blob = new Blob([vcfContent], { type: 'text/plain' });
      formData.append('vcf_file', blob, 'patient.vcf');
      formData.append('drugs', selectedDrugs.join(','));

      // Simulate steps for UI
      setTimeout(() => setLoadingStep(2), 500);
      setTimeout(() => setLoadingStep(3), 1000);
      setTimeout(() => setLoadingStep(4), 1500);
      setTimeout(() => setLoadingStep(5), 2000);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      if (data.success) {
        setResults(Array.isArray(data.data) ? data.data : [data.data]);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error(error);
      alert('Analysis failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <canvas id="particleCanvas"></canvas>
      
      <nav>
        <div className="nav-logo">⬡ PHARMAGUARD</div>
        <div className="nav-links">
          <a href="#tool">Analyze</a>
          <a href="#genes">Genes</a>
          <a href="#how">How It Works</a>
        </div>
      </nav>

      {isLoading && (
        <div id="loadingOverlay" className="active">
          <div className="dna-spinner"></div>
          <div className="loading-text">Analyzing Genome...</div>
          <div className="loading-steps">
            <div className={`loading-step ${loadingStep >= 1 ? 'active' : ''} ${loadingStep > 1 ? 'done' : ''}`}><div className="step-dot"></div>Parsing VCF file</div>
            <div className={`loading-step ${loadingStep >= 2 ? 'active' : ''} ${loadingStep > 2 ? 'done' : ''}`}><div className="step-dot"></div>Detecting pharmacogenomic variants</div>
            <div className={`loading-step ${loadingStep >= 3 ? 'active' : ''} ${loadingStep > 3 ? 'done' : ''}`}><div className="step-dot"></div>Computing drug interactions</div>
            <div className={`loading-step ${loadingStep >= 4 ? 'active' : ''} ${loadingStep > 4 ? 'done' : ''}`}><div className="step-dot"></div>Generating clinical explanation</div>
            <div className={`loading-step ${loadingStep >= 5 ? 'active' : ''} ${loadingStep > 5 ? 'done' : ''}`}><div className="step-dot"></div>Preparing risk assessment</div>
          </div>
        </div>
      )}

      <Hero />
      <Stats />
      <div className="glow-divider"></div>
      <AnalysisTool onAnalyze={handleAnalyze} isLoading={isLoading} />
      <Results results={results} />
      <div className="glow-divider"></div>
      <GenesInfo />
      <div className="glow-divider"></div>
      <HowItWorks />
      <Footer />
    </>
  );
}
