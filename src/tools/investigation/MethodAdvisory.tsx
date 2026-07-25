import React, { useState, useEffect } from 'react';
import { HelpCircle, Calculator, CheckSquare, Cpu, Check, Copy } from 'lucide-react';
import { aiService } from '../../utils/aiService';

export const MethodAdvisory: React.FC = () => {
  const [goal, setGoal] = useState<'compare' | 'associate' | 'predict'>('compare');
  const [varType, setVarType] = useState<'nominal' | 'ordinal' | 'continuous'>('continuous');
  const [groups, setGroups] = useState<'two' | 'multiple'>('two');
  const [paired, setPaired] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  // Power & Sample Size inputs
  const [alpha, setAlpha] = useState<number>(0.05);
  const [power, setPower] = useState<number>(0.80);
  const [effectSize, setEffectSize] = useState<number>(0.50);

  // AI model selector
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2:1b');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const { status, models } = await aiService.checkOllama();
      if (status && models.length > 0) {
        setModels(models);
        const saved = aiService.getSelectedOllamaModel();
        if (saved && models.includes(saved)) {
          setSelectedModel(saved);
        } else {
          setSelectedModel(models[0]);
        }
      }
    };
    loadModels();
  }, []);

  const calculateSampleSize = (): number => {
    // Formula for t-test sample size per group: n = 2 * ((z_alpha + z_beta) / effectSize)^2
    const zAlpha = alpha === 0.01 ? 2.576 : 1.96;
    const zBeta = power === 0.90 ? 1.282 : 0.842;
    const n = Math.ceil(2 * Math.pow((zAlpha + zBeta) / effectSize, 2));
    return n;
  };

  const handleAdvise = () => {
    let testName = '';
    let formula = '';
    let assumptions: string[] = [];
    let estimatedSampleSize = calculateSampleSize();

    if (goal === 'compare') {
      if (varType === 'continuous') {
        if (groups === 'two') {
          testName = paired ? "Paired-Samples t-test" : "Independent-Samples t-test";
          formula = "t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)";
          assumptions = ["Normal distribution of variables", "Homogeneity of variance (Levene's test)", "Independence of observation pairs"];
        } else {
          testName = paired ? "Repeated Measures ANOVA" : "One-Way ANOVA";
          formula = "F = MST / MSE";
          assumptions = ["Normality of residuals", "Homogeneity of variance", "Sphericity (for repeated measures)"];
        }
      } else if (varType === 'nominal') {
        testName = "Chi-Square Test of Independence";
        formula = "χ² = ∑(O - E)² / E";
        assumptions = ["Random sampling", "Large sample size (Expected frequency in each cell >= 5)"];
      } else {
        testName = paired ? "Wilcoxon Signed-Rank Test" : "Mann-Whitney U Test";
        formula = "U = n₁n₂ + (n₁(n₁+1))/2 - R₁";
        assumptions = ["Ordinal or non-normally distributed continuous data", "Independent observations"];
      }
    } else if (goal === 'associate') {
      if (varType === 'continuous') {
        testName = "Pearson Correlation Coefficient (r)";
        formula = "r = Cov(X,Y) / (σ_X * σ_Y)";
        assumptions = ["Linear relationship between variables", "Bivariate normality", "No extreme outliers"];
      } else {
        testName = "Spearman Rank Correlation (ρ)";
        formula = "ρ = 1 - (6∑d_i²) / (n(n²-1))";
        assumptions = ["Ordinal scale or monotonic relationship", "Pairs of observations are independent"];
      }
    } else {
      testName = varType === 'continuous' ? "Multiple Linear Regression" : "Logistic Regression";
      formula = varType === 'continuous' ? "Y = β₀ + β₁X₁ + ... + β_k X_k" : "ln(p/(1-p)) = β₀ + β₁X₁";
      assumptions = varType === 'continuous' 
        ? ["Linearity", "Homoscedasticity", "Independence of errors (Durbin-Watson)", "No multicollinearity (VIF < 10)"]
        : ["Binary dependent variable", "Independence of observations", "Large sample size"];
    }

    setRecommendation({ testName, formula, assumptions, estimatedSampleSize });
  };

  const handleAIAdvise = async () => {
    setIsProcessing(true);
    setAiReport(null);

    const prompt = `You are a senior biostatistician and methodology consultant.
Provide a complete methodological advisory brief for:
- Target Goal: ${goal}
- Variable Type: ${varType}
- Groups: ${groups}
- Paired: ${paired ? 'Yes' : 'No'}
- Alpha Level: ${alpha}, Target Power: ${power}, Effect Size: ${effectSize}

Output:
1. Recommended Primary & Alternative Statistical Tests
2. Minimum Required Sample Size & Statistical Power Justification
3. Reporting Compliance Checklists (CONSORT for RCTs, STROBE for observational, PRISMA for reviews)
4. Data Cleaning & Assumption Testing Protocol`;

    try {
      const response = await aiService.generateText(prompt, 1200, undefined, selectedModel, {
        systemPrompt: "You are an expert biostatistician advising on research designs."
      });
      setAiReport(response);
    } catch (err) {
      console.warn('Ollama offline fallback:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (aiReport) {
      navigator.clipboard.writeText(aiReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sampleSize = calculateSampleSize();

  return (
    <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] text-[#ECEBE9] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#2A2D30] pb-4">
        <div className="p-2.5 bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl">
          <HelpCircle size={22} />
        </div>
        <div>
          <h3 className="text-lg font-bold">Research Method Advisory</h3>
          <p className="text-xs text-[#A3A09B]">
            Expert statistical test selector, interactive sample size power calculator, and CONSORT/PRISMA compliance offline.
          </p>
        </div>
      </div>

      {/* AI Model Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#A3A09B]">Local AI Model Selector</label>
        <select
          value={selectedModel}
          onChange={(e) => {
            setSelectedModel(e.target.value);
            aiService.setSelectedOllamaModel(e.target.value);
          }}
          className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#3C6B4D]"
        >
          {models.length > 0 ? (
            models.map((m) => <option key={m} value={m}>{m}</option>)
          ) : (
            <option value="llama3.2:1b">llama3.2:1b (Deterministic Local Fallback)</option>
          )}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Goal Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#A3A09B]">Target Research Goal</label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value as any)}
            className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#3C6B4D]"
          >
            <option value="compare">Compare groups or treatment averages</option>
            <option value="associate">Evaluate correlation or association</option>
            <option value="predict">Predict outcome values (Regression)</option>
          </select>
        </div>

        {/* Variable Format Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#A3A09B]">Dependent / Outcome Variable Type</label>
          <select
            value={varType}
            onChange={(e) => setVarType(e.target.value as any)}
            className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#3C6B4D]"
          >
            <option value="continuous">Continuous / Ratio (e.g. Age, Weight, Test Score)</option>
            <option value="ordinal">Ordinal / Ranked (e.g. Likert Scale 1-5, Stage)</option>
            <option value="nominal">Nominal / Categorical (e.g. Gender, Yes/No)</option>
          </select>
        </div>
      </div>

      {goal === 'compare' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#111213] border border-[#2A2D30] p-4 rounded-xl">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#A3A09B]">Comparison Groups</span>
            <div className="flex gap-2">
              <button
                onClick={() => setGroups('two')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all border ${
                  groups === 'two' ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]' : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                Two Groups
              </button>
              <button
                onClick={() => setGroups('multiple')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all border ${
                  groups === 'multiple' ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]' : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                3+ Groups (ANOVA)
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#A3A09B]">Pairing Design</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPaired(false)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                  !paired ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]' : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                Unpaired
              </button>
              <button
                onClick={() => setPaired(true)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                  paired ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]' : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                Paired / Repeated
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Power & Sample Size Calculator */}
      <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-[#2A2D30] pb-2">
          <Calculator size={14} className="text-[#3C6B4D]" />
          <span className="text-xs font-bold text-[#ECEBE9]">Statistical Power & Sample Size Calculator</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#72706C]">Significance Level (α)</label>
            <select
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              className="bg-[#18191B] border border-[#2A2D30] p-2 rounded-lg text-xs font-mono text-[#ECEBE9]"
            >
              <option value={0.05}>α = 0.05 (Standard)</option>
              <option value={0.01}>α = 0.01 (Strict)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#72706C]">Statistical Power (1 - β)</label>
            <select
              value={power}
              onChange={(e) => setPower(Number(e.target.value))}
              className="bg-[#18191B] border border-[#2A2D30] p-2 rounded-lg text-xs font-mono text-[#ECEBE9]"
            >
              <option value={0.80}>80% Power (Standard)</option>
              <option value={0.90}>90% Power (High Rigor)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#72706C]">Expected Effect Size (Cohen's d)</label>
            <select
              value={effectSize}
              onChange={(e) => setEffectSize(Number(e.target.value))}
              className="bg-[#18191B] border border-[#2A2D30] p-2 rounded-lg text-xs font-mono text-[#ECEBE9]"
            >
              <option value={0.20}>d = 0.20 (Small Effect)</option>
              <option value={0.50}>d = 0.50 (Medium Effect)</option>
              <option value={0.80}>d = 0.80 (Large Effect)</option>
            </select>
          </div>
        </div>

        <div className="bg-[#18191B] p-3 rounded-lg border border-[#3C6B4D]/30 flex justify-between items-center text-xs font-bold">
          <span className="text-[#A3A09B]">Required Sample Size per Group:</span>
          <span className="text-base text-[#3C6B4D] font-mono font-extrabold">{sampleSize} subjects</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAdvise}
          className="flex-1 btn-primary py-3 rounded-xl font-bold text-xs shadow-md"
        >
          Suggest Statistical Method Offline
        </button>

        <button
          onClick={handleAIAdvise}
          disabled={isProcessing}
          className="btn-secondary py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shrink-0"
        >
          <Cpu size={14} className={isProcessing ? 'animate-spin' : ''} />
          <span>Full Method Brief</span>
        </button>
      </div>

      {/* Recommendation Output */}
      {recommendation && (
        <div className="flex flex-col gap-4 mt-2 bg-[#111213] border border-[#2A2D30] rounded-xl p-5 animate-fadeIn">
          <div>
            <span className="text-xs text-[#A3A09B] font-bold block mb-1">Recommended Primary Test</span>
            <span className="text-sm font-extrabold text-[#3C6B4D] font-mono">{recommendation.testName}</span>
          </div>

          <div>
            <span className="text-xs text-[#A3A09B] font-bold block mb-1">Mathematical Formula</span>
            <pre className="text-xs font-mono text-[#ECEBE9] bg-[#18191B] border border-[#2A2D30] px-3 py-2 rounded-lg">{recommendation.formula}</pre>
          </div>

          <div>
            <span className="text-xs text-[#A3A09B] font-bold block mb-1">Key Methodological Assumptions</span>
            <ul className="list-disc list-inside text-xs flex flex-col gap-1 text-[#ECEBE9] font-mono">
              {recommendation.assumptions.map((ass: string, idx: number) => (
                <li key={idx}>{ass}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* AI Advisory Report Output */}
      {aiReport && (
        <div className="flex flex-col gap-3 bg-[#111213] border border-[#2A2D30] rounded-xl p-5 relative animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2">
            <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5">
              <CheckSquare size={14} className="text-[#3C6B4D]" />
              <span>Full Methodological Brief & Compliance Checklist</span>
            </span>
            <button
              onClick={handleCopy}
              className="btn-secondary text-[11px] py-1 px-3 flex items-center gap-1"
            >
              {copied ? <Check size={12} className="text-[#3C6B4D]" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="text-xs leading-relaxed text-[#ECEBE9] overflow-auto max-h-[350px] whitespace-pre-wrap font-mono bg-[#18191B] p-4 rounded-lg border border-[#2A2D30]">
            {aiReport}
          </div>
        </div>
      )}
    </div>
  );
};

export const MethodAdvisoryTool = {
  id: 'method-adviser',
  name: 'Research Method Advisory',
  categories: ['investigation' as any],
  description: 'Expert statistical test selector, interactive sample size power calculator, and CONSORT/PRISMA compliance offline.',
  icon: 'HelpCircle',
  run: async (input: any) => input,
  component: MethodAdvisory
};

