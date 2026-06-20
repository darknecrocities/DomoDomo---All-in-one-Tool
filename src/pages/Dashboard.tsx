import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Cpu, ShieldAlert, CpuIcon, Check, Copy, Globe, Layers, Code, Shield, Sparkles, Zap, Lock } from 'lucide-react';
import { DynamicIcon } from '../components/DynamicIcon';
import { BRAND_KIT } from '../utils/BrandKit';
import { Logo } from '../components/Logo';
import { aiService } from '../utils/aiService';


interface PlannedTool {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  status: 'functional' | 'planned';
}

const CATEGORIES = [
  { id: 'all', name: 'All Tools' },
  { id: 'photo', name: 'Photo & Image' },
  { id: 'pdf', name: 'PDF Document' },
  { id: 'document', name: 'Text & Doc' },
  { id: 'converter', name: 'File Converter' },
  { id: 'qr', name: 'QR & Barcode' },
  { id: 'video', name: 'Video WASM' },
  { id: 'audio', name: 'Audio Web' },
  { id: 'dev', name: 'Developer Tools' },
  { id: 'ai', name: 'Local AI' },
  { id: 'about', name: 'About DomoDomo' }
];

const ALL_PLANNED_TOOLS: PlannedTool[] = [
  // Photo (10)
  { id: 'background-remover', name: 'Background Remover', category: 'photo', description: 'Erase image backgrounds instantly. Click to key out matching colors, or use manual eraser.', icon: 'Image', status: 'functional' },
  { id: 'image-resizer', name: 'Image Resizer', category: 'photo', description: 'Resize images to precise dimensions using Canvas.', icon: 'Image', status: 'functional' },
  { id: 'image-compressor', name: 'Image Compressor', category: 'photo', description: 'Reduce image file sizes with real-time quality scale.', icon: 'Image', status: 'functional' },
  { id: 'crop-rotate', name: 'Crop & Rotate Tool', category: 'photo', description: 'Crop or rotate photos to standard ratios.', icon: 'Image', status: 'functional' },
  { id: 'ai-enhancer', name: 'AI Image Enhancer', category: 'photo', description: 'Enhance details using local contrast and color filters.', icon: 'Image', status: 'functional' },
  { id: 'watermark-tool', name: 'Watermark Tool', category: 'photo', description: 'Add logo or text watermarks overlay onto photos.', icon: 'Image', status: 'functional' },
  { id: 'image-upscaler', name: 'Image Upscaler', category: 'photo', description: 'Upscale dimensions using canvas bicubic interpolation.', icon: 'Image', status: 'functional' },
  { id: 'palette-extractor', name: 'Color Palette Extractor', category: 'photo', description: 'Extract key color swatches and hex codes.', icon: 'Image', status: 'functional' },
  { id: 'collage-maker', name: 'Collage Maker', category: 'photo', description: 'Combine multiple images in editable canvas grids.', icon: 'Image', status: 'functional' },
  { id: 'format-converter', name: 'Format Converter', category: 'photo', description: 'Convert image files to JPG, PNG, WebP locally.', icon: 'Image', status: 'functional' },

  // PDF (10)
  { id: 'pdf-merge', name: 'Merge PDFs', category: 'pdf', description: 'Combine multiple PDF files into a single document.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-split', name: 'Split PDF', category: 'pdf', description: 'Extract pages from a PDF document into separate files.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-compress', name: 'Compress PDF', category: 'pdf', description: 'Compress PDF size using structural optimization.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-to-img', name: 'PDF → Image', category: 'pdf', description: 'Export PDF page views as high-res PNG images.', icon: 'FileText', status: 'functional' },
  { id: 'img-to-pdf', name: 'Image → PDF', category: 'pdf', description: 'Convert graphics and photos into PDF document pages.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-watermark', name: 'Add Watermark', category: 'pdf', description: 'Overlay transparent text stamps onto PDFs.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-sign', name: 'Sign PDF', category: 'pdf', description: 'Place transparent hand-drawn signatures on files.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-protect', name: 'Protect PDF', category: 'pdf', description: 'Set passwords and encryption constraints on PDFs.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-ocr', name: 'Extract Text (OCR)', category: 'pdf', description: 'Transcribe PDFs using structural parsing.', icon: 'FileText', status: 'functional' },
  { id: 'pdf-viewer', name: 'PDF Viewer', category: 'pdf', description: 'Read and view PDF books locally in frame.', icon: 'FileText', status: 'functional' },

  // Document (10)
  { id: 'rich-text', name: 'Rich Text Editor', category: 'document', description: 'Offline document generator with text formatting.', icon: 'FileText', status: 'functional' },
  { id: 'markdown-editor', name: 'Markdown Editor', category: 'document', description: 'Live preview Markdown syntax writing board.', icon: 'FileText', status: 'functional' },
  { id: 'ocr-scanner', name: 'OCR Scanner', category: 'document', description: 'Extract text from scanned pages using local OCR.', icon: 'FileText', status: 'functional' },
  { id: 'resume-builder', name: 'Resume Builder', category: 'document', description: 'Compile developer resumes to TXT instantly.', icon: 'FileText', status: 'functional' },
  { id: 'invoice-gen', name: 'Invoice Generator', category: 'document', description: 'Formulator for corporate invoice templates.', icon: 'FileText', status: 'functional' },
  { id: 'summarizer', name: 'Summarizer', category: 'document', description: 'Extract key points and summary from local text.', icon: 'FileText', status: 'functional' },
  { id: 'translator', name: 'Translator', category: 'document', description: 'Translate text locally via dictionary mapping.', icon: 'FileText', status: 'functional' },
  { id: 'grammar-fixer', name: 'Grammar Fixer', category: 'document', description: 'Fix syntax and grammatical spelling in browser.', icon: 'FileText', status: 'functional' },
  { id: 'citation-gen', name: 'Citation Generator', category: 'document', description: 'Generate APA formatted academic bibliographies.', icon: 'FileText', status: 'functional' },
  { id: 'code-notes', name: 'Code Notes Editor', category: 'document', description: 'Write down programming logs and code blocks.', icon: 'FileText', status: 'functional' },

  // Converter (10)
  { id: 'jpg-png', name: 'JPG ↔ PNG Converter', category: 'converter', description: 'Convert graphics between JPG and PNG formats.', icon: 'Hammer', status: 'functional' },
  { id: 'webp-jpg', name: 'WebP ↔ JPG Converter', category: 'converter', description: 'Convert WebP images to JPG standard.', icon: 'Hammer', status: 'functional' },
  { id: 'mp4-gif', name: 'MP4 ↔ GIF Converter', category: 'converter', description: 'Animate MP4 frames into GIF files locally.', icon: 'Hammer', status: 'functional' },
  { id: 'mp3-wav', name: 'MP3 ↔ WAV Converter', category: 'converter', description: 'Convert audio between MP3 and WAV streams.', icon: 'Hammer', status: 'functional' },
  { id: 'csv-json', name: 'CSV ↔ JSON Converter', category: 'converter', description: 'Translate spreadsheet CSV into JSON formats.', icon: 'Hammer', status: 'functional' },
  { id: 'xml-json', name: 'XML ↔ JSON Converter', category: 'converter', description: 'Translate XML trees into readable JSON structures.', icon: 'Hammer', status: 'functional' },
  { id: 'docx-txt', name: 'DOCX ↔ TXT Converter', category: 'converter', description: 'Extract plain text from word processing DOCX files.', icon: 'Hammer', status: 'functional' },
  { id: 'epub-pdf', name: 'EPUB → PDF Converter', category: 'converter', description: 'Convert e-books to standard PDF formats.', icon: 'Hammer', status: 'functional' },
  { id: 'base64-tool', name: 'Base64 Converter', category: 'converter', description: 'Convert text strings and assets to base64 arrays.', icon: 'Hammer', status: 'functional' },
  { id: 'zip-extractor', name: 'ZIP Extractor', category: 'converter', description: 'Outline and unpack local zip compression archives.', icon: 'Hammer', status: 'functional' },

  // QR / Barcode (10)
  { id: 'qr-generator', name: 'QR Code Generator', category: 'qr', description: 'Create customized QR codes for links, text, and credentials.', icon: 'QrCode', status: 'functional' },
  { id: 'qr-scanner', name: 'QR Scanner', category: 'qr', description: 'Scan QR codes using local browser webcam feed.', icon: 'QrCode', status: 'functional' },
  { id: 'wifi-qr', name: 'WiFi QR Generator', category: 'qr', description: 'Generate router network scan cards.', icon: 'QrCode', status: 'functional' },
  { id: 'vcard-qr', name: 'vCard QR Generator', category: 'qr', description: 'Encode business contact sheets in QR codes.', icon: 'QrCode', status: 'functional' },
  { id: 'event-qr', name: 'Event QR Generator', category: 'qr', description: 'Share event schedules and calendars in QR codes.', icon: 'QrCode', status: 'functional' },
  { id: 'payment-qr', name: 'Payment QR Generator', category: 'qr', description: 'Create scan-to-pay QR codes for UPI/bank channels.', icon: 'QrCode', status: 'functional' },
  { id: 'barcode-gen', name: 'Barcode Generator', category: 'qr', description: 'Generate Code128 and UPC barcodes.', icon: 'QrCode', status: 'functional' },
  { id: 'barcode-scan', name: 'Barcode Scanner', category: 'qr', description: 'Decode commercial item barcodes.', icon: 'QrCode', status: 'functional' },
  { id: 'bulk-qr', name: 'Bulk QR Generator', category: 'qr', description: 'Generate list of QR codes from CSV rows.', icon: 'QrCode', status: 'functional' },
  { id: 'qr-designer', name: 'QR Designer', category: 'qr', description: 'Customize modules and patterns in QR designs.', icon: 'QrCode', status: 'functional' },

  // Video (10)
  { id: 'trim-video', name: 'Trim Video', category: 'video', description: 'Clip video file frames between start and end slider ranges.', icon: 'Image', status: 'functional' },
  { id: 'compress-video', name: 'Compress Video', category: 'video', description: 'Reduce video track file sizes in the browser.', icon: 'Image', status: 'functional' },
  { id: 'merge-videos', name: 'Merge Videos', category: 'video', description: 'Combine multiple video files together.', icon: 'Image', status: 'functional' },
  { id: 'convert-video', name: 'Convert Video', category: 'video', description: 'Convert video files to WebM or MP4 format.', icon: 'Image', status: 'functional' },
  { id: 'extract-audio', name: 'Extract Audio', category: 'video', description: 'Strip audio tracks from video files.', icon: 'Image', status: 'functional' },
  { id: 'add-subtitles', name: 'Add Subtitles', category: 'video', description: 'Overlay closed caption tracks onto video screens.', icon: 'Image', status: 'functional' },
  { id: 'speed-control', name: 'Speed Control', category: 'video', description: 'Accelerate or slow down video playback rates.', icon: 'Image', status: 'functional' },
  { id: 'crop-video', name: 'Crop Video', category: 'video', description: 'Crop frames to square or wide dimensions.', icon: 'Image', status: 'functional' },
  { id: 'gif-maker', name: 'GIF Maker', category: 'video', description: 'Export video loops into animated GIF files.', icon: 'Image', status: 'functional' },
  { id: 'thumbnail-gen', name: 'Thumbnail Generator', category: 'video', description: 'Capture custom frames from videos as JPEG thumbnails.', icon: 'Image', status: 'functional' },

  // Audio (10)
  { id: 'audio-cutter', name: 'Audio Cutter', category: 'audio', description: 'Trim start and end offsets of audio tracks.', icon: 'FileText', status: 'functional' },
  { id: 'audio-merge', name: 'Audio Merge', category: 'audio', description: 'Concatenate multiple audio tracks.', icon: 'FileText', status: 'functional' },
  { id: 'noise-removal', name: 'Noise Removal', category: 'audio', description: 'Filter background hiss and clicks from audio feeds.', icon: 'FileText', status: 'functional' },
  { id: 'audio-convert', name: 'Convert Audio', category: 'audio', description: 'Convert audio files to MP3 or WAV formats.', icon: 'FileText', status: 'functional' },
  { id: 'voice-recorder', name: 'Voice Recorder', category: 'audio', description: 'Record microphone audio and download audio files.', icon: 'FileText', status: 'functional' },
  { id: 'speech-to-text', name: 'Speech-to-Text', category: 'audio', description: 'Transcribe speech into text using web speech APIs.', icon: 'FileText', status: 'functional' },
  { id: 'tts-fallback', name: 'Text-to-Speech', category: 'audio', description: 'Speak text phrases aloud using local synthesizer.', icon: 'FileText', status: 'functional' },
  { id: 'volume-booster', name: 'Volume Booster', category: 'audio', description: 'Amplify audio loudness levels.', icon: 'FileText', status: 'functional' },
  { id: 'podcast-editor', name: 'Podcast Editor', category: 'audio', description: 'Edit and compile multi-track audio podcasts.', icon: 'FileText', status: 'functional' },
  { id: 'audio-visualizer', name: 'Audio Visualizer', category: 'audio', description: 'Render real-time sound frequency bars.', icon: 'FileText', status: 'functional' },

  // Dev Tools (10)
  { id: 'json-format', name: 'JSON Formatter', category: 'dev', description: 'Beautify and validate JSON strings.', icon: 'Hammer', status: 'functional' },
  { id: 'jwt-decode', name: 'JWT Decoder', category: 'dev', description: 'Decode JWT headers and payloads offline.', icon: 'Hammer', status: 'functional' },
  { id: 'dev-base64', name: 'Base64 Tool', category: 'dev', description: 'Encode or decode base64 strings.', icon: 'Hammer', status: 'functional' },
  { id: 'regex-tester', name: 'Regex Tester', category: 'dev', description: 'Test expression matching patterns.', icon: 'Hammer', status: 'functional' },
  { id: 'uuid-gen', name: 'UUID Generator', category: 'dev', description: 'Generate unique random UUIDv4 keys.', icon: 'Hammer', status: 'functional' },
  { id: 'hash-gen', name: 'Hash Generator', category: 'dev', description: 'Generate SHA-256 hashes of text strings.', icon: 'Hammer', status: 'functional' },
  { id: 'api-tester', name: 'API Tester', category: 'dev', description: 'Send request calls to local endpoints.', icon: 'Hammer', status: 'functional' },
  { id: 'url-encoder', name: 'URL Encoder', category: 'dev', description: 'Encode or decode URL query paths.', icon: 'Hammer', status: 'functional' },
  { id: 'html-minify', name: 'HTML Minifier', category: 'dev', description: 'Minify code lines by stripping tags whitespaces.', icon: 'Hammer', status: 'functional' },
  { id: 'color-converter', name: 'Color Converter', category: 'dev', description: 'Convert color hex values to color spaces.', icon: 'Hammer', status: 'functional' },

  // AI Tools (10)
  { id: 'ai-chat', name: 'AI Chat', category: 'ai', description: 'Chat offline with local Panda assistant.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-summarizer', name: 'Summarizer', category: 'ai', description: 'Summarize text documents using local parsing.', icon: 'Hammer', status: 'functional' },
  { id: 'caption-gen', name: 'Caption Generator', category: 'ai', description: 'Generate descriptive image captions.', icon: 'Hammer', status: 'functional' },
  { id: 'ocr-assistant', name: 'OCR Assistant', category: 'ai', description: 'Format OCR results into clean layouts.', icon: 'Hammer', status: 'functional' },
  { id: 'prompt-enhancer', name: 'Prompt Enhancer', category: 'ai', description: 'Enhance simple descriptions into descriptive prompts.', icon: 'Hammer', status: 'functional' },
  { id: 'image-classifier', name: 'Image Classifier', category: 'ai', description: 'Classify visual items of uploaded images.', icon: 'Hammer', status: 'functional' },
  { id: 'text-rewriter', name: 'Text Rewriter', category: 'ai', description: 'Rewrite text into corporate or casual tones.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-translator', name: 'Translator', category: 'ai', description: 'Translate text arrays locally.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-stt', name: 'Speech-to-Text', category: 'ai', description: 'Transcribe spoken audio inputs locally.', icon: 'Hammer', status: 'functional' },
  { id: 'semantic-search', name: 'Semantic Search', category: 'ai', description: 'Search local indexes using similarity matching.', icon: 'Hammer', status: 'functional' }
];

