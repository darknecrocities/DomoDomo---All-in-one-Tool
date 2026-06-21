import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Cpu, Shield, Terminal, Settings, GitBranch, Lock, Server, Layers } from 'lucide-react';

type SectionId = 'intro' | 'sys-archi' | 'offline-flow' | 'tools-ref' | 'setup-guide' | 'core-engines' | 'compliance';
type ToolCategory = 'pdf' | 'photo' | 'document' | 'converter' | 'qr' | 'video' | 'audio' | 'dev' | 'ai';

interface ToolDoc {
  id: string;
  name: string;
  engine: string;
  details: string;
  functionality: string;
  howItWorks: string;
}

const TOOLS_DOCS: Record<ToolCategory, { title: string; desc: string; list: ToolDoc[] }> = {
  pdf: {
    title: 'PDF Document Suite',
    desc: 'Local browser compilation of vector documents, overlays, signature drawing, and text manipulation.',
    list: [
      {
        id: 'pdf-text-edit',
        name: 'Edit PDF Text',
        engine: 'PDF.js + Canvas2D Layering',
        details: 'Leverages PDF.js core library to parse font glyph maps and text position coordinates. Renders a high-fidelity interaction canvas where text strings are overlaid with editable input blocks, compiling output edits back into standard PDF stream updates via incremental catalog revisions.',
        functionality: 'Inline text editing, position detection, visual bounding boxes, font mapping overrides, and incremental PDF output saving.',
        howItWorks: 'Reads the PDF structure, renders vector elements on a transparent interaction canvas, matches click coordinates to glyph map objects, displays input boxes, and serializes the modified document structure to an ArrayBuffer.'
      },
      {
        id: 'pdf-merge',
        name: 'Merge PDFs',
        engine: 'pdf-lib (WASM Compiler)',
        details: 'Ingests multiple document ArrayBuffers, mapping and copying page dictionaries, cross-reference tables, and font resources into a unified binary structure. Re-builds the object tree under a single PDF catalog writer entirely client-side.',
        functionality: 'Multi-file uploading, page order drag-and-drop sorting, custom range merging, and metadata inheritance configuration.',
        howItWorks: 'Uses pdf-lib to read files as byte streams, instances a new PDF document, clones the selected pages with their resource dictionaries (fonts, XObjects, Annotations), and serializes the combined output.'
      },
      {
        id: 'pdf-split',
        name: 'Split PDF',
        engine: 'pdf-lib (WASM Compiler)',
        details: 'Parses the document\'s catalog hierarchy and cross-reference table. Creates a clean, empty document container and clones specific pages with their resource dictionaries (fonts, XObjects) before writing a serialized PDF byte stream.',
        functionality: 'Visual page thumbnail selection, page ranges splitting, single-page extraction, and batch extraction into multiple individual documents.',
        howItWorks: 'Parses the catalog tree of pages, extracts the target indices, copies references to dependent fonts and media assets, and exports separate PDF binaries using pdf-lib.'
      },
      {
        id: 'pdf-compress',
        name: 'Compress PDF',
        engine: 'pdf-lib Optimization API',
        details: 'Locates resource streams in the object table, traversing image streams to downsample high-resolution raster objects and running standard deflate compression on text streams while stripping redundant XML metadata and creator attributes.',
        functionality: 'Quality percentage sliders, color space downsampling (e.g. RGB to grayscale), metadata stripping, and deflate stream optimization.',
        howItWorks: 'Traverses the PDF Object Map, extracts inline images, passes them through a compressed canvas renderer to downscale dimensions/quality, rewrites the object streams, and re-compiles the file.'
      },
      {
        id: 'pdf-to-img',
        name: 'PDF → Image',
        engine: 'PDF.js Render Target',
        details: 'Executes PDF page rasterization by compiling page operators into standard 2D canvas drawing sequences at custom device-pixel-ratio scales, yielding clean base64 data URLs in PNG or JPEG format.',
        functionality: 'High-DPI rendering, format selection (PNG/JPEG/WebP), page range selection, and packaging multiple images into a ZIP archive.',
        howItWorks: 'Invokes PDF.js inside a local worker thread, draws the text and vector graphics of each page onto an OffscreenCanvas, and captures the canvas frames using toBlob.'
      },
      {
        id: 'img-to-pdf',
        name: 'Image → PDF',
        engine: 'pdf-lib Image Embedder',
        details: 'Decodes raw image headers to match dimensions, instantiates a new PDF catalog structure, registers the image stream as a page content resource, and draws the bounding box on the graphics context.',
        functionality: 'Multi-image upload, page orientation selection (portrait/landscape), padding adjusters, and drag-and-drop ordering.',
        howItWorks: 'Reads images as ArrayBuffers, uses pdf-lib to embed JPEG/PNG payloads, wraps them in a page container matching image aspect ratio, and serializes the PDF.'
      },
      {
        id: 'pdf-watermark',
        name: 'Add Watermark',
        engine: 'pdf-lib Text overlays',
        details: 'Parses page dimensions, injects a standard translucent font state matrix, and appends a text draw operator stream directly at calculated relative coordinates without modifying underlying document layers.',
        functionality: 'Text and image watermarking, opacity controls, rotation handles, font sizing, and grid tiled positioning.',
        howItWorks: 'Appends a content stream to each page containing graphics state operators (gs) for transparency, font references, and text placement operators (Tj/TJ).'
      },
      {
        id: 'pdf-sign',
        name: 'Sign PDF',
        engine: 'pdf-lib Graphics Context',
        details: 'Captures mouse or touch coordinates on an HTML5 canvas to produce a vector stroke path, converting coordinates into a standard PDF path description and drawing the vector overlay directly onto the target page stream.',
        functionality: 'Draw-to-sign pad, signature upload, drag-and-resize placement on page, multi-page signing, and stroke thickness customizers.',
        howItWorks: 'Converts mouse/touch canvas drawings into PNG blobs, embeds them in pdf-lib as XObjects, and overlays the XObject onto selected coordinates of the page stream.'
      },
      {
        id: 'pdf-protect',
        name: 'Protect PDF',
        engine: 'pdf-lib Encryption Standard',
        details: 'Applies client-side security algorithms to encrypt the PDF document structure. Sets permission bitmasks to block printing, copying, or modifying, and formats standard user/owner challenge strings in the trailer.',
        functionality: 'Password encryption (user/owner password), permissions configurations (print, copy, edit), and RC4 or AES-128 cryptographic hashing.',
        howItWorks: 'Re-hashes PDF body objects using RC4 or AES algorithms based on the provided password and updates the trailer dictionaries with standard /Encrypt specifications.'
      },
      {
        id: 'pdf-ocr',
        name: 'Extract Text (OCR)',
        engine: 'PDF.js Text Content Parser',
        details: 'Processes page text streams, resolving font maps, spacing arrays, and carriage return operators to extract clean, ordered plain-text strings directly from vector streams without external API requests.',
        functionality: 'Page range text parsing, layout preserving text flow, structured OCR output, and CSV/TXT exports.',
        howItWorks: 'Uses PDF.js\'s getTextContent API to extract text segments, reconstructs paragraph lines based on absolute screen coordinates (x, y), and joins them using logical line breaks.'
      }
    ]
  },
  photo: {
    title: 'Photo & Image Suite',
    desc: 'Client-side raster image filtering, transformations, background removal, and dimension adjustments.',
    list: [
      {
        id: 'background-remover',
        name: 'Background Remover',
        engine: 'Canvas2D + Color Distance Analytics',
        details: 'Extracts raw RGBA pixel matrices from an image, executing color distance formulas (e.g. Delta E) on target chroma boundaries to dynamically inject zero-alpha transparency values into matching background pixel coordinates.',
        functionality: 'Color picker selection, tolerance adjustment sliders, feathering borders, and instant transparent PNG export.',
        howItWorks: 'Draws the image onto an HTML5 Canvas, loops over the 1D ImageData array in steps of 4 (RGBA), calculates Euclidean distance to the key color, applies a threshold function, and sets alpha to 0 for matching pixels.'
      },
      {
        id: 'image-resizer',
        name: 'Image Resizer',
        engine: 'Canvas Scaling (Lanczos/Bilinear)',
        details: 'Draws source images onto an OffscreenCanvas container configured with target dimensions, utilizing bilinear or bicubic interpolation algorithms in browser rendering engines to prevent aliasing artifacts.',
        functionality: 'Custom width/height scaling, aspect ratio locking, percent adjustments, and instant format exports.',
        howItWorks: 'Uses canvas.drawImage with specified destination bounds. The browser\'s internal GPU rasterizer automatically runs high-quality scaling filters to map pixels.'
      },
      {
        id: 'image-compressor',
        name: 'Image Compressor',
        engine: 'Canvas JPEG/WebP Quantization',
        details: 'Extracts raw CanvasImageData, executing discrete cosine transforms (DCT) and quantization matrices using configured quality indices, and encodes the output into compressed JPEG or WebP data blobs.',
        functionality: 'Visual file size estimator, live comparison sliders, customizable quality presets, and multi-file batch downloads.',
        howItWorks: 'Renders the source asset to canvas, executes canvas.toBlob(callback, "image/jpeg", quality) at a specified float value, and compares output byte sizes in real-time.'
      },
      {
        id: 'crop-rotate',
        name: 'Crop & Rotate Tool',
        engine: 'Canvas 2D Transform Matrices',
        details: 'Applies affine translation, rotation, and clipping matrices to a CanvasRenderingContext2D canvas, then draws the cropped section from pixel coordinate bounds to yield a newly oriented asset.',
        functionality: 'Preset ratio cropping (1:1, 16:9, 4:3), freeform handles, 90-degree rotations, and horizontal/vertical flips.',
        howItWorks: 'Manipulates the context transform matrix (translate, rotate, scale), draws the image at offset coordinates, and copies the bounding box pixels via getImageData.'
      },
      {
        id: 'ai-enhancer',
        name: 'AI Image Enhancer',
        engine: 'Canvas ImageData Filter Kernels',
        details: 'Applies multi-pass digital filters including contrast stretching, gamma adjustments, and customized pixel-convolution kernels to optimize sharpness, brightness, and color balance directly in-memory.',
        functionality: 'Auto-contrast enhancement, brightness/saturation sliders, sharpening kernels, and noise reduction filters.',
        howItWorks: 'Applies convolution matrices (e.g. Sobel, Gaussian blur, Laplacian sharpen) to target pixels, re-computing each pixel value as a weighted sum of its neighbors.'
      },
      {
        id: 'watermark-tool',
        name: 'Watermark Tool',
        engine: 'Canvas Layering & Compositing',
        details: 'Uses globalAlpha composite operations to draw logo PNGs or custom text strings onto a baseline image matrix, matching target dimensions and position vectors before compiling to an output blob.',
        functionality: 'Text & logo overlays, opacity sliders, position grids (corners, center, tiles), and font styling options.',
        howItWorks: 'Draws the base image to canvas, sets ctx.globalAlpha to a custom float, draws text/image overlays using coordinate transformations, and saves as a PNG.'
      },
      {
        id: 'image-upscaler',
        name: 'Image Upscaler',
        engine: 'Canvas Bilinear Interpolation',
        details: 'Iterates image scale increments using OffscreenCanvas, mapping target dimensions with interpolation filters and color adjustments to construct smooth upscaled outputs.',
        functionality: 'Upscaling by 2x or 4x, edge smoothing, noise suppression, and high-fidelity asset rendering.',
        howItWorks: 'Performs multi-step scaling on helper canvases, applying subtle sharpening convolutions between steps to mitigate the blurry effects of bilinear interpolation.'
      },
      {
        id: 'palette-extractor',
        name: 'Color Palette Extractor',
        engine: 'Canvas Pixel Quantization (Median Cut)',
        details: 'Samples pixel clusters, executing a median-cut color quantization algorithm to isolate color spaces and identify dominant hex codes, outputting a curated palette array.',
        functionality: 'Palette depth control (5-10 colors), color swatch copy-to-clipboard, contrast score checks, and palette CSS exports.',
        howItWorks: 'Reads ImageData, filters out transparent/background pixels, groups remaining colors into a 3D RGB color space box, splits the box at median coordinates, and averages the results.'
      },
      {
        id: 'collage-maker',
        name: 'Collage Maker',
        engine: 'Canvas Grid Compositing',
        details: 'Calculates layout bounds based on template files, draws multiple input image structures onto relative sub-rectangles, and applies customizable borders, margins, and padding offsets.',
        functionality: 'Grid templates, layout margins, background color pickers, and drag-to-swap image zones.',
        howItWorks: 'Computes a matrix of coordinate bounding boxes based on the selected grid layout, and draws each selected file onto its specific canvas clipping boundary.'
      },
      {
        id: 'format-converter',
        name: 'Format Converter',
        engine: 'Canvas toBlob Serialization',
        details: 'Loads input files into a browser Image element, draws the element to canvas context, and serializes the binary content into PNG, JPEG, WebP, or AVIF formats using specific MIME parameters.',
        functionality: 'Supported formats: PNG, JPG, WebP, ICO, AVIF; bulk queue operations; metadata retention toggles.',
        howItWorks: 'Uses URL.createObjectURL to load the file, draws it onto an OffscreenCanvas, and outputs a formatted blob by invoking canvas.toBlob with target MIME strings.'
      }
    ]
  },
  document: {
    title: 'Document Suite',
    desc: 'Local text editors, document template generators, academic citations, and dictionaries.',
    list: [
      {
        id: 'rich-text',
        name: 'Rich Text Editor',
        engine: 'HTML5 contentEditable API + DOM Compiler',
        details: 'Manages custom styling ranges using document selection ranges, rendering styled DOM nodes in real-time and exporting results as styled CSS-inline HTML, raw TXT, or PDF layouts.',
        functionality: 'Text formatting (bold, italic, lists), heading structures, font styles, custom alignment, and HTML/PDF exporting.',
        howItWorks: 'Interacts with the browser\'s Selection and Range APIs, executes document formatting commands, and compiles styling into clean HTML strings.'
      },
      {
        id: 'markdown-editor',
        name: 'Markdown Editor',
        engine: 'Markdown Parse Compiler',
        details: 'Tokenizes Markdown strings using clean regex parsers, compiling elements like lists, tables, code blocks, and headers into structured HTML strings rendered directly in the editor workspace.',
        functionality: 'Side-by-side preview mode, cheat-sheet helpers, syntax highlighting, table generation, and MD/HTML exports.',
        howItWorks: 'Monitors text area input, tokenizes blocks, maps markdown tokens to standard HTML nodes, and safely renders the HTML output on a preview screen.'
      },
      {
        id: 'ocr-scanner',
        name: 'OCR Scanner',
        engine: 'Tesseract.js WASM Engine',
        details: 'Loads a Tesseract WebAssembly engine inside a Web Worker. Passes rasterized image buffers to run neural OCR character recognition, outputting coordinates and bounding box text structures.',
        functionality: 'Multi-language scanning, text copy overlays, layout preserving parser, and output exports (TXT/PDF).',
        howItWorks: 'Initializes a Web Worker with Tesseract.js, loads trained neural models into browser cache, processes canvas-drawn images, and returns structured text maps.'
      },
      {
        id: 'resume-builder',
        name: 'Resume Builder',
        engine: 'Local Schema Compiler',
        details: 'Binds user form fields into a normalized JSON CV schema, merging data structures with local CSS layouts and rendering printable PDF views via window.print CSS rules.',
        functionality: 'Fields for education/experience/skills, theme select dropdowns, custom layouts, and immediate PDF printing.',
        howItWorks: 'Binds input state variables into a JSON structure, maps fields to CSS-Grid HTML templates, and prints them with styled media queries.'
      },
      {
        id: 'invoice-gen',
        name: 'Invoice Generator',
        engine: 'Local Arithmetic Compiler',
        details: 'Performs float arithmetic calculations on invoice tables, computing line-item sums, tax rates, discounts, and formatting structured receipts ready for local storage saving or printing.',
        functionality: 'Interactive item tables, tax/discount calculator, corporate logo upload, printable template styles, and PDF download.',
        howItWorks: 'Monitors tabular data fields, calculates subtotal aggregates in state, hooks up to print CSS templates, and uses the browser native print driver.'
      },
      {
        id: 'summarizer',
        name: 'Summarizer',
        engine: 'Frequency Heuristic TF-IDF Parser',
        details: 'Tokenizes text into sentences, stripping common stopwords and computing local TF-IDF weights to identify high-importance phrases, compiling a concise summary structure.',
        functionality: 'Summary length sliders, keyword highlights, original-to-summary length ratio metrics, and TXT copying.',
        howItWorks: 'Tokenizes text into words and sentences, counts occurrences, computes TF-IDF scores for sentences, ranks them, and outputs top-ranked sentences.'
      },
      {
        id: 'translator',
        name: 'Translator',
        engine: 'Local Dictionary Mapping',
        details: 'Performs client-side string translations using dictionary mappings, looking up vocabulary and syntactic templates to handle text conversions offline.',
        functionality: 'Multi-language selections, visual alignment, character counts, and clipboard copying.',
        howItWorks: 'Looks up words/phrases inside client-side dictionary JSON packages, applying syntax mappings, and replaces texts recursively.'
      },
      {
        id: 'grammar-fixer',
        name: 'Grammar Fixer',
        engine: 'Regex Match Pattern Engine',
        details: 'Executes multiple regular expressions checking for common grammatical mistakes, double spaces, and capitalization errors, showing highlighting selectors for corrections.',
        functionality: 'Passive voice checkers, double space cleanup, capitalization auto-fix, and diff comparisons.',
        howItWorks: 'Iterates text through pre-configured regular expression matching filters, detects errors, and flags positions with custom css highlights.'
      },
      {
        id: 'citation-gen',
        name: 'Citation Generator',
        engine: 'Citation Format Standardizer',
        details: 'Compiles bibliography entries (APA, MLA, Chicago styles) by mapping input metadata strings to style rules and outputting sorted HTML strings.',
        functionality: 'Supports book/website/journal, APA/MLA/Chicago styles, copy-to-clipboard, and alphabetized listing.',
        howItWorks: 'Validates input strings, interpolates data fields into citation formulas, and renders them in ordered, styled layouts.'
      },
      {
        id: 'code-notes',
        name: 'Code Notes Editor',
        engine: 'DOM Syntax Highlight Parser',
        details: 'Renders dynamic text input with synchronized syntax highlighting overlays, parsing statements and comments into styled span tokens for readability.',
        functionality: 'Syntax highlighting (JS, HTML, CSS), tag categorization, code snippet copying, and local caching.',
        howItWorks: 'Splits code lines into tokens using regex, wraps comments, variables, and keywords in styled spans, and overlays them over a textarea.'
      }
    ]
  },
  converter: {
    title: 'Converter Suite',
    desc: 'File format conversions, e-book compiles, Base64 translations, and ZIP archive extraction.',
    list: [
      {
        id: 'jpg-png',
        name: 'JPG ↔ PNG Converter',
        engine: 'Canvas MIME Serialization',
        details: 'Loads source image data, scales it to an OffscreenCanvas, and compiles the byte arrays using browser-native PNG or JPEG encoders.',
        functionality: 'Bi-directional conversions, quality controls, alpha channel preservation settings, and batch converters.',
        howItWorks: 'Loads files to canvas, invokes toBlob with desired MIME types ("image/png" or "image/jpeg"), and saves as download.'
      },
      {
        id: 'webp-jpg',
        name: 'WebP ↔ JPG Converter',
        engine: 'Canvas MIME Serialization',
        details: 'Converts modern WebP buffers or JPEG containers by running them through canvas context rendering pipelines and exporting targeted file formats.',
        functionality: 'Format toggling, quality percentages, compression efficiency feedback, and fast batch exports.',
        howItWorks: 'Renders WebP images onto canvas, exports to JPEG blob streams via local canvas APIs, and executes a direct download link.'
      },
      {
        id: 'mp4-gif',
        name: 'MP4 ↔ GIF Converter',
        engine: 'FFmpeg WASM Subprocessor',
        details: 'Launches an FFmpeg WASM worker in-browser, parsing video frames into sequence arrays, applying color quantization tables, and assembling standard animated GIF frames.',
        functionality: 'Start/end duration selections, framerate configurations, output size adjustment, and live render progress bars.',
        howItWorks: 'Writes video bytes to FFmpeg WASM virtual filesystem, executes command `ffmpeg -i video.mp4 -vf fps=10,scale=320:-1 out.gif`, and reads output bytes.'
      },
      {
        id: 'mp3-wav',
        name: 'MP3 ↔ WAV Converter',
        engine: 'Web Audio AudioContext',
        details: 'Decodes MP3 binaries to PCM AudioBuffers, instantiates a WAV writer, writes standard RIFF headers, and writes PCM float arrays as 16-bit signed integers.',
        functionality: 'Audio transcoding, sample rate selectors, channel setup (mono/stereo), and download compilation.',
        howItWorks: 'Decodes file bytes via AudioContext.decodeAudioData, iterates channel buffers, translates float arrays to PCM, writes 44-byte headers, and compiles blobs.'
      },
      {
        id: 'csv-json',
        name: 'CSV ↔ JSON Converter',
        engine: 'Structured String Array Parser',
        details: 'Splits CSV tables with regex considering escape quotes, maps column headers to JSON keys, or flattens nested JSON hierarchies back into comma-separated arrays.',
        functionality: 'Delimiter customization, header row selectors, nested object parser, indent spacing controls, and file export options.',
        howItWorks: 'Splits string lines, parses headers, groups row columns into objects, and serializes JSON, or flattens JSON arrays by collecting keys.'
      },
      {
        id: 'xml-json',
        name: 'XML ↔ JSON Converter',
        engine: 'Browser DOMParser Engine',
        details: 'Parses XML markup strings into standard XML DOM structures using DOMParser, recursively traversing nodes to compile a corresponding JSON schema.',
        functionality: 'Syntax validating, node attribute parsers, text content selectors, and formatted output saving.',
        howItWorks: 'Invokes browser\'s DOMParser to instantiate an XML Document, traverses nodes recursively to build nested Javascript objects, and stringifies.'
      },
      {
        id: 'docx-txt',
        name: 'DOCX ↔ TXT Converter',
        engine: 'JSZip XML Traverser',
        details: 'Unpacks word document archives, extracts core file content (word/document.xml), and filters out text contents from tag annotations.',
        functionality: 'Unpacks .docx containers, filters text tags, strips XML styling elements, and saves clean plain-text files.',
        howItWorks: 'Reads ZIP archive data, opens XML paths via JSZip, parses document XML nodes, isolates text bodies (`<w:t>`), and merges them.'
      },
      {
        id: 'epub-pdf',
        name: 'EPUB → PDF Converter',
        engine: 'JSZip HTML Compiler',
        details: 'Extracts EPUB container HTML files, processes embedded CSS properties, and formats the text layouts into multi-page PDF documents via pdf-lib.',
        functionality: 'Book chapter parsing, margin customization, font styling selectors, and immediate PDF compilation.',
        howItWorks: 'Extracts HTML chapters using JSZip, renders text flows on offscreen canvases to calculate margins/pages, and builds PDFs using pdf-lib.'
      },
      {
        id: 'base64-tool',
        name: 'Base64 Converter',
        engine: 'FileReader API Binary Serializer',
        details: 'Uses FileReader to read local binary files, compiling them as base64-encoded strings, or decodes them back to binary arrays using standard browser APIs.',
        functionality: 'File-to-Base64 conversion, Base64-to-file reconstruction, data URI wrappers, and copy-to-clipboard buttons.',
        howItWorks: 'Reads files via FileReader.readAsDataURL, and decodes strings using window.atob and Uint8Array mapping to construct download files.'
      },
      {
        id: 'zip-extractor',
        name: 'ZIP Extractor',
        engine: 'JSZip File Decompressor',
        details: 'Parses the central directory header of uploaded ZIP archives, extracting compression properties and writing individual file blobs.',
        functionality: 'Unpacks .zip files, directories list display, individual file downloads, and mass extraction.',
        howItWorks: 'Decodes file structures using JSZip, parses files, inflates compressed bytes, and maps them to download blobs.'
      }
    ]
  },
  qr: {
    title: 'QR & Barcode Suite',
    desc: 'Visual matrix generators, contactless payment codes, WiFi tags, and webcam scanners.',
    list: [
      {
        id: 'qr-generator',
        name: 'QR Code Generator',
        engine: 'qrcode.js Canvas Engine',
        details: 'Generates binary QR matrices (error correction levels L/M/Q/H) from text strings, rendering them on a canvas element.',
        functionality: 'Text/URL inputs, custom background/foreground color pickers, error correction presets, and SVG/PNG exports.',
        howItWorks: 'Transforms string parameters into binary grids with Reed-Solomon error correction, maps grid coordinates, and draws modules onto canvas.'
      },
      {
        id: 'qr-scanner',
        name: 'QR Scanner',
        engine: 'WebRTC Stream + jsQR WASM Decoder',
        details: 'Captures webcam video frames, extracts image pixel matrices, and runs jsQR image processing to locate and decode QR identifiers.',
        functionality: 'Live webcam feed, scan area indicator overlays, decoded URL click triggers, and historical scans logs.',
        howItWorks: 'Initializes WebRTC getUserMedia video streams, draws frames to canvas, extracts pixel arrays, and uses jsQR to identify patterns.'
      },
      {
        id: 'wifi-qr',
        name: 'WiFi QR Generator',
        engine: 'WIFI Credential Format Standardizer',
        details: 'Serializes network parameters to standard protocol text, encoding it into custom-colored QR graphics.',
        functionality: 'SSID configuration, password visibility toggles, encryption type select (WEP, WPA/WPA2), and direct scans verification.',
        howItWorks: 'Formats credentials to protocol text `WIFI:S:SSID;T:WPA;P:PASSWORD;;`, feeding the string to a QR layout generator.'
      },
      {
        id: 'vcard-qr',
        name: 'vCard QR Generator',
        engine: 'vCard Schema Standardizer',
        details: 'Assembles contact details into standard vCard specifications and generates corresponding QR codes.',
        functionality: 'Fields for name, phone, email, company, and address, and output PNG downloads.',
        howItWorks: 'Serializes profile fields into standard contact cards syntax (`BEGIN:VCARD\\nVERSION:3.0\\n...`), rendering QR outputs.'
      },
      {
        id: 'event-qr',
        name: 'Event QR Generator',
        engine: 'iCalendar Standardizer',
        details: 'Converts event details into standard iCalendar configurations, rendering them as QR code matrices.',
        functionality: 'Event name/start/end/location, timezone setup, event summary descriptions, and download options.',
        howItWorks: 'Builds iCal format strings `BEGIN:VEVENT\\nSUMMARY:Name\\n...` and renders them into scannable barcodes.'
      },
      {
        id: 'payment-qr',
        name: 'Payment QR Generator',
        engine: 'Banking QR Protocol Standardizer',
        details: 'Formats transaction details according to global banking QR systems, outputting scannable codes.',
        functionality: 'Bank details, account numbers, routing tags, currency formats, and transaction amount settings.',
        howItWorks: 'Serializes bank routing structures to EMVCo or local protocol formats, encoding them into scannable canvas matrices.'
      },
      {
        id: 'barcode-gen',
        name: 'Barcode Generator',
        engine: 'JsBarcode SVG Engine',
        details: 'Translates input data into Code128, EAN, or UPC barcode representations, drawing clean SVG vectors.',
        functionality: 'Standard code types (Code128, EAN-13, Code39, Pharmacode), size controls, label displays, and SVG copies.',
        howItWorks: 'Processes numeric strings, maps them to barcode patterns, and outputs scalable vector structures.'
      },
      {
        id: 'barcode-scan',
        name: 'Barcode Scanner',
        engine: 'WebRTC Camera + Barcode Detector API',
        details: 'Utilizes native browser BarcodeDetector APIs or WASM libraries to process camera streams and decode barcodes.',
        functionality: 'Webcam code scanning, multi-code formats detection, sound indicators on detection, and clipboard copying.',
        howItWorks: 'Calls browser BarcodeDetector api, loops camera frames, extracts coordinates, and outputs decoded string arrays.'
      },
      {
        id: 'bulk-qr',
        name: 'Bulk QR Generator',
        engine: 'qrcode Batch Engine',
        details: 'Iterates through CSV datasets, compiling separate QR codes in batch and packing them into downloadable ZIP archives.',
        functionality: 'CSV spreadsheet uploads, custom template naming, sizing configs, and batch ZIP archiving.',
        howItWorks: 'Parses rows, generates QR canvas blobs sequentially, adds them to a JSZip archive structure, and compiles ZIP downloads.'
      },
      {
        id: 'qr-designer',
        name: 'QR Designer',
        engine: 'Canvas Custom Styling Compositor',
        details: 'Renders QR code patterns with modern gradient fills, rounded alignment eyes, and overlays logo images in the center.',
        functionality: 'Custom dot shapes (rounded, circles, squares), corner frame shapes, gradient overlay, logo mounting, and high-res PNG downloads.',
        howItWorks: 'Alters canvas drawing processes: replaces squares with arcs, overlays centered images, and clears pixels inside logo areas.'
      }
    ]
  },
  video: {
    title: 'Video Suite',
    desc: 'Local browser video trimming, container changes, subtitles injection, and frame exports.',
    list: [
      {
        id: 'trim-video',
        name: 'Trim Video',
        engine: 'FFmpeg WASM Subprocessor',
        details: 'Instructs FFmpeg WASM to seek target start times and execute copy operations without re-encoding video channels.',
        functionality: 'Visual slider controls, start/end timestamps, fast stream copying, and output MP4 files saving.',
        howItWorks: 'Loads video bytes in FFmpeg WASM memory, runs command `ffmpeg -ss [start] -i input.mp4 -to [end] -c copy output.mp4` and exports output.'
      },
      {
        id: 'compress-video',
        name: 'Compress Video',
        engine: 'FFmpeg WASM Transcoder',
        details: 'Runs FFmpeg WebAssembly to transcode input streams to modern container types (H.264/AAC), adjusting output bitrates.',
        functionality: 'Bitrate sliders, file size estimators, custom resolutions (1080p, 720p, 480p), and progress tracking.',
        howItWorks: 'Pipes file bytes through FFmpeg WASM, executes transcoding commands adjusting CRF/bitrate profiles, and downloads outputs.'
      },
      {
        id: 'merge-videos',
        name: 'Merge Videos',
        engine: 'FFmpeg WASM Concatenator',
        details: 'Generates sequential file listings in FFmpeg WASM space, appending video tracks with matching structures.',
        functionality: 'Multi-video uploads, drag-to-reorder list, fast concatenation, and output exports.',
        howItWorks: 'Mounts video files, builds a list text file, executes `ffmpeg -f concat -safe 0 -i list.txt -c copy merged.mp4`, and compiles outputs.'
      },
      {
        id: 'convert-video',
        name: 'Convert Video',
        engine: 'FFmpeg WASM Container Exporter',
        details: 'Unpacks stream formats in FFmpeg WASM memory, remuxing tracks into MP4, WebM, or MKV containers.',
        functionality: 'Target format dropdowns (MP4, WebM, GIF, MKV), audio parameters toggling, and fast compilation.',
        howItWorks: 'Remuxes files by running FFmpeg container transformation commands, copying streams without re-encoding when possible.'
      },
      {
        id: 'extract-audio',
        name: 'Extract Audio',
        engine: 'FFmpeg WASM Demuxer',
        details: 'Demuxes audio streams from video containers, copying the audio data directly to MP3 or WAV files.',
        functionality: 'Outputs MP3/WAV/AAC formats, sample rate customizers, audio bitrates select, and fast extraction.',
        howItWorks: 'Runs command `ffmpeg -i input.mp4 -vn -acodec libmp3lame output.mp3` on the WebAssembly virtual workspace.'
      },
      {
        id: 'add-subtitles',
        name: 'Add Subtitles',
        engine: 'FFmpeg WASM Subtitle Burner',
        details: 'Burns subtitle strings (SRT or VTT) onto video streams using FFmpeg WASM filtering pipelines.',
        functionality: 'Subtitle file uploads, preview player, burner options, and output compilation.',
        howItWorks: 'Saves subtitle strings locally, executes `ffmpeg -i input.mp4 -vf subtitles=sub.srt output.mp4` using WASM libs.'
      },
      {
        id: 'speed-control',
        name: 'Speed Control',
        engine: 'FFmpeg WASM Filter Engine',
        details: 'Applies video and audio filters to accelerate or slow down video streams without changing pitch.',
        functionality: 'Speed sliders (0.5x to 2x), audio pitch correction toggles, output preview, and downloads.',
        howItWorks: 'Runs FFmpeg filter graphs (`-filter:v setpts=0.5*PTS -filter:a atempo=2.0` for 2x speed) and exports files.'
      },
      {
        id: 'crop-video',
        name: 'Crop Video',
        engine: 'FFmpeg WASM Bounding Box Cropper',
        details: 'Trims video coordinate heights and widths to custom aspect ratios.',
        functionality: 'Visual crop overlays, pre-configured aspect ratios (16:9, 1:1, 9:16), pixel adjusters, and MP4 outputs.',
        howItWorks: 'Processes crop inputs and runs `ffmpeg -i input.mp4 -filter:v crop=w:h:x:y output.mp4` inside the browser sandbox.'
      },
      {
        id: 'gif-maker',
        name: 'GIF Maker',
        engine: 'FFmpeg WASM GIF Encoder',
        details: 'Extracts frame sets, generates custom color palette matrices, and exports animated GIFs.',
        functionality: 'Frames per second adjust, quality presets, custom output scale sizing, and loop configurations.',
        howItWorks: 'Computes optimized color palettes with `palettegen` and compresses sequences into GIF outputs.'
      },
      {
        id: 'thumbnail-gen',
        name: 'Thumbnail Generator',
        engine: 'HTML5 Video Canvas Frame Grabber',
        details: 'Loads video source objects, seeks to targeted frames, and grabs pixel frames onto a canvas canvas.',
        functionality: 'Timeline slider selection, image dimensions, PNG/JPEG formats select, and batch downloads.',
        howItWorks: 'Mounts video tags to local files, seeks video elements to desired times, draws frames to canvas, and exports blobs.'
      }
    ]
  },
  audio: {
    title: 'Audio Suite',
    desc: 'Sound wave editing, decibel amplification, voice recorders, and real-time visualizers.',
    list: [
      {
        id: 'audio-cutter',
        name: 'Audio Cutter',
        engine: 'Web Audio AudioContext Slice Engine',
        details: 'Loads audio binaries, decodes them to raw PCM buffer objects, trims target segments, and encodes outputs to WAV.',
        functionality: 'Timeline zoom overlays, drag start/end markers, fade-in/fade-out toggles, and output saving.',
        howItWorks: 'Decodes file data into AudioBuffers, copies sub-segment arrays to a new buffer, writes RIFF headers, and downloads WAVs.'
      },
      {
        id: 'audio-merge',
        name: 'Audio Merge',
        engine: 'AudioBuffer Concatenator',
        details: 'Assembles multiple decibel arrays together into a single AudioBuffer container, exporting files client-side.',
        functionality: 'Multi-track uploads, track sequence list ordering, gapless joins, and WAV format downloads.',
        howItWorks: 'Decodes files sequentially, allocates a single AudioBuffer with aggregate lengths, copies samples, and compiles WAV blobs.'
      },
      {
        id: 'noise-removal',
        name: 'Noise Removal',
        engine: 'Web Audio BiquadFilter Engine',
        details: 'Applies lowpass, highpass, or bandpass biquad filters to target audio, stripping ambient frequencies.',
        functionality: 'Frequency range cutoff sliders, filter type dropdowns, gain adjusters, and audio downloads.',
        howItWorks: 'Renders audio nodes through an offline processing context containing biquad filter nodes configured to dump noise ranges.'
      },
      {
        id: 'audio-convert',
        name: 'Convert Audio',
        engine: 'Web Audio AudioBuffer Encoder',
        details: 'Loads audio formats and decodes/re-encodes them into WAV or MP3 files.',
        functionality: 'Formats: WAV, MP3, OGG, FLAC; bitrates configurations; batch queues.',
        howItWorks: 'Pipes decoded audio buffers into local JS/WASM encoders to serialize audio payloads into custom files.'
      },
      {
        id: 'voice-recorder',
        name: 'Voice Recorder',
        engine: 'MediaRecorder API',
        details: 'Binds to microphone streams, capturing audio segments and serializing output to WAV/WEBM format.',
        functionality: 'Microphone select, volume meter indicator, pause/resume, live wave display, and output downloads.',
        howItWorks: 'Obtains user permission for audio streams, starts browser MediaRecorder recording, caches data chunks, and compiles output blobs.'
      },
      {
        id: 'speech-to-text',
        name: 'Speech-to-Text',
        engine: 'Web Speech Recognition Engine',
        details: 'Leverages the native browser speech engine to transcribe speech segments into text strings in real-time.',
        functionality: 'Continuous transcribing, language selections, auto-punctuation, and text copying.',
        howItWorks: 'Instantiates WebkitSpeechRecognition objects, binds capture callbacks, and outputs continuous text streams.'
      },
      {
        id: 'tts-fallback',
        name: 'Text-to-Speech',
        engine: 'Web SpeechSynthesis Engine',
        details: 'Invokes local browser speech synthesis tools, customizing voice accents and speeds.',
        functionality: 'Multi-voice selection lists, pitch/rate sliders, pause controls, and visual text highlights.',
        howItWorks: 'Binds text fields to window.speechSynthesis, initializes SpeechSynthesisUtterance, and handles speech actions.'
      },
      {
        id: 'volume-booster',
        name: 'Volume Booster',
        engine: 'Web Audio GainNode',
        details: 'Routes AudioContext streams through a GainNode structure, amplifying signal decibels beyond standard ceilings.',
        functionality: 'Boost sliders (up to 400%), clipping indicator lights, output format selections, and fast compile.',
        howItWorks: 'Processes source files through an OfflineAudioContext, adds GainNodes configured with multiplier values, and outputs files.'
      },
      {
        id: 'podcast-editor',
        name: 'Podcast Editor',
        engine: 'Web Audio Mixer Engine',
        details: 'Overlays multiple audio tracks onto a single master layout, mixing sound channels together.',
        functionality: 'Multi-layer timeline, independent track volume sliders, background music fade controls, and output compilation.',
        howItWorks: 'Mixes multiple overlapping AudioBuffer source channels into a unified channel structure inside an offline renderer.'
      },
      {
        id: 'audio-visualizer',
        name: 'Audio Visualizer',
        engine: 'Web Audio AnalyserNode',
        details: 'Extracts real-time Fast Fourier Transform (FFT) frequencies, drawing dynamic audio wave graphics.',
        functionality: 'Bar/wave/circle styles, color gradient pickers, sensitivity adjustments, and video exporter options.',
        howItWorks: 'Hooks audio source nodes to an AnalyserNode, updates frequency arrays via animation frames, and draws bars to canvas.'
      }
    ]
  },
  dev: {
    title: 'Developer Utilities',
    desc: 'Formatters, token decoders, random key generators, SHA hashing, and URL parameters.',
    list: [
      {
        id: 'json-format',
        name: 'JSON Formatter',
        engine: 'JSON.parse / JSON.stringify Engine',
        details: 'Validates structure strings, formatting raw text into clean nested hierarchies with customizable indent sizes.',
        functionality: 'JSON indent customizer (2, 4 spaces), validate & syntax highlight, tree view toggle, and minify option.',
        howItWorks: 'Runs user input through JSON.parse to check syntax validity, then formats output via JSON.stringify(obj, null, indent).'
      },
      {
        id: 'jwt-decode',
        name: 'JWT Decoder',
        engine: 'Base64URL Decoder',
        details: 'Splits JSON Web Tokens at delimiters, decoding payloads into formatted JSON strings.',
        functionality: 'Header/payload split view, expiry timestamp converter, copy elements buttons, and payload inspector.',
        howItWorks: 'Splits tokens at dot boundaries (.), decodes base64-url segments using window.atob, and parses payloads to JSON.'
      },
      {
        id: 'dev-base64',
        name: 'Base64 Tool',
        engine: 'window.atob / window.btoa',
        details: 'Converts plain-text to base64 formatting, or reads base64 files back to original binaries.',
        functionality: 'Bi-directional text conversion, file-to-string mappings, copy output, and file download options.',
        howItWorks: 'Encodes text using btoa or reads input files as data arrays, returning standard Base64 string representations.'
      },
      {
        id: 'regex-tester',
        name: 'Regex Tester',
        engine: 'RegExp Object Pattern Tester',
        details: 'Evaluates regular expressions against strings, highlighting match groups and replacement parameters.',
        functionality: 'Pattern input, flags selectors (g, i, m, s), matches highlighting, replace text options, and match counts.',
        howItWorks: 'Instantiates standard Javascript RegExp structures, evaluates matches on input, and inserts highlighted DOM spans.'
      },
      {
        id: 'uuid-gen',
        name: 'UUID Generator',
        engine: 'window.crypto.randomUUID',
        details: 'Uses native cryptographically secure random number generators to output unique UUIDv4 keys.',
        functionality: 'Batch generations (1-100), copy UUID list buttons, version selection, and clear displays.',
        howItWorks: 'Invokes browser\'s native crypto.randomUUID api sequentially to ensure cryptographically secure random values.'
      },
      {
        id: 'hash-gen',
        name: 'Hash Generator',
        engine: 'SubtleCrypto Digests',
        details: 'Computes SHA-1, SHA-256, or SHA-512 hashes from input string arrays offline.',
        functionality: 'Supported algorithms: SHA-1, SHA-256, SHA-512, MD5; input text/file support; copy hashes button.',
        howItWorks: 'Converts string inputs to Uint8Arrays, passes them to window.crypto.subtle.digest, and converts outputs to hex.'
      },
      {
        id: 'api-tester',
        name: 'API Tester',
        engine: 'fetch Client API',
        details: 'Dispatches client HTTP requests, measuring response timings, header parameters, and data payloads.',
        functionality: 'HTTP methods selection (GET/POST/PUT/DELETE), headers table, request body text area, response time logs, and formatted outputs.',
        howItWorks: 'Invokes standard window.fetch API with user configurations, records time stamps, and prints outputs.'
      },
      {
        id: 'url-encoder',
        name: 'URL Encoder',
        engine: 'encodeURIComponent / decodeURIComponent',
        details: 'Encodes parameter values to safe URL formatting or decodes them.',
        functionality: 'URL parameter encoding, full URL decoding, quick copy buttons, and character count outputs.',
        howItWorks: 'Invokes standard Javascript functions encodeURIComponent and decodeURIComponent on text areas.'
      },
      {
        id: 'html-minify',
        name: 'HTML Minifier',
        engine: 'Regex Minification Engine',
        details: 'Strips document whitespaces, carriage returns, and comment layouts from code strings.',
        functionality: 'Strips comments, merges empty spaces, handles CSS/JS inline blocks, and file size difference logs.',
        howItWorks: 'Applies regular expressions to strip HTML/XML comments and collapse carriage returns and whitespace sequences.'
      },
      {
        id: 'color-converter',
        name: 'Color Converter',
        engine: 'Color Conversion Formulas',
        details: 'Computes conversion equations to map color definitions between HEX, RGB, HSL, and CMYK formats.',
        functionality: 'Formats: HEX, RGB, HSL, CMYK; color palette preview; color picker; copy values buttons.',
        howItWorks: 'Evaluates color strings, runs standard color space equations in state, and updates hex formats dynamically.'
      },
      {
        id: 'cron-parser',
        name: 'Cron Expression Parser',
        engine: 'Cron Parsing Algorithms',
        details: 'Parses cron expression schedules or generates strings interactively, displaying simulated execution runtimes.',
        functionality: 'Cron input box, next execution list generator, layout templates (hourly, daily), and validation status.',
        howItWorks: 'Decodes fields (minute, hour, day, month, weekday) and calculates future matching date objects using calendar offsets.'
      },
      {
        id: 'sql-formatter',
        name: 'SQL Formatter',
        engine: 'SQL Keyword Lexer Rules',
        details: 'Formats, minifies, and aligns SQL syntax keywords to customized tab indentations client-side.',
        functionality: 'Keyword capitalization, indentation settings, formatting presets, and SQL syntax copy options.',
        howItWorks: 'Tokenizes SQL blocks with a simple custom lexer, formats keyword cases (e.g. SELECT, WHERE), and aligns indentations.'
      },
      {
        id: 'yaml-json',
        name: 'YAML ↔ JSON Converter',
        engine: 'YAML Parser and JSON Serializer',
        details: 'Inter-converts objects and arrays between YAML markup strings and standard nested JSON hierarchies.',
        functionality: 'Bi-directional conversions, YAML syntax validation, error messages display, and indent control.',
        howItWorks: 'Tokenizes YAML fields using custom parsers, resolves nodes, compiles JSON structures, or stringifies JSON back to YAML.'
      },
      {
        id: 'md-table-gen',
        name: 'Markdown Table Generator',
        engine: 'Markdown Table Compiler',
        details: 'Generates structured Markdown syntax code for table structures using interactive headers and column alignments.',
        functionality: 'Row/column count controls, text align dropdowns (left, center, right), live preview grid, and MD copy.',
        howItWorks: 'Loops over tabular state coordinates, joins values with pipe separators (|), and includes formatting rows (`|---|`).'
      },
      {
        id: 'diff-checker',
        name: 'Diff Checker',
        engine: 'Line Diff Comparison Engine',
        details: 'Compares two text lists line-by-line, compiling deleted, added, or modified code line decorations.',
        functionality: 'Side-by-side or inline view, changes highlights, line numbers display, and scroll synchronization.',
        howItWorks: 'Tokenizes lines, calculates differences, highlights insertions/deletions, and displays line divs.'
      },
      {
        id: 'keycode-finder',
        name: 'Keyboard Keycode Finder',
        engine: 'DOM Keyboard Event Listeners',
        details: 'Tracks keypress logs dynamically, displaying key name, event code, character code, and active modifiers.',
        functionality: 'Live tracking cards, modifier keys indicators (Ctrl, Alt, Shift), and JSON key detail copies.',
        howItWorks: 'Attaches keyboard listeners (`keydown`), captures event details (key, code, keyCode), and updates UI states.'
      },
      {
        id: 'box-shadow-gen',
        name: 'Box Shadow Generator',
        engine: 'CSS Style Compilation Engine',
        details: 'Compiles custom offsets, colors, and blur settings into valid box-shadow properties and overlays them on a preview element.',
        functionality: 'Sliders for offset-x/offset-y/blur/spread, inset toggle, color pickers, and CSS code copy.',
        howItWorks: 'Compiles property string `box-shadow: Xpx Ypx Bpx Spx Color;` and applies it dynamically to a preview div.'
      },
      {
        id: 'base-converter',
        name: 'Base Converter',
        engine: 'Number Parsing Algorithms',
        details: 'Converts integers between base-10, base-2, base-8, and base-16 formats with logical steps walkthrough.',
        functionality: 'Supported bases: Binary, Octal, Decimal, Hexadecimal; step-by-step math solver; clipboard copy.',
        howItWorks: 'Parses inputs to integers via standard JS parseInt, and compiles translations via toString(base).'
      },
      {
        id: 'glassmorphism-gen',
        name: 'Glassmorphism Generator',
        engine: 'CSS Backdrop Filter Compiler',
        details: 'Computes combinations of saturation, blur, tint colors, and boundary borders into modern Glass CSS assets.',
        functionality: 'Sliders for blur/saturation/opacity, background wallpaper selections, and CSS snippet copies.',
        howItWorks: 'Generates standard styles: `backdrop-filter: blur(Xpx) saturate(Y%); background: rgba(...);` and hooks preview states.'
      },
      {
        id: 'screen-info',
        name: 'Screen & Device Info',
        engine: 'DOM Window Screen API',
        details: 'Inspects client environment parameters including device viewport dimensions, pixel density, connection limits, and storage estimations.',
        functionality: 'Viewport resolution specs, screen size details, pixel ratio counts, user agent strings, and network status.',
        howItWorks: 'Reads browser objects window.screen, window.navigator, window.devicePixelRatio, and writes info panels.'
      }
    ]
  },
  ai: {
    title: 'Local AI Suite',
    desc: 'Local model connection pipelines, summarization, OCR formatters, and translation.',
    list: [
      {
        id: 'ai-chat',
        name: 'AI Chat',
        engine: 'Ollama Client REST Pipeline',
        details: 'Streams message structures to local Ollama ports, rendering response markdown content.',
        functionality: 'Interactive chat threads, system prompt configuration, model selections, and markdown renders.',
        howItWorks: 'Dispatches stream requests to Ollama API `http://localhost:11434/api/chat`, reading JSON chunks via readable streams.'
      },
      {
        id: 'ai-summarizer',
        name: 'Summarizer',
        engine: 'Ollama Model Summarizer Pipeline',
        details: 'Sends text content to local LLMs with custom instructions to create structured summaries.',
        functionality: 'Length selection overrides, bullet points option, context filters, and copy text buttons.',
        howItWorks: 'Formats custom prompts with context blocks, queries local LLM endpoints, and updates outputs.'
      },
      {
        id: 'caption-gen',
        name: 'Caption Generator',
        engine: 'Ollama Vision Pipeline',
        details: 'Encodes image uploads as base64 parameters, transmitting details to local vision LLMs for captioning.',
        functionality: 'Image uploads preview, detail level options, context guides, and clipboard copy.',
        howItWorks: 'Reads files as data URLs, strips header strings, sends base64 elements to vision models, and prints replies.'
      },
      {
        id: 'ocr-assistant',
        name: 'OCR Assistant',
        engine: 'Ollama Layout Formatting Pipeline',
        details: 'Sends noisy text from OCR tools to local LLMs to format clean document configurations.',
        functionality: 'Correction toggles, Markdown layout tables support, auto-paragraphs, and output downloads.',
        howItWorks: 'Structures raw OCR outputs into templates, prompts LLM to fix syntax and spelling errors, and outputs results.'
      },
      {
        id: 'prompt-enhancer',
        name: 'Prompt Enhancer',
        engine: 'Ollama Prompt Optimization Pipeline',
        details: 'Assembles prompt elements, utilizing local LLMs to expand concepts into detailed instructions.',
        functionality: 'Detail expansion sliders, system persona injector, testing output templates, and quick copies.',
        howItWorks: 'Pipes raw ideas through model prompts to structure them using clear formatting rules.'
      },
      {
        id: 'image-classifier',
        name: 'Image Classifier',
        engine: 'Ollama Image Classification Pipeline',
        details: 'Sends image parameters to local vision LLMs, returning tag listings and classification percentages.',
        functionality: 'Tags generation, confidence score indexes, multiple tags display, and file downloads.',
        howItWorks: 'Transmits image arrays to local vision models requesting strict JSON responses containing arrays.'
      },
      {
        id: 'text-rewriter',
        name: 'Text Rewriter',
        engine: 'Ollama Tone Transformation Pipeline',
        details: 'Applies style templates using local models, rewriting paragraphs into alternative tones.',
        functionality: 'Tones dropdown (professional, funny, academic, casual), rewrite percentage limits, and copy options.',
        howItWorks: 'Constructs prompts specifying target tones and outputs rewritten options.'
      },
      {
        id: 'ai-translator',
        name: 'Translator',
        engine: 'Ollama Translation Pipeline',
        details: 'Directs local LLMs to translate text strings, maintaining structure and context.',
        functionality: 'Target language selections, semantic context options, text area view, and quick copying.',
        howItWorks: 'Instructs the LLM to translate inputs between target languages without modifying XML/HTML structure.'
      },
      {
        id: 'ai-stt',
        name: 'Speech-to-Text',
        engine: 'Ollama Audio Transcription Pipeline',
        details: 'Processes audio files through local models to generate text transcriptions.',
        functionality: 'Audio uploads, transcript timelines display, play-to-verify option, and TXT outputs.',
        howItWorks: 'Pipes audio byte arrays through local whisper/stt model pipelines to output timestamped text logs.'
      },
      {
        id: 'semantic-search',
        name: 'Semantic Search',
        engine: 'Ollama Embedding Engine',
        details: 'Passes document texts to embedding models, storing vectors to perform similarity searches.',
        functionality: 'Text embedding lists, similarity threshold sliders, score highlights, and search results lists.',
        howItWorks: 'Queries embedding endpoints for document arrays, computes cosine similarity, and ranks matches.'
      },
      {
        id: 'ai-code-explainer',
        name: 'AI Code Explainer',
        engine: 'Ollama Code Explanation Pipeline',
        details: 'Analyzes code segments step-by-step, assessing complexity and translating logic to other languages.',
        functionality: 'Line-by-line descriptions, complexity index gauges, language converter selectors, and formatted exports.',
        howItWorks: 'Prompts local code-LLMs to analyze inputs and return detailed explanations and translated snippets.'
      },
      {
        id: 'ai-flashcard-maker',
        name: 'AI Flashcard Maker',
        engine: 'Ollama Educational Q&A Pipeline',
        details: 'Transforms any text input or topic into structured Q&A card decks for study sessions.',
        functionality: 'Q&A card templates generation, card count selectors, interactive card deck visualizer, and JSON exports.',
        howItWorks: 'Prompts LLM to format Q&A cards in JSON blocks and populates the cards interface.'
      },
      {
        id: 'ai-sentiment-journal',
        name: 'AI Sentiment Journal',
        engine: 'Ollama Sentiment & Mood Analysis Pipeline',
        details: 'Evaluates mood trends, keywords, and emotions from daily journal entries securely saved in local storage.',
        functionality: 'Journal input fields, daily mood tags, keywords extractor index, and sentiment trend charts.',
        howItWorks: 'Applies sentiment classifiers on journal texts, calculates scores, and maps results to trend charts.'
      },
      {
        id: 'ai-email-composer',
        name: 'AI Email Composer',
        engine: 'Ollama Business Copywriting Pipeline',
        details: 'Drafts or replies to emails with options for tone, length, and subject lines based on user intent.',
        functionality: 'Tone adjustments, length controls (short, medium, long), subject line generator, and copies.',
        howItWorks: 'Combines specifications into copywriting prompts and outputs formatted emails.'
      },
      {
        id: 'ai-story-generator',
        name: 'AI Story Generator',
        engine: 'Ollama Creative Fiction Pipeline',
        details: 'Generates fantasy, sci-fi, horror, or comedy stories complete with characters, settings, and twists.',
        functionality: 'Genre dropdowns, prompt ideas index, chapter structures generator, and print-ready downloads.',
        howItWorks: 'Instructs model to compose creative writing chapters according to user settings.'
      },
      {
        id: 'ai-debate-assistant',
        name: 'AI Debate Assistant',
        engine: 'Ollama Argumentation Pipeline',
        details: 'Constructs PRO and CON arguments, opening/closing statements, and counterpoints for a given topic.',
        functionality: 'Side-by-side arguments display, steelman counter structures, debate format selectors, and copies.',
        howItWorks: 'Queries model to generate logical arguments for both positions, structuring outputs.'
      },
      {
        id: 'ai-math-solver',
        name: 'AI Math Solver',
        engine: 'Ollama Mathematical Reasoning Pipeline',
        details: 'Solves complex equations and word problems step-by-step with LaTeX formatting.',
        functionality: 'Interactive step-by-step solver, LaTeX equation renderer, math categories selectors, and PDF outputs.',
        howItWorks: 'Prompts local reasoning models to parse equations and render calculations sequentially.'
      },
      {
        id: 'ai-recipe-generator',
        name: 'AI Recipe Generator',
        engine: 'Ollama Culinary Optimization Pipeline',
        details: 'Recommends cooking recipes, nutrition estimates, and missing ingredient lists from available items.',
        functionality: 'Ingredients checklists, dietary restriction overrides, nutrition cards, and shopping lists.',
        howItWorks: 'Pipes available ingredients to LLM, queries for recipes/nutrition details, and displays layouts.'
      },
      {
        id: 'ai-code-reviewer',
        name: 'AI Code Reviewer',
        engine: 'Ollama Static Review Pipeline',
        details: 'Audits code structure for bugs, security weaknesses, performance, and best practices.',
        functionality: 'Bug finders, security scan logs, performance scores index, and recommendations lists.',
        howItWorks: 'Sends code segments requesting feedback on security, performance, and best practices.'
      },
      {
        id: 'ai-mind-mapper',
        name: 'AI Mind Mapper',
        engine: 'Ollama Hierarchical Layout Pipeline',
        details: 'Extracts concepts from topics to organize them into nested branches and outlines.',
        functionality: 'Node outline views, hierarchy generator, interactive canvas nodes, and outlines exports.',
        howItWorks: 'Translates inputs into structured nested lists and renders interactive nodes.'
      },
      {
        id: 'domo-agent-hub',
        name: 'Domo Agent Hub',
        engine: 'Ollama Workspace File API',
        details: 'Mounts local directories using File System Access handles to edit files and direct AI coding runs offline.',
        functionality: 'Workspace folder mounter, multi-agent sequential runs, file auto-saves, and code changes log.',
        howItWorks: 'Binds directory handles to browser sessions, manages multiple agent threads, and writes code.'
      },
      {
        id: 'domo-selection',
        name: 'DomoDomo Selection Explainer',
        engine: 'Ollama Highlight Selector Pipeline',
        details: 'Provides inline segment highlighting and local file upload support, answered by the friendly DomoDomo mascot persona with custom markdown formatting.',
        functionality: 'Highlight selector listener, custom response panel, file attachments support, and mascot expressions.',
        howItWorks: 'Listens to selection changes, structures inputs with mascot instructions, and streams responses.'
      }
    ]
  }
};

