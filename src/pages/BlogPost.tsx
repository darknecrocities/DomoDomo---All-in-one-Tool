import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Clock, BookOpen, Share2, Tag } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogData';
import { AdSenseUnit } from '../components/AdSenseUnit';

export const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
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

  // Simple renderer to convert markdown content to basic HTML nodes safely
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-3" />;

      // Headers
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-2xl md:text-3xl font-extrabold text-[#ECEBE9] mt-6 mb-3 border-b border-[#2A2D30] pb-2">
            {trimmed.slice(2)}
          </h1>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl md:text-2xl font-bold text-[#ECEBE9] mt-6 mb-3">
            {trimmed.slice(3)}
          </h2>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg md:text-xl font-bold text-[#ECEBE9] mt-4 mb-2">
            {trimmed.slice(4)}
          </h3>
        );
      }

      // Lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} className="ml-5 list-disc text-sm text-[#A3A09B] leading-relaxed mb-1">
            {parseInlineMarkup(trimmed.slice(2))}
          </li>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s/, '');
        return (
          <li key={idx} className="ml-5 list-decimal text-sm text-[#A3A09B] leading-relaxed mb-1">
            {parseInlineMarkup(content)}
          </li>
        );
      }

      // Blockquote / Tip / Warning
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-[#3C6B4D] bg-[#18191B] p-4 rounded-r-xl italic text-sm text-[#A3A09B] my-4">
            {parseInlineMarkup(trimmed.slice(2))}
          </blockquote>
        );
      }

      // Horizontal Rule
      if (trimmed === '---' || trimmed === '***') {
        return <hr key={idx} className="border-[#2A2D30] my-6" />;
      }

      // Paragraph
      return (
        <p key={idx} className="text-sm md:text-base text-[#A3A09B] leading-relaxed mb-4">
          {parseInlineMarkup(trimmed)}
        </p>
      );
    });
  };

  // Basic parser to render inline bold, links, and code blocks
  const parseInlineMarkup = (text: string) => {
    // Match bold: **text**
    // Match inline code: `code`
    // Match link: [text](url)
    const tokens: React.ReactNode[] = [];
    let current = text;
    let key = 0;

    while (current) {
      const boldMatch = current.match(/\*\*(.*?)\*\*/);
      const codeMatch = current.match(/`(.*?)`/);
      const linkMatch = current.match(/\[(.*?)\]\((.*?)\)/);

      // Find the first occurring match
      const matches = [
        { type: 'bold', index: boldMatch ? boldMatch.index : -1, length: boldMatch ? boldMatch[0].length : 0, content: boldMatch ? boldMatch[1] : '' },
        { type: 'code', index: codeMatch ? codeMatch.index : -1, length: codeMatch ? codeMatch[0].length : 0, content: codeMatch ? codeMatch[1] : '' },
        { type: 'link', index: linkMatch ? linkMatch.index : -1, length: linkMatch ? linkMatch[0].length : 0, content: linkMatch ? linkMatch[1] : '', url: linkMatch ? linkMatch[2] : '' }
      ].filter(m => m.index !== undefined && m.index >= 0);

      if (matches.length === 0) {
        tokens.push(<span key={key++}>{current}</span>);
        break;
      }

      // Sort by earliest match index
      matches.sort((a, b) => a.index! - b.index!);
      const first = matches[0];

      // Add prefix text
      if (first.index! > 0) {
        tokens.push(<span key={key++}>{current.slice(0, first.index)}</span>);
      }

      // Add matched element
      if (first.type === 'bold') {
        tokens.push(<strong key={key++} className="font-extrabold text-[#ECEBE9]">{first.content}</strong>);
      } else if (first.type === 'code') {
        tokens.push(<code key={key++} className="bg-[#1D2022] border border-[#2A2D30] px-1 py-0.5 rounded text-xs font-mono text-emerald-400">{first.content}</code>);
      } else if (first.type === 'link') {
        const isExternal = first.url!.startsWith('http');
        if (isExternal) {
          tokens.push(
            <a key={key++} href={first.url} target="_blank" rel="noopener noreferrer" className="text-[#4E8E5E] hover:underline font-bold">
              {first.content}
            </a>
          );
        } else {
          tokens.push(
            <Link key={key++} to={first.url!} className="text-[#4E8E5E] hover:underline font-bold">
              {first.content}
            </Link>
          );
        }
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
      alert('📋 Link copied to clipboard!');
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
          className="flex items-center gap-1.5 text-xs font-bold text-[#A3A09B] hover:text-[#ECEBE9] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Guides
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18191B] border border-[#2A2D30] hover:border-[#3C6B4D]/35 hover:bg-[#3C6B4D]/10 text-xs font-bold text-[#ECEBE9] transition-all"
        >
          <Share2 size={13} /> Share Guide
        </button>
      </div>

      {/* Main post layout */}
      <article className="glass-card p-6 md:p-10 flex flex-col gap-6 bg-[#18191B] border-[#2A2D30]">
        {/* Info header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#3C6B4D]/10 border border-[#3C6B4D]/35 text-[#4E8E5E]">
              {post.category}
            </span>
            <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-[#3C6B4D]/10 border border-[#3C6B4D]/25 text-[#4E8E5E] uppercase tracking-wide">
              By {post.author || "Arron Parejas"}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-[#ECEBE9] tracking-tight leading-tight mt-1">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#72706C] mt-2 border-b border-[#2A2D30] pb-4">
            <span className="flex items-center gap-1">
              <Calendar size={13} /> {post.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={13} /> {post.readTime}
            </span>
          </div>
        </div>

        {/* Content body */}
        <div className="markdown-content">
          {renderMarkdown(post.content)}
        </div>

        {/* Bottom tags */}
        <div className="border-t border-[#2A2D30] pt-6 flex flex-wrap gap-2 items-center">
          <Tag size={13} className="text-[#72706C]" />
          {post.keywords.split(',').map((kw, i) => (
            <span key={i} className="text-[10px] font-bold text-[#A3A09B] bg-[#1C2022] border border-[#2A2D30] px-2 py-0.5 rounded-md">
              {kw.trim()}
            </span>
          ))}
        </div>
      </article>

      {/* BlogPost Mid-Page Ad */}
      <AdSenseUnit />

      {/* Internal link CTA Banner */}
      <div className="rounded-2xl border border-[#3C6B4D]/35 bg-[#3C6B4D]/5 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="text-left space-y-1">
          <h4 className="text-sm font-bold text-[#ECEBE9]">Run Utility Tools Directly Offline</h4>
          <p className="text-xs text-[#A3A09B]">
            All DomoDomo files and operations execute 100% in your browser sandbox under zero-server encryption.
          </p>
        </div>
        <Link
          to="/"
          className="btn-primary py-2 px-4 text-xs font-black shrink-0 flex items-center gap-1.5"
        >
          <BookOpen size={13} /> Explore 110+ Tools
        </Link>
      </div>
    </div>
  );
};
