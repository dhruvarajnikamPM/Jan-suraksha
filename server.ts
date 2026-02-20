import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import VCFParser from "./server/vcf-parser.ts";
import PharmacogenomicsAnalyzer from "./server/pharmacogenomics-analyzer.ts";
import LLMGenerator from "./server/llm-generator.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const vcfParser = new VCFParser();
const analyzer = new PharmacogenomicsAnalyzer();
const llmGenerator = new LLMGenerator();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      runtime: 'Node.js'
    });
  });

  app.post('/api/analyze', upload.single('vcf_file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'Please upload a valid .vcf file.' 
        });
      }

      if (!req.body.drugs) {
        return res.status(400).json({ 
          success: false, 
          error: 'Please specify at least one drug.' 
        });
      }

      const vcfContent = req.file.buffer.toString('utf-8');
      const { variants, success, errors } = vcfParser.parse(vcfContent);

      if (!success && variants.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: errors.join(', ') 
        });
      }

      const drugList = req.body.drugs
        .split(',')
        .map((d: string) => d.trim().toUpperCase())
        .filter((d: string) => d.length > 0);

      const results = [];

      for (const drug of drugList) {
        const riskResult = analyzer.computeRisk(variants, drug);
        const cpicRec = analyzer.getCPICRecommendations(drug, riskResult.phenotype);

        const llmExplanation = await llmGenerator.generateExplanation(
          drug,
          riskResult.phenotype,
          riskResult.risk,
          variants,
          riskResult.gene
        );

        const patientId = `PATIENT_${Math.floor(Date.now() / 1000) % 1000000}`;

        results.push({
          patient_id: patientId,
          drug,
          timestamp: new Date().toISOString(),
          risk_assessment: {
            risk_label: riskResult.risk,
            confidence_score: riskResult.confidence,
            severity: riskResult.severity
          },
          pharmacogenomic_profile: {
            primary_gene: riskResult.gene,
            diplotype: riskResult.diplotype,
            phenotype: riskResult.phenotype,
            detected_variants: riskResult.variants
          },
          clinical_recommendation: {
            action: cpicRec.action,
            dosing_guidance: cpicRec.dosing,
            alternative_drugs: cpicRec.alternatives,
            monitoring_required: cpicRec.monitoring,
            urgency: cpicRec.urgency,
            cpic_guideline_reference: cpicRec.cpic
          },
          llm_generated_explanation: llmExplanation,
          quality_metrics: {
            vcf_parsing_success: success,
            variants_detected: variants.length,
            genes_analyzed: [...new Set(variants.map((v: any) => v.gene))],
            confidence_factors: riskResult.variants.length > 0 ? ['known_variant', 'validated_rsid', 'cpic_evidence'] : ['no_variants_detected', 'standard_phenotype']
          }
        });
      }

      res.json({
        success: true,
        data: results.length === 1 ? results[0] : results
      });

    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  app.post('/api/upload-test', upload.single('vcf_file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }
      const vcfContent = req.file.buffer.toString('utf-8');
      const { variants, success, errors } = vcfParser.parse(vcfContent);
      res.json({
        filename: req.file.originalname,
        file_size: req.file.size,
        parsing_success: success,
        variants_detected: variants.length,
        errors: errors,
        sample_variants: variants.slice(0, 5)
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/genes', (req, res) => {
    res.json({ genes: analyzer.getGenesInfo() });
  });

  app.get('/api/drugs', (req, res) => {
    res.json({ drugs: analyzer.getSupportedDrugs() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.use(express.static(__dirname)); // Fallback for index.html if not built
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
