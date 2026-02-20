import React, { useEffect, useRef } from 'react';

interface ResultsProps {
  results: any[];
}

const RISK_CONFIG: Record<string, any> = {
  'Safe': { icon: '✅', cls: 'safe', severity: 'none', confidence: 0.95 },
  'Adjust Dosage': { icon: '⚠️', cls: 'adjust', severity: 'moderate', confidence: 0.88 },
  'Toxic': { icon: '☠️', cls: 'toxic', severity: 'critical', confidence: 0.93 },
  'Ineffective': { icon: '🚫', cls: 'ineffective', severity: 'high', confidence: 0.90 },
  'Unknown': { icon: '❓', cls: 'unknown', severity: 'none', confidence: 0.50 }
};

export default function Results({ results }: ResultsProps) {
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results]);

  if (results.length === 0) return null;

  const out = results[0]; // Displaying the first result for simplicity
  const ra = out.risk_assessment || {};
  const pgx = out.pharmacogenomic_profile || {};
  const qm = out.quality_metrics || {};
  const rec = out.clinical_recommendation || {};
  const llm = out.llm_generated_explanation || {};

  const riskLabel = ra.risk_label || 'Unknown';
  const rc = RISK_CONFIG[riskLabel] || RISK_CONFIG['Unknown'];
  const conf = ra.confidence_score != null ? ra.confidence_score : 0.85;
  const sev = (ra.severity || 'none').toString();
  const sevCls = ['none', 'low', 'moderate', 'high', 'critical'].includes(sev) ? sev : 'none';

  const alts = Array.isArray(rec.alternative_drugs) ? rec.alternative_drugs : (rec.alternatives || []);
  const urg = (rec.urgency || 'routine').toString();
  const urgCls = urg.includes('immediate') ? 'immediate' : urg.includes('monitoring') ? 'monitoring' : 'routine';

  const syntaxHighlight = (json: string) => {
    return json
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/("(\\u[0-9A-Fa-f]{4}|\\[^u]|[^"\\])*"(\s*:)?|-?\d+\.?\d*([eE][+\-]?\d+)?|true|false|null)/g, match => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) return `<span class="json-key">${match}</span>`;
          return `<span class="json-str">${match}</span>`;
        }
        if (/true|false/.test(match)) return `<span class="json-bool">${match}</span>`;
        if (/null/.test(match)) return `<span class="json-null">${match}</span>`;
        return `<span class="json-num">${match}</span>`;
      });
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(out, null, 2)).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${out.patient_id || 'patient'}_${(out.drug || 'result').replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="results" className="visible" ref={resultsRef}>
      <div className="container">
        <div className="results-header">
          <div className="patient-info">
            <div className="patient-id"><strong>Patient ID:</strong> {out.patient_id || '—'}</div>
            <div className="patient-ts"><strong>Analysis:</strong> {out.timestamp ? new Date(out.timestamp).toLocaleString() : '—'}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Drug:</span>
            <span style={{ fontWeight: 700, color: 'var(--blue)', letterSpacing: '1px' }}>{out.drug || '—'}</span>
          </div>
        </div>

        <div className="results-grid">
          {/* Risk Assessment */}
          <div className="card risk-card fade-in fade-in-1">
            <div className="card-label">Risk Assessment</div>
            <div className="risk-display">
              <div className={`risk-badge ${rc.cls}`}>
                <div className="risk-icon">{rc.icon}</div>
                <div className="risk-label-text">{riskLabel}</div>
              </div>
              <div className="risk-details">
                <div className="confidence-row">
                  <div className="confidence-circle">
                    <svg viewBox="0 0 80 80" width="90" height="90">
                      <circle className="track" cx="40" cy="40" r="36" />
                      <circle className="fill" cx="40" cy="40" r="36" style={{ strokeDashoffset: 226 * (1 - Math.min(1, conf)) }} />
                    </svg>
                    <div className="confidence-pct">{Math.round(conf * 100)}%</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{conf.toFixed(2)}</div>
                    <div className="confidence-label">Confidence Score</div>
                  </div>
                </div>
                <div className="severity-row">
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Severity:</span>
                  <span className={`severity-badge sev-${sevCls}`}>{sev.charAt(0).toUpperCase() + sev.slice(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PGx Profile */}
          <div className="card fade-in fade-in-2">
            <div className="card-label">Pharmacogenomic Profile</div>
            <table style={{ width: '100%', fontSize: '0.9rem' }}>
              <tbody>
                <tr><td style={{ color: 'var(--text-dim)', padding: '0.4rem 0', width: '40%' }}>Primary Gene</td>
                    <td style={{ fontWeight: 700, color: 'var(--blue)' }}>{pgx.primary_gene || '—'}</td></tr>
                <tr><td style={{ color: 'var(--text-dim)', padding: '0.4rem 0' }}>Diplotype</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--green)' }}>{pgx.diplotype || '*1/*1'}</td></tr>
                <tr><td style={{ color: 'var(--text-dim)', padding: '0.4rem 0' }}>Phenotype</td>
                    <td><span className="phenotype-badge">{pgx.phenotype || 'Unknown'}</span></td></tr>
                <tr><td style={{ color: 'var(--text-dim)', padding: '0.4rem 0' }}>Variants</td>
                    <td style={{ fontWeight: 700 }}>{(pgx.detected_variants || []).length}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Detected Variants */}
          <div className="card fade-in fade-in-3">
            <div className="card-label">Detected Variants</div>
            <div style={{ overflowX: 'auto' }}>
              <table className="variants-table">
                <thead>
                  <tr><th>rsID</th><th>Gene</th><th>Allele</th><th>Effect</th><th>Zygosity</th></tr>
                </thead>
                <tbody>
                  {(pgx.detected_variants || []).length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '1rem' }}>No variants detected</td></tr>
                  ) : (
                    (pgx.detected_variants || []).map((v: any, i: number) => (
                      <tr key={i}>
                        <td className="rsid">{v.rsid || '—'}</td>
                        <td style={{ color: 'var(--blue)' }}>{v.gene || '—'}</td>
                        <td className="star-allele">{v.star_allele || '—'}</td>
                        <td style={{ fontSize: '0.8rem' }}>{v.effect || '—'}</td>
                        <td style={{ color: 'var(--text-dim)' }}>{v.zygosity || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="card fade-in fade-in-4">
            <div className="card-label">Quality Metrics</div>
            <div className="qm-grid">
              <div className="qm-item"><div className="qm-dot qm-ok"></div><span>VCF Parse Success</span></div>
              <div className="qm-item"><div className="qm-dot qm-ok"></div><span>{qm.variants_detected != null ? qm.variants_detected : (pgx.detected_variants || []).length} Variants Detected</span></div>
              <div className="qm-item"><div className="qm-dot qm-ok"></div><span>Genes: {Array.isArray(qm.genes_analyzed) ? qm.genes_analyzed.join(', ') : '—'}</span></div>
              {Array.isArray(qm.confidence_factors) && qm.confidence_factors.map((f: string, i: number) => (
                <div key={i} className="qm-item"><div className="qm-dot qm-ok"></div><span>{f.replace(/_/g, ' ')}</span></div>
              ))}
            </div>
          </div>

          {/* Clinical Recommendation */}
          <div className="card rec-card fade-in fade-in-4">
            <div className="card-label">Clinical Recommendation</div>
            <div className="rec-action">{rec.action || '—'}</div>
            <div className="rec-grid">
              <div className="rec-item">
                <div className="rec-item-label">Dosing Guidance</div>
                <div className="rec-item-val">{rec.dosing_guidance || rec.dosing || '—'}</div>
              </div>
              <div className="rec-item">
                <div className="rec-item-label">Alternative Drugs</div>
                <div className="rec-item-val">
                  {alts.length > 0 ? alts.map((a: string, i: number) => <span key={i} className="alt-drug">{a}</span>) : <span style={{ color: 'var(--text-dim)' }}>None specified</span>}
                </div>
              </div>
              <div className="rec-item">
                <div className="rec-item-label">Urgency</div>
                <div className="rec-item-val"><span className={`urgency-badge urg-${urgCls}`}>{urg.charAt(0).toUpperCase() + urg.slice(1)}</span></div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              Reference: {rec.cpic || rec.cpic_guideline_reference || 'CPIC Guidelines'}
            </div>
          </div>

          {/* LLM Explanation */}
          <div className="card llm-card fade-in fade-in-5">
            <div className="card-label">🤖 AI-Generated Clinical Explanation</div>
            <div className="llm-section">
              <div className="llm-section-title">Summary</div>
              <div className="llm-text">{llm.summary || 'No summary available.'}</div>
            </div>
            <div className="llm-section">
              <div className="llm-section-title">Biological Mechanism</div>
              <div className="llm-text">{llm.mechanism || 'No mechanism details available.'}</div>
            </div>
            <div className="llm-section">
              <div className="llm-section-title">Risk Rationale</div>
              <div className="llm-text">{llm.risk_rationale || 'No risk rationale available.'}</div>
            </div>
            <div className="llm-section">
              <div className="llm-section-title">Patient-Friendly Explanation</div>
              <div className="llm-text">{llm.patient || llm.patient_friendly_explanation || 'No patient-friendly explanation available.'}</div>
            </div>
          </div>

          {/* JSON Output */}
          <div className="card json-card fade-in fade-in-6">
            <div className="card-label">JSON Output</div>
            <div className="json-toolbar">
              <button className="btn-sm" onClick={copyJSON}>📋 Copy JSON</button>
              <button className="btn-sm" onClick={downloadJSON}>⬇ Download JSON</button>
            </div>
            <div 
              className="json-viewer" 
              dangerouslySetInnerHTML={{ __html: syntaxHighlight(JSON.stringify(out, null, 2)) }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
