import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, BookOpen, ChevronRight, Search } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogData';
import { useState } from 'react';

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

  const seoTitle = 'DomoDomo SEO Content Hub & Guides | 110+ Local Tools';
  const seoDesc = 'Read our technical guides on file security, image background removal, PDF compression, and local offline AI setups. DomoDomo guides hub.';

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl bg-[#18191B] border border-[#2A2D30] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2d30_1px,transparent_1px),linear-gradient(to_bottom,#2a2d30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.15] pointer-events-none" />

        <div className="lg:col-span-7 flex flex-col gap-4 z-10">
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#3C6B4D]/10 border border-[#3C6B4D]/35 text-[#3C6B4D]">
              Knowledge Hub
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#ECEBE9] font-heading leading-tight tracking-tight">
            SEO &amp; Tech Guides
          </h1>
          <p className="text-[#A3A09B] text-sm md:text-base leading-relaxed max-w-2xl">
            Explore comprehensive guides on image editing, PDF optimization, coding workflows, and setting up secure local AI models without uploading data.
          </p>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72706C]" />
          <input
            type="text"
            placeholder="Search guides or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#18191B] border border-[#2A2D30] focus:border-[#3C6B4D]/50 text-xs text-[#ECEBE9] focus:outline-none focus:ring-1 focus:ring-[#3C6B4D]/30 transition-all font-semibold"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedCategory === cat
                  ? 'bg-[#3C6B4D]/15 border-[#3C6B4D]/40 text-[#4E8E5E]'
                  : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] hover:border-[#3C6B4D]/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Guides Grid List */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col justify-between rounded-2xl bg-[#18191B] border border-[#2A2D30] hover:border-[#3C6B4D]/30 p-6 transition-all duration-300 shadow-sm relative overflow-hidden"
            >
              <div className="flex flex-col gap-3 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4E8E5E]">
                  {post.category}
                </span>
                <Link to={`/blog/${post.slug}`} className="hover:underline">
                  <h2 className="text-lg font-extrabold text-[#ECEBE9] leading-snug group-hover:text-[#4E8E5E] transition-colors">
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
                  className="flex items-center justify-between text-xs font-bold text-[#4E8E5E] group-hover:text-[#3C6B4D] transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <BookOpen size={13} /> Read Full Guide
                  </span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
    </div>
  );
};
