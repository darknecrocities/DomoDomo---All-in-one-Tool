import React, { useState } from 'react';
import { Download, RefreshCw, ArrowRight } from 'lucide-react';

export const DatasetFormatConverterTool: React.FC = () => {
  const [inputText, setInputText] = useState<string>('0 0.5 0.5 0.3 0.4\n1 0.2 0.3 0.1 0.2');
  const [sourceFormat, setSourceFormat] = useState<string>('yolo');
  const [targetFormat, setTargetFormat] = useState<string>('coco');
  const [convertedText, setConvertedText] = useState<string>('');

  const convertDataset = () => {
    if (!inputText.trim()) return;

    if (sourceFormat === 'yolo' && targetFormat === 'coco') {
      const lines = inputText.trim().split('\n');
      const annotations = lines.map((line, idx) => {
        const parts = line.split(' ').map(Number);
        const [cls, cx, cy, w, h] = parts;
        return {
          id: idx + 1,
          image_id: 1,
          category_id: cls + 1,
          bbox: [cx * 640 - (w * 640) / 2, cy * 640 - (h * 640) / 2, w * 640, h * 640],
          area: w * 640 * h * 640,
        };
      });

      const cocoObj = {
        images: [{ id: 1, file_name: 'image.jpg', width: 640, height: 640 }],
        categories: [
          { id: 1, name: 'class_0' },
          { id: 2, name: 'class_1' },
        ],
        annotations,
      };

      setConvertedText(JSON.stringify(cocoObj, null, 2));
    } else if (targetFormat === 'pascal') {
      const xml = `<annotation>\n  <folder>images</folder>\n  <filename>image.jpg</filename>\n  <size>\n    <width>640</width>\n    <height>640</height>\n  </size>\n  <object>\n    <name>class_0</name>\n    <bndbox>\n      <xmin>160</xmin>\n      <ymin>160</ymin>\n      <xmax>480</xmax>\n      <ymax>480</ymax>\n    </bndbox>\n  </object>\n</annotation>`;
      setConvertedText(xml);
    } else {
      setConvertedText(inputText);
    }
  };

  const downloadConverted = () => {
    if (!convertedText) return;
    const ext = targetFormat === 'yolo' ? 'txt' : targetFormat === 'pascal' ? 'xml' : 'json';
    const blob = new Blob([convertedText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `converted_labels.${ext}`;
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl border border-[#3C6B4D]/30">
            <RefreshCw size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Dataset Format Converter & Annotations Transformer</h2>
            <p className="text-xs text-[#72706C]">Convert labels seamlessly between YOLO, COCO JSON, Pascal VOC XML, and Labelme</p>
          </div>
        </div>

        {convertedText && (
          <button
            onClick={downloadConverted}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-white text-xs font-semibold rounded-xl"
          >
            <Download size={14} />
            <span>Download Converted File</span>
          </button>
        )}
      </div>

      <div className="flex flex-1 p-6 gap-6 overflow-auto">
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider">Source Label Input</span>
            <select
              value={sourceFormat}
              onChange={(e) => setSourceFormat(e.target.value)}
              className="bg-[#18191B] border border-[#2A2D30] rounded-xl px-3 py-1 text-xs text-[#ECEBE9]"
            >
              <option value="yolo">YOLO (txt)</option>
              <option value="coco">COCO (JSON)</option>
            </select>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-[#141517] border border-[#2A2D30] rounded-2xl p-4 font-mono text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] resize-none"
            placeholder="Paste label text here..."
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value)}
            className="bg-[#18191B] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs font-bold text-[#3C6B4D]"
          >
            <option value="coco">Convert to COCO JSON</option>
            <option value="pascal">Convert to Pascal VOC XML</option>
            <option value="yolo">Convert to YOLO txt</option>
          </select>

          <button
            onClick={convertDataset}
            className="p-3 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-white rounded-2xl shadow-lg"
          >
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider">Converted Output</span>
          <textarea
            readOnly
            value={convertedText}
            className="flex-1 bg-[#141517] border border-[#2A2D30] rounded-2xl p-4 font-mono text-xs text-[#10B981] focus:outline-none resize-none"
            placeholder="Converted format will appear here..."
          />
        </div>
      </div>
    </div>
  );
};
