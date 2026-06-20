import { useState } from 'react';
import { Tag, Sparkles, Loader2, BarChart2, FileText } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

interface BatchRow {
  text: string;
  sentiment: string;
  category: string;
  spam: string;
  urgency: string;
  emotion: string;
}

export const AIClassifierTool = () => {
  const [inputText, setInputText] = useState('Absolutely amazing experience! The local system loaded the models instantly and the results are fast.');
  const [sentiment, setSentiment] = useState<{ label: string; score: number } | null>(null);
  const [category, setCategory] = useState<string>('');
  const [isSpam, setIsSpam] = useState<string>('');
  const [urgency, setUrgency] = useState<string>('');
  const [emotion, setEmotion] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);


  // Model settings config panel states
  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are an expert content moderation and text analysis assistant. Be extremely accurate.');
  const [temperature, setTemperature] = useState(0.2); // Low temp for extraction/classification accuracy
  const [maxTokens, setMaxTokens] = useState(60);

  // Expanded features states
  const [customLabels, setCustomLabels] = useState('Tech, Sports, Finance, Health, Entertainment');
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [bulkRows, setBulkRows] = useState<BatchRow[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleClassifyText = async (textToRun: string): Promise<BatchRow | null> => {
    try {
      // 1. Run Sentiment Classification
      let score = 0.99;
      let label = 'POSITIVE';
      try {
        const sentimentResult = await aiService.classify(textToRun);
        if (sentimentResult && sentimentResult.length > 0) {
          label = sentimentResult[0].label;
          score = sentimentResult[0].score;
        }
      } catch (err) {
        console.warn('Transformers.js local classifier fallback:', err);
      }

      // 2. Run Category, Spam, Urgency, Emotion Zero-Shot Classification
      const prompt = `Analyze this text content. Categorize it into one of these labels: ${customLabels}.
Also check for Spam (Yes/No), Urgency (High/Medium/Low), and Emotion (Joy, Sadness, Anger, Fear, Neutral).
Answer in exactly this format:
Category: [label]
Spam: [Yes/No]
Urgency: [High/Medium/Low]
Emotion: [Joy/Sadness/Anger/Fear/Neutral]

Text: "${textToRun}"`;

      const result = await aiService.generateText(prompt, maxTokens, () => {}, selectedModel || undefined, {
        systemPrompt,
        temperature
      });

      let categoryParsed = 'General';
      let spamParsed = 'No';
      let urgencyParsed = 'Low';
      let emotionParsed = 'Neutral';

      const lines = result.split('\n');
      lines.forEach(line => {
        const cleanLine = line.trim().toLowerCase();
        if (cleanLine.includes('category:')) {
          categoryParsed = line.replace(/category:/i, '').trim();
        } else if (cleanLine.includes('spam:')) {
          spamParsed = line.replace(/spam:/i, '').trim();
        } else if (cleanLine.includes('urgency:')) {
          urgencyParsed = line.replace(/urgency:/i, '').trim();
        } else if (cleanLine.includes('emotion:')) {
          emotionParsed = line.replace(/emotion:/i, '').trim();
        }
      });

      // Filter by confidence threshold
      const sentimentScorePct = score * 100;
      const sentimentLabelFinal = sentimentScorePct < confidenceThreshold ? 'UNCERTAIN' : label;

      return {
        text: textToRun,
        sentiment: `${sentimentLabelFinal} (${sentimentScorePct.toFixed(0)}%)`,
        category: categoryParsed,
        spam: spamParsed,
        urgency: urgencyParsed,
        emotion: emotionParsed
      };

    } catch (err) {
      console.error('Text classification failed:', err);
      return null;
    }
  };

  const handleSingleClassify = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setStatusMsg('Running classifiers...');
    setProgress(20);

    const result = await handleClassifyText(inputText);
    if (result) {
      // Unpack values
      const scoreMatch = result.sentiment.match(/\d+/);
      const scoreVal = scoreMatch ? parseInt(scoreMatch[0]) / 100 : 0.99;
      const labelVal = result.sentiment.split(' ')[0];
      setSentiment({ label: labelVal, score: scoreVal });
      setCategory(result.category);
      setIsSpam(result.spam);
      setUrgency(result.urgency);
      setEmotion(result.emotion);
    }
    setLoading(false);
    setStatusMsg('');
    setProgress(0);
  };

  // CSV/TXT File Bulk Upload
  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
      
      setBulkLoading(true);
      const items: BatchRow[] = [];
      for (let i = 0; i < Math.min(lines.length, 10); i++) { // cap bulk batch at 10 items for local execution speed
        setStatusMsg(`Processing row ${i + 1}/${Math.min(lines.length, 10)}...`);
        const item = await handleClassifyText(lines[i]);
        if (item) items.push(item);
      }
      setBulkRows(items);
      setBulkLoading(false);
      setStatusMsg('');
    };
    reader.readAsText(file);
  };

  // Export results helper
  const handleExport = (format: 'csv' | 'json') => {
    let content = '';
    let filename = `classification-report.${format}`;

    const data = bulkRows.length > 0 ? bulkRows : [{
      text: inputText,
      sentiment: sentiment ? `${sentiment.label} (${(sentiment.score*100).toFixed(0)}%)` : 'None',
      category: category || 'None',
      spam: isSpam || 'None',
      urgency: urgency || 'None',
      emotion: emotion || 'None'
    }];

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
    } else {
      content = 'Text,Sentiment,Category,Spam,Urgency,Emotion\n';
      data.forEach(d => {
        content += `"${d.text.replace(/"/g, '""')}","${d.sentiment}","${d.category}","${d.spam}","${d.urgency}","${d.emotion}"\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Heuristic highlighting helper
  const renderHighlightedText = () => {
    const positiveWords = ['amazing', 'great', 'excellent', 'fast', 'happy', 'cool', 'love', 'perfect'];
    const negativeWords = ['slow', 'bad', 'broken', 'error', 'failed', 'terrible', 'worst', 'spam'];

    const words = inputText.split(/(\s+)/);
    return words.map((w, idx) => {
      const cleanWord = w.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
      if (positiveWords.includes(cleanWord)) {
        return <span key={idx} className="text-green-400 font-semibold underline">{w}</span>;
      }
      if (negativeWords.includes(cleanWord)) {
        return <span key={idx} className="text-red-400 font-semibold underline">{w}</span>;
      }
      return w;
    });
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4 text-left">
      {/* Settings control panel */}
      <LocalAIConfigPanel
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        maxTokens={maxTokens}
        onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      <div className="glass-card p-6 flex flex-col gap-5">
        <div className="flex justify-between items-center border-b border-slate-850 pb-3">
          <h3 className="font-bold text-teal-400 flex items-center gap-2 text-base">
            <Tag size={18} />
            <span>Local AI Text Classifier</span>
          </h3>
        </div>

        {/* Categories Customization */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400">Custom Target Classification Labels</label>
          <input
            type="text"
            value={customLabels}
            onChange={(e) => setCustomLabels(e.target.value)}
            className="w-full bg-slate-900 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
            placeholder="LabelA, LabelB, LabelC..."
          />
        </div>

        {/* Highlighted text preview / Input area */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Input Text</span>
            <span className="text-[10px] text-slate-500">Highlight: positive in green, negative in red</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-24 bg-slate-900/60 border border-slate-850 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-sans resize-none"
            placeholder="Paste text here to classify..."
          />
          <div className="bg-slate-950/40 border border-slate-900 rounded p-2.5 min-h-[40px] text-xs text-slate-350 leading-relaxed font-sans">
            {renderHighlightedText()}
          </div>
        </div>

        {/* Parameter confidence slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Confidence Threshold filter</span>
            <span className="font-mono text-slate-300 bg-slate-900 px-1 rounded">{confidenceThreshold}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="95"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
            className="w-full accent-teal-500 bg-slate-900 h-1 rounded cursor-pointer"
          />
        </div>

        {/* Action button */}
        <button
          onClick={handleSingleClassify}
          disabled={loading || bulkLoading || !inputText.trim()}
          className="btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>{statusMsg || 'Classifying...'} {progress > 0 ? `(${progress}%)` : ''}</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Analyze Text</span>
            </>
          )}
        </button>

        {/* Report Output Card */}
        {(sentiment || category || isSpam || urgency || emotion) && !loading && (
          <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4.5 flex flex-col gap-3.5 mt-1 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <BarChart2 size={13} className="text-teal-400" />
                <span>Classification Diagnostics</span>
              </span>
              <button
                onClick={() => handleExport('json')}
                className="text-teal-400 hover:text-teal-350 text-[10px] font-medium"
              >
                Export JSON Report
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 text-xs">
              {/* Sentiment */}
              {sentiment && (
                <div className="bg-slate-900/50 border border-[#2A2D30] rounded-lg p-2.5 text-center flex flex-col justify-center">
                  <div className="text-[9px] text-slate-500 uppercase font-medium">Sentiment</div>
                  <div className={`text-xs font-bold ${sentiment.label === 'POSITIVE' ? 'text-green-400' : sentiment.label === 'UNCERTAIN' ? 'text-amber-400' : 'text-red-400'}`}>
                    {sentiment.label}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                    {(sentiment.score * 100).toFixed(0)}% Conf
                  </div>
                </div>
              )}

              {/* Category */}
              {category && (
                <div className="bg-slate-900/50 border border-[#2A2D30] rounded-lg p-2.5 text-center flex flex-col justify-center">
                  <div className="text-[9px] text-slate-500 uppercase font-medium">Category</div>
                  <div className="text-xs font-bold text-indigo-400 truncate">{category}</div>
                  <div className="text-[8px] text-slate-500 font-mono mt-0.5">Zero-shot LLM</div>
                </div>
              )}

              {/* Spam */}
              {isSpam && (
                <div className="bg-slate-900/50 border border-[#2A2D30] rounded-lg p-2.5 text-center flex flex-col justify-center">
                  <div className="text-[9px] text-slate-500 uppercase font-medium">Spam Check</div>
                  <div className={`text-xs font-bold ${isSpam.toLowerCase() === 'yes' ? 'text-red-400 animate-pulse' : 'text-teal-400'}`}>
                    {isSpam.toUpperCase()}
                  </div>
                  <div className="text-[8px] text-slate-500 font-mono mt-0.5">Content Scan</div>
                </div>
              )}

              {/* Urgency */}
              {urgency && (
                <div className="bg-slate-900/50 border border-[#2A2D30] rounded-lg p-2.5 text-center flex flex-col justify-center">
                  <div className="text-[9px] text-slate-500 uppercase font-medium">Urgency</div>
                  <div className={`text-xs font-bold ${urgency.toLowerCase() === 'high' ? 'text-red-400' : urgency.toLowerCase() === 'medium' ? 'text-amber-400' : 'text-slate-400'}`}>
                    {urgency.toUpperCase()}
                  </div>
                  <div className="text-[8px] text-slate-500 font-mono mt-0.5">Priority Check</div>
                </div>
              )}

              {/* Emotion */}
              {emotion && (
                <div className="bg-slate-900/50 border border-[#2A2D30] rounded-lg p-2.5 text-center flex flex-col justify-center">
                  <div className="text-[9px] text-slate-500 uppercase font-medium">Emotion</div>
                  <div className="text-xs font-bold text-teal-400 truncate">{emotion}</div>
                  <div className="text-[8px] text-slate-500 font-mono mt-0.5">Sentiment Tone</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bulk Batch Upload Column */}
        <div className="flex flex-col gap-3 border-t border-slate-850 pt-4">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <FileText size={13} className="text-teal-400" />
              <span>Bulk Text File Classifier Queue (TXT/CSV)</span>
            </span>
            {bulkRows.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="text-teal-400 hover:text-teal-350 text-[10px]"
                >
                  Download CSV
                </button>
                <button
                  onClick={() => setBulkRows([])}
                  className="text-red-500 hover:text-red-400 text-[10px]"
                >
                  Clear Queue
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            accept=".txt,.csv"
            onChange={handleBulkUpload}
            disabled={loading || bulkLoading}
            className="bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-[11px] text-slate-350 focus:outline-none"
          />

          {bulkLoading && statusMsg && (
            <div className="flex items-center gap-2 text-slate-400 font-mono text-[9px] bg-slate-950/60 p-2 border border-slate-900 rounded animate-pulse">
              <Loader2 size={11} className="animate-spin text-teal-400" />
              <span>{statusMsg}</span>
            </div>
          )}

          {bulkRows.length > 0 && (
            <div className="overflow-x-auto max-h-48 border border-slate-900 rounded-lg">
              <table className="w-full text-[10px] text-slate-400 border-collapse text-left">
                <thead className="bg-slate-950 text-slate-350 font-semibold border-b border-slate-900">
                  <tr>
                    <th className="p-2 min-w-[150px]">Text Row</th>
                    <th className="p-2">Sentiment</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Spam</th>
                    <th className="p-2">Urgency</th>
                    <th className="p-2">Emotion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 bg-slate-950/20">
                  {bulkRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-900/35 transition-colors">
                      <td className="p-2 truncate max-w-[150px]" title={r.text}>{r.text}</td>
                      <td className="p-2 text-slate-200">{r.sentiment}</td>
                      <td className="p-2 text-indigo-400">{r.category}</td>
                      <td className="p-2">{r.spam}</td>
                      <td className="p-2">{r.urgency}</td>
                      <td className="p-2 text-teal-400">{r.emotion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
