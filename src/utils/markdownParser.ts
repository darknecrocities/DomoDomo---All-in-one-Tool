/**
 * Simple client-side Markdown to HTML converter.
 * Extracted from Markdown.tsx for global usage across the toolbox, including AI chats.
 */
export const parseMarkdown = (md: string): string => {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-slate-950/70 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto my-3"><code>$2</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-emerald-400">$1</code>');
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-slate-100 mt-4 mb-2">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-slate-100 mt-5 mb-2 border-b border-slate-850 pb-1">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-lg font-bold text-white mt-2 mb-3">$1</h2>');

  // Horizontal Rule
  html = html.replace(/^\s*---\s*$/gim, '<hr class="border-slate-800 my-4" />');

  // Bold and Italics
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<del class="line-through text-slate-500">$1</del>');

  // Blockquotes
  html = html.replace(/^\s*>\s+(.*$)/gim, '<blockquote class="border-l-4 border-[#4E8E5E] bg-slate-900/50 pl-3 py-1.5 my-3 text-slate-400 italic font-medium">$1</blockquote>');

  // Task lists / checkboxes
  html = html.replace(/^\s*-\s+\[\s*\]\s+(.*$)/gim, '<li class="ml-4 list-none text-slate-300 flex items-center gap-2 my-1"><input type="checkbox" disabled class="rounded border-slate-800 bg-slate-900 accent-[#4E8E5E]" /> <span>$1</span></li>');
  html = html.replace(/^\s*-\s+\[x\]\s+(.*$)/gim, '<li class="ml-4 list-none text-slate-455 line-through flex items-center gap-2 my-1"><input type="checkbox" checked disabled class="rounded border-slate-800 bg-slate-900 accent-[#4E8E5E]" /> <span>$1</span></li>');

  // Lists
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-1">$1</li>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    const trimmedUrl = url.trim().toLowerCase();
    const isSafe = 
      trimmedUrl.startsWith('http://') || 
      trimmedUrl.startsWith('https://') || 
      trimmedUrl.startsWith('data:image/') ||
      (!trimmedUrl.includes(':') && !trimmedUrl.startsWith('//')) ||
      trimmedUrl.startsWith('#');
    const safeUrl = isSafe ? url : '';
    return `<img src="${safeUrl}" alt="${alt}" class="max-w-full h-auto rounded-lg border border-slate-800 my-3 shadow-md mx-auto" />`;
  });

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    const trimmedUrl = url.trim().toLowerCase();
    const isSafe = 
      trimmedUrl.startsWith('http://') || 
      trimmedUrl.startsWith('https://') || 
      trimmedUrl.startsWith('mailto:') || 
      trimmedUrl.startsWith('tel:') || 
      trimmedUrl.startsWith('#') ||
      (!trimmedUrl.includes(':') && !trimmedUrl.startsWith('//'));
    const safeUrl = isSafe ? url : '#';
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline font-semibold transition-colors">${text}</a>`;
  });

  // Paragraphs and Tables Parser
  const lines = html.split('\n');
  let inList = false;
  let inTable = false;
  let tableHeader = true;

  const finalLines = lines.map(line => {
    const trimmed = line.trim();

    // Table Row Parser
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
      const isSeparator = cells.every(c => /^:-*:?$/.test(c) || /^-+$/.test(c));
      if (isSeparator) {
        return '';
      }

      let rowHtml = '';
      if (!inTable) {
        inTable = true;
        tableHeader = true;
        rowHtml += '<div class="overflow-x-auto my-3"><table class="w-full border-collapse border border-slate-800 text-xs text-left">';
      }

      rowHtml += '<tr class="border-b border-slate-800 hover:bg-slate-900/40 transition-colors">';
      cells.forEach(cell => {
        if (tableHeader) {
          rowHtml += `<th class="px-3 py-2 bg-slate-900/90 font-bold border border-slate-800 text-slate-100">${cell}</th>`;
        } else {
          rowHtml += `<td class="px-3 py-2 border border-slate-800 text-slate-300">${cell}</td>`;
        }
      });
      rowHtml += '</tr>';
      tableHeader = false;
      return rowHtml;
    } else {
      if (inTable) {
        inTable = false;
        return '</table></div>' + (trimmed ? `<p class="my-2 text-slate-350 leading-relaxed text-xs">${line}</p>` : '');
      }
    }

    if (trimmed.startsWith('<li')) {
      if (!inList) {
        inList = true;
        return '<ul class="my-2 flex flex-col gap-1">' + line;
      }
      return line;
    } else {
      if (inList) {
        inList = false;
        return '</ul>' + (trimmed ? `<p class="my-2 text-slate-355 leading-relaxed text-xs">${line}</p>` : '');
      }
    }

    if (trimmed && 
        !trimmed.startsWith('<h') && 
        !trimmed.startsWith('<hr') && 
        !trimmed.startsWith('<pre') && 
        !trimmed.startsWith('<code') && 
        !trimmed.startsWith('</pre') && 
        !trimmed.startsWith('</code') && 
        !trimmed.startsWith('</ul') && 
        !trimmed.startsWith('<blockquote') && 
        !trimmed.startsWith('<img')) {
      return `<p class="my-2 text-slate-350 leading-relaxed text-xs">${line}</p>`;
    }
    return line;
  });

  let resultHtml = finalLines.join('\n');
  if (inTable) resultHtml += '</table></div>';
  if (inList) resultHtml += '</ul>';

  return resultHtml;
};
