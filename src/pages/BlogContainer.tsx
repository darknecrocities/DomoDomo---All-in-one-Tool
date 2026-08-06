import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, BookOpen, ChevronRight, Search, ExternalLink, Trophy, Award, Crown, Cpu, Sparkles, User, Tag } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogData';
import { useState } from 'react';
import { AdSenseUnit } from '../components/AdSenseUnit';
import betterGovLogo from '../assets/bettergovph.jpg';
import upamateLogo from '../assets/upamate.png';
import stageByAntLogo from '../assets/stagebyant.png';

export const BlogContainer = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(BLOG_POSTS.map((post) => post.category)))];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      post.keywords.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = BLOG_POSTS[0];

  const seoTitle = 'DomoDomo Product Updates, Release Changelogs & Guides';
  const seoDesc = 'Discover the latest releases, offline developer tutorials, and utility guides to optimize your sandboxed offline workflows inside DomoDomo.';

  return (
    <div className="flex flex-col gap-8 text-left">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:url" content="https://domodomo.site/blog" />
        <meta property="og:image" content="https://domodomo.site/favicon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content="https://domodomo.site/favicon.png" />
        <link rel="canonical" href="https://domodomo.site/blog" />
      </Helmet>

      {/* Hero Welcome banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-10 relative overflow-hidden shadow-xl">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2d30_1px,transparent_1px),linear-gradient(to_bottom,#2a2d30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.15] pointer-events-none" />

        {/* Hero Left Column: Intro Text */}
        <div className="lg:col-span-6 flex flex-col gap-4 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#222426] border border-[#3C3F44] text-[#ECEBE9] flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#A3A09B]" />
              Official Knowledge Hub
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#ECEBE9] font-heading leading-tight tracking-tight">
            Updates, News &amp; Guides
          </h1>
          <p className="text-[#A3A09B] text-sm md:text-base leading-relaxed max-w-xl">
            Explore feature releases, offline workflow tutorials, and developer changelogs to get the absolute most out of your sandboxed DomoDomo workspace.
          </p>
        </div>

        {/* Hero Right Column: Compact Badge Grid (UNSTACKED) */}
        <div className="lg:col-span-6 w-full z-10 flex flex-col gap-3">
          {/* Section Subheading */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#72706C]">
              Platform Rankings &amp; Press Features
            </span>
          </div>

          {/* 2x2 Grid for Product Rank Badges */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* #1 All Time Overall Badge */}
            <div
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/40 text-[#d4af37] shadow-sm hover:border-[#d4af37]/70 transition-colors"
              title="#1 All Time Overall Platform"
            >
              <Crown size={18} className="text-[#d4af37] shrink-0" />
              <div className="flex flex-col text-left leading-tight min-w-0">
                <span className="text-[8px] font-bold uppercase tracking-widest text-[#d4af37]/80 truncate">Rank Badge</span>
                <span className="text-xs font-extrabold text-[#d4af37] truncate">#1 All Time</span>
              </div>
            </div>

            {/* #1 in AI Category Badge */}
            <div
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#222426] border border-[#3C3F44] text-[#A3A09B] shadow-sm hover:border-[#52565A] transition-colors"
              title="#1 Product in AI & Local LLM Category"
            >
              <Cpu size={18} className="text-[#ECEBE9] shrink-0" />
              <div className="flex flex-col text-left leading-tight min-w-0">
                <span className="text-[8px] font-bold uppercase tracking-widest text-[#72706C] truncate">Rank Badge</span>
                <span className="text-xs font-extrabold text-[#ECEBE9] truncate">#1 in AI</span>
              </div>
            </div>

            {/* #1 in Productivity Badge */}
            <div
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#222426] border border-[#3C3F44] text-[#A3A09B] shadow-sm hover:border-[#52565A] transition-colors"
              title="#1 Product in Productivity Category"
            >
              <Trophy size={18} className="text-[#ECEBE9] shrink-0" />
              <div className="flex flex-col text-left leading-tight min-w-0">
                <span className="text-[8px] font-bold uppercase tracking-widest text-[#72706C] truncate">Rank Badge</span>
                <span className="text-xs font-extrabold text-[#ECEBE9] truncate">#1 Productivity</span>
              </div>
            </div>

            {/* #1 in Developer Tools Badge */}
            <div
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#222426] border border-[#3C3F44] text-[#A3A09B] shadow-sm hover:border-[#52565A] transition-colors"
              title="#1 Product in Developer Tools Category"
            >
              <Award size={18} className="text-[#ECEBE9] shrink-0" />
              <div className="flex flex-col text-left leading-tight min-w-0">
                <span className="text-[8px] font-bold uppercase tracking-widest text-[#72706C] truncate">Rank Badge</span>
                <span className="text-xs font-extrabold text-[#ECEBE9] truncate">#1 Dev Tools</span>
              </div>
            </div>
          </div>

          {/* 4-Column Horizontal Row for As Featured On Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-0.5">
            <a
              href="https://web.facebook.com/share/p/17HgfjZoPk/"
              target="_blank"
              rel="noopener noreferrer"
              className="group/bgov flex items-center justify-between p-2.5 rounded-xl bg-[#111213] border border-[#2A2D30] hover:border-[#52565A] transition-all duration-300 shadow-sm"
              title="Featured on BetterGov.ph"
            >
              <div className="flex items-center gap-2 min-w-0">
                <img src={betterGovLogo} alt="BetterGov.ph" className="w-6 h-6 object-contain rounded shrink-0" />
                <span className="text-[11px] font-bold text-[#ECEBE9] group-hover/bgov:text-white transition-colors truncate">BetterGov</span>
              </div>
              <ExternalLink size={12} className="text-[#72706C] group-hover/bgov:text-[#ECEBE9] shrink-0 ml-1" />
            </a>

            <a
              href="https://www.facebook.com/share/p/1G5PGJFuYE/"
              target="_blank"
              rel="noopener noreferrer"
              className="group/upamate flex items-center justify-between p-2.5 rounded-xl bg-[#111213] border border-[#2A2D30] hover:border-[#52565A] transition-all duration-300 shadow-sm"
              title="Featured on Upamate"
            >
              <div className="flex items-center gap-2 min-w-0">
                <img src={upamateLogo} alt="Upamate" className="w-6 h-6 object-contain rounded shrink-0" />
                <span className="text-[11px] font-bold text-[#ECEBE9] group-hover/upamate:text-white transition-colors truncate">Upamate</span>
              </div>
              <ExternalLink size={12} className="text-[#72706C] group-hover/upamate:text-[#ECEBE9] shrink-0 ml-1" />
            </a>

            <a
              href="https://stage.byant.dev/p/domodomo"
              target="_blank"
              rel="noopener noreferrer"
              className="group/stagebyant flex items-center justify-between p-2.5 rounded-xl bg-[#111213] border border-[#2A2D30] hover:border-[#52565A] transition-all duration-300 shadow-sm"
              title="Featured Pick on Stage by Ant"
            >
              <div className="flex items-center gap-2 min-w-0">
                <img src={stageByAntLogo} alt="Stage by Ant" className="w-6 h-6 object-contain rounded shrink-0" />
                <span className="text-[11px] font-bold text-[#ECEBE9] group-hover/stagebyant:text-white transition-colors truncate">Stage by Ant</span>
              </div>
              <ExternalLink size={12} className="text-[#72706C] group-hover/stagebyant:text-[#ECEBE9] shrink-0 ml-1" />
            </a>

            <a
              href="https://www.appbuildersph.com/blog/daily-top-apps-2026-08-06"
              target="_blank"
              rel="noopener noreferrer"
              className="group/appbuildersph flex items-center justify-between p-2.5 rounded-xl bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/50 transition-all duration-300 shadow-sm"
              title="Featured on AppBuildersPH Daily Top Apps"
            >
              <div className="flex items-center gap-2 min-w-0">
                <img src="/appbuildersph_logo.png" alt="AppBuildersPH" className="w-6 h-6 object-contain rounded shrink-0" />
                <span className="text-[11px] font-bold text-[#ECEBE9] group-hover/appbuildersph:text-white transition-colors truncate">AppBuildersPH</span>
              </div>
              <ExternalLink size={12} className="text-[#72706C] group-hover/appbuildersph:text-[#ECEBE9] shrink-0 ml-1" />
            </a>
          </div>
        </div>
      </div>

      {/* Spotlight Featured Article Banner */}
      {featuredPost && selectedCategory === 'All' && !search && (
        <div className="relative overflow-hidden rounded-3xl bg-[#18191B] border border-[#2A2D30] p-6 md:p-8 shadow-xl group/spotlight">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 z-10 relative">
            <div className="flex flex-col gap-3 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#2A2D30] text-[#ECEBE9] border border-[#3C3F44] text-[10px] font-black uppercase tracking-wider">
                  Featured Announcement
                </span>
                <span className="text-[11px] font-bold text-[#A3A09B]">
                  {featuredPost.category}
                </span>
              </div>
              <Link to={`/blog/${featuredPost.slug}`}>
                <h2 className="text-xl md:text-3xl font-black text-[#ECEBE9] group-hover/spotlight:text-white transition-colors leading-tight">
                  {featuredPost.title}
                </h2>
              </Link>
              <p className="text-xs md:text-sm text-[#A3A09B] leading-relaxed line-clamp-2">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-4 text-[11px] font-bold text-[#72706C] pt-1">
                <span className="flex items-center gap-1">
                  <User size={12} className="text-[#A3A09B]" />
                  {featuredPost.author || "Arron Parejas"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {featuredPost.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {featuredPost.readTime}
                </span>
              </div>
            </div>

            <Link
              to={`/blog/${featuredPost.slug}`}
              className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2A2D30] hover:bg-[#3C3F44] border border-[#3C3F44] text-[#ECEBE9] text-xs font-black transition-all shadow-md group-hover/spotlight:scale-105"
            >
              <span>Read Spotlight Article</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72706C]" />
          <input
            type="text"
            placeholder="Search guides, keywords, or features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#18191B] border border-[#2A2D30] focus:border-[#52565A] text-xs text-[#ECEBE9] focus:outline-none focus:ring-1 focus:ring-[#52565A]/40 transition-all font-semibold"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {categories.map((cat) => {
            const count = cat === 'All' ? BLOG_POSTS.length : BLOG_POSTS.filter(p => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-[#2A2D30] border-[#52565A] text-[#ECEBE9]'
                    : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] hover:border-[#3C3F44]'
                }`}
              >
                <span>{cat}</span>
                <span className="text-[10px] font-mono opacity-70 px-1 py-0.2 rounded bg-black/20">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guides Grid List */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col justify-between rounded-2xl bg-[#18191B] border border-[#2A2D30] hover:border-[#52565A] p-6 transition-all duration-300 shadow-md relative overflow-hidden"
            >
              <div className="flex flex-col gap-3 text-left">
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A09B] flex items-center gap-1">
                    <Tag size={10} />
                    {post.category}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#222426] border border-[#3C3F44] text-[#A3A09B] uppercase tracking-wide">
                    By {post.author || "Arron Parejas"}
                  </span>
                </div>
                <Link to={`/blog/${post.slug}`} className="hover:underline">
                  <h2 className="text-lg font-extrabold text-[#ECEBE9] leading-snug group-hover:text-white transition-colors">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-[#A3A09B] text-xs leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center gap-4 text-[10px] font-bold text-[#72706C] border-t border-[#2A2D30] pt-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {post.readTime}
                  </span>
                </div>
                <Link
                  to={`/blog/${post.slug}`}
                  className="flex items-center justify-between text-xs font-bold text-[#ECEBE9] group-hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <BookOpen size={13} /> Read Guide
                  </span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-[#A3A09B] group-hover:text-white" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center flex flex-col items-center gap-3">
          <p className="text-[#A3A09B] text-sm">No articles match your search or filter options.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
            className="btn-secondary text-xs"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Blog Directory Footer Ad */}
      <AdSenseUnit />
    </div>
  );
};
