import { triggerTextDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { ArrowRightLeft, Download, FileCode, Settings } from 'lucide-react';

export const XmlJsonTool = () => {
  const [input, setInput] = useState('<user id="1">\n  <name>John Doe</name>\n  <age>28</age>\n  <skills>React, TS</skills>\n</user>');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [xmlRootName, setXmlRootName] = useState('root');
  const [ignoreEmptyText, setIgnoreEmptyText] = useState(true);

  // Helper to parse XML to JSON recursively
  const xmlToJson = (xml: Node): any => {
    let obj: any = {};

    if (xml.nodeType === 1) { // element node
      const element = xml as Element;
      // Attributes
      if (element.attributes.length > 0) {
        obj["_attributes"] = {};
        for (let j = 0; j < element.attributes.length; j++) {
          const attribute = element.attributes.item(j);
          if (attribute) {
            obj["_attributes"][attribute.nodeName] = attribute.nodeValue;
          }
        }
      }
    } else if (xml.nodeType === 3) { // text node
      return xml.nodeValue?.trim();
    }

    // Children nodes
    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;

        if (nodeName === '#text') {
          const val = item.nodeValue?.trim();
          if (ignoreEmptyText && !val) continue;
          if (val) return val;
          continue;
        }

        const childObj = xmlToJson(item);
        if (obj[nodeName] === undefined) {
          obj[nodeName] = childObj;
        } else {
          if (!Array.isArray(obj[nodeName])) {
            obj[nodeName] = [obj[nodeName]];
          }
          obj[nodeName].push(childObj);
        }
      }
    }
    return obj;
  };

  const handleXmlToJson = () => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input.trim(), 'application/xml');
      
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        setOutput('XML Parsing Error: ' + parserError.textContent);
        return;
      }

      const root = xmlDoc.documentElement;
      const result: any = {};
      result[root.nodeName] = xmlToJson(root);

      setOutput(JSON.stringify(result, null, 2));
    } catch (e) {
      setOutput('Failed to parse XML string. Ensure elements match opening/closing tags.');
    }
  };

  // Helper to convert JSON back to XML
  const jsonToXml = (obj: any, indent: string = ''): string => {
    let xml = '';
    
    for (const key in obj) {
      if (key === '_attributes') continue;
      
      const val = obj[key];
      let attrs = '';
      if (val && typeof val === 'object' && val._attributes) {
        attrs = Object.entries(val._attributes)
          .map(([attrKey, attrVal]) => ` ${attrKey}="${attrVal}"`)
          .join('');
      }

      if (Array.isArray(val)) {
        val.forEach(item => {
          xml += jsonToXml({ [key]: item }, indent);
        });
      } else if (typeof val === 'object' && val !== null) {
        const nested = jsonToXml(val, indent + '  ');
        if (nested.trim()) {
          xml += `${indent}<${key}${attrs}>\n${nested}${indent}</${key}>\n`;
        } else {
          xml += `${indent}<${key}${attrs} />\n`;
        }
      } else {
        xml += `${indent}<${key}${attrs}>${val}</${key}>\n`;
      }
    }
    return xml;
  };

  const handleJsonToXml = () => {
    try {
      const parsed = JSON.parse(input.trim());
      
      // If the parsed object does not have a single root element wrapper, wrap it in our custom XML Root Name
      let xmlBody = '';
      const keys = Object.keys(parsed);
      if (keys.length === 1 && typeof parsed[keys[0]] === 'object' && !Array.isArray(parsed[keys[0]])) {
        xmlBody = jsonToXml(parsed);
      } else {
        xmlBody = jsonToXml({ [xmlRootName]: parsed });
      }

      const finalXml = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlBody}`;
      setOutput(finalXml.trim());
    } catch (e) {
      setOutput('Failed to parse JSON tree. Ensure input is a valid JSON object/array.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setInput(reader.result as string);
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Input Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 h-[520px] justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode className="text-[#4E8E5E]" size={18} />
              <span>Input XML or JSON</span>
            </h2>
            <label className="py-1 px-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-400 flex items-center gap-1 hover:text-slate-200 cursor-pointer">
              <span>Load file</span>
              <input type="file" accept=".xml,.json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-950/20 border border-slate-850 rounded-2xl p-4 text-xs font-mono text-slate-250 focus:outline-none focus:border-[#4E8E5E] resize-none outline-none"
          />

          <div className="flex gap-3 pt-2 border-t border-slate-850">
            <button onClick={handleXmlToJson} className="btn-primary flex-1 py-3 flex items-center justify-center gap-1.5">
              <ArrowRightLeft size={16} />
              <span>XML → JSON</span>
            </button>
            <button onClick={handleJsonToXml} className="btn-secondary flex-1 py-2.5 text-xs flex items-center justify-center gap-1.5">
              <ArrowRightLeft size={16} />
              <span>JSON → XML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel & Output Side */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Settings */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5">
            <Settings size={16} className="text-[#4E8E5E]" />
            <span>XML Converter Settings</span>
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 font-semibold">XML Root Wrapper Tag</label>
            <input
              type="text"
              value={xmlRootName}
              onChange={(e) => setXmlRootName(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              placeholder="e.g. root"
            />
            <p className="text-[10px] text-slate-500">Used when JSON output does not have a single wrapper tag.</p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="ignoreText"
              checked={ignoreEmptyText}
              onChange={(e) => setIgnoreEmptyText(e.target.checked)}
              className="w-4 h-4 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 focus:ring-offset-0"
            />
            <label htmlFor="ignoreText" className="text-xs text-slate-400 cursor-pointer select-none">
              Ignore whitespace-only nodes
            </label>
          </div>
        </div>

        {/* Output Export panel */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Quick Export</span>
          {output ? (
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn-secondary w-full py-2.5 text-xs"
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={() => triggerTextDownload(output, output.trim().startsWith('<') ? 'output.xml' : 'output.json')}
                className="btn-primary w-full py-3"
              >
                <Download size={18} />
                <span>Save Result File</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4 text-center">Run convert to generate outputs</p>
          )}
        </div>
      </div>

      {/* Global Console view */}
      {output && (
        <div className="lg:col-span-12 flex flex-col gap-3">
          <div className="glass-card p-6 flex flex-col gap-3">
            <span className="text-sm font-bold text-slate-200">Result Output Console</span>
            <textarea
              readOnly
              value={output}
              className="w-full bg-slate-950 p-4 text-xs font-mono text-slate-300 rounded-2xl border border-slate-900 resize-y min-h-[220px] focus:outline-none outline-none leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
};
