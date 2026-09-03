import React, { useState } from 'react';
import { Parent, Student } from '../types';
import { Plus, Search, UserCheck, Phone, Mail, MapPin, Briefcase, Users, X, Eye, MessageSquare } from 'lucide-react';

interface ParentsViewProps {
  parents?: Parent[];
  students?: Student[];
  onSaveParent: (parent: Parent) => void;
  searchTerm?: string;
}

export const ParentsView: React.FC<ParentsViewProps> = ({
  parents = [],
  students = [],
  onSaveParent,
  searchTerm: globalSearch = ''
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);

  const [formData, setFormData] = useState<Partial<Parent>>({
    nameKhmer: '',
    nameEnglish: '',
    gender: 'MALE',
    relationship: 'ឪពុក',
    phone: '',
    email: '',
    address: 'រាជធានីភ្នំពេញ',
    occupation: '',
    emergencyContact: '',
    childrenIds: []
  });

  const search = globalSearch || localSearch;

  const filteredParents = parents.filter(p =>
    p.nameKhmer.toLowerCase().includes(search.toLowerCase()) ||
    p.nameEnglish.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) ||
    p.occupation.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingParent(null);
    setFormData({
      parentCode: `PAR-2026-${String(parents.length + 1).padStart(4, '0')}`,
      nameKhmer: '',
      nameEnglish: '',
      gender: 'MALE',
      relationship: 'ឪពុក',
      phone: '',
      email: '',
      address: 'រាជធានីភ្នំពេញ',
      occupation: '',
      emergencyContact: '',
      childrenIds: []
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameKhmer || !formData.phone) return;

    const toSave: Parent = {
      id: editingParent ? editingParent.id : `PAR-${Date.now()}`,
      parentCode: formData.parentCode || `PAR-2026-${String(parents.length + 1).padStart(4, '0')}`,
      nameKhmer: formData.nameKhmer || '',
      nameEnglish: formData.nameEnglish || '',
      gender: formData.gender || 'MALE',
      relationship: formData.relationship || 'ឪពុក',
      phone: formData.phone || '',
      email: formData.email || '',
      address: formData.address || 'រាជធានីភ្នំពេញ',
      occupation: formData.occupation || '',
      emergencyContact: formData.emergencyContact || formData.phone || '',
      childrenIds: formData.childrenIds || []
    };

    onSaveParent(toSave);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-battambang">គ្រប់គ្រងមាតាបិតា និងអាណាព្យាបាល (Parents & Guardians)</h2>
          <p className="text-xs text-slate-500">បញ្ជីទំនាក់ទំនងអាណាព្យាបាល និងសិស្សដែលស្ថិតនៅក្រោមបន្ទុក</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm font-battambang"
        >
          <Plus className="w-4 h-4" />
          <span>បន្ថែមអាណាព្យាបាល</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="ស្វែងរកឈ្មោះអាណាព្យាបាល ឬលេខទូរស័ព្ទ..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Parents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParents.map(parent => {
          const linkedStudents = students.filter(s => parent.childrenIds.includes(s.id) || s.parentId === parent.id);

          return (
            <div key={parent.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition">
              
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      {parent.parentCode}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                      {parent.relationship}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open-chat-modal', {
                        detail: { recipientId: 'USR-005', tab: 'DIRECT' }
                      }));
                    }}
                    className="px-2 py-1 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200 text-[10px] font-semibold flex items-center space-x-1 transition cursor-pointer"
                    title="ជជែកផ្ទាល់"
                  >
                    <MessageSquare className="w-3 h-3 text-cyan-600" />
                    <span>ជជែក</span>
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 font-battambang text-sm mt-2">{parent.nameKhmer}</h3>
                <p className="text-[11px] text-slate-400">{parent.nameEnglish}</p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>មុខរបរ: <strong>{parent.occupation || '—'}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono font-semibold text-slate-800">{parent.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span className="truncate">{parent.address}</span>
                  </div>
                </div>
              </div>

              {/* Linked Children */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 mb-1.5 font-battambang">កូន/សិស្សក្នុងបន្ទុក:</p>
                <div className="flex flex-wrap gap-1.5">
                  {linkedStudents.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">មិនទាន់ភ្ជាប់សិស្ស</span>
                  ) : (
                    linkedStudents.map(child => (
                      <span key={child.id} className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-lg text-[11px] font-medium border border-indigo-100">
                        <Users className="w-3 h-3 text-indigo-500" />
                        <span className="font-battambang">{child.nameKhmer} ({child.className})</span>
                      </span>
                    ))
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 font-battambang text-base">បន្ថែមអាណាព្យាបាល</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ឈ្មោះជាភាសាខ្មែរ*</label>
                  <input
                    type="text"
                    required
                    value={formData.nameKhmer || ''}
                    onChange={e => setFormData({ ...formData, nameKhmer: e.target.value })}
                    placeholder="ឧ. លោក ហេង រតនា"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-battambang"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ឈ្មោះឡាតាំង</label>
                  <input
                    type="text"
                    value={formData.nameEnglish || ''}
                    onChange={e => setFormData({ ...formData, nameEnglish: e.target.value })}
                    placeholder="e.g. Heng Rathana"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ទំនាក់ទំនង</label>
                  <select
                    value={formData.relationship}
                    onChange={e => setFormData({ ...formData, relationship: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-battambang"
                  >
                    <option value="ឪពុក">ឪពុក (Father)</option>
                    <option value="ម្តាយ">ម្តាយ (Mother)</option>
                    <option value="អាណាព្យាបាល">អាណាព្យាបាល (Guardian)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">លេខទូរស័ព្ទ*</label>
                  <input
                    type="text"
                    required
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="012 xxx xxx"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">មុខរបរ</label>
                <input
                  type="text"
                  value={formData.occupation || ''}
                  onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="ឧ. វិស្វករ, ពាណិជ្ជករ, មន្ត្រីរាជការ..."
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">អាសយដ្ឋាន</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-battambang"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold font-battambang"
                >
                  រក្សាទុក
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
