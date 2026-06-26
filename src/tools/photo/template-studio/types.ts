export interface BaseLayer {
  id: string;
  type: 'text' | 'image' | 'qr' | 'barcode';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  name: string;
  zIndex: number;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  placeholder: string;
  variableName: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  fill: string;
  backgroundColor: string | null;
  align: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  stroke: string | null;
  strokeWidth: number;
  shadowColor: string | null;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string | null;
  placeholder: string;
  variableName: string;
}

export interface QRLayer extends BaseLayer {
  type: 'qr';
  text: string;
  variableName: string;
  fgColor: string;
  bgColor: string;
}

export interface BarcodeLayer extends BaseLayer {
  type: 'barcode';
  text: string;
  variableName: string;
  format: 'CODE128' | 'EAN13' | 'UPC';
  lineColor: string;
  bgColor: string;
  displayValue: boolean;
}

export type Layer = TextLayer | ImageLayer | QRLayer | BarcodeLayer;

export interface TemplateData {
  id?: string;
  name: string;
  bgImage: string | null;
  width: number;
  height: number;
  layers: Layer[];
}
