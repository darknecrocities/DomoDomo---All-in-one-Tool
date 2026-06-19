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
  // 1. Text Generation (LLM) Pipeline - Qwen1.5-0.5B-Chat
  async initLLM(modelName: string = 'Xenova/Qwen1.5-0.5B-Chat', onProgress?: LoadingProgressCallback) {
    if (textGenPipeline) {
      if (onProgress) onProgress('Ready', 100);
      return textGenPipeline;
    }
    
    const { pipeline } = await getTransformers();
    onProgress?.('Loading LLM text generation pipeline...', 10);
    
    textGenPipeline = await pipeline('text-generation', modelName, {
      progress_callback: makeProgressCallback(onProgress)
    });
    
    return textGenPipeline;
  },

  async generateText(prompt: string, maxTokens: number = 100, onProgress?: LoadingProgressCallback): Promise<string> {
    const pipe = await this.initLLM('Xenova/Qwen1.5-0.5B-Chat', onProgress);
    
    const output = await pipe(prompt, {
      max_new_tokens: maxTokens,
      temperature: 0.7,
      do_sample: true,
      top_k: 50,
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
