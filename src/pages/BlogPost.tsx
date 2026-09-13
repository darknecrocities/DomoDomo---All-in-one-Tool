import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Clock, BookOpen, Share2, Tag, ChevronRight, UserCheck, Sparkles, Check, Copy } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogData';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { useState } from 'react';

// Interactive Code Block with Language Badge & Copy Button
const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-2xl border border-[#2A2D30] bg-[#111213] overflow-hidden shadow-xl text-left">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#18191B] border-b border-[#2A2D30] select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/60 inline-block" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {language || 'code'}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-[#A3A09B] hover:text-[#ECEBE9] bg-[#111213] hover:bg-[#1E2022] border border-[#2A2D30] hover:border-[#3C6B4D]/50 transition-all cursor-pointer"
          title="Copy code snippet"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono text-[#ECEBE9] leading-relaxed select-text bg-[#111213]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Responsive Glassmorphic Markdown Table
const MarkdownTable = ({
  headers,
  alignments,
  rows,
  parseInline,
}: {
  headers: string[];
  alignments: ('left' | 'center' | 'right')[];
  rows: string[][];
  parseInline: (text: string) => React.ReactNode[];
}) => {
  return (
    <div className="my-6 overflow-x-auto rounded-2xl border border-[#2A2D30] bg-[#18191B] shadow-xl text-left">
      <table className="w-full text-left border-collapse min-w-[500px]">
        <thead>
          <tr className="border-b border-[#2A2D30] bg-[#141517]">
            {headers.map((h, i) => (
              <th
                key={i}
                className={`px-4 sm:px-5 py-3.5 text-xs font-extrabold text-[#ECEBE9] uppercase tracking-wider font-mono ${
                  alignments[i] === 'center'
                    ? 'text-center'
                    : alignments[i] === 'right'
                    ? 'text-right'
                    : 'text-left'
                }`}
              >
                {parseInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2A2D30]/50">
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="hover:bg-[#1E2022]/60 transition-colors odd:bg-transparent even:bg-[#111213]/40"
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className={`px-4 sm:px-5 py-3 text-xs sm:text-sm text-[#C5C3C0] align-top leading-relaxed ${
                    alignments[cellIdx] === 'center'
                      ? 'text-center'
                      : alignments[cellIdx] === 'right'
                      ? 'text-right'
                      : 'text-left'
                  }`}
                >
                  {parseInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Parser to render inline bold, links, italic, strikethrough, and code with recursive nesting
const parseInlineMarkup = (text: string): React.ReactNode[] => {
  const tokens: React.ReactNode[] = [];
  let current = text;
  let key = 0;

  while (current) {
    // 1. Link: [text](url)
    const linkMatch = current.match(/\[(.*?)\]\((.*?)\)/);
    // 2. Bold: **text**
    const boldMatch = current.match(/\*\*(.*?)\*\*/);
    // 3. Italic: *text* (excluding **) or _text_
    const italicMatch = current.match(/(?<!\*)\*([^*]+)\*(?!\*)/) || current.match(/(?<!_)_([^_]+)_(?!_)/);
    // 4. Code: `text`
    const codeMatch = current.match(/`([^`]+)`/);
    // 5. Strikethrough: ~~text~~
    const strikeMatch = current.match(/~~(.*?)~~/);

    const candidates = [
      linkMatch && linkMatch.index !== undefined ? { type: 'link', index: linkMatch.index, length: linkMatch[0].length, content: linkMatch[1], url: linkMatch[2] } : null,
      boldMatch && boldMatch.index !== undefined ? { type: 'bold', index: boldMatch.index, length: boldMatch[0].length, content: boldMatch[1] } : null,
      italicMatch && italicMatch.index !== undefined ? { type: 'italic', index: italicMatch.index, length: italicMatch[0].length, content: italicMatch[1] } : null,
      codeMatch && codeMatch.index !== undefined ? { type: 'code', index: codeMatch.index, length: codeMatch[0].length, content: codeMatch[1] } : null,
      strikeMatch && strikeMatch.index !== undefined ? { type: 'strike', index: strikeMatch.index, length: strikeMatch[0].length, content: strikeMatch[1] } : null,
    ].filter((c): c is NonNullable<typeof c> => c !== null);

    if (candidates.length === 0) {
      tokens.push(<span key={key++}>{current}</span>);
      break;
    }

    candidates.sort((a, b) => a.index - b.index);
    const first = candidates[0];

    if (first.index > 0) {
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
            className="text-[#6EC48E] hover:text-[#ECEBE9] underline font-bold transition-colors cursor-pointer inline-flex items-center gap-0.5"
          >
            {parseInlineMarkup(first.content)}
          </a>
        );
      } else {
        tokens.push(
          <Link
            key={key++}
            to={first.url!}
            className="text-[#6EC48E] hover:text-[#ECEBE9] underline font-bold transition-colors cursor-pointer"
          >
            {parseInlineMarkup(first.content)}
          </Link>
        );
      }
    } else if (first.type === 'bold') {
      tokens.push(
        <strong key={key++} className="font-extrabold text-[#ECEBE9]">
          {parseInlineMarkup(first.content)}
        </strong>
      );
    } else if (first.type === 'italic') {
      tokens.push(
        <em key={key++} className="italic text-[#ECEBE9]/90">
          {parseInlineMarkup(first.content)}
        </em>
      );
    } else if (first.type === 'code') {
      tokens.push(
        <code key={key++} className="bg-[#111213] border border-[#2A2D30] px-1.5 py-0.5 rounded text-xs font-mono text-emerald-400 font-semibold">
          {first.content}
        </code>
      );
    } else if (first.type === 'strike') {
      tokens.push(
        <del key={key++} className="line-through text-[#72706C]">
          {parseInlineMarkup(first.content)}
        </del>
      );
    }

    current = current.slice(first.index + first.length);
  }

  return tokens;
};

// Comprehensive block-level renderer for markdown articles
const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Code Block: ```lang ... ```
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith('```')) {
        i++; // skip closing ```
      }
      blocks.push(
        <CodeBlock
          key={blockKey++}
          language={lang || 'text'}
          code={codeLines.join('\n')}
        />
      );
      continue;
    }

    // Table: lines starting and ending with |
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (i + 1 < lines.length && /^\|\s*[:?-]+/.test(lines[i + 1].trim())) {
        const tableLines: string[] = [];
        while (
          i < lines.length &&
          lines[i].trim().startsWith('|') &&
          lines[i].trim().endsWith('|')
        ) {
          tableLines.push(lines[i].trim());
          i++;
        }
        const headers = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((s) => s.trim());
        const alignLine = tableLines[1]
          .split('|')
          .slice(1, -1)
          .map((s) => s.trim());
        const alignments = alignLine.map((s) => {
          if (s.startsWith(':') && s.endsWith(':')) return 'center' as const;
          if (s.endsWith(':')) return 'right' as const;
          return 'left' as const;
        });
        const rows = tableLines.slice(2).map((line) =>
          line
            .split('|')
            .slice(1, -1)
            .map((s) => s.trim())
        );
        blocks.push(
          <MarkdownTable
            key={blockKey++}
            headers={headers}
            alignments={alignments}
            rows={rows}
            parseInline={parseInlineMarkup}
          />
        );
        continue;
      }
    }

    // Headers
    if (trimmed.startsWith('##### ')) {
      blocks.push(
        <h5
          key={blockKey++}
          className="text-sm font-extrabold text-[#ECEBE9] uppercase tracking-wider mt-5 mb-2 text-left"
        >
          {parseInlineMarkup(trimmed.slice(6))}
        </h5>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      blocks.push(
        <h4
          key={blockKey++}
          className="text-base font-bold text-[#ECEBE9] mt-6 mb-2 text-left"
        >
          {parseInlineMarkup(trimmed.slice(5))}
        </h4>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h3
          key={blockKey++}
          className="text-lg md:text-xl font-bold text-[#ECEBE9] mt-6 mb-2.5 leading-snug text-left"
        >
          {parseInlineMarkup(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h2
          key={blockKey++}
          className="text-xl md:text-2xl font-bold text-[#ECEBE9] mt-8 mb-3.5 border-b border-[#2A2D30]/60 pb-2 leading-snug text-left"
        >
          {parseInlineMarkup(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      blocks.push(
        <h1
          key={blockKey++}
          className="text-2xl md:text-3xl font-extrabold text-[#ECEBE9] mt-8 mb-4 border-b border-[#2A2D30] pb-3 leading-snug text-left"
        >
          {parseInlineMarkup(trimmed.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      blocks.push(<hr key={blockKey++} className="border-[#2A2D30] my-8" />);
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        bqLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote
          key={blockKey++}
          className="border-l-4 border-emerald-500/70 bg-[#111213] p-4 rounded-r-2xl italic text-sm text-[#A3A09B] my-5 shadow-inner text-left"
        >
          {parseInlineMarkup(bqLines.join(' '))}
        </blockquote>
      );
      continue;
    }

    // Unordered List (- or *)
    if (/^\s*[-*]\s/.test(rawLine)) {
      const listItems: { text: string; indent: number }[] = [];
      while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) {
        const l = lines[i];
        const indentMatch = l.match(/^(\s*)/);
        const indentSpaces = indentMatch ? indentMatch[1].length : 0;
        const indent = Math.min(Math.floor(indentSpaces / 2), 3);
        const itemText = l.trim().replace(/^[-*]\s+/, '');
        listItems.push({ text: itemText, indent });
        i++;
      }
      blocks.push(
        <ul key={blockKey++} className="my-3 space-y-1.5 text-left">
          {listItems.map((item, itemIdx) => (
            <li
              key={itemIdx}
              className={`text-sm md:text-base text-[#C5C3C0] leading-relaxed list-disc ${
                item.indent > 0 ? 'ml-10 text-[#A3A09B]' : 'ml-6'
              }`}
            >
              {parseInlineMarkup(item.text)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered List (1., 2., etc.)
    if (/^\s*\d+\.\s/.test(rawLine)) {
      const listItems: { text: string; indent: number }[] = [];
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
        const l = lines[i];
        const indentMatch = l.match(/^(\s*)/);
        const indentSpaces = indentMatch ? indentMatch[1].length : 0;
        const indent = Math.min(Math.floor(indentSpaces / 2), 3);
        const itemText = l.trim().replace(/^\d+\.\s+/, '');
        listItems.push({ text: itemText, indent });
        i++;
      }
      blocks.push(
        <ol key={blockKey++} className="my-3 space-y-1.5 text-left">
          {listItems.map((item, itemIdx) => (
            <li
              key={itemIdx}
              className={`text-sm md:text-base text-[#C5C3C0] leading-relaxed list-decimal ${
                item.indent > 0 ? 'ml-10 text-[#A3A09B]' : 'ml-6'
              }`}
            >
              {parseInlineMarkup(item.text)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular Paragraph
    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('>') &&
      !/^\s*[-*]\s/.test(lines[i]) &&
      !/^\s*\d+\.\s/.test(lines[i]) &&
      lines[i].trim() !== '---' &&
      lines[i].trim() !== '***' &&
      lines[i].trim() !== '___' &&
      !(lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|'))
    ) {
      pLines.push(lines[i].trim());
      i++;
    }

    if (pLines.length > 0) {
      blocks.push(
        <p
          key={blockKey++}
          className="text-sm md:text-base text-[#C5C3C0] leading-relaxed mb-4 text-left"
        >
          {parseInlineMarkup(pLines.join(' '))}
        </p>
      );
    }
  }

  return blocks;
};

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
