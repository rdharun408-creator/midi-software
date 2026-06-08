import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_PRESETS = [
  // Piano
  { id: uuidv4(), name: 'Grand Piano', category: 'Piano', msb: 0, lsb: 0, program: 1, favorite: true },
  { id: uuidv4(), name: 'Bright Piano', category: 'Piano', msb: 0, lsb: 0, program: 2, favorite: false },
  { id: uuidv4(), name: 'Electric Piano', category: 'Piano', msb: 0, lsb: 0, program: 5, favorite: true },
  { id: uuidv4(), name: 'Harpsichord', category: 'Piano', msb: 0, lsb: 0, program: 7, favorite: false },

  // Indian (Traditional Instruments)
  { id: uuidv4(), name: 'Harmonium Single', category: 'Indian', msb: 0, lsb: 113, program: 21, favorite: true },
  { id: uuidv4(), name: 'Harmonium Double', category: 'Indian', msb: 0, lsb: 114, program: 21, favorite: false },
  { id: uuidv4(), name: 'Harmonium Triple', category: 'Indian', msb: 0, lsb: 115, program: 21, favorite: false },
  { id: uuidv4(), name: 'Sitar 1', category: 'Indian', msb: 0, lsb: 112, program: 105, favorite: true },
  { id: uuidv4(), name: 'Sitar 2', category: 'Indian', msb: 0, lsb: 113, program: 105, favorite: false },
  { id: uuidv4(), name: 'Sitar 3 (XG)', category: 'Indian', msb: 51, lsb: 0, program: 1, favorite: false },
  { id: uuidv4(), name: 'Santoor', category: 'Indian', msb: 51, lsb: 0, program: 9, favorite: true },
  { id: uuidv4(), name: 'Veena', category: 'Indian', msb: 51, lsb: 0, program: 3, favorite: false },
  { id: uuidv4(), name: 'Sarod', category: 'Indian', msb: 51, lsb: 0, program: 19, favorite: false },
  { id: uuidv4(), name: 'Shehnai 1', category: 'Indian', msb: 51, lsb: 0, program: 21, favorite: false },
  { id: uuidv4(), name: 'Shehnai 2', category: 'Indian', msb: 0, lsb: 123, program: 112, favorite: false },
  { id: uuidv4(), name: 'Tabla Kit', category: 'Indian', msb: 126, lsb: 0, program: 116, favorite: true },

  // Organ
  { id: uuidv4(), name: 'Jazz Organ', category: 'Organ', msb: 0, lsb: 0, program: 17, favorite: false },
  { id: uuidv4(), name: 'Church Organ', category: 'Organ', msb: 0, lsb: 0, program: 20, favorite: true },
  { id: uuidv4(), name: 'Accordion', category: 'Organ', msb: 0, lsb: 0, program: 22, favorite: false },

  // Strings
  { id: uuidv4(), name: 'Violin Solo', category: 'Strings', msb: 0, lsb: 112, program: 41, favorite: false },
  { id: uuidv4(), name: 'Orchestral Strings', category: 'Strings', msb: 0, lsb: 112, program: 49, favorite: true },
  { id: uuidv4(), name: 'Synth Strings', category: 'Strings', msb: 0, lsb: 0, program: 51, favorite: false },

  // Choir
  { id: uuidv4(), name: 'Choir Aahs', category: 'Choir', msb: 0, lsb: 112, program: 53, favorite: true },
  { id: uuidv4(), name: 'Voice Oohs', category: 'Choir', msb: 0, lsb: 0, program: 54, favorite: false },

  // Flute
  { id: uuidv4(), name: 'Bansuri 1', category: 'Flute', msb: 51, lsb: 0, program: 12, favorite: true },
  { id: uuidv4(), name: 'Bansuri 2', category: 'Flute', msb: 0, lsb: 117, program: 74, favorite: false },
  { id: uuidv4(), name: 'Flute Solo', category: 'Flute', msb: 0, lsb: 112, program: 74, favorite: false },

  // Brass
  { id: uuidv4(), name: 'Trumpet', category: 'Brass', msb: 0, lsb: 112, program: 57, favorite: false },
  { id: uuidv4(), name: 'Synth Brass', category: 'Brass', msb: 0, lsb: 0, program: 63, favorite: false },

  // Guitar & Bass
  { id: uuidv4(), name: 'Nylon Guitar', category: 'Guitar', msb: 0, lsb: 0, program: 25, favorite: false },
  { id: uuidv4(), name: 'Clean Electric Guitar', category: 'Guitar', msb: 0, lsb: 0, program: 28, favorite: false },
  { id: uuidv4(), name: 'Acoustic Bass', category: 'Bass', msb: 0, lsb: 112, program: 33, favorite: false },
  { id: uuidv4(), name: 'Fingered Bass', category: 'Bass', msb: 0, lsb: 0, program: 34, favorite: false },

  // Synthesizer Pads & Leads
  { id: uuidv4(), name: 'Warm Pad', category: 'Pad', msb: 0, lsb: 0, program: 90, favorite: true },
  { id: uuidv4(), name: 'Square Lead', category: 'Pad', msb: 0, lsb: 0, program: 81, favorite: false },
  { id: uuidv4(), name: 'Sawtooth Lead', category: 'Pad', msb: 0, lsb: 0, program: 82, favorite: false },
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

  const loadDefaultPresets = (overwrite = false) => {
    if (overwrite) {
      setPresets(DEFAULT_PRESETS);
    } else {
      setPresets(prev => {
        const existingNames = new Set(prev.map(p => p.name.toLowerCase()));
        const newPresets = DEFAULT_PRESETS.filter(p => !existingNames.has(p.name.toLowerCase()));
        return [...prev, ...newPresets];
      });
    }
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
    loadDefaultPresets,
    exportPresets,
    importPresets
  };
}
