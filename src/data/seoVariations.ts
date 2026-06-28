export interface ToolVariation {
  id: string;
  toolId: string;
  name: string;
  description: string;
  seoTitle: string;
  keywords: string;
}

export const TOOL_VARIATIONS: ToolVariation[] = [];

// 1. format-converter (12 formats * 11 targets = 132 combinations)
const imageFormats = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'tiff', 'heic', 'ico', 'svg', 'tga', 'avif'];
imageFormats.forEach(src => {
  imageFormats.forEach(target => {
    if (src !== target) {
      const srcUpper = src.toUpperCase();
      const targetUpper = target.toUpperCase();
      TOOL_VARIATIONS.push({
        id: `${src}-to-${target}`,
        toolId: 'format-converter',
        name: `${srcUpper} to ${targetUpper} Converter`,
        description: `Convert ${srcUpper} images to ${targetUpper} format online free. Batch convert files locally in your browser with high quality and zero data uploads.`,
        seoTitle: `Convert ${srcUpper} to ${targetUpper} Free Online | DomoDomo`,
        keywords: `${src} to ${target}, convert ${src} to ${target}, free ${src} to ${target} converter, image format converter`
      });
    }
  });
});

// 2. pdf-merge (5 variations)
const pdfMergeKeywords = [
  { id: 'merge-two-pdfs', term: 'Merge Two PDF Files' },
  { id: 'combine-pdf-files', term: 'Combine PDF Files' },
  { id: 'join-pdfs-online', term: 'Join PDFs Online' },
  { id: 'concatenate-pdf', term: 'Concatenate PDF Documents' },
  { id: 'bind-pdfs-free', term: 'Bind PDFs Free' }
];
pdfMergeKeywords.forEach((k) => {
  TOOL_VARIATIONS.push({
    id: k.id,
    toolId: 'pdf-merge',
    name: k.term,
    description: `${k.term} online free without watermarks or file size limits. All parsing is executed 100% locally in your browser tab.`,
    seoTitle: `${k.term} Free Online - No Watermark | DomoDomo`,
    keywords: `${k.id}, ${k.term.toLowerCase()}, free pdf joiner, pdf binder offline`
  });
});

// 3. qr-generator (17 variations)
const qrTypes = [
  { id: 'wifi-qr-code-generator', name: 'WiFi QR Code Generator', desc: 'Generate a WiFi QR code to share your network name and password securely.' },
  { id: 'vcard-business-qr-generator', name: 'vCard Business QR Generator', desc: 'Create a digital business card contact QR code with your name, phone, and email.' },
  { id: 'custom-logo-qr-generator', name: 'Custom Logo QR Generator', desc: 'Design branded QR codes online by embedding your custom logo.' },
  { id: 'url-link-qr-generator', name: 'URL Link QR Generator', desc: 'Generate QR codes for web links, landing pages, and social media profiles.' },
  { id: 'sms-text-qr-generator', name: 'SMS Text QR Generator', desc: 'Create QR codes that automatically open text messages with pre-filled inputs.' },
  { id: 'email-qr-code-generator', name: 'Email QR Code Generator', desc: 'Generate QR codes that open mail apps with subject and address ready.' },
  // Socials
  { id: 'whatsapp-qr-code-generator', name: 'WhatsApp QR Code Generator', desc: 'Generate QR codes that launch WhatsApp chats with pre-filled messages.' },
  { id: 'instagram-qr-code-generator', name: 'Instagram QR Code Generator', desc: 'Create custom QR codes that redirect visitors directly to your Instagram profile.' },
  { id: 'facebook-qr-code-generator', name: 'Facebook Page QR Generator', desc: 'Generate custom scannable QR codes for Facebook pages and groups.' },
  { id: 'youtube-qr-code-generator', name: 'YouTube Channel QR Generator', desc: 'Create QR codes linking directly to your YouTube videos or channels.' },
  { id: 'linkedin-qr-code-generator', name: 'LinkedIn Profile QR Generator', desc: 'Generate networking QR codes redirecting to your professional LinkedIn page.' },
  { id: 'tiktok-qr-code-generator', name: 'TikTok Account QR Generator', desc: 'Create custom social sharing QR codes targeting TikTok profiles.' },
  { id: 'pinterest-qr-code-generator', name: 'Pinterest Board QR Generator', desc: 'Generate visual QR codes linking to Pinterest boards and pins.' },
  // Financial
  { id: 'paypal-qr-code-generator', name: 'PayPal Payment QR Generator', desc: 'Create scan-to-pay QR codes linked to your PayPal account.' },
  { id: 'bitcoin-qr-code-generator', name: 'Bitcoin Wallet QR Generator', desc: 'Generate cryptocurrency receiving address QR codes for Bitcoin transactions.' },
  { id: 'ethereum-qr-code-generator', name: 'Ethereum Wallet QR Generator', desc: 'Generate ERC-20 payment address QR codes for Ethereum transactions.' },
  { id: 'crypto-qr-code-generator', name: 'Crypto Address QR Generator', desc: 'Create wallet address scanning QR cards for various blockchain networks.' }
];
qrTypes.forEach(t => {
  TOOL_VARIATIONS.push({
    id: t.id,
    toolId: 'qr-generator',
    name: t.name,
    description: `${t.desc} Download high-res PNG or SVG with colors and patterns — processed locally.`,
    seoTitle: `${t.name} Free Online | DomoDomo`,
    keywords: `${t.id.replace(/-/g, ' ')}, ${t.name.toLowerCase()}, custom qr maker`
  });
});

