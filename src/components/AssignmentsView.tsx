import React, { useState } from 'react';
import { Assignment, ClassRoom, Subject, Teacher } from '../types';
import { 
  ClipboardList, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FileText, 
  X, 
  Users, 
  BookOpen,
  Edit,
  Trash2,
  Sparkles,
  Award,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

interface AssignmentsViewProps {
  assignments?: Assignment[];
  classes?: ClassRoom[];
  subjects?: Subject[];
  teachers?: Teacher[];
  onSaveAssignment: (assignment: Assignment) => void;
  onDeleteAssignment?: (id: string) => void;
  searchTerm?: string;
  userRole?: string;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  assignments = [],
  classes = [],
  subjects = [],
  teachers = [],
  onSaveAssignment,
  onDeleteAssignment,
  searchTerm: globalSearch = '',
  userRole = 'SUPER_ADMIN'
}) => {
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [localSearch, setLocalSearch] = useState('');

  const [form, setForm] = useState<Partial<Assignment>>({
    titleKhmer: '',
    titleEnglish: '',
    subjectId: subjects[0]?.id || '',
    classId: classes[0]?.id || '',
    assignedByTeacherId: teachers[0]?.id || '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    maxScore: 100,
    description: '',
    status: 'ACTIVE'
  });

  const search = globalSearch || localSearch;

  const filtered = assignments.filter(a => {
    const titleK = a.titleKhmer || a.title || '';
    const subjK = a.subjectNameKhmer || '';
    const clsK = a.className || '';

    const matchesSearch = !search ||
      titleK.toLowerCase().includes(search.toLowerCase()) ||
      subjK.toLowerCase().includes(search.toLowerCase()) ||
      clsK.toLowerCase().includes(search.toLowerCase());
    
    const matchesClass = selectedClassFilter === 'ALL' || a.classId === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  // Handlers
  const handleOpenAdd = () => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែ/បន្ថែមត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចដាក់កិច្ចការថ្មីបាន!');
      return;
    }
    setEditingAssignment(null);
    setForm({
      titleKhmer: '',
      titleEnglish: '',
      subjectId: subjects[0]?.id || '',
      classId: classes[0]?.id || '',
      assignedByTeacherId: teachers[0]?.id || '',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      maxScore: 100,
      description: '',
      status: 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (asn: Assignment) => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកែប្រែកិច្ចការបាន!');
      return;
    }
    setEditingAssignment(asn);
    setForm({
      titleKhmer: asn.titleKhmer || asn.title,
      titleEnglish: asn.titleEnglish,
      subjectId: asn.subjectId,
      classId: asn.classId,
      assignedByTeacherId: asn.assignedByTeacherId,
      dueDate: asn.dueDate,
      maxScore: asn.maxScore,
      description: asn.description,
      status: asn.status
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចរក្សាទុកកិច្ចការបាន!');
      return;
    }
    if (!form.titleKhmer) {
      alert('សូមបញ្ចូលចំណងជើងកិច្ចការ');
      return;
    }

    const subj = subjects.find(s => s.id === form.subjectId);
    const cls = classes.find(c => c.id === form.classId);
    const tch = teachers.find(t => t.id === form.assignedByTeacherId);

    if (editingAssignment) {
      const updated: Assignment = {
        ...editingAssignment,
        titleKhmer: form.titleKhmer,
        titleEnglish: form.titleEnglish || '',
        title: form.titleKhmer,
        subjectId: form.subjectId || editingAssignment.subjectId,
        subjectNameKhmer: subj?.nameKhmer || editingAssignment.subjectNameKhmer,
        classId: form.classId || editingAssignment.classId,
        className: cls?.name || editingAssignment.className,
        assignedByTeacherId: form.assignedByTeacherId || editingAssignment.assignedByTeacherId,
        assignedByTeacherName: tch?.nameKhmer || editingAssignment.assignedByTeacherName,
        dueDate: form.dueDate || editingAssignment.dueDate,
        maxScore: Number(form.maxScore) || 100,
        description: form.description || '',
        status: form.status || 'ACTIVE'
      };
      onSaveAssignment(updated);
    } else {
      const newAssignment: Assignment = {
        id: `ASN-${Date.now()}`,
        titleKhmer: form.titleKhmer,
        titleEnglish: form.titleEnglish || '',
        title: form.titleKhmer,
        subjectId: form.subjectId || '',
        subjectNameKhmer: subj?.nameKhmer || 'គណិតវិទ្យា',
        classId: form.classId || '',
        className: cls?.name || 'ថ្នាក់ទី១២ A',
        assignedByTeacherId: form.assignedByTeacherId || '',
        assignedByTeacherName: tch?.nameKhmer || 'លោកគ្រូ',
        dueDate: form.dueDate || '2026-09-15',
        maxScore: Number(form.maxScore) || 100,
        description: form.description || '',
        submissionsCount: 0,
        totalStudents: cls?.capacity || 35,
        status: 'ACTIVE'
      };
      onSaveAssignment(newAssignment);
    }
    setModalOpen(false);
  };

  // Stats
  const activeCount = assignments.filter(a => a.status === 'ACTIVE').length;
  const closedCount = assignments.filter(a => a.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white font-battambang flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            <span>កិច្ចការសិស្ស & កិច្ចការផ្ទះ (Assignments & Homework)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ដាក់កិច្ចការតាមមុខវិជ្ជា កាលបរិច្ឆេទប្រគល់ និងតាមដានការបញ្ជូនកិច្ចការរបស់សិស្ស
          </p>
        </div>

        {isSuperAdmin ? (
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-500/20 font-battambang"
          >
            <Plus className="w-4 h-4" />
            <span>+ ដាក់កិច្ចការថ្មី</span>
          </button>
        ) : (
          <button
            disabled
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800/80 text-slate-400 border border-white/5 rounded-xl text-xs font-semibold cursor-not-allowed opacity-60 font-battambang"
            title="មានតែ Super Admin ប៉ុណ្ណោះដែលអាចដាក់កិច្ចការថ្មីបាន (Super Admin Only)"
          >
            <Sparkles className="w-4 h-4 text-slate-400" />
            <span>ដាក់កិច្ចការថ្មី (Super Admin)</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-3.5 rounded-3xl border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-battambang">ជ្រើសរើសថ្នាក់:</span>
          <select
            value={selectedClassFilter}
            onChange={e => setSelectedClassFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950/80 text-xs text-white rounded-xl border border-white/10 outline-none focus:border-indigo-400 font-battambang"
          >
            <option value="ALL">គ្រប់ថ្នាក់រៀន ({classes.length})</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="ស្វែងរកកិច្ចការ ឬមុខវិជ្ជា..."
            className="px-3.5 py-1.5 bg-white/5 text-xs text-white placeholder-slate-400 rounded-xl border border-white/10 outline-none focus:border-indigo-400 w-56"
          />
        </div>
      </div>

      {/* Assignments Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(asn => {
          const total = typeof asn.totalStudents === 'number' && !isNaN(asn.totalStudents) && asn.totalStudents > 0 ? asn.totalStudents : 35;
          const submitted = typeof asn.submissionsCount === 'number' && !isNaN(asn.submissionsCount) ? asn.submissionsCount : 0;
          const percent = total > 0 ? Math.min(100, Math.max(0, Math.round((submitted / total) * 100))) : 0;
          const isActive = asn.status === 'ACTIVE';

          return (
            <div
              key={asn.id}
              className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-300">
                    {asn.className}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                  }`}>
                    {isActive ? 'កំពុងដំណើរការ' : 'បានបិទបញ្ចប់'}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm font-battambang leading-snug group-hover:text-indigo-300 transition">
                  {asn.titleKhmer || asn.title}
                </h3>
                {asn.titleEnglish && (
                  <p className="text-[11px] text-slate-400 italic mt-0.5">{asn.titleEnglish}</p>
                )}

                <div className="flex items-center space-x-2 mt-2 text-xs font-battambang text-slate-300">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{asn.subjectNameKhmer}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">ពិន្ទុអតិបរមា: <strong className="text-emerald-400 font-mono">{asn.maxScore}</strong></span>
                </div>

                {asn.description && (
                  <p className="text-xs text-slate-300 font-battambang mt-2 leading-relaxed bg-white/5 p-2.5 rounded-xl border border-white/5 line-clamp-3">
                    {asn.description}
                  </p>
                )}
              </div>

              {/* Progress & Submission Stats */}
              <div className="space-y-3 pt-3 border-t border-white/10 font-battambang text-xs">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">អត្រាបញ្ជូនកិច្ចការ</span>
                    <span className="font-mono font-bold text-indigo-300">{submitted}/{total} នាក់ ({percent}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-rose-300 flex items-center space-x-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>ផុតកំណត់: {asn.dueDate}</span>
                  </span>

                  <div className="flex items-center space-x-1">
                    {isSuperAdmin ? (
                      <>
                        <button
                          onClick={() => handleOpenEdit(asn)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                          title="កែប្រែ (Super Admin)"
                        >
                          <Edit className="w-3.5 h-3.5 text-indigo-300" />
                        </button>
                        {onDeleteAssignment && (
                          <button
                            onClick={() => {
                              if (window.confirm(`លុបកិច្ចការ "${asn.titleKhmer || asn.title}"?`)) {
                                onDeleteAssignment(asn.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                            title="លុបកិច្ចការ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="p-1.5 text-slate-500 opacity-40 cursor-not-allowed" title="សិទ្ធិកែប្រែ៖ Super Admin ប៉ុណ្ណោះ">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT ASSIGNMENT */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-battambang text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ClipboardList className="w-5 h-5 text-indigo-400" />
                <span>{editingAssignment ? 'កែប្រែកិច្ចការសិស្ស' : 'ដាក់កិច្ចការថ្មី'}</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">ចំណងជើងកិច្ចការ (ខ្មែរ)*</label>
                <input
                  type="text"
                  required
                  value={form.titleKhmer}
                  onChange={e => setForm({ ...form, titleKhmer: e.target.value })}
                  placeholder="ឧ. លំហាត់ស្រាវជ្រាវគីមីវិទ្យា មេរៀនទី៣"
                  className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ជ្រើសរើសថ្នាក់*</label>
                  <select
                    value={form.classId}
                    onChange={e => setForm({ ...form, classId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">មុខវិជ្ជា*</label>
                  <select
                    value={form.subjectId}
                    onChange={e => setForm({ ...form, subjectId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.nameKhmer}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ពិន្ទុអតិបរមា (Max Score)</label>
                  <input
                    type="number"
                    value={form.maxScore}
                    onChange={e => setForm({ ...form, maxScore: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-emerald-400 font-mono font-bold outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">កាលបរិច្ឆេទផុតកំណត់</label>
                  <input
                    type="date"
                    required
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">សេចក្តីណែនាំ / បរិយាយលំហាត់</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="សេចក្តីណែនាំអំពីរបៀបធ្វើកិច្ចការ..."
                  className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20"
                >
                  រក្សាទុកកិច្ចការ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
