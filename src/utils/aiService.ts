// Shared Offline AI Service Singleton using Transformers.js via CDN

let transformersModule: any = null;

// Progress callback interface
export type LoadingProgressCallback = (status: string, progress: number) => void;

// Get or dynamically import Transformers.js from CDN
export async function getTransformers() {
  if (transformersModule) return transformersModule;
  
  // Use @vite-ignore to prevent build-time bundler resolution errors on HTTPS URL imports
  const cdnUrl = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
  const module = await import(/* @vite-ignore */ cdnUrl);
  transformersModule = module;
  
  // Configure to load models only from HuggingFace CDN, not local server
  module.env.allowLocalModels = false;
  return module;
}

// Singletons for pipelines
let embeddingPipeline: any = null;
let classifierPipeline: any = null;

// Helper to monitor model loading progress
const makeProgressCallback = (callback?: LoadingProgressCallback) => {
  return (data: any) => {
    if (!callback) return;
    if (data.status === 'downloading') {
      const progress = data.progress ? Math.round(data.progress) : 0;
      callback(`Downloading model file: ${data.file || ''}`, progress);
    } else if (data.status === 'done') {
      callback(`Finished loading model file`, 100);
    } else if (data.status === 'init') {
      callback(`Initializing model...`, 0);
    } else if (data.status === 'ready') {
      callback(`Ready`, 100);
    }
  };
};

export const aiService = {
  // Get / Set selected Ollama model from localStorage
  getSelectedOllamaModel(): string | null {
    return localStorage.getItem('domodomo_selected_ollama_model');
  },

  setSelectedOllamaModel(model: string) {
    localStorage.setItem('domodomo_selected_ollama_model', model);
  },

  // Check if Ollama is running and get installed models
  async checkOllama(): Promise<{ status: boolean; models: string[] }> {
    try {
      const res = await fetch('http://localhost:11434/api/tags');
      if (!res.ok) return { status: false, models: [] };
      const data = await res.json();
      const models = (data.models || []).map((m: any) => m.name);
      return { status: true, models };
    } catch (err) {
      return { status: false, models: [] };
    }
  },

  // Pull a model from Ollama library and report progress
  async pullOllamaModel(modelName: string, onProgress: (status: string, progress: number) => void): Promise<void> {
    const res = await fetch('http://localhost:11434/api/pull', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: true })
    });
    if (!res.ok) throw new Error(`Failed to start pulling model: ${res.statusText}`);

    const reader = res.body?.getReader();
    if (!reader) throw new Error('ReadableStream not supported');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.status) {
            let progress = 0;
            if (data.total && data.completed) {
              progress = Math.round((data.completed / data.total) * 100);
            }
            onProgress(data.status, progress);
          }
        } catch (e) {
          console.warn('Error parsing JSON from Ollama pull stream:', e);
        }
      }
    }
  },

  // Get user hardware specifications and recommend a model
  getHardwareRecommendation(): { ram: string; cores: number; hasWebGPU: boolean; tier: 'low' | 'medium' | 'high'; recommendedModel: string; explanation: string } {
    const ram = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'Unknown (estimated 8GB)';
    const ramValue = (navigator as any).deviceMemory || 8;
    const cores = navigator.hardwareConcurrency || 4;
    const hasWebGPU = !!(navigator as any).gpu;

    let tier: 'low' | 'medium' | 'high' = 'medium';
    let recommendedModel = 'llama3.2:1b';
    let explanation = 'Balanced model offering good performance with low resource usage.';

    if (ramValue < 8 || cores < 6) {
      tier = 'low';
      recommendedModel = 'qwen2.5:0.5b'; // very tiny download, fast response
      explanation = 'Recommended for lighter hardware setups to ensure fast response times and low memory footprint.';
    } else if (ramValue >= 16) {
      tier = 'high';
      recommendedModel = 'llama3:8b';
      explanation = 'High performance model offering advanced accuracy and contextual understanding on your machine.';
    } else {
      tier = 'medium';
      recommendedModel = 'llama3.2:1b';
      explanation = 'Balanced model offering good performance with low resource usage.';
    }

    return { ram, cores, hasWebGPU, tier, recommendedModel, explanation };
  },

  // Generate text using local Ollama model
  async generateTextOllama(
    model: string,
    prompt: string,
    numPredict: number = 120,
    systemPrompt?: string,
    options?: { temperature?: number; topK?: number; topP?: number }
  ): Promise<string> {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        system: systemPrompt,
        stream: false,
        options: {
          num_predict: numPredict,
          temperature: options?.temperature,
          top_k: options?.topK,
          top_p: options?.topP
        }
      })
    });
    if (!res.ok) throw new Error('Ollama failed to generate text');
    const data = await res.json();
    return data.response || '';
  },

  async generateText(
    prompt: string,
    maxTokens: number = 120,
    onProgress?: LoadingProgressCallback,
    modelOverride?: string,
    options?: {
      systemPrompt?: string;
      temperature?: number;
      topK?: number;
      topP?: number;
    }
  ): Promise<string> {
    // 1. Attempt to run via Ollama
    const ollama = await this.checkOllama();
    if (ollama.status && ollama.models.length > 0) {
      const savedModel = this.getSelectedOllamaModel();
      const selectedModel = modelOverride || (savedModel && ollama.models.includes(savedModel) ? savedModel : ollama.models[0]);
      
      onProgress?.(`Generating via local Ollama (${selectedModel})...`, 50);
      try {
        const text = await this.generateTextOllama(selectedModel, prompt, maxTokens, options?.systemPrompt, options);
        onProgress?.('Ready', 100);
        return text;
      } catch (err: any) {
        throw new Error(`Ollama text generation failed: ${err.message || err}`);
      }
    }

    throw new Error('Local Ollama is not active or has no models installed. Please configure Ollama via the dashboard.');
  },

  // 2. Feature Extraction (Embedding) Pipeline - MiniLM
  async initEmbedder(onProgress?: LoadingProgressCallback) {
    if (embeddingPipeline) {
      if (onProgress) onProgress('Ready', 100);
      return embeddingPipeline;
    }

    const { pipeline } = await getTransformers();
    onProgress?.('Loading embedding pipeline...', 10);

    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      progress_callback: makeProgressCallback(onProgress)
    });

    return embeddingPipeline;
  },

  async getEmbedding(text: string): Promise<number[]> {
    const pipe = await this.initEmbedder();
    const result = await pipe(text, { pooling: 'mean', normalize: true });
    return Array.from(result.data);
  },

  // 3. Classification Pipeline - DistilBERT Sentiment
  async initClassifier(onProgress?: LoadingProgressCallback) {
    if (classifierPipeline) {
      if (onProgress) onProgress('Ready', 100);
      return classifierPipeline;
    }

    const { pipeline } = await getTransformers();
    onProgress?.('Loading classifier pipeline...', 10);

    classifierPipeline = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
      progress_callback: makeProgressCallback(onProgress)
    });

    return classifierPipeline;
  },

  async classify(text: string): Promise<{ label: string; score: number }[]> {
    const pipe = await this.initClassifier();
    const result = await pipe(text);
    return result;
  }
};
