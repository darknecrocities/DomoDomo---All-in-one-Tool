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
import { TemplateStudioTool } from '../tools/photo/TemplateStudio';

// Security Suite Imports
import { FileHashCheckerTool } from '../tools/security/FileHashChecker';
import { PasswordAnalyzerTool } from '../tools/security/PasswordAnalyzer';
import { MetadataCleanerTool } from '../tools/security/MetadataCleaner';
import { ExifViewerTool } from '../tools/security/ExifViewer';
import { URLAnalyzerTool } from '../tools/security/URLAnalyzer';
import { FileEncryptionTool } from '../tools/security/FileEncryption';
import { FileShredderTool } from '../tools/security/FileShredder';
import { QRSecurityTool } from '../tools/security/QRSecurity';
import { NetworkScannerTool } from '../tools/security/NetworkScanner';
import { PhishingDetectorTool } from '../tools/security/PhishingDetector';

import { AICodeAuditorTool } from '../tools/security/ai/AICodeAuditor';
import { AILogAnalyzerTool } from '../tools/security/ai/AILogAnalyzer';
import { AIMalwareAnalyzerTool } from '../tools/security/ai/AIMalwareAnalyzer';
import { AIPhishingAnalyzerTool } from '../tools/security/ai/AIPhishingAnalyzer';
import { AIThreatIntelTool } from '../tools/security/ai/AIThreatIntel';
import { AIUrlInvestigationTool } from '../tools/security/ai/AIUrlInvestigation';
import { AIFileReputationTool } from '../tools/security/ai/AIFileReputation';
import { AIReverseEngineeringTool } from '../tools/security/ai/AIReverseEngineering';
import { AIDeepfakeDetectionTool } from '../tools/security/ai/AIDeepfakeDetection';
import { AIIncidentReportTool } from '../tools/security/ai/AIIncidentReport';

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
import { JSONVisualizerTool } from '../tools/dev/JSONVisualizer';
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
import { SQLWorkbenchTool } from '../tools/dev/SQLWorkbench';
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
import { AIDomoModelLibrary } from '../tools/ai/AIDomoModelLibrary';
import { DomoSkillCreatorTool } from '../tools/ai/DomoSkillCreator';
import { AutoPilotWorkspace } from '../tools/autopilot/AutoPilotWorkspace';
import { ModelMigrator } from '../tools/ai/ModelMigrator';
import { DomoBrainControlCenter } from '../tools/ai/DomoBrainControlCenter';
import { DomoMindMapperTool } from '../tools/ai/DomoMindMapper';

// Data & Visualizer Tools Imports
import { JSONChartBuilderTool } from '../tools/data/JSONChartBuilder';
import { CSVPivotAnalyzerTool } from '../tools/data/CSVPivotAnalyzer';
import { CSSKeyframeAnimatorTool } from '../tools/data/CSSKeyframeAnimator';
import { LogPatternAnalyzerTool } from '../tools/data/LogPatternAnalyzer';
import { ERSchemaDesignerTool } from '../tools/data/ERSchemaDesigner';
import { SVGPathInspectorTool } from '../tools/data/SVGPathInspector';
import { RegexDataExtractorTool } from '../tools/data/RegexDataExtractor';
import { FlowchartMindmapMakerTool } from '../tools/data/FlowchartMindmapMaker';
import { CSSGridBuilderTool } from '../tools/data/CSSGridBuilder';
import { DataPrivacyAnonymizerTool } from '../tools/data/DataPrivacyAnonymizer';


