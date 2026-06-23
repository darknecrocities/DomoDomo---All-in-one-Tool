import { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
