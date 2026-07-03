import { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  ExternalLink,
  Code,
  Copy,
  Check,
  Info,
  Layers,
  Shield,
  Globe,
  Radio,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import PUBLIC_APIS_DATA from '../assets/public-apis.json';

const LOCAL_APIS = [
  {
    name: "Fetch Activity Logs",
    method: "GET",
    endpoint: "http://localhost:8000/api/memory",
    description: "Retrieves the user's recent local activity events logged in the SQLite memory database (last 15 records). Used to power the activity feed on the main dashboard.",
    headers: [
      { key: "Accept", value: "application/json" }
    ],
    payload: null,
    response: `{
  "events": [
    {
      "id": 1,
      "timestamp": "2026-07-03 10:30:12",
      "action": "SQL Execution",
      "category": "dev",
      "detail": "Queried sales database table"
    }
  ]
}`
  },
  {
    name: "Save Activity Log",
    method: "POST",
    endpoint: "http://localhost:8000/api/memory",
    description: "Clears past activity events history and persists a new batch of event logs to the local SQLite database.",
    headers: [
      { key: "Content-Type", value: "application/json" }
    ],
    payload: `{
  "events": [
    {
      "timestamp": "2026-07-03 10:30:12",
      "action": "SQL Execution",
      "category": "dev",
      "detail": "Queried sales database table"
    }
  ]
}`,
    response: `{
  "status": "success"
}`
  },
  {
    name: "Retrieve Journal Thoughts",
    method: "GET",
    endpoint: "http://localhost:8000/api/thoughts",
    description: "Fetches user journal entries, cognitive reflections, and AI insights from SQLite sorted chronologically in descending order.",
    headers: [
      { key: "Accept", value: "application/json" }
    ],
    payload: null,
    response: `[
  {
    "id": 1,
    "content": "Building local-first SQLite query tool today.",
    "embedding_json": "[0.024, -0.118, ...]",
    "category": "journal",
    "ai_insight": "Local database workflows provide zero network latencies.",
    "created_at": 1783003096.8
  }
]`
  },
  {
    name: "Create Journal Thought",
    method: "POST",
    endpoint: "http://localhost:8000/api/thoughts",
    description: "Ingests a thought, requests a neural embedding vector from local Ollama LLM daemon, generates a constructive AI insight, and writes to SQLite database.",
    headers: [
      { key: "Content-Type", value: "application/json" }
    ],
    payload: `{
  "content": "Building local-first SQLite query tool today.",
  "category": "journal",
  "model": "llama3.2"
}`,
    response: `{
  "id": 1,
  "content": "Building local-first SQLite query tool today.",
  "embedding_json": "[0.024, -0.118, ...]",
  "category": "journal",
  "ai_insight": "Local database workflows provide zero network latencies.",
  "created_at": 1783003096.8
}`
  },
  {
    name: "Semantic Vector Search",
    method: "POST",
    endpoint: "http://localhost:8000/api/thoughts/search",
    description: "Performs client-side cosine similarity matching between a user search query vector and stored journal thought embeddings for semantic retrieval (RAG).",
    headers: [
      { key: "Content-Type", value: "application/json" }
    ],
    payload: `{
  "query": "local SQLite data workbench",
  "model": "llama3.2",
  "threshold": 0.35,
  "limit": 4
}`,
    response: `[
  {
    "id": 1,
    "content": "Building local-first SQLite query tool today.",
    "category": "journal",
    "ai_insight": "Local database workflows provide zero network latencies.",
    "created_at": 1783003096.8,
    "score": 0.584
  }
]`
  },
  {
    name: "Semantic RAG Generation",
    method: "POST",
    endpoint: "http://localhost:8000/api/thoughts/generate",
    description: "Performs semantic vector search matching the prompt, wraps match nodes as context prompts, and runs local Ollama model to generate a unified RAG story.",
    headers: [
      { key: "Content-Type", value: "application/json" }
    ],
    payload: `{
  "prompt": "Summarize my database progress.",
  "model": "llama3.2",
  "temperature": 0.7
}`,
    response: `{
  "story": "You focused on serverless SQLite client-side components today, noting that local database workflows provide zero network latencies.",
  "context_used": [
    "Building local-first SQLite query tool today."
  ]
}`
  },
  {
    name: "Ollama Chat Proxy",
    method: "POST",
    endpoint: "http://localhost:8000/api/chat",
    description: "Direct proxy connecting to local Ollama endpoints. Handles text generation cache lookups, logging, and Server-Sent Events (SSE) stream responses.",
    headers: [
      { key: "Content-Type", value: "application/json" }
    ],
    payload: `{
  "model": "llama3.2",
  "prompt": "Hello Domo!",
  "system_prompt": "You are a helpful assistant.",
  "temperature": 0.7,
  "stream": false
}`,
    response: `{
  "response": "Hello! I am Domo, your offline local AI. How can I help you today?",
  "cached": false
}`
  }
];

const getLocalCodeSnippet = (api: any, lang: 'js' | 'python' | 'curl') => {
  const isPost = api.method === 'POST';
  const bodyStr = api.payload ? `,\n  body: JSON.stringify(${api.payload.split('\n').join('\n  ')})` : '';

  if (lang === 'js') {
    return `// JavaScript Fetch Example
fetch("${api.endpoint}"${isPost ? `, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  }${bodyStr}
}` : ''})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
  } else if (lang === 'python') {
    const dataStr = api.payload ? `\nimport json\npayload = ${api.payload}` : '';
    return `# Python requests Example
import requests${dataStr}

url = "${api.endpoint}"
try:
    response = requests.${api.method.toLowerCase()}(url${api.payload ? ', json=payload' : ''})
    response.raise_for_status()
    print(response.json())
except requests.exceptions.RequestException as e:
    print("Error:", e)`;
  } else {
    const curlBody = api.payload ? ` \\\n  -d '${api.payload.replace(/\n/g, '').replace(/\s+/g, ' ')}'` : '';
    return `# cURL Terminal Command
curl -X ${api.method} "${api.endpoint}" \\
  -H "Content-Type: application/json"${curlBody}`;
  }
};

interface APIEntry {
  name: string;
  description: string;
  category: string;
  auth: string;
  https: boolean;
  cors: string;
  link: string;
}

export const LibraryApi = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAuth, setSelectedAuth] = useState('All');
  const [selectedApi, setSelectedApi] = useState<APIEntry | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'js' | 'python' | 'curl'>('js');
  const [drawerClosing, setDrawerClosing] = useState(false);

  // Section States
  const [currentSection, setCurrentSection] = useState<'public' | 'local'>('public');
  const [selectedLocalIdx, setSelectedLocalIdx] = useState<number>(0);
  const [activeLocalTab, setActiveLocalTab] = useState<'js' | 'python' | 'curl'>('js');

  const closeDrawer = useCallback(() => {
    setDrawerClosing(true);
    setTimeout(() => {
      setSelectedApi(null);
      setDrawerClosing(false);
    }, 250);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (selectedApi) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedApi]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 32;

  // Extract categories dynamically and sort alphabetically
  const categories = useMemo(() => {
    const uniqueCats = new Set<string>();
    PUBLIC_APIS_DATA.forEach((api) => {
      if (api.category) {
        uniqueCats.add(api.category);
      }
    });
    return ['All', ...Array.from(uniqueCats).sort()];
  }, []);

  // Extract auth types dynamically
  const authTypes = useMemo(() => {
    const uniqueAuths = new Set<string>();
    PUBLIC_APIS_DATA.forEach((api) => {
      if (api.auth && api.auth.trim().toLowerCase() !== 'all') {
        uniqueAuths.add(api.auth);
      }
    });
    return ['All', ...Array.from(uniqueAuths).sort()];
  }, []);

  // Filter APIs
  const filteredApis = useMemo(() => {
    // Reset page whenever filter changes
    setCurrentPage(1);
    
    return (PUBLIC_APIS_DATA as APIEntry[]).filter((api) => {
      const matchesSearch =
        api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || api.category === selectedCategory;
      const matchesAuth = selectedAuth === 'All' || api.auth === selectedAuth;

      return matchesSearch && matchesCategory && matchesAuth;
    });
  }, [searchQuery, selectedCategory, selectedAuth]);

  // Paginated APIs
  const paginatedApis = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApis.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApis, currentPage]);

  const totalPages = Math.ceil(filteredApis.length / itemsPerPage);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(type);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const getCodeSnippet = (api: APIEntry, lang: 'js' | 'python' | 'curl') => {
    // Format a nice mock endpoint URL from the website URL or a dummy
    let endpoint = api.link;
    if (!endpoint.startsWith('http')) {
      endpoint = 'https://api.example.com';
    }

    if (lang === 'js') {
      return `// JavaScript Fetch Example
fetch("${endpoint}")
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log("Success:", data);
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });`;
    } else if (lang === 'python') {
      return `# Python requests Example
