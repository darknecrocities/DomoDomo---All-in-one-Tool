import type { Tool } from './types';

// Photo Suite Imports
import { BackgroundRemoverTool } from '../tools/photo/BackgroundRemover';
import { ImageResizerTool } from '../tools/photo/ImageResizer';
import { ImageCompressorTool } from '../tools/photo/ImageCompressor';
import { CropRotateTool } from '../tools/photo/CropRotate';
import { AIImageEnhancerTool } from '../tools/photo/AIImageEnhancer';
import { WatermarkTool } from '../tools/photo/Watermark';
import { ImageUpscalerTool } from '../tools/photo/ImageUpscaler';
import { ColorPaletteExtractorTool } from '../tools/photo/ColorPaletteExtractor';
import { CollageMakerTool } from '../tools/photo/CollageMaker';
import { FormatConverterTool } from '../tools/photo/FormatConverter';

// PDF Suite Imports
import { PDFMergeTool } from '../tools/pdf/PDFMerge';
import { PDFSplitTool } from '../tools/pdf/PDFSplit';
import { PDFCompressTool } from '../tools/pdf/PDFCompress';
import { PDFToImageTool } from '../tools/pdf/PDFToImage';
import { ImageToPDFTool } from '../tools/pdf/ImageToPDF';
import { PDFWatermarkTool } from '../tools/pdf/PDFWatermark';
import { PDFSignTool } from '../tools/pdf/PDFSign';
import { PDFProtectTool } from '../tools/pdf/PDFProtect';
import { PDFExtractTextTool } from '../tools/pdf/PDFExtractText';
import { PDFViewerTool } from '../tools/pdf/PDFViewer';
import { PDFTextEditTool } from '../tools/pdf/PDFTextEdit';

// Document Suite Imports
import { RichTextTool } from '../tools/document/RichText';
import { MarkdownTool } from '../tools/document/Markdown';
import { OCRScannerTool } from '../tools/document/OCRScanner';
import { ResumeBuilderTool } from '../tools/document/ResumeBuilder';
import { InvoiceGeneratorTool } from '../tools/document/InvoiceGenerator';
import { SummarizerTool } from '../tools/document/Summarizer';
import { TranslatorTool } from '../tools/document/Translator';
import { GrammarFixerTool } from '../tools/document/GrammarFixer';
import { CitationGeneratorTool } from '../tools/document/CitationGenerator';
import { CodeNotesTool } from '../tools/document/CodeNotes';

// Converter Suite Imports
import { JpgPngTool } from '../tools/converter/JpgPng';
import { WebpJpgTool } from '../tools/converter/WebpJpg';
import { Mp4GifTool } from '../tools/converter/Mp4Gif';
import { Mp3WavTool } from '../tools/converter/Mp3Wav';
import { CsvJsonTool } from '../tools/converter/CsvJson';
import { XmlJsonTool } from '../tools/converter/XmlJson';
import { DocxTxtTool } from '../tools/converter/DocxTxt';
import { EpubPdfTool } from '../tools/converter/EpubPdf';
import { Base64Tool as ConverterBase64Tool } from '../tools/converter/Base64Tool';
import { ZipExtractorTool } from '../tools/converter/ZipExtractor';

// QR / Barcode Imports
import { QRGeneratorTool } from '../tools/qr/QRGenerator';
import { QRScannerTool } from '../tools/qr/QRScanner';
import { WifiQRTool } from '../tools/qr/WifiQR';
import { VCardQRTool } from '../tools/qr/VCardQR';
import { EventQRTool } from '../tools/qr/EventQR';
import { PaymentQRTool } from '../tools/qr/PaymentQR';
import { BarcodeGeneratorTool } from '../tools/qr/BarcodeGenerator';
import { BarcodeScannerTool } from '../tools/qr/BarcodeScanner';
import { BulkQRTool } from '../tools/qr/BulkQR';
import { QRDesignerTool } from '../tools/qr/QRDesigner';

// Video Suite Imports
import { VideoTrimTool } from '../tools/video/VideoTrim';
import { VideoCompressTool } from '../tools/video/VideoCompress';
import { VideoMergeTool } from '../tools/video/VideoMerge';
import { VideoConvertTool } from '../tools/video/VideoConvert';
import { VideoAudioTool } from '../tools/video/VideoAudio';
import { VideoSubtitlesTool } from '../tools/video/VideoSubtitles';
import { VideoSpeedTool } from '../tools/video/VideoSpeed';
import { VideoCropTool } from '../tools/video/VideoCrop';
import { VideoGifMakerTool } from '../tools/video/VideoGifMaker';
import { VideoThumbnailTool } from '../tools/video/VideoThumbnail';
import { VideoFaceBlurTool } from '../tools/video/VideoFaceBlur';

