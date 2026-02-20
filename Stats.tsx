import React, { useEffect, useRef, useState } from 'react';

export default function Stats() {
  const [count, setCount] = useState(0);
  const target = 100000;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let cur = 0;
          const step = target / 80;
          const id = setInterval(() => {
            cur = Math.min(cur + step, target);
            setCount(Math.floor(cur));
            if (cur >= target) clearInterval(id);
          }, 20);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="stats-bar" ref={ref} style={{ position: 'relative', zIndex: 2 }}>
      <div className="stat-item">
        <div className="stat-num">{count.toLocaleString()}+</div>
        <div className="stat-label">Deaths/Year from ADRs</div>
      </div>
      <div className="stat-item">
        <div className="stat-num">6</div>
        <div className="stat-label">Critical Genes Analyzed</div>
      </div>
      <div className="stat-item">
        <div className="stat-num">CPIC</div>
        <div className="stat-label">Guideline Aligned</div>
      </div>
      <div className="stat-item">
        <div className="stat-num">AI</div>
        <div className="stat-label">Powered Explanations</div>
      </div>
    </div>
  );
}
