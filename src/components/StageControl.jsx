import React, { useState, useEffect, useRef } from 'react';
import { Music, Plus, Trash2, Search, X, Sparkles, Check, Play, Keyboard } from 'lucide-react';

export default function StageControl({ presetsHook, midiState }) {
  const { presets } = presetsHook;
  const { sendVoiceChange, isConnected } = midiState;

  // Initialize slots from localStorage or empty
  const [slots, setSlots] = useState(() => {
    const saved = localStorage.getItem('midi_stage_slots');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.length < 9) {
            return [...parsed, ...Array(9 - parsed.length).fill(null)];
          }
          return parsed.slice(0, 9);
        }
      } catch (e) {
        console.error('Error parsing stage slots', e);
      }
    }
    return Array(9).fill(null);
  });

  const [activeSlotIndex, setActiveSlotIndex] = useState(null);
  const [selectorSlotIndex, setSelectorSlotIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [flashSlot, setFlashSlot] = useState(null);

  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Save slots to localStorage when changed
  useEffect(() => {
    localStorage.setItem('midi_stage_slots', JSON.stringify(slots));
  }, [slots]);

  // Focus search input when selector is opened
  useEffect(() => {
    if (selectorSlotIndex !== null && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [selectorSlotIndex]);

  // Click outside to close selector dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSelectorSlotIndex(null);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard listener for hotkeys '1', '2', '3', '4'
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if user is typing in any input field or textarea
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.isContentEditable
      );
      if (isTyping) return;

      const key = e.key;
      if (key >= '1' && key <= '9') {
        const slotIdx = parseInt(key) - 1;
        e.preventDefault();
        triggerSlot(slotIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slots]); // Re-run effect when slots change to ensure correct voice details are closed-over

  const triggerSlot = (index) => {
    const preset = slots[index];
    if (!preset) return;

    // Send MIDI program change
    const success = sendVoiceChange(preset.msb, preset.lsb, preset.program, preset.name);
    
    // Set active slot and flash visual effect
    setActiveSlotIndex(index);
    setFlashSlot(index);
    setTimeout(() => setFlashSlot(null), 300);
  };

  const registerVoice = (slotIndex, preset) => {
    const updatedSlots = [...slots];
    updatedSlots[slotIndex] = preset;
    setSlots(updatedSlots);
    setSelectorSlotIndex(null);
    setSearchTerm('');
  };

  const clearSlot = (slotIndex, e) => {
    e.stopPropagation(); // Prevent triggering slot on click
    const updatedSlots = [...slots];
    updatedSlots[slotIndex] = null;
    setSlots(updatedSlots);
    if (activeSlotIndex === slotIndex) {
      setActiveSlotIndex(null);
    }
  };

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
      case 'World': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/15';
      case 'Drums': return 'bg-red-500/10 text-red-400 border-red-500/15';
      case 'SFX': return 'bg-purple-500/10 text-purple-400 border-purple-500/15';
      case 'Pad': return 'bg-pink-500/10 text-pink-400 border-pink-500/15';
      case 'Percussion': return 'bg-lime-500/10 text-lime-400 border-lime-500/15';
      case 'Custom': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/15';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/15';
    }
  };

  // Filter presets for dropdown selector
  const filteredPresets = presets.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.voiceNo !== null && p.voiceNo !== undefined && String(p.voiceNo).includes(searchTerm))
  ).slice(0, 15); // Show top 15 matches for quick UI selection

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Stage Control
          </h2>
          <p className="text-slate-400 mt-1 text-sm">
            Quickly register and trigger 9 performance voices using laptop keys <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs">1</kbd> to <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs">9</kbd>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Keyboard size={16} className="text-indigo-400" />
          <span>Laptop Keyboard Mapped</span>
        </div>
      </div>

      {/* Warning if MIDI is not connected */}
      {!isConnected && (
        <div className="glass-card p-4 border-amber-500/20 bg-amber-500/5 flex items-center gap-3 text-amber-300">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-xs font-medium">MIDI Output device is not connected. Connect a device in the "Devices" tab to send voice change commands.</span>
        </div>
      )}

      {/* Grid of 9 Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {slots.map((preset, index) => {
          const isActive = activeSlotIndex === index;
          const isFlashed = flashSlot === index;
          const isSelecting = selectorSlotIndex === index;

          return (
            <div
              key={index}
              onClick={() => preset && triggerSlot(index)}
              className={`relative group voice-btn min-h-[220px] p-6 transition-all duration-300 flex flex-col justify-between overflow-visible border cursor-pointer ${
                isActive 
                  ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_35px_rgba(99,102,241,0.2)]' 
                  : 'bg-[#0e111a]/45 border-white/5 hover:border-white/10'
              } ${isFlashed ? 'scale-[0.98] ring-2 ring-indigo-400/50' : ''}`}
            >
              {/* Upper Section of Slot Card */}
              <div className="flex justify-between items-start w-full relative z-10">
                {/* Hotkey Number Badge */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all border ${
                    isActive
                      ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                      : 'bg-slate-900/80 text-slate-400 border-white/5 group-hover:text-slate-200 group-hover:border-white/10'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Laptop Key</span>
                    <span className="text-xs font-bold text-slate-300">Slot {index + 1}</span>
                  </div>
                </div>

                {/* Clear / Reset Button if Registered */}
                {preset && (
                  <button
                    onClick={(e) => clearSlot(index, e)}
                    className="p-2 rounded-xl bg-white/3 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 transition-all duration-200 active:scale-95"
                    title="Clear Registered Voice"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {/* Middle Section: Slot Content (Empty vs Registered) */}
              <div className="my-6 relative z-10 flex-1 flex items-center justify-center">
                {preset ? (
                  <div className="w-full space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${getCategoryColor(preset.category)}`}>
                        {preset.category}
                      </span>
                      {preset.voiceNo !== null && preset.voiceNo !== undefined && (
                        <span className="text-[10px] font-bold bg-slate-950 text-slate-400 border border-white/5 px-2 py-0.5 rounded-md">
                          #{String(preset.voiceNo).padStart(3, '0')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-extrabold text-white tracking-tight leading-tight truncate">
                        {preset.name}
                      </h3>
                      {isActive && (
                        <div className="flex gap-[2px] items-end shrink-0 h-4 text-indigo-400">
                          <span className="wave-bar"></span>
                          <span className="wave-bar"></span>
                          <span className="wave-bar"></span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 items-center pt-1">
                      {preset.msb !== null && preset.lsb !== null && preset.program !== null ? (
                        <>
                          <span className="bg-slate-950 border border-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-slate-500">
                            MSB: {preset.msb}
                          </span>
                          <span className="bg-slate-950 border border-white/5 px-2 py-0.5 rounded text-[10px] font-mono text-slate-500">
                            LSB: {preset.lsb}
                          </span>
                          <span className="bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded text-[10px] font-mono text-indigo-400">
                            PC: {preset.program}
                          </span>
                        </>
                      ) : (
                        <span className="bg-amber-500/5 border border-amber-500/10 px-2.5 py-0.5 rounded text-[10px] font-bold text-amber-500">
                          Keyboard-Internal Voice
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    {!isSelecting ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectorSlotIndex(index);
                        }}
                        className="w-full py-4 border border-dashed border-white/10 hover:border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-indigo-500/5 transition-all text-slate-500 hover:text-indigo-400 group/btn"
                      >
                        <div className="p-2 rounded-full bg-slate-950/60 border border-white/5 group-hover/btn:border-indigo-500/20 group-hover/btn:text-indigo-400 transition-all">
                          <Plus size={16} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">Register Voice Preset</span>
                      </button>
                    ) : (
                      // Inline Selector Form with Ref for clicks
                      <div 
                        ref={dropdownRef}
                        className="w-full bg-[#111421] border border-white/10 rounded-2xl p-4 shadow-2xl relative z-30 space-y-3 animate-fade-in"
                        onClick={(e) => e.stopPropagation()} // Prevent clicking slot from triggering
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Register to Slot {index + 1}</span>
                          <button 
                            onClick={() => { setSelectorSlotIndex(null); setSearchTerm(''); }}
                            className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                          <input 
                            ref={searchInputRef}
                            type="text" 
                            placeholder="Search presets..." 
                            className="input-field pl-9 bg-slate-950/80 text-xs py-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="max-h-[140px] overflow-y-auto space-y-1 pr-1">
                          {filteredPresets.length === 0 ? (
                            <p className="text-[11px] text-slate-600 text-center py-4">No matching presets found</p>
                          ) : (
                            filteredPresets.map(p => (
                              <button
                                key={p.id}
                                onClick={() => registerVoice(index, p)}
                                className="w-full flex items-center justify-between text-left p-2 rounded-xl text-xs hover:bg-indigo-600/20 hover:text-white transition-colors group/item text-slate-300"
                              >
                                <div className="flex flex-col min-w-0">
                                  <span className="font-extrabold truncate">{p.name}</span>
                                  <span className="text-[9px] text-slate-500 font-bold group-hover/item:text-slate-400">
                                    {p.category} {p.voiceNo && `| #${p.voiceNo}`}
                                  </span>
                                </div>
                                <div className="text-[9px] text-slate-600 font-mono flex gap-1 group-hover/item:text-indigo-400">
                                  <span>{p.msb}-{p.lsb}-{p.program}</span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Instructions / Info */}
              {preset && (
                <div className="border-t border-white/5 pt-3 mt-1 flex justify-between items-center w-full z-10 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-white/5 text-[9px] font-mono">1-9</kbd> Key or Click to Play
                  </span>
                  {isActive && (
                    <span className="text-indigo-400 font-extrabold tracking-wider uppercase animate-pulse flex items-center gap-1">
                      <Sparkles size={10} /> Active
                    </span>
                  )}
                </div>
              )}

              {/* Ambient Glow */}
              <div className={`absolute bottom-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none transition-all duration-300 ${
                isActive ? 'bg-indigo-500/10' : 'bg-transparent group-hover:bg-indigo-500/[0.01]'
              }`}></div>
            </div>
          );
        })}
      </div>

      {/* Guide details */}
      <div className="glass-card p-6 border-white/5 bg-white/[0.01] flex flex-col md:flex-row gap-5 items-start">
        <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 rounded-2xl">
          <Play size={20} />
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-slate-200">How to use Stage Control:</h4>
          <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5 leading-relaxed">
            <li>Click <strong className="text-slate-300">"Register Voice Preset"</strong> on any slot, search and select a preset to register a sound patch.</li>
            <li>Press keys <kbd className="px-1 py-0.5 bg-slate-900 border border-white/5 rounded text-[10px]">1</kbd> to <kbd className="px-1 py-0.5 bg-slate-900 border border-white/5 rounded text-[10px]">9</kbd> on your laptop keyboard to instantly switch to that voice.</li>
            <li>You can also click on the active voice card to send the MIDI program change to your synthesizer.</li>
            <li>Click the <strong className="text-slate-300">Trash</strong> icon to unregister the voice, allowing you to choose another one.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