export const TOOLS: Tool[] = [
  // Photo Tools (10)
  { id: 'background-remover', name: 'Background Remover', category: 'photo', description: 'Remove background from image free online — no sign up required. Use chroma key, manual eraser, or trace lasso to isolate subjects with transparent PNG export.', icon: 'Image', seoTitle: 'Remove Background from Image Free Online | DomoDomo', keywords: 'remove background, background remover, remove bg, transparent background, background eraser online', run: async (i) => i, component: BackgroundRemoverTool },
  { id: 'image-resizer', name: 'Image Resizer', category: 'photo', description: 'Resize images online free to exact pixel dimensions. Supports bulk resize, aspect ratio lock, and instant download — no upload to any server.', icon: 'Image', seoTitle: 'Resize Image Online Free — Exact Pixel Dimensions | DomoDomo', keywords: 'resize image online, image resizer, resize photo, change image size', run: async (i) => i, component: ImageResizerTool },
  { id: 'image-compressor', name: 'Image Compressor', category: 'photo', description: 'Compress images online free without losing quality. Reduce JPEG, PNG, and WebP file sizes by up to 80% with real-time preview — runs 100% in your browser.', icon: 'Image', seoTitle: 'Compress Images Online Free Without Losing Quality | DomoDomo', keywords: 'compress image, image compressor, reduce image size, compress jpeg, compress png', run: async (i) => i, component: ImageCompressorTool },
  { id: 'crop-rotate', name: 'Crop & Rotate Tool', category: 'photo', description: 'Crop or rotate photos to standard ratios.', icon: 'Image', run: async (i) => i, component: CropRotateTool },
  { id: 'ai-enhancer', name: 'AI Image Enhancer', category: 'photo', description: 'Enhance details using local contrast and color filters.', icon: 'Image', run: async (i) => i, component: AIImageEnhancerTool },
  { id: 'watermark-tool', name: 'Watermark Tool', category: 'photo', description: 'Add logo or text watermarks overlay onto photos.', icon: 'Image', run: async (i) => i, component: WatermarkTool },
  { id: 'image-upscaler', name: 'Image Upscaler', category: 'photo', description: 'Upscale dimensions using canvas bicubic interpolation.', icon: 'Image', run: async (i) => i, component: ImageUpscalerTool },
  { id: 'palette-extractor', name: 'Color Palette Extractor', category: 'photo', description: 'Extract key color swatches and hex codes.', icon: 'Image', run: async (i) => i, component: ColorPaletteExtractorTool },
  { id: 'collage-maker', name: 'Collage Maker', category: 'photo', description: 'Combine multiple images in editable canvas grids.', icon: 'Image', run: async (i) => i, component: CollageMakerTool },
  { id: 'format-converter', name: 'Format Converter', category: 'photo', description: 'Convert images between JPG, PNG, WebP, BMP, and GIF formats free online. Batch convert with quality control — 100% local processing.', icon: 'Image', seoTitle: 'Convert Image Format Free Online — JPG PNG WebP | DomoDomo', keywords: 'convert image format, jpg to png, png to jpg, webp converter, image converter online free', run: async (i) => i, component: FormatConverterTool },
  { id: 'template-studio', name: 'Template Studio', category: 'photo', description: 'Create and fill reusable branded image templates with text.', icon: 'LayoutTemplate', run: async (i) => i, component: TemplateStudioTool },

  // PDF Tools (10)
  { id: 'pdf-merge', name: 'Merge PDFs', category: 'pdf', description: 'Merge PDF files online free — no watermark, no file limit. Combine multiple PDFs into one document instantly in your browser without uploading to any server.', icon: 'FileText', seoTitle: 'Merge PDF Files Online Free — No Watermark | DomoDomo', keywords: 'merge pdf, combine pdf, merge pdf files online free, join pdf, pdf merger', run: async (i) => i, component: PDFMergeTool },
  { id: 'pdf-split', name: 'Split PDF', category: 'pdf', description: 'Extract pages from a PDF document into separate files.', icon: 'FileText', run: async (i) => i, component: PDFSplitTool },
  { id: 'pdf-compress', name: 'Compress PDF', category: 'pdf', description: 'Compress PDF file size online free without losing quality. Reduce PDF size by up to 70% using structural optimization — no upload, 100% private.', icon: 'FileText', seoTitle: 'Compress PDF File Size Free Online | DomoDomo', keywords: 'compress pdf, reduce pdf size, pdf compressor, shrink pdf, compress pdf online free', run: async (i) => i, component: PDFCompressTool },
  { id: 'pdf-to-img', name: 'PDF → Image', category: 'pdf', description: 'Convert PDF to image online free. Export each PDF page as a high-resolution PNG or JPG — perfect for presentations and social media sharing.', icon: 'FileText', seoTitle: 'Convert PDF to Image Free Online — PNG JPG | DomoDomo', keywords: 'pdf to image, pdf to png, pdf to jpg, convert pdf to image online free', run: async (i) => i, component: PDFToImageTool },
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
  { id: 'ocr-scanner', name: 'OCR Scanner', category: 'document', description: 'OCR scanner online free — extract text from images and scanned documents using Tesseract.js. Supports 100+ languages, runs 100% locally.', icon: 'FileText', seoTitle: 'Free OCR Scanner Online — Extract Text from Image | DomoDomo', keywords: 'ocr scanner, extract text from image, image to text, ocr online free', run: async (i) => i, component: OCRScannerTool },
  { id: 'resume-builder', name: 'Resume Builder', category: 'document', description: 'Free resume builder online — create professional resumes instantly with clean templates. No sign up, no watermark, export to PDF or TXT.', icon: 'FileText', seoTitle: 'Free Resume Builder Online — No Sign Up | DomoDomo', keywords: 'resume builder, cv builder, resume maker free, create resume online', run: async (i) => i, component: ResumeBuilderTool },
  { id: 'invoice-gen', name: 'Invoice Generator', category: 'document', description: 'Formulator for corporate invoice templates.', icon: 'FileText', run: async (i) => i, component: InvoiceGeneratorTool },
  // Security Tools (10 Standard)
  { id: 'hash-checker', name: 'File Hash Checker', category: 'security', description: 'Verify file integrity using SHA-256, SHA-512, MD5 locally.', icon: 'ShieldAlert', run: async (i) => i, component: FileHashCheckerTool },
  { id: 'password-analyzer', name: 'Password Analyzer', category: 'security', description: 'Analyze password strength, entropy, and dictionary matches offline.', icon: 'Lock', run: async (i) => i, component: PasswordAnalyzerTool },
  { id: 'metadata-cleaner', name: 'Metadata Cleaner', category: 'security', description: 'Strip hidden EXIF data and metadata from images and PDFs.', icon: 'ShieldAlert', run: async (i) => i, component: MetadataCleanerTool },
  { id: 'exif-viewer', name: 'EXIF Viewer', category: 'security', description: 'Inspect GPS, device, and camera metadata in images for privacy auditing.', icon: 'Search', run: async (i) => i, component: ExifViewerTool },
  { id: 'url-analyzer', name: 'URL Safety Analyzer', category: 'security', description: 'Detect typosquatting, suspicious characters, and homograph attacks.', icon: 'Search', run: async (i) => i, component: URLAnalyzerTool },
  { id: 'file-encryption', name: 'File Encryption Tool', category: 'security', description: 'Encrypt files locally using AES-256 password protection.', icon: 'Lock', run: async (i) => i, component: FileEncryptionTool },
  { id: 'file-shredder', name: 'Secure File Shredder', category: 'security', description: 'Overwrite files multiple times before deletion to prevent recovery.', icon: 'ShieldAlert', run: async (i) => i, component: FileShredderTool },
  { id: 'qr-security', name: 'QR Security Scanner', category: 'security', description: 'Analyze QR codes for hidden URLs and suspicious redirect chains.', icon: 'QrCode', run: async (i) => i, component: QRSecurityTool },
  { id: 'network-scanner', name: 'Local Network Scanner', category: 'security', description: 'Discover connected devices, IP/MAC addresses, and open ports.', icon: 'Globe', run: async (i) => i, component: NetworkScannerTool },
  { id: 'phishing-detector', name: 'Phishing Detector', category: 'security', description: 'Scan emails and URLs using heuristic rule engines for risk scores.', icon: 'ShieldAlert', run: async (i) => i, component: PhishingDetectorTool },
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
  { id: 'qr-generator', name: 'QR Code Generator', category: 'qr', description: 'Generate QR code free online — create custom QR codes for URLs, text, WiFi, vCards, and more. Download as PNG or SVG with color customization.', icon: 'QrCode', seoTitle: 'Free QR Code Generator Online — Custom Colors & Logo | DomoDomo', keywords: 'qr code generator, create qr code, free qr code, make qr code online, custom qr code', run: async (i) => i, component: QRGeneratorTool },
  { id: 'qr-scanner', name: 'QR Scanner', category: 'qr', description: 'Scan QR codes using local browser webcam feed.', icon: 'QrCode', run: async (i) => i, component: QRScannerTool },
  { id: 'wifi-qr', name: 'WiFi QR Generator', category: 'qr', description: 'Generate WiFi QR code free online. Create scannable QR codes that auto-connect guests to your WiFi network — no password sharing needed.', icon: 'QrCode', seoTitle: 'WiFi QR Code Generator Free Online | DomoDomo', keywords: 'wifi qr code, wifi qr generator, share wifi password qr, wifi connect qr', run: async (i) => i, component: WifiQRTool },
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
  { id: 'json-format', name: 'JSON Formatter', category: 'dev', description: 'JSON formatter and validator online free — beautify, minify, and validate JSON data with syntax highlighting, tree view, and error detection.', icon: 'Hammer', seoTitle: 'JSON Formatter & Validator Online Free | DomoDomo', keywords: 'json formatter, json validator, format json, beautify json, json viewer online', run: async (i) => i, component: JSONFormatterTool },
  { id: 'json-visualizer', name: 'JSON Tree Visualizer', category: 'dev', description: 'An interactive tool to explore, collapse, and seamlessly navigate deeply nested JSON structures right in your browser.', icon: 'FileJson', seoTitle: 'JSON Tree Visualizer Online Free | DomoDomo', keywords: 'json visualizer, json tree, json viewer online, interactive json', run: async (i) => i, component: JSONVisualizerTool },
  { id: 'jwt-decode', name: 'JWT Decoder', category: 'dev', description: 'Decode JWT headers and payloads locally with zero data leaks.', icon: 'Hammer', run: async (i) => i, component: JWTDecoderTool },
  { id: 'dev-base64', name: 'Base64 Tool', category: 'dev', description: 'Encode or decode base64 strings.', icon: 'Hammer', run: async (i) => i, component: DevBase64Tool },
  { id: 'regex-tester', name: 'Regex Tester', category: 'dev', description: 'Regex tester online free — test regular expression patterns with real-time matching, group highlighting, and cheat sheet reference.', icon: 'Hammer', seoTitle: 'Regex Tester Online Free — Test Regular Expressions | DomoDomo', keywords: 'regex tester, regular expression tester, regex checker, test regex online', run: async (i) => i, component: RegexTesterTool },
  { id: 'uuid-gen', name: 'UUID Generator', category: 'dev', description: 'Generate unique random UUIDv4 keys.', icon: 'Hammer', run: async (i) => i, component: UUIDGeneratorTool },
  { id: 'hash-gen', name: 'Hash Generator', category: 'dev', description: 'Generate SHA-256 hashes of text strings.', icon: 'Hammer', run: async (i) => i, component: HashGeneratorTool },
  { id: 'api-tester', name: 'API Tester', category: 'dev', description: 'Send request calls to local endpoints.', icon: 'Hammer', run: async (i) => i, component: APITesterTool },
  { id: 'url-encoder', name: 'URL Encoder', category: 'dev', description: 'Encode or decode URL query paths.', icon: 'Hammer', run: async (i) => i, component: URLEncoderTool },
  { id: 'html-minify', name: 'HTML Minifier', category: 'dev', description: 'Minify code lines by stripping tags whitespaces.', icon: 'Hammer', run: async (i) => i, component: HTMLMinifierTool },
  { id: 'color-converter', name: 'Color Converter', category: 'dev', description: 'Convert color hex values to color spaces.', icon: 'Hammer', run: async (i) => i, component: ColorConverterTool },
  { id: 'cron-parser', name: 'Cron Expression Parser', category: 'dev', description: 'Parse cron schedules or generate expressions interactively.', icon: 'Hammer', run: async (i) => i, component: CronParserTool },
  { id: 'sql-formatter', name: 'SQL Formatter', category: 'dev', description: 'Format and beautify SQL queries with custom spacing.', icon: 'Hammer', run: async (i) => i, component: SQLFormatterTool },
  { id: 'sql-workbench', name: 'SQL Workbench & Data Analyzer', category: 'dev', description: 'Run SQLite queries locally on your JSON and CSV files and build visual charts in-browser.', icon: 'Database', seoTitle: 'Local SQL Query Workbench & Data Analyzer Online | DomoDomo', keywords: 'sql workbench, local sql runner, sqlite query browser, csv sql query online, browser database tool', run: async (i) => i, component: SQLWorkbenchTool },
  { id: 'yaml-json', name: 'YAML ↔ JSON Converter', category: 'dev', description: 'Convert configuration structures between YAML and JSON.', icon: 'Hammer', run: async (i) => i, component: YamlJsonConverterTool },
  { id: 'md-table-gen', name: 'Markdown Table Generator', category: 'dev', description: 'Interactive layout to design and generate Markdown tables.', icon: 'Hammer', run: async (i) => i, component: MarkdownTableGeneratorTool },
  { id: 'diff-checker', name: 'Diff Checker', category: 'dev', description: 'Diff checker online free — compare two texts side-by-side to highlight differences. Find changes between code versions, documents, and configs.', icon: 'Hammer', seoTitle: 'Diff Checker Online Free — Compare Text & Code | DomoDomo', keywords: 'diff checker, compare text, text diff, code diff, find differences', run: async (i) => i, component: DiffCheckerTool },
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
  { id: 'domo-selection', name: 'DomoDomo Selection Explainer', category: 'ai', description: 'Highlight text or code to query DomoDomo offline.', icon: 'Hammer', run: async (i) => i, component: AIDomoSelection },
  { id: 'domo-local-brain', name: 'Domo Local Brain', category: 'ai', description: 'Manage your unified local database (RAG) and configure AI habit-learning settings.', icon: 'Brain', run: async (i) => i, component: DomoBrainControlCenter },
  { id: 'domo-cognitive-mapper', name: 'Domo Brain Mind Mapper', category: 'ai', description: 'Explore the interconnecting neural network of Domo\'s mind. Interact, search, and manage skills, knowledge bases, recent activities, and system tools in 3D.', icon: 'Brain', run: async (i) => i, component: DomoMindMapperTool },
  { id: 'ollama-library', name: 'Domo Model Library', category: 'ai', description: 'Browse, compare, and install local AI models (Llama 3.2, Qwen 2.5, Gemma 2, Llava) with system recommendations and live download indicators.', icon: 'Hammer', run: async (i) => i, component: AIDomoModelLibrary },
  { id: 'domo-skill-creator', name: 'Domo Skill Creator', category: 'ai', description: 'Design structured capabilities, restrictions, and behaviors to import into your local AI agents visually.', icon: 'Hammer', run: async (i) => i, component: DomoSkillCreatorTool },
  { id: 'auto-pilot', name: 'Auto-Pilot Workspace', category: 'ai', description: 'Fully autonomous AI agent that executes workflows via voice.', icon: 'Cpu', run: async (i) => i, component: AutoPilotWorkspace },
  { id: 'model-migrator', name: 'Ollama Model Migrator', category: 'ai', description: 'Back up your local Ollama models, write them to external USB or HDD directories, and restore them offline.', icon: 'HardDrive', run: async (i) => i, component: ModelMigrator },

  // Data & Visualizer Suite Tools (10)
  { id: 'json-chart-builder', name: 'JSON Chart Builder', category: 'data', description: 'Paste JSON data arrays, auto-detect variables, and render line, bar, pie, or radar charts using clean SVG vector designs.', icon: 'Hammer', run: async (i) => i, component: JSONChartBuilderTool },
  { id: 'csv-pivot-analyzer', name: 'CSV Pivot Table Analyzer', category: 'data', description: 'Interactive dashboard to parse CSV spreadsheets and construct flexible tabular pivot reports locally.', icon: 'Hammer', run: async (i) => i, component: CSVPivotAnalyzerTool },
  { id: 'css-keyframe-animator', name: 'Visual CSS Keyframe Animator', category: 'data', description: 'Timeline-based editor for CSS keyframe animations. Edit transform steps, adjust ease vectors, and copy CSS values.', icon: 'Hammer', run: async (i) => i, component: CSSKeyframeAnimatorTool },
  { id: 'log-pattern-analyzer', name: 'Log Pattern & Analysis Dashboard', category: 'data', description: 'Paste console outputs or web server log logs, map status codes, and analyze traffic metrics.', icon: 'Hammer', run: async (i) => i, component: LogPatternAnalyzerTool },
  { id: 'er-schema-designer', name: 'Interactive ER Schema Designer', category: 'data', description: 'Canvas-based entity-relationship database modeler. Draw tables, define foreign keys, and export SQL scripts.', icon: 'Hammer', run: async (i) => i, component: ERSchemaDesignerTool },
  { id: 'svg-path-inspector', name: 'SVG Vector Path Inspector', category: 'data', description: 'Interactive SVG path editor. Edit path coordinates, adjust curve angles, and download vector markup.', icon: 'Hammer', run: async (i) => i, component: SVGPathInspectorTool },
  { id: 'regex-data-extractor', name: 'Regex Data Extractor & Table Builder', category: 'data', description: 'Extract match groups from raw text using regular expressions and export structured tabular CSV reports.', icon: 'Hammer', run: async (i) => i, component: RegexDataExtractorTool },
  { id: 'flowchart-mindmap-maker', name: 'Interactive Flowchart & Mind Map Maker', category: 'data', description: 'Compile structured bullet tree outlines into organized responsive mindmaps and SVG flowcharts.', icon: 'Hammer', run: async (i) => i, component: FlowchartMindmapMakerTool },
  { id: 'css-grid-builder', name: 'CSS Grid Template Builder', category: 'data', description: 'Visual editor for responsive CSS Grids. Configure rows and columns, select grid cells, and copy grid layouts.', icon: 'Hammer', run: async (i) => i, component: CSSGridBuilderTool },
  { id: 'data-privacy-anonymizer', name: 'Data Masker & Privacy Anonymizer', category: 'data', description: 'Strip PII identifiers from JSON/CSV files. Apply masking, hashing, or mock replacements to database keys.', icon: 'Hammer', run: async (i) => i, component: DataPrivacyAnonymizerTool },

  // DomoGuard AI Security Tools
  { id: 'ai-code-auditor', name: 'DomoGuard Code Auditor', category: 'security', description: 'AI finds hardcoded secrets, SQLi, and XSS in developer projects.', icon: 'Code', run: async (i) => i, component: AICodeAuditorTool },
  { id: 'ai-log-analyzer', name: 'DomoGuard Log Analyzer', category: 'security', description: 'AI reviews server logs to explain brute force attempts and compromises.', icon: 'Search', run: async (i) => i, component: AILogAnalyzerTool },
  { id: 'ai-malware-analyzer', name: 'DomoGuard Malware Analyzer', category: 'security', description: 'AI explains suspicious files, scripts, and source code behavior.', icon: 'ShieldAlert', run: async (i) => i, component: AIMalwareAnalyzerTool },
  { id: 'ai-phishing-analyzer', name: 'DomoGuard Phishing Analyzer', category: 'security', description: 'AI detects social engineering, urgency manipulation, and credential theft.', icon: 'ShieldAlert', run: async (i) => i, component: AIPhishingAnalyzerTool },
  { id: 'ai-threat-intel', name: 'DomoGuard Threat Intel', category: 'security', description: 'Offline AI assistant with RAG database for CVEs and ransomware behavior.', icon: 'Cpu', run: async (i) => i, component: AIThreatIntelTool },
  { id: 'ai-url-investigation', name: 'DomoGuard URL Investigation', category: 'security', description: 'AI checks URL structure for brand impersonation and encoded payloads.', icon: 'Globe', run: async (i) => i, component: AIUrlInvestigationTool },
  { id: 'ai-file-reputation', name: 'DomoGuard File Reputation', category: 'security', description: 'AI summarizes findings from extracted strings and metadata in executables.', icon: 'ShieldAlert', run: async (i) => i, component: AIFileReputationTool },
  { id: 'ai-reverse-engineering', name: 'DomoGuard Reverse Engineering', category: 'security', description: 'AI explains decompiled functions and assembly for cybersecurity students.', icon: 'Code', run: async (i) => i, component: AIReverseEngineeringTool },
  { id: 'ai-deepfake-detection', name: 'DomoGuard Deepfake Detection', category: 'security', description: 'Local image analysis to detect AI-generated artifacts and inconsistencies.', icon: 'Image', run: async (i) => i, component: AIDeepfakeDetectionTool },
  { id: 'ai-incident-report', name: 'DomoGuard Incident Report', category: 'security', description: 'AI generates SOC executive summaries and IOCs from logs and findings.', icon: 'FileText', run: async (i) => i, component: AIIncidentReportTool }
];

export const getToolById = (id: string): Tool | undefined => {
  return TOOLS.find((t) => t.id === id);
};
