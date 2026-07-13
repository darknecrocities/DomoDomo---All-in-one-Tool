// Web Worker for offloading HuggingFace Transformers.js models from the main thread.
let transformersModule: any = null;
const pipelines: Record<string, any> = {};

// Get or dynamically import Transformers.js from CDN
async function getTransformers() {
  if (transformersModule) return transformersModule;
  const cdnUrl = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0';
  const module = await import(/* @vite-ignore */ cdnUrl);
  transformersModule = module;
  module.env.allowLocalModels = false;
  return module;
}

self.onmessage = async (e: MessageEvent) => {
  const { type, taskId, payload } = e.data;

  try {
    const { pipeline } = await getTransformers();

    if (type === 'init-pipeline') {
      const { task, model, device } = payload;
      const key = `${task}:${model}`;
      if (!pipelines[key]) {
        pipelines[key] = await pipeline(task, model, {
          device: device || 'wasm',
          progress_callback: (data: any) => {
            (self as any).postMessage({ type: 'progress', taskId, data });
          }
        });
      }
      (self as any).postMessage({ type: 'success', taskId, data: { status: 'ready' } });
    }

    else if (type === 'embedding') {
      const { text, model, device } = payload;
      const key = `feature-extraction:${model}`;
      if (!pipelines[key]) {
        pipelines[key] = await pipeline('feature-extraction', model, {
          device: device || 'wasm'
        });
      }
      const pipe = pipelines[key];
      const result = await pipe(text, { pooling: 'mean', normalize: true });
      const embedding = Array.from(result.data) as number[];
      (self as any).postMessage({ type: 'success', taskId, data: { embedding } });
    }

    else if (type === 'embedding-batch') {
      const { texts, model, device } = payload;
      const key = `feature-extraction:${model}`;
      if (!pipelines[key]) {
        pipelines[key] = await pipeline('feature-extraction', model, {
          device: device || 'wasm'
        });
      }
      const pipe = pipelines[key];
      const embeddings = [];
      for (const text of texts) {
        const result = await pipe(text, { pooling: 'mean', normalize: true });
        embeddings.push(Array.from(result.data) as number[]);
      }
      (self as any).postMessage({ type: 'success', taskId, data: { embeddings } });
    }

    else if (type === 'classification') {
      const { text, model, device } = payload;
      const key = `text-classification:${model}`;
      if (!pipelines[key]) {
        pipelines[key] = await pipeline('text-classification', model, {
          device: device || 'wasm'
        });
      }
      const pipe = pipelines[key];
      const result = await pipe(text);
      (self as any).postMessage({ type: 'success', taskId, data: { result } });
    }

    else if (type === 'transcribe') {
      const { audioData, isTranslation, model, device } = payload;
      const key = `automatic-speech-recognition:${model}`;
      if (!pipelines[key]) {
        pipelines[key] = await pipeline('automatic-speech-recognition', model, {
          device: device || 'wasm',
          progress_callback: (data: any) => {
            (self as any).postMessage({ type: 'progress', taskId, data });
          }
        });
      }
      const pipe = pipelines[key];
      const result = await pipe(audioData, {
        chunk_length_s: 30,
        stride_length_s: 5,
        task: isTranslation ? 'translate' : 'transcribe',
      });
      (self as any).postMessage({ type: 'success', taskId, data: { text: result.text || '' } });
    }

    else if (type === 'tts') {
      const { text, voiceId, model, device } = payload;
      const key = `text-to-speech:${model}`;
      if (!pipelines[key]) {
        pipelines[key] = await pipeline('text-to-speech', model, {
          device: device || 'wasm',
          progress_callback: (data: any) => {
            (self as any).postMessage({ type: 'progress', taskId, data });
          }
        });
      }
      const pipe = pipelines[key];
      const speakerUrl = `https://huggingface.co/datasets/Xenova/cmu-arctic-xvectors-extracted/resolve/main/${voiceId}.bin`;
      const output = await pipe(text, { speaker_embeddings: speakerUrl });
      
      const audioArray = output.audio;
      (self as any).postMessage({
        type: 'success',
        taskId,
        data: {
          audio: audioArray,
          sampling_rate: output.sampling_rate
        }
      }, [audioArray.buffer]);
    }
  } catch (err: any) {
    (self as any).postMessage({ type: 'error', taskId, error: err.message || String(err) });
  }
};
