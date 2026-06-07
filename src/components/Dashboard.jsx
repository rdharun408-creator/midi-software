import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Heart, Music, Settings, Download, Upload } from 'lucide-react';
import { CATEGORIES } from '../hooks/usePresets';

export default function Dashboard({ presetsHook, midiState, isLiveMode = false, onAddNew, onEdit }) {
  const { presets, toggleFavorite, deletePreset, exportPresets, importPresets } = presetsHook;
  const { sendVoiceChange } = midiState;

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeVoiceId, setActiveVoiceId] = useState(null);

  const filteredPresets = presets.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesLive = !isLiveMode || p.favorite;
    return matchesSearch && matchesCategory && matchesLive;
  });

  const handleVoiceClick = (preset) => {
    const success = sendVoiceChange(preset.msb, preset.lsb, preset.program);
    if (success) {
      setActiveVoiceId(preset.id);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      importPresets(file).then(() => {
        alert("Presets imported successfully!");
      }).catch(err => {
        alert("Import failed: " + err.message);
      });
    }
  };

  return (
    <div className="space-y-8">
      {!isLiveMode && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold">Voice Presets</h2>
            <p className="text-slate-400 mt-1">Manage and select your keyboard voices</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <label className="secondary-button cursor-pointer flex-1 md:flex-none">
              <Upload size={18} /> Import
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <button className="secondary-button flex-1 md:flex-none" onClick={exportPresets}>
              <Download size={18} /> Export
            </button>
            <button className="premium-button flex-1 md:flex-none" onClick={onAddNew}>
              <Plus size={18} /> New Voice
            </button>
          </div>
        </div>
      )}

      {isLiveMode && (
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400">
            <Music size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-bold">Live Performance</h2>
            <p className="text-slate-400 mt-1 text-lg">One-click access to your favorite voices</p>
          </div>
        </div>
      )}

      {!isLiveMode && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Search voices..." 
              className="input-field pl-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 pb-2">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {filteredPresets.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400">
          <Music size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No voices found matching your criteria.</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${isLiveMode ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          {filteredPresets.map(preset => (
            <div 
              key={preset.id}
              onClick={() => handleVoiceClick(preset)}
              className={`group voice-btn cursor-pointer ${activeVoiceId === preset.id ? 'active' : ''} ${isLiveMode ? 'min-h-[160px] justify-center items-center text-center' : ''}`}
            >
              <div className={`flex justify-between items-start w-full ${isLiveMode ? 'absolute top-4 left-0 px-4' : ''}`}>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">
                  {preset.category}
                </span>
                {!isLiveMode && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="text-slate-400 hover:text-white transition-colors"
                      onClick={(e) => { e.stopPropagation(); onEdit(preset); }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="text-slate-400 hover:text-red-400 transition-colors"
                      onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              <h3 className={`${isLiveMode ? 'text-2xl mt-4' : 'text-xl mt-2'} font-bold text-white`}>
                {preset.name}
              </h3>
              
              <div className={`text-sm text-slate-400 ${isLiveMode ? 'mt-2' : 'mt-1'}`}>
                MSB: {preset.msb} • LSB: {preset.lsb} • PC: {preset.program}
              </div>

              {!isLiveMode && (
                <button 
                  className="absolute bottom-4 right-4 text-slate-500 hover:text-pink-500 transition-colors"
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(preset.id); }}
                >
                  <Heart size={20} className={preset.favorite ? 'fill-pink-500 text-pink-500' : ''} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
