import React, { useState } from 'react';
import { Search, Plus, Edit3, Trash2, Heart, Music, Cable, Star, Sparkles, UploadCloud, DownloadCloud, AlertTriangle, RotateCcw } from 'lucide-react';
import { CATEGORIES } from '../hooks/usePresets';

export default function Dashboard({ presetsHook, midiState, isLiveMode = false, onAddNew, onEdit }) {
  const { presets, toggleFavorite, deletePreset, exportPresets, importPresets, loadDefaultPresets } = presetsHook;
  const { sendVoiceChange, isConnected, outputs, selectedOutputId } = midiState;

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

  const handleLoadDefaults = () => {
    if (confirm("Would you like to import all missing default voices? This will NOT delete your custom voices. (To completely reset all voices to default, click Cancel and we will ask if you want to reset instead).")) {
      loadDefaultPresets(false);
      alert("Missing default voices added successfully!");
    } else {
      if (confirm("Would you like to completely RESET all voices to factory defaults? This will erase all custom voices.")) {
        loadDefaultPresets(true);
        alert("All presets reset to factory default!");
      }
    }
  };

  const selectedOutput = outputs?.find(o => o.id === selectedOutputId);
  const deviceName = selectedOutput ? (selectedOutput.name || 'MIDI Out') : 'Disconnected';
  const activeVoiceName = presets.find(p => p.id === activeVoiceId)?.name || 'None';
  const totalFavorites = presets.filter(p => p.favorite).length;

  // Category Theme Helper
  const getCategoryColor = (category) => {
    switch(category) {
      case 'Piano': return 'bg-rose-500/10 text-rose-400 border-rose-500/15';
      case 'Organ': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/15';
      case 'Strings': return 'bg-violet-500/10 text-violet-400 border-violet-500/15';
      case 'Choir': return 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/15';
      case 'Indian': return 'bg-amber-500/10 text-amber-400 border-amber-500/15';
      case 'Guitar': return 'bg-blue-500/10 text-blue-400 border-blue-500/15';
      case 'Bass': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15';
      case 'Brass': return 'bg-orange-500/10 text-orange-400 border-orange-500/15';
      case 'Flute': return 'bg-teal-500/10 text-teal-400 border-teal-500/15';
      case 'Pad': return 'bg-pink-500/10 text-pink-400 border-pink-500/15';
      case 'Custom': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/15';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/15';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Section */}
      {!isLiveMode ? (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Voice Presets
            </h2>
            <p className="text-slate-400 mt-1 text-sm">Browse, filter, and organize your synthesizer sound patches</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button className="secondary-button text-xs flex-1 md:flex-none" onClick={handleLoadDefaults}>
              <RotateCcw size={16} /> Load Defaults
            </button>
            <label className="secondary-button text-xs cursor-pointer flex-1 md:flex-none">
              <UploadCloud size={16} /> Import
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <button className="secondary-button text-xs flex-1 md:flex-none" onClick={exportPresets}>
              <DownloadCloud size={16} /> Export
            </button>
            <button className="premium-button text-xs flex-1 md:flex-none" onClick={onAddNew}>
              <Plus size={16} /> New Voice
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-fuchsia-500/20 to-purple-500/10 text-fuchsia-400 border border-fuchsia-500/20 shadow-lg shadow-fuchsia-500/5">
              <Music size={26} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Live Performance
              </h2>
              <p className="text-slate-400 mt-1 text-sm">Instantly change patches during live play with favorite presets</p>
            </div>
          </div>
        </div>
      )}

      {/* Premium Dashboard Quick Stats (Standard Mode Only) */}
      {!isLiveMode && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 flex items-center gap-4 bg-white/2 border-white/3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
              <Cable size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Device Connection</span>
              <span className="text-sm font-semibold text-slate-200 truncate">{isConnected ? deviceName : 'Offline'}</span>
            </div>
          </div>

          <div className="glass-card p-4 flex items-center gap-4 bg-white/2 border-white/3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/15">
              <Sparkles size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Patch</span>
              <span className="text-sm font-semibold text-purple-300 truncate">{activeVoiceName}</span>
            </div>
          </div>

          <div className="glass-card p-4 flex items-center gap-4 bg-white/2 border-white/3">
            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/15">
              <Music size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Voices</span>
              <span className="text-sm font-semibold text-slate-200 truncate">{presets.length} Presets</span>
            </div>
          </div>

          <div className="glass-card p-4 flex items-center gap-4 bg-white/2 border-white/3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/15">
              <Star size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Favorites (Live)</span>
              <span className="text-sm font-semibold text-slate-200 truncate">{totalFavorites} Patches</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      {!isLiveMode && (
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by voice name..." 
              className="input-field pl-11 bg-slate-950/30 text-sm py-2.5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-x-auto hide-scrollbar">
            <div className="flex gap-2.5 pb-2">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold uppercase tracking-wide transition-all border ${
                    activeCategory === cat 
                      ? 'bg-indigo-600/90 text-white border-indigo-500 shadow-md shadow-indigo-500/10' 
                      : 'bg-[#151926]/40 text-slate-400 hover:text-slate-200 hover:bg-[#1a2033]/60 border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preset Grid Cards */}
      {filteredPresets.length === 0 ? (
        <div className="glass-card p-16 text-center border-dashed border-white/5 bg-white/1 flex flex-col items-center justify-center">
          <div className="p-4 rounded-full bg-slate-900/60 text-slate-500 border border-white/5 mb-4">
            <Music size={36} className="opacity-40" />
          </div>
          <p className="text-slate-400 font-semibold text-sm">No voices found matching your criteria</p>
          <p className="text-slate-600 text-xs mt-1">Try selecting another category or add a new voice patch.</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${isLiveMode ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
          {filteredPresets.map(preset => {
            const isActive = activeVoiceId === preset.id;
            return (
              <div 
                key={preset.id}
                onClick={() => handleVoiceClick(preset)}
                className={`group voice-btn relative border ${isActive ? 'active' : 'border-white/5'} ${isLiveMode ? 'min-h-[140px] justify-between p-5' : ''}`}
              >
                {/* Header Tag and Action Overlay */}
                <div className="flex justify-between items-center w-full z-10">
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md border ${getCategoryColor(preset.category)}`}>
                    {preset.category}
                  </span>
                  
                  {/* Action overlay that reveals on card hover */}
                  {!isLiveMode && (
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all active:scale-90"
                        onClick={(e) => { e.stopPropagation(); onEdit(preset); }}
                      >
                        <Edit3 size={13} />
                      </button>
                      <button 
                        className="p-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border border-white/5 transition-all active:scale-90"
                        onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Voice Title Name & Animated Active Signal */}
                <div className="flex items-center justify-between gap-2 z-10">
                  <h3 className={`font-extrabold tracking-tight truncate text-white ${isLiveMode ? 'text-lg md:text-xl' : 'text-lg mt-1'}`}>
                    {preset.name}
                  </h3>
                  
                  {/* Soundwave animation for active voice */}
                  {isActive && (
                    <div className="flex gap-[2px] items-end shrink-0 h-4 text-indigo-400 mr-1">
                      <span className="wave-bar"></span>
                      <span className="wave-bar"></span>
                      <span className="wave-bar"></span>
                      <span className="wave-bar"></span>
                    </div>
                  )}
                </div>
                
                {/* Technical values (MSB LSB PC) */}
                <div className="text-xs text-slate-400 font-medium z-10 flex gap-2 items-center">
                  <span className="bg-white/2 border border-white/5 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400">
                    M: {preset.msb}
                  </span>
                  <span className="bg-white/2 border border-white/5 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400">
                    L: {preset.lsb}
                  </span>
                  <span className="bg-indigo-500/5 border border-indigo-500/15 px-1.5 py-0.5 rounded text-[10px] font-bold text-indigo-300">
                    PC: {preset.program}
                  </span>
                </div>

                {/* Favorite toggle star */}
                {!isLiveMode && (
                  <button 
                    className="absolute bottom-4 right-4 text-slate-600 hover:text-amber-400 transition-colors z-10 hover:scale-110 active:scale-90"
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(preset.id); }}
                  >
                    <Heart size={18} className={preset.favorite ? 'fill-pink-500 text-pink-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]' : ''} />
                  </button>
                )}
                
                {/* Ambient glow backdrop inside the card for hover/active feedback */}
                <div className={`absolute bottom-0 right-0 w-24 h-24 rounded-full blur-[45px] transition-all duration-300 pointer-events-none ${isActive ? 'bg-indigo-500/10' : 'bg-transparent group-hover:bg-white/[0.01]'}`}></div>
              </div>
            );
          })}
        </div>
      )}

      {/* Warning Box at the bottom */}
      <div className="glass-card p-5 border-amber-500/20 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.02)] mt-8">
        <div className="flex items-start gap-3 text-amber-200">
          <AlertTriangle className="shrink-0 text-amber-400 mt-0.5" size={18} />
          <div>
            <h4 className="font-bold text-sm text-amber-400 mb-1">Yamaha Screen behavior</h4>
            <p className="text-xs text-amber-300/80 leading-relaxed">
              Yamaha PSR series instruments process MIDI voice adjustments inside their sound engines directly. Consequently, the keyboard's physical LCD screen may not change to show the new voice name. Play the keyboard keys to verify the sound changed internally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

