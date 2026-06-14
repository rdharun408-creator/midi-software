import React, { useState } from 'react';
import Navigation from './components/Navigation';
import ConnectKeyboard from './components/ConnectKeyboard';
import Dashboard from './components/Dashboard';
import MidiMonitor from './components/MidiMonitor';
import UserGuide from './components/UserGuide';
import PresetFormModal from './components/PresetFormModal';
import StageControl from './components/StageControl';
import LiveBanks from './components/LiveBanks';
import { useMIDI } from './hooks/useMIDI';
import { usePresets } from './hooks/usePresets';
import { Lock, Unlock } from 'lucide-react';


export default function App() {
  const [activeTab, setActiveTab] = useState('connect');
  const [isLocked, setIsLocked] = useState(false);
  const midiState = useMIDI({ enableLogging: activeTab === 'monitor' });
  const presetsHook = usePresets();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);

  const handleSavePreset = (data) => {
    if (editingPreset) {
      presetsHook.updatePreset(editingPreset.id, data);
    } else {
      presetsHook.addPreset(data);
    }
  };

  const openNewModal = () => {
    setEditingPreset(null);
    setIsModalOpen(true);
  };

  const openEditModal = (preset) => {
    setEditingPreset(preset);
    setIsModalOpen(true);
  };

  // Clone the Dashboard to inject the openEditModal/openNewModal props
  const dashboardElement = (
    <div className="space-y-4">
      {/* We need to pass the modals down or just render them here. We can render Dashboard here and handle adding/editing logic. */}
      {/* Wait, we can modify Dashboard to accept these functions. Let's do that via cloning or just direct prop passing. */}
      {/* But I didn't add these props to Dashboard.jsx yet. I'll just pass them. */}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060709] text-slate-100 font-sans relative overflow-x-hidden">
      {/* Premium Ambient Background Spheres */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/5 blur-[120px] animate-[float-slow_20s_infinite_ease-in-out]"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-500/5 blur-[150px] animate-[float-medium_25s_infinite_ease-in-out]"></div>
        <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-500/3 blur-[100px] animate-[float-slow_15s_infinite_ease-in-out_2s]"></div>
      </div>

      <div className="relative z-10">
        {!isLocked && (
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} midiState={midiState} isLocked={isLocked} />
        )}
        
        {/* Main Content Area: Offset on desktop for sidebar, add bottom padding on mobile for floating bar */}
        <main className={`${isLocked ? '' : 'md:pl-72'} min-h-screen transition-all duration-300`}>
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isLocked ? 'pb-8' : 'pb-28 md:pb-8'}`}>
            {/* Dynamic Page-Specific Warning Banner */}
            {isLocked && (
              <div className="bg-amber-500/10 border border-amber-500/25 text-amber-400 px-4 py-3.5 rounded-xl shadow-lg flex items-center gap-3 text-left animate-pulse mb-6">
                <Lock size={18} className="text-amber-500 flex-shrink-0" />
                <span className="text-xs font-semibold">
                  Live Navigation Locked — Access restricted to the {
                    activeTab === 'connect' ? 'Devices' :
                    activeTab === 'dashboard' ? 'Voices' :
                    activeTab === 'banks' ? 'Performance Banks' :
                    activeTab === 'stage' ? 'Stage Control' :
                    activeTab === 'live' ? 'Live Mode' :
                    activeTab === 'monitor' ? 'Monitor' :
                    activeTab === 'guide' ? 'User Guide' : 'current'
                  } page. Unlock to visit other pages.
                </span>
              </div>
            )}

            {activeTab === 'connect' && <ConnectKeyboard midiState={midiState} isLocked={isLocked} />}
            {activeTab === 'dashboard' && (
              <Dashboard 
                presetsHook={presetsHook} 
                midiState={midiState} 
                isLiveMode={false} 
                onAddNew={openNewModal}
                onEdit={openEditModal}
                isLocked={isLocked}
              />
            )}
            {activeTab === 'banks' && (
              <LiveBanks 
                presetsHook={presetsHook} 
                midiState={midiState} 
                isLocked={isLocked}
                setIsLocked={setIsLocked}
              />
            )}
            {activeTab === 'stage' && (
              <StageControl 
                presetsHook={presetsHook} 
                midiState={midiState} 
                isLocked={isLocked}
              />
            )}
            {activeTab === 'live' && (
              <Dashboard 
                presetsHook={presetsHook} 
                midiState={midiState} 
                isLiveMode={true} 
                isLocked={isLocked}
              />
            )}
            {activeTab === 'monitor' && <MidiMonitor midiState={midiState} />}
            {activeTab === 'guide' && <UserGuide />}
          </div>
        </main>
      </div>

      {/* Global Floating Lock/Unlock Action Button */}
      <div className={`fixed right-6 z-50 transition-all duration-300 ${isLocked ? 'bottom-36 md:bottom-20' : 'bottom-48 md:bottom-20'}`}>
        {isLocked ? (
          <button
            onClick={() => setIsLocked(false)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-full border border-yellow-300/50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black uppercase tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:from-amber-400 hover:via-yellow-300 hover:to-amber-500 hover:scale-110 active:scale-95 transition-all text-xs animate-bounce animate-duration-1000 cursor-pointer"
            title="Unlock Navigation"
          >
            <Unlock size={14} fill="currentColor" />
            <span>Unlock</span>
          </button>
        ) : (
          <button
            onClick={() => setIsLocked(true)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-full border border-yellow-300/50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black uppercase tracking-widest shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:from-amber-400 hover:via-yellow-300 hover:to-amber-500 hover:scale-110 active:scale-95 transition-all text-xs animate-bounce animate-duration-1000 cursor-pointer"
            title="Lock Navigation"
          >
            <Lock size={14} fill="currentColor" />
            <span>Lock</span>
          </button>
        )}
      </div>

      <PresetFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePreset}
        initialData={editingPreset}
      />
      
      {/* Global Toast for Connection Status */}
      <div className="fixed bottom-24 md:bottom-4 right-4 z-50 pointer-events-none flex flex-col gap-2">
        {midiState.isConnected ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold">Keyboard connected successfully</span>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-xs font-semibold">Midi output not connected</span>
          </div>
        )}
      </div>
    </div>
  );
}