// 4. image-compressor (10 sizes * 5 formats = 50 variations)
const compressSizes = ['50kb', '100kb', '150kb', '200kb', '300kb', '400kb', '500kb', '1mb', '2mb', '5mb'];
const compressFormats = ['jpg', 'png', 'jpeg', 'webp', 'gif'];
compressSizes.forEach(size => {
  compressFormats.forEach(fmt => {
    TOOL_VARIATIONS.push({
      id: `compress-${fmt}-to-${size}`,
      toolId: 'image-compressor',
      name: `Compress ${fmt.toUpperCase()} to ${size.toUpperCase()}`,
      description: `Compress and reduce ${fmt.toUpperCase()} image file size to under ${size.toUpperCase()} online free. Adjust compression quality ratio instantly.`,
      seoTitle: `Compress ${fmt.toUpperCase()} to ${size.toUpperCase()} Free Online | DomoDomo`,
      keywords: `compress ${fmt} to ${size}, reduce ${fmt} size, shrink ${fmt} file`
    });
  });
});

// 5. pdf-compress (9 variations)
const pdfCompressOptions = ['100kb', '200kb', '300kb', '450kb', '500kb', '1mb', '2mb', '3mb', '5mb'];
pdfCompressOptions.forEach(size => {
  TOOL_VARIATIONS.push({
    id: `compress-pdf-to-${size}`,
    toolId: 'pdf-compress',
    name: `Compress PDF to ${size.toUpperCase()}`,
    description: `Compress and shrink PDF document file size to under ${size.toUpperCase()} online free. Structural layout compression handles local scaling safely.`,
    seoTitle: `Compress PDF to ${size.toUpperCase()} Free Online | DomoDomo`,
    keywords: `compress pdf to ${size}, reduce pdf to ${size}, shrink pdf file size`
  });
});

