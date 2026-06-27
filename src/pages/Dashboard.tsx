import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Cpu, ShieldAlert, Globe, Code, ChevronDown, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { DynamicIcon } from '../components/DynamicIcon';
import { aiService } from '../utils/aiService';


interface PlannedTool {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  status: 'functional' | 'planned';
  requiresOllama?: boolean;
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
  { id: 'security', name: 'Developer Security' }
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
  { id: 'template-studio', name: 'Template Studio', category: 'photo', description: 'Create and fill reusable branded image templates with text.', icon: 'LayoutTemplate', status: 'functional' },

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
  { id: 'pdf-text-edit', name: 'Edit PDF Text', category: 'pdf', description: 'Select, modify, search/replace, and add text on PDF pages offline.', icon: 'FileText', status: 'functional' },

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
  { id: 'face-blur', name: 'Face Blur', category: 'video', description: 'Locally detect and blur human face coordinates in video frames.', icon: 'Shield', status: 'functional' },

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

  // Dev Tools (20)
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
  { id: 'cron-parser', name: 'Cron Expression Parser', category: 'dev', description: 'Parse cron schedules or generate expressions interactively.', icon: 'Hammer', status: 'functional' },
  { id: 'sql-formatter', name: 'SQL Formatter', category: 'dev', description: 'Format and beautify SQL queries with custom spacing.', icon: 'Hammer', status: 'functional' },
  { id: 'yaml-json', name: 'YAML ↔ JSON Converter', category: 'dev', description: 'Convert configuration structures between YAML and JSON.', icon: 'Hammer', status: 'functional' },
  { id: 'md-table-gen', name: 'Markdown Table Generator', category: 'dev', description: 'Interactive layout to design and generate Markdown tables.', icon: 'Hammer', status: 'functional' },
  { id: 'diff-checker', name: 'Diff Checker', category: 'dev', description: 'Compare two text layers side-by-side to highlight differences.', icon: 'Hammer', status: 'functional' },
  { id: 'keycode-finder', name: 'Keyboard Keycode Finder', category: 'dev', description: 'Detect keyboard keys and view standard browser event values.', icon: 'Hammer', status: 'functional' },
  { id: 'box-shadow-gen', name: 'Box Shadow Generator', category: 'dev', description: 'Visual parameters slider to configure CSS box shadow styles.', icon: 'Hammer', status: 'functional' },
  { id: 'base-converter', name: 'Base Converter', category: 'dev', description: 'Convert integers between decimal, binary, octal, and hex bases.', icon: 'Hammer', status: 'functional' },
  { id: 'glassmorphism-gen', name: 'Glassmorphism Generator', category: 'dev', description: 'Visual backdrop-filter designer generating modern glass assets.', icon: 'Hammer', status: 'functional' },
  { id: 'screen-info', name: 'Screen & Device Info', category: 'dev', description: 'Inspect hardware specs, viewport sizes, and client details.', icon: 'Hammer', status: 'functional' },

