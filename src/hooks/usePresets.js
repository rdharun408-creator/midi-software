import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_PRESETS = [
  { id: uuidv4(), name: 'Grand Piano', category: 'Piano', msb: 0, lsb: 0, program: 1, favorite: true },
  { id: uuidv4(), name: 'Bright Piano', category: 'Piano', msb: 0, lsb: 0, program: 2, favorite: false },
  { id: uuidv4(), name: 'Electric Piano', category: 'Piano', msb: 0, lsb: 0, program: 5, favorite: true },
  { id: uuidv4(), name: 'Church Organ', category: 'Organ', msb: 0, lsb: 0, program: 20, favorite: true },
  { id: uuidv4(), name: 'Strings', category: 'Strings', msb: 0, lsb: 112, program: 49, favorite: true },
  { id: uuidv4(), name: 'Choir', category: 'Choir', msb: 0, lsb: 112, program: 53, favorite: true },
  { id: uuidv4(), name: 'Flute', category: 'Flute', msb: 0, lsb: 112, program: 74, favorite: false },
  { id: uuidv4(), name: 'Trumpet', category: 'Brass', msb: 0, lsb: 112, program: 57, favorite: false },
  { id: uuidv4(), name: 'Violin', category: 'Strings', msb: 0, lsb: 112, program: 41, favorite: false },
  { id: uuidv4(), name: 'Acoustic Bass', category: 'Bass', msb: 0, lsb: 112, program: 33, favorite: false },
];

export const CATEGORIES = [
  'All', 'Piano', 'Organ', 'Strings', 'Choir', 'Guitar', 'Bass', 'Brass', 'Flute', 'Indian', 'Pad', 'Custom'
];

export function usePresets() {
  const [presets, setPresets] = useState(() => {
    const saved = localStorage.getItem('midi_voices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing presets from localStorage', e);
      }
    }
    return DEFAULT_PRESETS;
  });

  useEffect(() => {
    localStorage.setItem('midi_voices', JSON.stringify(presets));
  }, [presets]);

  const addPreset = (presetData) => {
    const newPreset = { ...presetData, id: uuidv4(), favorite: false };
    setPresets(prev => [...prev, newPreset]);
  };

  const updatePreset = (id, updatedData) => {
    setPresets(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const deletePreset = (id) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  };

  const toggleFavorite = (id) => {
    setPresets(prev => prev.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p));
  };

  const exportPresets = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(presets));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "midi_presets.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importPresets = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (Array.isArray(imported)) {
            // Add imported presets, optionally assigning new UUIDs
            const cleanImported = imported.map(p => ({
              ...p,
              id: p.id || uuidv4(),
              favorite: !!p.favorite
            }));
            setPresets(prev => [...prev, ...cleanImported]);
            resolve(true);
          } else {
            reject(new Error("Invalid JSON format. Expected an array of presets."));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  return {
    presets,
    addPreset,
    updatePreset,
    deletePreset,
    toggleFavorite,
    exportPresets,
    importPresets
  };
}
