import React, { useRef, useState } from 'react';

interface AnalysisToolProps {
  onAnalyze: (vcfContent: string, selectedDrugs: string[]) => void;
  isLoading: boolean;
}

const DEMO_VCF = `##fileformat=VCFv4.2
##source=PharmaGuard_Demo
##INFO=<ID=GENE,Number=1,Type=String,Description="Gene symbol">
##INFO=<ID=STAR,Number=1,Type=String,Description="Star allele">
##INFO=<ID=RS,Number=1,Type=String,Description="dbSNP rsID">
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO
chr22\t42522613\trs3892097\tC\tT\t.\tPASS\tGENE=CYP2D6;STAR=*4;RS=rs3892097
chr10\t96521657\trs1799853\tC\tT\t.\tPASS\tGENE=CYP2C9;STAR=*2;RS=rs1799853
chr10\t96702047\trs1057910\tA\tC\t.\tPASS\tGENE=CYP2C9;STAR=*3;RS=rs1057910
chr6\t18157629\trs4244285\tG\tA\t.\tPASS\tGENE=CYP2C19;STAR=*2;RS=rs4244285
chr12\t21331549\trs4149056\tT\tC\t.\tPASS\tGENE=SLCO1B1;STAR=*5;RS=rs4149056`;

const DRUGS = ['CODEINE', 'WARFARIN', 'CLOPIDOGREL', 'SIMVASTATIN', 'AZATHIOPRINE', 'FLUOROURACIL'];

export default function AnalysisTool({ onAnalyze, isLoading }: AnalysisToolProps) {
  const [vcfContent, setVcfContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5MB.');
      return;
    }
    const r = new FileReader();
    r.onload = (ev) => {
      setVcfContent(ev.target?.result as string);
      setFileName(`${f.name} (${Math.round(f.size / 1024)}KB)`);
    };
    r.readAsText(f);
  };

  const loadDemoVCF = () => {
    setVcfContent(DEMO_VCF);
    setFileName('demo_patient.vcf (sample)');
  };

  const toggleDrug = (drug: string) => {
    setSelectedDrugs(prev => 
      prev.includes(drug) ? prev.filter(d => d !== drug) : [...prev, drug]
    );
  };

  const clearAllInputs = () => {
    setVcfContent('');
    setFileName('');
    setSelectedDrugs([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isReady = !!vcfContent && selectedDrugs.length > 0;

  return (
    <section className="section" id="tool">
      <div className="container">
        <div className="section-title">
          <h2>Genomic Analysis</h2>
          <p>Upload your VCF file and select drugs to receive personalized pharmacogenomic risk assessment</p>
        </div>
        <div className="tool-grid">
          {/* Left: Upload */}
          <div>
            <div className="panel-label">01 · Upload VCF File</div>
            <div 
              className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${fileName ? 'file-loaded' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
            >
              <input 
                type="file" 
                id="vcfFileInput" 
                accept=".vcf,.txt" 
                ref={fileInputRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <div className="upload-icon">🧬</div>
              <div className="upload-title">Drop your VCF file here</div>
              <div className="upload-sub">or click to browse · .vcf format · max 5MB</div>
              {fileName && (
                <div className="upload-file-info" style={{ display: 'block' }}>
                  ✓ File loaded: <span>{fileName}</span>
                </div>
              )}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div className="panel-label" style={{ marginBottom: '0.5rem' }}>Sample VCF Structure</div>
              <div className="vcf-sample">
                <span className="vcf-meta">##fileformat=VCFv4.2</span><br/>
                <span className="vcf-meta">##INFO=&lt;ID=GENE,Number=1,Type=String&gt;</span><br/>
                <span className="vcf-meta">##INFO=&lt;ID=STAR,Number=1,Type=String&gt;</span><br/>
                <span className="vcf-meta">##INFO=&lt;ID=RS,Number=1,Type=String&gt;</span><br/>
                <span className="vcf-header">#CHROM POS      ID        REF ALT INFO</span><br/>
                <span className="vcf-data">chr22  42522613 rs3892097 C   T   GENE=CYP2D6;STAR=*4;RS=rs3892097</span><br/>
                <span className="vcf-data">chr10  96521657 rs1799853 C   T   GENE=CYP2C9;STAR=*2;RS=rs1799853</span><br/>
                <span className="vcf-data">chr10  96702047 rs1057910 A   C   GENE=CYP2C9;STAR=*3;RS=rs1057910</span><br/>
                <span className="vcf-data">chr6   18157629 rs4244285 G   A   GENE=CYP2C19;STAR=*2;RS=rs4244285</span><br/>
                <span className="vcf-data">chr12  21331549 rs4149056 T   C   GENE=SLCO1B1;STAR=*5;RS=rs4149056</span>
              </div>
            </div>
            <button className="btn-sm" style={{ marginTop: '0.75rem', width: '100%' }} onClick={loadDemoVCF}>
              ⚡ Load Demo VCF File
            </button>
          </div>

          {/* Right: Drug + Analyze */}
          <div className="drug-panel">
            <div>
              <div className="panel-label">02 · Select Drug(s)</div>
              <input 
                type="text" 
                className="drug-input" 
                placeholder="e.g. CODEINE, WARFARIN" 
                readOnly 
                value={selectedDrugs.join(', ')}
              />
              <div className="drug-chips">
                {DRUGS.map(drug => (
                  <div 
                    key={drug}
                    className={`drug-chip ${selectedDrugs.includes(drug) ? 'active' : ''}`}
                    onClick={() => toggleDrug(drug)}
                  >
                    {drug}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <button 
                className="btn-analyze" 
                disabled={!isReady || isLoading}
                onClick={() => onAnalyze(vcfContent, selectedDrugs)}
              >
                ⬡ Analyze Pharmacogenomics
              </button>
              <button className="btn-sm" style={{ marginTop: '0.75rem', width: '100%' }} onClick={clearAllInputs}>
                🗑 Clear VCF & Drug Selection
              </button>
              <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Powered by CPIC Guidelines · Results for educational use only
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
