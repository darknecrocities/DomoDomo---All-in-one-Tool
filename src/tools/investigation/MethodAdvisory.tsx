import React, { useState } from 'react';
import { HelpCircle, AlertCircle } from 'lucide-react';

export const MethodAdvisory: React.FC = () => {
  const [goal, setGoal] = useState<'compare' | 'associate' | 'predict'>('compare');
  const [varType, setVarType] = useState<'nominal' | 'ordinal' | 'continuous'>('continuous');
  const [groups, setGroups] = useState<'two' | 'multiple'>('two');
  const [paired, setPaired] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const handleAdvise = () => {
    let testName = '';
    let formula = '';
    let assumptions: string[] = [];
    let estimatedSampleSize = 0;

    if (goal === 'compare') {
      if (varType === 'continuous') {
        if (groups === 'two') {
          testName = paired ? "Paired-Samples t-test" : "Independent-Samples t-test";
          formula = "t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)";
          assumptions = ["Normal distribution of variables", "Homogeneity of variance (Levene's test)", "Independence of observation pairs"];
          estimatedSampleSize = paired ? 64 : 128; // standard power 0.8, effect size 0.5
        } else {
          testName = paired ? "Repeated Measures ANOVA" : "One-Way ANOVA";
          formula = "F = MST / MSE";
          assumptions = ["Normality of residuals", "Homogeneity of variance", "Sphericity (for repeated measures)"];
          estimatedSampleSize = paired ? 90 : 150;
        }
      } else if (varType === 'nominal') {
        testName = "Chi-Square Test of Independence";
        formula = "χ² = ∑(O - E)² / E";
        assumptions = ["Random sampling", "Large sample size (Expected frequency in each cell >= 5)"];
        estimatedSampleSize = 200;
      } else {
        testName = paired ? "Wilcoxon Signed-Rank Test" : "Mann-Whitney U Test";
        formula = "U = n₁n₂ + (n₁(n₁+1))/2 - R₁";
        assumptions = ["Ordinal or non-normally distributed continuous data", "Independent observations"];
        estimatedSampleSize = 80;
      }
    } else if (goal === 'associate') {
      if (varType === 'continuous') {
        testName = "Pearson Correlation Coefficient (r)";
        formula = "r = Cov(X,Y) / (σ_X * σ_Y)";
        assumptions = ["Linear relationship between variables", "Bivariate normality", "No extreme outliers"];
        estimatedSampleSize = 85;
      } else {
        testName = "Spearman Rank Correlation (ρ)";
        formula = "ρ = 1 - (6∑d_i²) / (n(n²-1))";
        assumptions = ["Ordinal scale or monotonic relationship", "Pairs of observations are independent"];
        estimatedSampleSize = 100;
      }
    } else {
      testName = varType === 'continuous' ? "Multiple Linear Regression" : "Logistic Regression";
      formula = varType === 'continuous' ? "Y = β₀ + β₁X₁ + ... + β_k X_k" : "ln(p/(1-p)) = β₀ + β₁X₁";
      assumptions = varType === 'continuous' 
        ? ["Linearity", "Homoscedasticity", "Independence of errors (Durbin-Watson)", "No multicollinearity (VIF < 10)"]
        : ["Binary dependent variable", "Independence of observations", "Large sample size"];
      estimatedSampleSize = 150;
    }

    setRecommendation({ testName, formula, assumptions, estimatedSampleSize });
  };

  return (
    <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] text-[#ECEBE9] flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#3C6B4D]/10 text-[#3C6B4D] rounded-lg">
          <HelpCircle size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold">Research Method Advisory</h3>
          <p className="text-xs text-[#A3A09B]">Deterministic expert system to configure variables, choose research designs, and suggest statistical tests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Goal Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#A3A09B]">Target Research Goal</label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value as any)}
            className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] px-3 py-2 rounded-xl text-xs focus:outline-none"
          >
            <option value="compare">Compare groups or averages</option>
            <option value="associate">Evaluate correlation or association</option>
            <option value="predict">Predict outcome values (Regression)</option>
          </select>
        </div>

        {/* Variable Format Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#A3A09B]">Dependent/Target Variable Type</label>
          <select
            value={varType}
            onChange={(e) => setVarType(e.target.value as any)}
            className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] px-3 py-2 rounded-xl text-xs focus:outline-none"
          >
            <option value="continuous">Continuous / Interval / Ratio (e.g. Age, Height, Score)</option>
            <option value="ordinal">Ordinal / Ranked (e.g. Likert Scale 1-5, Grade)</option>
            <option value="nominal">Nominal / Categorical (e.g. Gender, Yes/No, Department)</option>
          </select>
        </div>
      </div>

      {goal === 'compare' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#111213] border border-[#2A2D30] p-4 rounded-xl">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#A3A09B]">Number of Comparison Groups</span>
            <div className="flex gap-2">
              <button
                onClick={() => setGroups('two')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                  groups === 'two' ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]' : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                Two Groups
              </button>
              <button
                onClick={() => setGroups('multiple')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                  groups === 'multiple' ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]' : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                3+ Groups
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#A3A09B]">Observation Pairing Type</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPaired(false)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  !paired ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]' : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                Independent / Unpaired
              </button>
              <button
                onClick={() => setPaired(true)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  paired ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/45 text-[#ECEBE9]' : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                Paired / Repeated Measures
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleAdvise}
        className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs"
      >
        Suggest Statistical Method
      </button>

      {recommendation && (
        <div className="flex flex-col gap-4 mt-2 bg-[#111213] border border-[#2A2D30] rounded-xl p-4 animate-fadeIn">
          <div>
            <span className="text-xs text-[#A3A09B] font-bold block mb-1">Recommended Statistical Test</span>
            <span className="text-sm font-bold text-[#ECEBE9]">{recommendation.testName}</span>
          </div>

          <div>
            <span className="text-xs text-[#A3A09B] font-bold block mb-1">Underlying Mathematical Formula</span>
            <pre className="text-xs font-mono text-[#3C6B4D] bg-[#18191B] border border-[#2A2D30] px-3 py-2 rounded-lg">{recommendation.formula}</pre>
          </div>

          <div>
            <span className="text-xs text-[#A3A09B] font-bold block mb-1">Key Methodological Assumptions</span>
            <ul className="list-disc list-inside text-xs flex flex-col gap-1 text-[#ECEBE9]">
              {recommendation.assumptions.map((ass: string, idx: number) => (
                <li key={idx}>{ass}</li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-xs border-t border-[#2A2D30] pt-3 text-[#A3A09B]">
            <AlertCircle size={14} className="text-[#3C6B4D]" />
            <span>Suggested Minimum Sample Size (Power = 0.8, Medium Effect Size): <strong>{recommendation.estimatedSampleSize} subjects</strong></span>
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
  description: 'Deterministic expert system to configure variables, choose research designs, and suggest statistical tests.',
  icon: 'HelpCircle',
  run: async (input: any) => input,
  component: MethodAdvisory
};