interface TechItem {
  name: string;
  desc: string;
  color: string;
  icon: string;
}

const TECH_STACK: TechItem[] = [
  { name: 'React', desc: 'Frontend UI', color: '#61DAFB', icon: 'react' },
  { name: 'TypeScript', desc: 'Type Safety', color: '#3178C6', icon: 'typescript' },
  { name: 'Tailwind CSS', desc: 'Styling', color: '#06B6D4', icon: 'tailwind' },
  { name: 'WebAssembly', desc: 'WASM Speed', color: '#654FF0', icon: 'wasm' },
  { name: 'Hugging Face', desc: 'Model Hub', color: '#FFD21E', icon: 'huggingface' },
  { name: 'Llama 3', desc: 'Local Inference', color: '#0064E0', icon: 'llama' },
  { name: 'Vite', desc: 'Bundler', color: '#646CFF', icon: 'vite' },
  { name: 'Transformers.js', desc: 'AI Pipelines', color: '#FF9D00', icon: 'transformers' },
  { name: 'FFmpeg.wasm', desc: 'Video processing', color: '#00E676', icon: 'ffmpeg' },
  { name: 'pdf-lib', desc: 'PDF Mutation', color: '#EC407A', icon: 'pdflib' },
  { name: 'Tesseract.js', desc: 'Local OCR', color: '#5E35B1', icon: 'tesseract' },
  { name: 'Web Audio API', desc: 'Sound Engine', color: '#00B0FF', icon: 'webaudio' },
  { name: 'ONNX Runtime', desc: 'WASM Models', color: '#0078D4', icon: 'onnx' },
  { name: 'WebGPU', desc: 'Hardware Accel', color: '#E65100', icon: 'webgpu' }
];

