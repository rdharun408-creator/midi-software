import React from 'react';
import { Cable, Power, PowerOff, Activity, ShieldAlert, Cpu, ArrowRightLeft, Radio } from 'lucide-react';

export default function ConnectKeyboard({ midiState }) {
  const {
    inputs, outputs,
    selectedInputId, setSelectedInputId,
    selectedOutputId, setSelectedOutputId,
    selectedChannel, setSelectedChannel,
    midiThruEnabled, setMidiThruEnabled,
    sendTestNote, error, isConnected
  } = midiState;

  const selectedOutput = outputs.find(o => o.id === selectedOutputId);
  const selectedInput = inputs.find(i => i.id === selectedInputId);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Device Connection
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Configure and inspect your hardware MIDI routing</p>
        </div>
        
        {isConnected ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Online
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Awaiting Output
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-5 rounded-2xl flex items-start gap-3.5 shadow-lg">
          <ShieldAlert className="shrink-0 text-rose-500 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm text-rose-300 mb-0.5">MIDI System Error</h4>
            <p className="text-xs text-rose-400/80 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Interactive Visual Signal Flow Map */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-around gap-6 relative overflow-hidden">
        {/* Glow backdrop decorative */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[60px] bg-indigo-500/5 blur-[40px] rounded-full"></div>

        {/* Input Node */}
        <div className="flex flex-col items-center gap-2.5 z-10 w-48 text-center">
          <div className={`p-4 rounded-2xl border transition-all duration-500 ${selectedInput ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'bg-white/2 border-white/5 text-slate-500'}`}>
            <Radio size={28} className={selectedInput ? 'animate-pulse' : ''} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">MIDI Input Source</span>
            <span className={`text-xs font-semibold truncate max-w-[180px] ${selectedInput ? 'text-indigo-300' : 'text-slate-500'}`}>
              {selectedInput ? selectedInput.name : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Cable Link 1 */}
        <div className="flex flex-col items-center justify-center min-w-[60px] md:flex-1">
          <div className="flex items-center gap-1">
            <div className={`h-[2px] w-8 md:w-16 rounded transition-all duration-500 ${selectedInput && isConnected && midiThruEnabled ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-white/10'}`}></div>
            <ArrowRightLeft size={14} className={selectedInput && isConnected && midiThruEnabled ? 'text-purple-400 animate-pulse' : 'text-slate-600'} />
            <div className={`h-[2px] w-8 md:w-16 rounded transition-all duration-500 ${selectedInput && isConnected && midiThruEnabled ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-white/10'}`}></div>
          </div>
          <span className="text-[9px] text-slate-500 font-semibold mt-1">
            {midiThruEnabled && selectedInput ? 'Thru Active' : 'Passive'}
          </span>
        </div>

        {/* Core Application Processing Node */}
        <div className="flex flex-col items-center gap-2.5 z-10 w-48 text-center">
          <div className="p-4 rounded-2xl border bg-white/3 border-white/10 text-slate-300 shadow-md">
            <Cpu size={28} className="text-purple-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Voice Processor</span>
            <span className="text-xs text-purple-300 font-semibold">MIDI Controller app</span>
          </div>
        </div>

        {/* Cable Link 2 */}
        <div className="flex flex-col items-center justify-center min-w-[60px] md:flex-1">
          <div className="flex items-center gap-1">
            <div className={`h-[2px] w-8 md:w-16 rounded transition-all duration-500 ${isConnected ? 'bg-gradient-to-r from-purple-500 to-emerald-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-white/10'}`}></div>
            <ArrowRightLeft size={14} className={isConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-600'} />
            <div className={`h-[2px] w-8 md:w-16 rounded transition-all duration-500 ${isConnected ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/10'}`}></div>
          </div>
          <span className="text-[9px] text-slate-500 font-semibold mt-1">
            {isConnected ? 'Signal Active' : 'Offline'}
          </span>
        </div>

        {/* Output Node */}
        <div className="flex flex-col items-center gap-2.5 z-10 w-48 text-center">
          <div className={`p-4 rounded-2xl border transition-all duration-500 ${isConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'bg-white/2 border-white/5 text-slate-500'}`}>
            <Cable size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">MIDI Output Target</span>
            <span className={`text-xs font-semibold truncate max-w-[180px] ${isConnected ? 'text-emerald-300' : 'text-slate-500'}`}>
              {isConnected ? selectedOutput.name : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Output Configuration Card */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              MIDI Output Configuration
            </h3>
            {isConnected ? (
              <Power className="text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" size={18} />
            ) : (
              <PowerOff className="text-slate-600" size={18} />
            )}
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Target Output Device
              </label>
              <div className="relative">
                <select 
                  className="input-field pr-10 appearance-none bg-slate-950/40 text-slate-200"
                  value={selectedOutputId}
                  onChange={(e) => setSelectedOutputId(e.target.value)}
                >
                  <option value="" className="bg-slate-900 text-slate-400">-- No Device Selected --</option>
                  {outputs.map(out => (
                    <option key={out.id} value={out.id} className="bg-slate-900 text-slate-200">
                      {out.name || `Output Port ${out.id}`}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                MIDI Channel Routing
              </label>
              <div className="relative">
                <select 
                  className="input-field pr-10 appearance-none bg-slate-950/40 text-slate-200"
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(Number(e.target.value))}
                >
                  {Array.from({ length: 16 }, (_, i) => (
                    <option key={i + 1} value={i + 1} className="bg-slate-900 text-slate-200">
                      Channel {i + 1} {i === 0 ? '(Default Main Voice)' : ''}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            <button 
              className="premium-button w-full mt-6"
              onClick={sendTestNote}
              disabled={!isConnected}
            >
              <Activity size={18} /> Test Sound Note (Middle C)
            </button>
          </div>
        </div>

        {/* Input Configuration Card */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
              MIDI Input Configuration
            </h3>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
              Optional
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Input Source (For Monitor/Thru)
              </label>
              <div className="relative">
                <select 
                  className="input-field pr-10 appearance-none bg-slate-950/40 text-slate-200"
                  value={selectedInputId}
                  onChange={(e) => setSelectedInputId(e.target.value)}
                >
                  <option value="" className="bg-slate-900 text-slate-400">-- No Device Selected --</option>
                  {inputs.map(inp => (
                    <option key={inp.id} value={inp.id} className="bg-slate-900 text-slate-200">
                      {inp.name || `Input Port ${inp.id}`}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white/2 border border-white/5 rounded-xl p-4 text-xs text-slate-400 leading-relaxed">
              <strong>Usage Info:</strong> Selecting an input is only required if you wish to analyze live keystrokes in the <strong>MIDI Monitor</strong> tab, or enable the <strong>MIDI Thru</strong> feedback loop below.
            </div>

            {selectedInputId && isConnected && (
              <div className="pt-4 border-t border-white/5 mt-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex flex-col pr-4">
                    <span className="text-white text-sm font-semibold group-hover:text-indigo-400 transition-colors">
                      Enable MIDI Thru
                    </span>
                    <span className="text-xs text-slate-400">
                      Play the app's voices directly using your keyboard keys
                    </span>
                  </div>
                  <div className="relative shrink-0">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={midiThruEnabled}
                      onChange={(e) => setMidiThruEnabled(e.target.checked)}
                    />
                    <div className={`block w-12 h-7 rounded-full transition-all duration-300 ${midiThruEnabled ? 'bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 ${midiThruEnabled ? 'translate-x-5' : ''}`}></div>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Alert Notices & Workarounds */}
      {midiThruEnabled ? (
        <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.02)]">
          <h4 className="text-emerald-400 font-bold mb-2 flex items-center gap-2 text-sm">
            <Activity size={16} className="animate-pulse" /> MIDI Thru is Active (Action Required)
          </h4>
          <p className="text-emerald-300/80 text-xs leading-relaxed">
            To hear only the selected voices in this app when pressing your keyboard's keys physically, you <strong>MUST turn "Local Control" to OFF</strong> inside the function settings menu of your physical Yamaha keyboard. Failing to do so will cause both the built-in keyboard voice and the selected app voice to play together.
          </p>
        </div>
      ) : (
        <div className="glass-card p-6 border-indigo-500/20 bg-indigo-500/3 shadow-[0_0_20px_rgba(99,102,241,0.02)]">
          <h4 className="text-indigo-400 font-bold mb-2 text-sm">
            Yamaha Panel Voice Display Workaround
          </h4>
          <p className="text-indigo-300/70 text-xs leading-relaxed">
            Note that standard Yamaha keyboards will not modify their physical screen readouts when voices are switched via MIDI signals. The voice will only update internally in the synthesizer engine. If you want to play the voices using your hardware keys, map your keyboard as the <strong>MIDI Input Device</strong> above and toggle <strong>MIDI Thru</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

