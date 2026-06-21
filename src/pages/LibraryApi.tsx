import { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  Code,
  Copy,
  Check,
  Info,
  Layers,
  Shield,
  FileCode,
  Globe,
  Radio,
  Bookmark,
  ChevronRight,
  Database
} from 'lucide-react';

interface APIEntry {
  name: string;
  description: string;
  category: string;
  auth: 'None' | 'API Key' | 'OAuth';
  https: boolean;
  cors: 'yes' | 'no' | 'unknown';
  link: string;
  endpoint: string;
  details: string;
  rateLimit?: string;
  dataType: string;
  sampleResponse?: string;
}

const PUBLIC_APIS_DATA: APIEntry[] = [
  // Animals
  {
    name: 'Dog CEO',
    description: 'The internet\'s biggest collection of open source dog pictures.',
    category: 'Animals',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://dog.ceo/dog-api/',
    endpoint: 'https://dog.ceo/api/breeds/image/random',
    dataType: 'JSON',
    rateLimit: 'Unlimited / Free',
    details: 'Dog CEO API is a local-friendly free public API providing randomized dog photos sorted by breed names. Extremely reliable for front-end testing, UI mockups, or animal apps.',
    sampleResponse: `{
  "message": "https://images.dog.ceo/breeds/retriever-flatcoated/n02099712_279.jpg",
  "status": "success"
}`
  },
  {
    name: 'Cat Facts',
    description: 'Get random cat facts via simple REST endpoint.',
    category: 'Animals',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://catfact.ninja/',
    endpoint: 'https://catfact.ninja/fact',
    dataType: 'JSON',
    rateLimit: 'Unlimited / Free',
    details: 'Cat Facts is a lightweight, zero-authentication API supplying structured cat-related trivia. Ideal for learning asynchronous data fetching and populating test components.',
    sampleResponse: `{
  "fact": "Cats have 30 teeth, while dogs have 42.",
  "length": 38
}`
  },
  // Anime
  {
    name: 'Jikan (MyAnimeList)',
    description: 'The most active open-source MyAnimeList API.',
    category: 'Anime',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://jikan.moe/',
    endpoint: 'https://api.jikan.moe/v4/random/anime',
    dataType: 'JSON',
    rateLimit: '3 requests per second max',
    details: 'Jikan parses the MyAnimeList portal to expose anime, manga, character reviews, and developer analytics without needing MAL official credentials. Very comprehensive dataset.',
    sampleResponse: `{
  "data": {
    "mal_id": 1,
    "url": "https://myanimelist.net/anime/1/Cowboy_Bebop",
    "title": "Cowboy Bebop",
    "episodes": 26,
    "synopsis": "In the year 2071, humanity has colonized the rocky planets..."
  }
}`
  },
  {
    name: 'Studio Ghibli API',
    description: 'Resources from Studio Ghibli films, characters, and locations.',
    category: 'Anime',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://ghibliapi.vercel.app/',
    endpoint: 'https://ghibliapi.vercel.app/films',
    dataType: 'JSON',
    rateLimit: 'Free / Fair Use',
    details: 'Exposes highly structured datasets detailing classic Ghibli films (Spirited Away, Totoro) with associated vehicles, characters, and settings details.',
    sampleResponse: `[
  {
    "id": "2baf0bd3-4276-4fa6-97f5-18b4d02ee548",
    "title": "Castle in the Sky",
    "original_title": "天空の城ラピュタ",
    "director": "Hayao Miyazaki",
    "rt_score": "95"
  }
]`
  },
  // Cryptocurrency
  {
    name: 'CoinGecko',
    description: 'Comprehensive cryptocurrency market data tracking prices and volumes.',
    category: 'Cryptocurrency',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://www.coingecko.com/en/api',
    endpoint: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
    dataType: 'JSON',
    rateLimit: '30 requests/minute (Free Tier)',
    details: 'CoinGecko is the gold standard for global crypto market metrics. Tracks thousands of tokens, exchange volumes, market caps, histories, and contract address details.',
    sampleResponse: `{
  "bitcoin": {
    "usd": 67342.12
  }
}`
  },
  {
    name: 'CoinDesk BPI',
    description: 'Real-time updates of the Bitcoin Price Index.',
    category: 'Cryptocurrency',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://www.coindesk.com/coindesk-api/',
    endpoint: 'https://api.coindesk.com/v1/bpi/currentprice.json',
    dataType: 'JSON',
    rateLimit: 'Free / Fair Use',
    details: 'A simple public stream mapping the Bitcoin Price Index (BPI) in USD, GBP, and EUR. Great for real-time tickers and clean dashboards.',
    sampleResponse: `{
  "time": { "updated": "Jun 21, 2026 12:40:00 UTC" },
  "bpi": {
    "USD": { "code": "USD", "rate": "67,342.12" }
  }
}`
  },
  // Books & Reading
  {
    name: 'Google Books API',
    description: 'Search, browse, and retrieve full metadata for millions of books.',
    category: 'Books',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://developers.google.com/books',
    endpoint: 'https://www.googleapis.com/books/v1/volumes?q=isbn:9780132350884',
    dataType: 'JSON',
    rateLimit: '1,000 queries/day without key',
    details: 'Google Books API allows developers to fetch publication dates, author arrays, page counts, preview links, and text snippet search tools across Google\'s massive digitized catalog.',
    sampleResponse: `{
  "kind": "books#volumes",
  "items": [
    {
      "volumeInfo": {
        "title": "Clean Code",
        "authors": ["Robert C. Martin"],
        "publisher": "Prentice Hall"
      }
    }
  ]
}`
  },
  {
    name: 'Open Library',
    description: 'Open, editable library catalog, building towards a web page for every book.',
    category: 'Books',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://openlibrary.org/dev/docs/api/',
    endpoint: 'https://openlibrary.org/api/books?bibkeys=ISBN:0451526538&format=json&jscmd=data',
    dataType: 'JSON',
    rateLimit: 'No strict limit / Fair Use',
    details: 'Open Library API offers complete structural data on books, authors, publisher histories, covers, and subject categories. Completely free and open source.',
    sampleResponse: `{
  "ISBN:0451526538": {
    "title": "The Adventures of Tom Sawyer",
    "number_of_pages": 240,
    "url": "https://openlibrary.org/books/OL6793156M"
  }
}`
  },
  // Development
  {
    name: 'JSONPlaceholder',
    description: 'Free fake online REST API for testing and prototyping.',
    category: 'Development',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://jsonplaceholder.typicode.com/',
    endpoint: 'https://jsonplaceholder.typicode.com/posts/1',
    dataType: 'JSON',
    rateLimit: 'Unlimited / Free',
    details: 'The ultimate prototyping mock-data API. Supports GET, POST, PUT, DELETE, and PATCH methods with zero setup. Mimics users, comments, albums, and todo lists.',
    sampleResponse: `{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\\nsuscipit recusandae..."
}`
  },
  {
    name: 'IPify',
    description: 'A simple, reliable, and high-performance IP address API.',
    category: 'Development',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://www.ipify.org/',
    endpoint: 'https://api.ipify.org?format=json',
    dataType: 'JSON',
    rateLimit: 'Unlimited / Free',
    details: 'Highly redundant, distributed infrastructure that resolves client IP addresses immediately. Supports IPv4 and IPv6 resolving with simple string formats.',
    sampleResponse: `{
  "ip": "203.0.113.195"
}`
  },
  {
    name: 'Httpbin',
    description: 'A simple HTTP Request & Response Service.',
    category: 'Development',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://httpbin.org/',
    endpoint: 'https://httpbin.org/get',
    dataType: 'JSON',
    rateLimit: 'Free / Sandbox Use',
    details: 'Allows clients to test headings, user agents, cookies, body post values, redirects, and authorization mechanisms. Returns input parameters directly back to the requester.',
    sampleResponse: `{
  "args": {},
  "headers": {
    "Host": "httpbin.org",
    "User-Agent": "Mozilla/5.0..."
  },
  "origin": "203.0.113.195"
}`
  },
  // Environment & Weather
  {
    name: 'Open-Meteo',
    description: 'Free, local-friendly, and non-commercial weather forecast API.',
    category: 'Environment & Weather',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://open-meteo.com/',
    endpoint: 'https://api.open-meteo.com/v1/forecast?latitude=15.14&longitude=120.59&current_weather=true',
    dataType: 'JSON',
    rateLimit: '10,000 queries/day max',
    details: 'Delivers rapid weather forecasts, historical data, and wind/temperature profiles globally. Requires absolutely no token registrations, making it the most developer-friendly weather API.',
    sampleResponse: `{
  "latitude": 15.14,
  "longitude": 120.59,
  "current_weather": {
    "temperature": 29.5,
    "windspeed": 12.3,
    "time": "2026-06-21T20:00"
  }
}`
  },
  {
    name: 'USGS Earthquake API',
    description: 'Real-time seismic data feed provided by the USGS.',
    category: 'Environment & Weather',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://earthquake.usgs.gov/fdsnws/event/1/',
    endpoint: 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2026-06-01',
    dataType: 'GeoJSON',
    rateLimit: 'Free / Federal Open Data',
    details: 'Exposes globally monitored seismic activities. Excellent source for mapping integrations, interactive charts, and planetary telemetry.',
    sampleResponse: `{
  "type": "FeatureCollection",
  "metadata": { "title": "USGS Earthquakes" },
  "features": []
}`
  },
  // Finance
  {
    name: 'ExchangeRate-API',
    description: 'Simple and reliable currency conversion rates for 160+ currencies.',
    category: 'Finance',
    auth: 'API Key',
    https: true,
    cors: 'yes',
    link: 'https://www.exchangerate-api.com/',
    endpoint: 'https://v6.exchangerate-api.com/v6/YOUR-KEY/latest/USD',
    dataType: 'JSON',
    rateLimit: '1,500 requests/month (Free Tier)',
    details: 'Perfect for shopping carts, multi-currency wallets, and conversion apps. Offers up-to-date conversion lists and historical comparisons.',
    sampleResponse: `{
  "result": "success",
  "base_code": "USD",
  "conversion_rates": {
    "EUR": 0.93,
    "JPY": 158.42,
    "PHP": 58.74
  }
}`
  },
  // Games
  {
    name: 'PokéAPI',
    description: 'All the Pokémon data you\'ll ever need in one place.',
    category: 'Games',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://pokeapi.co/',
    endpoint: 'https://pokeapi.co/api/v2/pokemon/ditto',
    dataType: 'JSON',
    rateLimit: '100 requests per IP/minute',
    details: 'PokéAPI parses metadata covering the complete history of Pokémon, moves, types, stats, items, abilities, and evolutions. Perfect for training, tutorials, and frontend portfolios.',
    sampleResponse: `{
  "id": 132,
  "name": "ditto",
  "base_experience": 101,
  "height": 3,
  "weight": 40
}`
  },
  {
    name: 'Open Trivia Database',
    description: 'User-contributed trivia question database for game creation.',
    category: 'Games',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://opentdb.com/',
    endpoint: 'https://opentdb.com/api.php?amount=1&type=multiple',
    dataType: 'JSON',
    rateLimit: '1 request / 2 seconds max',
    details: 'A clean database offering multiple-choice and true/false quiz questions sorted across specific categories like Science, Computers, Geography, History, and Pop Culture.',
    sampleResponse: `{
  "response_code": 0,
  "results": [
    {
      "category": "Science: Computers",
      "type": "multiple",
      "question": "What does CPU stand for?",
      "correct_answer": "Central Processing Unit",
      "incorrect_answers": ["Central Process Unit", "Computer Processing Unit"]
    }
  ]
}`
  },
  // Machine Learning
  {
    name: 'Hugging Face Inference API',
    description: 'Run thousands of open-source models for NLP, Vision, and Audio.',
    category: 'Machine Learning',
    auth: 'API Key',
    https: true,
    cors: 'yes',
    link: 'https://huggingface.co/docs/api-inference/index',
    endpoint: 'https://api-inference.huggingface.co/models/gpt2',
    dataType: 'JSON',
    rateLimit: 'Varies / Generous Free Tier',
    details: 'Deploy pipelines directly from Hugging Face model hub. Translate languages, extract text tables, generate summaries, and classify sentiments dynamically.',
    sampleResponse: `[
  {
    "generated_text": "The Hugging Face models are incredibly powerful..."
  }
]`
  },
  // Music & Video
  {
    name: 'iTunes Search API',
    description: 'Search content in the iTunes Store and Apple Books.',
    category: 'Music & Video',
    auth: 'None',
    https: true,
    cors: 'yes',
    link: 'https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/',
    endpoint: 'https://itunes.apple.com/search?term=jack+johnson',
    dataType: 'JSON',
    rateLimit: '20 calls/minute max',
    details: 'Search content within the iTunes Store, including music, movies, audiobooks, podcasts, and digital books. Returns artwork, store links, preview clips, and genres.',
    sampleResponse: `{
  "resultCount": 1,
  "results": [
    {
      "wrapperType": "track",
      "artistName": "Jack Johnson",
      "trackName": "Upside Down"
    }
  ]
}`
  },
  // Science
  {
    name: 'NASA APOD API',
    description: 'NASA\'s Astronomy Picture of the Day.',
    category: 'Science',
    auth: 'API Key',
    https: true,
    cors: 'yes',
    link: 'https://api.nasa.gov/',
    endpoint: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',
    dataType: 'JSON',
    rateLimit: '50 requests/IP/day (DEMO_KEY)',
    details: 'Retrieves astronomical photography, star mappings, and deep-space telemetry annotated by astrophysics experts. The DEMO_KEY is available instantly out-of-the-box.',
    sampleResponse: `{
  "date": "2026-06-21",
  "explanation": "This cosmic view shows the center of the Milky Way...",
  "hdurl": "https://apod.nasa.gov/apod/image/2606/milkyway_hd.jpg",
  "media_type": "image",
  "title": "Milky Way Hub"
}`
  }
];

