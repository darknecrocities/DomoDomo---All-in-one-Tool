import React, { useState, useEffect } from 'react';
import { Subtitles, Cpu, Sparkles, RefreshCw, Upload, Download, Clock, Search, FileText } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

interface SubtitleBlock {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
}

export const SRTSubtitleTool: React.FC = () => {
  const [rawSubtitles, setRawSubtitles] = useState(`1
00:00:01,000 --> 00:00:04,500
Welcome to DomoDomo's client-side web utility suite.

2
00:00:05,000 --> 00:00:08,200
All processing runs locally inside your browser sandbox.`);

  const [searchQuery, setSearchQuery] = useState('');
  const [targetLang, setTargetLang] = useState('Spanish');

  // Local AI State
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
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
    fetchModels();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setRawSubtitles(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  // Parse SRT blocks
  const parseBlocks = (text: string): SubtitleBlock[] => {
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const parts = normalized.split(/\n\s*\n/);
    const blocks: SubtitleBlock[] = [];

    parts.forEach((part, idx) => {
      const lines = part.trim().split('\n');
      if (lines.length >= 2) {
        const timeLineIdx = lines[0].includes('-->') ? 0 : 1;
        const timeMatch = lines[timeLineIdx]?.match(/(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})/);

        if (timeMatch) {
          const content = lines.slice(timeLineIdx + 1).join(' ');
          blocks.push({
            id: idx + 1,
            startTime: timeMatch[1],
            endTime: timeMatch[2],
            text: content,
          });
        }
      }
    });

    return blocks.length > 0
      ? blocks
      : [
          { id: 1, startTime: '00:00:01,000', endTime: '00:00:04,500', text: "Welcome to DomoDomo's client-side suite." },
        ];
  };

  const parsedBlocks = parseBlocks(rawSubtitles);

  const handleShiftTimestamps = (deltaMs: number) => {
    const shiftTimeStr = (timeStr: string) => {
      const parts = timeStr.replace('.', ',').split(/[:,]/);
      if (parts.length < 4) return timeStr;
      let totalMs =
        (Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2])) * 1000 +
        Number(parts[3]) +
        deltaMs;
      if (totalMs < 0) totalMs = 0;

      const h = Math.floor(totalMs / 3600000);
      totalMs %= 3600000;
      const m = Math.floor(totalMs / 60000);
      totalMs %= 60000;
      const s = Math.floor(totalMs / 1000);
      const ms = totalMs % 1000;

      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
    };

    const lines = rawSubtitles.split('\n');
    const timeRegex = /(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})/;

    const shifted = lines.map((line) => {
      const match = timeRegex.exec(line);
      if (match) {
        return `${shiftTimeStr(match[1])} --> ${shiftTimeStr(match[2])}`;
      }
      return line;
    });

    setRawSubtitles(shifted.join('\n'));
  };

  const filteredBlocks = parsedBlocks.filter((b) => b.text.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleDownloadSrt = () => {
    const blob = new Blob([rawSubtitles], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles_processed.srt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadVtt = () => {
    const vttContent = `WEBVTT\n\n` + rawSubtitles.replace(/,/g, '.');
    const blob = new Blob([vttContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles_processed.vtt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTranscript = () => {
    const transcript = parsedBlocks.map((b) => b.text).join(' ');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitle_transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAiTranslate = async () => {
    if (!selectedModel) return;
    setIsTranslating(true);
    setErrorMsg(null);

    const systemPrompt = `You are a Professional Film Subtitle Translator & Localization Specialist.
Target Language: ${targetLang}.
Preserve exact SRT sequence numbers and timing markup (00:00:00,000 --> 00:00:00,000). Translate only the dialogue text line-by-line while preserving natural idiom flow.`;

    try {
      const response = await aiService.generateTextOllama(
        selectedModel,
        `Translate SRT Subtitles to ${targetLang}:\n\n${rawSubtitles}`,
        2048,
        systemPrompt
      );
      setAiOutput(response);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to translate subtitles with Local AI.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 p-2.5 rounded-xl">
              <Subtitles size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI Subtitle Translator & Smart Re-timer</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Edit SRT/VTT subtitle timing offsets (+/- ms), re-sync subtitle drift, search subtitle dialogue lines, export transcripts, and translate with Local AI.
              </p>
            </div>
          </div>
          {models.length > 0 && (
            <div className="flex items-center gap-2 bg-[#111213] p-2 rounded-xl border border-[#2A2D30]">
              <Cpu size={16} className="text-[#3C6B4D]" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-xs text-[#ECEBE9] focus:outline-none cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m} value={m} className="bg-[#18191B] text-[#ECEBE9]">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="glass-card p-4 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#3C6B4D] text-xs px-3 py-2 rounded-xl cursor-pointer font-semibold transition">
            <Upload size={14} />
            Upload SRT / VTT File
            <input type="file" accept=".srt,.vtt,.txt" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="flex items-center gap-1 bg-[#111213] border border-[#2A2D30] px-2 py-1 rounded-xl">
            <Clock size={14} className="text-[#3C6B4D]" />
            <button onClick={() => handleShiftTimestamps(-500)} className="text-xs text-[#ECEBE9] hover:text-[#3C6B4D] px-2 py-1 font-mono">
              -500ms
            </button>
            <button onClick={() => handleShiftTimestamps(500)} className="text-xs text-[#ECEBE9] hover:text-[#3C6B4D] px-2 py-1 font-mono">
              +500ms
            </button>
            <button onClick={() => handleShiftTimestamps(1000)} className="text-xs text-[#ECEBE9] hover:text-[#3C6B4D] px-2 py-1 font-mono">
              +1s
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadSrt}
            className="flex items-center gap-1 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9] text-xs px-3 py-2 rounded-xl font-semibold transition cursor-pointer"
          >
            <Download size={14} />
            Export .SRT
          </button>

          <button
            onClick={handleDownloadVtt}
            className="flex items-center gap-1 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9] text-xs px-3 py-2 rounded-xl font-semibold transition cursor-pointer"
          >
            <Download size={14} />
            Export .VTT
          </button>

          <button
            onClick={handleDownloadTranscript}
            className="flex items-center gap-1 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#3C6B4D] text-xs px-3 py-2 rounded-xl font-semibold transition cursor-pointer"
          >
            <FileText size={14} />
            Transcript .TXT
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subtitle Raw Code Editor */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
          <h4 className="text-sm font-semibold text-[#ECEBE9]">Raw Subtitle Code Editor</h4>
          <textarea
            value={rawSubtitles}
            onChange={(e) => setRawSubtitles(e.target.value)}
            rows={14}
            className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-4 rounded-xl font-mono resize-none focus:outline-none focus:border-[#3C6B4D]"
          />
        </div>

        {/* Subtitle Line Inspector & Search */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#ECEBE9]">Subtitle Line Inspector ({parsedBlocks.length} Blocks)</h4>
            <div className="relative w-40">
              <Search className="absolute left-2.5 top-2 text-[#A3A09B]" size={12} />
              <input
                type="text"
                placeholder="Search text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-[11px] pl-7 pr-2 py-1 rounded-lg"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
            {filteredBlocks.map((b) => (
              <div key={b.id} className="p-3 bg-[#111213] rounded-xl border border-[#2A2D30] flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] text-[#3C6B4D] font-mono font-bold">
                  <span>#{b.id}</span>
                  <span>
                    {b.startTime} &rarr; {b.endTime}
                  </span>
                </div>
                <p className="text-xs text-[#ECEBE9]">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Local AI Subtitle Translation */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI Subtitle Translator & Localizer</h4>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-xl cursor-pointer"
            >
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Japanese">Japanese</option>
              <option value="Mandarin Chinese">Mandarin Chinese</option>
              <option value="Tagalog">Tagalog</option>
            </select>
            <button
              onClick={handleAiTranslate}
              disabled={isTranslating || !selectedModel}
              className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              {isTranslating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
              {isTranslating ? 'Translating...' : 'Translate Subtitles'}
            </button>
          </div>
        </div>

        {errorMsg && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">{errorMsg}</div>}

        {aiOutput && (
          <div
            className="bg-[#111213] p-5 rounded-xl border border-[#2A2D30] text-[#ECEBE9] text-xs leading-relaxed overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(aiOutput) }}
          />
        )}
      </div>
    </div>
  );
};
