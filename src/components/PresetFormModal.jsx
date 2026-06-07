import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <h3 className="text-2xl font-bold mb-6">{initialData ? 'Edit Voice' : 'Add New Voice'}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Voice Name</label>
            <input 
              required
              type="text" 
              className="input-field"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
            <select 
              className="input-field appearance-none"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              {CATEGORIES.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">MSB</label>
              <input 
                required type="number" min="0" max="127" className="input-field"
                value={formData.msb}
                onChange={e => setFormData({...formData, msb: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">LSB</label>
              <input 
                required type="number" min="0" max="127" className="input-field"
                value={formData.lsb}
                onChange={e => setFormData({...formData, lsb: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Program</label>
              <input 
                required type="number" min="1" max="128" className="input-field"
                value={formData.program}
                onChange={e => setFormData({...formData, program: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="secondary-button flex-1">
              Cancel
            </button>
            <button type="submit" className="premium-button flex-1">
              Save Voice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