const renderTechIcon = (icon: string) => {
  switch (icon) {
    case 'react':
      return (
        <svg className="w-6 h-6" viewBox="-11.5 -10.23 23 20.46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="0" r="2.05" fill="#61DAFB"/>
          <g stroke="#61DAFB" strokeWidth="1" fill="none">
            <ellipse rx="11" ry="4.2"/>
            <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
            <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
          </g>
        </svg>
      );
    case 'typescript':
      return (
        <svg className="w-6 h-6 rounded overflow-hidden" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" fill="#3178C6"/>
          <text x="50" y="75" fill="white" fontSize="55" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">TS</text>
        </svg>
      );
    case 'tailwind':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6.018C13.8 3.618 16.5 3 20.1 4.218c3.6 1.218 4.5 3.636 2.7 7.254-1.8 3.618-4.5 4.237-8.1 3.019C11.1 13.273 8.4 12.055 4.8 13.273 1.2 14.49 0 16.91 0 20.528c0-3.618 1.8-6.018 5.4-7.236 3.6-1.218 6.3-.6 9.9.618" fill="#06B6D4"/>
        </svg>
      );
    case 'wasm':
      return (
        <svg className="w-6 h-6 rounded-md overflow-hidden" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" fill="#654FF0"/>
          <text x="50" y="65" fill="white" fontSize="45" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">wa</text>
        </svg>
      );
    case 'huggingface':
      return (
        <span className="text-xl leading-none select-none">🤗</span>
      );
    case 'llama':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#0064E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18V8a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v10" />
          <path d="M9 11H6a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h3" />
          <circle cx="11" cy="7" r="0.75" fill="#0064E0" />
          <circle cx="15" cy="7" r="0.75" fill="#0064E0" />
        </svg>
      );
    case 'vite':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 22h20L12 2z" fill="url(#viteGradient)"/>
          <path d="M11 11l4-9-8 12h5l-1 8 8-11h-8z" fill="#FFD600"/>
          <defs>
            <linearGradient id="viteGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4158D0"/>
              <stop offset="0.5" stopColor="#C850C0"/>
              <stop offset="1" stopColor="#FFCC70"/>
            </linearGradient>
          </defs>
        </svg>
      );
    case 'transformers':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#FF9D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8.01" y2="16" />
          <line x1="16" y1="16" x2="16.01" y2="16" />
        </svg>
      );
    case 'ffmpeg':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="17" x2="22" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
        </svg>
      );
    case 'pdflib':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#EC407A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'tesseract':
      return (
        <span className="text-xl leading-none select-none">👁️</span>
      );
    case 'webaudio':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#00B0FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2v20M17 5v14M22 9v6M7 8v8M2 10v4" />
        </svg>
      );
    case 'onnx':
      return (
        <svg className="w-6 h-6 rounded overflow-hidden" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/255/svg">
          <rect width="100" height="100" fill="#0078D4"/>
          <text x="50" y="65" fill="white" fontSize="30" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">ONNX</text>
        </svg>
      );
    case 'webgpu':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="4" />
          <path d="M6 12h12M12 6v12" />
        </svg>
      );
    default:
      return null;
  }
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [copiedColor, setCopiedColor] = useState('');
  const [hasOllama, setHasOllama] = useState(false);

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const res = await aiService.checkOllama();
        if (active) {
          setHasOllama(res.status && res.models.length > 0);
        }
      } catch {
        if (active) {
          setHasOllama(false);
        }
      }
    };

    check();
    const interval = setInterval(check, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const filteredTools = ALL_PLANNED_TOOLS.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(''), 2000);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#151C2C] to-slate-900 border border-slate-800 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
        <div className="flex flex-col gap-3 max-w-2xl z-10 text-left">
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold w-fit">
              <Globe size={12} />
              <span>Multi-Purpose Open-Source Web Tool Suite</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold w-fit">
              <Code size={12} />
              <span>100% Free & Open Source</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mt-1">
            All-in-One <br />
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-[#4E8E5E] bg-clip-text text-transparent">
              Web Utility Hub.
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            DomoDomo is an open-source hub of high-performance web utilities. Convert files, edit images, split/merge PDFs, and run local AI models directly in your browser. No servers, no signups, no limits.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full md:w-auto z-10">
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center gap-3">
            <Layers size={24} className="text-green-400" />
            <div className="flex flex-col text-left">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Features</span>
              <span className="text-slate-200 font-semibold text-sm">80+ Web Tools</span>
            </div>
          </div>
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center gap-3">
            <Cpu size={24} className="text-indigo-400" />
            <div className="flex flex-col text-left">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Performance</span>
              <span className="text-slate-200 font-semibold text-sm">GPU / WebAPI</span>
            </div>
          </div>
        </div>
        
        {/* Abstract background blobs */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-green-500/5 rounded-full blur-[80px] pointer-events-none" />
      </div>

      {/* Meet Panda: Your Local-First Privacy Companion */}
      <div className="glass-card p-8 border-[#4E8E5E]/20 bg-gradient-to-br from-[#151C2C]/80 via-[#11241B]/40 to-slate-950/60 text-left relative overflow-hidden group shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row gap-8 items-center z-10 relative">
          <div className="flex-shrink-0 p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-inner group-hover:scale-105 transition-transform duration-300">
            <Logo size={100} showText={false} />
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles size={12} />
                Meet Panda
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 text-[11px] font-bold uppercase tracking-wider">
                Zero Cloud Tracking
              </span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Panda: Your Local-First <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 bg-clip-text text-transparent">
                Privacy Guardian & AI Companion
              </span>
            </h2>
            
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Behind DomoDomo is Panda, our friendly offline mascot and locally running AI engine. Panda represents our ironclad commitment to user privacy. By running highly optimized transformer models, WebAssembly algorithms, and speech recognizers completely inside your browser, Panda ensures your credentials, document data, and image files are never sent to external servers or used for data training.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <div className="bg-[#151C2C]/40 border border-slate-850 p-4 rounded-xl">
                <div className="text-emerald-400 font-bold text-sm mb-1">100% Offline AI</div>
                <div className="text-[11px] text-slate-400">Local language translation, semantic searches, and OCR text extraction.</div>
              </div>
              <div className="bg-[#151C2C]/40 border border-slate-850 p-4 rounded-xl">
                <div className="text-emerald-400 font-bold text-sm mb-1">No Cloud Leakage</div>
                <div className="text-[11px] text-slate-400">Zero data collection, logs, trackers, or cookie tracking. What is local stays local.</div>
              </div>
              <div className="bg-[#151C2C]/40 border border-slate-850 p-4 rounded-xl">
                <div className="text-emerald-400 font-bold text-sm mb-1">GPU Accelerated</div>
                <div className="text-[11px] text-slate-400">Leverages native WebGPU/WASM to run tasks at near-native speeds in-browser.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Infographic Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex flex-col justify-between text-left relative overflow-hidden group border-slate-800/80 hover:border-emerald-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform duration-300">
              <Layers size={22} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              Instant
            </span>
          </div>
          <div className="mt-6">
            <span className="text-4xl font-extrabold text-white tracking-tight">80+</span>
            <h3 className="font-bold text-lg text-slate-200 mt-2">Web Utilities</h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              Every tool executes 100% locally on your machine with high-performance logic.
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
        </div>

        <div className="glass-card p-6 flex flex-col justify-between text-left relative overflow-hidden group border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 group-hover:scale-105 transition-transform duration-300">
              <Globe size={22} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
              Diverse
            </span>
          </div>
          <div className="mt-6">
            <span className="text-4xl font-extrabold text-white tracking-tight">10</span>
            <h3 className="font-bold text-lg text-slate-200 mt-2">Categories</h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              Providing specialized modules for PDFs, Video WASM, Audio, Local AI, and Converters.
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
        </div>

        <div className="glass-card p-6 flex flex-col justify-between text-left relative overflow-hidden group border-slate-800/80 hover:border-emerald-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform duration-300">
              <Cpu size={22} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              Engine
            </span>
          </div>
          <div className="mt-6">
            <span className="text-4xl font-extrabold text-white tracking-tight">WASM</span>
            <h3 className="font-bold text-lg text-slate-200 mt-2">Modern Stack</h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              Powered by WebAssembly core scripts and client Canvas/DOM WebAPIs for speed.
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
        </div>

        <div className="glass-card p-6 flex flex-col justify-between text-left relative overflow-hidden group border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 group-hover:scale-105 transition-transform duration-300">
              <Code size={22} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
              License
            </span>
          </div>
          <div className="mt-6">
            <span className="text-4xl font-extrabold text-white tracking-tight">100%</span>
            <h3 className="font-bold text-lg text-slate-200 mt-2">Open Source</h3>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              Free to use, inspect, customize, and self-host under standard permissive licensing.
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
        </div>
      </div>

      {/* Tech Stack Marquee Carousel */}
      <div className="relative w-full overflow-hidden py-6 border-y border-slate-800/40 bg-[#151C2C]/25 backdrop-blur-sm rounded-2xl">
        <div className="text-center mb-4">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">
            Powered by modern browser tech & frameworks
          </span>
        </div>
        
        {/* Shadow mask overlays for fade out edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0B0F19] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0B0F19] to-transparent pointer-events-none z-10" />

        <div className="flex overflow-hidden relative w-full">
          <div className="animate-marquee flex gap-8 items-center py-2">
            {/* First Set of Items */}
            {TECH_STACK.map((tech, idx) => (
              <div key={`tech-1-${idx}`} className="flex items-center gap-3 px-4 py-2 bg-slate-900/60 border border-slate-850 rounded-xl hover:border-slate-700 transition-colors shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-950/60 border border-slate-800" style={{ color: tech.color }}>
                  {renderTechIcon(tech.icon)}
                </div>
                <div className="flex flex-col text-left pr-2">
                  <span className="text-xs font-bold text-slate-200">{tech.name}</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold whitespace-nowrap">{tech.desc}</span>
                </div>
              </div>
            ))}
            {/* Duplicate Set for Infinite Scroll Loop */}
            {TECH_STACK.map((tech, idx) => (
              <div key={`tech-2-${idx}`} className="flex items-center gap-3 px-4 py-2 bg-slate-900/60 border border-slate-850 rounded-xl hover:border-slate-700 transition-colors shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-950/60 border border-slate-800" style={{ color: tech.color }}>
                  {renderTechIcon(tech.icon)}
                </div>
                <div className="flex flex-col text-left pr-2">
                  <span className="text-xs font-bold text-slate-200">{tech.name}</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold whitespace-nowrap">{tech.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Purpose & Core Capabilities Section */}
      <div className="glass-card p-8 border-slate-800/80 bg-gradient-to-br from-[#151C2C]/50 via-[#151C2C]/30 to-slate-950/40 text-left">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold w-fit mb-3">
            <Sparkles size={12} />
            <span>Mission & Core Purpose</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Designed for Developers, Creators, and Power Users
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-2.5 leading-relaxed">
            DomoDomo solves the friction of traditional web utilities. Instead of uploading sensitive documents, private pictures, and huge videos to remote servers, DomoDomo compiles the processing logic directly inside your browser sandbox.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 h-fit shrink-0">
              <Shield size={20} />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-bold text-slate-200 text-base">Uncompromising Security</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Zero data tracking, zero uploads, zero server databases. Your files never leave your computer, preserving absolute confidentiality.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 h-fit shrink-0">
              <Cpu size={20} />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-bold text-slate-200 text-base">Local AI & WebAssembly</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Runs lightweight machine learning models (like ONNX and Transformers.js) and compiled C++ modules directly on your device.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 h-fit shrink-0">
              <Zap size={20} />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-bold text-slate-200 text-base">All-in-One Utility Hub</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                No need to open multiple websites. Edit PDFs, compress videos, build resumes, scan QRs, and format codes inside a single cohesive system.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Local First Advantage & Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-slate-800/80 bg-[#151C2C]/30 text-left">
          <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
            <Shield className="text-[#4E8E5E]" size={20} />
            <span>Why Local-First Processing Wins</span>
          </h3>
          <div className="flex flex-col gap-3 text-xs text-slate-350">
            <div className="flex gap-2">
              <span className="text-[#4E8E5E] font-bold">✓</span>
              <span><strong>Absolute Privacy:</strong> Your sensitive files (passports, signatures, photos) never traverse network servers. Data leaks are physically impossible.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[#4E8E5E] font-bold">✓</span>
              <span><strong>No Size/Bandwidth Costs:</strong> Process gigabytes of PDF merges or video compressions locally without consuming uploading bandwidth.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[#4E8E5E] font-bold">✓</span>
              <span><strong>Offline Resilience:</strong> Runs completely without an internet connection once cached, perfect for remote environments or flights.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[#4E8E5E] font-bold">✓</span>
              <span><strong>Fast Execution:</strong> Avoid cloud queues and server lags by using local hardware-accelerated CPU and WebAssembly.</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-slate-800/80 bg-[#151C2C]/30 text-left">
          <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
            <Cpu className="text-indigo-400" size={20} />
            <span>Under the Hood Architecture</span>
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            DomoDomo integrates native web sandboxes, compiled code engines, and deep neural models compiled for the web. Here is how your browser processes files:
          </p>
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850">
              <div className="font-bold text-slate-200">ONNX Runtime</div>
              <div className="text-slate-500 text-[10px] mt-0.5">Executes local transformer models directly via WASM threads.</div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850">
              <div className="font-bold text-slate-200">FFmpeg WASM</div>
              <div className="text-slate-500 text-[10px] mt-0.5">Hardware video codecs compiled to target browser architectures.</div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850">
              <div className="font-bold text-slate-200">IndexedDB Storage</div>
              <div className="text-slate-500 text-[10px] mt-0.5">Secure sandbox to process files without bloating memory.</div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850">
              <div className="font-bold text-slate-200">Web Speech Engine</div>
              <div className="text-slate-500 text-[10px] mt-0.5">Native operating system speech recognition for live typing.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Categories Scroller */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-none pr-4 shrink-1">
          {CATEGORIES.map((cat) => {
            const isAICat = cat.id === 'ai';
            const isUnavailable = isAICat && (!isLocal || !hasOllama);
            const displayName = isUnavailable ? 'Local AI (Unavailable)' : cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-2 px-4 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border shrink-0 flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-[#4E8E5E] text-white border-[#4E8E5E] shadow-md shadow-green-500/10'
                    : isUnavailable
                      ? 'bg-[#151C2C]/30 border-slate-900/60 text-slate-500 hover:text-slate-400 hover:bg-[#151C2C]/50'
                      : 'bg-[#151C2C]/50 hover:bg-[#151C2C]/80 border-slate-800 text-slate-400 hover:text-slate-250'
                }`}
              >
                {isUnavailable && <Lock size={12} className="text-amber-500 animate-pulse" />}
                <span>{displayName}</span>
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        {activeCategory !== 'about' && (
          <div className="relative shrink-0 w-full md:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search local tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E] transition-colors placeholder:text-slate-500"
            />
          </div>
        )}
      </div>

      {/* Grid of Tools OR About Section */}
      {activeCategory === 'about' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          {/* Brand Philosophy */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass-card p-6 flex flex-col gap-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldAlert size={20} className="text-[#4E8E5E]" />
                <span>The DomoDomo Privacy Mandate</span>
              </h2>
              <p className="text-slate-350 text-sm leading-relaxed">
                {BRAND_KIT.philosophy} Unlike regular web apps that process your PDFs, images, and videos on cloud servers, <strong>DomoDomo compiles everything locally on your CPU/GPU</strong> using standard browser Sandboxing APIs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-[#4E8E5E] font-bold text-xs">WebAssembly</span>
                  <span className="text-[11px] text-slate-400">Enables high-performance low-level modules like pdf-lib.</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-indigo-400 font-bold text-xs">Canvas APIs</span>
                  <span className="text-[11px] text-slate-400">Processes backgrounds, overlays, colors, and visual matrices instantly.</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-[#4E8E5E] font-bold text-xs">IndexedDB</span>
                  <span className="text-[11px] text-slate-400">Caches files locally in secure browser sandboxes.</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col gap-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <CpuIcon size={20} className="text-indigo-400" />
                <span>Modern Typography Guidelines</span>
              </h2>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-850">
                  <span className="text-slate-400">Primary Font</span>
                  <span className="text-slate-200 font-bold">{BRAND_KIT.typography.primary}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Secondary Font</span>
                  <span className="text-slate-200 font-bold">{BRAND_KIT.typography.secondary}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Color swatches */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-6 flex flex-col gap-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <span>Panda Brandkit</span>
              </h2>
              <div className="flex flex-col gap-4">
                {Object.entries(BRAND_KIT.colors).map(([key, col]) => (
                  <div key={key} className="flex items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded border border-slate-700 shadow-inner" style={{ backgroundColor: col.hex }} />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{col.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{col.hex}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyColor(col.hex)}
                      className="p-1.5 bg-slate-950/60 rounded-lg hover:bg-slate-850 transition-colors text-slate-400 hover:text-white"
                      title="Copy Hex"
                    >
                      {copiedColor === col.hex ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : activeCategory === 'ai' && (!isLocal || !hasOllama) ? (
        <div className="glass-card p-8 flex flex-col gap-6 text-left max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-sans tracking-tight">Local AI Offline Setup Required</h2>
                <p className="text-slate-400 text-xs mt-1">To run fully private models client-side, some configuration is required.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
              <span className={`w-2 h-2 rounded-full ${!isLocal ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`}></span>
              <span>{!isLocal ? 'Online Mode (Restricted)' : 'Local Mode (Ollama Offline)'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-250 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center text-xs font-mono">1</span>
                <span>Host DomoDomo Locally</span>
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Due to browser security protocols (CORS & Mixed Content), websites loaded over <code className="text-teal-400 font-mono">https://</code> cannot communicate with your local machine's ports. DomoDomo must be run locally:
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[11px] text-slate-300 relative group">
                <pre className="overflow-x-auto">
{`git clone https://github.com/darknecrocities/DomoDomo.git
cd DomoDomo
npm install
npm run dev`}
                </pre>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-250 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center text-xs font-mono">2</span>
                <span>Install & Start Ollama</span>
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Ollama runs LLMs locally on your own machine. Install Ollama and run a model of your choice:
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[11px] text-slate-300 relative group">
                <pre className="overflow-x-auto">
{`# 1. Install Ollama from ollama.com
# 2. Run your preferred model:
ollama run llama3`}
                </pre>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-800/65 pt-6 mt-2">
            <h3 className="font-bold text-slate-250 text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center text-xs font-mono">3</span>
              <span>Enable Browser CORS Access</span>
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Ollama blocks browser access by default. You must configure the environment variable <code className="text-teal-400 font-mono">OLLAMA_ORIGINS="*"</code> before starting the application:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-xl">
                <span className="text-indigo-400 font-bold text-[11px] uppercase tracking-wider">macOS</span>
                <pre className="text-[10px] text-slate-400 font-mono mt-1 overflow-x-auto whitespace-pre-wrap">
{`launchctl setenv OLLAMA_ORIGINS "*"`}
                </pre>
                <p className="text-[9px] text-slate-500 mt-2">Restart the Ollama application afterward.</p>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-xl">
                <span className="text-indigo-400 font-bold text-[11px] uppercase tracking-wider">Windows</span>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Add <code className="text-teal-400">OLLAMA_ORIGINS</code> with value <code className="text-teal-400">*</code> to System Environment Variables, then restart Ollama from the tray.
                </p>
              </div>
              <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-xl">
                <span className="text-indigo-400 font-bold text-[11px] uppercase tracking-wider">Linux</span>
                <pre className="text-[10px] text-slate-400 font-mono mt-1 overflow-x-auto whitespace-pre-wrap">
{`systemctl edit ollama.service
# Add:
# [Service]
# Environment="OLLAMA_ORIGINS=*"`}
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-[#151C2C]/50 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
            <div className="flex items-center gap-3 self-start sm:self-center">
              <div className="animate-spin text-teal-400">
                <Cpu size={18} />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-250 block">Checking connection status...</span>
                <span className="text-[10px] text-slate-500 block">Pinging http://localhost:11434/api/tags every 5s</span>
              </div>
            </div>
            <button 
              onClick={async () => {
                const res = await aiService.checkOllama();
                setHasOllama(res.status && res.models.length > 0);
              }}
              className="btn-secondary py-1.5 px-4 text-xs font-semibold shrink-0"
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const isReady = tool.status === 'functional';
            return (
              <div
                key={tool.id}
                onClick={() => isReady && navigate(`/tool/${tool.id}`)}
                className={`glass-card p-6 flex flex-col justify-between text-left relative overflow-hidden group ${
                  isReady
                    ? 'cursor-pointer glass-card-hover border-slate-800/80'
                    : 'opacity-50 border-dashed border-slate-850 select-none'
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl border ${
                      isReady 
                        ? 'bg-green-500/15 border-green-500/30 text-green-400 group-hover:scale-105 transition-transform' 
                        : 'bg-slate-900 border-slate-850 text-slate-500'
                    }`}>
                      <DynamicIcon name={tool.icon} size={22} />
                    </div>
                    {isReady ? (
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        Ready
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-slate-800 text-slate-500">
                        Planned
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-lg text-slate-250 group-hover:text-white transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer badges */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800/60">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                    {tool.category} Tool
                  </span>
                  
                  {isReady && (
                    <span className="text-xs font-semibold text-green-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Open</span>
                      <span>→</span>
                    </span>
                  )}
                </div>

                {/* Background gradient highlights for active items */}
                {isReady && (
                  <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors" />
                )}
              </div>
            );
          })}

          {filteredTools.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Cpu size={32} className="opacity-40 animate-pulse" />
              <p className="text-sm">No local tools matched your selection.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
