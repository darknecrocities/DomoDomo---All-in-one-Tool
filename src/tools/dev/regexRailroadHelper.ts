export interface RailToken {
  type: 'start' | 'end' | 'literal' | 'class' | 'group' | 'quantifier' | 'anchor';
  label: string;
  detail?: string;
}

export const tokenizeRegexPattern = (raw: string): RailToken[] => {
  const tokenList: RailToken[] = [];
  tokenList.push({ type: 'start', label: 'START' });

  let i = 0;
  while (i < raw.length) {
    const ch = raw[i];

    if (ch === '^') {
      tokenList.push({ type: 'anchor', label: 'Line Start (^)' });
      i++;
    } else if (ch === '$') {
      tokenList.push({ type: 'anchor', label: 'Line End ($)' });
      i++;
    } else if (ch === '\\') {
      const next = raw[i + 1] || '';
      let desc = `Escaped \\${next}`;
      if (next === 'd') desc = 'Digit [0-9]';
      else if (next === 'w') desc = 'Word Char [a-zA-Z0-9_]';
      else if (next === 's') desc = 'Whitespace';
      else if (next === 'b') desc = 'Word Boundary';
      tokenList.push({ type: 'class', label: `\\${next}`, detail: desc });
      i += 2;
    } else if (ch === '[') {
      const end = raw.indexOf(']', i);
      if (end !== -1) {
        const cls = raw.slice(i, end + 1);
        tokenList.push({ type: 'class', label: cls, detail: 'Character Class' });
        i = end + 1;
      } else {
        tokenList.push({ type: 'literal', label: ch });
        i++;
      }
    } else if (ch === '(') {
      tokenList.push({ type: 'group', label: 'Group Start (' });
      i++;
    } else if (ch === ')') {
      tokenList.push({ type: 'group', label: ') Group End' });
      i++;
    } else if (ch === '*' || ch === '+' || ch === '?') {
      const desc = ch === '*' ? '0 or more' : ch === '+' ? '1 or more' : 'Optional (0 or 1)';
      tokenList.push({ type: 'quantifier', label: ch, detail: desc });
      i++;
    } else if (ch === '{') {
      const end = raw.indexOf('}', i);
      if (end !== -1) {
        const quant = raw.slice(i, end + 1);
        tokenList.push({ type: 'quantifier', label: quant, detail: 'Repeat Range' });
        i = end + 1;
      } else {
        tokenList.push({ type: 'literal', label: ch });
        i++;
      }
    } else if (ch === '|') {
      tokenList.push({ type: 'anchor', label: 'OR Branch (|)' });
      i++;
    } else {
      tokenList.push({ type: 'literal', label: ch });
      i++;
    }
  }

  tokenList.push({ type: 'end', label: 'END' });
  return tokenList;
};
