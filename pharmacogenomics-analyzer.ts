import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class PharmacogenomicsAnalyzer {
  CPIC_RECOMMENDATIONS: Record<string, any>;
  DRUG_GENE_MAP: Record<string, any>;
  RISK_CONFIG: Record<string, any>;
  GENES_INFO: Record<string, any>;

  constructor() {
    try {
      const cpicPath = path.join(__dirname, 'cpic-data.json');
      const fileContent = fs.readFileSync(cpicPath, 'utf8');
      this.CPIC_RECOMMENDATIONS = JSON.parse(fileContent);
    } catch (error: any) {
      console.warn('[WARN] Failed to load cpic-data.json:', error.message);
      this.CPIC_RECOMMENDATIONS = {};
    }

    this.DRUG_GENE_MAP = {
      'CODEINE': { gene: 'CYP2D6', pm_risk: 'Toxic', im_risk: 'Adjust Dosage', nm_risk: 'Safe', rm_risk: 'Safe', urm_risk: 'Toxic' },
      'WARFARIN': { gene: 'CYP2C9', pm_risk: 'Adjust Dosage', im_risk: 'Adjust Dosage', nm_risk: 'Safe', rm_risk: 'Safe', urm_risk: 'Safe' },
      'CLOPIDOGREL': { gene: 'CYP2C19', pm_risk: 'Ineffective', im_risk: 'Adjust Dosage', nm_risk: 'Safe', rm_risk: 'Safe', urm_risk: 'Adjust Dosage' },
      'SIMVASTATIN': { gene: 'SLCO1B1', pm_risk: 'Toxic', im_risk: 'Adjust Dosage', nm_risk: 'Safe', rm_risk: 'Safe', urm_risk: 'Safe' },
      'AZATHIOPRINE': { gene: 'TPMT', pm_risk: 'Toxic', im_risk: 'Adjust Dosage', nm_risk: 'Safe', rm_risk: 'Safe', urm_risk: 'Safe' },
      'FLUOROURACIL': { gene: 'DPYD', pm_risk: 'Toxic', im_risk: 'Adjust Dosage', nm_risk: 'Safe', rm_risk: 'Safe', urm_risk: 'Safe' }
    };

    this.RISK_CONFIG = {
      'Safe': { severity: 'none', confidence: 0.95 },
      'Adjust Dosage': { severity: 'moderate', confidence: 0.88 },
      'Toxic': { severity: 'critical', confidence: 0.93 },
      'Ineffective': { severity: 'high', confidence: 0.90 },
      'Unknown': { severity: 'none', confidence: 0.50 }
    };

    this.GENES_INFO = {
      'CYP2D6': { name: 'Cytochrome P450 2D6', drugs: ['CODEINE'], description: 'Metabolizes ~25% of all drugs. Key variants: *4 (PM), *10 (IM), *17, *2 (NM/RM).' },
      'CYP2C19': { name: 'Cytochrome P450 2C19', drugs: ['CLOPIDOGREL'], description: 'Activates prodrugs like clopidogrel. Variants *2, *3 cause loss-of-function (PM).' },
      'CYP2C9': { name: 'Cytochrome P450 2C9', drugs: ['WARFARIN'], description: 'Primary warfarin metabolizer. *2 and *3 alleles reduce enzyme activity.' },
      'SLCO1B1': { name: 'Solute Carrier Organic Anion 1B1', drugs: ['SIMVASTATIN'], description: 'Hepatic transporter for statins. *5 allele increases myopathy risk.' },
      'TPMT': { name: 'Thiopurine S-Methyltransferase', drugs: ['AZATHIOPRINE'], description: 'Inactivates thiopurine drugs. Deficiency causes myelosuppression.' },
      'DPYD': { name: 'Dihydropyrimidine Dehydrogenase', drugs: ['FLUOROURACIL'], description: 'Catabolizes fluorouracil. *2A causes life-threatening toxicity.' }
    };
  }

  computeRisk(variants: any[], drug: string) {
    drug = drug.toUpperCase();
    if (!this.DRUG_GENE_MAP[drug]) {
      return { risk: 'Unknown', phenotype: 'Unknown', confidence: 0.5, gene: 'Unknown', diplotype: '*1/*1', severity: 'none', variants: [] };
    }

    const drugInfo = this.DRUG_GENE_MAP[drug];
    const gene = drugInfo.gene;
    const geneVariants = variants.filter(v => v.gene === gene && v.phenotype_class !== 'Unknown');

    if (geneVariants.length === 0) {
      return { risk: 'Safe', phenotype: 'NM', confidence: 0.85, gene, diplotype: '*1/*1', severity: 'none', variants: [] };
    }

    const activities = geneVariants.map(v => v.activity).filter(a => a !== null && a !== undefined);
    const totalActivity = activities.length > 0 ? activities.reduce((a, b) => a + b, 0) / activities.length : 1.0;

    let phenotype;
    if (totalActivity === 0) phenotype = 'PM';
    else if (totalActivity < 0.5) phenotype = 'PM';
    else if (totalActivity < 1.0) phenotype = 'IM';
    else if (totalActivity === 1.0) phenotype = 'NM';
    else if (totalActivity < 2.0) phenotype = 'RM';
    else phenotype = 'URM';

    const stars = geneVariants.map(v => v.star_allele).filter(s => s && s !== 'Unknown');
    let diplotype;
    if (stars.length >= 2) diplotype = `${stars[0]}/${stars[1]}`;
    else if (stars.length === 1) diplotype = `*1/${stars[0]}`;
    else diplotype = '*1/*1';

    const riskKey = `${phenotype.toLowerCase()}_risk`;
    const risk = drugInfo[riskKey] || 'Unknown';
    const rc = this.RISK_CONFIG[risk] || this.RISK_CONFIG['Unknown'];

    return { risk, phenotype, confidence: rc.confidence, gene, diplotype, severity: rc.severity, variants: geneVariants };
  }

  getCPICRecommendations(drug: string, phenotype: string) {
    drug = drug.toUpperCase();
    phenotype = phenotype.toUpperCase();

    if (!this.CPIC_RECOMMENDATIONS[drug]) {
      return { action: 'Standard dosing', dosing: 'No specific pharmacogenomic recommendation available.', alternatives: [], monitoring: false, urgency: 'routine', cpic: 'CPIC Guidelines' };
    }

    const drugRecs = this.CPIC_RECOMMENDATIONS[drug];
    if (!drugRecs[phenotype]) phenotype = 'NM';

    return drugRecs[phenotype] || drugRecs['NM'] || { action: 'Standard dosing', dosing: 'Standard dosing recommended.', alternatives: [], monitoring: false, urgency: 'routine', cpic: 'CPIC Guidelines' };
  }

  getGenesInfo() {
    return Object.entries(this.GENES_INFO).map(([symbol, info]) => ({ symbol, ...(info as any) }));
  }

  getSupportedDrugs() {
    return Object.keys(this.DRUG_GENE_MAP);
  }
}