export const Documentation = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionId>('intro');
  const [activeToolCategory, setActiveToolCategory] = useState<ToolCategory>('pdf');
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  const handleCategoryChange = (cat: ToolCategory) => {
    setActiveToolCategory(cat);
    setExpandedToolId(null);
  };

  const menuItems = [
    { id: 'intro', label: 'Introduction', icon: BookOpen },
    { id: 'sys-archi', label: 'System Architecture', icon: GitBranch },
    { id: 'offline-flow', label: 'Offline Flowchart', icon: Cpu },
    { id: 'tools-ref', label: 'Tools Reference', icon: Layers },
    { id: 'setup-guide', label: 'Setup & Install', icon: Terminal },
    { id: 'core-engines', label: 'Core Web Engines', icon: Settings },
    { id: 'compliance', label: 'Security & Compliance', icon: Shield },
  ] as const;

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Docs Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#2A2D30]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#72706C] uppercase tracking-wider">
            <span>DomoDomo Hub</span>
            <span>/</span>
            <span className="text-[#A3A09B]">Documentation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#ECEBE9] font-heading tracking-tight mt-1">
            Technical Specification & Guides
          </h1>
          <p className="text-[#A3A09B] text-sm max-w-2xl leading-relaxed">
            Understand how DomoDomo executes complex file modifications, neural queries, and compression pipelines locally inside your browser sandbox.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn-secondary py-2 px-4 text-xs font-bold shrink-0"
        >
          <ArrowLeft size={14} />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Docs Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Keywords */}
        <div className="lg:col-span-3 flex flex-col gap-2 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl lg:sticky lg:top-24">
          <span className="text-[10px] uppercase tracking-wider text-[#72706C] font-bold px-3 mb-2 block">Keywords & Topics</span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                  isActive
                    ? 'bg-[#3C6B4D]/10 text-[#ECEBE9] border border-[#3C6B4D]/40'
                    : 'text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#111213] border border-transparent'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#3C6B4D]' : 'text-[#72706C]'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Pane */}
        <div className="lg:col-span-9 bg-[#18191B] border border-[#2A2D30] p-6 md:p-8 rounded-3xl min-h-[550px] flex flex-col gap-6">
          {activeSection === 'intro' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">Introduction</h2>
              <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed">
                DomoDomo is designed as a <strong className="font-bold text-[#ECEBE9]">Local-First Web Workshop</strong>. Unlike typical SaaS productivity tools that process your media assets, documents, and private credentials on remote cloud servers, DomoDomo compiles and executes all operations client-side inside the user's browser sandbox.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl">
                  <h3 className="text-[#3C6B4D] font-bold text-xs mb-1 uppercase tracking-wide">Device Privacy</h3>
                  <p className="text-[#A3A09B] text-[11px] leading-relaxed">
                    Zero data packets representing your documents or input coordinates leave your local device. Work on sensitive company datasets or credentials with complete peace of mind.
                  </p>
                </div>
                <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl">
                  <h3 className="text-[#3C6B4D] font-bold text-xs mb-1 uppercase tracking-wide">Offline Native</h3>
                  <p className="text-[#A3A09B] text-[11px] leading-relaxed">
                    The entire dashboard compiles down to client assets. Once cached, the application functions fully with no internet connections or router access.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'sys-archi' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">System Architecture</h2>
              <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed">
                DomoDomo operates within a <strong className="font-bold text-[#ECEBE9]">sandboxed container namespace</strong> provided by modern web browser security engines. The diagram below illustrates the relationship between components:
              </p>

              {/* Architecture SVG diagram */}
              <div className="bg-[#111213] border border-[#2A2D30] p-6 rounded-2xl flex items-center justify-center overflow-x-auto">
                <svg width="600" height="260" viewBox="0 0 600 260" fill="none" className="min-w-[500px]">
                  {/* Browser Sandbox Frame */}
                  <rect x="10" y="10" width="580" height="240" rx="12" fill="#18191B" stroke="#2A2D30" strokeWidth="2" />
                  <text x="30" y="38" fill="#72706C" fontSize="10" fontFamily="monospace" fontWeight="bold" dominantBaseline="central">BROWSER SANDBOX (ISOLATED CLIENT NODE)</text>

                  {/* Input Source */}
                  <rect x="37" y="80" width="90" height="50" rx="8" fill="#111213" stroke="#2A2D30" />
                  <text x="82" y="98" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central" fontWeight="bold">User Files</text>
                  <text x="82" y="114" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle" dominantBaseline="central">File / Image Blobs</text>

                  {/* Arrow 1 */}
                  <path d="M127 105 H167" stroke="#3C6B4D" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Memory Iframe Cache */}
                  <rect x="167" y="60" width="220" height="90" rx="8" fill="#111213" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="277" y="78" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central" fontWeight="bold">DomoDomo Engines</text>
                  <text x="277" y="96" fill="#3C6B4D" fontSize="9" fontFamily="monospace" textAnchor="middle" dominantBaseline="central">IndexedDB / Memory Cache</text>
                  <text x="277" y="114" fill="#A3A09B" fontSize="9" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central">WASM Runtimes & Canvas</text>
                  <text x="277" y="132" fill="#E29E2D" fontSize="8" fontFamily="monospace" textAnchor="middle" dominantBaseline="central">WebGPU (LLM Queries)</text>

                  {/* Arrow 2 */}
                  <path d="M387 105 H427" stroke="#3C6B4D" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Local compilation output */}
                  <rect x="427" y="80" width="90" height="50" rx="8" fill="#111213" stroke="#2A2D30" />
                  <text x="472" y="98" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central" fontWeight="bold">Output Buffers</text>
                  <text x="472" y="114" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle" dominantBaseline="central">ArrayBuffer Stream</text>

                  {/* Arrow 3 */}
                  <path d="M517 105 H543" stroke="#3C6B4D" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Browser Download Node */}
                  <circle cx="565" cy="105" r="18" fill="#111213" stroke="#3C6B4D" strokeWidth="1.5" />
                  <path d="M565 97 V107 M560 102 L565 107 L570 102 M559 111 H571" stroke="#ECEBE9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="565" y="138" fill="#ECEBE9" fontSize="9" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central" fontWeight="bold">Download</text>
                  <text x="565" y="153" fill="#72706C" fontSize="8" fontFamily="monospace" textAnchor="middle" dominantBaseline="central">Local Save</text>

                  {/* Bottom blocked Cloud server */}
                  <rect x="190" y="185" width="220" height="40" rx="8" fill="#111213" stroke="#E29E2D" strokeDasharray="4 4" />
                  <path d="M205 200 L215 210 M215 200 L205 210 M385 200 L395 210 M395 200 L385 210" stroke="#E29E2D" strokeWidth="2" />
                  <text x="300" y="205" fill="#E29E2D" fontSize="10" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central" fontWeight="bold">NO OUTBOUND WAN TRAFFIC</text>

                  {/* Markers definition */}
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#3C6B4D" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>
          )}

          {activeSection === 'offline-flow' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">Offline Flowchart</h2>
              <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed">
                This flowchart visualizes the sequence of events executed during local file operations (e.g. compressing a PDF, resizing an image, or generating code blocks):
              </p>

              {/* Flowchart SVG */}
              <div className="bg-[#111213] border border-[#2A2D30] p-6 rounded-2xl flex items-center justify-center overflow-x-auto">
                <svg width="600" height="420" viewBox="0 0 600 420" fill="none" className="min-w-[500px]">
                  {/* Step 1 */}
                  <rect x="200" y="10" width="200" height="45" rx="8" fill="#18191B" stroke="#2A2D30" />
                  <text x="300" y="36" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="semibold">1. Input File Selected</text>
                  <path d="M300 55 V90" stroke="#2A2D30" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />

                  {/* Step 2 */}
                  <rect x="200" y="90" width="200" height="45" rx="8" fill="#18191B" stroke="#2A2D30" />
                  <text x="300" y="116" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="semibold">2. Parsed into File Blob</text>
                  <path d="M300 135 V170" stroke="#2A2D30" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />

                  {/* Step 3 */}
                  <polygon points="300,170 420,195 300,220 180,195" fill="#18191B" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="300" y="199" fill="#ECEBE9" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">3. Network Call?</text>
                  
                  {/* Yes Branch */}
                  <path d="M420 195 H500 V240" stroke="#E29E2D" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />
                  <text x="455" y="185" fill="#E29E2D" fontSize="10" fontFamily="sans-serif" fontWeight="bold">Yes</text>
                  <rect x="425" y="240" width="150" height="45" rx="8" fill="#18191B" stroke="#E29E2D" />
                  <text x="500" y="266" fill="#E29E2D" fontSize="10" fontFamily="sans-serif" textAnchor="middle" fontWeight="semibold">Operation Blocked</text>

                  {/* No Branch */}
                  <path d="M300 220 V260" stroke="#3C6B4D" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />
                  <text x="315" y="240" fill="#3C6B4D" fontSize="10" fontFamily="sans-serif" fontWeight="bold">No</text>
                  
                  {/* Step 4 */}
                  <rect x="185" y="260" width="230" height="45" rx="8" fill="#18191B" stroke="#3C6B4D" strokeWidth="1.5" />
                  <text x="300" y="286" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="semibold">4. Sandboxed Compilation</text>
                  <path d="M300 305 V335" stroke="#2A2D30" strokeWidth="1.5" markerEnd="url(#flow-arrow)" />

                  {/* Step 5 */}
                  <rect x="200" y="335" width="200" height="45" rx="22" fill="#3C6B4D" />
                  <text x="300" y="361" fill="#ECEBE9" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">5. Local Download Triggered</text>

                  {/* Markers definition */}
                  <defs>
                    <marker id="flow-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#2A2D30" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>
          )}

          {activeSection === 'tools-ref' && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">Tools Reference Guide</h2>
              <p className="text-[#A3A09B] text-xs leading-relaxed">
                Explore technical specifications, operational execution runtimes, and local engine details for each registered tool in the workshop:
              </p>

              {/* Tools Category Mini Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-[#2A2D30]/65 pb-3">
                {Object.entries(TOOLS_DOCS).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key as ToolCategory)}
                    className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all border ${
                      activeToolCategory === key
                        ? 'bg-[#3C6B4D]/10 text-[#3C6B4D] border-[#3C6B4D]/25'
                        : 'bg-[#111213] text-[#72706C] border-[#2A2D30] hover:text-[#A3A09B]'
                    }`}
                  >
                    {data.title.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Active Category Header */}
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-[#ECEBE9] text-base">{TOOLS_DOCS[activeToolCategory].title}</h3>
                <p className="text-[#A3A09B] text-xs leading-relaxed">{TOOLS_DOCS[activeToolCategory].desc}</p>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {TOOLS_DOCS[activeToolCategory].list.map((tool) => {
                  const isExpanded = expandedToolId === tool.id;
                  return (
                    <div
                      key={tool.id}
                      className={`bg-[#111213] border border-[#2A2D30] p-5 rounded-2xl flex flex-col gap-3 transition-all duration-300 ${
                        isExpanded ? 'col-span-1 md:col-span-2 border-[#3C6B4D]/60 bg-[#141618]' : 'hover:border-[#2A2D30]/80'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[#ECEBE9] text-xs font-mono">{tool.name}</span>
                          <span className="text-[10px] text-[#72706C] font-mono">ID: {tool.id}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/25 rounded text-[8px] font-mono shrink-0">
                          {tool.engine}
                        </span>
                      </div>
                      
                      <p className="text-[#A3A09B] text-[10px] leading-relaxed">
                        {tool.details}
                      </p>

                      {isExpanded && (
                        <div className="mt-2 pt-4 border-t border-[#2A2D30] flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-[#3C6B4D] font-bold">Key Functionality</span>
                            <p className="text-[11px] text-[#ECEBE9] leading-relaxed bg-[#18191B] border border-[#2A2D30] p-3 rounded-xl">
                              {tool.functionality}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase tracking-wider text-[#E29E2D] font-bold">How It Works (Under the Hood)</span>
                            <p className="text-[11px] text-[#A3A09B] leading-relaxed bg-[#18191B] border border-[#2A2D30] p-3 rounded-xl font-sans">
                              {tool.howItWorks}
                            </p>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setExpandedToolId(isExpanded ? null : tool.id)}
                        className={`text-left text-[10px] font-bold w-fit mt-1 flex items-center gap-1 transition-all ${
                          isExpanded ? 'text-[#E29E2D] hover:text-[#E29E2D]/80' : 'text-[#3C6B4D] hover:text-[#3C6B4D]/80'
                        }`}
                      >
                        <span>{isExpanded ? 'Collapse Details' : 'Expand Details & Mechanics'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === 'setup-guide' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">Setup & Installation Guide</h2>
              <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed">
                Run DomoDomo offline on your local network setup. This ensures that cross-origin browser queries can successfully talk to local backend services (like Ollama AI).
              </p>

              <div className="flex flex-col gap-4 text-xs">
                {/* Step 1 */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-[#ECEBE9] text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center text-xs font-mono">1</span>
                    <span>Clone & Install Dev Assets</span>
                  </h3>
                  <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] font-mono text-[11px] text-[#ECEBE9] relative group">
                    <pre className="overflow-x-auto">
{`git clone https://github.com/darknecrocities/DomoDomo---All-in-one-Tool.git
cd DomoDomo---All-in-one-Tool
npm install`}
                    </pre>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col gap-2 border-t border-[#2A2D30]/60 pt-4">
                  <h3 className="font-bold text-[#ECEBE9] text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center text-xs font-mono">2</span>
                    <span>Launch Local Dev Server</span>
                  </h3>
                  <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] font-mono text-[11px] text-[#ECEBE9] relative group">
                    <pre className="overflow-x-auto">
{`npm run dev`}
                    </pre>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col gap-2 border-t border-[#2A2D30]/60 pt-4">
                  <h3 className="font-bold text-[#ECEBE9] text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center text-xs font-mono">3</span>
                    <span>Configure Local Ollama AI Origins</span>
                  </h3>
                  <p className="text-[#A3A09B] text-xs leading-relaxed">
                    By default, browsers block network traffic to local ports unless appropriate Cross-Origin Resource Sharing (CORS) headers are sent. Configure the environment variable <code className="text-[#3C6B4D] font-mono">OLLAMA_ORIGINS="*"</code> before launching Ollama:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#111213] border border-[#2A2D30] p-3.5 rounded-xl">
                      <span className="text-[#E29E2D] font-bold text-[10px] uppercase tracking-wider">macOS</span>
                      <pre className="text-[10px] text-[#A3A09B] font-mono mt-1 overflow-x-auto whitespace-pre-wrap">
{`launchctl setenv OLLAMA_ORIGINS "*"`}
                      </pre>
                      <p className="text-[9px] text-[#72706C] mt-2">Restart the Ollama app afterward.</p>
                    </div>
                    <div className="bg-[#111213] border border-[#2A2D30] p-3.5 rounded-xl">
                      <span className="text-[#E29E2D] font-bold text-[10px] uppercase tracking-wider">Windows Powershell</span>
                      <pre className="text-[10px] text-[#A3A09B] font-mono mt-1 overflow-x-auto whitespace-pre-wrap">
{`[Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS", "*", "User")`}
                      </pre>
                      <p className="text-[9px] text-[#72706C] mt-2">Close and re-open Ollama from taskbar tray.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'core-engines' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">Core Web Engines</h2>
              <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed">
                To process binaries locally in-browser without sending credentials to backends, DomoDomo utilizes several modern client-side APIs:
              </p>
              <div className="flex flex-col gap-4 text-xs">
                <div className="flex gap-4 p-4 bg-[#111213] rounded-2xl border border-[#2A2D30]">
                  <div className="p-3 bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/25 rounded-xl shrink-0 h-fit">
                    <Cpu size={20} />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <span className="font-bold text-[#ECEBE9] text-sm">WebAssembly Compilation (WASM)</span>
                    <span className="text-[#A3A09B] leading-relaxed">Used for complex file operations, compiling low-level byte arrays, signing documents, or evaluating PDF streams. Enables tools like `pdf-lib` to execute near native compile speeds.</span>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-[#111213] rounded-2xl border border-[#2A2D30]">
                  <div className="p-3 bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/25 rounded-xl shrink-0 h-fit">
                    <Settings size={20} />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <span className="font-bold text-[#ECEBE9] text-sm">HTML5 Canvas Layout Matrices</span>
                    <span className="text-[#A3A09B] leading-relaxed">Manipulates image pixels, resizing bounding dimensions, placing watermarks, and evaluating visual layouts directly inside browser memory without uploading raw graphics buffers.</span>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-[#111213] rounded-2xl border border-[#2A2D30]">
                  <div className="p-3 bg-[#E29E2D]/10 text-[#E29E2D] border border-[#E29E2D]/25 rounded-xl shrink-0 h-fit">
                    <Lock size={20} />
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <span className="font-bold text-[#ECEBE9] text-sm">Hardware-Accelerated WebGPU / WebGL</span>
                    <span className="text-[#A3A09B] leading-relaxed">Connects browser scripts directly to client GPU resources to accelerate floating-point queries during offline LLM token execution or media graphics processing.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'compliance' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-[#ECEBE9] border-b border-[#2A2D30] pb-3">Security & Compliance</h2>
              
              <div className="bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 p-4 rounded-xl flex items-start gap-3">
                <Shield size={20} className="text-[#3C6B4D] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[#ECEBE9] font-bold text-sm">100% Zero-Telemetry Policy</span>
                  <p className="text-[#A3A09B] text-xs leading-relaxed">
                    DomoDomo does not utilize tracking scripts, cookie managers, Google Analytics hooks, or log dumpers. What is loaded into memory is fully isolated within your browser tab namespace.
                  </p>
                </div>
              </div>

              <p className="text-[#A3A09B] text-xs md:text-sm leading-relaxed">
                Large corporations often enforce strict visual privacy guidelines. Employees are blocked from using external, unverified SaaS services to translate confidential PDF contracts, analyze client database lists, or generate business invoices.
              </p>

              <div className="flex flex-col gap-3 p-4 bg-[#111213] rounded-2xl border border-[#2A2D30] text-xs text-left">
                <h3 className="font-bold text-[#ECEBE9] flex items-center gap-2">
                  <Server size={14} className="text-[#3C6B4D]" />
                  <span>Corporate Self-Hosting Deployments</span>
                </h3>
                <p className="text-[#A3A09B] leading-relaxed">
                  Due to the zero-server architecture of the application, admins can bundle the static outputs and host it behind firewalls (e.g. <code>https://toolbox.internal.company.com</code>). Because the logic executes client-side on employee browser threads, corporate admins do not need to scale hosting resources or allocate database storage.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