  // AI Tools (20)
  { id: 'ai-chat', name: 'AI Chat', category: 'ai', description: 'Chat offline with local Domo assistant.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-summarizer', name: 'Summarizer', category: 'ai', description: 'Summarize text documents using local parsing.', icon: 'Hammer', status: 'functional' },
  { id: 'caption-gen', name: 'Caption Generator', category: 'ai', description: 'Generate descriptive image captions.', icon: 'Hammer', status: 'functional' },
  { id: 'ocr-assistant', name: 'OCR Assistant', category: 'ai', description: 'Format OCR results into clean layouts.', icon: 'Hammer', status: 'functional' },
  { id: 'prompt-enhancer', name: 'Prompt Enhancer', category: 'ai', description: 'Enhance simple descriptions into descriptive prompts.', icon: 'Hammer', status: 'functional' },
  { id: 'image-classifier', name: 'Image Classifier', category: 'ai', description: 'Classify visual items of uploaded images.', icon: 'Hammer', status: 'functional' },
  { id: 'text-rewriter', name: 'Text Rewriter', category: 'ai', description: 'Rewrite text into corporate or casual tones.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-translator', name: 'Translator', category: 'ai', description: 'Translate text arrays locally.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-stt', name: 'Speech-to-Text', category: 'ai', description: 'Transcribe spoken audio inputs locally.', icon: 'Hammer', status: 'functional' },
  { id: 'semantic-search', name: 'Semantic Search', category: 'ai', description: 'Search local indexes using similarity matching.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-code-explainer', name: 'AI Code Explainer', category: 'ai', description: 'Paste code to get plain-English explanations, complexity score, and translation.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-flashcard-maker', name: 'AI Flashcard Maker', category: 'ai', description: 'Turn any text/topic into Q&A flashcards for studying.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-sentiment-journal', name: 'AI Sentiment Journal', category: 'ai', description: 'Write journal entries and have AI track mood and emotion trends.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-email-composer', name: 'AI Email Composer', category: 'ai', description: 'Generate professional emails from bullet points or intent.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-story-generator', name: 'AI Story Generator', category: 'ai', description: 'Generate short stories from genre/character/setting prompts.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-debate-assistant', name: 'AI Debate Assistant', category: 'ai', description: 'Given a topic, generate pro/con arguments and rebuttals.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-math-solver', name: 'AI Math Solver', category: 'ai', description: 'Paste math problems and get step-by-step solutions.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-recipe-generator', name: 'AI Recipe Generator', category: 'ai', description: 'Ingredients in → full recipe with steps, nutrition, and variants.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-code-reviewer', name: 'AI Code Reviewer', category: 'ai', description: 'Review code for bugs, security issues, and best practices.', icon: 'Hammer', status: 'functional' },
  { id: 'ai-mind-mapper', name: 'AI Mind Mapper', category: 'ai', description: 'Turn a topic into a visual text-based mind map outline.', icon: 'Hammer', status: 'functional' },
  { id: 'domo-agent-hub', name: 'Domo Agent Hub', category: 'ai', description: 'Interactive offline coding IDE & AI agent workspace.', icon: 'Hammer', status: 'functional' },
  { id: 'domo-selection', name: 'DomoDomo Selection Explainer', category: 'ai', description: 'Highlight text or code to query DomoDomo offline.', icon: 'Hammer', status: 'functional' },
  { id: 'ollama-library', name: 'Domo Model Library', category: 'ai', description: 'Browse, compare, and install local AI models (Llama 3.2, Qwen 2.5, Gemma 2, Llava) with system recommendations and live download indicators.', icon: 'Hammer', status: 'functional' },
  { id: 'domo-skill-creator', name: 'Domo Skill Creator', category: 'ai', description: 'Design structured capabilities, restrictions, and behaviors to import into your local AI agents visually.', icon: 'Hammer', status: 'functional' },
  { id: 'auto-pilot', name: 'Auto-Pilot Workspace', category: 'ai', description: 'Fully autonomous AI agent that executes workflows via voice.', icon: 'Cpu', status: 'functional', requiresOllama: true },
  { id: 'model-migrator', name: 'Ollama Model Migrator', category: 'ai', description: 'Back up your local Ollama models, write them to external USB or HDD directories, and restore them offline.', icon: 'HardDrive', status: 'functional', requiresOllama: true },
  
  // Security Tools (10 Standard)
  { id: 'hash-checker', name: 'File Hash Checker', category: 'security', description: 'Verify file integrity using SHA-256, SHA-512, MD5 locally.', icon: 'ShieldAlert', status: 'functional' },
  { id: 'password-analyzer', name: 'Password Analyzer', category: 'security', description: 'Analyze password strength, entropy, and dictionary matches offline.', icon: 'Lock', status: 'functional' },
  { id: 'metadata-cleaner', name: 'Metadata Cleaner', category: 'security', description: 'Strip hidden EXIF data and metadata from images and PDFs.', icon: 'ShieldAlert', status: 'functional' },
  { id: 'exif-viewer', name: 'EXIF Viewer', category: 'security', description: 'Inspect GPS, device, and camera metadata in images for privacy auditing.', icon: 'Search', status: 'functional' },
  { id: 'file-encryption', name: 'File Encryption Tool', category: 'security', description: 'Encrypt files locally using AES-256 password protection.', icon: 'Lock', status: 'functional' },
  { id: 'file-shredder', name: 'Secure File Shredder', category: 'security', description: 'Overwrite files multiple times before deletion to prevent recovery.', icon: 'ShieldAlert', status: 'functional' },
  { id: 'qr-security', name: 'QR Security Scanner', category: 'security', description: 'Analyze QR codes for hidden URLs and suspicious redirect chains.', icon: 'QrCode', status: 'functional' },
  { id: 'url-analyzer', name: 'URL Safety Analyzer', category: 'security', description: 'Detect typosquatting, suspicious characters, and homograph attacks.', icon: 'Search', status: 'functional' },
  { id: 'network-scanner', name: 'Local Network Scanner', category: 'security', description: 'Discover connected devices, IP/MAC addresses, and open ports.', icon: 'Globe', status: 'functional' },
  { id: 'phishing-detector', name: 'Phishing Detector', category: 'security', description: 'Scan emails and URLs using heuristic rule engines for risk scores.', icon: 'ShieldAlert', status: 'functional' },

