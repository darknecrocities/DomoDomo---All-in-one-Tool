import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://domodomo.site';
const staticRoutes = ['', 'about', 'docs', 'library-api', 'download'];

// High priority tools to boost SEO ranking
const HIGH_PRIORITY_TOOLS = [
  'background-remover',
  'image-resizer',
  'image-compressor',
  'format-converter',
  'pdf-merge',
  'pdf-split',
  'pdf-compress',
  'pdf-to-img',
  'ocr-scanner',
  'resume-builder',
  'qr-generator',
  'wifi-qr',
  'json-format',
  'regex-tester',
  'diff-checker'
];

// Read the registry file to extract tool IDs via regex
const registryPath = path.resolve('./src/engine/registry.ts');
const registryContent = fs.readFileSync(registryPath, 'utf-8');

// Find all matches for: id: 'tool-name' or id: "tool-name"
const toolIdRegex = /id:\s*['"]([^'"]+)['"]/g;
const toolIds = [];
let match;

while ((match = toolIdRegex.exec(registryContent)) !== null) {
  // Prevent duplicate ids in case they appear elsewhere (e.g. in type definitions)
  if (!toolIds.includes(match[1]) && match[1] !== 'all') {
    toolIds.push(match[1]);
  }
}

console.log(`🤖 Extracted ${toolIds.length} tool IDs from registry.`);

// Load blog posts dynamically
const blogDataPath = path.resolve('./src/data/blogData.ts');
const blogDataContent = fs.readFileSync(blogDataPath, 'utf-8');
const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
const blogSlugs = [];
while ((match = slugRegex.exec(blogDataContent)) !== null) {
  if (!blogSlugs.includes(match[1])) {
    blogSlugs.push(match[1]);
  }
}

console.log(`🤖 Extracted ${blogSlugs.length} blog slugs from data.`);

// Generate the tool variations list programmatically
const variations = [];

// 1. format-converter (132 variations)
const imageFormats = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'tiff', 'heic', 'ico', 'svg', 'tga', 'avif'];
imageFormats.forEach(src => {
  imageFormats.forEach(target => {
    if (src !== target) {
      variations.push({ toolId: 'format-converter', variationId: `${src}-to-${target}` });
    }
  });
});

// 2. pdf-merge (5 variations)
const pdfMergeIds = ['merge-two-pdfs', 'combine-pdf-files', 'join-pdfs-online', 'concatenate-pdf', 'bind-pdfs-free'];
pdfMergeIds.forEach(vid => {
  variations.push({ toolId: 'pdf-merge', variationId: vid });
});

// 3. qr-generator (17 variations)
const qrTypeIds = [
  'wifi-qr-code-generator', 'vcard-business-qr-generator', 'custom-logo-qr-generator', 'url-link-qr-generator', 'sms-text-qr-generator', 'email-qr-code-generator',
  'whatsapp-qr-code-generator', 'instagram-qr-code-generator', 'facebook-qr-code-generator', 'youtube-qr-code-generator', 'linkedin-qr-code-generator',
  'tiktok-qr-code-generator', 'pinterest-qr-code-generator', 'paypal-qr-code-generator', 'bitcoin-qr-code-generator', 'ethereum-qr-code-generator', 'crypto-qr-code-generator'
];
qrTypeIds.forEach(vid => {
  variations.push({ toolId: 'qr-generator', variationId: vid });
});

// 4. image-compressor (50 variations)
const compressSizes = ['50kb', '100kb', '150kb', '200kb', '300kb', '400kb', '500kb', '1mb', '2mb', '5mb'];
const compressFormats = ['jpg', 'png', 'jpeg', 'webp', 'gif'];
compressSizes.forEach(size => {
  compressFormats.forEach(fmt => {
    variations.push({ toolId: 'image-compressor', variationId: `compress-${fmt}-to-${size}` });
  });
});

// 5. pdf-compress (9 variations)
const pdfCompressOptions = ['100kb', '200kb', '300kb', '450kb', '500kb', '1mb', '2mb', '3mb', '5mb'];
pdfCompressOptions.forEach(size => {
  variations.push({ toolId: 'pdf-compress', variationId: `compress-pdf-to-${size}` });
});

// 6. image-resizer (150 variations)
const resolutions = [
  '1920x1080', '1280x720', '1080x1350', '1080x1080', '1080x566', '1200x630', '1500x500', '1584x396', '1000x1500', '1080x1920', '820x312',
  '1366x768', '1440x900', '1536x864', '2560x1440', '3840x2160', '1170x2532', '1284x2778', '1179x2556', '1290x2796', '2048x2732',
  '800x800', '800x600', '640x480', '300x250'
];
const resizerFormats = ['jpg', 'png', 'jpeg', 'webp', 'gif', 'bmp'];
resolutions.forEach(res => {
  resizerFormats.forEach(fmt => {
    variations.push({ toolId: 'image-resizer', variationId: `resize-${fmt}-to-${res}` });
  });
});

// 7. pdf-to-img (4 variations)
const pdfToImgFormats = ['png', 'jpg', 'jpeg', 'webp'];
pdfToImgFormats.forEach(fmt => {
  variations.push({ toolId: 'pdf-to-img', variationId: `pdf-to-${fmt}` });
});

// 8. img-to-pdf (4 variations)
pdfToImgFormats.forEach(fmt => {
  variations.push({ toolId: 'img-to-pdf', variationId: `${fmt}-to-pdf` });
});

// 9. ocr-scanner (6 variations)
const ocrScans = ['ocr-image-to-text', 'ocr-jpg-to-text', 'ocr-png-to-text', 'extract-text-from-photo', 'read-text-from-image', 'image-text-reader'];
ocrScans.forEach(vid => {
  variations.push({ toolId: 'ocr-scanner', variationId: vid });
});

console.log(`🤖 Programmatically generated ${variations.length} tool variations for sitemap.`);

const today = new Date().toISOString().split('T')[0];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes
    .map(
      (route) => `
  <url>
    <loc>${BASE_URL}/${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('')}
  ${blogSlugs
    .map(
      (slug) => `
  <url>
    <loc>${BASE_URL}/blog/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
  ${variations
    .map(
      (v) => `
  <url>
    <loc>${BASE_URL}/tool/${v.toolId}/${v.variationId}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}
  ${toolIds
    .map((id) => {
      const isHigh = HIGH_PRIORITY_TOOLS.includes(id);
      return `
  <url>
    <loc>${BASE_URL}/tool/${id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${isHigh ? '0.9' : '0.7'}</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

// Write to public folder so it's copied to dist on build, and to dist folder directly if it exists
const publicSitemapPath = path.resolve('./public/sitemap.xml');
fs.writeFileSync(publicSitemapPath, sitemap.trim());
console.log(`✅ sitemap.xml generated in ${publicSitemapPath}`);

const distPath = path.resolve('./dist');
if (fs.existsSync(distPath)) {
  const distSitemapPath = path.resolve('./dist/sitemap.xml');
  fs.writeFileSync(distSitemapPath, sitemap.trim());
  console.log(`✅ sitemap.xml copied to ${distSitemapPath}`);
}
