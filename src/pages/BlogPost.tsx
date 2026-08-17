import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Clock, BookOpen, Share2, Tag, ChevronRight, UserCheck, Sparkles, Check } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogData';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { useState } from 'react';

export const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="glass-card p-12 text-center flex flex-col items-center gap-4 max-w-md mx-auto my-12 border-[#2A2D30] bg-[#18191B]">
        <h2 className="text-xl font-bold text-rose-450">Guide Not Found</h2>
        <p className="text-[#A3A09B] text-sm">
          The requested guide article does not exist or has been relocated.
        </p>
        <button onClick={() => navigate('/blog')} className="btn-primary mt-4">
          <ArrowLeft size={16} />
          <span>Back to Guides</span>
        </button>
      </div>
    );
  }

  const postUrl = `https://domodomo.site/blog/${post.slug}`;
  const seoTitle = `${post.title} | DomoDomo Technical Guides`;
  const seoDesc = post.excerpt;

  // Other related posts
  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  // Simple renderer to convert markdown content to basic HTML nodes safely
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-3" />;

      // Headers
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-2xl md:text-3xl font-extrabold text-[#ECEBE9] mt-8 mb-4 border-b border-[#2A2D30] pb-3 leading-snug">
            {trimmed.slice(2)}
          </h1>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl md:text-2xl font-bold text-[#ECEBE9] mt-7 mb-3 leading-snug">
            {trimmed.slice(3)}
          </h2>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg md:text-xl font-bold text-[#ECEBE9] mt-5 mb-2 leading-snug">
            {trimmed.slice(4)}
          </h3>
        );
      }

      // Lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} className="ml-6 list-disc text-sm md:text-base text-[#C5C3C0] leading-relaxed mb-2">
            {parseInlineMarkup(trimmed.slice(2))}
          </li>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s/, '');
        return (
          <li key={idx} className="ml-6 list-decimal text-sm md:text-base text-[#C5C3C0] leading-relaxed mb-2">
            {parseInlineMarkup(content)}
          </li>
        );
      }

      // Blockquote / Tip / Warning
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-[#52565A] bg-[#111213] p-4 rounded-r-2xl italic text-sm text-[#A3A09B] my-5 shadow-inner">
            {parseInlineMarkup(trimmed.slice(2))}
          </blockquote>
        );
      }

      // Horizontal Rule
      if (trimmed === '---' || trimmed === '***') {
        return <hr key={idx} className="border-[#2A2D30] my-8" />;
      }

      // Paragraph
      return (
        <p key={idx} className="text-sm md:text-base text-[#C5C3C0] leading-relaxed mb-5">
          {parseInlineMarkup(trimmed)}
        </p>
      );
    });
  };

  // Parser to render inline bold, links, italic, and code blocks with recursive nesting
  const parseInlineMarkup = (text: string): React.ReactNode[] => {
    const tokens: React.ReactNode[] = [];
    let current = text;
    let key = 0;

    while (current) {
      // Prioritize link detection [text](url), bold **text**, and code `text`
      const linkMatch = current.match(/\[(.*?)\]\((.*?)\)/);
      const boldMatch = current.match(/\*\*(.*?)\*\*/);
      const codeMatch = current.match(/`(.*?)`/);

      const matches = [
        { type: 'link', index: linkMatch ? linkMatch.index : -1, length: linkMatch ? linkMatch[0].length : 0, content: linkMatch ? linkMatch[1] : '', url: linkMatch ? linkMatch[2] : '' },
        { type: 'bold', index: boldMatch ? boldMatch.index : -1, length: boldMatch ? boldMatch[0].length : 0, content: boldMatch ? boldMatch[1] : '' },
        { type: 'code', index: codeMatch ? codeMatch.index : -1, length: codeMatch ? codeMatch[0].length : 0, content: codeMatch ? codeMatch[1] : '' }
      ].filter(m => m.index !== undefined && m.index >= 0);

      if (matches.length === 0) {
        tokens.push(<span key={key++}>{current}</span>);
        break;
      }

      matches.sort((a, b) => a.index! - b.index!);
      const first = matches[0];

      if (first.index! > 0) {
        tokens.push(<span key={key++}>{current.slice(0, first.index)}</span>);
      }

      if (first.type === 'link') {
        const isExternal = first.url!.startsWith('http');
        if (isExternal) {
          tokens.push(
            <a
              key={key++}
              href={first.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6EC48E] hover:text-[#ECEBE9] underline font-bold transition-colors cursor-pointer"
            >
              {first.content}
            </a>
          );
        } else {
          tokens.push(
            <Link
              key={key++}
              to={first.url!}
              className="text-[#6EC48E] hover:text-[#ECEBE9] underline font-bold transition-colors cursor-pointer"
            >
              {first.content}
            </Link>
          );
        }
      } else if (first.type === 'bold') {
        tokens.push(
          <strong key={key++} className="font-extrabold text-[#ECEBE9]">
            {parseInlineMarkup(first.content)}
          </strong>
        );
      } else if (first.type === 'code') {
        tokens.push(
          <code key={key++} className="bg-[#1D2022] border border-[#2A2D30] px-1.5 py-0.5 rounded text-xs font-mono text-[#ECEBE9]">
            {first.content}
          </code>
        );
      }

      current = current.slice(first.index! + first.length!);
    }

    return tokens;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto text-left">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta name="keywords" content={post.keywords} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={postUrl} />
        <meta property="og:site_name" content="DomoDomo" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content="https://domodomo.site/favicon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content="https://domodomo.site/favicon.png" />
        <link rel="canonical" href={postUrl} />
      </Helmet>

      {/* Nav Back Header */}
      <div className="flex items-center justify-between border-b border-[#2A2D30] pb-4">
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-xs font-bold text-[#A3A09B] hover:text-[#ECEBE9] transition-colors"
        >
          <ArrowLeft size={15} /> Back to Guides &amp; Blog
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#18191B] border border-[#2A2D30] hover:border-[#52565A] hover:bg-[#222426] text-xs font-bold text-[#ECEBE9] transition-all shadow-sm"
        >
          {copied ? (
            <>
              <Check size={14} className="text-[#ECEBE9]" />
              <span className="text-[#ECEBE9]">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 size={14} />
              <span>Share Guide</span>
            </>
          )}
        </button>
      </div>

      {/* Main post layout */}
      <article className="rounded-3xl p-6 md:p-10 flex flex-col gap-6 bg-[#18191B] border border-[#2A2D30] shadow-xl relative overflow-hidden">
        {/* Info header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#222426] border border-[#3C3F44] text-[#ECEBE9]">
              {post.category}
            </span>
            <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-md bg-[#222426] border border-[#3C3F44] text-[#A3A09B] uppercase tracking-wide flex items-center gap-1">
              <UserCheck size={12} />
              By {post.author || "Arron Parejas"}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-[#ECEBE9] tracking-tight leading-snug mt-1">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#72706C] mt-2 border-b border-[#2A2D30] pb-4">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> {post.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> {post.readTime}
            </span>
          </div>
        </div>

        {/* Content body */}
        <div className="markdown-content pt-2">
          {renderMarkdown(post.content)}
        </div>

        {/* Author Bio Box */}
        <div className="mt-6 p-5 rounded-2xl bg-[#111213] border border-[#2A2D30] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2A2D30] to-[#18191B] border border-[#3C3F44] flex items-center justify-center text-white font-black text-xs shadow-inner">
              AP
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-bold text-[#ECEBE9]">{post.author || "Arron Parejas"}</span>
              <span className="text-[10px] text-[#72706C]">Maker &amp; Lead Engineer @ DomoDomo</span>
            </div>
          </div>
          <span className="text-[10px] text-[#ECEBE9] bg-[#222426] border border-[#3C3F44] px-2.5 py-1 rounded-full font-bold">
            Verified Author
          </span>
        </div>

        {/* Bottom tags */}
        <div className="border-t border-[#2A2D30] pt-6 flex flex-wrap gap-2 items-center">
          <Tag size={13} className="text-[#72706C]" />
          {post.keywords.split(',').map((kw, i) => (
            <span key={i} className="text-[10px] font-bold text-[#A3A09B] bg-[#111213] border border-[#2A2D30] px-2.5 py-1 rounded-lg">
              {kw.trim()}
            </span>
          ))}
        </div>
      </article>

      {/* BlogPost Mid-Page Ad */}
      <AdSenseUnit />

      {/* Related Guides Section */}
      {relatedPosts.length > 0 && (
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-[#ECEBE9] flex items-center gap-2">
              <Sparkles size={16} className="text-[#A3A09B]" />
              <span>More Technical Guides &amp; Updates</span>
            </h3>
            <Link to="/blog" className="text-xs font-bold text-[#ECEBE9] hover:underline">
              View All Guides →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedPosts.map((rPost) => (
              <Link
                key={rPost.slug}
                to={`/blog/${rPost.slug}`}
                className="group flex flex-col justify-between p-5 rounded-2xl bg-[#18191B] border border-[#2A2D30] hover:border-[#52565A] transition-all duration-300 shadow-md"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#A3A09B]">
                    {rPost.category}
                  </span>
                  <h4 className="text-sm font-bold text-[#ECEBE9] group-hover:text-white transition-colors leading-snug line-clamp-2">
                    {rPost.title}
                  </h4>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#72706C] mt-4 pt-3 border-t border-[#2A2D30]">
                  <span>{rPost.readTime}</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-[#A3A09B] group-hover:text-white" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Internal link CTA Banner */}
      <div className="rounded-3xl border border-[#2A2D30] bg-[#18191B] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
        <div className="text-left space-y-1">
          <h4 className="text-base font-bold text-[#ECEBE9]">Run Utility Tools Directly Offline</h4>
          <p className="text-xs text-[#A3A09B] max-w-xl">
            All DomoDomo files and operations execute 100% in your browser sandbox under local WebAssembly &amp; zero server tracking.
          </p>
        </div>
        <Link
          to="/"
          className="btn-primary py-2.5 px-5 text-xs font-black shrink-0 flex items-center gap-2 shadow-md"
        >
          <BookOpen size={14} /> Explore 110+ Tools
        </Link>
      </div>
    </div>
  );
};