const CATEGORIES = [
  'All',
  'Animals',
  'Anime',
  'Cryptocurrency',
  'Books',
  'Development',
  'Environment & Weather',
  'Finance',
  'Games',
  'Machine Learning',
  'Music & Video',
  'Science'
];

export const LibraryApi = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAuth, setSelectedAuth] = useState<'All' | 'None' | 'API Key' | 'OAuth'>('All');
  const [selectedApi, setSelectedApi] = useState<APIEntry | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'js' | 'python' | 'curl'>('js');

  const filteredApis = useMemo(() => {
    return PUBLIC_APIS_DATA.filter((api) => {
      const matchesSearch =
        api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        api.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || api.category === selectedCategory;
      const matchesAuth = selectedAuth === 'All' || api.auth === selectedAuth;

      return matchesSearch && matchesCategory && matchesAuth;
    });
  }, [searchQuery, selectedCategory, selectedAuth]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(type);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const getCodeSnippet = (api: APIEntry, lang: 'js' | 'python' | 'curl') => {
    if (lang === 'js') {
      return `// JavaScript Fetch Example
fetch("${api.endpoint}")
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

url = "${api.endpoint}"
try:
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    print("Success:", data)
except requests.exceptions.RequestException as e:
    print("Error fetching data:", e)`;
    } else {
      return `# cURL Terminal Command
curl -X GET "${api.endpoint}" \\
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
            Browse fully client-side compatible, verified public APIs from the open-source community repository. Use live testing endpoints, review authorization protocols, and generate integration snippets.
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
            <div className="flex flex-col gap-1.5">
              {(['All', 'None', 'API Key', 'OAuth'] as const).map((authType) => (
                <button
                  key={authType}
                  onClick={() => setSelectedAuth(authType)}
                  className={`w-full text-left text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-between ${
                    selectedAuth === authType
                      ? 'bg-[#3C6B4D]/10 text-[#ECEBE9] border border-[#3C6B4D]/30'
                      : 'text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022] border border-transparent'
                  }`}
                >
                  <span>{authType}</span>
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
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => {
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
                    <span className="truncate">{cat}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApis.map((api) => (
                <div
                  key={api.name}
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
                      <Shield size={11} className={api.auth === 'None' ? 'text-[#3C6B4D]' : 'text-[#E29E2D]'} />
                      Auth: {api.auth}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Globe size={11} className="text-sky-500" />
                      HTTPS: {api.https ? 'Yes' : 'No'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Radio size={11} className="text-emerald-500" />
                      CORS: {api.cors}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Side-Drawer / Modal Overlay */}
      {selectedApi && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div
            className="w-full max-w-xl h-full bg-[#18191B] border-l border-[#2A2D30] p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider text-[#3C6B4D] uppercase bg-[#3C6B4D]/10 px-2.5 py-1 rounded-md">
                  {selectedApi.category}
                </span>
                <button
                  onClick={() => setSelectedApi(null)}
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

              {/* Specs Table */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#111213] border border-[#2A2D30] text-xs">
                <div className="space-y-1">
                  <span className="text-[#72706C] block">Authorization</span>
                  <span className="font-mono font-bold text-[#ECEBE9]">{selectedApi.auth}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[#72706C] block">CORS Support</span>
                  <span className="font-mono font-bold text-[#ECEBE9] uppercase">{selectedApi.cors}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[#72706C] block">Format</span>
                  <span className="font-mono font-bold text-[#ECEBE9]">{selectedApi.dataType}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[#72706C] block">Rate Limit</span>
                  <span className="font-mono font-bold text-[#ECEBE9]">{selectedApi.rateLimit || 'N/A'}</span>
                </div>
              </div>

              {/* Endpoint Detail */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-[#72706C] tracking-wider flex items-center gap-1.5">
                  <Globe size={12} />
                  <span>Base GET Request Endpoint</span>
                </h4>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#111213] border border-[#2A2D30] font-mono text-[11px] text-emerald-500 overflow-x-auto scrollbar-none">
                  <span className="text-[#ECEBE9] select-none">GET</span>
                  <span className="truncate">{selectedApi.endpoint}</span>
                </div>
              </div>

              {/* Deep Analysis Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-[#72706C] tracking-wider flex items-center gap-1.5">
                  <Info size={12} />
                  <span>Integration Details & Analysis</span>
                </h4>
                <p className="text-xs text-[#A3A09B] leading-relaxed">
                  {selectedApi.details}
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

              {/* Sample Response */}
              {selectedApi.sampleResponse && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-[#72706C] tracking-wider flex items-center gap-1.5">
                    <FileCode size={12} />
                    <span>Sample JSON Payload</span>
                  </h4>
                  <pre className="p-4 rounded-xl bg-[#111213] border border-[#2A2D30] text-[10px] font-mono text-[#3C6B4D] overflow-x-auto max-h-36 scrollbar-none">
                    <code>{selectedApi.sampleResponse}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Action Buttons */}
            <div className="pt-6 border-t border-[#2A2D30]/60 flex gap-3">
              <a
                href={selectedApi.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 text-xs py-2.5"
              >
                <Bookmark size={14} />
                <span>Visit API Documentation</span>
                <ExternalLink size={12} />
              </a>
              <button
                onClick={() => setSelectedApi(null)}
                className="btn-secondary text-xs px-5"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
