import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../hooks/usePresets';

export default function PresetFormModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Custom',
    msb: 0,
    lsb: 0,
    program: 1
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', category: 'Custom', msb: 0, lsb: 0, program: 1 });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-md p-7 relative overflow-hidden animate-[scale-up_0.2s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Subtle decorative color dot inside card */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-[30px] pointer-events-none"></div>

        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all active:scale-95"
        >
          <X size={16} />
        </button>
        
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
            <Sparkles size={18} />
          </div>
          <h3 className="text-xl font-bold text-white">
            {initialData ? 'Edit Voice Patch' : 'New Voice Patch'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Voice Name
            </label>
            <input 
              required
              type="text" 
              placeholder="e.g. Warm Brass Pad"
              className="input-field bg-slate-950/30"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="relative">
              <select 
                className="input-field pr-10 appearance-none bg-slate-950/40 text-slate-200"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {CATEGORIES.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900 text-slate-200">{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                MSB (CC0)
              </label>
              <input 
                required 
                type="number" 
                min="0" 
                max="127" 
                placeholder="0"
                className="input-field bg-slate-950/30 text-center"
                value={formData.msb}
                onChange={e => setFormData({...formData, msb: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                LSB (CC32)
              </label>
              <input 
                required 
                type="number" 
                min="0" 
                max="127" 
                placeholder="112"
                className="input-field bg-slate-950/30 text-center"
                value={formData.lsb}
                onChange={e => setFormData({...formData, lsb: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Program (PC)
              </label>
              <input 
                required 
                type="number" 
                min="1" 
                max="128" 
                placeholder="1"
                className="input-field bg-slate-950/30 text-center"
                value={formData.program}
                onChange={e => setFormData({...formData, program: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="secondary-button flex-1 text-sm py-2.5"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="premium-button flex-1 text-sm py-2.5"
            >
              Save Patch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

