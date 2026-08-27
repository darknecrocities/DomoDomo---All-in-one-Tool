import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, ShieldAlert, RefreshCw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getToolById } from '../engine/registry';
import { DynamicIcon } from '../components/DynamicIcon';
import { localMemory } from '../utils/localMemory';
import { unifiedMemory } from '../utils/unifiedMemory';
import { TOOL_VARIATIONS } from '../data/seoVariations';
import { aiService } from '../utils/aiService';

export const ToolContainer = () => {
  const { id, variation } = useParams<{ id: string; variation?: string }>();
  const navigate = useNavigate();
  const tool = id ? getToolById(id) : undefined;
  const primaryCategory = tool?.categories[0] || 'general';

  const [hasOllama, setHasOllama] = useState<boolean | null>(null);
  const [isCheckingOllama, setIsCheckingOllama] = useState(false);

  const requiresLocalAI = tool
    ? tool.categories.includes('investigation') || tool.categories.includes('ai')
    : false;

  const checkOllamaConnection = async () => {
    setIsCheckingOllama(true);
    try {
      const res = await aiService.checkOllama();
      setHasOllama(res.status);
    } catch {
      setHasOllama(false);
    } finally {
      setIsCheckingOllama(false);
    }
  };

  useEffect(() => {
    if (requiresLocalAI) {
      checkOllamaConnection();
    }
  }, [tool, requiresLocalAI]);

  useEffect(() => {
    if (tool) {
      localMemory.logActivity('Opened Tool', primaryCategory, `${tool.name}${variation ? ' - ' + variation : ''}`);
      unifiedMemory.recordAction('Opened Tool', primaryCategory, `${tool.name}${variation ? ' - ' + variation : ''}`);
    }
  }, [tool, variation, primaryCategory]);

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

  // Find variation info if present
  const matchedVariation = variation
    ? TOOL_VARIATIONS.find((v) => v.toolId === tool.id && v.id === variation)
    : undefined;

  const ToolComponent = tool.component;
  const toolName = matchedVariation ? matchedVariation.name : tool.name;
  const toolDesc = matchedVariation ? matchedVariation.description : tool.description;
  const seoTitle = matchedVariation ? matchedVariation.seoTitle : (tool.seoTitle || `${tool.name} - Free Online Tool | DomoDomo`);
  const seoDesc = toolDesc.length > 120 
    ? toolDesc 
    : `${toolDesc} Use ${toolName} free online — runs 100% locally in your browser with no uploads.`;
  const toolUrl = variation 
    ? `https://domodomo.site/tool/${tool.id}/${variation}`
    : `https://domodomo.site/tool/${tool.id}`;
  const categoryLabel = primaryCategory.charAt(0).toUpperCase() + primaryCategory.slice(1);
  const toolKeywords = matchedVariation ? matchedVariation.keywords : (tool.keywords || `${tool.name.toLowerCase()}, free ${tool.name.toLowerCase()}, online ${tool.name.toLowerCase()}, ${primaryCategory} tools, domodomo`);

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": toolName,
    "url": toolUrl,
    "description": toolDesc,
    "applicationCategory": `${categoryLabel}Application`,
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5, WebAssembly, and modern browser support.",
    "featureList": `${toolName}, Local Processing, No Data Upload, Free, Privacy-First`,
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
        "item": `https://domodomo.site/?category=${primaryCategory}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": toolName,
        "item": toolUrl
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Is ${toolName} free to use?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, ${toolName} on DomoDomo is 100% free with no account creation, subscription, or usage limits.`
        }
      },
      {
        "@type": "Question",
        "name": `Does ${toolName} upload my files or data to an external server?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `No. ${toolName} runs 100% client-side in your browser using WebAssembly, Canvas, or local AI APIs. Your files and data never leave your device.`
        }
      },
      {
        "@type": "Question",
        "name": `Can I use ${toolName} offline?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes! Once loaded, DomoDomo tools run completely offline in your browser sandbox without requiring an active internet connection.`
        }
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
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
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
            <span className="text-[#A3A09B]">{primaryCategory}</span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="p-2.5 bg-[#3C6B4D]/10 border border-[#3C6B4D]/25 text-[#3C6B4D] rounded-xl">
              <DynamicIcon name={tool.icon} size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#ECEBE9] font-heading tracking-tight">
              {toolName}
            </h1>
          </div>
          <p className="text-[#A3A09B] text-sm mt-1 max-w-2xl leading-relaxed">
            {toolDesc}
          </p>
        </div>

        <button
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate('/');
            }
          }}
          className="btn-secondary py-2 px-4 text-xs font-bold"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
      </div>

      {/* Non-blocking Local AI Offline Banner if Ollama is not detected */}
      {requiresLocalAI && hasOllama === false && (
        <div className="bg-[#18191B] border border-[#E29E2D]/30 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E29E2D]/10 text-[#E29E2D] rounded-lg shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-[#ECEBE9] block">
                Local Ollama Offline — Browser Fallback Active
              </span>
              <span className="text-[11px] text-[#A3A09B] block">
                Running in client-side fallback/simulation mode. Start Ollama with <code className="text-[#3C6B4D] font-mono">OLLAMA_ORIGINS="*" ollama serve</code> for local LLM inference.
              </span>
            </div>
          </div>
          <button
            onClick={checkOllamaConnection}
            disabled={isCheckingOllama}
            className="btn-secondary py-1 px-3 text-xs font-semibold shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw size={12} className={isCheckingOllama ? 'animate-spin' : ''} />
            <span>{isCheckingOllama ? 'Checking...' : 'Retry Connection'}</span>
          </button>
        </div>
      )}

      <div className="w-full">
        <ToolComponent />
      </div>
    </div>
  );
};
