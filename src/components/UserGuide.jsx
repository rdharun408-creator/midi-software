import React from 'react';
import { BookOpen, HelpCircle, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

export default function UserGuide() {
  const steps = [
    "Connect USB TO HOST port on your keyboard to your laptop using a standard USB cable.",
    "Launch this app in a modern Web-MIDI compliant browser (Chrome, Edge, or Opera).",
    "Navigate to the 'Devices' connection tab in the sidebar menu.",
    "Grant MIDI hardware access permissions when requested by the browser.",
    "Select your Yamaha keyboard's name under the MIDI Output dropdown selector.",
    "Choose MIDI Channel 1 (standard default channel for main keyboard voice playing).",
    "Click the 'Test Sound Note' button to verify that the app is communicating with your instrument.",
    "Go to the 'Voices' Dashboard or 'Live Mode' and click any voice patch button.",
    "If your keyboard's front panel LCD does not update, play some keys to verify the sound changed internally.",
    "Create and save your custom voices from the Yamaha Voice List using the 'New Voice' button."
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            User Guide & Setup
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Follow step-by-step instructions to configure your Yamaha synth</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Timeline Steps (2 columns wide on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
              <Cpu size={18} className="text-indigo-400" />
              Step-by-Step Hardware Setup
            </h3>

            {/* Vertical timeline stepper */}
            <div className="relative pl-6 border-l border-indigo-500/20 space-y-6 ml-3 py-2">
              {steps.map((step, index) => (
                <div key={index} className="relative group">
                  {/* Glowing timeline dot */}
                  <span className="absolute -left-[35px] top-0.5 bg-[#0a0d14] border-2 border-indigo-500 text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-[0_0_10px_rgba(99,102,241,0.2)] group-hover:scale-110 transition-transform">
                    {index + 1}
                  </span>
                  
                  <div className="bg-white/2 hover:bg-white/3 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-200">
                    <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                      {step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Notices and Explanation (1 column wide) */}
        <div className="space-y-6">
          {/* Important Yamaha Hardware Warning Card */}
          <div className="glass-card p-6 border-amber-500/20 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.02)]">
            <div className="flex items-start gap-3 text-amber-200">
              <AlertTriangle className="shrink-0 text-amber-400 mt-0.5" size={20} />
              <div>
                <h4 className="font-extrabold text-sm text-amber-400 mb-1">Yamaha Screen behavior</h4>
                <p className="text-xs text-amber-300/80 leading-relaxed">
                  Yamaha PSR series instruments process MIDI voice adjustments inside their sound engines directly. Consequently, the keyboard's physical LCD screen may not change to show the new voice name. Play the keyboard keys to verify the sound changed internally.
                </p>
              </div>
            </div>
          </div>

          {/* understanding MIDI Values Card */}
          <div className="glass-card p-6 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
              <HelpCircle size={16} className="text-purple-400" />
              MIDI Specifications
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white/2 border border-white/5 p-4 rounded-xl space-y-1">
                <div className="text-xs font-bold text-indigo-400">MSB (Bank CC00)</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Bank Select Most Significant Byte. Yamaha organizes voice categories in banks. Usually set to 0 for default keyboard voices.
                </p>
              </div>
              
              <div className="bg-white/2 border border-white/5 p-4 rounded-xl space-y-1">
                <div className="text-xs font-bold text-purple-400">LSB (Bank CC32)</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Bank Select Least Significant Byte. Used to select custom sound subsets. Standard values range between 112 to 118 for Yamahas.
                </p>
              </div>
              
              <div className="bg-white/2 border border-white/5 p-4 rounded-xl space-y-1">
                <div className="text-xs font-bold text-pink-400">Program Change (PC)</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Selects the program patch number (1-128). The application automatically subtracts 1 (0-127) behind the scenes to map to MIDI specs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
