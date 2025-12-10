import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Calendar, Clock } from 'lucide-react';
import { Medication } from '../types';

interface MedicationsProps {
  medications: Medication[];
  onAdd: (med: Medication) => void;
  onUpdate: (med: Medication) => void;
  onDelete: (id: string) => void;
}

export const Medications: React.FC<MedicationsProps> = ({ medications, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Medication>>({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    startDate: '',
    endDate: ''
  });

  const handleOpenModal = (med?: Medication) => {
    if (med) {
      setEditingMed(med);
      setFormData(med);
    } else {
      setEditingMed(null);
      setFormData({
        name: '',
        dosage: '',
        frequency: 'Once daily',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMed) {
      onUpdate({ ...formData, id: editingMed.id } as Medication);
    } else {
      onAdd({ ...formData, id: Date.now().toString() } as Medication);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Medication Tracker</h1>
          <p className="text-slate-400">Manage your prescriptions and supplements.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary-900/50"
        >
          <Plus className="w-5 h-5" />
          <span>Add Medication</span>
        </button>
      </div>

      <div className="grid gap-4">
        {medications.length === 0 ? (
           <div className="text-slate-500 text-center py-10 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
            No medications tracked yet.
          </div>
        ) : (
          medications.map((med) => (
            <div key={med.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-slate-600 transition-colors">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-900/30 p-3 rounded-lg border border-emerald-900/50">
                  <div className="text-emerald-400 font-bold text-lg">{med.dosage}</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{med.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{med.frequency}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Started {med.startDate}</span>
                      {med.endDate && <span> • Ends {med.endDate}</span>}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(med)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onDelete(med.id)}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">
                {editingMed ? 'Edit Medication' : 'Add Medication'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Medication Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Lisinopril"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Dosage</label>
                  <input 
                    type="text" 
                    required
                    value={formData.dosage}
                    onChange={e => setFormData({...formData, dosage: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                    placeholder="e.g. 10mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Frequency</label>
                  <select 
                    value={formData.frequency}
                    onChange={e => setFormData({...formData, frequency: e.target.value as any})}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Thrice daily">Thrice daily</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">End Date (Optional)</label>
                  <input 
                    type="date" 
                    value={formData.endDate || ''}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-500 transition-colors shadow-lg shadow-primary-900/50"
                >
                  {editingMed ? 'Save Changes' : 'Add Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};