// Audio Suite Imports
import { AudioCutterTool } from '../tools/audio/AudioCutter';
import { AudioMergeTool } from '../tools/audio/AudioMerge';
import { AudioNoiseTool } from '../tools/audio/AudioNoise';
import { AudioConvertTool } from '../tools/audio/AudioConvert';
import { VoiceRecorderTool } from '../tools/audio/VoiceRecorder';
import { SpeechToTextTool } from '../tools/audio/SpeechToText';
import { TextToSpeechTool } from '../tools/audio/TextToSpeech';
import { VolumeBoosterTool } from '../tools/audio/VolumeBooster';
import { PodcastEditorTool } from '../tools/audio/PodcastEditor';
import { AudioVisualizerTool } from '../tools/audio/AudioVisualizer';

// Dev Suite Imports
import { JSONFormatterTool } from '../tools/dev/JSONFormatter';
import { JWTDecoderTool } from '../tools/dev/JWTDecoder';
import { Base64Tool as DevBase64Tool } from '../tools/dev/Base64Tool';
import { RegexTesterTool } from '../tools/dev/RegexTester';
import { UUIDGeneratorTool } from '../tools/dev/UUIDGenerator';
import { HashGeneratorTool } from '../tools/dev/HashGenerator';
import { APITesterTool } from '../tools/dev/APITester';
import { URLEncoderTool } from '../tools/dev/URLEncoder';
import { HTMLMinifierTool } from '../tools/dev/HTMLMinifier';
import { ColorConverterTool } from '../tools/dev/ColorConverter';
import { CronParserTool } from '../tools/dev/CronParser';
import { SQLFormatterTool } from '../tools/dev/SQLFormatter';
import { YamlJsonConverterTool } from '../tools/dev/YamlJsonConverter';
import { MarkdownTableGeneratorTool } from '../tools/dev/MarkdownTableGenerator';
import { DiffCheckerTool } from '../tools/dev/DiffChecker';
import { KeycodeFinderTool } from '../tools/dev/KeycodeFinder';
import { BoxShadowGeneratorTool } from '../tools/dev/BoxShadowGenerator';
import { BaseConverterTool } from '../tools/dev/BaseConverter';
import { GlassmorphismGeneratorTool } from '../tools/dev/GlassmorphismGenerator';
import { ScreenInfoTool } from '../tools/dev/ScreenInfo';

// Additional Dev Tools Imports
import { JWTGeneratorTool } from '../tools/dev/additional/JWTGenerator';
import { CaseConverterTool } from '../tools/dev/additional/CaseConverter';
import { URLParserTool } from '../tools/dev/additional/URLParser';
import { FlexboxGridPlaygroundTool } from '../tools/dev/additional/FlexboxGridPlayground';
import { SandboxConsoleTool } from '../tools/dev/additional/SandboxConsole';
import { DockerBuilderTool } from '../tools/dev/additional/DockerBuilder';
import { SVGOptimizerTool } from '../tools/dev/additional/SVGOptimizer';
import { HeaderInspectorTool } from '../tools/dev/additional/HeaderInspector';
import { IPSubnetterTool } from '../tools/dev/additional/IPSubnetter';
import { ViewportTesterTool } from '../tools/dev/additional/ViewportTester';

// AI Suite Imports
import { LocalAIChatTool } from '../tools/ai/LocalAIChat';
import { AISummarizerTool } from '../tools/ai/AISummarizer';
import { AICaptionTool } from '../tools/ai/AICaption';
import { AIOCRAssistantTool } from '../tools/ai/AIOCRAssistant';
import { AIPromptEnhancerTool } from '../tools/ai/AIPromptEnhancer';
import { AIClassifierTool } from '../tools/ai/AIClassifier';
import { AITextRewriterTool } from '../tools/ai/AITextRewriter';
import { AITranslatorTool } from '../tools/ai/AITranslator';
import { AISpeechToTextTool } from '../tools/ai/AISpeechToText';
import { AISemanticSearchTool } from '../tools/ai/AISemanticSearch';
import { AICodeExplainerTool } from '../tools/ai/AICodeExplainer';
import { AIFlashcardMakerTool } from '../tools/ai/AIFlashcardMaker';
import { AISentimentJournalTool } from '../tools/ai/AISentimentJournal';
import { AIEmailComposerTool } from '../tools/ai/AIEmailComposer';
import { AIStoryGeneratorTool } from '../tools/ai/AIStoryGenerator';
import { AIDebateAssistantTool } from '../tools/ai/AIDebateAssistant';
import { AIMathSolverTool } from '../tools/ai/AIMathSolver';
import { AIRecipeGeneratorTool } from '../tools/ai/AIRecipeGenerator';
import { AICodeReviewerTool } from '../tools/ai/AICodeReviewer';
import { AIMindMapperTool } from '../tools/ai/AIMindMapper';
import { AIDomoAgentHub } from '../tools/ai/AIDomoAgentHub';
import { AIDomoSelection } from '../tools/ai/AIDomoSelection';

