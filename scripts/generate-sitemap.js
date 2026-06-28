import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://domodomo.site';
const staticRoutes = ['', 'about', 'docs', 'library-api'];

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
