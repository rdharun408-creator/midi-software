import React from 'react';
import { Terminal, Trash2 } from 'lucide-react';

export default function MidiMonitor({ midiState }) {
  const { midiLog, clearLog } = midiState;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            MIDI Message Monitor
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Analyze real-time incoming and outgoing MIDI data packets</p>
        </div>
      </div>

      {/* Console Window */}
      <div className="glass-card overflow-hidden flex flex-col h-[580px] bg-slate-950/70 border border-white/5 shadow-2xl">
        {/* macOS Console style header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0d101a]/70">
          {/* macOS window control buttons */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/30"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/30"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/30"></span>
            <span className="text-xs text-slate-500 font-bold ml-3 font-mono">midi_debugger.sh</span>
          </div>
          
          <button 
            onClick={clearLog}
            className="text-xs flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/3 hover:bg-white/7 border border-white/5 text-slate-400 hover:text-rose-400 transition-colors active:scale-95 cursor-pointer font-semibold"
          >
            <Trash2 size={13} /> Clear Terminal
          </button>
        </div>
        
        {/* Terminal logs list */}
        <div className="flex-1 overflow-y-auto p-5 font-mono text-xs space-y-2.5 hide-scrollbar bg-black/25">
          {midiLog.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 italic gap-2.5">
              <div className="p-3.5 rounded-full bg-white/2 border border-white/5">
                <Terminal size={24} className="opacity-30" />
              </div>
              <span className="text-slate-500 text-xs">Awaiting MIDI activity signals...</span>
            </div>
          ) : (
            midiLog.map((log) => {
              // Get badge colors based on message type
              let badgeStyle = '';
              let badgeLabel = '';
              
              if (log.type === 'rx') {
                badgeStyle = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                badgeLabel = 'RX';
              } else if (log.type === 'tx') {
                badgeStyle = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                badgeLabel = 'TX';
              } else if (log.type === 'error') {
                badgeStyle = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                badgeLabel = 'ERR';
              } else {
                badgeStyle = 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
                badgeLabel = 'SYS';
              }

              return (
                <div 
                  key={log.id} 
                  className="py-2 px-3.5 rounded-xl bg-white/2 border border-white/3 hover:bg-white/4 transition-colors flex items-start gap-4"
                >
                  <span className="text-slate-600 font-semibold shrink-0 text-[10px] select-none pt-0.5">
                    {log.time}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider shrink-0 select-none ${badgeStyle}`}>
                    {badgeLabel}
                  </span>
                  <span className="break-all text-slate-300 leading-relaxed font-mono">
                    {log.message.replace(/^(IN|OUT|Error): /, '')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

