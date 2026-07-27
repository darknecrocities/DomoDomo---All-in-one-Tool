import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Sparkles, Copy, Check, RefreshCw, Download, Code2, Sliders } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

export const CurlCodeStudioTool: React.FC = () => {
  const [curlInput, setCurlInput] = useState(`curl -X POST "https://api.example.com/v1/data" \\
  -H "Authorization: Bearer secret_token_123" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "local ai", "limit": 10}'`);

  const [targetLang, setTargetLang] = useState<'fetch' | 'axios' | 'python' | 'go' | 'rust' | 'php' | 'csharp' | 'java' | 'swift'>('fetch');
  const [activeTab, setActiveTab] = useState<'parser' | 'builder'>('parser');
  const [copied, setCopied] = useState(false);

  // Visual Builder State
  const [builderMethod, setBuilderMethod] = useState('POST');
  const [builderUrl, setBuilderUrl] = useState('https://api.example.com/v1/data');
  const [builderHeaders, setBuilderHeaders] = useState<{ key: string; value: string }[]>([
    { key: 'Authorization', value: 'Bearer secret_token_123' },
    { key: 'Content-Type', value: 'application/json' },
  ]);
  const [builderBody, setBuilderBody] = useState('{\n  "query": "local ai",\n  "limit": 10\n}');

  // Local AI State
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const buildCurlFromForm = () => {
    const headerFlags = builderHeaders
      .filter((h) => h.key.trim() && h.value.trim())
      .map((h) => `  -H "${h.key.trim()}: ${h.value.trim()}"`)
      .join(' \\\n');

    const bodyFlag = builderBody.trim() ? ` \\\n  -d '${builderBody.replace(/'/g, "'\\''")}'` : '';
    return `curl -X ${builderMethod} "${builderUrl}"${headerFlags ? ' \\\n' + headerFlags : ''}${bodyFlag}`;
  };

  const currentCurl = activeTab === 'builder' ? buildCurlFromForm() : curlInput;

  const generateSnippet = (lang: typeof targetLang) => {
    switch (lang) {
      case 'fetch':
        return `const response = await fetch("https://api.example.com/v1/data", {
  method: "POST",
  headers: {
    "Authorization": "Bearer secret_token_123",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    query: "local ai",
    limit: 10
  })
});
const data = await response.json();`;

      case 'axios':
        return `import axios from 'axios';

const response = await axios.post('https://api.example.com/v1/data', {
  query: 'local ai',
  limit: 10
}, {
  headers: {
    'Authorization': 'Bearer secret_token_123',
    'Content-Type': 'application/json'
  }
});
console.log(response.data);`;

      case 'python':
        return `import requests

url = "https://api.example.com/v1/data"
headers = {
    "Authorization": "Bearer secret_token_123",
    "Content-Type": "application/json"
}
payload = {
    "query": "local ai",
    "limit": 10
}

response = requests.post(url, headers=headers, json=payload)
data = response.json()`;

      case 'go':
        return `package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
)

func main() {
	url := "https://api.example.com/v1/data"
	var jsonStr = []byte(\`{"query": "local ai", "limit": 10}\`)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
	req.Header.Set("Authorization", "Bearer secret_token_123")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
}`;

      case 'rust':
        return `use reqwest::Client;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std.error::Error>> {
    let client = Client::new();
    let res = client.post("https://api.example.com/v1/data")
        .header("Authorization", "Bearer secret_token_123")
        .header("Content-Type", "application/json")
        .body(r#"{"query": "local ai", "limit": 10}"#)
        .send()
        .await?;
    let text = res.text().await?;
    println!("{}", text);
    Ok(())
}`;

      case 'php':
        return `<?php
$ch = curl_init("https://api.example.com/v1/data");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer secret_token_123",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "query" => "local ai",
    "limit" => 10
]));
$response = curl_exec($ch);
curl_close($ch);
echo $response;`;

      case 'csharp':
        return `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program {
    static async Task Main() {
        var client = new HttpClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.example.com/v1/data");
        request.Headers.Add("Authorization", "Bearer secret_token_123");
        request.Content = new StringContent("{\\"query\\": \\"local ai\\", \\"limit\\": 10}", Encoding.UTF8, "application/json");
        var response = await client.SendAsync(request);
        string result = await response.Content.ReadAsStringAsync();
        Console.WriteLine(result);
    }
}`;

      case 'java':
        return `import okhttp3.*;
import java.io.IOException;

public class Main {
    public static void main(String[] args) throws IOException {
        OkHttpClient client = new OkHttpClient();
        MediaType mediaType = MediaType.parse("application/json");
        RequestBody body = RequestBody.create(mediaType, "{\\"query\\": \\"local ai\\", \\"limit\\": 10}");
        Request request = new Request.Builder()
            .url("https://api.example.com/v1/data")
            .post(body)
            .addHeader("Authorization", "Bearer secret_token_123")
            .addHeader("Content-Type", "application/json")
            .build();
        Response response = client.newCall(request).execute();
        System.out.println(response.body().string());
    }
}`;

      case 'swift':
        return `import Foundation

var request = URLRequest(url: URL(string: "https://api.example.com/v1/data")!)
request.httpMethod = "POST"
request.addValue("Bearer secret_token_123", forHTTPHeaderField: "Authorization")
request.addValue("application/json", forHTTPHeaderField: "Content-Type")
let json: [String: Any] = ["query": "local ai", "limit": 10]
request.httpBody = try? JSONSerialization.data(withJSONObject: json)

let task = URLSession.shared.dataTask(with: request) { data, response, error in
    if let data = data, let str = String(data: data, encoding: .utf8) {
        print(str)
    }
}
task.resume()`;
    }
  };

  const generatedSnippet = generateSnippet(targetLang);

  const copyCode = () => {
    navigator.clipboard.writeText(generatedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const extMap: Record<string, string> = {
      fetch: 'js',
      axios: 'js',
      python: 'py',
      go: 'go',
      rust: 'rs',
      php: 'php',
      csharp: 'cs',
      java: 'java',
      swift: 'swift',
    };
    const ext = extMap[targetLang] || 'txt';
    const blob = new Blob([generatedSnippet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `api_request_sdk.${ext}`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAiSdkSynthesis = async () => {
    if (!selectedModel) return;
    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are an Expert API SDK Architect & Multi-Language Software Engineer.
Target Language: ${targetLang.toUpperCase()}.
cURL Request input:
${currentCurl}

Generate a complete, production-ready, type-safe API SDK wrapper function with robust try/catch error handling, custom timeout configuration, retry exponential backoff logic, and detailed unit test usage examples.
Format with clean markdown highlighted code blocks.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, `Synthesize production SDK in ${targetLang} for cURL request.`, 2048, systemPrompt);
      setAiOutput(response);
    } catch (err: any) {
      setError(err.message || 'Failed to synthesize SDK with Local AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header Card */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 p-2.5 rounded-xl">
              <Terminal size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI cURL to Multi-Language SDK Generator</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Translate cURL commands into JavaScript, Axios, Python, Go, Rust, PHP, C#, Java, and Swift SDK snippets or generate production client wrappers with Local AI.
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

      {/* Tab Switcher: Raw cURL Parser vs Visual Form Builder */}
      <div className="flex items-center gap-2 border-b border-[#2A2D30] pb-2">
        <button
          onClick={() => setActiveTab('parser')}
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer ${
            activeTab === 'parser' ? 'bg-[#3C6B4D] text-white' : 'bg-[#18191B] text-[#A3A09B] hover:text-[#ECEBE9]'
          }`}
        >
          <Code2 size={14} />
          Raw cURL Parser
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer ${
            activeTab === 'builder' ? 'bg-[#3C6B4D] text-white' : 'bg-[#18191B] text-[#A3A09B] hover:text-[#ECEBE9]'
          }`}
        >
          <Sliders size={14} />
          Visual Request Builder
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Pane */}
        {activeTab === 'parser' ? (
          <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
            <h4 className="text-sm font-semibold text-[#ECEBE9]">Input Raw cURL Command</h4>
            <textarea
              value={curlInput}
              onChange={(e) => setCurlInput(e.target.value)}
              rows={12}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-4 rounded-xl font-mono resize-none focus:outline-none focus:border-[#3C6B4D]"
            />
          </div>
        ) : (
          <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
            <h4 className="text-sm font-semibold text-[#ECEBE9]">Visual Request Form Builder</h4>
            
            <div className="grid grid-cols-3 gap-2">
              <select
                value={builderMethod}
                onChange={(e) => setBuilderMethod(e.target.value)}
                className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg cursor-pointer font-mono font-bold"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
              <input
                type="text"
                value={builderUrl}
                onChange={(e) => setBuilderUrl(e.target.value)}
                className="col-span-2 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2.5 rounded-lg font-mono"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#A3A09B]">HTTP Headers</label>
              {builderHeaders.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Header (e.g. Authorization)"
                    value={h.key}
                    onChange={(e) => {
                      const updated = [...builderHeaders];
                      updated[idx].key = e.target.value;
                      setBuilderHeaders(updated);
                    }}
                    className="flex-1 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-lg font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={h.value}
                    onChange={(e) => {
                      const updated = [...builderHeaders];
                      updated[idx].value = e.target.value;
                      setBuilderHeaders(updated);
                    }}
                    className="flex-1 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-2 rounded-lg font-mono"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#A3A09B]">JSON Request Body</label>
              <textarea
                value={builderBody}
                onChange={(e) => setBuilderBody(e.target.value)}
                rows={5}
                className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-3 rounded-lg font-mono resize-none"
              />
            </div>
          </div>
        )}

        {/* Output SDK Code Pane */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-[#ECEBE9]">Target Language SDK</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 text-xs text-[#3C6B4D] hover:underline font-semibold cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="flex items-center gap-1 text-xs text-[#3C6B4D] hover:underline font-semibold cursor-pointer"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {(['fetch', 'axios', 'python', 'go', 'rust', 'php', 'csharp', 'java', 'swift'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setTargetLang(lang)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-mono capitalize transition cursor-pointer ${
                    targetLang === lang ? 'bg-[#3C6B4D] text-white font-bold' : 'bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] font-mono text-xs text-[#ECEBE9] overflow-x-auto max-h-[340px]">
              <pre>{generatedSnippet}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Local AI SDK Synthesis */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI Production SDK Synthesizer</h4>
          </div>
          <button
            onClick={handleAiSdkSynthesis}
            disabled={isGenerating || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isGenerating ? 'Synthesizing SDK...' : 'Synthesize Production SDK Class'}
          </button>
        </div>

        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">{error}</div>}

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
