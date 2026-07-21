export type ToolCategory = 'pdf' | 'photo' | 'document' | 'converter' | 'qr' | 'video' | 'audio' | 'dev' | 'security' | 'ai' | 'data' | 'cv' | 'ml' | 'spatial';

export interface ToolDoc {
  id: string;
  name: string;
  engine: string;
  details: string;
  functionality: string;
  howItWorks: string;
  technicalSpecs: string;
}

export const TOOLS_DOCS: Record<ToolCategory, { title: string; desc: string; list: ToolDoc[] }> = {
  security: {
    title: 'DomoGuard Security Suite',
    desc: 'Local-first offline security, cryptographic, and AI-powered threat intelligence utilities.',
    list: [
      {
        id: 'ai-code-auditor',
        name: 'AI Code Auditor',
        engine: 'Ollama LLM Backend',
        details: 'Streams source code strings through a local AI model constrained by system prompts to perform static application security testing (SAST).',
        functionality: 'Detects hardcoded secrets, injection flaws, and logic errors. Provides secure remediation examples.',
        howItWorks: '1. User pastes code. 2. App connects to local Ollama daemon. 3. Model analyzes logic offline. 4. Markdown response is streamed back to the UI.',
        technicalSpecs: 'Requires local Ollama. Network traffic never leaves localhost.'
      },
      {
        id: 'ai-threat-intel',
        name: 'AI Threat Intel',
        engine: 'Ollama Chat Interface',
        details: 'Provides conversational access to an offline Cyber Threat Intelligence assistant trained on CVEs and APT group behaviors.',
        functionality: 'Allows users to research ransomware strains, attack techniques, and indicators of compromise without querying public search engines.',
        howItWorks: '1. User submits query. 2. Chat history is mapped and concatenated. 3. Model generates intelligence report. 4. Output rendered in chat UI.',
        technicalSpecs: 'Knowledge cutoff depends on the local model downloaded.'
      },
      {
        id: 'ai-deepfake-detection',
        name: 'AI Deepfake Detection',
        engine: 'Ollama Vision API',
        details: 'Encodes images to Base64 and executes a native POST fetch to the local Ollama daemon, utilizing multimodal vision architectures (e.g. llava) to detect artifacts.',
        functionality: 'Examines images for anatomical inconsistencies and lighting errors indicative of AI generation.',
        howItWorks: '1. Image is loaded and base64 encoded. 2. Sent to Vision model via local fetch. 3. Model analyzes pixels and responds with a verdict.',
        technicalSpecs: 'Requires a vision-capable model (like llava) installed locally.'
      },
      {
        id: 'url-analyzer',
        name: 'URL Analyzer',
        engine: 'Levenshtein Distance Algorithm',
        details: 'Parses URLs to extract root domains and compares them against high-value targets (e.g., banks, tech giants) using a Levenshtein distance matrix to detect typosquatting.',
        functionality: 'Identifies homograph attacks (non-ASCII characters) and visually similar domain names designed for phishing.',
        howItWorks: '1. User inputs URL. 2. Domain is extracted. 3. Matrix computes string distance to target list. 4. Warns user if distance is 1 or 2.',
        technicalSpecs: 'Executes instantly in-browser using O(N*M) algorithmic complexity.'
      },
      {
        id: 'file-encryption',
        name: 'File Encryption',
        engine: 'WebCrypto PBKDF2 + AES-GCM',
        details: 'Derives a 256-bit cryptographic key from a user password using 100,000 iterations of PBKDF2, then encrypts file buffers with AES-GCM.',
        functionality: 'Securely encrypts and decrypts files locally without sending them to a server.',
        howItWorks: '1. File read into ArrayBuffer. 2. Random 16-byte salt and 12-byte IV generated. 3. Content encrypted. 4. Salt and IV prepended to output Blob.',
        technicalSpecs: 'Produces highly secure .domoguard files that can only be decrypted with the correct password.'
      }
    ]
  },
  pdf: {
    title: 'PDF Document Suite',
    desc: 'Local browser compilation of vector documents, overlays, signature drawing, and text manipulation.',
    list: [
      {
        id: 'pdf-text-edit',
        name: 'Edit PDF Text',
        engine: 'PDF.js + Canvas2D Layering',
        details: 'Leverages PDF.js core library to parse font glyph maps and text position coordinates. Renders a high-fidelity interaction canvas where text strings are overlaid with editable input blocks, compiling output edits back into standard PDF stream updates via incremental catalog revisions.',
        functionality: 'Allows real-time inline text editing directly on the rendered PDF pages. Features automatic font style, size, and weight match detection, drag-and-resize edit bounding boxes, page zoom, text deletion, and support for multi-page editing runs. Exports a clean, native PDF document retaining all original layout scales.',
        howItWorks: '1. Ingests the PDF file as an ArrayBuffer and reads it using PDF.js. 2. Extracts page layout properties, text content structures, and styling metadata. 3. Draws page canvases to render standard layouts, and overlays an interactive HTML5 content layer at precise pixel coordinates. 4. Collects user edits and runs mapping routines to locate corresponding string objects in the original PDF file structure. 5. Compiles modification streams and updates the document catalog sequentially.',
        technicalSpecs: 'Supports Standard PDF 1.4-1.7 specifications. Font mapping is limited to system-available fonts and standard embedded PDF typefaces. Generates incremental stream updates to avoid breaking existing digital signatures.'
      },
      {
        id: 'pdf-merge',
        name: 'Merge PDFs',
        engine: 'pdf-lib (WASM Compiler)',
        details: 'Ingests multiple document ArrayBuffers, mapping and copying page dictionaries, cross-reference tables, and font resources into a unified binary structure. Re-builds the object tree under a single PDF catalog writer entirely client-side.',
        functionality: 'Enables merging two or more PDF files into a single, cohesive document. Includes a visual dashboard for rearranging files and pages via drag-and-drop, custom range selections (e.g., merging page 1 of File A with page 3 of File B), and option configurations to preserve or strip annotations and form fields.',
        howItWorks: '1. Reads uploaded PDF files sequentially as raw byte streams. 2. Instantiates a clean document target using `pdf-lib`. 3. Loops through source documents, copying page structures, content streams, and resource dictionaries. 4. Re-maps indirect object references to prevent index collisions in the consolidated cross-reference table. 5. Writes the unified byte stream and triggers a direct browser save.',
        technicalSpecs: 'Memory usage scales linearly with input file sizes (approx. 2.5x raw file size in RAM during compilation). Handles files up to 500MB depending on system memory boundaries.'
      },
      {
        id: 'pdf-split',
        name: 'Split PDF',
        engine: 'pdf-lib (WASM Compiler)',
        details: 'Parses the document\'s catalog hierarchy and cross-reference table. Creates a clean, empty document container and clones specific pages with their resource dictionaries (fonts, XObjects) before writing a serialized PDF byte stream.',
        functionality: 'Supports extraction of specific page ranges, splitting a multi-page PDF into separate single-page files, and custom groups extraction. Provides visual thumbnail selections of all pages prior to splitting.',
        howItWorks: '1. Ingests the source PDF and builds its internal object tree. 2. Validates user-specified split criteria (ranges or single indices). 3. Clones page maps from the source tree into separate document structures. 4. Recursively copies references to dependent fonts, graphics states, and image resources. 5. Serializes each split branch into its own ArrayBuffer and downloads them separately or packages them in a ZIP file.',
        technicalSpecs: 'Maintains original compression filters (e.g., FlateDecode) during page copying to prevent quality loss or file bloating.'
      },
      {
        id: 'pdf-compress',
        name: 'Compress PDF',
        engine: 'pdf-lib Optimization API',
        details: 'Locates resource streams in the object table, traversing image streams to downsample high-resolution raster objects and running standard deflate compression on text streams while stripping redundant XML metadata and creator attributes.',
        functionality: 'Provides adjustable compression levels (Low, Medium, High). Downsamples high-resolution embedded images to target DPI limits (72, 150, or 300 DPI), strips metadata structures, flat-decompresses and re-compresses stream elements, and simplifies vector paths.',
        howItWorks: '1. Scans the PDF object map to isolate XObject image streams. 2. Extracts image payloads (JPEG/PNG), loads them onto offscreen canvas contexts, and resizes them according to the selected compression ratio. 3. Re-encodes modified graphics back into compressed stream structures. 4. Identifies and deletes unnecessary metadata (Creator, XML, thumbnails). 5. Rebuilds the PDF catalog.',
        technicalSpecs: 'Reduces typical scanned documents file size by 50% to 80%. Operates strictly in Web Workers to prevent blocking UI interactivity.'
      },
      {
        id: 'pdf-to-img',
        name: 'PDF → Image',
        engine: 'PDF.js Render Target',
        details: 'Executes PDF page rasterization by compiling page operators into standard 2D canvas drawing sequences at custom device-pixel-ratio scales, yielding clean base64 data URLs in PNG or JPEG format.',
        functionality: 'Converts PDF document pages into separate high-resolution image assets (PNG, JPEG, WebP). Features customizable export DPI resolutions (up to 300 DPI) and select page ranges, exporting outputs as single files or a ZIP archive.',
        howItWorks: '1. Opens the PDF catalog structure. 2. Iterates through the target page list. 3. Sets up an OffscreenCanvas scaled by the selected resolution factor (e.g., 2x or 3x scale). 4. Invokes PDF.js to render page operators onto the canvas context. 5. Converts canvas layouts to image blobs via `canvas.toBlob` and queues them for download.',
        technicalSpecs: 'DPI ranges: 72 DPI (1.0x scale), 150 DPI (2.0x scale), 300 DPI (4.16x scale). Performance scales with vector complexity and image dimensions.'
      },
      {
        id: 'img-to-pdf',
        name: 'Image → PDF',
        engine: 'pdf-lib Image Embedder',
        details: 'Decodes raw image headers to match dimensions, instantiates a new PDF catalog structure, registers the image stream as a page content resource, and draws the bounding box on the graphics context.',
        functionality: 'Assembles multiple images (PNG, JPG, WebP, GIF) into a single PDF document. Includes page size selection presets (A4, Letter, Custom), margin controls, image rotation adjustments, and drag-and-drop page ordering.',
        howItWorks: '1. Loads input image files as binary buffers. 2. Decodes image properties to calculate aspect ratios and scales. 3. Creates a blank PDF catalog. 4. Embeds each image as a page resource stream, adjusting dimensions to fit the page settings. 5. Serializes the catalog data and triggers local browser download.',
        technicalSpecs: 'Supports JPEG and PNG formats natively. Converts WebP and GIF layouts to PNG structures before embedding, ensuring compliance with standard PDF viewers.'
      },
      {
        id: 'pdf-watermark',
        name: 'Add Watermark',
        engine: 'pdf-lib Text overlays',
        details: 'Parses page dimensions, injects a standard translucent font state matrix, and appends a text draw operator stream directly at calculated relative coordinates without modifying underlying document layers.',
        functionality: 'Overlays custom text or image watermarks onto existing PDF pages. Includes text font/color customization, rotation adjustments, opacity sliders, and tiled formatting support.',
        howItWorks: '1. Parses the source PDF structure. 2. Computes page size coordinates. 3. Embeds custom fonts or image assets in the resource dictionary. 4. Appends a graphics state operator stream at the end of each page, drawing text or images with transparency configurations. 5. Re-saves the document stream.',
        technicalSpecs: 'Watermarks are placed as separate vector/image object overlays, which may remain editable in advanced editors unless flattened.'
      },
      {
        id: 'pdf-sign',
        name: 'Sign PDF',
        engine: 'pdf-lib Graphics Context',
        details: 'Captures mouse or touch coordinates on an HTML5 canvas to produce a vector stroke path, converting coordinates into a standard PDF path description and drawing the vector overlay directly onto the target page stream.',
        functionality: 'Enables quick signing of PDF files. Features a mouse/touch drawing pad to create signatures, support for uploading signature images, interactive signature placement, and color customizers.',
        howItWorks: '1. Tracks touch or mouse coordinates on a drawing canvas and translates them into vector paths. 2. Converts drawing states into transparent PNG files. 3. Embeds signature PNGs as XObject resources in the target PDF. 4. Computes target page coordinates based on user click placement and draws the signature. 5. Saves the modified PDF stream.',
        technicalSpecs: 'Integrates vector signatures as image overlays. Does not include cryptographic digital signature verification (PKI) natively.'
      },
      {
        id: 'pdf-protect',
        name: 'Protect PDF',
        engine: 'pdf-lib Encryption Standard',
        details: 'Applies client-side security algorithms to encrypt the PDF document structure. Sets permission bitmasks to block printing, copying, or modifying, and formats standard user/owner challenge strings in the trailer.',
        functionality: 'Secures PDF files by setting passwords for viewing or restricting operations (printing, text copying, content modification). Uses standard encryption protocols.',
        howItWorks: '1. Ingests the PDF byte array. 2. Configures a permission bitmask dictionary containing permission flags. 3. Encrypts stream contents using password-derived cryptographic keys. 4. Creates an /Encrypt dictionary referencing user/owner passwords and cryptographic parameters. 5. Formats the output stream.',
        technicalSpecs: 'Supports standard RC4 and AES-128 cryptographic algorithms. Compatible with standard PDF readers (Adobe Acrobat, Chrome PDF Viewer).'
      },
      {
        id: 'pdf-ocr',
        name: 'Extract Text (OCR)',
        engine: 'PDF.js Text Content Parser',
        details: 'Processes page text streams, resolving font maps, spacing arrays, and carriage return operators to extract clean, ordered plain-text strings directly from vector streams without external API requests.',
        functionality: 'Reads and extracts text content from PDF files. Processes embedded text matrices, handles layout structures, and supports page selections. Exports text as TXT or JSON.',
        howItWorks: '1. Uses PDF.js to open the file. 2. Iterates through target pages and fetches text content nodes containing strings, positioning vectors, and layout structures. 3. Maps text nodes based on geometric grid coordinates. 4. Formats text lines and outputs the consolidated string.',
        technicalSpecs: 'Only extracts pre-existing vector text paths. For scanned image PDFs, use the OCR scanner tool in the Document Suite.'
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
        functionality: 'Removes solid backgrounds from photos. Features color picker sampling, tolerance settings, border feathering, and output transparent PNG exports.',
        howItWorks: '1. Draws the image onto a canvas. 2. Extracts 1D Uint8ClampedArray pixel values (RGBA). 3. Loops through pixels, calculates CIELAB color distance between pixel colors and background targets. 4. Applies transparency to pixels within tolerance limits. 5. Redraws the canvas and saves the output.',
        technicalSpecs: 'Optimized for high-contrast, flat backgrounds. Processing time scales with image size (e.g., ~1.2s for 4K images).'
      },
      {
        id: 'image-resizer',
        name: 'Image Resizer',
        engine: 'Canvas Scaling (Lanczos/Bilinear)',
        details: 'Draws source images onto an OffscreenCanvas container configured with target dimensions, utilizing bilinear or bicubic interpolation algorithms in browser rendering engines to prevent aliasing artifacts.',
        functionality: 'Resizes images to target dimensions. Includes custom height/width inputs, percentage sliders, aspect ratio locking, and DPI configurations.',
        howItWorks: '1. Loads image files into HTMLImageElements. 2. Creates an OffscreenCanvas matching target dimensions. 3. Configures interpolation scaling. 4. Draws the image onto the canvas, adjusting resolutions. 5. Exports image blobs.',
        technicalSpecs: 'Uses browser-native scaling algorithms. Supports output resolutions up to 16,000 x 16,000 pixels.'
      },
      {
        id: 'image-compressor',
        name: 'Image Compressor',
        engine: 'Canvas JPEG/WebP Quantization',
        details: 'Extracts raw CanvasImageData, executing discrete cosine transforms (DCT) and quantization matrices using configured quality indices, and encodes the output into compressed JPEG or WebP data blobs.',
        functionality: 'Compresses image files sizes. Features quality adjusters, file size previews, format conversions, and batch exports.',
        howItWorks: '1. Reads source image files. 2. Draws graphics onto a CanvasRenderingContext2D. 3. Invokes `toBlob` specifying quality ratios. 4. Compares original and output file sizes, displaying compression statistics.',
        technicalSpecs: 'Supports JPEG, WebP, and PNG outputs. Compressor reductions vary based on image content (gradients and details).'
      },
      {
        id: 'crop-rotate',
        name: 'Crop & Rotate Tool',
        engine: 'Canvas 2D Transform Matrices',
        details: 'Applies affine translation, rotation, and clipping matrices to a CanvasRenderingContext2D canvas, then draws the cropped section from pixel coordinate bounds to yield a newly oriented asset.',
        functionality: 'Crops and rotates images. Includes aspect ratio presets, crop grids, free-form rotation handles, and flipping functions.',
        howItWorks: '1. Loads images to drawing canvases. 2. Configures translation and rotation matrices. 3. Sets cropping bounding boxes. 4. Captures selected areas and draws them onto target canvases. 5. Exports output blobs.',
        technicalSpecs: 'Maintains pixel resolutions without interpolation when doing 90/180/270 degree rotations.'
      },
      {
        id: 'ai-enhancer',
        name: 'AI Image Enhancer',
        engine: 'Canvas ImageData Filter Kernels',
        details: 'Applies multi-pass digital filters including contrast stretching, gamma adjustments, and customized pixel-convolution kernels to optimize sharpness, brightness, and color balance directly in-memory.',
        functionality: 'Enhances image clarity and colors. Features auto-adjustments, contrast stretching, sharpness, and brightness controls.',
        howItWorks: '1. Reads pixel color matrices. 2. Computes color histograms to determine contrast bounds. 3. Applies gamma correction formulas and sharpening convolution filters. 4. Renders output layers.',
        technicalSpecs: 'Uses lightweight client-side pixel shaders. Runs in workers for high-res images.'
      },
      {
        id: 'watermark-tool',
        name: 'Watermark Tool',
        engine: 'Canvas Layering & Compositing',
        details: 'Uses globalAlpha composite operations to draw logo PNGs or custom text strings onto a baseline image matrix, matching target dimensions and position vectors before compiling to an output blob.',
        functionality: 'Overlays watermarks onto photos. Supports custom text styling, logo image uploads, opacity settings, and tiling layouts.',
        howItWorks: '1. Draws images to canvas. 2. Sets composition variables for transparency. 3. Draws overlay text or image resources at selected coordinates. 4. Converts canvas outputs to files.',
        technicalSpecs: 'Embeds watermarks directly into the pixel raster layer, preventing simple extraction or removal.'
      },
      {
        id: 'image-upscaler',
        name: 'Image Upscaler',
        engine: 'Canvas Bilinear Interpolation',
        details: 'Iterates image scale increments using OffscreenCanvas, mapping target dimensions with interpolation filters and color adjustments to construct smooth upscaled outputs.',
        functionality: 'Upscales images while reducing blur. Features 2x/4x scaling ratios and edge smoothing.',
        howItWorks: '1. Loads image targets. 2. Performs multi-pass scaling on intermediary canvases. 3. Runs sharpening filters on each scale step to preserve edges. 4. Renders final outputs.',
        technicalSpecs: 'Uses CSS image-rendering properties and canvas filters. Best suited for vector art and text images.'
      },
      {
        id: 'palette-extractor',
        name: 'Color Palette Extractor',
        engine: 'Canvas Pixel Quantization (Median Cut)',
        details: 'Samples pixel clusters, executing a median-cut color quantization algorithm to isolate color spaces and identify dominant hex codes, outputting a curated palette array.',
        functionality: 'Extracts dominant colors from photos. Features palette count adjusters, color codes copies (HEX, RGB), and styling guides.',
        howItWorks: '1. Reads image pixels. 2. Maps RGB colors into a three-dimensional space. 3. Splits the color box at median points. 4. Averages colors inside each box. 5. Returns dominant hex lists.',
        technicalSpecs: 'Uses median-cut quantization. Samples every Nth pixel to optimize execution speed on large files.'
      },
      {
        id: 'collage-maker',
        name: 'Collage Maker',
        engine: 'Canvas Grid Compositing',
        details: 'Calculates layout bounds based on template files, draws multiple input image structures onto relative sub-rectangles, and applies customizable borders, margins, and padding offsets.',
        functionality: 'Creates photo collages. Includes template layouts, margin spacing, background colors, and border settings.',
        howItWorks: '1. Computes layout coordinate boxes. 2. Draws uploaded images onto their matching grid locations. 3. Applies styling overlays. 4. Saves collages.',
        technicalSpecs: 'Adapts output resolution based on the highest-resolution input image to preserve quality.'
      },
      {
        id: 'format-converter',
        name: 'Format Converter',
        engine: 'Canvas toBlob Serialization',
        details: 'Loads input files into a browser Image element, draws the element to canvas context, and serializes the binary content into PNG, JPEG, WebP, or AVIF formats using specific MIME parameters.',
        functionality: 'Converts images between PNG, JPEG, WebP, AVIF, and ICO formats. Supports bulk queue actions.',
        howItWorks: '1. Converts image files to URL structures. 2. Renders images to offscreen canvas configurations. 3. Serializes arrays using target export formats. 4. Downloads files.',
        technicalSpecs: 'AVIF and WebP exports require browser-native encoding support.'
      }
    ]
  },
  document: {
    title: 'Document Suite',
    desc: 'Local text editors, document template generators, academic citations, and dictionaries.',
    list: [
      {
        id: 'document-details-editor',
        name: 'Document Details Editor',
        engine: 'pdf-lib & JSZip',
        details: 'Parses PDF dictionaries and OOXML core properties (docProps/core.xml) in memory. Enables bulk editing and removal of personal details (Authors, Title, Subject, Last saved by).',
        functionality: 'Edit or remove hidden file details (metadata) from PDFs and Word/Excel/PowerPoint documents simultaneously. Includes batch editing and single-click privacy scrubbing.',
        howItWorks: '1. User uploads files. 2. App detects format and extracts details via pdf-lib or JSZip. 3. User modifies or scrubs details. 4. App reconstructs the file binaries and downloads them.',
        technicalSpecs: 'Operates completely locally in-browser. Capable of handling both PDF binary structures and Office ZIP archives seamlessly.'
      },
      {
        id: 'rich-text',
        name: 'Rich Text Editor',
        engine: 'HTML5 contentEditable API + DOM Compiler',
        details: 'Manages custom styling ranges using document selection ranges, rendering styled DOM nodes in real-time and exporting results as styled CSS-inline HTML, raw TXT, or PDF layouts.',
        functionality: 'Enables rich text editing with standard options (headings, lists, alignments, colors). Exports documents to HTML, PDF, or text formats.',
        howItWorks: '1. Binds DOM actions to document selections. 2. Runs text formatting commands on active content layers. 3. Compiles inline styles. 4. Exports content.',
        technicalSpecs: 'Maintains semantic HTML tags. Handles layouts via local CSS bindings.'
      },
      {
        id: 'markdown-editor',
        name: 'Markdown Editor',
        engine: 'Markdown Parse Compiler',
        details: 'Tokenizes Markdown strings using clean regex parsers, compiling elements like lists, tables, code blocks, and headers into structured HTML strings rendered directly in the editor workspace.',
        functionality: 'Write Markdown with real-time preview. Features syntax highlighting, shortcut actions, and MD/HTML exports.',
        howItWorks: '1. Tracks text area content. 2. Tokenizes Markdown symbols (e.g. #, **, *). 3. Compiles tokens to standard HTML nodes. 4. Displays updates.',
        technicalSpecs: 'Lightweight parse engine. Prevents script injection by sanitizing outputs.'
      },
      {
        id: 'ocr-scanner',
        name: 'OCR Scanner',
        engine: 'Tesseract.js WASM Engine',
        details: 'Loads a Tesseract WebAssembly engine inside a Web Worker. Passes rasterized image buffers to run neural OCR character recognition, outputting coordinates and bounding box text structures.',
        functionality: 'Scans text from images. Features multi-language parsing, text copies, and TXT/PDF exports.',
        howItWorks: '1. Starts a Web Worker with Tesseract.js. 2. Decodes image pixels to grayscale matrixes. 3. Feeds pixels to neural classifiers. 4. Returns recognized text coordinates.',
        technicalSpecs: 'Performance depends on system thread configurations. Downloads language files directly to browser storage caches.'
      },
      {
        id: 'resume-builder',
        name: 'Resume Builder',
        engine: 'Local Schema Compiler',
        details: 'Binds user form fields into a normalized JSON CV schema, merging data structures with local CSS layouts and rendering printable PDF views via window.print CSS rules.',
        functionality: 'Creates professional resumes. Features layout templates, fields for work/education, and direct PDF prints.',
        howItWorks: '1. Binds input fields into JSON schemas. 2. Interpolates values into HTML configurations. 3. Configures print CSS rules. 4. Trims pages.',
        technicalSpecs: 'Exports structure schemas in standard JSON formats. CSS styles are print-optimized.'
      },
      {
        id: 'invoice-gen',
        name: 'Invoice Generator',
        engine: 'Local Arithmetic Compiler',
        details: 'Performs float arithmetic calculations on invoice tables, computing line-item sums, tax rates, discounts, and formatting structured receipts ready for local storage saving or printing.',
        functionality: 'Creates invoices and receipts. Features automatic calculations, currency options, logos upload, and PDF exports.',
        howItWorks: '1. Tracks table row parameters. 2. Runs arithmetic calculators for totals. 3. Maps items to layouts. 4. Prints outputs.',
        technicalSpecs: 'Ensures float accuracy using localized rounding routines. Offline templates are saved in local caches.'
      },
      {
        id: 'summarizer',
        name: 'Summarizer',
        engine: 'Frequency Heuristic TF-IDF Parser',
        details: 'Tokenizes text into sentences, stripping common stopwords and computing local TF-IDF weights to identify high-importance phrases, compiling a concise summary structure.',
        functionality: 'Summarizes text documents. Features summary length adjusters and key points highlights.',
        howItWorks: '1. Tokenizes texts. 2. Removes common stopwords. 3. Computes TF-IDF occurrences scores. 4. Ranks sentences. 5. Returns high-ranking segments.',
        technicalSpecs: 'Heuristic text analyzer. Operates on client thread with rapid execution.'
      },
      {
        id: 'translator',
        name: 'Translator',
        engine: 'Local Dictionary Mapping',
        details: 'Performs client-side string translations using dictionary mappings, looking up vocabulary and syntactic templates to handle text conversions offline.',
        functionality: 'Offline text translation. Supports basic languages, word highlights, and character count counters.',
        howItWorks: '1. Tokenizes input texts. 2. Matches structures against JSON dictionary maps. 3. Resolves syntax mappings. 4. Returns translated text.',
        technicalSpecs: 'Best suited for simple strings. For complex context translation, use Ollama models in the AI Suite.'
      },
      {
        id: 'grammar-fixer',
        name: 'Grammar Fixer',
        engine: 'Regex Match Pattern Engine',
        details: 'Executes multiple regular expressions checking for common grammatical mistakes, double spaces, and capitalization errors, showing highlighting selectors for corrections.',
        functionality: 'Corrects grammar and spelling errors. Features spelling highlights and auto-correct actions.',
        howItWorks: '1. Matches text patterns against regex datasets. 2. Marks matches positions. 3. Suggests correction alternatives.',
        technicalSpecs: 'Runs fully client-side. Allows custom rules additions.'
      },
      {
        id: 'citation-gen',
        name: 'Citation Generator',
        engine: 'Citation Format Standardizer',
        details: 'Compiles bibliography entries (APA, MLA, Chicago styles) by mapping input metadata strings to style rules and outputting sorted HTML strings.',
        functionality: 'Creates references (APA, MLA, Chicago). Supports books, journals, websites, and exports list structures.',
        howItWorks: '1. Collects author/title/date strings. 2. Matches items to citation templates. 3. Renders formatted styles.',
        technicalSpecs: 'Matches official style guides. Outputs plain-text citations.'
      },
      {
        id: 'code-notes',
        name: 'Code Notes Editor',
        engine: 'DOM Syntax Highlight Parser',
        details: 'Renders dynamic text input with synchronized syntax highlighting overlays, parsing statements and comments into styled span tokens for readability.',
        functionality: 'Takes notes containing code snippets. Features syntax highlighting and categories tags.',
        howItWorks: '1. Tracks code input. 2. Runs lexical analyzers to tag keywords. 3. Overlays styled spans. 4. Saves locally.',
        technicalSpecs: 'Uses lightweight custom lexical parsers. Saves data in local IndexedDB.'
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
        functionality: 'Converts JPG images to PNG formats and vice versa. Preserves color details and quality.',
        howItWorks: '1. Loads source graphics. 2. Renders to canvas elements. 3. Runs `canvas.toBlob` with desired MIME parameters. 4. Exports outputs.',
        technicalSpecs: 'Converts alpha channels to solid white when exporting from PNG to JPG.'
      },
      {
        id: 'webp-jpg',
        name: 'WebP ↔ JPG Converter',
        engine: 'Canvas MIME Serialization',
        details: 'Converts WebP files to JPG and vice-versa in the browser.',
        functionality: 'Bi-directional WebP/JPG converter. Supports quality adjustments and fast downloads.',
        howItWorks: '1. Renders WebP/JPG images to canvas. 2. Exports image bytes using browser encoders. 3. Triggers downloads.',
        technicalSpecs: 'Preserves image dimensions. Compression limits depend on quality configurations.'
      },
      {
        id: 'mp4-gif',
        name: 'MP4 ↔ GIF Converter',
        engine: 'FFmpeg WASM Subprocessor',
        details: 'Launches an FFmpeg WASM worker in-browser, parsing video frames into sequence arrays, applying color quantization tables, and assembling standard animated GIF frames.',
        functionality: 'Converts MP4 video clips into animated GIFs. Features frame rate limits and dimensions scale controls.',
        howItWorks: '1. Ingests video bytes. 2. Loads FFmpeg WASM. 3. Converts frames to image sequences. 4. Applies color palettes and compiles GIFs.',
        technicalSpecs: 'Processes frames on background threads. Best suited for short clips under 15 seconds.'
      },
      {
        id: 'mp3-wav',
        name: 'MP3 ↔ WAV Converter',
        engine: 'Web Audio AudioContext',
        details: 'Decodes MP3 binaries to PCM AudioBuffers, instantiates a WAV writer, writes standard RIFF headers, and writes PCM float arrays as 16-bit signed integers.',
        functionality: 'Converts audio tracks from MP3 to WAV. Preserves audio sample rates and channels.',
        howItWorks: '1. Decodes MP3 bytes via AudioContext. 2. Instantiates WAV file structures. 3. Translates float samples to 16-bit integers. 4. Downloads files.',
        technicalSpecs: 'Supports standard 44.1kHz stereo audio profiles.'
      },
      {
        id: 'csv-json',
        name: 'CSV ↔ JSON Converter',
        engine: 'Structured String Array Parser',
        details: 'Splits CSV tables with regex considering escape quotes, maps column headers to JSON keys, or flattens nested JSON hierarchies back into comma-separated arrays.',
        functionality: 'Converts spreadsheets (CSV) to JSON formats and vice-versa. Custom delimiters support.',
        howItWorks: '1. Parses CSV rows. 2. Resolves headers to keys. 3. Creates JSON structures, or flattens JSON arrays to table lines.',
        technicalSpecs: 'Handles nested objects and commas in quotes.'
      },
      {
        id: 'xml-json',
        name: 'XML ↔ JSON Converter',
        engine: 'Browser DOMParser Engine',
        details: 'Parses XML markup strings into standard XML DOM structures using DOMParser, recursively traversing nodes to compile a corresponding JSON schema.',
        functionality: 'Converts XML to JSON formats and vice-versa. Features code indentation styling.',
        howItWorks: '1. Parses XML strings. 2. Traverses nodes recursively to map attributes and values. 3. Stringifies outputs.',
        technicalSpecs: 'Validates XML schemas prior to formatting.'
      },
      {
        id: 'docx-txt',
        name: 'DOCX ↔ TXT Converter',
        engine: 'JSZip XML Traverser',
        details: 'Unpacks word document archives, extracts core file content (word/document.xml), and filters out text contents from tag annotations.',
        functionality: 'Extracts plain-text from Word documents (.docx). Preserves paragraph spacings.',
        howItWorks: '1. Unpacks docx files via JSZip. 2. Locates XML body content. 3. Filters out styling tags. 4. Returns clean text.',
        technicalSpecs: 'Extracts text content only. Ignores embedded images and tables.'
      },
      {
        id: 'epub-pdf',
        name: 'EPUB → PDF Converter',
        engine: 'JSZip HTML Compiler',
        details: 'Extracts EPUB container HTML files, processes embedded CSS properties, and formats the text layouts into multi-page PDF documents via pdf-lib.',
        functionality: 'Converts EPUB e-books to PDF documents. Formats margins and page counts.',
        howItWorks: '1. Unpacks EPUB file packages. 2. Formats XHTML contents to page structures. 3. Compiles PDFs via pdf-lib.',
        technicalSpecs: 'Handles CSS styling. Custom margins prevent text cutoffs.'
      },
      {
        id: 'base64-tool',
        name: 'Base64 Converter',
        engine: 'FileReader API Binary Serializer',
        details: 'Uses FileReader to read local binary files, compiling them as base64-encoded strings, or decodes them back to binary arrays using standard browser APIs.',
        functionality: 'Converts files to Base64 strings and vice-versa. Features data URI helpers.',
        howItWorks: '1. Reads files via FileReader. 2. Converts bytes to Base64 strings, or decodes base64 strings back to binary formats.',
        technicalSpecs: 'Handles large files without browser memory allocation crashes.'
      },
      {
        id: 'zip-extractor',
        name: 'ZIP Extractor',
        engine: 'JSZip File Decompressor',
        details: 'Parses the central directory header of uploaded ZIP archives, extracting compression properties and writing individual file blobs.',
        functionality: 'Unpacks ZIP file packages. Displays folders, file structures, and sizes.',
        howItWorks: '1. Parses ZIP catalog records. 2. Decompresses files via JSZip. 3. Maps contents to browser download files.',
        technicalSpecs: 'Supports deflation decompression algorithms. Runs entirely in browser.'
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
        functionality: 'Creates standard QR codes. Custom color styles, logo overlays, and SVG/PNG exports.',
        howItWorks: '1. Converts input to code arrays. 2. Adds error correction matrices. 3. Draws grids onto canvas.',
        technicalSpecs: 'Adjusts grid density based on input string sizes.'
      },
      {
        id: 'qr-scanner',
        name: 'QR Scanner',
        engine: 'WebRTC Stream + jsQR WASM Decoder',
        details: 'Captures webcam video frames, extracts image pixel matrices, and runs jsQR image processing to locate and decode QR identifiers.',
        functionality: 'Scans QR codes using webcams. Decodes URLs and strings. Logs scanning histories.',
        howItWorks: '1. Reads video inputs. 2. Renders frames onto canvas context. 3. Uses jsQR to locate alignment markers. 4. Returns data.',
        technicalSpecs: 'Requires user webcam permissions. Runs at up to 30 frames per second.'
      },
      {
        id: 'wifi-qr',
        name: 'WiFi QR Generator',
        engine: 'WIFI Credential Format Standardizer',
        details: 'Serializes network parameters to standard protocol text, encoding it into custom-colored QR graphics.',
        functionality: 'WiFi connection QR generator. Supports WPA/WPA2 settings and hidden SSIDs.',
        howItWorks: '1. Formats SSID/password parameters into wifi protocol text strings. 2. Converts strings to QR matrices.',
        technicalSpecs: 'Standard protocol format compatible with iOS and Android camera apps.'
      },
      {
        id: 'vcard-qr',
        name: 'vCard QR Generator',
        engine: 'vCard Schema Standardizer',
        details: 'Assembles contact details into standard vCard specifications and generates corresponding QR codes.',
        functionality: 'Generates contact QR codes. Custom fields for names, emails, addresses, and organizations.',
        howItWorks: '1. Formats fields to vCard spec templates. 2. Renders output QR codes.',
        technicalSpecs: 'Complies with standard vCard 3.0 parameters.'
      },
      {
        id: 'event-qr',
        name: 'Event QR Generator',
        engine: 'iCalendar Standardizer',
        details: 'Converts event details into standard iCalendar configurations, rendering them as QR code matrices.',
        functionality: 'Creates calendar events QR codes. Inputs for dates, locations, and descriptions.',
        howItWorks: '1. Formats details to iCal event structures. 2. Converts events text to QR grids.',
        technicalSpecs: 'Enables quick additions of events on smartphones.'
      },
      {
        id: 'payment-qr',
        name: 'Payment QR Generator',
        engine: 'Banking QR Protocol Standardizer',
        details: 'Formats transaction details according to global banking QR systems, outputting scannable codes.',
        functionality: 'Generates payment QR codes. Custom fields for currencies, bank IBAN codes, and amounts.',
        howItWorks: '1. Encodes banking coordinates to EMVCo formats. 2. Draws payment QR codes.',
        technicalSpecs: 'Supports standard banking QR formats.'
      },
      {
        id: 'barcode-gen',
        name: 'Barcode Generator',
        engine: 'JsBarcode SVG Engine',
        details: 'Translates input data into Code128, EAN, or UPC barcode representations, drawing clean SVG vectors.',
        functionality: 'Generates standard barcodes (Code128, EAN, Code39). Format options, sizing, and colors.',
        howItWorks: '1. Translates numeric strings to barcode modules. 2. Draws SVG elements.',
        technicalSpecs: 'Ensures standard padding values to ensure barcode scanners compatibility.'
      },
      {
        id: 'barcode-scan',
        name: 'Barcode Scanner',
        engine: 'WebRTC Camera + Barcode Detector API',
        details: 'Utilizes native browser BarcodeDetector APIs or WASM libraries to process camera streams and decode barcodes.',
        functionality: 'Scans barcodes via cameras. Detects EAN-13, Code128, and UPC formats.',
        howItWorks: '1. Connects to video streams. 2. Detects barcode patterns in frame arrays. 3. Decodes patterns.',
        technicalSpecs: 'Uses native browser APIs when available, falling back to WASM libraries.'
      },
      {
        id: 'bulk-qr',
        name: 'Bulk QR Generator',
        engine: 'qrcode Batch Engine',
        details: 'Iterates through CSV datasets, compiling separate QR codes in batch and packing them into downloadable ZIP archives.',
        functionality: 'Batch generates QR codes from CSV lists. Saves archives as ZIP files.',
        howItWorks: '1. Parses CSV columns. 2. Loops items to draw separate QR canvas assets. 3. Packages files into ZIP arrays.',
        technicalSpecs: 'Handles queues up to 500 rows. Compression time depends on CPU speeds.'
      },
      {
        id: 'qr-designer',
        name: 'QR Designer',
        engine: 'Canvas Custom Styling Compositor',
        details: 'Renders QR code patterns with modern gradient fills, rounded alignment eyes, and overlays logo images in the center.',
        functionality: 'Designs custom QR codes. Rounded eye shapes, gradient fills, and custom logos placement.',
        howItWorks: '1. Parses QR matrices. 2. Uses custom canvas rendering paths. 3. Integrates logos. 4. Exports PNGs.',
        technicalSpecs: 'Ensures code readability by keeping logo dimensions under 25% of QR boundaries.'
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
        functionality: 'Trims video files offline. Slider timestamp configurations, fast conversion, and MP4 exports.',
        howItWorks: '1. Loads video into FFmpeg WASM. 2. Runs trim commands seeking start/end points. 3. Downloads files.',
        technicalSpecs: 'Uses stream copying to ensure rapid, quality-lossless exports.'
      },
      {
        id: 'compress-video',
        name: 'Compress Video',
        engine: 'FFmpeg WASM Transcoder',
        details: 'Runs FFmpeg WebAssembly to transcode input streams to modern container types (H.264/AAC), adjusting output bitrates.',
        functionality: 'Reduces video file sizes. Resolution selection list and output quality controllers.',
        howItWorks: '1. Mounts videos in WASM workspace. 2. Re-encodes codecs via FFmpeg. 3. Outputs files.',
        technicalSpecs: 'CPU performance scales with video resolution and codec choice.'
      },
      {
        id: 'merge-videos',
        name: 'Merge Videos',
        engine: 'FFmpeg WASM Concatenator',
        details: 'Generates sequential file listings in FFmpeg WASM space, appending video tracks with matching structures.',
        functionality: 'Consolidates multiple videos. Drag-to-reorder files, fast join times, and MP4 formats.',
        howItWorks: '1. Loads video lists. 2. Generates text lists of files. 3. Merges streams via FFmpeg WASM.',
        technicalSpecs: 'Requires input files to have identical resolution and codec specifications.'
      },
      {
        id: 'convert-video',
        name: 'Convert Video',
        engine: 'FFmpeg WASM Container Exporter',
        details: 'Unpacks stream formats in FFmpeg WASM memory, remuxing tracks into MP4, WebM, or MKV containers.',
        functionality: 'Converts video containers (MP4, WebM, AVI). Audio settings overrides.',
        howItWorks: '1. Ingests source files. 2. Converts container wraps via FFmpeg WASM. 3. Downloads output.',
        technicalSpecs: 'Skips re-encoding when codecs match, making operations fast.'
      },
      {
        id: 'extract-audio',
        name: 'Extract Audio',
        engine: 'FFmpeg WASM Demuxer',
        details: 'Demuxes audio streams from video containers, copying the audio data directly to MP3 or WAV files.',
        functionality: 'Extracts sound tracks from video files. Format options: MP3, WAV, AAC.',
        howItWorks: '1. Loads video files. 2. Demuxes audio streams. 3. Encodes audio to MP3/WAV. 4. Saves files.',
        technicalSpecs: 'Extracts tracks quickly without processing video channels.'
      },
      {
        id: 'add-subtitles',
        name: 'Add Subtitles',
        engine: 'FFmpeg WASM Subtitle Burner',
        details: 'Burns subtitle strings (SRT or VTT) onto video streams using FFmpeg WASM filtering pipelines.',
        functionality: 'Burns subtitle files onto video frames. Supports SRT and VTT formats.',
        howItWorks: '1. Mounts subtitle and video files in WASM filesystem. 2. Runs subtitle filters via FFmpeg. 3. Outputs video.',
        technicalSpecs: 'Requires re-encoding, scaling run times with video lengths.'
      },
      {
        id: 'speed-control',
        name: 'Speed Control',
        engine: 'FFmpeg WASM Filter Engine',
        details: 'Applies video and audio filters to accelerate or slow down video streams without changing pitch.',
        functionality: 'Changes video playback speed. Speed limits: 0.25x to 4x. Pitch correction options.',
        howItWorks: '1. Evaluates target speed coefficients. 2. Runs video speed filters via FFmpeg. 3. Adjusts audio.',
        technicalSpecs: 'Uses setpts and atempo filters to adjust playback.'
      },
      {
        id: 'crop-video',
        name: 'Crop Video',
        engine: 'FFmpeg WASM Bounding Box Cropper',
        details: 'Trims video coordinate heights and widths to custom aspect ratios.',
        functionality: 'Crops video dimensions. Preset ratio overlays and pixel boundaries config.',
        howItWorks: '1. Loads videos. 2. Passes crop dimensions to FFmpeg vector filters. 3. Downloads files.',
        technicalSpecs: 'Renders crop outputs matching requested aspect ratios.'
      },
      {
        id: 'gif-maker',
        name: 'GIF Maker',
        engine: 'FFmpeg WASM GIF Encoder',
        details: 'Extracts frame sets, generates custom color palette matrices, and exports animated GIFs.',
        functionality: 'Creates GIFs from video files. Framerate controls, dimensions options, and loop parameters.',
        howItWorks: '1. Reads video frames. 2. Analyzes colors to build optimized palettes. 3. Encodes frames to GIFs.',
        technicalSpecs: 'Limits file size by optimizing color indexing ranges.'
      },
      {
        id: 'thumbnail-gen',
        name: 'Thumbnail Generator',
        engine: 'HTML5 Video Canvas Frame Grabber',
        details: 'Loads video source objects, seeks to targeted frames, and grabs pixel frames onto a canvas canvas.',
        functionality: 'Extracts still frames from videos. Image format customizer and timeline sliders.',
        howItWorks: '1. Binds video to browser players. 2. Seeks to target timelines coordinates. 3. Draws frames to canvas. 4. Saves images.',
        technicalSpecs: 'Grabs screenshots at frame accuracy.'
      },
      {
        id: 'face-blur',
        name: 'Face Blur',
        engine: 'Canvas2D + Skin Tone Detection Algorithm',
        details: 'Downsamples video frames to run a lightweight skin-tone color contour analysis in-browser, finding face regions and applying real-time filters (Gaussian Blur, Pixelation, or Solid Blackout) onto a canvas recording stream.',
        functionality: 'Allows users to hide faces in video files locally. Features automatic skin-tone face detection, multiple manual customizable blur zones with draggable coordinates, shape controls (Circle/Rectangle), blur types (Blur/Pixelate/Solid), and WebM rendering exports.',
        howItWorks: '1. Reads uploaded video. 2. Plays it through a hidden HTML5 video element mapped to a rendering canvas. 3. Identifies skin-color coordinate areas using HSV/YCbCr color boundary filters and overlays manual user-defined target zones. 4. Uses MediaRecorder on canvas captures to compile the processed streams into WebM downloads.',
        technicalSpecs: 'Fully local processing. Bitrates up to 8 Mbps. Does not upload files to remote servers.'
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
        functionality: 'Cuts and trims audio tracks. Visual wave timelines display, zoom controls, and fade styling options.',
        howItWorks: '1. Decodes audio files via AudioContext. 2. Extracts selected sample blocks. 3. Adds WAV headers. 4. Downloads WAVs.',
        technicalSpecs: 'Preserves sample ranges. Outputs 16-bit stereo PCM files.'
      },
      {
        id: 'audio-merge',
        name: 'Audio Merge',
        engine: 'AudioBuffer Concatenator',
        details: 'Assembles multiple decibel arrays together into a single AudioBuffer container, exporting files client-side.',
        functionality: 'Combines multiple audio files sequentially. Re-orders files and compiles results.',
        howItWorks: '1. Decodes input tracks. 2. Allocates consolidated buffers. 3. Copies samples. 4. Exports WAV files.',
        technicalSpecs: 'Re-samples files to match output rates.'
      },
      {
        id: 'noise-removal',
        name: 'Noise Removal',
        engine: 'Web Audio BiquadFilter Engine',
        details: 'Applies lowpass, highpass, or bandpass biquad filters to target audio, stripping ambient frequencies.',
        functionality: 'Removes background noise from audio. Highpass/lowpass filter adjusters and live previews.',
        howItWorks: '1. Routes audio through offline filter contexts. 2. Applies frequency filters. 3. Exports files.',
        technicalSpecs: 'Uses standard biquad filters.'
      },
      {
        id: 'audio-convert',
        name: 'Convert Audio',
        engine: 'Web Audio AudioBuffer Encoder',
        details: 'Loads audio formats and decodes/re-encodes them into WAV or MP3 files.',
        functionality: 'Converts audio containers (MP3, WAV, OGG, FLAC). Sizing and bitrate indicators.',
        howItWorks: '1. Decodes audio tracks. 2. Feeds PCM streams to encoders. 3. Compiles new outputs.',
        technicalSpecs: 'Web-native encoding structures prevent data corruption.'
      },
      {
        id: 'voice-recorder',
        name: 'Voice Recorder',
        engine: 'MediaRecorder API',
        details: 'Binds to microphone streams, capturing audio segments and serializing output to WAV/WEBM format.',
        functionality: 'Records voice through microphones. Features audio waveform previews, pause support, and WAV exports.',
        howItWorks: '1. Requests user microphone access. 2. Tracks voice arrays using MediaRecorder. 3. Saves audio.',
        technicalSpecs: 'Requires microphone permissions. Renders waveforms in real-time.'
      },
      {
        id: 'speech-to-text',
        name: 'Speech-to-Text',
        engine: 'Web Speech Recognition Engine',
        details: 'Leverages the native browser speech engine to transcribe speech segments into text strings in real-time.',
        functionality: 'Transcribes voice to text. Live editing, continuous speech tracking, and copies options.',
        howItWorks: '1. Connects to speech engines. 2. Decodes speech segments. 3. Renders transcribed text.',
        technicalSpecs: 'Requires system speech engine availability.'
      },
      {
        id: 'tts-fallback',
        name: 'Text-to-Speech',
        engine: 'Web SpeechSynthesis Engine',
        details: 'Invokes local browser speech synthesis tools, customizing voice accents and speeds.',
        functionality: 'Synthesizes speech from texts. Features speed/pitch customizers and multi-voice options.',
        howItWorks: '1. Passes text to window.speechSynthesis. 2. Triggers voice engines. 3. Plays audio.',
        technicalSpecs: 'Compatible with standard browser accessibility voice engines.'
      },
      {
        id: 'volume-booster',
        name: 'Volume Booster',
        engine: 'Web Audio GainNode',
        details: 'Routes AudioContext streams through a GainNode structure, amplifying signal decibels beyond standard ceilings.',
        functionality: 'Amplifies audio files volumes. Features volume percentage controls (up to 4x).',
        howItWorks: '1. Decodes audio files. 2. Sets GainNode multipliers. 3. Compiles outputs.',
        technicalSpecs: 'Limits output to prevent clipping distortion when volume levels are set too high.'
      },
      {
        id: 'podcast-editor',
        name: 'Podcast Editor',
        engine: 'Web Audio Mixer Engine',
        details: 'Overlays multiple audio tracks onto a single master layout, mixing sound channels together.',
        functionality: 'Mixes tracks for podcasts. Volume sliders and overlapping sound layers controls.',
        howItWorks: '1. Loads audio tracks. 2. Overlays structures in offline environments. 3. Mixes decibels.',
        technicalSpecs: 'Mixes outputs to stereo formats.'
      },
      {
        id: 'audio-visualizer',
        name: 'Audio Visualizer',
        engine: 'Web Audio AnalyserNode',
        details: 'Extracts real-time Fast Fourier Transform (FFT) frequencies, drawing dynamic audio wave graphics.',
        functionality: 'Renders audio visualizations. Style selections (waves, bars, circular grids) and export options.',
        howItWorks: '1. Decodes audio tracks. 2. Attaches AnalyserNodes. 3. Updates frequency coordinates. 4. Draws visualizer blocks.',
        technicalSpecs: 'Updates visualizer grids synchronously.'
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
        functionality: 'Validates and styles JSON strings. Features custom indents, minification, tree structures displays, and syntax error alerts.',
        howItWorks: '1. Parses JSON inputs. 2. Validates structures. 3. Stringifies output with custom indents. 4. Highlights values.',
        technicalSpecs: 'Requires valid JSON formatting. Handles large strings without memory crashes.'
      },
      {
        id: 'json-visualizer',
        name: 'JSON Tree Visualizer',
        engine: 'Custom React Recursive Renderer',
        details: 'Parses JSON strings and renders them as a highly interactive, collapsible tree for deep exploration of nested data structures.',
        functionality: 'Displays keys and values hierarchically with syntax highlighting. Allows collapsing and expanding nested objects and arrays.',
        howItWorks: '1. Parses raw JSON input. 2. Maps JSON types to styled recursive components. 3. Tracks collapse state locally.',
        technicalSpecs: 'Runs 100% offline. Safe for handling sensitive configuration structures.'
      },
      {
        id: 'jwt-decode',
        name: 'JWT Decoder',
        engine: 'Base64URL Decoder',
        details: 'Splits JSON Web Tokens at delimiters, decoding payloads into formatted JSON strings.',
        functionality: 'Decodes JWT strings. Splits header/payload coordinates and decodes expirations timestamps.',
        howItWorks: '1. Splits JWT tokens. 2. Decodes base64 elements. 3. Parses data to JSON. 4. Displays outputs.',
        technicalSpecs: 'Decrypts tokens format only. Does not verify signatures.'
      },
      {
        id: 'dev-base64',
        name: 'Base64 Tool',
        engine: 'window.atob / window.btoa',
        details: 'Converts plain-text to base64 formatting, or reads base64 files back to original binaries.',
        functionality: 'Bi-directional Base64 encoders and decoders. Supports text and files.',
        howItWorks: '1. Encodes strings using window.btoa, or decodes strings via window.atob. 2. Triggers downloads.',
        technicalSpecs: 'Ensures correct conversions of special characters.'
      },
      {
        id: 'regex-tester',
        name: 'Regex Tester',
        engine: 'RegExp Object Pattern Tester',
        details: 'Evaluates regular expressions against strings, highlighting match groups and replacement parameters.',
        functionality: 'Tests regular expressions. Displays highlights, matches counts, and group details.',
        howItWorks: '1. Compiles regex strings. 2. Runs searches on test targets. 3. Renders highlights.',
        technicalSpecs: 'Compatible with standard JavaScript Regex engines.'
      },
      {
        id: 'uuid-gen',
        name: 'UUID Generator',
        engine: 'window.crypto.randomUUID',
        details: 'Uses native cryptographically secure random number generators to output unique UUIDv4 keys.',
        functionality: 'Generates secure UUIDv4 identifiers. Bulk generations and lists copies.',
        howItWorks: '1. Calls browser crypto objects. 2. Generates secure random strings. 3. Returns values.',
        technicalSpecs: 'Complies with official UUIDv4 structures.'
      },
      {
        id: 'hash-gen',
        name: 'Hash Generator',
        engine: 'SubtleCrypto Digests',
        details: 'Computes SHA-1, SHA-256, or SHA-512 hashes from input string arrays offline.',
        functionality: 'Generates hashes for files and text. Supported algorithms: SHA-256, SHA-512, MD5.',
        howItWorks: '1. Converts input strings to Uint8Arrays. 2. Runs digests via window.crypto.subtle. 3. Returns hex hashes.',
        technicalSpecs: 'Executes digests client-side. Best suited for security hashes verification.'
      },
      {
        id: 'sql-workbench',
        name: 'SQL Workbench & Data Analyzer',
        engine: 'AlaSQL client-side database',
        details: 'Loads CSV/JSON file buffers into an in-memory SQL database, enabling advanced queries and dynamic chart creations.',
        functionality: 'Runs SQL queries locally. Automatic table schemas, query editor console, visual charting (bar/line/pie), and table exporters.',
        howItWorks: '1. Ingests CSV or JSON files. 2. Maps columns and registers tables. 3. Runs query in AlaSQL. 4. Visualizes using SVG charts.',
        technicalSpecs: 'Executes entirely in-memory. Supports standard SQL joins, groupings, and aggregation functions.'
      },
      {
        id: 'api-tester',
        name: 'API Tester',
        engine: 'fetch Client API',
        details: 'Dispatches client HTTP requests, measuring response timings, header parameters, and data payloads.',
        functionality: 'Sends API requests. Supported methods: GET, POST, PUT, DELETE. Header configurations and bodies.',
        howItWorks: '1. Collects target URLs. 2. Dispatches fetch requests. 3. Records time parameters. 4. Formats data.',
        technicalSpecs: 'Depends on browser CORS configurations when sending external API queries.'
      },
      {
        id: 'url-encoder',
        name: 'URL Encoder',
        engine: 'encodeURIComponent / decodeURIComponent',
        details: 'Encodes parameter values to safe URL formatting or decodes them.',
        functionality: 'Encodes and decodes URL strings. Handles URL queries, tags, and special characters.',
        howItWorks: '1. Runs encodeURIComponent/decodeURIComponent on text structures. 2. Outputs results.',
        technicalSpecs: 'Ensures correct conversions of whitespace and special characters.'
      },
      {
        id: 'html-minify',
        name: 'HTML Minifier',
        engine: 'Regex Minification Engine',
        details: 'Strips document whitespaces, carriage returns, and comment layouts from code strings.',
        functionality: 'Minifies HTML documents. Strips comments and carriage returns to reduce file sizes.',
        howItWorks: '1. Applies regex selectors to content. 2. Strips spaces. 3. Exports files.',
        technicalSpecs: 'Maintains inline scripting tags functionality.'
      },
      {
        id: 'color-converter',
        name: 'Color Converter',
        engine: 'Color Conversion Formulas',
        details: 'Computes conversion equations to map color definitions between HEX, RGB, HSL, and CMYK formats.',
        functionality: 'Converts color codes. Formats: HEX, RGB, HSL, CMYK. Features color pickers and displays.',
        howItWorks: '1. Tracks color selections. 2. Runs color coordinate equations. 3. Updates code fields.',
        technicalSpecs: 'Ensures accurate color mappings.'
      },
      {
        id: 'cron-parser',
        name: 'Cron Expression Parser',
        engine: 'Cron Parsing Algorithms',
        details: 'Parses cron expression schedules or generates strings interactively, displaying simulated execution runtimes.',
        functionality: 'Parses cron schedules. Features next execution dates predictions and interactive configurations.',
        howItWorks: '1. Parses cron strings. 2. Calculates execution schedules. 3. Displays results.',
        technicalSpecs: 'Validates cron parameters structures.'
      },
      {
        id: 'sql-formatter',
        name: 'SQL Formatter',
        engine: 'SQL Keyword Lexer Rules',
        details: 'Formats, minifies, and aligns SQL syntax keywords to customized tab indentations client-side.',
        functionality: 'Formats SQL strings. Custom indent options and uppercase adjustments for keywords.',
        howItWorks: '1. Tokenizes SQL commands. 2. Standardizes keyword layouts. 3. Renders formatted code.',
        technicalSpecs: 'Supports standard SQL commands (SELECT, INSERT, UPDATE, DELETE).'
      },
      {
        id: 'yaml-json',
        name: 'YAML ↔ JSON Converter',
        engine: 'YAML Parser and JSON Serializer',
        details: 'Inter-converts objects and arrays between YAML markup strings and standard nested JSON hierarchies.',
        functionality: 'Bi-directional conversions between YAML and JSON formats. Validates structures.',
        howItWorks: '1. Parses structures. 2. Re-maps node lists. 3. Stringifies output.',
        technicalSpecs: 'Maintains array maps and indentation formats.'
      },
      {
        id: 'md-table-gen',
        name: 'Markdown Table Generator',
        engine: 'Markdown Table Compiler',
        details: 'Generates structured Markdown syntax code for table structures using interactive headers and column alignments.',
        functionality: 'Generates Markdown tables. Row/column adjusters, alignments select, and cell input grid.',
        howItWorks: '1. Compiles grid values. 2. Adds pipe delimiters. 3. Outputs markdown code.',
        technicalSpecs: 'Outputs clean, styled markdown codes.'
      },
      {
        id: 'diff-checker',
        name: 'Diff Checker',
        engine: 'Line Diff Comparison Engine',
        details: 'Compares two text lists line-by-line, compiling deleted, added, or modified code line decorations.',
        functionality: 'Compares text differences. Side-by-side or inline view options, line numbers, and modifications highlight.',
        howItWorks: '1. Splits texts. 2. Identifies matching blocks. 3. Highlights additions/deletions.',
        technicalSpecs: 'Uses line-by-line comparison algorithms.'
      },
      {
        id: 'keycode-finder',
        name: 'Keyboard Keycode Finder',
        engine: 'DOM Keyboard Event Listeners',
        details: 'Tracks keypress logs dynamically, displaying key name, event code, character code, and active modifiers.',
        functionality: 'Finds key code values. Keypress event details (key name, code, keyCode) and modifiers indicators.',
        howItWorks: '1. Attaches keyboard event listeners. 2. Catches inputs. 3. Updates info cards.',
        technicalSpecs: 'Runs fully client-side on event triggers.'
      },
      {
        id: 'box-shadow-gen',
        name: 'Box Shadow Generator',
        engine: 'CSS Style Compilation Engine',
        details: 'Compiles custom offsets, colors, and blur settings into valid box-shadow properties and overlays them on a preview element.',
        functionality: 'Creates CSS box-shadow styles. Blur/spread sliders, colors picker, and CSS code copy.',
        howItWorks: '1. Reads sliders coordinates. 2. Compiles CSS styles. 3. Updates preview divs.',
        technicalSpecs: 'Outputs standard CSS code compatible with modern browsers.'
      },
      {
        id: 'base-converter',
        name: 'Base Converter',
        engine: 'Number Parsing Algorithms',
        details: 'Converts integers between base-10, base-2, base-8, and base-16 formats with logical steps walkthrough.',
        functionality: 'Converts numbers between base systems (Binary, Decimal, Octal, Hexadecimal). Step-by-step conversion solver.',
        howItWorks: '1. Converts input numbers. 2. Calculates conversions. 3. Returns results.',
        technicalSpecs: 'Supports conversion of large integers.'
      },
      {
        id: 'glassmorphism-gen',
        name: 'Glassmorphism Generator',
        engine: 'CSS Backdrop Filter Compiler',
        details: 'Computes combinations of saturation, blur, tint colors, and boundary borders into modern Glass CSS assets.',
        functionality: 'Generates Glassmorphism CSS styles. Saturation/blur controllers and background preview selections.',
        howItWorks: '1. Compiles styling layouts. 2. Updates local filters. 3. Outputs CSS.',
        technicalSpecs: 'Requires standard browser support for backdrop-filter CSS properties.'
      },
      {
        id: 'screen-info',
        name: 'Screen & Device Info',
        engine: 'DOM Window Screen API',
        details: 'Inspects client environment parameters including device viewport dimensions, pixel density, connection limits, and storage estimations.',
        functionality: 'Displays system specifications. Viewport size, resolution details, connection limits, and device storage estimates.',
        howItWorks: '1. Queries system screen APIs. 2. Maps parameters. 3. Renders dashboard metrics.',
        technicalSpecs: 'Runs entirely client-side on load.'
      },
      {
        id: 'jwt-gen',
        name: 'JWT Generator & Signer',
        engine: 'WebCrypto / SubtleCrypto API',
        details: 'Generates, signs, and validates JSON Web Tokens dynamically using browser-native SubtleCrypto APIs.',
        functionality: 'Generates and signs secure JWT tokens. Integrates key visibilities, claims calendar inputs, and signature verifications.',
        howItWorks: '1. Encodes header/payload to Base64URL. 2. Computes HMAC-SHA256 signature using browser WebCrypto. 3. Compiles final JWT dots-notation.',
        technicalSpecs: 'Runs completely client-side. Complies with WebCrypto specifications.'
      },
      {
        id: 'case-convert',
        name: 'Text Case Converter',
        engine: 'RegExp Case Parser Engine',
        details: 'Normalizes and translates text identifiers dynamically across 10 distinct case styles including camelCase, snake_case, PascalCase, and kebab-case.',
        functionality: 'Convert variable and text identifier cases. Features visual grid lists copies and custom separator selectors.',
        howItWorks: '1. Splits strings into clean word boundaries. 2. Resolves case conversions. 3. Normalizes slugs. 4. Updates display layout.',
        technicalSpecs: 'Strips special characters and supports custom separators.'
      },
      {
        id: 'url-parse',
        name: 'URL & Query String Parser',
        engine: 'Browser Native URL Engine',
        details: 'Breaks down URL strings into host parameters and search segments, offering interactive keys updates and validation checks.',
        functionality: 'Parse URL segments and edit query strings. Features parameter table lists, JSON serialization formats, and breadcrumbs tracker.',
        howItWorks: '1. Instantiates standard browser URL parser. 2. Populates parameters grid. 3. Synthesizes updated segments into rebuilt string.',
        technicalSpecs: 'Ensures absolute URI syntax validation.'
      },
      {
        id: 'flexbox-grid-playground',
        name: 'CSS Flexbox & Grid Playground',
        engine: 'React Dynamic Stylesheets Compiler',
        details: 'Visual parameters simulator designed to design layouts using CSS Flexbox and Grid properties, rendering live design models and generating stylesheets.',
        functionality: 'Playground to test and compile Flex and Grid layouts. Supports visual child selectors overrides and responsive presets.',
        howItWorks: '1. Maps layouts configurations to React state. 2. Renders dynamic items. 3. Compiles custom style rules into CSS code.',
        technicalSpecs: 'Compiles clean stylesheets matching CSS Flex/Grid standards.'
      },
      {
        id: 'js-sandbox-console',
        name: 'JS Code Sandbox & Console',
        engine: 'Sandboxed Function execution context',
        details: 'Executes custom ES6 JavaScript scripts in a sandboxed client scope, capturing outputs logs and computing benchmark stats.',
        functionality: 'Sandboxed code playground and stdout console log. Features mock console monitors, custom parameters passing, and benchmarks timer.',
        howItWorks: '1. Intercepts browser standard console logs. 2. Runs JS inputs through safe dynamic scope binding. 3. Displays executions.',
        technicalSpecs: 'Restricts infinite loops and supports toggleable Strict Mode.'
      },
      {
        id: 'docker-compose-builder',
        name: 'Docker Compose Builder',
        engine: 'YAML configuration compiler',
        details: 'Visually compiles multi-container configurations from service image configurations, ports mapping parameters, environment variables, and directories mounts.',
        functionality: 'Generates clean docker-compose.yml files. Features preset service stacks loaders and configuration downloads.',
        howItWorks: '1. Receives services properties configs. 2. Builds string layers. 3. Formats parameters into valid YAML compose structures.',
        technicalSpecs: 'Generates output matching modern Compose schemas.'
      },
      {
        id: 'svg-optimizer',
        name: 'SVG Optimizer & Editor',
        engine: 'XML text optimizer',
        details: 'Minifies vector graphic sizing by removing comments, metadata, and editor tags while offering color customizers.',
        functionality: 'Compresses and edits SVG vector XML trees. Features float decimals precision slider and live color selectors overrides.',
        howItWorks: '1. Parses raw SVG text. 2. Strips metadata and comments. 3. Replaces styling values. 4. Redraws preview.',
        technicalSpecs: 'Requires valid SVG layout to compute optimizations.'
      },
      {
        id: 'http-header-inspector',
        name: 'HTTP Header Inspector',
        engine: 'Response Headers parser',
        details: 'Inspects HTTP response headers metadata, verifying security CSP/HSTS rules, evaluating scores, and generating CORS parameters.',
        functionality: 'HTTP headers analyzer and compliance reporter. Features cookie status checks and status codes registry search.',
        howItWorks: '1. Parses header arrays. 2. Audits against security recommendations. 3. Renders metrics table.',
        technicalSpecs: 'Audits headers against modern OWASP recommendations.'
      },
      {
        id: 'ip-subnetter',
        name: 'CIDR Subnet & Socket Calculator',
        engine: 'Bitwise IP address calculator',
        details: 'Calculates IPv4 subnet structures, network ranges, broadcast coordinates, and usable host counts from CIDR blocks.',
        functionality: 'Subnet calculator and port registry explorer. Features binary bitwise details layout and classification parser.',
        howItWorks: '1. Converts IP segments to decimal values. 2. Performs bitwise AND with netmasks. 3. Compiles decimal network data.',
        technicalSpecs: 'Supports standard classless inter-domain routing (CIDR) masks.'
      },
      {
        id: 'viewport-ua-tester',
        name: 'Viewport & User-Agent Tester',
        engine: 'Device viewport simulator',
        details: 'Simulates viewports sizes matching responsive breakpoints (Mobile, Tablet, Desktop) and estimates download speed metrics.',
        functionality: 'Device emulator and media query inspector. Features layout rotate switches, user-agent overrides, and touch pointer overlay.',
        howItWorks: '1. Adjusts canvas scale zoom metrics. 2. Decodes user-agent strings. 3. Calculates file transfer times against speed options.',
        technicalSpecs: 'Computes download times against standard network bandwidth profiles.'
      },
      {
        id: 'code-snapshot',
        name: 'Code Snapshot',
        engine: 'html-to-image DOM rasterizer',
        details: 'Parses code with prismjs syntax highlighting and renders the DOM node as a high-resolution PNG using html-to-image.',
        functionality: 'Code snippet image generator. Features multiple languages, customizable background themes, padding, and macOS window style.',
        howItWorks: '1. User pastes code. 2. Prismjs highlights syntax. 3. html-to-image rasterizes the DOM element. 4. PNG file is downloaded.',
        technicalSpecs: 'Outputs 2x pixel ratio PNGs for retina display compatibility.'
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
        functionality: 'Interactive chat threads with local AI. Custom system prompts, model selections, and markdown renders.',
        howItWorks: '1. Connects to Ollama port. 2. Transmits messages formats. 3. Reads response chunks. 4. Renders output.',
        technicalSpecs: 'Requires local Ollama connection running on port 11434.'
      },
      {
        id: 'ai-summarizer',
        name: 'Summarizer',
        engine: 'Ollama Model Summarizer Pipeline',
        details: 'Sends text content to local LLMs with custom instructions to create structured summaries.',
        functionality: 'Local AI text summarizer. Summary format settings (bullets/paragraphs) and copy options.',
        howItWorks: '1. Formats summaries prompt layers. 2. Queries local Ollama model. 3. Displays output.',
        technicalSpecs: 'Compatible with standard Llama/Mistral models.'
      },
      {
        id: 'caption-gen',
        name: 'Caption Generator',
        engine: 'Ollama Vision Pipeline',
        details: 'Encodes image uploads as base64 parameters, transmitting details to local vision LLMs for captioning.',
        functionality: 'Generates captions for images using vision LLMs. Upload previews and details sliders.',
        howItWorks: '1. Converts image files to base64. 2. Sends details to vision models. 3. Renders captions.',
        technicalSpecs: 'Requires vision model capability (e.g. Llava/Bakllava).'
      },
      {
        id: 'ocr-assistant',
        name: 'OCR Assistant',
        engine: 'Ollama Layout Formatting Pipeline',
        details: 'Sends noisy text from OCR tools to local LLMs to format clean document configurations.',
        functionality: 'Formats messy OCR text. Spelling corrections, markdown formatting, and paragraphs organization.',
        howItWorks: '1. Structures raw OCR output strings. 2. Prompts models to format structures. 3. Outputs files.',
        technicalSpecs: 'Maintains document layout structure.'
      },
      {
        id: 'prompt-enhancer',
        name: 'Prompt Enhancer',
        engine: 'Ollama Prompt Optimization Pipeline',
        details: 'Assembles prompt elements, utilizing local LLMs to expand concepts into detailed instructions.',
        functionality: 'Enhances AI prompts. Custom enhancement templates and detail sliders.',
        howItWorks: '1. Evaluates input prompts. 2. Queries local model to build detailed instructions templates. 3. Returns output.',
        technicalSpecs: 'Uses system prompt templates.'
      },
      {
        id: 'image-classifier',
        name: 'Image Classifier',
        engine: 'Ollama Image Classification Pipeline',
        details: 'Sends image parameters to local vision LLMs, returning tag listings and classification percentages.',
        functionality: 'Classifies images using local models. Returns classification tags and confidence percentages.',
        howItWorks: '1. Converts image to base64. 2. Dispatches files to local vision LLM. 3. Displays tags.',
        technicalSpecs: 'Requires local vision-capable models.'
      },
      {
        id: 'text-rewriter',
        name: 'Text Rewriter',
        engine: 'Ollama Tone Transformation Pipeline',
        details: 'Applies style templates using local models, rewriting paragraphs into alternative tones.',
        functionality: 'Rewrites text with custom tones (professional, casual, academic). Length settings.',
        howItWorks: '1. Connects to rewriter prompts. 2. Processes input. 3. Displays tones outputs.',
        technicalSpecs: 'Processes text blocks offline.'
      },
      {
        id: 'ai-translator',
        name: 'Translator',
        engine: 'Ollama Translation Pipeline',
        details: 'Directs local LLMs to translate text strings, maintaining structure and context.',
        functionality: 'Translates texts using local AI. Target language lists, context flags, and copies.',
        howItWorks: '1. Constructs translation directives. 2. Queries model. 3. Outputs translated text.',
        technicalSpecs: 'Preserves tags and markdown formats.'
      },
      {
        id: 'ai-stt',
        name: 'Speech-to-Text',
        engine: 'Ollama Audio Transcription Pipeline',
        details: 'Processes audio files through local models to generate text transcriptions.',
        functionality: 'Transcribes audio files. Waveform inputs and transcription logs exports.',
        howItWorks: '1. Reads audio. 2. Feeds files to speech pipelines. 3. Outputs text.',
        technicalSpecs: 'Requires speech model assets.'
      },
      {
        id: 'semantic-search',
        name: 'Semantic Search',
        engine: 'Ollama Embedding Engine',
        details: 'Passes document texts to embedding models, storing vectors to perform similarity searches.',
        functionality: 'Performs semantic searches on documents. Similarity ranking charts and scores display.',
        howItWorks: '1. Generates text embedding vectors. 2. Calculates similarity metrics. 3. Displays ranks.',
        technicalSpecs: 'Requires embedding model (e.g. all-minilm).'
      },
      {
        id: 'ai-code-explainer',
        name: 'AI Code Explainer',
        engine: 'Ollama Code Explanation Pipeline',
        details: 'Analyzes code segments step-by-step, assessing complexity and translating logic to other languages.',
        functionality: 'Explains code functionality. Complexity metrics, line-by-line analyses, and language conversion.',
        howItWorks: '1. Tokenizes code inputs. 2. Queries LLMs for step-by-step analyses. 3. Displays reviews.',
        technicalSpecs: 'Compatible with standard programming languages.'
      },
      {
        id: 'ai-flashcard-maker',
        name: 'AI Flashcard Maker',
        engine: 'Ollama Educational Q&A Pipeline',
        details: 'Transforms any text input or topic into structured Q&A card decks for study sessions.',
        functionality: 'Creates flashcards. Flashcard counts adjusters and interactive card previewers.',
        howItWorks: '1. Processes study topics. 2. Formats Q&A lists. 3. Populates dashboard.',
        technicalSpecs: 'Outputs study decks in JSON formats.'
      },
      {
        id: 'ai-sentiment-journal',
        name: 'AI Sentiment Journal',
        engine: 'Ollama Sentiment & Mood Analysis Pipeline',
        details: 'Evaluates mood trends, keywords, and emotions from daily journal entries securely saved in local storage.',
        functionality: 'Logs and analyzes mood trends in daily journals. Empathic indicators charts.',
        howItWorks: '1. Reads journals inputs. 2. Evaluates sentiment factors. 3. Maps results to graphs.',
        technicalSpecs: 'Saves logs locally to protect privacy.'
      },
      {
        id: 'ai-email-composer',
        name: 'AI Email Composer',
        engine: 'Ollama Business Copywriting Pipeline',
        details: 'Drafts or replies to emails with options for tone, length, and subject lines based on user intent.',
        functionality: 'Composes emails. Tone options, email length controls, and subject line selectors.',
        howItWorks: '1. Collects email parameters. 2. Queries model. 3. Outputs email drafts.',
        technicalSpecs: 'Generates professional templates.'
      },
      {
        id: 'ai-story-generator',
        name: 'AI Story Generator',
        engine: 'Ollama Creative Fiction Pipeline',
        details: 'Generates fantasy, sci-fi, horror, or comedy stories complete with characters, settings, and twists.',
        functionality: 'Generates creative writing stories. Genre configurations, plot tags, and character outlines selectors.',
        howItWorks: '1. Connects creative inputs to story templates. 2. Renders stories.',
        technicalSpecs: 'Supports chapters configurations.'
      },
      {
        id: 'ai-debate-assistant',
        name: 'AI Debate Assistant',
        engine: 'Ollama Argumentation Pipeline',
        details: 'Constructs PRO and CON arguments, opening/closing statements, and counterpoints for a given topic.',
        functionality: 'Builds debate arguments. Pro/con coordinates and counterpoints listings.',
        howItWorks: '1. Connects topics to debate structures. 2. Prompts arguments generation. 3. Displays grids.',
        technicalSpecs: 'Structures arguments in logical layouts.'
      },
      {
        id: 'ai-math-solver',
        name: 'AI Math Solver',
        engine: 'Ollama Mathematical Reasoning Pipeline',
        details: 'Solves complex equations and word problems step-by-step with LaTeX formatting.',
        functionality: 'Solves math problems. Interactive step-by-step layout and LaTeX formatting.',
        howItWorks: '1. Parses mathematical problems. 2. Solves formulas sequentially. 3. Renders LaTeX codes.',
        technicalSpecs: 'Supports algebra, calculus, and arithmetic formulas.'
      },
      {
        id: 'ai-recipe-generator',
        name: 'AI Recipe Generator',
        engine: 'Ollama Culinary Optimization Pipeline',
        details: 'Recommends cooking recipes, nutrition estimates, and missing ingredient lists from available items.',
        functionality: 'Generates cooking recipes. Ingredient lists, dietary setups, and nutrition cards.',
        howItWorks: '1. Connects ingredients list to recipe builders. 2. Returns recipes.',
        technicalSpecs: 'Lists ingredients quantities and instructions.'
      },
      {
        id: 'ai-code-reviewer',
        name: 'AI Code Reviewer',
        engine: 'Ollama Static Review Pipeline',
        details: 'Audits code structure for bugs, security weaknesses, performance, and best practices.',
        functionality: 'Audits code files. Suggests optimizations, maps security issues, and displays score indexes.',
        howItWorks: '1. Ingests source code. 2. Runs static code reviews via LLM. 3. Outputs suggestions.',
        technicalSpecs: 'Analyzes security gaps and performance limits.'
      },
      {
        id: 'ai-mind-mapper',
        name: 'AI Mind Mapper',
        engine: 'Ollama Hierarchical Layout Pipeline',
        details: 'Extracts concepts from topics to organize them into nested branches and outlines.',
        functionality: 'Creates mind map outlines. Nested nodes configurations and outline exports.',
        howItWorks: '1. Extracts concept lists. 2. Matches hierarchies. 3. Renders graphs.',
        technicalSpecs: 'Exports mind maps in plain-text outlines.'
      },
      {
        id: 'domo-agent-hub',
        name: 'Domo Agent Hub',
        engine: 'Ollama Workspace File API',
        details: 'Mounts local directories using File System Access handles to edit files and direct AI coding runs offline.',
        functionality: 'Mounts folders to work on code. Multi-agent workflows, autosave adjustments, and log changes.',
        howItWorks: '1. Accesses local directories via browser. 2. Runs agents threads. 3. Writes modifications.',
        technicalSpecs: 'Requires browser File System Access API support.'
      },
      {
        id: 'domo-selection',
        name: 'DomoDomo Selection Explainer',
        engine: 'Ollama Highlight Selector Pipeline',
        details: 'Provides inline segment highlighting and local file upload support, answered by the friendly DomoDomo mascot persona with custom markdown formatting.',
        functionality: 'Highlights segments for explanation. Custom chat window, mascot styling, and file attachments.',
        howItWorks: '1. Catches highlighted text. 2. Submits to friendly mascot prompt. 3. Streams markdown.',
        technicalSpecs: 'Outputs friendly custom formatting answers.'
      },
      {
        id: 'ollama-library',
        name: 'Domo Model Library',
        engine: 'Ollama Registry REST Stream',
        details: 'Integrates with local Ollama service endpoints to monitor connection, query installed models list, and stream pulling chunks to update progress bars.',
        functionality: 'Browse LLMs models, review VRAM requirements, see dynamic hardware advisor, download models directly, and copy terminal execution code logs.',
        howItWorks: '1. Verifies localhost CORS connection. 2. Compares offline tags to catalog targets. 3. Submits stream requests to pull models. 4. Visualizes loading percentages.',
        technicalSpecs: 'Connects directly to port 11434 (changeable endpoint). Requires proper CORS headers configuration to override browser cross-origin limits.'
      },
      {
        id: 'domo-skill-creator',
        name: 'Domo Skill Creator',
        engine: 'Local Skill Schema Builder',
        details: 'Visual designer to define capabilities, permissions, rules, and system prompts to export/import as portable markdown skill files.',
        functionality: 'Save visual creations to localStorage, edit tools and rules, download skillsets, and import MD configs.',
        howItWorks: '1. Configures attributes visually. 2. Stores settings locally in localStorage. 3. Exports markdown files.',
        technicalSpecs: 'Outputs YAML frontmatter-delimited Markdown skillsets.'
      },
      {
        id: 'domo-companion',
        name: 'Domo Companion (Floating AI Assistant)',
        engine: 'Ollama Client Context Pipeline',
        details: 'A persistent, draggable widget overlay executing offline model prompts with real-time viewport context sensing and high-fidelity boundary dragging.',
        functionality: 'Companion chat window, custom mascot personas, overlay styling, viewport boundary detection, and scroll-drag coordinate filters.',
        howItWorks: '1. Detects current active routing path. 2. Collects settings preferences. 3. Filters drag coordinates. 4. Pipes chat stream.',
        technicalSpecs: 'Drags natively on desktop via coordinate delta computations. Implements touch scroll-lock bypass on mobile/touch screens.'
      },
      {
        id: 'ai-pii-redactor',
        name: 'AI PII Data Redactor',
        engine: 'Ollama Privacy Anonymization Pipeline',
        details: 'Parses raw text data to intelligently identify and mask Personally Identifiable Information using local LLM understanding.',
        functionality: 'Redacts sensitive info (names, IPs, emails) from logs and text.',
        howItWorks: '1. Connects to local model. 2. Streams text blocks. 3. Replaces matches with placeholders.',
        technicalSpecs: 'Ensures data privacy by never sending PII to a remote server.'
      },
      {
        id: 'ai-regex-architect',
        name: 'AI Regex Explainer & Builder',
        engine: 'Ollama Parsing & Explanation Pipeline',
        details: 'Breaks down complex regex patterns or constructs them from natural language descriptions.',
        functionality: 'Explains or builds regex patterns locally.',
        howItWorks: '1. Analyzes regex string or intent. 2. Queries model for step-by-step breakdown. 3. Outputs markdown explanation.',
        technicalSpecs: 'Compatible with major regular expression flavors (PCRE, JS).'
      },
      {
        id: 'ai-devops-architect',
        name: 'AI DevOps Command Architect',
        engine: 'Ollama SysAdmin Scripting Pipeline',
        details: 'Generates complex bash scripts, Docker commands, and crontab schedules from simple plain English.',
        functionality: 'Provides shell command solutions for devops operations.',
        howItWorks: '1. Receives operation description. 2. Queries model for exact terminal commands. 3. Formats output.',
        technicalSpecs: 'Warns about potentially destructive operations by relying on LLM logic.'
      }
    ]
  },
  data: {
    title: 'Data & Visualizer Studio',
    desc: 'Local-first client-side data parsing, layout formatting, SVG vector generation, and chart visualizations.',
    list: [
      {
        id: 'json-chart-builder',
        name: 'JSON Chart Builder',
        engine: 'HTML5 SVG Vector Graphics',
        details: 'Evaluates and parses local JSON data structures, mapping variables to geometric SVG shapes (bar rectangles, line path splines, radial wedges, and radar polygons) directly on the document object model.',
        functionality: 'Generates responsive bar, line, pie, and radar charts. Customizes colors, grid lines, legends, and smooth spline lines. Downloads graphics as clean SVG.',
        howItWorks: '1. User inputs a JSON string. 2. The parser maps properties to chart dimensions. 3. Formulates SVG paths and elements dynamically. 4. Previews the responsive diagram and allows file downloads.',
        technicalSpecs: 'Runs 100% locally with no third-party charting dependencies.'
      },
      {
        id: 'csv-pivot-analyzer',
        name: 'CSV Pivot Table Analyzer',
        engine: 'Local Tabular Pivots Aggregator',
        details: 'Parses CSV data records, maps unique dimensions, aggregates selected values locally, and renders summary matrices.',
        functionality: 'Drag and drop columns into rows and columns values grouping. Performs SUM, AVERAGE, COUNT, MIN, MAX aggregates.',
        howItWorks: '1. Parses raw CSV values. 2. Groups rows by selected keys. 3. Computes aggregations. 4. Renders responsive matrices with grand totals and exports CSV.',
        technicalSpecs: 'Handles large datasets entirely in the browser memory with no database server requirements.'
      },
      {
        id: 'css-keyframe-animator',
        name: 'Visual CSS Keyframe Animator',
        engine: 'CSS Keyframe Animation Timeline Generator',
        details: 'Creates CSS @keyframes styles based on visually configured animation steps.',
        functionality: 'Builds timeline animations (0% to 100%). Modifies transforms (rotate, scale, translate, skew), opacity, blur filters, and background colors. Exports full CSS.',
        howItWorks: '1. User selects/adds a keyframe percentage tick. 2. Modifies transform parameters via sliders. 3. Real-time preview container updates. 4. CSS rules are compiled.',
        technicalSpecs: 'Generates standard W3C compliant CSS transitions and keyframes.'
      },
      {
        id: 'log-pattern-analyzer',
        name: 'Log Pattern & Analysis Dashboard',
        engine: 'Regex Log Parser',
        details: 'Runs regular expression filters on lines of console logs, grouping status metrics and patterns.',
        functionality: 'Parses Nginx, Apache, or generic application logs. Calculates total logs count, warning frequencies, error rates, and isolates client IP coordinates.',
        howItWorks: '1. Paste raw text log logs. 2. Select matching format preset. 3. Process logs. 4. View dashboard analytics and filter logs.',
        technicalSpecs: 'Precompiled regex patterns ensure rapid parsing on thousands of log lines locally.'
      },
      {
        id: 'er-schema-designer',
        name: 'Interactive ER Schema Designer',
        engine: 'Canvas Entity Relation Modeler',
        details: 'SVG-rendered canvas table nodes with coordinates mapping and relationship anchor links.',
        functionality: 'Draw tables visually, configure columns types (integer, varchar, timestamp), set primary and foreign keys, and generate DDL queries.',
        howItWorks: '1. User adds tables and fields. 2. Positions cards on the screen. 3. Selects SQL dialect. 4. Compiles database setup scripts.',
        technicalSpecs: 'Dialects supported: PostgreSQL, SQLite, and MySQL.'
      },
      {
        id: 'svg-path-inspector',
        name: 'SVG Vector Path Inspector',
        engine: 'Interactive Vector Nodes Modeler',
        details: 'Dynamic control vertices coordinate calculator generating SVG path strings.',
        functionality: 'Visual grid canvas to inspect vector anchors. Click to add nodes, drag coordinates to modify paths, adjust quadratic control anchors, and copy code.',
        howItWorks: '1. Visualizes anchor coordinates. 2. Computes line/curve segments. 3. Generates and optimizes XML path syntax.',
        technicalSpecs: 'Direct coordinate manipulation generating clean XML vector paths.'
      },
      {
        id: 'regex-data-extractor',
        name: 'Regex Data Extractor & Table Builder',
        engine: 'Regex Capturing Groups Tabulator',
        details: 'Regex matcher identifying capturing groups patterns to generate exportable lists.',
        functionality: 'Extracts custom patterns, categorizes matches into capture columns, and exports files.',
        howItWorks: '1. Paste text and write regex. 2. Match loop executes. 3. Grid displays groups matches. 4. Download output CSV.',
        technicalSpecs: 'Safe compile safeguards prevent browser lockups from backtracking regex.'
      },
      {
        id: 'flowchart-mindmap-maker',
        name: 'Interactive Flowchart & Mind Map Maker',
        engine: 'Markdown Bullet Indentation Tree Layout Engine',
        details: 'Calculates hierarchical tree structures from indention spaces, mapping curved bezier wires and nodes.',
        functionality: 'Converts bullet lists into tree graphs. Features zoom/pan controls and SVG graphics export.',
        howItWorks: '1. Paste indented outlines. 2. Parser builds parent/child arrays. 3. Organizes coordinates. 4. Generates visual SVG mindmaps.',
        technicalSpecs: 'Client-side local graphics rendering with zero cloud rendering packages.'
      },
      {
        id: 'css-grid-builder',
        name: 'CSS Grid Template Builder',
        engine: 'Visual Grid Designer',
        details: 'Visual parameters editor converting grid grid arrays into CSS layouts.',
        functionality: 'Configure rows/columns counts, set track sizes (px, %, fr), drag-select cells to assign named areas, and copy CSS classes.',
        howItWorks: '1. Adjust dimensions sliders. 2. Click-drag to merge boxes. 3. Name custom areas. 4. Copy CSS declarations.',
        technicalSpecs: 'Complies with CSS Grid Layout Module specifications.'
      },
      {
        id: 'data-privacy-anonymizer',
        name: 'Data Masker & Privacy Anonymizer',
        engine: 'Local PII Anonymizer',
        details: 'Client-side string replacement applying regex masking, hash integers calculations, and mock dictionary mapping.',
        functionality: 'Sanitizes JSON/CSV database records. Masks emails/phones, hashes keys, or maps to fake names and locations.',
        howItWorks: '1. Paste records. 2. Assign rule per field key. 3. Process records. 4. Download clean JSON.',
        technicalSpecs: '100% offline, ensuring no sensitive data is leaked or sent online.'
      }
    ]
  },
  cv: {
    title: 'Computer Vision Tools Suite',
    desc: 'Local-first offline computer vision, image annotation, auto-segmentation, pose estimation, and dataset utilities.',
    list: [
      {
        id: 'cv-bounding-box',
        name: 'Bounding Box & Polygon Image Annotator',
        engine: 'HTML5 Canvas 2D + React State Engine',
        details: 'Interactive canvas annotation studio for single and multi-image batches. Supports rectangle bounding boxes, polygons, keypoint dots, and crosshair guides.',
        functionality: 'Multi-class label management, zoom in/out/reset controls, crosshair guides, and multi-format exports (YOLO v5/v8/v11 txt, COCO JSON, Pascal VOC XML, CSV, Annotated PNG).',
        howItWorks: '1. Upload images. 2. Select tool (Box, Polygon, Point) and active class. 3. Click and drag or place vertices on canvas. 4. Export normalized label files.',
        technicalSpecs: '100% in-browser processing. Coordinates normalized to [0..1] float ranges.'
      },
      {
        id: 'cv-auto-segmentation',
        name: 'Auto-Magic Wand & Smart Contour Segmentation',
        engine: 'Canvas Flood Fill + Color Tolerance Algorithm',
        details: 'Automated region segmentation tool using color-distance flood filling and edge-aware contour tracing.',
        functionality: 'Click any image region to extract smooth boundary polygon masks and binary segmentation masks.',
        howItWorks: '1. Upload image. 2. Set color tolerance slider. 3. Click target object region. 4. Download Binary Mask PNG or COCO Segmentation JSON.',
        technicalSpecs: 'Executes pixel color delta comparisons using Web API ImageData buffers.'
      },
      {
        id: 'cv-batch-annotator',
        name: 'Batch Image Annotator & Dataset Packer',
        engine: 'Zip Archiver & Dataset Structurer',
        details: 'Bulk image processing queue to tag, partition train/val splits, propagate bounding boxes, and bundle machine learning datasets.',
        functionality: 'Manages batch tags, auto-sequences file names, and generates data.yaml configurations alongside CSV dataset manifests.',
        howItWorks: '1. Select multi-file batch. 2. Assign split tags (train/val). 3. Propagate boxes across frames. 4. Export ready-to-train dataset package.',
        technicalSpecs: 'Generates standard YOLO directory structures (images/train, labels/train, data.yaml).'
      },
      {
        id: 'cv-semantic-mask',
        name: 'Semantic Mask & Pixel Brush Studio',
        engine: 'Dual Canvas Layer Composite Engine',
        details: 'Pixel-level multi-class semantic segmentation brush, eraser, and layer opacity editor.',
        functionality: 'Paint class-colored overlay masks directly over images with adjustable brush radius. Exports RGB color masks and indexed grayscale class ID map PNGs.',
        howItWorks: '1. Select class label. 2. Adjust brush radius and opacity. 3. Paint object pixels. 4. Download indexed class ID map PNG.',
        technicalSpecs: 'Outputs 8-bit PNG images where pixel intensities correspond strictly to integer Class IDs.'
      },
      {
        id: 'cv-keypoint-skeleton',
        name: 'Pose Estimation & Keypoint Skeleton Annotator',
        engine: 'Graph Topology Render Engine',
        details: 'COCO 17-Keypoint human pose skeleton node positioner with interactive bone link rendering.',
        functionality: 'Drag keypoint nodes (nose, eyes, ears, shoulders, elbows, wrists, hips, knees, ankles) and set visibility states (labeled/visible, occluded, absent).',
        howItWorks: '1. Upload human photo. 2. Drag nodes to match joints. 3. Set visibility flags. 4. Download COCO Keypoint format JSON.',
        technicalSpecs: 'Export complies with official MS COCO Keypoints JSON specification.'
      },
      {
        id: 'cv-image-matting',
        name: 'Interactive Image Matting & Alpha Mask Extractor',
        engine: 'Trimap Alpha Synthesis Engine',
        details: 'Trimap scribble editor isolating foreground (green), background (red), and unknown edges.',
        functionality: 'Extracts fine transparent edges (hair, glass, fur) to generate high-resolution transparent PNG cutouts and grayscale alpha mattes.',
        howItWorks: '1. Scribble foreground and background regions. 2. Compute alpha matte. 3. Download transparent cutout PNG.',
        technicalSpecs: 'Processes alpha channel transparency entirely client-side using RGBA Canvas ImageData.'
      },
      {
        id: 'cv-optical-flow',
        name: 'Multi-Frame Motion & Optical Flow Tracker',
        engine: 'Lucas-Kanade Vector Displacement Engine',
        details: 'Lucas-Kanade motion vector estimation across sequential frame pairs (Frame t and Frame t+1).',
        functionality: 'Calculates directional displacement vectors and renders motion flow fields over frame pairs.',
        howItWorks: '1. Upload Frame 1 and Frame 2. 2. Compute optical flow. 3. Inspect vector arrows and download motion field PNG.',
        technicalSpecs: 'Estimates optical flow vectors on structured 2D grid samples.'
      },
      {
        id: 'cv-data-augmenter',
        name: 'Computer Vision Dataset Synthetic Augmentor',
        engine: 'Geometric Coordinate Transformation Matrix',
        details: 'Synthetic data augmentation studio for object detection datasets.',
        functionality: 'Applies geometric (rotation, flip, scale) and photometric (brightness, contrast) augmentations while automatically recalculating bounding box coordinates.',
        howItWorks: '1. Upload image. 2. Adjust rotation, flip, or brightness sliders. 3. Label coordinates automatically re-project. 4. Download augmented PNG.',
        technicalSpecs: 'Applies 2D affine transformation matrices to bounding box vertex vectors.'
      },
      {
        id: 'cv-dataset-converter',
        name: 'Dataset Format Converter & Annotations Transformer',
        engine: 'Multi-Format Annotation Parser',
        details: 'Dataset label format converter between YOLO (txt), COCO (JSON), Pascal VOC (XML), and Labelme.',
        functionality: 'Converts dataset labels seamlessly across machine learning framework formats.',
        howItWorks: '1. Paste source annotations. 2. Select target format. 3. Convert. 4. Download converted file.',
        technicalSpecs: 'Parses and normalizes coordinates across pixel and relative bounds.'
      },
      {
        id: 'cv-zero-shot-inspector',
        name: 'Automated Region Proposal & Dataset Anomaly Inspector',
        engine: 'Contour Region Proposal & Audit Engine',
        details: 'Auto-proposes object candidate bounding boxes and audits datasets for anomalies.',
        functionality: 'Highlights candidate object regions and flags duplicate, overlapping, or out-of-bounds annotations.',
        howItWorks: '1. Upload image. 2. Run auto region proposal. 3. Inspect candidate boxes. 4. Download auto-generated YOLO labels.',
        technicalSpecs: 'Executes contour detection and candidate bounding box proposals client-side.'
      }
    ]
  },
  ml: {
    title: 'Machine Learning Tools Suite',
    desc: 'Local-first offline machine learning evaluation, confusion matrix auditing, model benchmarking, vector embedding visualization, and dataset drift detection tools.',
    list: [
      {
        id: 'ml-classification-evaluator',
        name: 'Model Classification Evaluator & Confusion Matrix Inspector',
        engine: 'Confusion Matrix & Multi-Class Metric Engine',
        details: 'Computes Accuracy, F1-score, Precision, Recall, and interactive Heatmap Confusion Matrix.',
        functionality: 'Evaluates model classification predictions against ground truth labels.',
        howItWorks: '1. Upload predictions CSV/JSON. 2. Adjust confidence threshold. 3. Inspect confusion matrix. 4. Export JSON report.',
        technicalSpecs: 'Calculates macro/micro averages and normalized percentage matrices client-side.'
      },
      {
        id: 'ml-roc-pr-analyzer',
        name: 'ROC & Precision-Recall Curve Analyzer',
        engine: 'Trapezoidal AUC Integrator & Threshold Scrubber',
        details: 'Plots interactive ROC and Precision-Recall curves with threshold scrubber slider.',
        functionality: 'Calculates ROC AUC and optimal decision threshold via Youden J statistic.',
        howItWorks: '1. Upload prediction probabilities. 2. Drag threshold scrubber. 3. Inspect TPR/FPR tradeoffs. 4. Download SVG.',
        technicalSpecs: 'Uses trapezoidal numerical integration to compute ROC AUC.'
      },
      {
        id: 'ml-regression-evaluator',
        name: 'Regression Metrics & Residual Diagnostics',
        engine: 'Residual Error & R² Diagnostic Engine',
        details: 'Computes MAE, MSE, RMSE, MAPE, R², and residual error scatter plots.',
        functionality: 'Evaluates continuous numerical regression model predictions.',
        howItWorks: '1. Upload actual vs predicted CSV. 2. Inspect R² and RMSE. 3. View residual scatter plot. 4. Download report.',
        technicalSpecs: 'Computes variance and residual distributions client-side.'
      },
      {
        id: 'ml-model-comparator',
        name: 'Multi-Model Leaderboard & Comparator',
        engine: 'Multi-Model Benchmark Matrix Engine',
        details: 'Ranks and compares multiple ML models by F1, Accuracy, Precision, Recall, and Latency.',
        functionality: 'Builds side-by-side model comparison leaderboard and radar charts.',
        howItWorks: '1. Upload benchmark CSV. 2. Sort by metric. 3. Compare latency vs accuracy. 4. Export leaderboard CSV.',
        technicalSpecs: 'Dynamic multi-criteria sorting matrix.'
      },
      {
        id: 'ml-dataset-drift-detector',
        name: 'Dataset Data Drift & Feature Shift Inspector',
        engine: 'Kolmogorov-Smirnov & PSI Drift Engine',
        details: 'Detects feature distribution shifts between training baseline and production inference sets.',
        functionality: 'Computes Population Stability Index (PSI) and flags data drift anomalies.',
        howItWorks: '1. Upload baseline CSV. 2. Upload current CSV. 3. Inspect drift alerts. 4. Export audit report.',
        technicalSpecs: 'Calculates feature-level distribution distance metrics.'
      },
      {
        id: 'ml-feature-importance-explainer',
        name: 'Feature Importance & SHAP Attribution Explainer',
        engine: 'Attribution & SHAP Waterfall Simulator',
        details: 'Visualizes global feature importances and local prediction push contributions.',
        functionality: 'Explains model predictions via feature importance bar charts and waterfall plots.',
        howItWorks: '1. Upload feature weights CSV. 2. Inspect importance ranking. 3. Export SHAP CSV.',
        technicalSpecs: 'Normalized feature contribution breakdown.'
      },
      {
        id: 'ml-embedding-visualizer',
        name: 'Embedding Space & Vector Projection Visualizer',
        engine: 'Client-Side t-SNE & PCA Dimensionality Reduction',
        details: 'Projects 768-dim vector embeddings down to 2D canvas scatter plot with zoom controls.',
        functionality: 'Visualizes high-dimensional vector embeddings and semantic cluster maps.',
        howItWorks: '1. Upload vector CSV. 2. Run 2D projection. 3. Zoom/pan canvas. 4. Export 2D coordinates CSV.',
        technicalSpecs: 'HTML5 Canvas 2D projection with interactive zoom scaling.'
      },
      {
        id: 'ml-loss-curve-inspector',
        name: 'Hyperparameter Loss Curve & Training Inspector',
        engine: 'Overfitting & Early Stopping Diagnostic Engine',
        details: 'Analyzes training logs for loss convergence and overfitting gaps.',
        functionality: 'Recommends optimal early stopping epoch and plots train vs validation curves.',
        howItWorks: '1. Upload training log CSV. 2. Inspect early stopping recommendation. 3. Download report.',
        technicalSpecs: 'Detects loss inflection points and validation divergence.'
      },
      {
        id: 'ml-model-latency-benchmarker',
        name: 'ONNX & TFLite Latency Benchmarker',
        engine: 'WASM Runtime Inference Profiler',
        details: 'Benchmarks client-side ONNX / TFLite inference latency and FPS throughput.',
        functionality: 'Measures P50, P90, P99 latency percentiles and memory footprint.',
        howItWorks: '1. Upload ONNX model. 2. Run 100 inference iterations. 3. View P99 latency histogram.',
        technicalSpecs: 'High-resolution performance timer benchmarking.'
      },
      {
        id: 'ml-llm-rag-evaluator',
        name: 'LLM & RAG Model Evaluation Benchmark Studio',
        engine: 'RAG Faithfulness & Citation Match Auditor',
        details: 'Evaluates RAG pipeline outputs for faithfulness, answer relevance, and context recall.',
        functionality: 'Audits LLM responses against retrieved context documents.',
        howItWorks: '1. Upload RAG evaluation dataset. 2. Select query. 3. Inspect faithfulness score.',
        technicalSpecs: 'Context token overlap and semantic citation auditing.'
      }
    ]
  },
  spatial: {
    title: 'Spatial 3D & Web Engine',
    desc: 'Local-first offline 3D model inspection, polygon decimation, PBR texture generation, spatial audio, LiDAR point clouds, and WebGL graphics.',
    list: [
      {
        id: '3d-model-inspector',
        name: '3D Model Studio & Mesh Inspector',
        engine: 'WebGL / HTML5 3D Matrix Renderer',
        details: 'Parses OBJ, STL, PLY, and OFF 3D meshes locally and renders an interactive 3D orbit viewport.',
        functionality: 'Provides orbit controls, wireframe/solid/normals rendering modes, face/vertex metrics, and OBJ export.',
        howItWorks: '1. Load 3D model or select preset. 2. Orbit mouse around 3D canvas viewport. 3. Tweak shading & sun position. 4. Export OBJ file.',
        technicalSpecs: 'Painter depth sorting, face normal vectors, and client-side Matrix transformations.'
      },
      {
        id: '3d-mesh-decimator',
        name: '3D Polygon Decimator & Mesh Optimizer',
        engine: 'Client-Side Polygon Reduction & Edge Collapse Engine',
        details: 'Simplifies complex 3D meshes locally with dynamic polygon reduction target sliders.',
        functionality: 'Reduces 3D poly-count while preserving mesh shape, showing visual reduction heatmaps.',
        howItWorks: '1. Load mesh. 2. Adjust poly reduction slider (10%-100%). 3. Inspect vertex metrics. 4. Export lightweight OBJ.',
        technicalSpecs: 'Vertex clustering and edge collapse algorithm simulation.'
      },
      {
        id: 'pbr-texture-generator',
        name: 'PBR Texture Map Synthesizer',
        engine: 'Sobel Filter & Grayscale Variance Shader Engine',
        details: 'Converts 2D diffuse images into 3D Physically Based Rendering (PBR) texture maps.',
        functionality: 'Generates Normal maps, Roughness maps, Ambient Occlusion, and Height maps with live 3D preview & ZIP export.',
        howItWorks: '1. Upload 2D texture. 2. Tweak normal depth and roughness sliders. 3. Preview live on 3D sphere. 4. Download ZIP package.',
        technicalSpecs: 'Sobel gradient matrix operator for normal calculation.'
      },
      {
        id: 'heightmap-3d-terrain',
        name: 'Heightmap 3D Terrain Studio',
        engine: 'Procedural Elevation Grid & Biome Color Engine',
        details: 'Converts 2D grayscale heightmaps into 3D terrain meshes with biome gradients and sea level water planes.',
        functionality: 'Renders 3D mountains, lakes, and biomes with customizable elevation relief and OBJ export.',
        howItWorks: '1. Select heightmap or preset. 2. Adjust water level and peak elevation sliders. 3. Choose biome gradient. 4. Download OBJ mesh.',
        technicalSpecs: 'Interactive 3D elevation quad grid projection.'
      },
      {
        id: 'point-cloud-visualizer',
        name: '3D Point Cloud & LiDAR Visualizer',
        engine: '3D Point Attenuation & Spectrum Mapper',
        details: 'Parses and renders 3D LiDAR point cloud datasets (PLY, PCD, XYZ).',
        functionality: 'Visualizes 3D spatial points with depth spectrum color ramps, slicing planes, and PLY export.',
        howItWorks: '1. Upload PLY dataset. 2. Adjust point size and height clipping plane. 3. Choose thermal/rainbow ramp. 4. Download PLY.',
        technicalSpecs: 'Point size attenuation and depth axis slicing.'
      },
      {
        id: 'voxel-studio-converter',
        name: 'Voxel Studio & 3D Pixel Converter',
        engine: 'Interactive 3D Voxel Grid Engine',
        details: 'Converts 3D meshes or 2D pixel art into interactive 3D Voxel block grids.',
        functionality: 'Allows palette color editing and 3D Voxel block grid manipulation with OBJ export.',
        howItWorks: '1. Select voxel preset or model. 2. Choose block color from palette. 3. Edit voxel grid in 3D. 4. Export OBJ.',
        technicalSpecs: 'Depth-sorted 3D voxel block rendering.'
      },
      {
        id: 'spatial-audio-renderer',
        name: '3D Spatial Audio & Binaural Soundfield Renderer',
        engine: 'Web Audio API HRTF PannerNode & Impulse Response Engine',
        details: 'Visual 3D soundstage editor that positions audio nodes around a 3D listener head.',
        functionality: 'Renders 3D binaural spatial audio, distance attenuation, and room acoustics impulse responses.',
        howItWorks: '1. Drag sound nodes in 3D soundstage. 2. Adjust reverb amount. 3. Play 3D spatial binaural audio synth.',
        technicalSpecs: 'Web Audio PannerNode with HRTF panning model.'
      },
      {
        id: 'particle-force-studio',
        name: 'Particle System & Force Field Studio',
        engine: '3D Vector Force Field Physics Engine',
        details: 'Simulates 3D particle systems under gravity, vortex, wind, and attractor forces.',
        functionality: 'Renders real-time 3D particle motion, trails, and force vectors.',
        howItWorks: '1. Choose force field (vortex, gravity, attractor). 2. Adjust particle count slider. 3. Run physics simulation.',
        technicalSpecs: 'Real-time Euler integration 3D particle physics.'
      },
      {
        id: '3d-camera-animator',
        name: '3D Camera Flight Path & Keyframe Animator',
        engine: '3D Bezier Spline Keyframe Interpolator',
        details: 'Interactive timeline camera trajectory builder for 3D flight paths.',
        functionality: 'Interpolates camera positions along Bezier splines and tracks target subjects.',
        howItWorks: '1. Adjust timeline scrubber. 2. Inspect animated 3D camera trajectory. 3. Export keyframes JSON.',
        technicalSpecs: 'Linear and cubic spline camera position interpolation.'
      },
      {
        id: 'ar-marker-card-studio',
        name: 'AR Spatial Marker & 3D Card Studio',
        engine: 'AR Target Marker & 3D Spatial Overlay Engine',
        details: 'Generates AR tracking target patterns paired with floating 3D spatial cards.',
        functionality: 'Creates printable AR marker targets and customizable 3D floating card previews.',
        howItWorks: '1. Customize card header and glow color. 2. Preview 3D AR marker split view. 3. Download PNG marker.',
        technicalSpecs: 'High-contrast AR pattern generation and spatial shadow preview.'
      }
    ]
  }
};

