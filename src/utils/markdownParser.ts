/**
 * Simple client-side Markdown to HTML converter.
 * Extracted from Markdown.tsx for global usage across the toolbox, including AI chats.
 */
/**
 * Simple client-side Markdown to HTML converter.
 * Extracted from Markdown.tsx for global usage across the toolbox, including AI chats.
 */
export const parseMarkdown = (md: string): string => {
  if (!md) return '';

  // Auto-close code blocks if odd count of ``` during streaming
  let processedMd = md;
  const backtickMatches = processedMd.match(/```/g);
  if (backtickMatches && backtickMatches.length % 2 !== 0) {
    processedMd += '\n```';
  }

  let html = processedMd
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks with syntax badge and dark background
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const languageLabel = lang ? lang.toUpperCase() : 'CODE';
    return `<div class="my-3 rounded-xl bg-[#111213] border border-[#2A2D30] overflow-hidden text-xs font-mono shadow-md">
      <div class="flex items-center justify-between px-3.5 py-1.5 bg-[#18191B] border-b border-[#2A2D30] text-[11px] text-[#A3A09B]">
        <span class="font-bold text-[#3C6B4D] tracking-wider">${languageLabel}</span>
        <span class="text-[10px] text-[#72706C]">Snippet</span>
      </div>
      <pre class="p-3.5 overflow-x-auto text-[#4E8E5E] text-[12px] leading-relaxed whitespace-pre font-mono"><code>${code}</code></pre>
    </div>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-[#18191B] border border-[#2A2D30] px-1.5 py-0.5 rounded text-[#4E8E5E] font-mono text-[12px] font-semibold">$1</code>');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-[#ECEBE9] mt-4 mb-2">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-[#ECEBE9] mt-5 mb-2 border-b border-[#2A2D30] pb-1">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-lg font-bold text-white mt-3 mb-3 border-b border-[#2A2D30] pb-1">$1</h2>');

  // Horizontal Rule
  html = html.replace(/^\s*---\s*$/gim, '<hr class="border-[#2A2D30] my-4" />');

  // Bold and Italics
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-[#D4D2CD]">$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<del class="line-through text-[#72706C]">$1</del>');

  // Blockquotes
  html = html.replace(/^\s*>\s+(.*$)/gim, '<blockquote class="border-l-4 border-[#3C6B4D] bg-[#18191B]/80 pl-3 py-1.5 my-3 text-[#A3A09B] italic rounded-r-lg">$1</blockquote>');

  // Task lists / checkboxes
  html = html.replace(/^\s*-\s+\[\s*\]\s+(.*$)/gim, '<li class="ml-4 list-none text-[#ECEBE9] flex items-center gap-2 my-1"><input type="checkbox" disabled class="rounded border-[#2A2D30] bg-[#111213] accent-[#3C6B4D]" /> <span>$1</span></li>');
  html = html.replace(/^\s*-\s+\[x\]\s+(.*$)/gim, '<li class="ml-4 list-none text-[#72706C] line-through flex items-center gap-2 my-1"><input type="checkbox" checked disabled class="rounded border-[#2A2D30] bg-[#111213] accent-[#3C6B4D]" /> <span>$1</span></li>');

  // Unordered Lists
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-[#ECEBE9] my-1">$1</li>');
  html = html.replace(/^\s*\*\s+(.*$)/gim, '<li class="ml-4 list-disc text-[#ECEBE9] my-1">$1</li>');

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
    return `<img src="${safeUrl}" alt="${alt}" class="max-w-full h-auto rounded-xl border border-[#2A2D30] my-3 shadow-md mx-auto" />`;
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
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-[#3C6B4D] hover:text-[#4E8E5E] underline font-semibold transition-colors">${text}</a>`;
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
        rowHtml += '<div class="overflow-x-auto my-3"><table class="w-full border-collapse border border-[#2A2D30] text-xs text-left rounded-lg overflow-hidden">';
      }

      rowHtml += '<tr class="border-b border-[#2A2D30] hover:bg-[#18191B]/60 transition-colors">';
      cells.forEach(cell => {
        if (tableHeader) {
          rowHtml += `<th class="px-3 py-2 bg-[#18191B] font-bold border border-[#2A2D30] text-[#ECEBE9]">${cell}</th>`;
        } else {
          rowHtml += `<td class="px-3 py-2 border border-[#2A2D30] text-[#ECEBE9]">${cell}</td>`;
        }
      });
      rowHtml += '</tr>';
      tableHeader = false;
      return rowHtml;
    } else {
      if (inTable) {
        inTable = false;
        return '</table></div>' + (trimmed ? `<p class="my-1.5 text-[#ECEBE9] leading-relaxed text-xs">${line}</p>` : '');
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
        return '</ul>' + (trimmed ? `<p class="my-1.5 text-[#ECEBE9] leading-relaxed text-xs">${line}</p>` : '');
      }
    }

    if (trimmed && 
        !trimmed.startsWith('<h') && 
        !trimmed.startsWith('<hr') && 
        !trimmed.startsWith('<div') &&
        !trimmed.startsWith('</div>') &&
        !trimmed.startsWith('<pre') && 
        !trimmed.startsWith('<code') && 
        !trimmed.startsWith('</pre') && 
        !trimmed.startsWith('</code') && 
        !trimmed.startsWith('</ul') && 
        !trimmed.startsWith('<blockquote') && 
        !trimmed.startsWith('<img')) {
      return `<p class="my-1.5 text-[#ECEBE9] leading-relaxed text-xs">${line}</p>`;
    }
    return line;
  });

  let resultHtml = finalLines.join('\n');
  if (inTable) resultHtml += '</table></div>';
  if (inList) resultHtml += '</ul>';

  return resultHtml;
};
