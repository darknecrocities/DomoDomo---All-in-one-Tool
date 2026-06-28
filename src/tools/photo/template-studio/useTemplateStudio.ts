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

  const duplicateLayer = useCallback((id: string) => {
    updateTemplate(prev => {
      const layer = prev.layers.find(l => l.id === id);
      if (!layer) return prev;

      const newId = `${layer.type}-${Date.now()}`;
      const maxZ = Math.max(...prev.layers.map(l => l.zIndex), 0);
      
      const newLayer = {
        ...layer,
        id: newId,
        x: layer.x + 20,
        y: layer.y + 20,
        name: `${layer.name} (Copy)`,
        zIndex: maxZ + 1
      } as Layer;

      setSelectedId(newId);
      return {
        ...prev,
        layers: [...prev.layers, newLayer]
      };
    });
  }, [updateTemplate]);

  const [localSavedTemplates, setLocalSavedTemplates] = useState<Record<string, TemplateData>>(() => {
    try {
      const saved = localStorage.getItem('domodomo_saved_templates');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveTemplateToLibrary = useCallback((name: string, data: TemplateData) => {
    const updatedName = name.trim() || 'My Design';
    setLocalSavedTemplates(prev => {
      const next = { ...prev, [updatedName]: { ...data, name: updatedName } };
      localStorage.setItem('domodomo_saved_templates', JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteTemplateFromLibrary = useCallback((name: string) => {
    setLocalSavedTemplates(prev => {
      const next = { ...prev };
      delete next[name];
      localStorage.setItem('domodomo_saved_templates', JSON.stringify(next));
      return next;
    });
  }, []);

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
    duplicateLayer,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    loadTemplateJSON,
    localSavedTemplates,
    saveTemplateToLibrary,
    deleteTemplateFromLibrary
  };
};
