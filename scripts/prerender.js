import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://domodomo.site';
const distPath = path.resolve('./dist');

if (!fs.existsSync(distPath)) {
  console.error('❌ Build directory dist/ does not exist. Please run npm run build first.');
  process.exit(1);
}

// 1. Read index.html template from build output
const templatePath = path.resolve(distPath, 'index.html');
const templateHtml = fs.readFileSync(templatePath, 'utf-8');

// 2. Parse tools from registry
const registryPath = path.resolve('./src/engine/registry.ts');
const registryContent = fs.readFileSync(registryPath, 'utf-8');

const toolBlocks = registryContent.match(/\{\s*id:\s*['"][\s\S]*?component:\s*\w+\s*\}/g) || [];
const tools = toolBlocks.map(block => {
  const id = (block.match(/id:\s*['"]([^'"]+)['"]/) || [])[1];
  const name = (block.match(/name:\s*['"]([^'"]+)['"]/) || [])[1];
  const category = (block.match(/category:\s*['"]([^'"]+)['"]/) || [])[1];
  const description = (block.match(/description:\s*['"]([^'"]+)['"]/) || [])[1];
  const seoTitle = (block.match(/seoTitle:\s*['"]([^'"]+)['"]/) || [])[1];
  const keywords = (block.match(/keywords:\s*['"]([^'"]+)['"]/) || [])[1];
  
  return {
    id,
    name,
    category,
    description,
    seoTitle: seoTitle || `${name} - Free Online Tool | DomoDomo`,
    keywords: keywords || `${name?.toLowerCase()}, free ${name?.toLowerCase()}, online ${name?.toLowerCase()}, ${category} tools, domodomo`
  };
}).filter(t => t.id);

console.log(`🤖 Found ${tools.length} tools to prerender.`);

// Helper to sanitize strings for HTML insertion
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 3. Prerender each tool page
tools.forEach(tool => {
  const toolUrl = `${BASE_URL}/tool/${tool.id}`;
  const categoryLabel = tool.category.charAt(0).toUpperCase() + tool.category.slice(1);
  const seoDesc = tool.description.length > 120 
    ? tool.description 
    : `${tool.description} Use ${tool.name} free online — runs 100% locally in your browser.`;

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "DomoDomo",
        "item": "https://domodomo.site"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": categoryLabel,
        "item": `https://domodomo.site/?category=${tool.category}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tool.name,
        "item": toolUrl
      }
    ]
  };

  // WebApplication schema
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.name,
    "url": toolUrl,
    "description": tool.description,
    "applicationCategory": `${categoryLabel}Application`,
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5, WebAssembly, and modern browser support.",
    "featureList": `${tool.name}, Local Processing, No Data Upload, Free, Privacy-First`,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  // Customize header tags
  let pageHtml = templateHtml
    // Title
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(tool.seoTitle)}</title>`)
    // Meta Description
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${escapeHtml(seoDesc)}" />`)
    // Meta Keywords
    .replace(/<meta name="keywords" content=".*?" \/>/, `<meta name="keywords" content="${escapeHtml(tool.keywords)}" />`)
    // OpenGraph Title
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${escapeHtml(tool.seoTitle)}" />`)
    // OpenGraph Description
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${escapeHtml(seoDesc)}" />`)
    // OpenGraph URL
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${escapeHtml(toolUrl)}" />`)
    // Twitter Title
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${escapeHtml(tool.seoTitle)}" />`)
    // Twitter Description
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${escapeHtml(seoDesc)}" />`)
    // Canonical link
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${escapeHtml(toolUrl)}" />`);

  // Inject Schemas before </head>
  const schemasHtml = `
    <script type="application/ld+json">${JSON.stringify(schemaMarkup)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  `;
  pageHtml = pageHtml.replace('</head>', `${schemasHtml}</head>`);

  // 4. Inject static HTML fallback into <div id="root"></div> for non-JS browsers & bots
  const staticFallback = `
    <div id="seo-fallback" style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif; color: #ecebe9; text-align: left;">
      <nav style="margin-bottom: 1rem; font-size: 0.85rem; color: #a3a09b;">
        <a href="/" style="color: #4e8e5e; text-decoration: none;">Dashboard</a> &gt; 
        <a href="/?category=${tool.category}" style="color: #4e8e5e; text-decoration: none;">${categoryLabel}</a> &gt; 
        <span>${tool.name}</span>
      </nav>
      <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; color: #ecebe9;">${escapeHtml(tool.name)}</h1>
      <p style="font-size: 1.1rem; line-height: 1.6; color: #a3a09b; margin-bottom: 2rem;">${escapeHtml(tool.description)}</p>
      
      <div style="background: #18191b; border: 1px solid #2a2d30; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
        <h2 style="font-size: 1.25rem; margin-top: 0; color: #4e8e5e;">Key Features:</h2>
        <ul style="line-height: 1.8; padding-left: 1.2rem; margin-bottom: 0;">
          <li><strong>100% Local &amp; Private:</strong> All processing is done inside your browser. No files are uploaded to any server.</li>
          <li><strong>Free Online Access:</strong> No subscription, no registrations, no watermarks, completely unlimited.</li>
          <li><strong>WASM/W3C Powered:</strong> Running local CPU/GPU engines with client-side sandbox execution.</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 3rem;">
        <p style="font-size: 0.9rem; color: #72706c;">Please enable JavaScript to run this interactive local tool.</p>
        <a href="/" style="display: inline-block; padding: 0.75rem 1.5rem; background: #4e8e5e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Return to Dashboard</a>
      </div>
    </div>
  `;

  pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${staticFallback}</div>`);

  // Save tool folder output
  const toolDir = path.resolve(distPath, 'tool', tool.id);
  fs.mkdirSync(toolDir, { recursive: true });
  fs.writeFileSync(path.resolve(toolDir, 'index.html'), pageHtml);
});

// 5. Prerender static main pages (About, Docs, Library API, Blog)
const staticPages = [
  { path: 'about', title: 'About DomoDomo - All-in-One Local Toolbox', desc: 'DomoDomo is a privacy-first local toolbox running 110+ secure developer, media, and document utilities inside a client-side browser tab sandbox.' },
  { path: 'docs', title: 'DomoDomo Documentation - Setup and API Reference', desc: 'Read the developer guides, architectural setup, and documentation for DomoDomo local tools.' },
  { path: 'library-api', title: 'Domo Local AI Library API Reference', desc: 'Integrate and call local AI model APIs (Ollama, WebNN) directly from DomoDomo dashboard.' },
  { path: 'blog', title: 'DomoDomo SEO Content Hub & Guides | 110+ Local Tools', desc: 'Read our technical guides on file security, image background removal, PDF compression, and local offline AI setups. DomoDomo guides hub.' }
];

staticPages.forEach(page => {
  const pageUrl = `${BASE_URL}/${page.path}`;
  let pageHtml = templateHtml
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${escapeHtml(page.desc)}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${escapeHtml(page.desc)}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${escapeHtml(pageUrl)}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${escapeHtml(page.desc)}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${escapeHtml(pageUrl)}" />`);

  const staticFallback = `
    <div id="seo-fallback" style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif; color: #ecebe9; text-align: left;">
      <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; color: #ecebe9;">${escapeHtml(page.title)}</h1>
      <p style="font-size: 1.1rem; line-height: 1.6; color: #a3a09b; margin-bottom: 2rem;">${escapeHtml(page.desc)}</p>
      <div style="text-align: center; margin-top: 3rem;">
        <a href="/" style="display: inline-block; padding: 0.75rem 1.5rem; background: #4e8e5e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
      </div>
    </div>
  `;
  pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${staticFallback}</div>`);

  const pageDir = path.resolve(distPath, page.path);
  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(path.resolve(pageDir, 'index.html'), pageHtml);
});

// 6. Prerender each individual blog article route
const blogDataPath = path.resolve('./src/data/blogData.ts');
const blogDataContent = fs.readFileSync(blogDataPath, 'utf-8');

// Parse the BLOG_POSTS array from blogData.ts using regular expressions
const postBlocks = blogDataContent.match(/\{\s*slug:\s*['"][\s\S]*?content:\s*`[\s\S]*?`\s*\}/g) || [];
const blogPosts = postBlocks.map(block => {
  const slug = (block.match(/slug:\s*['"]([^'"]+)['"]/) || [])[1];
  const title = (block.match(/title:\s*['"]([^'"]+)['"]/) || [])[1];
  const excerpt = (block.match(/excerpt:\s*['"]([^'"]+)['"]/) || [])[1];
  const category = (block.match(/category:\s*['"]([^'"]+)['"]/) || [])[1];
  const keywords = (block.match(/keywords:\s*['"]([^'"]+)['"]/) || [])[1];
  const contentMatch = block.match(/content:\s*`([\s\S]*?)`/);
  const content = contentMatch ? contentMatch[1] : '';

  return { slug, title, excerpt, category, keywords, content };
}).filter(p => p.slug);

console.log(`🤖 Found ${blogPosts.length} blog posts to prerender.`);

blogPosts.forEach(post => {
  const postUrl = `${BASE_URL}/blog/${post.slug}`;
  
  let pageHtml = templateHtml
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(post.title)} | DomoDomo Guides</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${escapeHtml(post.excerpt)}" />`)
    .replace(/<meta name="keywords" content=".*?" \/>/, `<meta name="keywords" content="${escapeHtml(post.keywords)}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${escapeHtml(post.title)}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${escapeHtml(post.excerpt)}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${escapeHtml(postUrl)}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${escapeHtml(post.title)}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${escapeHtml(post.excerpt)}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${escapeHtml(postUrl)}" />`);

  // Basic HTML rendering of markdown inside fallback div
  const staticFallback = `
    <div id="seo-fallback" style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif; color: #ecebe9; text-align: left;">
      <nav style="margin-bottom: 1rem; font-size: 0.85rem; color: #a3a09b;">
        <a href="/" style="color: #4e8e5e; text-decoration: none;">Dashboard</a> &gt; 
        <a href="/blog" style="color: #4e8e5e; text-decoration: none;">Blog</a> &gt; 
        <span>${post.title}</span>
      </nav>
      <h1 style="font-size: 2.2rem; margin-bottom: 0.5rem; color: #ecebe9;">${escapeHtml(post.title)}</h1>
      <div style="font-size: 0.85rem; color: #72706c; margin-bottom: 2rem;">Category: ${escapeHtml(post.category)}</div>
      
      <div style="line-height: 1.7; color: #a3a09b;">
        ${post.content
          .replace(/\n\s*\n/g, '<br/><br/>')
          .replace(/## (.*?)\n/g, '<h2 style="color:#ecebe9; margin-top:2rem;">$1</h2>')
          .replace(/# (.*?)\n/g, '<h1 style="color:#ecebe9; margin-top:2.5rem;">$1</h1>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        }
      </div>
      
      <div style="text-align: center; margin-top: 3rem; border-t: 1px solid #2a2d30; pt: 2rem;">
        <a href="/" style="display: inline-block; padding: 0.75rem 1.5rem; background: #4e8e5e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Explore 110+ Offline Tools</a>
      </div>
    </div>
  `;

  pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${staticFallback}</div>`);

  const postDir = path.resolve(distPath, 'blog', post.slug);
  fs.mkdirSync(postDir, { recursive: true });
  fs.writeFileSync(path.resolve(postDir, 'index.html'), pageHtml);
});

console.log('✅ Static Snapshot Prerendering completed successfully.');
