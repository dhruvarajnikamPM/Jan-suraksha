export default class VCFParser {
  VARIANT_DB: Record<string, any>;
  constructor() {
    this.VARIANT_DB = {
      'rs3892097': { gene: 'CYP2D6', star: '*4', effect: 'Loss of function', zygosity: 'heterozygous', significance: 'Poor metabolizer marker', phenotype_class: 'PM', activity: 0 },
      'rs1065852': { gene: 'CYP2D6', star: '*10', effect: 'Reduced function', zygosity: 'heterozygous', significance: 'Intermediate metabolizer marker', phenotype_class: 'IM', activity: 0.5 },
      'rs16947': { gene: 'CYP2D6', star: '*2', effect: 'Normal/increased activity', zygosity: 'heterozygous', significance: 'Normal metabolizer', phenotype_class: 'NM', activity: 1.0 },
      'rs5030655': { gene: 'CYP2D6', star: '*6', effect: 'No function', zygosity: 'heterozygous', significance: 'Poor metabolizer marker', phenotype_class: 'PM', activity: 0 },
      'rs4244285': { gene: 'CYP2C19', star: '*2', effect: 'Loss of function', zygosity: 'heterozygous', significance: 'Poor metabolizer marker', phenotype_class: 'PM', activity: 0 },
      'rs4986893': { gene: 'CYP2C19', star: '*3', effect: 'Loss of function', zygosity: 'heterozygous', significance: 'Poor metabolizer marker', phenotype_class: 'PM', activity: 0 },
      'rs12248560': { gene: 'CYP2C19', star: '*17', effect: 'Increased function', zygosity: 'heterozygous', significance: 'Rapid metabolizer marker', phenotype_class: 'RM', activity: 1.5 },
      'rs1799853': { gene: 'CYP2C9', star: '*2', effect: 'Reduced function (30%)', zygosity: 'heterozygous', significance: 'Intermediate metabolizer', phenotype_class: 'IM', activity: 0.7 },
      'rs1057910': { gene: 'CYP2C9', star: '*3', effect: 'Significantly reduced (90%)', zygosity: 'heterozygous', significance: 'Poor metabolizer marker', phenotype_class: 'PM', activity: 0.1 },
      'rs4149056': { gene: 'SLCO1B1', star: '*5', effect: 'Reduced hepatic transport', zygosity: 'heterozygous', significance: 'Myopathy risk marker', phenotype_class: 'PM', activity: 0 },
      'rs1800462': { gene: 'TPMT', star: '*2', effect: 'Reduced enzyme activity', zygosity: 'heterozygous', significance: 'Intermediate/Poor metabolizer', phenotype_class: 'IM', activity: 0.5 },
      'rs1800460': { gene: 'TPMT', star: '*3B', effect: 'Reduced enzyme activity', zygosity: 'heterozygous', significance: 'Intermediate metabolizer', phenotype_class: 'IM', activity: 0.5 },
      'rs1142345': { gene: 'TPMT', star: '*3C', effect: 'Reduced enzyme activity', zygosity: 'heterozygous', significance: 'Intermediate metabolizer', phenotype_class: 'IM', activity: 0.5 },
      'rs3918290': { gene: 'DPYD', star: '*2A', effect: 'No enzyme function', zygosity: 'heterozygous', significance: 'Critical toxicity risk', phenotype_class: 'PM', activity: 0 },
      'rs67376798': { gene: 'DPYD', star: '*13', effect: 'No enzyme function', zygosity: 'heterozygous', significance: 'Critical toxicity risk', phenotype_class: 'PM', activity: 0 }
    };
  }

  parse(vcfContent: string) {
    const variants: any[] = [];
    const errors: string[] = [];
    const lines = vcfContent.split('\n');
    let variantCount = 0;

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum].trim();
      if (!line) continue;
      if (line.startsWith('##fileformat') || line.startsWith('##')) continue;
      if (line.startsWith('#CHROM')) continue;

      if (line && !line.startsWith('#')) {
        try {
          const fields = line.split('\t');
          if (fields.length < 8) {
            errors.push(`Line ${lineNum + 1}: insufficient fields`);
            continue;
          }

          const chrom = fields[0];
          const pos = fields[1];
          const variantId = fields[2];
          const ref = fields[3];
          const alt = fields[4];
          const info = fields[7] || '';

          const infoMap = this.parseInfo(info);
          const rsid = (infoMap['RS'] || infoMap['rs'] || variantId || '').toLowerCase();
          const gene = infoMap['GENE'] || infoMap['gene'] || '';
          const star = infoMap['STAR'] || infoMap['star'] || '';

          if (rsid && rsid.startsWith('rs')) {
            if (this.VARIANT_DB[rsid]) {
              const dbEntry = this.VARIANT_DB[rsid];
              variants.push({
                rsid, chrom, pos, ref, alt,
                gene: gene || dbEntry.gene,
                star_allele: star || dbEntry.star,
                effect: dbEntry.effect,
                zygosity: dbEntry.zygosity,
                clinical_significance: dbEntry.significance,
                phenotype_class: dbEntry.phenotype_class,
                activity: dbEntry.activity
              });
              variantCount++;
            } else {
              variants.push({
                rsid, chrom, pos, ref, alt,
                gene: gene || 'Unknown',
                star_allele: star || 'Unknown',
                effect: 'Unknown',
                zygosity: 'unknown',
                clinical_significance: 'Novel or uncharacterized variant',
                phenotype_class: 'Unknown',
                activity: null
              });
              variantCount++;
            }
          } else if (gene) {
            variants.push({
              rsid: rsid || 'unknown', chrom, pos, ref, alt,
              gene,
              star_allele: star || 'Unknown',
              effect: 'Unknown',
              zygosity: 'unknown',
              clinical_significance: 'Annotated by gene only',
              phenotype_class: 'Unknown',
              activity: null
            });
            variantCount++;
          }
        } catch (e: any) {
          errors.push(`Line ${lineNum + 1}: ${e.message}`);
        }
      }
    }

    const success = variantCount > 0 || lines.length < 20;
    return { variants, success, errors };
  }

  parseInfo(infoString: string) {
    const infoMap: Record<string, string> = {};
    if (!infoString) return infoMap;
    infoString.split(';').forEach(item => {
      if (item.includes('=')) {
        const [key, value] = item.split('=', 2);
        infoMap[key.toUpperCase()] = value.trim();
        infoMap[key.toLowerCase()] = value.trim();
      }
    });
    return infoMap;
  }
}
