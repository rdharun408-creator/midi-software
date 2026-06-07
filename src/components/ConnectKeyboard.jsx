import React from 'react';
import { Cable, Power, PowerOff, Activity } from 'lucide-react';

export default function ConnectKeyboard({ midiState }) {
  const {
    inputs, outputs,
    selectedInputId, setSelectedInputId,
    selectedOutputId, setSelectedOutputId,
    selectedChannel, setSelectedChannel,
    midiThruEnabled, setMidiThruEnabled,
    sendTestNote, error, isConnected
  } = midiState;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-4 rounded-2xl ${isConnected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
          <Cable size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Connect Keyboard</h2>
          <p className="text-slate-400 mt-1">Configure your MIDI input and output devices</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
          <Activity className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              MIDI Output
            </h3>
            {isConnected ? <Power className="text-emerald-400" size={20} /> : <PowerOff className="text-slate-500" size={20} />}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Select Device</label>
              <select 
                className="input-field appearance-none"
                value={selectedOutputId}
                onChange={(e) => setSelectedOutputId(e.target.value)}
              >
                <option value="">-- No Output Selected --</option>
                {outputs.map(out => (
                  <option key={out.id} value={out.id}>{out.name || `Output Port ${out.id}`}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">MIDI Channel</label>
              <select 
                className="input-field appearance-none"
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(Number(e.target.value))}
              >
                {Array.from({ length: 16 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Channel {i + 1}</option>
                ))}
              </select>
            </div>

            <button 
              className="premium-button w-full mt-4"
              onClick={sendTestNote}
              disabled={!isConnected}
            >
              Test Note (Middle C)
            </button>
          </div>
        </div>

        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              MIDI Input
            </h3>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-md">Optional</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Select Device (For Monitor)</label>
              <select 
                className="input-field appearance-none"
                value={selectedInputId}
                onChange={(e) => setSelectedInputId(e.target.value)}
              >
                <option value="">-- No Input Selected --</option>
                {inputs.map(inp => (
                  <option key={inp.id} value={inp.id}>{inp.name || `Input Port ${inp.id}`}</option>
                ))}
              </select>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm text-slate-400 leading-relaxed">
              <strong>Note:</strong> Selecting an input is optional unless you want to use the MIDI Monitor or the <strong>MIDI Thru</strong> feature below.
            </div>

            {selectedInputId && isConnected && (
              <div className="pt-4 border-t border-slate-800 mt-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={midiThruEnabled}
                      onChange={(e) => setMidiThruEnabled(e.target.checked)}
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${midiThruEnabled ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${midiThruEnabled ? 'translate-x-6' : ''}`}></div>
                  </div>
                  <div>
                    <div className="text-white font-medium group-hover:text-indigo-400 transition-colors">Enable MIDI Thru</div>
                    <div className="text-xs text-slate-400">Play the app's selected voice directly from your keyboard</div>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {midiThruEnabled ? (
        <div className="glass-card p-6 border-emerald-500/30 bg-emerald-500/10">
          <h4 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
            <Activity size={18} /> MIDI Thru is Active
          </h4>
          <p className="text-emerald-200/80 text-sm leading-relaxed">
            To hear the voices you select in the app when playing your keyboard's keys, you <strong>MUST turn "Local Control" to OFF</strong> on your physical Yamaha keyboard (usually found in the Function menu). Otherwise, you will hear two voices playing at the same time.
          </p>
        </div>
      ) : (
        <div className="glass-card p-6 border-indigo-500/20 bg-indigo-500/5">
          <h4 className="text-indigo-400 font-semibold mb-2">Yamaha Panel Voice Workaround</h4>
          <p className="text-indigo-200/70 text-sm leading-relaxed">
            Some Yamaha PSR keyboards will not change their physical screen when you select a voice here. To play the app's selected voice on your keyboard's physical keys, select your keyboard in the <strong>MIDI Input</strong> dropdown above, and turn on <strong>MIDI Thru</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