  // DomoGuard AI Security (10)
  { id: 'ai-malware-analyzer', name: 'DomoGuard Malware Analyzer', category: 'security', description: 'AI explains suspicious files, scripts, and source code behavior.', icon: 'ShieldAlert', status: 'functional', requiresOllama: true },
  { id: 'ai-phishing-analyzer', name: 'DomoGuard Phishing Analyzer', category: 'security', description: 'AI detects social engineering, urgency manipulation, and credential theft.', icon: 'ShieldAlert', status: 'functional', requiresOllama: true },
  { id: 'ai-code-auditor', name: 'DomoGuard Code Auditor', category: 'security', description: 'AI finds hardcoded secrets, SQLi, and XSS in developer projects.', icon: 'Code', status: 'functional', requiresOllama: true },
  { id: 'ai-log-analyzer', name: 'DomoGuard Log Analyzer', category: 'security', description: 'AI reviews server logs to explain brute force attempts and compromises.', icon: 'Search', status: 'functional', requiresOllama: true },
  { id: 'ai-threat-intel', name: 'DomoGuard Threat Intel', category: 'security', description: 'Offline AI assistant with RAG database for CVEs and ransomware behavior.', icon: 'Cpu', status: 'functional', requiresOllama: true },
  { id: 'ai-url-investigation', name: 'DomoGuard URL Investigation', category: 'security', description: 'AI checks URL structure for brand impersonation and encoded payloads.', icon: 'Globe', status: 'functional', requiresOllama: true },
  { id: 'ai-file-reputation', name: 'DomoGuard File Reputation', category: 'security', description: 'AI summarizes findings from extracted strings and metadata in executables.', icon: 'ShieldAlert', status: 'functional', requiresOllama: true },
  { id: 'ai-reverse-engineering', name: 'DomoGuard Reverse Engineering', category: 'security', description: 'AI explains decompiled functions and assembly for cybersecurity students.', icon: 'Code', status: 'functional', requiresOllama: true },
  { id: 'ai-deepfake-detection', name: 'DomoGuard Deepfake Detection', category: 'security', description: 'Local image analysis to detect AI-generated artifacts and inconsistencies.', icon: 'Image', status: 'functional', requiresOllama: true },
  { id: 'ai-incident-report', name: 'DomoGuard Incident Report', category: 'security', description: 'AI generates SOC executive summaries and IOCs from logs and findings.', icon: 'FileText', status: 'functional', requiresOllama: true }
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(12);
  const [hasOllama, setHasOllama] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [selectedOllamaModel, setSelectedOllamaModel] = useState('');
  const [downloadingModel, setDownloadingModel] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState('');
  const [showManageModels, setShowManageModels] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const detectHardware = () => {
    const cores = navigator.hardwareConcurrency || 4;
    let ram = 'Unknown';
    if ('deviceMemory' in navigator) {
      ram = `${(navigator as any).deviceMemory} GB`;
    }
    
    let hasWebGPU = false;
    if ('gpu' in navigator) {
      hasWebGPU = true;
    }

    let recommendedModel = 'qwen2.5:0.5b';
    let explanation = 'Qwen 0.5B runs smoothly on virtually all computers offline.';

    if (cores >= 8 && hasWebGPU) {
      recommendedModel = 'llama3.2:1b';
      explanation = 'Llama 1B runs efficiently with high accuracy using your GPU resources.';
    } else if (cores >= 12) {
      recommendedModel = 'gemma2:2b';
      explanation = 'Gemma 2B offers strong logic and executes perfectly on high-thread CPUs.';
    }

    return { cores, ram, hasWebGPU, recommendedModel, explanation };
  };

