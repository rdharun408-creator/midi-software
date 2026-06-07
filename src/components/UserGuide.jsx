import React from 'react';
import { BookOpen, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function UserGuide() {
  const steps = [
    "Connect USB TO HOST cable from keyboard to laptop.",
    "Open this app in Chrome or Edge.",
    "Go to 'Connect Keyboard' section.",
    "Allow MIDI permission when prompted by the browser.",
    "Select Yamaha keyboard MIDI output.",
    "Choose MIDI channel 1 (default for main voice).",
    "Click Test Note to ensure audio is working.",
    "Go to Dashboard or Live Mode and click any voice button.",
    "If front panel voice does not change, use Test Note to confirm MIDI sound control.",
    "Add your own Yamaha PSR-I500 voice numbers from the Yamaha voice list using the 'New Voice' button."
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-sky-500/20 text-sky-400">
          <BookOpen size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">User Guide</h2>
          <p className="text-slate-400 mt-1">How to setup and use your MIDI Voice Controller</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-xl flex gap-4 text-amber-200/90">
            <AlertTriangle className="shrink-0 text-amber-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-400 mb-1">Important Note About Yamaha Keyboards</h4>
              <p className="text-sm leading-relaxed">
                Some keyboards may not change the front panel voice display through MIDI. The sound may change only for external MIDI playback. Test with the MIDI Note button to confirm the voice has actually changed internally.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-xl font-semibold mb-4">Step-by-Step Setup</h3>
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4 items-start bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                <div className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-lg shadow-indigo-500/20">
                  {index + 1}
                </div>
                <p className="text-slate-300 pt-1 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
          
          <div className="pt-6 border-t border-slate-800">
            <h3 className="text-xl font-semibold mb-4">Understanding MIDI Values</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="font-semibold text-indigo-400 mb-1">MSB (CC0)</div>
                <p className="text-sm text-slate-400">Bank Select Most Significant Byte. Usually 0 for standard voices.</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="font-semibold text-purple-400 mb-1">LSB (CC32)</div>
                <p className="text-sm text-slate-400">Bank Select Least Significant Byte. Usually 112 or 113 for specific categories.</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="font-semibold text-pink-400 mb-1">Program Change</div>
                <p className="text-sm text-slate-400">The actual voice number. (Note: App subtracts 1 automatically for MIDI standard).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
