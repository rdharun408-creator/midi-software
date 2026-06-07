import React, { useState } from 'react';
import Navigation from './components/Navigation';
import ConnectKeyboard from './components/ConnectKeyboard';
import Dashboard from './components/Dashboard';
import MidiMonitor from './components/MidiMonitor';
import UserGuide from './components/UserGuide';
import PresetFormModal from './components/PresetFormModal';
import { useMIDI } from './hooks/useMIDI';
import { usePresets } from './hooks/usePresets';

export default function App() {
  const [activeTab, setActiveTab] = useState('connect');
  const midiState = useMIDI();
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
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'connect' && <ConnectKeyboard midiState={midiState} />}
        {activeTab === 'dashboard' && (
          <Dashboard 
            presetsHook={presetsHook} 
            midiState={midiState} 
            isLiveMode={false} 
            onAddNew={openNewModal}
            onEdit={openEditModal}
          />
        )}
        {activeTab === 'live' && (
          <Dashboard 
            presetsHook={presetsHook} 
            midiState={midiState} 
            isLiveMode={true} 
          />
        )}
        {activeTab === 'monitor' && <MidiMonitor midiState={midiState} />}
        {activeTab === 'guide' && <UserGuide />}
      </main>

      <PresetFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePreset}
        initialData={editingPreset}
      />
      
      {/* Global Toast for Connection Status */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none flex flex-col gap-2">
        {midiState.isConnected ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Keyboard Connected
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            Ready to Connect
          </div>
        )}
      </div>
    </div>
  );
}
