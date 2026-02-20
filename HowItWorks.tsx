import React from 'react';

export default function HowItWorks() {
  return (
    <section className="section" id="how" style={{ background: 'rgba(0,10,30,0.3)' }}>
      <div className="container">
        <div className="section-title">
          <h2>How It Works</h2>
          <p>Four steps from raw genomic data to clinical decision support</p>
        </div>
        <div className="steps-row">
          <div className="step-item">
            <div className="step-num">📁</div>
            <div className="step-title">Upload VCF</div>
            <div className="step-desc">Upload standard VCF v4.2 file containing your genomic variant data with pharmacogenomic annotations</div>
          </div>
          <div className="step-item">
            <div className="step-num">🔬</div>
            <div className="step-title">Gene Analysis</div>
            <div className="step-desc">Our engine scans 6 critical pharmacogenes and maps detected variants to known star alleles</div>
          </div>
          <div className="step-item">
            <div className="step-num">⚡</div>
            <div className="step-title">Risk Prediction</div>
            <div className="step-desc">AI models cross-reference variants with CPIC guidelines to predict drug-specific risk levels</div>
          </div>
          <div className="step-item">
            <div className="step-num">📋</div>
            <div className="step-title">Clinical Report</div>
            <div className="step-desc">Receive structured JSON output with dosing guidance, alternatives, and LLM-generated explanations</div>
          </div>
        </div>
      </div>
    </section>
  );
}
