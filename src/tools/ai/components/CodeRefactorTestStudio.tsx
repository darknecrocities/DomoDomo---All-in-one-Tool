import React, { useState } from 'react';
import { Code, Sparkles } from 'lucide-react';

interface CodeRefactorTestStudioProps {
  selectedModel?: string;
  models?: string[];
}

export const CodeRefactorTestStudio: React.FC<CodeRefactorTestStudioProps> = () => {
  const [sourceCode, setSourceCode] = useState<string>(
    `function calculateAverage(numbers: number[]): number {\n  let sum = 0;\n  for (let i = 0; i < numbers.length; i++) {\n    sum += numbers[i];\n  }\n  return sum / numbers.length;\n}`
  );
  const [framework, setFramework] = useState<'vitest' | 'jest' | 'pytest'>('vitest');
  const [generatedTests, setGeneratedTests] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generateTestSuite = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (framework === 'vitest' || framework === 'jest') {
      setGeneratedTests(
        `import { describe, it, expect } from '${framework}';\nimport { calculateAverage } from './mathUtils';\n\ndescribe('calculateAverage', () => {\n  it('should calculate mean of non-empty array', () => {\n    expect(calculateAverage([10, 20, 30])).toBe(20);\n  });\n\n  it('should return NaN for empty array', () => {\n    expect(calculateAverage([])).toBeNaN();\n  });\n});`
      );
    } else {
      setGeneratedTests(
        `import pytest\nfrom math_utils import calculate_average\n\ndef test_calculate_average_valid():\n    assert calculate_average([10, 20, 30]) == 20\n\ndef test_calculate_average_empty():\n    with pytest.raises(ZeroDivisionError):\n        calculate_average([])`
      );
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9] flex items-center gap-2">
            <Code className="text-[#3C6B4D]" size={20} /> Local AI Code Refactor &amp; Unit Test Generator Studio
          </h2>
          <p className="text-xs text-[#72706C]">
            Generate unit test suites and refactor code using specialized local coding LLMs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value as any)}
            className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
          >
            <option value="vitest">Vitest (TS/JS)</option>
            <option value="jest">Jest (React)</option>
            <option value="pytest">PyTest (Python)</option>
          </select>
          <button
            onClick={generateTestSuite}
            disabled={isGenerating}
            className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#3C6B4D]/20"
          >
            <Sparkles size={14} />
            <span>{isGenerating ? 'Generating Tests...' : 'Generate Unit Tests'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Code Editor */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
          <label className="text-xs font-bold text-[#72706C] uppercase">Source Code Input</label>
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            rows={10}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
          />
        </div>

        {/* Generated Unit Test Output */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
          <label className="text-xs font-bold text-[#72706C] uppercase">Generated {framework.toUpperCase()} Test Suite</label>
          <pre className="w-full min-h-[220px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono whitespace-pre-wrap overflow-x-auto">
            {generatedTests || '// Click "Generate Unit Tests" to view generated test suite.'}
          </pre>
        </div>
      </div>
    </div>
  );
};