  const hardware = detectHardware();
  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setVisibleCount(12);
  };
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const checkStatus = async () => {
      const res = await aiService.checkOllama();
      setHasOllama(res.status);
      if (res.status) {
        setOllamaModels(res.models);
        if (res.models.length > 0 && !selectedOllamaModel) {
          const defaultModel = res.models.includes(hardware.recommendedModel)
            ? hardware.recommendedModel
            : res.models[0];
          setSelectedOllamaModel(defaultModel);
          aiService.setSelectedOllamaModel(defaultModel);
        }
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [selectedOllamaModel, hardware.recommendedModel]);

  const handlePullModel = async (modelName: string) => {
    setDownloadingModel(modelName);
    setDownloadStatus('Starting download...');
    setDownloadProgress(0);
    setDownloadError('');
    try {
      await aiService.pullOllamaModel(modelName, (status, progress) => {
        setDownloadStatus(status);
        setDownloadProgress(progress);
      });
      const res = await aiService.checkOllama();
      if (res.status) {
        setOllamaModels(res.models);
        const chosen = res.models.includes(modelName) ? modelName : res.models[0];
        setSelectedOllamaModel(chosen);
        aiService.setSelectedOllamaModel(chosen);
      } else {
        setSelectedOllamaModel('');
      }
      setDownloadStatus('Finished downloading successfully!');
      setTimeout(() => {
        setDownloadStatus('');
        setDownloadProgress(0);
      }, 3000);
    } catch (err: any) {
      setDownloadError(err.message || 'Download failed. Ensure OLLAMA_ORIGINS="*" is set and Ollama is running.');
    } finally {
      setDownloadingModel('');
    }
  };

  const filteredTools = ALL_PLANNED_TOOLS.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());
    if (activeCategory === 'all' && tool.category === 'ai') {
      return false;
    }
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    
    // No longer hiding DomoGuard AI tools here. We want to show them as "Tease" cards if Ollama isn't active.
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Welcome banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl bg-[#18191B] border border-[#2A2D30] p-8 md:p-12 relative overflow-hidden">
        {/* Subtle grid backdrop decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2d30_1px,transparent_1px),linear-gradient(to_bottom,#2a2d30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.15] pointer-events-none" />

        <div className="lg:col-span-7 flex flex-col gap-4 text-left z-10">
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 text-xs font-semibold w-fit">
              <Globe size={12} />
              <span>Sandbox Offline Web Utilities</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1E2022] text-[#A3A09B] border border-[#2A2D30] text-xs font-semibold w-fit">
              <Code size={12} />
              <span>100% Free & Open Source</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#ECEBE9] tracking-tight leading-tight mt-1 font-heading">
            Your Local-First <br />
            <span className="text-[#3C6B4D]">
              Productivity Workshop.
            </span>
          </h1>
          <p className="text-[#A3A09B] text-sm md:text-base leading-relaxed max-w-xl">
            DomoDomo is an open-source productivity workshop running entirely in your browser sandbox. Edit files, compress media, compile PDF modifications, and run local AI models. Your files never touch the cloud.
          </p>
        </div>

        {/* Right side mock status console */}
        <div className="lg:col-span-5 w-full z-10">
          <div className="bg-[#111213] border border-[#2A2D30] rounded-2xl overflow-hidden shadow-xl shadow-black/30">
            {/* Header console bar */}
            <div className="bg-[#18191B] border-b border-[#2A2D30] px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[10px] font-mono text-[#72706C] font-semibold">domodomo-terminal v1.0.0</span>
              <div className="w-12" /> {/* spacer */}
            </div>
            
            {/* Console specs grid */}
            <div className="p-4 grid grid-cols-2 gap-3 text-left font-mono text-[10px] text-[#A3A09B]">
              <div className="bg-[#18191B]/40 p-2.5 rounded-lg border border-[#2A2D30]/60 flex flex-col gap-0.5">
                <span className="text-[#72706C] font-semibold">sandbox_host</span>
                <span className="text-[#ECEBE9] font-bold">localhost</span>
              </div>
              <div className="bg-[#18191B]/40 p-2.5 rounded-lg border border-[#2A2D30]/60 flex flex-col gap-0.5">
                <span className="text-[#72706C] font-semibold">data_security</span>
                <span className="text-[#3C6B4D] font-bold">100% client_side</span>
              </div>
              <div className="bg-[#18191B]/40 p-2.5 rounded-lg border border-[#2A2D30]/60 flex flex-col gap-0.5">
                <span className="text-[#72706C] font-semibold">system_threads</span>
                <span className="text-[#ECEBE9] font-bold">{navigator.hardwareConcurrency || 4} available</span>
              </div>
              <div className="bg-[#18191B]/40 p-2.5 rounded-lg border border-[#2A2D30]/60 flex flex-col gap-0.5">
                <span className="text-[#72706C] font-semibold">wasm_runtime</span>
                <span className="text-[#ECEBE9] font-bold">isolated_active</span>
              </div>
              <div className="col-span-2 bg-[#18191B]/40 p-2.5 rounded-lg border border-[#2A2D30]/60 flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#72706C] font-semibold">cloud_telemetry</span>
                  <span className="text-[#ECEBE9] font-bold">disabled_no_servers</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-[#3C6B4D]/15 text-[#3C6B4D] border border-[#3C6B4D]/35 font-bold uppercase tracking-wider text-[8px]">
                  Secure
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Command Bar Panel */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-[#18191B] border border-[#2A2D30] p-3 rounded-2xl">
        {/* Categories Tabs */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 relative overflow-hidden">
          <button
            onClick={() => {
              if (categoryScrollRef.current) {
                categoryScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
              }
            }}
            className="p-1.5 bg-[#111213] hover:bg-[#1E2022] border border-[#2A2D30] rounded-xl text-[#72706C] hover:text-[#ECEBE9] transition-colors shrink-0 shadow-md"
            title="Scroll Left"
          >
            <ChevronLeft size={14} />
          </button>

          <div 
            ref={categoryScrollRef}
            className="flex-1 flex gap-1 overflow-x-auto pb-2 -mb-2 md:pb-0 md:mb-0 scrollbar-none scroll-smooth pr-1"
          >
            {CATEGORIES.map((cat) => {
              const isAICat = cat.id === 'ai';
              const isUnavailable = isAICat && (!isLocal || !hasOllama);
              const displayName = isUnavailable ? 'Local AI (Unavailable)' : cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`py-2 px-4 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border shrink-0 flex items-center gap-1.5 ${
                    activeCategory === cat.id
                      ? 'bg-[#3C6B4D] text-[#ECEBE9] border-[#3C6B4D] shadow-sm'
                      : isUnavailable
                        ? 'bg-[#18191B]/40 border-[#2A2D30] text-[#72706C]'
                        : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#111213]'
                  }`}
                >
                  {isUnavailable && <Lock size={12} className="text-[#E29E2D] animate-pulse" />}
                  <span>{displayName}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              if (categoryScrollRef.current) {
                categoryScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
              }
            }}
            className="p-1.5 bg-[#111213] hover:bg-[#1E2022] border border-[#2A2D30] rounded-xl text-[#72706C] hover:text-[#ECEBE9] transition-colors shrink-0 shadow-md"
            title="Scroll Right"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Search Field with keybind hint */}
        <div className="relative shrink-0 w-full md:w-80 group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#72706C] group-focus-within:text-[#3C6B4D] transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search local tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl pl-9 pr-14 py-2 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] transition-all placeholder:text-[#72706C]"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-[#18191B] border border-[#2A2D30] text-[#72706C] rounded shadow-sm">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-[#18191B] border border-[#2A2D30] text-[#72706C] rounded shadow-sm">K</kbd>
          </div>
        </div>
      </div>

      {activeCategory === 'ai' && (!isLocal || !hasOllama) ? (
        <div className="glass-card p-8 flex flex-col gap-6 text-left max-w-4xl mx-auto border-[#2A2D30] bg-[#18191B]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#2A2D30] pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#E29E2D]/10 border border-[#E29E2D]/20 text-[#E29E2D] rounded-xl">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#ECEBE9] tracking-tight">Local AI Offline Setup Required</h2>
                <p className="text-[#A3A09B] text-xs mt-1">To run fully private models client-side, some configuration is required.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111213] border border-[#2A2D30] text-[11px] text-[#A3A09B] font-mono">
              <span className={`w-2 h-2 rounded-full ${!isLocal ? 'bg-rose-500' : 'bg-[#E29E2D] animate-pulse'}`}></span>
              <span>{!isLocal ? 'Online Mode (Restricted)' : 'Local Mode (Ollama Offline)'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-[#ECEBE9] text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center text-xs font-mono">1</span>
                <span>Host DomoDomo Locally</span>
              </h3>
              <p className="text-[#A3A09B] text-xs leading-relaxed">
                Due to browser security protocols (CORS & Mixed Content), websites loaded over <code className="text-[#3C6B4D] font-mono">https://</code> cannot communicate with your local machine's ports. DomoDomo must be run locally:
              </p>
              <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] font-mono text-[11px] text-[#ECEBE9] relative group">
                <pre className="overflow-x-auto">
{`git clone https://github.com/darknecrocities/DomoDomo---All-in-one-Tool.git
cd DomoDomo---All-in-one-Tool
npm install
npm run dev`}
                </pre>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-[#ECEBE9] text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center text-xs font-mono">2</span>
                <span>Install & Start Ollama</span>
              </h3>
              <p className="text-[#A3A09B] text-xs leading-relaxed">
                Ollama runs LLMs locally on your own machine. Install Ollama and run a model of your choice:
              </p>
              <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] font-mono text-[11px] text-[#ECEBE9] relative group">
                <pre className="overflow-x-auto">
{`# 1. Install Ollama from ollama.com
# 2. Run your preferred model:
ollama run llama3`}
                </pre>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-[#2A2D30] pt-6 mt-2">
            <h3 className="font-bold text-[#ECEBE9] text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center text-xs font-mono">3</span>
              <span>Enable Browser CORS Access</span>
            </h3>
            <p className="text-[#A3A09B] text-xs leading-relaxed">
              Ollama blocks browser access by default. You must configure the environment variable <code className="text-[#3C6B4D] font-mono">OLLAMA_ORIGINS="*"</code> before starting the application:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#111213] border border-[#2A2D30] p-3.5 rounded-xl">
                <span className="text-[#E29E2D] font-bold text-[11px] uppercase tracking-wider">macOS</span>
                <pre className="text-[10px] text-[#A3A09B] font-mono mt-1 overflow-x-auto whitespace-pre-wrap">
{`launchctl setenv OLLAMA_ORIGINS "*"`}
                </pre>
                <p className="text-[9px] text-[#72706C] mt-2">Restart the Ollama application afterward.</p>
              </div>
              <div className="bg-[#111213] border border-[#2A2D30] p-3.5 rounded-xl">
                <span className="text-[#E29E2D] font-bold text-[11px] uppercase tracking-wider">Windows</span>
                <p className="text-[10px] text-[#A3A09B] mt-1 leading-relaxed">
                  Add <code className="text-[#3C6B4D]">OLLAMA_ORIGINS</code> with value <code className="text-[#3C6B4D]">*</code> to System Environment Variables, then restart Ollama from the tray.
                </p>
              </div>
              <div className="bg-[#111213] border border-[#2A2D30] p-3.5 rounded-xl">
                <span className="text-[#E29E2D] font-bold text-[11px] uppercase tracking-wider">Linux</span>
                <pre className="text-[10px] text-[#A3A09B] font-mono mt-1 overflow-x-auto whitespace-pre-wrap">
{`systemctl edit ollama.service
# Add:
# [Service]
# Environment="OLLAMA_ORIGINS=*"`}
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
            <div className="flex items-center gap-3 self-start sm:self-center">
              <div className="animate-spin text-[#3C6B4D]">
                <Cpu size={18} />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-[#ECEBE9] block">Checking connection status...</span>
                <span className="text-[10px] text-[#72706C] block">Pinging http://localhost:11434/api/tags every 5s</span>
              </div>
            </div>
            <button 
              onClick={async () => {
                const res = await aiService.checkOllama();
                setHasOllama(res.status);
              }}
              className="btn-secondary py-1.5 px-4 text-xs font-semibold shrink-0"
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : activeCategory === 'ai' && ollamaModels.length === 0 ? (
        <div className="glass-card p-8 flex flex-col gap-6 text-left max-w-4xl mx-auto w-full border-[#2A2D30] bg-[#18191B]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#2A2D30] pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl">
                    <Cpu size={24} className={downloadingModel ? "animate-spin" : ""} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#ECEBE9] tracking-tight">Local Ollama Model Downloader</h2>
                    <p className="text-[#A3A09B] text-xs mt-1">Ollama is active, but no models are installed. Download one below to begin.</p>
                  </div>
                </div>
              </div>

              {/* Hardware Specs Panel */}
              <div className="bg-[#111213] border border-[#2A2D30] p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-[#72706C] uppercase font-semibold tracking-wider">Detected System Specifications</span>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#A3A09B] mt-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[#72706C]">RAM:</span>
                      <span className="text-[#3C6B4D]">{hardware.ram}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[#72706C]">Cores:</span>
                      <span className="text-[#3C6B4D]">{hardware.cores} threads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[#72706C]">WebGPU:</span>
                      <span className={hardware.hasWebGPU ? "text-[#3C6B4D]" : "text-[#E29E2D]"}>
                        {hardware.hasWebGPU ? "Supported" : "Not supported"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 p-3.5 rounded-xl max-w-sm">
                  <span className="text-[#3C6B4D] font-bold text-xs uppercase tracking-wide block">Hardware Recommendation</span>
                  <p className="text-[#A3A09B] text-[11px] leading-relaxed mt-1">
                    Based on your specs, we recommend running <strong className="text-white font-mono">{hardware.recommendedModel}</strong>. {hardware.explanation}
                  </p>
                </div>
              </div>

              {/* Models list */}
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-[#ECEBE9] text-sm">Select a model to download directly:</h3>
                {downloadingModel && (
                  <div className="bg-[#111213] border border-[#2A2D30] p-5 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-[#3C6B4D] flex items-center gap-2">
                        <span className="animate-spin w-3 h-3 border-2 border-[#3C6B4D] border-t-transparent rounded-full"></span>
                        <span>Downloading {downloadingModel}...</span>
                      </span>
                      <span className="text-[#ECEBE9]">{downloadProgress}%</span>
                    </div>
                    <div className="w-full bg-[#18191B] rounded-full h-2 overflow-hidden border border-[#2A2D30]">
                      <div 
                        className="bg-[#3C6B4D] h-full transition-all duration-300"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-[#72706C]">{downloadStatus}</span>
                  </div>
                )}

                {downloadError && (
                  <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-xs text-rose-450 font-semibold leading-relaxed">
                    {downloadError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'qwen2.5:0.5b', size: '397 MB', desc: 'Ultra lightweight. Excellent for low-spec or quick test runs.', tier: 'low' },
                    { name: 'llama3.2:1b', size: '1.3 GB', desc: 'Balanced small model. Good comprehension and response times.', tier: 'medium' },
                    { name: 'gemma2:2b', size: '1.6 GB', desc: 'Google-optimized small model. High accuracy for text generation.', tier: 'medium' },
                    { name: 'llama3:8b', size: '4.7 GB', desc: 'Powerful industry standard. Requires 8GB+ RAM.', tier: 'high' },
                    { name: 'mistral:7b', size: '4.1 GB', desc: 'High quality reasoning model. Requires 8GB+ RAM.', tier: 'high' }
                  ].map((model) => {
                    const isRecommended = model.name === hardware.recommendedModel;
                    return (
                      <div 
                        key={model.name}
                        className={`bg-[#111213] border p-5 rounded-xl flex flex-col justify-between gap-4 transition-all relative ${
                          isRecommended ? 'border-[#3C6B4D]/40 bg-[#3C6B4D]/5' : 'border-[#2A2D30] hover:border-[#2E533B]/40'
                        }`}
                      >
                        {isRecommended && (
                          <span className="absolute -top-2.5 right-4 bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold">
                            Recommended
                          </span>
                        )}
                        <div className="flex flex-col gap-1 text-left">
                          <span className="font-bold text-[#ECEBE9] text-sm block font-mono">{model.name}</span>
                          <span className="text-[10px] text-[#72706C] block font-semibold">Download Size: {model.size}</span>
                          <p className="text-[#A3A09B] text-[11px] leading-relaxed mt-2">{model.desc}</p>
                        </div>
                        <button
                          onClick={() => handlePullModel(model.name)}
                          disabled={!!downloadingModel}
                          className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                            isRecommended 
                              ? 'bg-[#3C6B4D] hover:bg-[#2E533B] text-[#ECEBE9] disabled:opacity-40' 
                              : 'bg-[#18191B] hover:bg-[#25282B] border border-[#2A2D30] text-[#A3A09B] disabled:opacity-40'
                          }`}
                        >
                          {downloadingModel === model.name ? 'Downloading...' : 'Install Model'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
        <div className="flex flex-col gap-6 w-full text-left">
          {activeCategory === 'ai' && (
            <div className="glass-card p-5 flex flex-col gap-4 border-[#2A2D30] bg-[#18191B]">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl">
                        <Cpu size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#72706C] uppercase tracking-wider block font-semibold">Active LLM Model</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-bold text-[#ECEBE9] font-mono">{selectedOllamaModel || 'None'}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 font-bold uppercase tracking-wider">
                            Ollama Active
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <select
                        value={selectedOllamaModel}
                        onChange={(e) => {
                          setSelectedOllamaModel(e.target.value);
                          aiService.setSelectedOllamaModel(e.target.value);
                        }}
                        className="bg-[#111213] text-[#ECEBE9] border border-[#2A2D30] rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-[#3C6B4D] w-full md:w-56"
                      >
                        {ollamaModels.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => setShowManageModels(!showManageModels)}
                        className="btn-secondary py-2 px-4 text-xs font-semibold w-full md:w-auto shrink-0 flex items-center justify-center gap-1.5"
                      >
                        <ChevronDown size={14} className={`transform transition-transform ${showManageModels ? 'rotate-180' : ''}`} />
                        <span>Download More Models</span>
                      </button>
                    </div>
                  </div>

                  {showManageModels && (
                    <div className="border-t border-[#2A2D30] pt-5 mt-2 flex flex-col gap-4">
                      <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div>
                          <span className="text-[10px] text-[#72706C] uppercase font-semibold block">Hardware Recommendation System</span>
                          <span className="text-xs text-[#A3A09B] block mt-1">
                            System RAM: <strong className="text-[#3C6B4D]">{hardware.ram}</strong> | CPU Cores: <strong className="text-[#3C6B4D]">{hardware.cores}</strong>
                          </span>
                        </div>
                        <div className="text-xs text-[#A3A09B] max-w-md bg-[#18191B] p-2.5 rounded-lg border border-[#2A2D30]">
                          We recommend <strong className="text-white font-mono">{hardware.recommendedModel}</strong> for your hardware.
                        </div>
                      </div>

                      {downloadingModel && (
                        <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl flex flex-col gap-2">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-[#3C6B4D]">Downloading {downloadingModel}...</span>
                            <span>{downloadProgress}%</span>
                          </div>
                          <div className="w-full bg-[#18191B] rounded-full h-1.5 overflow-hidden">
                            <div className="bg-[#3C6B4D] h-full" style={{ width: `${downloadProgress}%` }} />
                          </div>
                        </div>
                      )}

                      {downloadError && (
                        <div className="bg-rose-500/10 border border-rose-500/25 p-3 rounded-lg text-xs text-rose-450 font-semibold">
                          {downloadError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        {[
                          { name: 'qwen2.5:0.5b', size: '397MB' },
                          { name: 'llama3.2:1b', size: '1.3GB' },
                          { name: 'gemma2:2b', size: '1.6GB' },
                          { name: 'llama3:8b', size: '4.7GB' },
                          { name: 'mistral:7b', size: '4.1GB' }
                        ].map((m) => {
                          const alreadyInstalled = ollamaModels.includes(m.name);
                          return (
                            <div key={m.name} className="bg-[#111213] border border-[#2A2D30] p-3 rounded-xl flex flex-col justify-between gap-3">
                              <div className="text-left">
                                <span className="text-[11px] font-bold text-[#ECEBE9] block font-mono truncate">{m.name}</span>
                                <span className="text-[9px] text-[#72706C] block font-semibold mt-0.5">{m.size}</span>
                              </div>
                              <button
                                onClick={() => handlePullModel(m.name)}
                                disabled={alreadyInstalled || !!downloadingModel}
                                className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                  alreadyInstalled
                                    ? 'bg-[#18191B] text-[#72706C] cursor-default border border-[#2A2D30]'
                                    : 'bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 hover:bg-[#3C6B4D]/20'
                                }`}
                              >
                                {alreadyInstalled ? 'Installed' : downloadingModel === m.name ? 'Downloading' : 'Download'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
          {activeCategory === 'security' && (!isLocal || !hasOllama) && (
            <div className="bg-[#E29E2D]/10 border border-[#E29E2D]/20 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
              <div>
                <h3 className="text-[#ECEBE9] font-bold text-sm flex items-center gap-2">
                  <ShieldAlert size={16} className="text-[#E29E2D]" />
                  Unlock DomoGuard AI Suite
                </h3>
                <p className="text-[#A3A09B] text-xs mt-1 leading-relaxed">
                  10 advanced AI security tools are currently hidden. Start your local Ollama instance and download a model to unlock them.
                </p>
              </div>
              <button onClick={() => handleCategoryChange('ai')} className="btn-secondary text-xs px-4 py-2 shrink-0 border-[#E29E2D]/20 text-[#E29E2D] hover:bg-[#E29E2D]/10">
                Setup Offline AI
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTools.slice(0, activeCategory === 'all' ? visibleCount : undefined).map((tool) => {
            const isReady = tool.status === 'functional';
            const isTeased = tool.requiresOllama && (!isLocal || !hasOllama);

            return (
              <div
                key={tool.id}
                onClick={() => isReady && !isTeased && navigate(`/tool/${tool.id}`)}
                className={`glass-card p-6 flex flex-col justify-between text-left relative overflow-hidden group ${
                  isReady && !isTeased
                    ? 'glass-card-hover cursor-pointer border-[#2A2D30] hover:border-[#3C6B4D]/50'
                    : 'opacity-60 border-dashed border-[#2A2D30] select-none bg-[#111213]/40'
                } transition-all duration-200`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl border ${
                      isReady && !isTeased
                        ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/25 text-[#3C6B4D] group-hover:scale-[1.03] transition-transform' 
                        : 'bg-[#111213] border-[#2A2D30] text-[#72706C]'
                    }`}>
                      <DynamicIcon name={tool.icon} size={22} />
                    </div>
                    {isTeased ? (
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-[#E29E2D]/10 text-[#E29E2D] border border-[#E29E2D]/20 flex items-center gap-1">
                        <Cpu size={10} />
                        Needs Local AI
                      </span>
                    ) : isReady ? (
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20">
                        Ready
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-[#111213] text-[#72706C] border border-[#2A2D30]">
                        Planned
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-lg text-[#ECEBE9] group-hover:text-[#3C6B4D] transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-[#A3A09B] text-xs leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer badges */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#2A2D30]/65">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#72706C]">
                    {tool.category} Tool
                  </span>
                  
                  {isReady && !isTeased && (
                    <span className="text-xs font-semibold text-[#3C6B4D] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Open</span>
                      <span>→</span>
                    </span>
                  )}
                  {isTeased && (
                    <span className="text-[10px] font-bold text-[#E29E2D] flex items-center gap-1">
                      <ShieldAlert size={12} />
                      Unlock in Dashboard
                    </span>
                  )}
                </div>
              </div>
            );
            })}

            {filteredTools.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-[#72706C] gap-2">
                <Cpu size={32} className="opacity-40 animate-pulse" />
                <p className="text-sm">No local tools matched your selection.</p>
              </div>
            )}
          </div>
          {activeCategory === 'all' && filteredTools.length > visibleCount && (
            <div className="flex flex-col items-center gap-3 mt-8 pb-10 w-full">
              <div className="text-xs text-[#72706C] font-bold uppercase tracking-wider">
                Showing 12 of {filteredTools.length} total utilities
              </div>
              <button
                onClick={() => setVisibleCount(filteredTools.length)}
                className="btn-primary group px-8 py-3.5 hover:scale-[1.01] transition-all flex items-center gap-2"
              >
                <span>Reveal All {filteredTools.length} Tools</span>
                <ChevronDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
