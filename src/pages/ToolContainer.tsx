import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getToolById } from '../engine/registry';
import { DynamicIcon } from '../components/DynamicIcon';
import { localMemory } from '../utils/localMemory';

export const ToolContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tool = id ? getToolById(id) : undefined;

  useEffect(() => {
    if (tool) {
      localMemory.logActivity('Opened Tool', tool.category, tool.name);
    }
  }, [tool]);

  if (!tool) {
    return (
      <div className="glass-card p-12 text-center flex flex-col items-center gap-4 max-w-md mx-auto my-12 border-[#2A2D30] bg-[#18191B]">
        <h2 className="text-xl font-bold text-rose-450">Tool Not Found</h2>
        <p className="text-[#A3A09B] text-sm">
          The requested tool does not exist or is still in development.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  const ToolComponent = tool.component;
  const seoTitle = tool.seoTitle || `${tool.name} - Free Online Tool | DomoDomo`;
  const seoDesc = tool.description.length > 120 
    ? tool.description 
    : `${tool.description} Use ${tool.name} free online — runs 100% locally in your browser with no uploads. Part of DomoDomo's 110+ tool suite.`;
  const toolUrl = `https://domodomo.site/tool/${tool.id}`;
  const categoryLabel = tool.category.charAt(0).toUpperCase() + tool.category.slice(1);
  const toolKeywords = tool.keywords || `${tool.name.toLowerCase()}, free ${tool.name.toLowerCase()}, online ${tool.name.toLowerCase()}, ${tool.category} tools, domodomo`;

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

  return (
    <div className="flex flex-col gap-8">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta name="keywords" content={toolKeywords} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={toolUrl} />
        <meta property="og:site_name" content="DomoDomo" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content="https://domodomo.site/favicon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content="https://domodomo.site/favicon.png" />
        <link rel="canonical" href={toolUrl} />
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* Tool Header Breadcrumb */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#2A2D30]">
        <div className="flex flex-col gap-2">
          {/* Breadcrumb nav */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#72706C] uppercase tracking-wider">
            <button
              onClick={() => navigate('/')}
              className="hover:text-[#3C6B4D] flex items-center gap-1 transition-colors"
            >
              <Home size={12} />
              <span>Dashboard</span>
            </button>
            <span>/</span>
            <span className="text-[#A3A09B]">{tool.category}</span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="p-2.5 bg-[#3C6B4D]/10 border border-[#3C6B4D]/25 text-[#3C6B4D] rounded-xl">
              <DynamicIcon name={tool.icon} size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#ECEBE9] font-heading tracking-tight">
              {tool.name}
            </h1>
          </div>
          <p className="text-[#A3A09B] text-sm mt-1 max-w-2xl leading-relaxed">
            {tool.description}
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn-secondary py-2 px-4 text-xs font-bold"
        >
          <ArrowLeft size={14} />
          <span>Dashboard</span>
        </button>
      </div>

      {/* Tool Dynamic Component Frame */}
      <div className="w-full">
        <ToolComponent />
      </div>
    </div>
  );
};
