import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer, Rect, Circle, Star, Arrow, Line } from 'react-konva';
import useImage from 'use-image';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import type { TemplateData, Layer as LayerType, TextLayer } from '../types';

interface CanvasEditorProps {
  template: TemplateData;
  mode: 'admin' | 'user';
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateLayer: (id: string, changes: Partial<LayerType>) => void;
  scale: number;
  offset: { x: number, y: number };
  onWheel: (e: any) => void;
  userInputs?: Record<string, string>;
  stageRef?: React.RefObject<any>;
  canvasMode: 'select' | 'hand';
}

const TransformerComponent = ({ isSelected, shapeProps, onChange, onSelect, locked, children }: any) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !locked) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, locked]);

  const child = React.Children.only(children);
  const clonedChild = React.cloneElement(child, {
    ref: shapeRef,
    onClick: onSelect,
    onTap: onSelect,
    draggable: !locked,
    onDragEnd: (e: any) => {
      if (locked) return;
      onChange({
        ...shapeProps,
        x: e.target.x(),
        y: e.target.y(),
      });
    },
    onTransformEnd: () => {
      if (locked) return;
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);

      onChange({
        ...shapeProps,
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
      });
    }
  });

  return (
    <React.Fragment>
      {clonedChild}
      {isSelected && !locked && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
          enabledAnchors={
            shapeProps.type === 'text'
              ? ['middle-left', 'middle-right']
              : ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right']
          }
        />
      )}
    </React.Fragment>
  );
};

const DynamicQRNode = ({ layer, isSelected, locked, onSelect, onChange, mode, userInputs }: any) => {
  const [src, setSrc] = React.useState('');
  const [image] = useImage(src);
  
  React.useEffect(() => {
    let text = layer.text;
    if (mode === 'user' && userInputs[layer.variableName] !== undefined) {
      text = userInputs[layer.variableName];
    }
    QRCode.toDataURL(text || ' ', { 
      color: { dark: layer.fgColor || '#000000', light: layer.bgColor || '#ffffff' },
      margin: 1 
    }).then(setSrc).catch(() => {});
  }, [layer.text, layer.fgColor, layer.bgColor, layer.variableName, mode, userInputs]);

  const shapeProps = { ...layer, image };

  if (mode === 'admin') {
    return (
      <TransformerComponent shapeProps={shapeProps} isSelected={isSelected} locked={locked} onSelect={onSelect} onChange={onChange}>
        <KonvaImage {...shapeProps} />
      </TransformerComponent>
    );
  }
  return <KonvaImage {...shapeProps} listening={false} />;
};

const DynamicBarcodeNode = ({ layer, isSelected, locked, onSelect, onChange, mode, userInputs }: any) => {
  const [src, setSrc] = React.useState('');
  const [image] = useImage(src);
  
  React.useEffect(() => {
    let text = layer.text;
    if (mode === 'user' && userInputs[layer.variableName] !== undefined) {
      text = userInputs[layer.variableName];
    }
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, text || ' ', {
        format: layer.format,
        lineColor: layer.lineColor,
        background: layer.bgColor,
        displayValue: layer.displayValue,
        margin: 0
      });
      setSrc(canvas.toDataURL());
    } catch {
      // Invalid barcode format
    }
  }, [layer.text, layer.format, layer.lineColor, layer.bgColor, layer.displayValue, layer.variableName, mode, userInputs]);

  const shapeProps = { ...layer, image };

  if (mode === 'admin') {
    return (
      <TransformerComponent shapeProps={shapeProps} isSelected={isSelected} locked={locked} onSelect={onSelect} onChange={onChange}>
        <KonvaImage {...shapeProps} />
      </TransformerComponent>
    );
  }
  return <KonvaImage {...shapeProps} listening={false} />;
};

