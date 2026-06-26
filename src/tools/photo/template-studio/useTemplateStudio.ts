import { useState, useCallback } from 'react';
import type { TemplateData, Layer } from './types';

const MAX_HISTORY = 30;

export const useTemplateStudio = () => {
  const [template, setTemplate] = useState<TemplateData>({
    name: 'Untitled Template',
    bgImage: null,
    width: 800,
    height: 600,
    layers: []
  });

  const [history, setHistory] = useState<TemplateData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const saveHistory = useCallback((newTemplate: TemplateData) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newTemplate);
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
    setTemplate(newTemplate);
  }, [historyIndex]);

  const updateTemplate = useCallback((updater: (prev: TemplateData) => TemplateData) => {
    setTemplate(prev => {
      const next = updater(prev);
      saveHistory(next);
      return next;
    });
  }, [saveHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setTemplate(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setTemplate(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const addLayer = useCallback((layer: Layer) => {
    updateTemplate(prev => ({
      ...prev,
      layers: [...prev.layers, layer]
    }));
    setSelectedId(layer.id);
  }, [updateTemplate]);

  const updateLayer = useCallback((id: string, changes: Partial<Layer>) => {
    updateTemplate((prev) => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, ...changes } as Layer : l)
    }));
  }, [updateTemplate]);

  const deleteLayer = useCallback((id: string) => {
    updateTemplate(prev => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== id)
    }));
    if (selectedId === id) setSelectedId(null);
  }, [updateTemplate, selectedId]);

  const reorderLayer = useCallback((id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    updateTemplate(prev => {
      const layers = [...prev.layers];
      layers.sort((a, b) => a.zIndex - b.zIndex);
      const idx = layers.findIndex(l => l.id === id);
      if (idx === -1) return prev;

      if (direction === 'up' && idx < layers.length - 1) {
        const temp = layers[idx].zIndex;
        layers[idx].zIndex = layers[idx + 1].zIndex;
        layers[idx + 1].zIndex = temp;
      } else if (direction === 'down' && idx > 0) {
        const temp = layers[idx].zIndex;
        layers[idx].zIndex = layers[idx - 1].zIndex;
        layers[idx - 1].zIndex = temp;
      } else if (direction === 'top') {
        const maxZ = Math.max(...layers.map(l => l.zIndex), 0);
        layers[idx].zIndex = maxZ + 1;
      } else if (direction === 'bottom') {
        const minZ = Math.min(...layers.map(l => l.zIndex), 0);
        layers[idx].zIndex = minZ - 1;
      }

      return { ...prev, layers };
    });
  }, [updateTemplate]);

  const loadTemplateJSON = useCallback((json: TemplateData) => {
    setTemplate(json);
    setHistory([json]);
    setHistoryIndex(0);
    setSelectedId(null);
  }, []);

  return {
    template,
    selectedId,
    setSelectedId,
    updateTemplate,
    addLayer,
    updateLayer,
    deleteLayer,
    reorderLayer,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    loadTemplateJSON
  };
};
