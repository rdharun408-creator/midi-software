import React, { useState, useEffect, useCallback } from 'react';
import { Play, Square, Plus, Trash2, Edit3, Save, FolderOpen, Sliders, Volume2, FolderPlus, Music, RotateCcw, X, Check, ArrowRight, Lock, Unlock, UploadCloud, DownloadCloud, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';

export default function LiveBanks({ presetsHook, midiState, isLocked, setIsLocked }) {
  const { presets } = presetsHook;
  const { 
    bpm, 
    setBpm, 
    midiClockSync,
    setMidiClockSync,
    transpose, 
    sendMasterTranspose, 
    sendVoiceChange, 
    isClockRunning, 
    sendMidiStart, 
    sendMidiStop,
    beatPlayerMode
  } = midiState;

  // Performance Banks State (Persisted in localStorage)
  const [banks, setBanks] = useState([]);
  const [activeBankId, setActiveBankId] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBankId, setEditingBankId] = useState(null);
  const [bankName, setBankName] = useState('');
  const [bankBpm, setBankBpm] = useState(120);
  const [bankTranspose, setBankTranspose] = useState(0);
  
  // Array of 6 voice assignments inside the bank editor
  const [editorVoices, setEditorVoices] = useState(
    Array.from({ length: 6 }, () => ({
      name: '',
      msb: 0,
      lsb: 0,
      program: 1,
      presetId: '' // reference to selected preset from presetsHook
    }))
  );

  // Active Voice selection state in the live deck
  const [activeVoiceIndex, setActiveVoiceIndex] = useState(null);

  // Zoom/Fit-Screen Mode State
  const [isZoomed, setIsZoomed] = useState(false);

  // Lock body scroll when zoomed
  useEffect(() => {
    if (isZoomed) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isZoomed]);

  // Load banks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('midi_performance_banks');
    if (stored) {
      const parsed = JSON.parse(stored);
      setBanks(parsed);
      if (parsed.length > 0) {
        // Auto-activate the first bank
        setActiveBankId(parsed[0].id);
      }
    } else {
      // Load some initial demo banks using default voices if they exist
      const indianV = presets.find(p => p.category === 'Indian') || presets[0];
      const pianoV = presets.find(p => p.category === 'Piano') || presets[1] || presets[0];
      const synthV = presets.find(p => p.category === 'Synth') || presets[2] || presets[0];
      
      const demoVoices = [
        { name: indianV?.name || 'Harmonium', msb: indianV?.msb ?? 0, lsb: indianV?.lsb ?? 113, program: indianV?.program ?? 21 },
        { name: pianoV?.name || 'Grand Piano', msb: pianoV?.msb ?? 0, lsb: pianoV?.lsb ?? 112, program: pianoV?.program ?? 1 },
        { name: synthV?.name || 'Galaxy EP', msb: synthV?.msb ?? 0, lsb: synthV?.lsb ?? 114, program: synthV?.program ?? 5 },
        { name: 'Sitar', msb: 0, lsb: 112, program: 105 },
        { name: 'Bansuri', msb: 51, lsb: 0, program: 11 },
        { name: 'Tabla Kit 1', msb: 126, lsb: 0, program: 116 }
      ];

      const initialDemoBanks = [
        {
          id: 'demo-1',
          name: 'Classic Indian Set',
          bpm: 115,
          transpose: 0,
          voices: demoVoices
        },
        {
          id: 'demo-2',
          name: 'Bhangra Medley',
          bpm: 135,
          transpose: 2,
          voices: [
            { name: 'Sitar 1', msb: 0, lsb: 112, program: 105 },
            { name: 'Sweet Bansuri', msb: 51, lsb: 0, program: 11 },
            { name: 'Harmonium Single', msb: 0, lsb: 113, program: 21 },
            { name: 'Indian Kit 1', msb: 126, lsb: 1, program: 109 },
            { name: 'CP80 Piano', msb: 0, lsb: 113, program: 3 },
            { name: 'Analog Kit', msb: 127, lsb: 0, program: 26 }
          ]
        }
      ];

      localStorage.setItem('midi_performance_banks', JSON.stringify(initialDemoBanks));
      setBanks(initialDemoBanks);
      setActiveBankId(initialDemoBanks[0].id);
    }
  }, [presets]);

  const activeBank = banks.find(b => b.id === activeBankId);

  // Tap Tempo state & handler
  const [tapTimes, setTapTimes] = useState([]);
  const handleTapTempo = useCallback(() => {
    const now = performance.now();
    setTapTimes((prevTapTimes) => {
      const filtered = [...prevTapTimes, now].filter(t => now - t < 2000);
      if (filtered.length > 1) {
        const intervals = [];
        for (let i = 1; i < filtered.length; i++) {
          intervals.push(filtered[i] - filtered[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const calculatedBpm = Math.round(60000 / avgInterval);
        if (calculatedBpm >= 40 && calculatedBpm <= 240) {
          setBpm(calculatedBpm);
        }
      }
      return filtered;
    });
  }, [setBpm]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.tagName === 'SELECT' || 
        activeEl.isContentEditable
      )) {
        return;
      }

      if (e.key >= '1' && e.key <= '6') {
        const idx = parseInt(e.key, 10) - 1;
        if (activeBank && activeBank.voices && activeBank.voices[idx]) {
          e.preventDefault();
          handleVoicePadClick(activeBank.voices[idx], idx);
        }
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTapTempo();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeBank, activeVoiceIndex, handleTapTempo]);

  // Activate a bank preset (loads tempo, transpose SysEx, and resets active voice pad)
  const handleActivateBank = (bank) => {
    setActiveBankId(bank.id);
    setBpm(bank.bpm);
    sendMasterTranspose(bank.transpose);
    setActiveVoiceIndex(null); // Reset highlighted voice pad
    
    // Auto-load the first voice of the activated bank to the keyboard
    if (bank.voices && bank.voices[0]) {
      const firstVoice = bank.voices[0];
      sendVoiceChange(firstVoice.msb, firstVoice.lsb, firstVoice.program, firstVoice.name);
      setActiveVoiceIndex(0);
    }

    // Scroll smoothly to the top so the active live register card is in view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Trigger a voice change on the keyboard from one of the 6 quick-access pads
  const handleVoicePadClick = (voice, index) => {
    const success = sendVoiceChange(voice.msb, voice.lsb, voice.program, voice.name);
    if (success || voice.msb === null) {
      setActiveVoiceIndex(index);
    }
  };

  // Open the Modal to Add a new bank
  const handleOpenAddModal = () => {
    setEditingBankId(null);
    setBankName('');
    setBankBpm(bpm);
    setBankTranspose(transpose);
    
    // Auto-populate 6 voice inputs with default/first voices from the presets list
    const defaults = Array.from({ length: 6 }, (_, i) => {
      const preset = presets[i % presets.length] || { name: 'Grand Piano', msb: 0, lsb: 112, program: 1, id: '' };
      return {
        name: preset.name,
        msb: preset.msb ?? 0,
        lsb: preset.lsb ?? 112,
        program: preset.program ?? 1,
        presetId: preset.id || ''
      };
    });
    setEditorVoices(defaults);
    setIsModalOpen(true);
  };

  // Open the Modal to Edit an existing bank
  const handleOpenEditModal = (bank, e) => {
    e.stopPropagation(); // Avoid triggering activation
    setEditingBankId(bank.id);
    setBankName(bank.name);
    setBankBpm(bank.bpm);
    setBankTranspose(bank.transpose);
    
    // Map bank voices to editor form state
    const mappedVoices = bank.voices.map(v => {
      // Try to find matching preset from library
      const matched = presets.find(p => p.msb === v.msb && p.lsb === v.lsb && p.program === v.program);
      return {
        name: v.name,
        msb: v.msb,
        lsb: v.lsb,
        program: v.program,
        presetId: matched ? matched.id : 'custom'
      };
    });
    setEditorVoices(mappedVoices);
    setIsModalOpen(true);
  };

  // Sync editor voice details when selecting a preset from the dropdown list
  const handleEditorVoiceSelect = (index, presetId) => {
    const updated = [...editorVoices];
    if (presetId === 'custom') {
      updated[index] = { ...updated[index], presetId: 'custom' };
    } else {
      const selectedPreset = presets.find(p => p.id === presetId);
      if (selectedPreset) {
        updated[index] = {
          name: selectedPreset.name,
          msb: selectedPreset.msb ?? 0,
          lsb: selectedPreset.lsb ?? 112,
          program: selectedPreset.program ?? 1,
          presetId: selectedPreset.id
        };
      }
    }
    setEditorVoices(updated);
  };

  // Handle manual field input updates for custom voices
  const handleEditorVoiceManualChange = (index, field, value) => {
    const updated = [...editorVoices];
    updated[index] = {
      ...updated[index],
      [field]: field === 'name' ? value : parseInt(value, 10) || 0
    };
    setEditorVoices(updated);
  };

  // Save bank (Create or Update)
  const handleSaveBank = (e) => {
    e.preventDefault();
    if (!bankName.trim()) return;

    // Validate and clean voices
    const cleanedVoices = editorVoices.map(v => ({
      name: v.name.trim() || 'Instrument Slot',
      msb: v.msb === null || v.presetId === 'internal' ? null : parseInt(v.msb, 10),
      lsb: v.lsb === null || v.presetId === 'internal' ? null : parseInt(v.lsb, 10),
      program: v.program === null || v.presetId === 'internal' ? null : parseInt(v.program, 10)
    }));

    let updatedBanks;
    if (editingBankId) {
      // Update existing
      updatedBanks = banks.map(b => 
        b.id === editingBankId 
          ? { ...b, name: bankName.trim(), bpm: parseInt(bankBpm, 10), transpose: parseInt(bankTranspose, 10), voices: cleanedVoices }
          : b
      );
    } else {
      // Add new
      const newBank = {
        id: Date.now().toString(),
        name: bankName.trim(),
        bpm: parseInt(bankBpm, 10) || 120,
        transpose: parseInt(bankTranspose, 10) || 0,
        voices: cleanedVoices
      };
      updatedBanks = [...banks, newBank];
    }

    localStorage.setItem('midi_performance_banks', JSON.stringify(updatedBanks));
    setBanks(updatedBanks);
    setIsModalOpen(false);
    
    // Auto-activate if it is the first or just updated
    if (!editingBankId) {
      setActiveBankId(updatedBanks[updatedBanks.length - 1].id);
    } else if (activeBankId === editingBankId) {
      // Re-trigger activation to refresh loaded states
      const activated = updatedBanks.find(b => b.id === editingBankId);
      if (activated) handleActivateBank(activated);
    }
  };

  // Delete a bank preset
  const handleDeleteBank = (id, e) => {
    e.stopPropagation(); // Avoid triggering activation
    if (confirm("Are you sure you want to delete this bank?")) {
      const remaining = banks.filter(b => b.id !== id);
      localStorage.setItem('midi_performance_banks', JSON.stringify(remaining));
      setBanks(remaining);
      if (activeBankId === id) {
        setActiveBankId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  // Export all performance banks to a JSON file
  const handleExportBanks = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(banks));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "midi_performance_banks.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import performance banks from a JSON file
  const handleImportBanks = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            const cleanImported = imported.map(b => ({
              id: b.id || Date.now().toString() + Math.random().toString(36).substring(2, 7),
              name: b.name || "Imported Bank",
              bpm: parseInt(b.bpm, 10) || 120,
              transpose: parseInt(b.transpose, 10) || 0,
              voices: Array.isArray(b.voices) ? b.voices.map(v => ({
                name: v.name || "Voice Slot",
                msb: v.msb === null ? null : (parseInt(v.msb, 10) || 0),
                lsb: v.lsb === null ? null : (parseInt(v.lsb, 10) || 0),
                program: v.program === null ? null : (parseInt(v.program, 10) || 0)
              })) : []
            }));
            
            const updatedBanks = [...banks, ...cleanImported];
            localStorage.setItem('midi_performance_banks', JSON.stringify(updatedBanks));
            setBanks(updatedBanks);
            if (updatedBanks.length > 0 && !activeBankId) {
              setActiveBankId(updatedBanks[0].id);
            }
            alert("Performance banks imported successfully!");
          } else {
            alert("Invalid bank format. Expected an array of banks.");
          }
        } catch (err) {
          alert("Import failed: " + err.message);
        }
      };
      reader.readAsText(file);
    }
};

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      
      {/* Floating Action Button in the bottom-right corner for locking/unlocking navigation */}
      <div className="fixed right-6 bottom-24 z-50">
        {isLocked ? (
          <button
            onClick={() => setIsLocked(false)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-full border border-yellow-300/50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black uppercase tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:from-amber-400 hover:via-yellow-300 hover:to-amber-500 hover:scale-110 active:scale-95 transition-all text-xs animate-bounce animate-duration-1000"
            title="Unlock Navigation"
          >
            <Unlock size={14} fill="currentColor" />
            <span>Unlock</span>
          </button>
        ) : (
          <button
            onClick={() => setIsLocked(true)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-full border border-yellow-300/50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black uppercase tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:from-amber-400 hover:via-yellow-300 hover:to-amber-500 hover:scale-110 active:scale-95 transition-all text-xs animate-bounce animate-duration-1000"
            title="Lock Navigation"
          >
            <Lock size={14} fill="currentColor" />
            <span>Lock</span>
          </button>
        )}
      </div>

      {/* Navigation Lock Warning Banner */}
      {isLocked && (
        <div className="bg-amber-500/10 border border-amber-500/25 text-amber-400 px-4 py-3.5 rounded-xl shadow-lg flex items-center gap-3 text-left animate-pulse">
          <Lock size={18} className="text-amber-500 flex-shrink-0" />
          <span className="text-xs font-semibold">Live Navigation Locked — Access restricted to the Performance Banks page. Unlock to visit other pages.</span>
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 flex items-center gap-3">
            <FolderOpen className="text-indigo-400" size={32} /> Performance Banks
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Organize registers of 6 voices, tempo, and transpose values for live gig switching</p>
        </div>
        
        {!isLocked && (
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <label className="secondary-button text-xs cursor-pointer flex-1 md:flex-none flex items-center justify-center gap-2 py-2.5">
              <UploadCloud size={16} /> Import Banks
              <input type="file" accept=".json" className="hidden" onChange={handleImportBanks} />
            </label>
            
            <button 
              onClick={handleExportBanks}
              className="secondary-button text-xs flex items-center justify-center gap-2 py-2.5 flex-1 md:flex-none"
              disabled={banks.length === 0}
            >
              <DownloadCloud size={16} /> Export Banks
            </button>

            <button 
              className="premium-button text-xs flex items-center gap-2 justify-center flex-1 md:flex-none"
              onClick={handleOpenAddModal}
            >
              <FolderPlus size={16} /> New Live Bank
            </button>
          </div>
        )}
      </div>

      {/* 1. MAIN PERFORMANCE DECK (THE ACTIVE REGISTER STATE) */}
      {activeBank ? (
        <div className={isZoomed 
          ? "fixed inset-0 z-50 bg-gradient-to-br from-[#0c0e17] via-[#05060b] to-[#120b1c] p-6 flex flex-col justify-between overflow-hidden" 
          : "glass-card p-8 bg-gradient-to-br from-indigo-950/20 via-slate-950/40 to-purple-950/20 border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.05)] relative overflow-hidden group"
        }>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] bg-indigo-500/10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-[100px] bg-purple-500/10 pointer-events-none"></div>

          {/* Active Bank Header Info */}
          <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 ${isZoomed ? 'pb-3 mb-4' : 'pb-6 mb-8'} relative z-10`}>
            <div>
              <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                Active Live Register
              </span>
              <h3 className="text-2xl font-black text-white mt-3 flex items-center gap-2">
                {activeBank.name}
              </h3>
            </div>

            {/* Quick Stats & Local Transport Duo */}
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/5 items-center">
                <div className="px-3.5 py-2 text-center border-r border-white/5">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Tempo</span>
                  <span className="text-sm font-extrabold text-slate-200">{activeBank.bpm} BPM</span>
                </div>
                <div className="px-3.5 py-2 text-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Transpose</span>
                  <span className={`text-sm font-extrabold ${activeBank.transpose !== 0 ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {activeBank.transpose > 0 ? `+${activeBank.transpose}` : activeBank.transpose}
                  </span>
                </div>
              </div>

              {/* Local Start/Stop and Zoom buttons */}
              <div className="flex gap-2 flex-1 lg:flex-none items-center">
                {!isClockRunning ? (
                  <button 
                    onClick={() => sendMidiStart()}
                    className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold flex items-center justify-center gap-2 flex-1 lg:flex-none shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02] active:scale-95 text-xs"
                  >
                    <Play size={14} fill="white" /> START
                  </button>
                ) : (
                  <button 
                    onClick={sendMidiStop}
                    className="px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold flex items-center justify-center gap-2 flex-1 lg:flex-none shadow-lg shadow-rose-500/10 transition-all hover:scale-[1.02] active:scale-95 text-xs"
                  >
                    <Square size={14} fill="white" /> STOP
                  </button>
                )}

                {/* Zoom / Fullscreen Fit Toggle button */}
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-600 hover:border-indigo-500 text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-90 shadow-lg flex items-center justify-center h-[42px] w-[42px] z-30"
                  title={isZoomed ? "Exit Fullscreen Fit" : "Fit to Laptop Screen"}
                >
                  {isZoomed ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* 6 QUICK-ACCESS VOICE PADS */}
          <div className={`relative z-10 ${isZoomed ? 'space-y-2' : 'space-y-4'}`}>
            <h4 className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold block text-left">
              Quick-Access Instrument Voices (Tap to Switch Keyboard Patch)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {activeBank.voices.map((voice, idx) => {
                const isActive = activeVoiceIndex === idx;
                const isInternal = voice.msb === null;
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleVoicePadClick(voice, idx)}
                    className={`rounded-2xl flex flex-col justify-between text-left relative overflow-hidden transition-all duration-300 group ${
                      isZoomed ? 'p-3 min-h-[90px]' : 'p-5 min-h-[120px]'
                    } ${
                      isActive 
                        ? 'bg-gradient-to-b from-indigo-500/25 to-purple-500/15 border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] animate-pulse' 
                        : 'bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-900/80'
                    }`}
                  >
                    {/* Glowing pulse indicator for active pad */}
                    {isActive && (
                      <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                      </span>
                    )}

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-indigo-400">PAD {idx + 1}</span>
                        <span className="text-[8px] bg-slate-950/60 text-slate-500 px-1 py-0.5 rounded font-mono font-bold">Key {idx + 1}</span>
                      </div>
                      <h5 className={`font-extrabold leading-tight line-clamp-2 transition-colors duration-200 text-sm ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                        {voice.name}
                      </h5>
                    </div>

                    <div className="text-[9px] font-bold text-slate-500 mt-2 font-mono">
                      {isInternal ? (
                        'Internal Panel Voice'
                      ) : (
                        `M:${voice.msb} L:${voice.lsb} P:${voice.program}`
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DIVIDER & INTEGRATED BEAT (STYLE) CONTROL PANEL */}
          <div className={`border-t border-white/5 ${isZoomed ? 'pt-4 mt-4' : 'pt-8 mt-8'} relative z-10`}>
            <div className={`flex justify-between items-center ${isZoomed ? 'mb-4' : 'mb-6'}`}>
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
                Live Style & Beat Sync Controls
              </h4>
              <span className="text-[10px] text-slate-500 font-medium">Sync arranger styles, tap tempo, and shift pitch</span>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-3 ${isZoomed ? 'gap-4' : 'gap-6'}`}>
              
              {/* Column 1: Playback Transport & Sync */}
              <div className={`bg-slate-950/20 border border-white/5 rounded-2xl ${isZoomed ? 'p-4' : 'p-5'} flex flex-col justify-between items-center text-center relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] bg-indigo-500/5 transition-all pointer-events-none group-hover:bg-indigo-500/10"></div>
                
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mb-4">Transport Control</span>

                {/* Pulsing Visual Loop Indicator */}
                <div className={`relative ${isZoomed ? 'mb-2' : 'mb-4'}`}>
                  <div className={`rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isZoomed ? 'w-14 h-14' : 'w-20 h-20'} ${isClockRunning ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-500/5' : 'border-white/5 bg-slate-900/30'}`}>
                    <Sliders className={`text-slate-500 ${isClockRunning ? 'text-emerald-400 animate-pulse' : ''}`} size={isZoomed ? 24 : 32} />
                  </div>
                  {isClockRunning && (
                    <>
                      <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400/10"></span>
                      <div className="absolute top-0.5 right-0.5 flex gap-1 h-2 w-2">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                      </div>
                    </>
                  )}
                </div>

                {/* MIDI Clock Sync Active Indicator */}
                <div className={`flex items-center gap-2 text-[9px] uppercase font-bold tracking-widest py-1.5 px-3 bg-slate-950/60 border border-white/5 rounded-xl ${isZoomed ? 'mb-2' : 'mb-4'} w-full justify-center`}>
                  <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isClockRunning ? 'bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]' : 'bg-slate-700'}`}></span>
                  <span className={isClockRunning ? 'text-indigo-400 font-sans' : 'text-slate-500 font-sans'}>
                    Clock: {isClockRunning ? 'Syncing (24 PPQN)' : 'Ready'}
                  </span>
                </div>

                {/* Play/Stop Buttons */}
                <div className="flex gap-3 w-full justify-center">
                  {!isClockRunning ? (
                    <button 
                      onClick={() => sendMidiStart()}
                      className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold flex items-center justify-center gap-2 flex-1 shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02] active:scale-95 text-xs uppercase"
                    >
                      <Play size={12} fill="white" /> Play Style
                    </button>
                  ) : (
                    <button 
                      onClick={sendMidiStop}
                      className="px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold flex items-center justify-center gap-2 flex-1 shadow-lg shadow-rose-500/10 transition-all hover:scale-[1.02] active:scale-95 text-xs uppercase"
                    >
                      <Square size={12} fill="white" /> Stop Style
                    </button>
                  )}
                </div>
              </div>

              {/* Column 2: Tempo Board */}
              <div className={`bg-slate-950/20 border border-white/5 rounded-2xl ${isZoomed ? 'p-4' : 'p-5'} flex flex-col justify-between`}>
                <div>
                  <div className={`flex justify-between items-center ${isZoomed ? 'mb-2' : 'mb-3'}`}>
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Tempo (BPM)</span>
                    <span className="bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-xs font-extrabold text-indigo-400 font-mono">
                      {bpm} BPM
                    </span>
                  </div>

                  <div className={isZoomed ? 'space-y-2.5' : 'space-y-4'}>
                    <input 
                      type="range" 
                      min="40" 
                      max="240" 
                      value={bpm}
                      onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setBpm(Math.max(40, bpm - 1))}
                        className="p-2 rounded-lg bg-white/3 border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white flex-1 text-xs font-bold transition-all active:scale-95"
                      >
                        -1
                      </button>
                      <button 
                        onClick={() => setBpm(Math.min(240, bpm + 1))}
                        className="p-2 rounded-lg bg-white/3 border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white flex-1 text-xs font-bold transition-all active:scale-95"
                      >
                        +1
                      </button>
                      <button 
                        onClick={handleTapTempo}
                        className="px-3 py-2 rounded-lg bg-indigo-600/90 border border-indigo-500 hover:bg-indigo-500 text-white font-extrabold text-xs flex-1 transition-all active:scale-90"
                      >
                        TAP TEMPO
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`border-t border-white/5 ${isZoomed ? 'pt-2 mt-2' : 'pt-3 mt-4'} flex items-center justify-between`}>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-300">MIDI Clock Sync</span>
                    <span className="text-[9px] text-slate-500 font-medium">Transmits sync pulses</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={midiClockSync} 
                      onChange={(e) => setMidiClockSync(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                  </label>
                </div>
              </div>

              {/* Column 3: Master Pitch Transpose */}
              <div className={`bg-slate-950/20 border border-white/5 rounded-2xl ${isZoomed ? 'p-4' : 'p-5'} flex flex-col justify-between`}>
                <div>
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block mb-2 text-left">Master Transpose</span>
                  
                  <div className={`flex items-center justify-between gap-4 ${isZoomed ? 'my-1' : 'my-2'}`}>
                    <button 
                      onClick={() => sendMasterTranspose(transpose - 1)}
                      className="w-10 h-10 rounded-xl bg-white/3 border border-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90 shadow-md"
                    >
                      <ChevronDown size={18} />
                    </button>

                    <div className="flex flex-col items-center">
                      <span className={`text-3xl font-extrabold tracking-tight ${transpose !== 0 ? 'text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'text-slate-300'}`}>
                        {transpose > 0 ? `+${transpose}` : transpose}
                      </span>
                      <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">Semitones</span>
                    </div>

                    <button 
                      onClick={() => sendMasterTranspose(transpose + 1)}
                      className="w-10 h-10 rounded-xl bg-white/3 border border-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90 shadow-md"
                    >
                      <ChevronUp size={18} />
                    </button>
                  </div>
                </div>

                <div className="h-10 flex items-end">
                  {transpose !== 0 ? (
                    <button 
                      onClick={() => sendMasterTranspose(0)}
                      className="w-full py-2 rounded-lg bg-white/2 border border-white/5 hover:bg-white/5 text-[9px] font-bold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 transition-all"
                    >
                      <RotateCcw size={10} /> Reset Pitch
                    </button>
                  ) : (
                    <span className="text-[9px] text-slate-500 leading-normal text-left font-medium">
                      Shifts hardware synthesizer Pitch semitones.
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center border-dashed border-white/5 flex flex-col items-center">
          <FolderOpen size={48} className="text-slate-600 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-300">No Performance Banks Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">Create performance register cards containing 6 instrument voice patches, style tempo, and transposition.</p>
          <button 
            onClick={handleOpenAddModal}
            className="mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-all hover:scale-[1.02]"
          >
            Create Your First Bank
          </button>
        </div>
      )}

      {/* 2. BANKS DIRECTORY LIST */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 text-left">Saved Performance Registers</h3>
        
        {banks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banks.map((bank) => {
              const isCurrentlyActive = activeBankId === bank.id;
              
              return (
                <div
                  key={bank.id}
                  onClick={() => handleActivateBank(bank)}
                  className={`glass-card p-5 bg-gradient-to-tr from-white/1 to-white/2 cursor-pointer transition-all duration-300 flex flex-col justify-between text-left group ${
                    isCurrentlyActive 
                      ? 'border-indigo-500/40 bg-indigo-950/5 shadow-md shadow-indigo-500/2' 
                      : 'border-white/3 hover:border-white/10 hover:bg-white/4'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-extrabold text-white text-base leading-snug group-hover:text-indigo-300 transition-colors">
                        {bank.name}
                      </h4>
                      {isCurrentlyActive && (
                        <span className="text-[8px] bg-indigo-500/20 text-indigo-400 font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border border-indigo-500/30">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Metadata indicators */}
                    <div className="flex gap-4 text-[10px] font-bold text-slate-400 mb-4 font-mono">
                      <span>BPM: {bank.bpm}</span>
                      <span>Transpose: {bank.transpose > 0 ? `+${bank.transpose}` : bank.transpose}</span>
                    </div>

                    {/* Quick Voice list preview */}
                    <div className="space-y-1 bg-slate-950/40 p-2.5 rounded-xl border border-white/3 mb-4">
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Preview Voices</span>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                        {bank.voices.slice(0, 6).map((v, i) => (
                          <span key={i} className="text-[10px] text-slate-400 truncate flex items-center gap-1 font-sans">
                            <span className="text-[8px] font-black text-indigo-400">{i + 1}</span> {v.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                      Activate Bank <ArrowRight size={10} />
                    </span>
                    <div className="flex gap-1.5 relative z-20">
                      <button
                        onClick={(e) => handleOpenEditModal(bank, e)}
                        className="p-2 rounded-lg bg-white/2 border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-all"
                        title="Edit Bank"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteBank(bank.id, e)}
                        className="p-2 rounded-lg bg-white/2 border border-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all"
                        title="Delete Bank"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* 3. CREATE / EDIT PERFORMANCE BANK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-3xl bg-slate-900 border-white/10 rounded-2xl shadow-2xl p-6 relative flex flex-col max-h-[90vh] text-left animate-zoom-in">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="text-indigo-400" size={18} />
                {editingBankId ? 'Edit Performance Bank' : 'Create Performance Bank'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBank} className="space-y-5 overflow-y-auto pr-1 flex-1 hide-scrollbar">
              
              {/* Top Configuration block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Song 1 Intro"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="input-field py-2 text-xs"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">Tempo (BPM)</label>
                  <input
                    type="number"
                    min="40"
                    max="240"
                    required
                    value={bankBpm}
                    onChange={(e) => setBankBpm(parseInt(e.target.value, 10) || 120)}
                    className="input-field py-2 text-xs"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">Transpose Offset</label>
                  <select
                    value={bankTranspose}
                    onChange={(e) => setBankTranspose(parseInt(e.target.value, 10) || 0)}
                    className="input-field py-2 text-xs bg-slate-950/60"
                  >
                    {Array.from({ length: 25 }, (_, i) => i - 12).map((semitone) => (
                      <option key={semitone} value={semitone}>
                        {semitone > 0 ? `+${semitone}` : semitone} semitones
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 6 Voice Assignment selectors */}
              <div className="border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold text-slate-200 mb-3 uppercase tracking-wider">Configure 6 Instrument Voices</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editorVoices.map((voice, idx) => (
                    <div key={idx} className="bg-slate-950/40 p-4 rounded-xl border border-white/3 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">Voice Pad {idx + 1}</span>
                      </div>

                      {/* Dropdown presets selector */}
                      <div className="flex flex-col">
                        <label className="text-[8px] text-slate-500 font-bold uppercase mb-1">Select voice from library</label>
                        <select
                          value={voice.presetId}
                          onChange={(e) => handleEditorVoiceSelect(idx, e.target.value)}
                          className="w-full bg-slate-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                        >
                          <option value="custom">-- Enter custom details manually --</option>
                          <option value="internal">-- Keyboard Internal Panel Voice --</option>
                          {presets.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (#{p.voiceNo})</option>
                          ))}
                        </select>
                      </div>

                      {/* Detail inputs (Enabled if manual custom selected) */}
                      {voice.presetId === 'custom' ? (
                        <div className="space-y-2">
                          <div className="flex flex-col">
                            <input
                              type="text"
                              required
                              placeholder="Voice Display Name"
                              value={voice.name}
                              onChange={(e) => handleEditorVoiceManualChange(idx, 'name', e.target.value)}
                              className="w-full bg-slate-900/60 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col">
                              <label className="text-[7px] text-slate-500 font-bold mb-0.5">MSB</label>
                              <input
                                type="number"
                                min="0"
                                max="127"
                                required
                                value={voice.msb ?? 0}
                                onChange={(e) => handleEditorVoiceManualChange(idx, 'msb', e.target.value)}
                                className="w-full bg-slate-900/60 border border-white/5 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[7px] text-slate-500 font-bold mb-0.5">LSB</label>
                              <input
                                type="number"
                                min="0"
                                max="127"
                                required
                                value={voice.lsb ?? 0}
                                onChange={(e) => handleEditorVoiceManualChange(idx, 'lsb', e.target.value)}
                                className="w-full bg-slate-900/60 border border-white/5 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[7px] text-slate-500 font-bold mb-0.5">PC</label>
                              <input
                                type="number"
                                min="1"
                                max="128"
                                required
                                value={voice.program ?? 1}
                                onChange={(e) => handleEditorVoiceManualChange(idx, 'program', e.target.value)}
                                className="w-full bg-slate-900/60 border border-white/5 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ) : voice.presetId === 'internal' ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            required
                            placeholder="Voice Display Name (e.g. Grand Piano)"
                            value={voice.name}
                            onChange={(e) => handleEditorVoiceManualChange(idx, 'name', e.target.value)}
                            className="w-full bg-slate-900/60 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          />
                          <p className="text-[8px] text-slate-500 italic text-left">
                            This preset is a keyboard-internal voice. Select it manually on the keyboard panel. App will not send MIDI voice changes for this slot.
                          </p>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-white/3 text-left font-mono">
                          Selected Voice: {voice.name}<br/>
                          MIDI Change values: MSB:{voice.msb} LSB:{voice.lsb} PC:{voice.program}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-white/5 pt-4 mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/2 hover:bg-white/5 border border-white/5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Check size={14} /> Save performance Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