const DynamicImageNode = ({ layer, isSelected, locked, onSelect, onChange, mode, userInputs }: any) => {
  let src = layer.src;
  if (mode === 'user' && userInputs[layer.variableName]) {
    src = userInputs[layer.variableName];
  }
  const [image] = useImage(src || '');
  
  const shapeProps = { ...layer, image };

  if (mode === 'admin') {
    return (
      <TransformerComponent shapeProps={shapeProps} isSelected={isSelected} locked={locked} onSelect={onSelect} onChange={onChange}>
        <KonvaImage {...shapeProps} />
      </TransformerComponent>
    );
  }
  return (
    <React.Fragment>
      {image ? (
        <KonvaImage {...shapeProps} listening={false} />
      ) : (
        <Text {...shapeProps} text={layer.placeholder} fill="#A3A09B" listening={false} />
      )}
    </React.Fragment>
  );
};

const DynamicShapeNode = ({ layer, isSelected, locked, onSelect, onChange, mode }: any) => {
  const shapeProps = {
    ...layer,
    opacity: layer.opacity,
    rotation: layer.rotation,
    x: layer.x,
    y: layer.y,
    width: layer.width,
    height: layer.height
  };

  const renderShapeElement = () => {
    switch (layer.shapeType) {
      case 'rect':
        return <Rect {...shapeProps} cornerRadius={layer.cornerRadius || 0} />;
      case 'circle':
        return (
          <Circle
            {...shapeProps}
            radius={Math.min(layer.width, layer.height) / 2}
            x={layer.x + layer.width / 2}
            y={layer.y + layer.height / 2}
          />
        );
      case 'triangle': {
        const w = layer.width;
        const h = layer.height;
        const points = [w / 2, 0, w, h, 0, h];
        return <Line {...shapeProps} points={points} closed fill={layer.fill} stroke={layer.stroke} strokeWidth={layer.strokeWidth} />;
      }
      case 'star':
        return (
          <Star
            {...shapeProps}
            numPoints={layer.numPoints || 5}
            innerRadius={layer.innerRadius || Math.min(layer.width, layer.height) / 4}
            outerRadius={layer.outerRadius || Math.min(layer.width, layer.height) / 2}
            x={layer.x + layer.width / 2}
            y={layer.y + layer.height / 2}
          />
        );
      case 'arrow':
        return (
          <Arrow
            {...shapeProps}
            points={[0, layer.height / 2, layer.width, layer.height / 2]}
            pointerLength={10}
            pointerWidth={10}
            fill={layer.fill}
            stroke={layer.fill}
            strokeWidth={layer.strokeWidth || 4}
          />
        );
      default:
        return null;
    }
  };

  if (mode === 'admin') {
    return (
      <TransformerComponent shapeProps={shapeProps} isSelected={isSelected} locked={locked} onSelect={onSelect} onChange={onChange}>
        {renderShapeElement() || <Rect />}
      </TransformerComponent>
    );
  }

  const element = renderShapeElement();
  return element ? React.cloneElement(element, { listening: false, draggable: false }) : null;
};

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  template,
  mode,
  selectedId,
  onSelect,
  onUpdateLayer,
  scale,
  offset,
  onWheel,
  userInputs = {},
  stageRef,
  canvasMode
}) => {
  const [bgImageObj] = useImage(template.bgImage || '');
  const sortedLayers = [...template.layers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div 
      className="w-full h-full bg-[#0A0B0C] relative flex items-center justify-center outline-none"
      onWheel={onWheel}
    >
      <div 
        className="shadow-2xl ring-1 ring-[#2A2D30] transition-transform duration-75" 
        style={{ 
          width: template.width, 
          height: template.height, 
          transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`, 
          transformOrigin: 'center' 
        }}
      >
        <Stage
          width={template.width}
          height={template.height}
          ref={stageRef}
          onMouseDown={(e) => {
            const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background';
            if (clickedOnEmpty) onSelect(null);
          }}
        >
          <Layer>
            {bgImageObj && (
              <KonvaImage 
                image={bgImageObj} 
                width={template.width} 
                height={template.height} 
                name="background"
                listening={mode === 'admin'}
              />
            )}
            
            {sortedLayers.map(layer => {
              if (!layer.visible) return null;
              
              if (layer.type === 'text') {
                const textLayer = layer as TextLayer;
                const displayText = mode === 'user' && userInputs[textLayer.variableName] !== undefined 
                  ? userInputs[textLayer.variableName] 
                  : textLayer.text;

                const textProps = {
                  ...textLayer,
                  text: displayText,
                  fontFamily: textLayer.fontFamily,
                  fontSize: textLayer.fontSize,
                  fontStyle: textLayer.fontStyle,
                  fontVariant: textLayer.fontWeight,
                  textDecoration: textLayer.textDecoration === 'none' ? '' : textLayer.textDecoration,
                  fill: textLayer.fill,
                  align: textLayer.align,
                  lineHeight: textLayer.lineHeight,
                  letterSpacing: textLayer.letterSpacing,
                  stroke: textLayer.strokeWidth > 0 ? (textLayer.stroke || undefined) : undefined,
                  strokeWidth: textLayer.strokeWidth,
                  shadowColor: textLayer.shadowBlur > 0 ? (textLayer.shadowColor || undefined) : undefined,
                  shadowBlur: textLayer.shadowBlur,
                  shadowOffsetX: textLayer.shadowBlur > 0 ? textLayer.shadowOffsetX : 0,
                  shadowOffsetY: textLayer.shadowBlur > 0 ? textLayer.shadowOffsetY : 0,
                  opacity: textLayer.opacity,
                  rotation: textLayer.rotation
                };

                if (textLayer.textTransform === 'uppercase') textProps.text = String(textProps.text).toUpperCase();
                else if (textLayer.textTransform === 'lowercase') textProps.text = String(textProps.text).toLowerCase();

                if (mode === 'admin') {
                  return (
                    <TransformerComponent
                      key={layer.id}
                      shapeProps={textProps}
                      isSelected={layer.id === selectedId}
                      locked={layer.locked || canvasMode === 'hand'}
                      onSelect={() => {
                        if (canvasMode !== 'hand') onSelect(layer.id);
                      }}
                      onChange={(newProps: any) => onUpdateLayer(layer.id, newProps)}
                    >
                      <Text {...textProps} />
                    </TransformerComponent>
                  );
                } else {
                  return (
                    <Text
                      key={layer.id}
                      {...textProps}
                      draggable={false}
                      listening={false}
                    />
                  );
                }
              }
              
              if (layer.type === 'qr') {
                return <DynamicQRNode key={layer.id} layer={layer} isSelected={layer.id === selectedId} locked={layer.locked || canvasMode === 'hand'} onSelect={() => { if (canvasMode !== 'hand') onSelect(layer.id); }} onChange={(newProps: any) => onUpdateLayer(layer.id, newProps)} mode={mode} userInputs={userInputs} />;
              }

              if (layer.type === 'barcode') {
                return <DynamicBarcodeNode key={layer.id} layer={layer} isSelected={layer.id === selectedId} locked={layer.locked || canvasMode === 'hand'} onSelect={() => { if (canvasMode !== 'hand') onSelect(layer.id); }} onChange={(newProps: any) => onUpdateLayer(layer.id, newProps)} mode={mode} userInputs={userInputs} />;
              }

              if (layer.type === 'image') {
                return <DynamicImageNode key={layer.id} layer={layer} isSelected={layer.id === selectedId} locked={layer.locked || canvasMode === 'hand'} onSelect={() => { if (canvasMode !== 'hand') onSelect(layer.id); }} onChange={(newProps: any) => onUpdateLayer(layer.id, newProps)} mode={mode} userInputs={userInputs} />;
              }

              if (layer.type === 'shape') {
                return <DynamicShapeNode key={layer.id} layer={layer} isSelected={layer.id === selectedId} locked={layer.locked || canvasMode === 'hand'} onSelect={() => { if (canvasMode !== 'hand') onSelect(layer.id); }} onChange={(newProps: any) => onUpdateLayer(layer.id, newProps)} mode={mode} />;
              }
              
              return null;
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};