// 6. image-resizer (25 resolutions * 6 formats = 150 variations)
const commonResolutions = [
  // Socials
  { id: '1920x1080', name: '1920x1080 Full HD Landscape' },
  { id: '1280x720', name: '1280x720 YouTube Thumbnail' },
  { id: '1080x1350', name: '1080x1350 Instagram Portrait' },
  { id: '1080x1080', name: '1080x1080 Instagram Square' },
  { id: '1080x566', name: '1080x566 Instagram Landscape' },
  { id: '1200x630', name: '1200x630 Facebook Shared Link' },
  { id: '1500x500', name: '1500x500 Twitter Header Banner' },
  { id: '1584x396', name: '1584x396 LinkedIn Profile Banner' },
  { id: '1000x1500', name: '1000x1500 Pinterest Pin' },
  { id: '1080x1920', name: '1080x1920 TikTok Video / Mobile Stories' },
  { id: '820x312', name: '820x312 Facebook Cover Photo' },
  // Common Screen sizes
  { id: '1366x768', name: '1366x768 Laptop Standard' },
  { id: '1440x900', name: '1440x900 Macbook Standard' },
  { id: '1536x864', name: '1536x864 Windows Desktop' },
  { id: '2560x1440', name: '2560x1440 QHD 2K Display' },
  { id: '3840x2160', name: '3840x2160 4K Ultra HD' },
  // Mobiles
  { id: '1170x2532', name: '1170x2532 iPhone 12/13/14 Pro' },
  { id: '1284x2778', name: '1284x2778 iPhone Max Screen' },
  { id: '1179x2556', name: '1179x2556 iPhone 15/16' },
  { id: '1290x2796', name: '1290x2796 iPhone 15/16 Plus' },
  { id: '2048x2732', name: '2048x2732 iPad Pro 12.9 Screen' },
  // Classic Standards
  { id: '800x800', name: '800x800 Profile Image' },
  { id: '800x600', name: '800x600 SVGA Display' },
  { id: '640x480', name: '640x480 VGA Screen' },
  { id: '300x250', name: '300x250 Medium Rectangle Banner' }
];
const resizerFormats = ['jpg', 'png', 'jpeg', 'webp', 'gif', 'bmp'];
commonResolutions.forEach(res => {
  resizerFormats.forEach(fmt => {
    TOOL_VARIATIONS.push({
      id: `resize-${fmt}-to-${res.id}`,
      toolId: 'image-resizer',
      name: `Resize ${fmt.toUpperCase()} to ${res.name}`,
      description: `Resize and crop ${fmt.toUpperCase()} images to exactly ${res.id} pixels online free. Lock aspect ratios and download instantly in your browser.`,
      seoTitle: `Resize ${fmt.toUpperCase()} to ${res.id} Online Free | DomoDomo`,
      keywords: `resize ${fmt} to ${res.id}, scale ${fmt} to ${res.id}, change ${fmt} dimensions`
    });
  });
});

// 7. pdf-to-img (4 variations)
const pdfToImgFormats = ['png', 'jpg', 'jpeg', 'webp'];
pdfToImgFormats.forEach(fmt => {
  TOOL_VARIATIONS.push({
    id: `pdf-to-${fmt}`,
    toolId: 'pdf-to-img',
    name: `Convert PDF to ${fmt.toUpperCase()}`,
    description: `Convert PDF documents to high-resolution ${fmt.toUpperCase()} images free online. Export each page individually without server uploads.`,
    seoTitle: `Convert PDF to ${fmt.toUpperCase()} Free Online | DomoDomo`,
    keywords: `pdf to ${fmt}, convert pdf to ${fmt}, pdf to image, extract pages as ${fmt}`
  });
});

// 8. img-to-pdf (4 variations)
pdfToImgFormats.forEach(fmt => {
  TOOL_VARIATIONS.push({
    id: `${fmt}-to-pdf`,
    toolId: 'img-to-pdf',
    name: `Convert ${fmt.toUpperCase()} to PDF`,
    description: `Convert ${fmt.toUpperCase()} images to PDF documents free online. Compile photos into clean multi-page PDFs instantly.`,
    seoTitle: `Convert ${fmt.toUpperCase()} to PDF Free Online | DomoDomo`,
    keywords: `${fmt} to pdf, convert ${fmt} to pdf, images to pdf, compile ${fmt} as pdf`
  });
});

// 9. ocr-scanner (6 variations)
const ocrScans = [
  { id: 'ocr-image-to-text', name: 'OCR Image to Text Converter' },
  { id: 'ocr-jpg-to-text', name: 'OCR JPG to Text Reader' },
  { id: 'ocr-png-to-text', name: 'OCR PNG to Text Extractor' },
  { id: 'extract-text-from-photo', name: 'Extract Text from Photo' },
  { id: 'read-text-from-image', name: 'Read Text from Image' },
  { id: 'image-text-reader', name: 'Online Image Text Reader' }
];
ocrScans.forEach(o => {
  TOOL_VARIATIONS.push({
    id: o.id,
    toolId: 'ocr-scanner',
    name: o.name,
    description: `${o.name} free online. Read and extract printed characters from scanned files using local OCR engines.`,
    seoTitle: `${o.name} Free Online | DomoDomo`,
    keywords: `${o.id.replace(/-/g, ' ')}, ${o.name.toLowerCase()}, image to text scanner`
  });
});

console.log(`🤖 Programmatically generated ${TOOL_VARIATIONS.length} SEO variations.`);