import requests

url = "${endpoint}"
try:
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    print("Success:", data)
except requests.exceptions.RequestException as e:
    print("Error fetching data:", e)`;
    } else {
      return `# cURL Terminal Command
curl -X GET "${endpoint}" \\
  -H "Accept: application/json"`;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <Helmet>
        <title>Developer API Library - Free Web APIs | DomoDomo</title>
        <meta name="description" content="Browse a curated library of free public developer APIs. Find and filter APIs by category, authentication type, and CORS support for your projects." />
        <link rel="canonical" href="https://domodomo.site/library-api" />
      </Helmet>
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18191B] to-[#1E2022] border border-[#2A2D30] p-8 md:p-10 shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3C6B4D]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/25 text-xs font-bold uppercase tracking-wider">
            <Database size={13} />
            <span>Public API Repository</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#ECEBE9] tracking-tight">
            Library API Hub
          </h1>
          <p className="text-[#A3A09B] text-sm md:text-base leading-relaxed">
            Browse through 1,900+ verified, free, and open-source public APIs across dozens of industries. Select APIs to check authentication models, CORS details, links, and code snippets.
          </p>
        </div>
      </div>

      {/* Section Tab Selector */}
      <div className="flex border-b border-[#2A2D30] gap-6">
        <button
          onClick={() => setCurrentSection('public')}
          className={`pb-3 font-bold text-sm transition-all relative ${
            currentSection === 'public' ? 'text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9]'
          }`}
        >
          <span>Public API Directory</span>
          {currentSection === 'public' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3C6B4D]" />
          )}
        </button>
        <button
          onClick={() => setCurrentSection('local')}
          className={`pb-3 font-bold text-sm transition-all relative flex items-center gap-2 ${
            currentSection === 'local' ? 'text-[#3C6B4D]' : 'text-[#72706C] hover:text-[#ECEBE9]'
          }`}
        >
          <span>Local Sandbox APIs</span>
          <span className="px-1.5 py-0.5 rounded bg-[#3C6B4D]/15 text-[#4E8E5E] border border-[#3C6B4D]/25 text-[9px] font-bold uppercase tracking-wider">
            Active
          </span>
          {currentSection === 'local' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3C6B4D]" />
          )}
        </button>
      </div>

      {currentSection === 'public' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Filters and Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Search Box */}
            <div className="glass-card p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase text-[#72706C] tracking-widest flex items-center gap-2">
                <Search size={12} />
                <span>Search APIs</span>
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#3C6B4D]/50 transition-colors"
                />
                <Search size={14} className="absolute left-3 top-2.5 text-[#72706C]" />
              </div>
            </div>

            {/* Auth Filter */}
            <div className="glass-card p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase text-[#72706C] tracking-widest flex items-center gap-2">
                <Shield size={12} />
                <span>Auth Filter</span>
              </h3>
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto scrollbar-none">
                {authTypes.map((authType) => (
                  <button
                    key={authType}
                    onClick={() => setSelectedAuth(authType)}
                    className={`w-full text-left text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-between ${
                      selectedAuth === authType
                        ? 'bg-[#3C6B4D]/10 text-[#ECEBE9] border border-[#3C6B4D]/30'
                        : 'text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022] border border-transparent'
                    }`}
                  >
                    <span>{authType === '' ? 'None' : authType}</span>
                    {selectedAuth === authType && <span className="w-1.5 h-1.5 rounded-full bg-[#3C6B4D]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Category List */}
            <div className="glass-card p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase text-[#72706C] tracking-widest flex items-center gap-2">
                <Layers size={12} />
                <span>Categories</span>
              </h3>
              <div className="flex flex-col gap-1 max-h-[450px] overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const count = cat === 'All' 
                    ? PUBLIC_APIS_DATA.length 
                    : PUBLIC_APIS_DATA.filter(a => a.category === cat).length;
                  
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left text-xs font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-between ${
                        selectedCategory === cat
                          ? 'bg-[#3C6B4D] text-[#ECEBE9] shadow-sm'
                          : 'text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                      }`}
                    >
                      <span className="truncate mr-2">{cat}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0 ${
                        selectedCategory === cat ? 'bg-[#2E533B] text-[#ECEBE9]' : 'bg-[#111213] text-[#72706C]'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* API Grid Explorer */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-[#72706C]">
                Showing {filteredApis.length} of {PUBLIC_APIS_DATA.length} results
              </p>
            </div>

            {filteredApis.length === 0 ? (
              <div className="glass-card p-12 text-center space-y-3">
                <Database size={40} className="mx-auto text-[#72706C] stroke-[1.5]" />
                <h3 className="text-sm font-bold text-[#ECEBE9]">No APIs Found</h3>
                <p className="text-xs text-[#72706C] max-w-sm mx-auto">
                  No public APIs matched your current category, search queries, or authorization filters. Try broadening your criteria.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedApis.map((api) => (
                    <div
                      key={`${api.name}-${api.category}`}
                      onClick={() => setSelectedApi(api)}
                      className="glass-card glass-card-hover p-5 flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold tracking-wider text-[#3C6B4D] uppercase bg-[#3C6B4D]/10 px-2 py-0.5 rounded-md">
                              {api.category}
                            </span>
                            <h3 className="text-sm font-bold text-[#ECEBE9] group-hover:text-[#3C6B4D] transition-colors mt-1.5">
                              {api.name}
                            </h3>
                          </div>
                          <ChevronRight size={16} className="text-[#72706C] group-hover:text-[#ECEBE9] transition-colors shrink-0" />
                        </div>

                        <p className="text-xs text-[#A3A09B] line-clamp-2 leading-relaxed">
                          {api.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#2A2D30]/50 flex flex-wrap gap-2 items-center text-[10px] font-mono text-[#72706C]">
                        <span className="flex items-center gap-1">
                          <Shield size={11} className={api.auth === 'No' || api.auth === 'none' ? 'text-[#3C6B4D]' : 'text-[#E29E2D]'} />
                          Auth: {api.auth || 'None'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Globe size={11} className="text-sky-500" />
                          HTTPS: {api.https ? 'Yes' : 'No'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Radio size={11} className="text-emerald-500" />
                          CORS: {api.cors || 'unknown'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-[#2A2D30]">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} />
                      <span>Previous</span>
                    </button>
                    
                    <span className="text-xs font-mono text-[#A3A09B]">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left w-full animate-fadeIn">
          {/* Sidebar list of local endpoints */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="glass-card p-4 space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#72706C] tracking-wider block">Backend Server</span>
              <div className="flex items-center justify-between p-2.5 bg-[#111213] rounded-xl border border-[#2A2D30]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-mono font-bold text-[#ECEBE9]">http://localhost:8000</span>
                  <span className="text-[9px] text-[#72706C]">FastAPI Engine Port</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#4E8E5E] border border-[#3C6B4D]/25 text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3C6B4D] animate-pulse" />
                  <span>Active</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {LOCAL_APIS.map((api, idx) => {
                const isSelected = selectedLocalIdx === idx;
                const isPost = api.method === 'POST';
                return (
                  <button
                    key={api.name}
                    onClick={() => setSelectedLocalIdx(idx)}
                    className={`w-full p-4 rounded-2xl border transition-all text-left flex flex-col gap-1.5 ${
                      isSelected 
                        ? 'bg-[#18191B] border-[#3C6B4D]/45 shadow-sm' 
                        : 'bg-[#18191B] border-[#2A2D30] hover:border-[#3C6B4D]/25'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-[#ECEBE9] text-xs leading-snug">{api.name}</span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-extrabold uppercase tracking-wide shrink-0 ${
                        isPost 
                          ? 'bg-[#3C6B4D]/15 border border-[#3C6B4D]/25 text-[#4E8E5E]' 
                          : 'bg-indigo-500/10 border border-indigo-500/25 text-indigo-400'
                      }`}>
                        {api.method}
                      </span>
                    </div>
                    <span className="font-mono text-[9px] text-[#72706C] truncate">{api.endpoint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right side: Detailed inspector pane */}
          <div className="lg:col-span-8 bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 flex flex-col gap-6 w-full animate-fadeIn min-h-[450px]">
            {(() => {
              const api = LOCAL_APIS[selectedLocalIdx];
              const isPost = api.method === 'POST';
              const localSnippet = getLocalCodeSnippet(api, activeLocalTab);
              
              return (
                <>
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4 pb-4 border-b border-[#2A2D30]">
                    <div className="flex flex-col gap-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-extrabold uppercase tracking-wide ${
                          isPost 
                            ? 'bg-[#3C6B4D]/15 border border-[#3C6B4D]/25 text-[#4E8E5E]' 
                            : 'bg-indigo-500/10 border border-indigo-500/25 text-indigo-400'
                        }`}>
                          {api.method}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#ECEBE9]">{api.endpoint}</span>
                      </div>
                      <h2 className="text-xl font-extrabold text-[#ECEBE9] tracking-tight mt-1">{api.name}</h2>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-left space-y-1">
                    <span className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider block">Description</span>
                    <p className="text-xs text-[#A3A09B] leading-relaxed">{api.description}</p>
                  </div>

                  {/* Request Headers & Payload */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider block">Request Headers</span>
                      <div className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3 font-mono text-[10px] text-[#A3A09B] space-y-1">
                        {api.headers.map(h => (
                          <div key={h.key} className="flex gap-1.5">
                            <span className="text-[#ECEBE9] font-bold">{h.key}:</span>
                            <span>{h.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {api.payload && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider block">Body Schema</span>
                        <div className="relative group/payload">
                          <pre className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3 font-mono text-[9px] text-[#A3A09B] overflow-x-auto max-h-[120px] whitespace-pre-wrap leading-relaxed">
                            {api.payload}
                          </pre>
                          <button
                            onClick={() => handleCopy(api.payload!, 'payload')}
                            className="absolute top-2 right-2 p-1.5 rounded-md bg-[#18191B] border border-[#2A2D30] text-[#72706C] hover:text-[#ECEBE9] opacity-0 group-hover/payload:opacity-100 transition-all"
                            title="Copy Payload"
                          >
                            {copiedSnippet === 'payload' ? <Check size={11} className="text-[#3C6B4D]" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Code Snippets */}
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2">
                      <span className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider">Code Execution Snippets</span>
                      <div className="flex bg-[#111213] p-0.5 border border-[#2A2D30] rounded-lg">
                        {(['js', 'python', 'curl'] as const).map(lang => (
                          <button
                            key={lang}
                            onClick={() => setActiveLocalTab(lang)}
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                              activeLocalTab === lang 
                                ? 'bg-[#3C6B4D] text-[#ECEBE9]' 
                                : 'text-[#72706C] hover:text-[#ECEBE9]'
                            }`}
                          >
                            {lang === 'js' ? 'Fetch' : lang === 'python' ? 'Python' : 'cURL'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative group/snippet">
                      <pre className="bg-[#111213] border border-[#2A2D30] rounded-xl p-4 font-mono text-[10px] text-[#A3A09B] overflow-x-auto max-h-[160px] leading-relaxed">
                        {localSnippet}
                      </pre>
                      <button
                        onClick={() => handleCopy(localSnippet, 'snippet')}
                        className="absolute top-3.5 right-3.5 p-1.5 rounded-md bg-[#18191B] border border-[#2A2D30] text-[#72706C] hover:text-[#ECEBE9] opacity-0 group-hover/snippet:opacity-100 transition-all"
                        title="Copy snippet"
                      >
                        {copiedSnippet === 'snippet' ? <Check size={12} className="text-[#3C6B4D]" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* Response payload */}
                  <div className="space-y-1.5 text-left">
                    <span className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider block">Response Example (JSON)</span>
                    <div className="relative group/response">
                      <pre className="bg-[#111213] border border-[#2A2D30] rounded-xl p-4 font-mono text-[9px] text-[#A3A09B] overflow-x-auto max-h-[160px] leading-relaxed">
                        {api.response}
                      </pre>
                      <button
                        onClick={() => handleCopy(api.response, 'response')}
                        className="absolute top-3.5 right-3.5 p-1.5 rounded-md bg-[#18191B] border border-[#2A2D30] text-[#72706C] hover:text-[#ECEBE9] opacity-0 group-hover/response:opacity-100 transition-all"
                        title="Copy response"
                      >
                        {copiedSnippet === 'response' ? <Check size={12} className="text-[#3C6B4D]" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Details Side-Drawer / Modal Overlay */}
      {selectedApi && createPortal(
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 ${
            drawerClosing ? 'animate-fade-out' : 'animate-fade-in'
          }`}
          onClick={closeDrawer}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal Panel - Centered */}
          <div
            className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#18191B] border border-[#2A2D30] rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ${
              drawerClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="shrink-0 p-6 md:p-8 pb-4 border-b border-[#2A2D30]/60 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider text-[#3C6B4D] uppercase bg-[#3C6B4D]/10 px-2.5 py-1 rounded-md">
                  {selectedApi.category}
                </span>
                <button
                  onClick={closeDrawer}
                  className="text-xs font-semibold text-[#A3A09B] hover:text-[#ECEBE9] bg-[#1E2022] hover:bg-[#25282B] px-3 py-1.5 rounded-lg border border-[#2A2D30] transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-[#ECEBE9] flex items-center gap-2">
                  <span>{selectedApi.name}</span>
                </h2>
                <p className="text-xs text-[#A3A09B] leading-relaxed">
                  {selectedApi.description}
                </p>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 py-4 space-y-6">
              {/* Specs Table */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#111213] border border-[#2A2D30] text-xs">
                <div className="space-y-1">
                  <span className="text-[#72706C] block">Authorization</span>
                  <span className="font-mono font-bold text-[#ECEBE9]">{selectedApi.auth || 'None'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[#72706C] block">CORS Support</span>
                  <span className="font-mono font-bold text-[#ECEBE9] uppercase">{selectedApi.cors || 'UNKNOWN'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[#72706C] block">HTTPS Supported</span>
                  <span className="font-mono font-bold text-[#ECEBE9]">{selectedApi.https ? 'Yes' : 'No'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[#72706C] block">API Repository Category</span>
                  <span className="font-mono font-bold text-[#ECEBE9]">{selectedApi.category}</span>
                </div>
              </div>

              {/* Endpoint Detail */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-[#72706C] tracking-wider flex items-center gap-1.5">
                  <Globe size={12} />
                  <span>Website / Endpoint Link</span>
                </h4>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#111213] border border-[#2A2D30] font-mono text-[11px] text-[#3C6B4D] overflow-x-auto scrollbar-none">
                  <span className="text-[#ECEBE9] select-none">URL</span>
                  <span className="truncate">{selectedApi.link}</span>
                </div>
              </div>

              {/* Deep Analysis Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-[#72706C] tracking-wider flex items-center gap-1.5">
                  <Info size={12} />
                  <span>Integration Details & Analysis</span>
                </h4>
                <p className="text-xs text-[#A3A09B] leading-relaxed">
                  This public API allows integration with the {selectedApi.category} database catalog. It operates on standard JSON data structures and supports {selectedApi.https ? 'secure TLS/HTTPS queries' : 'unsecured requests'}. The API authorization model is {selectedApi.auth || 'unauthenticated / open-access'}.
                </p>
              </div>

              {/* Code Snippets Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-[#72706C] tracking-wider flex items-center gap-1.5">
                    <Code size={12} />
                    <span>Integration Snippets</span>
                  </h4>
                  <div className="flex items-center gap-1 bg-[#111213] p-1 rounded-lg border border-[#2A2D30]">
                    {(['js', 'python', 'curl'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveTab(lang)}
                        className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                          activeTab === lang
                            ? 'bg-[#3C6B4D] text-[#ECEBE9]'
                            : 'text-[#A3A09B] hover:text-[#ECEBE9]'
                        }`}
                      >
                        {lang === 'js' ? 'Fetch' : lang === 'python' ? 'Python' : 'cURL'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative group">
                  <pre className="p-4 rounded-xl bg-[#111213] border border-[#2A2D30] text-[10px] font-mono text-[#A3A09B] overflow-x-auto leading-relaxed max-h-48 scrollbar-none">
                    <code>{getCodeSnippet(selectedApi, activeTab)}</code>
                  </pre>
                  <button
                    onClick={() => handleCopy(getCodeSnippet(selectedApi, activeTab), activeTab)}
                    className="absolute right-3 top-3 p-1.5 rounded-lg bg-[#18191B] hover:bg-[#25282B] border border-[#2A2D30] text-[#72706C] hover:text-[#ECEBE9] transition-colors"
                  >
                    {copiedSnippet === activeTab ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons (Fixed Footer) */}
            <div className="shrink-0 p-6 md:p-8 pt-4 border-t border-[#2A2D30]/60 flex gap-3">
              <a
                href={selectedApi.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 text-xs py-2.5"
              >
                <Bookmark size={14} />
                <span>Visit API Website</span>
                <ExternalLink size={12} />
              </a>
              <button
                onClick={closeDrawer}
                className="btn-secondary text-xs px-5"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
export default LibraryApi;
