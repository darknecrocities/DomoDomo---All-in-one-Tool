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
let textGenPipeline: any = null;
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

  // Generate text using local Ollama model
  async generateTextOllama(model: string, prompt: string): Promise<string> {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false
      })
    });
    if (!res.ok) throw new Error('Ollama failed to generate text');
    const data = await res.json();
    return data.response || '';
  },

  // 1. Text Generation (LLM) Pipeline - LaMini-Flan-T5-78M (with Ollama bypass)
  async initLLM(modelName: string = 'Xenova/LaMini-Flan-T5-78M', onProgress?: LoadingProgressCallback) {
    if (textGenPipeline) {
      if (onProgress) onProgress('Ready', 100);
      return textGenPipeline;
    }
    
    const { pipeline } = await getTransformers();
    onProgress?.('Loading LLM text generation pipeline...', 10);
    
    textGenPipeline = await pipeline('text2text-generation', modelName, {
      progress_callback: makeProgressCallback(onProgress)
    });
    
    return textGenPipeline;
  },

  async generateText(prompt: string, maxTokens: number = 120, onProgress?: LoadingProgressCallback, modelOverride?: string): Promise<string> {
    // 1. Attempt to run via Ollama first
    const ollama = await this.checkOllama();
    if (ollama.status && ollama.models.length > 0) {
      const savedModel = this.getSelectedOllamaModel();
      const selectedModel = modelOverride || (savedModel && ollama.models.includes(savedModel) ? savedModel : ollama.models[0]);
      
      onProgress?.(`Generating via local Ollama (${selectedModel})...`, 50);
      try {
        const text = await this.generateTextOllama(selectedModel, prompt);
        onProgress?.('Ready', 100);
        return text;
      } catch (err) {
        console.warn('Ollama generate failed, falling back to browser models:', err);
      }
    }

    // 2. Fallback to in-browser LaMini model
    const pipe = await this.initLLM('Xenova/LaMini-Flan-T5-78M', onProgress);
    
    const output = await pipe(prompt, {
      max_new_tokens: maxTokens,
      temperature: 0.2,
      repetition_penalty: 1.2
    });
    
    if (Array.isArray(output) && output.length > 0) {
      return output[0].generated_text || '';
    }
    return '';
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