export const TOOLS: Tool[] = [
  // Photo Tools (10)
  { id: 'background-remover', name: 'Background Remover', category: 'photo', description: 'Erase image backgrounds instantly. Click to key out matching colors, or use manual eraser.', icon: 'Image', run: async (i) => i, component: BackgroundRemoverTool },
  { id: 'image-resizer', name: 'Image Resizer', category: 'photo', description: 'Resize images to precise dimensions using Canvas.', icon: 'Image', run: async (i) => i, component: ImageResizerTool },
  { id: 'image-compressor', name: 'Image Compressor', category: 'photo', description: 'Reduce image file sizes with real-time quality scale.', icon: 'Image', run: async (i) => i, component: ImageCompressorTool },
  { id: 'crop-rotate', name: 'Crop & Rotate Tool', category: 'photo', description: 'Crop or rotate photos to standard ratios.', icon: 'Image', run: async (i) => i, component: CropRotateTool },
  { id: 'ai-enhancer', name: 'AI Image Enhancer', category: 'photo', description: 'Enhance details using local contrast and color filters.', icon: 'Image', run: async (i) => i, component: AIImageEnhancerTool },
  { id: 'watermark-tool', name: 'Watermark Tool', category: 'photo', description: 'Add logo or text watermarks overlay onto photos.', icon: 'Image', run: async (i) => i, component: WatermarkTool },
  { id: 'image-upscaler', name: 'Image Upscaler', category: 'photo', description: 'Upscale dimensions using canvas bicubic interpolation.', icon: 'Image', run: async (i) => i, component: ImageUpscalerTool },
  { id: 'palette-extractor', name: 'Color Palette Extractor', category: 'photo', description: 'Extract key color swatches and hex codes.', icon: 'Image', run: async (i) => i, component: ColorPaletteExtractorTool },
  { id: 'collage-maker', name: 'Collage Maker', category: 'photo', description: 'Combine multiple images in editable canvas grids.', icon: 'Image', run: async (i) => i, component: CollageMakerTool },
  { id: 'format-converter', name: 'Format Converter', category: 'photo', description: 'Convert image files to JPG, PNG, WebP locally.', icon: 'Image', run: async (i) => i, component: FormatConverterTool },

  // PDF Tools (10)
  { id: 'pdf-merge', name: 'Merge PDFs', category: 'pdf', description: 'Combine multiple PDF files into a single document.', icon: 'FileText', run: async (i) => i, component: PDFMergeTool },
  { id: 'pdf-split', name: 'Split PDF', category: 'pdf', description: 'Extract pages from a PDF document into separate files.', icon: 'FileText', run: async (i) => i, component: PDFSplitTool },
  { id: 'pdf-compress', name: 'Compress PDF', category: 'pdf', description: 'Compress PDF size using structural optimization.', icon: 'FileText', run: async (i) => i, component: PDFCompressTool },
  { id: 'pdf-to-img', name: 'PDF → Image', category: 'pdf', description: 'Export PDF page views as high-res PNG images.', icon: 'FileText', run: async (i) => i, component: PDFToImageTool },
  { id: 'img-to-pdf', name: 'Image → PDF', category: 'pdf', description: 'Convert graphics and photos into PDF document pages.', icon: 'FileText', run: async (i) => i, component: ImageToPDFTool },
  { id: 'pdf-watermark', name: 'Add Watermark', category: 'pdf', description: 'Overlay transparent text stamps onto PDFs.', icon: 'FileText', run: async (i) => i, component: PDFWatermarkTool },
  { id: 'pdf-sign', name: 'Sign PDF', category: 'pdf', description: 'Place transparent hand-drawn signatures on files.', icon: 'FileText', run: async (i) => i, component: PDFSignTool },
  { id: 'pdf-protect', name: 'Protect PDF', category: 'pdf', description: 'Set passwords and encryption constraints on PDFs.', icon: 'FileText', run: async (i) => i, component: PDFProtectTool },
  { id: 'pdf-ocr', name: 'Extract Text (OCR)', category: 'pdf', description: 'Transcribe PDFs using structural parsing.', icon: 'FileText', run: async (i) => i, component: PDFExtractTextTool },
  { id: 'pdf-viewer', name: 'PDF Viewer', category: 'pdf', description: 'Read and view PDF books locally in frame.', icon: 'FileText', run: async (i) => i, component: PDFViewerTool },
  { id: 'pdf-text-edit', name: 'Edit PDF Text', category: 'pdf', description: 'Select, modify, search/replace, and add text on PDF pages offline.', icon: 'FileText', run: async (i) => i, component: PDFTextEditTool },

  // Document Tools (10)
  { id: 'rich-text', name: 'Rich Text Editor', category: 'document', description: 'Leak-free local document generator with text formatting.', icon: 'FileText', run: async (i) => i, component: RichTextTool },
  { id: 'markdown-editor', name: 'Markdown Editor', category: 'document', description: 'Live preview Markdown syntax writing board.', icon: 'FileText', run: async (i) => i, component: MarkdownTool },
  { id: 'ocr-scanner', name: 'OCR Scanner', category: 'document', description: 'Extract text from scanned pages using local OCR.', icon: 'FileText', run: async (i) => i, component: OCRScannerTool },
  { id: 'resume-builder', name: 'Resume Builder', category: 'document', description: 'Compile developer resumes to TXT instantly.', icon: 'FileText', run: async (i) => i, component: ResumeBuilderTool },
  { id: 'invoice-gen', name: 'Invoice Generator', category: 'document', description: 'Formulator for corporate invoice templates.', icon: 'FileText', run: async (i) => i, component: InvoiceGeneratorTool },
  { id: 'summarizer', name: 'Summarizer', category: 'document', description: 'Extract key points and summary from local text.', icon: 'FileText', run: async (i) => i, component: SummarizerTool },
  { id: 'translator', name: 'Translator', category: 'document', description: 'Translate text locally via dictionary mapping.', icon: 'FileText', run: async (i) => i, component: TranslatorTool },
  { id: 'grammar-fixer', name: 'Grammar Fixer', category: 'document', description: 'Fix syntax and grammatical spelling in browser.', icon: 'FileText', run: async (i) => i, component: GrammarFixerTool },
  { id: 'citation-gen', name: 'Citation Generator', category: 'document', description: 'Generate APA formatted academic bibliographies.', icon: 'FileText', run: async (i) => i, component: CitationGeneratorTool },
  { id: 'code-notes', name: 'Code Notes Editor', category: 'document', description: 'Write down programming logs and code blocks.', icon: 'FileText', run: async (i) => i, component: CodeNotesTool },

  // Converter Tools (10)
  { id: 'jpg-png', name: 'JPG ↔ PNG Converter', category: 'converter', description: 'Convert graphics between JPG and PNG formats.', icon: 'Hammer', run: async (i) => i, component: JpgPngTool },
  { id: 'webp-jpg', name: 'WebP ↔ JPG Converter', category: 'converter', description: 'Convert WebP images to JPG standard.', icon: 'Hammer', run: async (i) => i, component: WebpJpgTool },
  { id: 'mp4-gif', name: 'MP4 ↔ GIF Converter', category: 'converter', description: 'Animate MP4 frames into GIF files locally.', icon: 'Hammer', run: async (i) => i, component: Mp4GifTool },
  { id: 'mp3-wav', name: 'MP3 ↔ WAV Converter', category: 'converter', description: 'Convert audio between MP3 and WAV streams.', icon: 'Hammer', run: async (i) => i, component: Mp3WavTool },
  { id: 'csv-json', name: 'CSV ↔ JSON Converter', category: 'converter', description: 'Translate spreadsheet CSV into JSON formats.', icon: 'Hammer', run: async (i) => i, component: CsvJsonTool },
  { id: 'xml-json', name: 'XML ↔ JSON Converter', category: 'converter', description: 'Translate XML trees into readable JSON structures.', icon: 'Hammer', run: async (i) => i, component: XmlJsonTool },
  { id: 'docx-txt', name: 'DOCX ↔ TXT Converter', category: 'converter', description: 'Extract plain text from word processing DOCX files.', icon: 'Hammer', run: async (i) => i, component: DocxTxtTool },
  { id: 'epub-pdf', name: 'EPUB → PDF Converter', category: 'converter', description: 'Convert e-books to standard PDF formats.', icon: 'Hammer', run: async (i) => i, component: EpubPdfTool },
  { id: 'base64-tool', name: 'Base64 Converter', category: 'converter', description: 'Convert text strings and assets to base64 arrays.', icon: 'Hammer', run: async (i) => i, component: ConverterBase64Tool },
  { id: 'zip-extractor', name: 'ZIP Extractor', category: 'converter', description: 'Outline and unpack local zip compression archives.', icon: 'Hammer', run: async (i) => i, component: ZipExtractorTool },

  // QR / Barcode (10)
  { id: 'qr-generator', name: 'QR Code Generator', category: 'qr', description: 'Create customized QR codes for links, text, and credentials.', icon: 'QrCode', run: async (i) => i, component: QRGeneratorTool },
  { id: 'qr-scanner', name: 'QR Scanner', category: 'qr', description: 'Scan QR codes using local browser webcam feed.', icon: 'QrCode', run: async (i) => i, component: QRScannerTool },
  { id: 'wifi-qr', name: 'WiFi QR Generator', category: 'qr', description: 'Generate router network scan cards.', icon: 'QrCode', run: async (i) => i, component: WifiQRTool },
  { id: 'vcard-qr', name: 'vCard QR Generator', category: 'qr', description: 'Encode business contact sheets in QR codes.', icon: 'QrCode', run: async (i) => i, component: VCardQRTool },
  { id: 'event-qr', name: 'Event QR Generator', category: 'qr', description: 'Share event schedules and calendars in QR codes.', icon: 'QrCode', run: async (i) => i, component: EventQRTool },
  { id: 'payment-qr', name: 'Payment QR Generator', category: 'qr', description: 'Create scan-to-pay QR codes for UPI/bank channels.', icon: 'QrCode', run: async (i) => i, component: PaymentQRTool },
  { id: 'barcode-gen', name: 'Barcode Generator', category: 'qr', description: 'Generate Code128 and UPC barcodes.', icon: 'QrCode', run: async (i) => i, component: BarcodeGeneratorTool },
  { id: 'barcode-scan', name: 'Barcode Scanner', category: 'qr', description: 'Decode commercial item barcodes.', icon: 'QrCode', run: async (i) => i, component: BarcodeScannerTool },
  { id: 'bulk-qr', name: 'Bulk QR Generator', category: 'qr', description: 'Generate list of QR codes from CSV rows.', icon: 'QrCode', run: async (i) => i, component: BulkQRTool },
  { id: 'qr-designer', name: 'QR Designer', category: 'qr', description: 'Customize modules and patterns in QR designs.', icon: 'QrCode', run: async (i) => i, component: QRDesignerTool },

  // Video Suite (10)
  { id: 'trim-video', name: 'Trim Video', category: 'video', description: 'Clip video file frames between start and end slider ranges.', icon: 'Image', run: async (i) => i, component: VideoTrimTool },
  { id: 'compress-video', name: 'Compress Video', category: 'video', description: 'Reduce video track file sizes in the browser.', icon: 'Image', run: async (i) => i, component: VideoCompressTool },
  { id: 'merge-videos', name: 'Merge Videos', category: 'video', description: 'Combine multiple video files together.', icon: 'Image', run: async (i) => i, component: VideoMergeTool },
  { id: 'convert-video', name: 'Convert Video', category: 'video', description: 'Convert video files to WebM or MP4 format.', icon: 'Image', run: async (i) => i, component: VideoConvertTool },
  { id: 'extract-audio', name: 'Extract Audio', category: 'video', description: 'Strip audio tracks from video files.', icon: 'Image', run: async (i) => i, component: VideoAudioTool },
  { id: 'add-subtitles', name: 'Add Subtitles', category: 'video', description: 'Overlay closed caption tracks onto video screens.', icon: 'Image', run: async (i) => i, component: VideoSubtitlesTool },
  { id: 'speed-control', name: 'Speed Control', category: 'video', description: 'Accelerate or slow down video playback rates.', icon: 'Image', run: async (i) => i, component: VideoSpeedTool },
  { id: 'crop-video', name: 'Crop Video', category: 'video', description: 'Crop frames to square or wide dimensions.', icon: 'Image', run: async (i) => i, component: VideoCropTool },
  { id: 'gif-maker', name: 'GIF Maker', category: 'video', description: 'Export video loops into animated GIF files.', icon: 'Image', run: async (i) => i, component: VideoGifMakerTool },
  { id: 'thumbnail-gen', name: 'Thumbnail Generator', category: 'video', description: 'Capture custom frames from videos as JPEG thumbnails.', icon: 'Image', run: async (i) => i, component: VideoThumbnailTool },
  { id: 'face-blur', name: 'Face Blur', category: 'video', description: 'Locally detect and blur human face coordinates in video frames.', icon: 'Shield', run: async (i) => i, component: VideoFaceBlurTool },

  // Audio Suite (10)
  { id: 'audio-cutter', name: 'Audio Cutter', category: 'audio', description: 'Trim start and end offsets of audio tracks.', icon: 'FileText', run: async (i) => i, component: AudioCutterTool },
  { id: 'audio-merge', name: 'Audio Merge', category: 'audio', description: 'Concatenate multiple audio tracks.', icon: 'FileText', run: async (i) => i, component: AudioMergeTool },
  { id: 'noise-removal', name: 'Noise Removal', category: 'audio', description: 'Filter background hiss and clicks from audio feeds.', icon: 'FileText', run: async (i) => i, component: AudioNoiseTool },
  { id: 'audio-convert', name: 'Convert Audio', category: 'audio', description: 'Convert audio files to MP3 or WAV formats.', icon: 'FileText', run: async (i) => i, component: AudioConvertTool },
  { id: 'voice-recorder', name: 'Voice Recorder', category: 'audio', description: 'Record microphone audio and download audio files.', icon: 'FileText', run: async (i) => i, component: VoiceRecorderTool },
  { id: 'speech-to-text', name: 'Speech-to-Text', category: 'audio', description: 'Transcribe speech into text using web speech APIs.', icon: 'FileText', run: async (i) => i, component: SpeechToTextTool },
  { id: 'tts-fallback', name: 'Text-to-Speech', category: 'audio', description: 'Speak text phrases aloud using local synthesizer.', icon: 'FileText', run: async (i) => i, component: TextToSpeechTool },
  { id: 'volume-booster', name: 'Volume Booster', category: 'audio', description: 'Amplify audio loudness levels.', icon: 'FileText', run: async (i) => i, component: VolumeBoosterTool },
  { id: 'podcast-editor', name: 'Podcast Editor', category: 'audio', description: 'Edit and compile multi-track audio podcasts.', icon: 'FileText', run: async (i) => i, component: PodcastEditorTool },
  { id: 'audio-visualizer', name: 'Audio Visualizer', category: 'audio', description: 'Render real-time sound frequency bars.', icon: 'FileText', run: async (i) => i, component: AudioVisualizerTool },

  // Dev Tools (20)
  { id: 'json-format', name: 'JSON Formatter', category: 'dev', description: 'Beautify and validate JSON strings.', icon: 'Hammer', run: async (i) => i, component: JSONFormatterTool },
  { id: 'jwt-decode', name: 'JWT Decoder', category: 'dev', description: 'Decode JWT headers and payloads locally with zero data leaks.', icon: 'Hammer', run: async (i) => i, component: JWTDecoderTool },
  { id: 'dev-base64', name: 'Base64 Tool', category: 'dev', description: 'Encode or decode base64 strings.', icon: 'Hammer', run: async (i) => i, component: DevBase64Tool },
  { id: 'regex-tester', name: 'Regex Tester', category: 'dev', description: 'Test expression matching patterns.', icon: 'Hammer', run: async (i) => i, component: RegexTesterTool },
  { id: 'uuid-gen', name: 'UUID Generator', category: 'dev', description: 'Generate unique random UUIDv4 keys.', icon: 'Hammer', run: async (i) => i, component: UUIDGeneratorTool },
  { id: 'hash-gen', name: 'Hash Generator', category: 'dev', description: 'Generate SHA-256 hashes of text strings.', icon: 'Hammer', run: async (i) => i, component: HashGeneratorTool },
  { id: 'api-tester', name: 'API Tester', category: 'dev', description: 'Send request calls to local endpoints.', icon: 'Hammer', run: async (i) => i, component: APITesterTool },
  { id: 'url-encoder', name: 'URL Encoder', category: 'dev', description: 'Encode or decode URL query paths.', icon: 'Hammer', run: async (i) => i, component: URLEncoderTool },
  { id: 'html-minify', name: 'HTML Minifier', category: 'dev', description: 'Minify code lines by stripping tags whitespaces.', icon: 'Hammer', run: async (i) => i, component: HTMLMinifierTool },
  { id: 'color-converter', name: 'Color Converter', category: 'dev', description: 'Convert color hex values to color spaces.', icon: 'Hammer', run: async (i) => i, component: ColorConverterTool },
  { id: 'cron-parser', name: 'Cron Expression Parser', category: 'dev', description: 'Parse cron schedules or generate expressions interactively.', icon: 'Hammer', run: async (i) => i, component: CronParserTool },
  { id: 'sql-formatter', name: 'SQL Formatter', category: 'dev', description: 'Format and beautify SQL queries with custom spacing.', icon: 'Hammer', run: async (i) => i, component: SQLFormatterTool },
  { id: 'yaml-json', name: 'YAML ↔ JSON Converter', category: 'dev', description: 'Convert configuration structures between YAML and JSON.', icon: 'Hammer', run: async (i) => i, component: YamlJsonConverterTool },
  { id: 'md-table-gen', name: 'Markdown Table Generator', category: 'dev', description: 'Interactive layout to design and generate Markdown tables.', icon: 'Hammer', run: async (i) => i, component: MarkdownTableGeneratorTool },
  { id: 'diff-checker', name: 'Diff Checker', category: 'dev', description: 'Compare two text layers side-by-side to highlight differences.', icon: 'Hammer', run: async (i) => i, component: DiffCheckerTool },
  { id: 'keycode-finder', name: 'Keyboard Keycode Finder', category: 'dev', description: 'Detect keyboard keys and view standard browser event values.', icon: 'Hammer', run: async (i) => i, component: KeycodeFinderTool },
  { id: 'box-shadow-gen', name: 'Box Shadow Generator', category: 'dev', description: 'Visual parameters slider to configure CSS box shadow styles.', icon: 'Hammer', run: async (i) => i, component: BoxShadowGeneratorTool },
  { id: 'base-converter', name: 'Base Converter', category: 'dev', description: 'Convert integers between decimal, binary, octal, and hex bases.', icon: 'Hammer', run: async (i) => i, component: BaseConverterTool },
  { id: 'glassmorphism-gen', name: 'Glassmorphism Generator', category: 'dev', description: 'Visual backdrop-filter designer generating modern glass assets.', icon: 'Hammer', run: async (i) => i, component: GlassmorphismGeneratorTool },
  { id: 'screen-info', name: 'Screen & Device Info', category: 'dev', description: 'Inspect hardware specs, viewport sizes, and client details.', icon: 'Hammer', run: async (i) => i, component: ScreenInfoTool },
  
  // Additional Dev Tools (10)
  { id: 'jwt-gen', name: 'JWT Generator & Signer', category: 'dev', description: 'Generate, sign, and verify JWT tokens locally using WebCrypto HS256.', icon: 'Hammer', run: async (i) => i, component: JWTGeneratorTool },
  { id: 'case-convert', name: 'Text Case Converter', category: 'dev', description: 'Convert text identifier cases between camel, Pascal, snake, kebab, and slug styles.', icon: 'Hammer', run: async (i) => i, component: CaseConverterTool },
  { id: 'url-parse', name: 'URL & Query String Parser', category: 'dev', description: 'Parse, edit parameters, and validate URL query strings in real-time.', icon: 'Hammer', run: async (i) => i, component: URLParserTool },
  { id: 'flexbox-grid-playground', name: 'CSS Flexbox & Grid Playground', category: 'dev', description: 'Interactive visual simulator to build and customize CSS Flexbox and Grid layouts.', icon: 'Hammer', run: async (i) => i, component: FlexboxGridPlaygroundTool },
  { id: 'js-sandbox-console', name: 'JS Code Sandbox & Console', category: 'dev', description: 'Execute ES6 JavaScript scripts in a sandboxed console window with speed benchmarking.', icon: 'Hammer', run: async (i) => i, component: SandboxConsoleTool },
  { id: 'docker-compose-builder', name: 'Docker Compose Builder', category: 'dev', description: 'Visually configure multi-container Docker services and export compose configurations.', icon: 'Hammer', run: async (i) => i, component: DockerBuilderTool },
  { id: 'svg-optimizer', name: 'SVG Optimizer & Editor', category: 'dev', description: 'Clean up vector paths, override stroke/fill attributes, and optimize file sizes.', icon: 'Hammer', run: async (i) => i, component: SVGOptimizerTool },
  { id: 'http-header-inspector', name: 'HTTP Header Inspector', category: 'dev', description: 'Parse header logs, validate security compliance scores, and generate CORS rules.', icon: 'Hammer', run: async (i) => i, component: HeaderInspectorTool },
  { id: 'ip-subnetter', name: 'CIDR Subnet & Socket Calculator', category: 'dev', description: 'Calculate IP subnet mask addresses, usable host scopes, and lookup network ports.', icon: 'Hammer', run: async (i) => i, component: IPSubnetterTool },
  { id: 'viewport-ua-tester', name: 'Viewport & User-Agent Tester', category: 'dev', description: 'Simulate screen sizes responsive grids, rotate view orientations, and check network speeds.', icon: 'Hammer', run: async (i) => i, component: ViewportTesterTool },

  // AI Tools (20)
  { id: 'ai-chat', name: 'AI Chat', category: 'ai', description: 'Chat locally with Domo assistant under absolute leak-free security.', icon: 'Hammer', run: async (i) => i, component: LocalAIChatTool },
  { id: 'ai-summarizer', name: 'Summarizer', category: 'ai', description: 'Summarize text documents using local parsing.', icon: 'Hammer', run: async (i) => i, component: AISummarizerTool },
  { id: 'caption-gen', name: 'Caption Generator', category: 'ai', description: 'Generate descriptive image captions.', icon: 'Hammer', run: async (i) => i, component: AICaptionTool },
  { id: 'ocr-assistant', name: 'OCR Assistant', category: 'ai', description: 'Format OCR results into clean layouts.', icon: 'Hammer', run: async (i) => i, component: AIOCRAssistantTool },
  { id: 'prompt-enhancer', name: 'Prompt Enhancer', category: 'ai', description: 'Enhance simple descriptions into descriptive prompts.', icon: 'Hammer', run: async (i) => i, component: AIPromptEnhancerTool },
  { id: 'image-classifier', name: 'Image Classifier', category: 'ai', description: 'Classify visual items of uploaded images.', icon: 'Hammer', run: async (i) => i, component: AIClassifierTool },
  { id: 'text-rewriter', name: 'Text Rewriter', category: 'ai', description: 'Rewrite text into corporate or casual tones.', icon: 'Hammer', run: async (i) => i, component: AITextRewriterTool },
  { id: 'ai-translator', name: 'Translator', category: 'ai', description: 'Translate text arrays locally.', icon: 'Hammer', run: async (i) => i, component: AITranslatorTool },
  { id: 'ai-stt', name: 'Speech-to-Text', category: 'ai', description: 'Transcribe spoken audio inputs locally.', icon: 'Hammer', run: async (i) => i, component: AISpeechToTextTool },
  { id: 'semantic-search', name: 'Semantic Search', category: 'ai', description: 'Search local indexes using similarity matching.', icon: 'Hammer', run: async (i) => i, component: AISemanticSearchTool },
  { id: 'ai-code-explainer', name: 'AI Code Explainer', category: 'ai', description: 'Paste code to get plain-English explanations, complexity score, and translation.', icon: 'Hammer', run: async (i) => i, component: AICodeExplainerTool },
  { id: 'ai-flashcard-maker', name: 'AI Flashcard Maker', category: 'ai', description: 'Turn any text/topic into Q&A flashcards for studying.', icon: 'Hammer', run: async (i) => i, component: AIFlashcardMakerTool },
  { id: 'ai-sentiment-journal', name: 'AI Sentiment Journal', category: 'ai', description: 'Write journal entries and have AI track mood and emotion trends.', icon: 'Hammer', run: async (i) => i, component: AISentimentJournalTool },
  { id: 'ai-email-composer', name: 'AI Email Composer', category: 'ai', description: 'Generate professional emails from bullet points or intent.', icon: 'Hammer', run: async (i) => i, component: AIEmailComposerTool },
  { id: 'ai-story-generator', name: 'AI Story Generator', category: 'ai', description: 'Generate short stories from genre/character/setting prompts.', icon: 'Hammer', run: async (i) => i, component: AIStoryGeneratorTool },
  { id: 'ai-debate-assistant', name: 'AI Debate Assistant', category: 'ai', description: 'Given a topic, generate pro/con arguments and rebuttals.', icon: 'Hammer', run: async (i) => i, component: AIDebateAssistantTool },
  { id: 'ai-math-solver', name: 'AI Math Solver', category: 'ai', description: 'Paste math problems and get step-by-step solutions.', icon: 'Hammer', run: async (i) => i, component: AIMathSolverTool },
  { id: 'ai-recipe-generator', name: 'AI Recipe Generator', category: 'ai', description: 'Ingredients in → full recipe with steps, nutrition, and variants.', icon: 'Hammer', run: async (i) => i, component: AIRecipeGeneratorTool },
  { id: 'ai-code-reviewer', name: 'AI Code Reviewer', category: 'ai', description: 'Review code for bugs, security issues, and best practices.', icon: 'Hammer', run: async (i) => i, component: AICodeReviewerTool },
  { id: 'ai-mind-mapper', name: 'AI Mind Mapper', category: 'ai', description: 'Turn a topic into a visual text-based mind map outline.', icon: 'Hammer', run: async (i) => i, component: AIMindMapperTool },
  { id: 'domo-agent-hub', name: 'Domo Agent Hub', category: 'ai', description: 'Interactive offline coding IDE & AI agent workspace.', icon: 'Hammer', run: async (i) => i, component: AIDomoAgentHub },
  { id: 'domo-selection', name: 'DomoDomo Selection Explainer', category: 'ai', description: 'Highlight text or code to query DomoDomo offline.', icon: 'Hammer', run: async (i) => i, component: AIDomoSelection }
];

export const getToolById = (id: string): Tool | undefined => {
  return TOOLS.find((t) => t.id === id);
};
