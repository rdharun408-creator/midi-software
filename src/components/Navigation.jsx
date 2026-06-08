import React from 'react';
import { LayoutDashboard, Cable, Mic2, Terminal, BookOpen, Music } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, midiState }) {
  const { isConnected, outputs, selectedOutputId } = midiState || {};
  
  const navItems = [
    { id: 'dashboard', label: 'Voices', icon: LayoutDashboard },
    { id: 'live', label: 'Live Mode', icon: Mic2 },
    { id: 'connect', label: 'Devices', icon: Cable },
    { id: 'monitor', label: 'Monitor', icon: Terminal },
    { id: 'guide', label: 'Guide', icon: BookOpen },
  ];

  const selectedOutput = outputs?.find(o => o.id === selectedOutputId);
  const deviceName = selectedOutput ? (selectedOutput.name || 'Yamaha Device') : 'No MIDI Output';

  const statusIndicator = (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/5 backdrop-blur-md">
      <div className="relative flex h-2.5 w-2.5">
        {isConnected ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </>
        ) : (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">MIDI Status</span>
        <span className="text-xs text-slate-300 font-medium truncate">{isConnected ? deviceName : 'Disconnected'}</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside className="w-72 hidden md:flex flex-col fixed inset-y-0 left-0 glass-panel z-30 p-6 justify-between">
        <div className="space-y-8">
          {/* Logo / Title */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/10">
              <Music size={22} className="animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                MIDI Voice
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">
                Controller
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all relative group ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/5 text-indigo-400 border-l-2 border-indigo-500' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/3 border-l-2 border-transparent'
                  }`}
                >
                  <Icon size={18} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Connection Widget at the bottom */}
        <div className="space-y-4">
          {statusIndicator}
          <div className="text-[10px] text-slate-600 text-center font-medium">
            Yamaha PSR-I500 Companion v1.0.0
          </div>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <header className="md:hidden sticky top-0 z-30 w-full glass-header py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1.5 rounded-lg text-white">
            <Music size={16} />
          </div>
          <span className="font-extrabold text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            MIDI Voice
          </span>
        </div>
        
        {/* Compact status pill for mobile */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      {/* Mobile Navigation Bar (Bottom-floating pill) */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40 bg-[#0c0f17]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-2 shadow-2xl">
        <div className="flex justify-around items-center">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1.5 px-3.5 rounded-xl transition-all ${
                  isActive 
                    ? 'text-indigo-400 bg-indigo-500/10' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

