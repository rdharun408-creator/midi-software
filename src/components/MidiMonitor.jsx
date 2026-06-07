import React from 'react';
import { Terminal, Trash2 } from 'lucide-react';

export default function MidiMonitor({ midiState }) {
  const { midiLog, clearLog } = midiState;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-slate-800 text-slate-400">
          <Terminal size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">MIDI Monitor</h2>
          <p className="text-slate-400 mt-1">View real-time incoming and outgoing MIDI messages</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
          <h3 className="font-semibold text-slate-300">Message Log</h3>
          <button 
            onClick={clearLog}
            className="text-sm flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} /> Clear Log
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1 hide-scrollbar">
          {midiLog.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 italic">
              No MIDI activity detected yet...
            </div>
          ) : (
            midiLog.map((log) => (
              <div 
                key={log.id} 
                className={`py-1.5 px-3 rounded flex gap-4 ${
                  log.type === 'rx' ? 'text-emerald-400 hover:bg-emerald-400/10' : 
                  log.type === 'tx' ? 'text-blue-400 hover:bg-blue-400/10' : 
                  log.type === 'error' ? 'text-red-400 hover:bg-red-400/10' :
                  'text-slate-400 hover:bg-slate-400/10'
                }`}
              >
                <span className="opacity-50 shrink-0 w-20">{log.time}</span>
                <span className="font-semibold shrink-0 w-10">
                  {log.type === 'rx' ? 'IN' : log.type === 'tx' ? 'OUT' : log.type === 'error' ? 'ERR' : 'SYS'}
                </span>
                <span className="break-all">{log.message.replace(/^(IN|OUT|Error): /, '')}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
