import React from 'react';

export default function GenesInfo() {
  return (
    <section className="section" id="genes">
      <div className="container">
        <div className="section-title">
          <h2>Pharmacogenomic Genes</h2>
          <p>Six critical genes that determine how your body metabolizes common medications</p>
        </div>
        <div className="genes-grid">
          <div className="gene-card">
            <div className="gene-name">CYP2D6</div>
            <div className="gene-full">Cytochrome P450 2D6</div>
            <div className="gene-drugs"><span className="gene-drug-tag">CODEINE</span></div>
            <div className="gene-variants">Metabolizes ~25% of all drugs. Key variants: *4 (PM), *10 (IM), *17, *2 (NM/RM). Poor metabolizers risk opioid toxicity; ultra-rapid metabolizers may have inadequate analgesia.</div>
          </div>
          <div className="gene-card">
            <div className="gene-name">CYP2C19</div>
            <div className="gene-full">Cytochrome P450 2C19</div>
            <div className="gene-drugs"><span className="gene-drug-tag">CLOPIDOGREL</span></div>
            <div className="gene-variants">Activates prodrugs like clopidogrel. Variants *2, *3 cause loss-of-function (PM). *17 causes increased activity. PMs cannot activate clopidogrel → inadequate antiplatelet effect.</div>
          </div>
          <div className="gene-card">
            <div className="gene-name">CYP2C9</div>
            <div className="gene-full">Cytochrome P450 2C9</div>
            <div className="gene-drugs"><span className="gene-drug-tag">WARFARIN</span></div>
            <div className="gene-variants">Primary warfarin metabolizer. *2 and *3 alleles reduce enzyme activity by 30–90%, causing warfarin accumulation and increased bleeding risk. Dose reduction required.</div>
          </div>
          <div className="gene-card">
            <div className="gene-name">SLCO1B1</div>
            <div className="gene-full">Solute Carrier Organic Anion 1B1</div>
            <div className="gene-drugs"><span className="gene-drug-tag">SIMVASTATIN</span></div>
            <div className="gene-variants">Hepatic transporter for statins. *5 allele (rs4149056) reduces transport, increasing plasma simvastatin levels 2-3x and causing myopathy/rhabdomyolysis risk.</div>
          </div>
          <div className="gene-card">
            <div className="gene-name">TPMT</div>
            <div className="gene-full">Thiopurine S-Methyltransferase</div>
            <div className="gene-drugs"><span className="gene-drug-tag">AZATHIOPRINE</span></div>
            <div className="gene-variants">Inactivates thiopurine drugs. Deficient patients (*2, *3A, *3B, *3C) accumulate toxic metabolites causing severe myelosuppression. Requires 10x dose reduction.</div>
          </div>
          <div className="gene-card">
            <div className="gene-name">DPYD</div>
            <div className="gene-full">Dihydropyrimidine Dehydrogenase</div>
            <div className="gene-drugs"><span className="gene-drug-tag">FLUOROURACIL</span></div>
            <div className="gene-variants">Catabolizes fluorouracil. *2A (rs3918290) causes complete enzyme deficiency → drug accumulation → life-threatening toxicity. CONTRAINDICATED with full-dose 5-FU.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
