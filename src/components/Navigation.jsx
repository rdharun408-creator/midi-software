import React from 'react';
import { LayoutDashboard, Cable, Mic2, Terminal, BookOpen, Settings2 } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Mode', icon: Mic2 },
    { id: 'connect', label: 'Connect', icon: Cable },
    { id: 'monitor', label: 'Monitor', icon: Terminal },
    { id: 'guide', label: 'User Guide', icon: BookOpen },
  ];

  return (
    <nav className="glass-panel sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl text-white">
              <Settings2 size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              MIDI Control
            </span>
          </div>
          
          <div className="flex overflow-x-auto hide-scrollbar items-center">
            <div className="flex gap-2 p-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden md:inline whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
