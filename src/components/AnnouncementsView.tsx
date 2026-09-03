import React, { useState } from 'react';
import { Announcement, SchoolEvent, UserRole } from '../types';
import { 
  Megaphone, 
  Calendar, 
  Plus, 
  Pin, 
  AlertCircle, 
  Clock, 
  X, 
  CheckCircle,
  Edit,
  Trash2,
  Users,
  Sparkles,
  Flag,
  Share2,
  CalendarCheck2
} from 'lucide-react';

interface AnnouncementsViewProps {
  announcements?: Announcement[];
  events?: SchoolEvent[];
  onSaveAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement?: (id: string) => void;
  onSaveEvent: (event: SchoolEvent) => void;
  onDeleteEvent?: (id: string) => void;
  userRole?: UserRole;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements = [],
  events = [],
  onSaveAnnouncement,
  onDeleteAnnouncement,
  onSaveEvent,
  onDeleteEvent,
  userRole
}) => {
  const [tab, setTab] = useState<'ANNOUNCEMENTS' | 'EVENTS'>('ANNOUNCEMENTS');
  const [annModalOpen, setAnnModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);

  // Announcement Form
  const [annForm, setAnnForm] = useState<Partial<Announcement>>({
    titleKhmer: '',
    titleEnglish: '',
    contentKhmer: '',
    contentEnglish: '',
    priority: 'NORMAL',
    targetRoles: ['STUDENT', 'TEACHER', 'PARENT'],
    isPinned: false
  });

  // Event Form
  const [eventForm, setEventForm] = useState<Partial<SchoolEvent>>({
    titleKhmer: '',
    titleEnglish: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'EVENT'
  });

  // Announcement Handlers
  const handleOpenAddAnn = () => {
    setEditingAnn(null);
    setAnnForm({
      titleKhmer: '',
      titleEnglish: '',
      contentKhmer: '',
      contentEnglish: '',
      priority: 'NORMAL',
      targetRoles: ['STUDENT', 'TEACHER', 'PARENT'],
      isPinned: false
    });
    setAnnModalOpen(true);
  };

  const handleOpenEditAnn = (ann: Announcement) => {
    setEditingAnn(ann);
    setAnnForm({
      titleKhmer: ann.titleKhmer,
      titleEnglish: ann.titleEnglish,
      contentKhmer: ann.contentKhmer,
      contentEnglish: ann.contentEnglish,
      priority: ann.priority,
      targetRoles: ann.targetRoles,
      isPinned: ann.isPinned
    });
    setAnnModalOpen(true);
  };

  const handleSaveAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.titleKhmer) {
      alert('សូមបញ្ចូលចំណងជើងដំណឹង');
      return;
    }

    if (editingAnn) {
      const updated: Announcement = {
        ...editingAnn,
        titleKhmer: annForm.titleKhmer,
        titleEnglish: annForm.titleEnglish || '',
        contentKhmer: annForm.contentKhmer || '',
        contentEnglish: annForm.contentEnglish || '',
        priority: annForm.priority || 'NORMAL',
        targetRoles: annForm.targetRoles || ['STUDENT', 'TEACHER', 'PARENT'],
        isPinned: annForm.isPinned || false
      };
      onSaveAnnouncement(updated);
    } else {
      const newAnn: Announcement = {
        id: `ANN-${Date.now()}`,
        titleKhmer: annForm.titleKhmer,
        titleEnglish: annForm.titleEnglish || '',
        contentKhmer: annForm.contentKhmer || '',
        contentEnglish: annForm.contentEnglish || '',
        targetRoles: annForm.targetRoles || ['STUDENT', 'TEACHER', 'PARENT'],
        priority: annForm.priority || 'NORMAL',
        createdAt: new Date().toISOString().split('T')[0],
        authorName: 'គណៈនាយកសាលា',
        isPinned: annForm.isPinned || false
      };
      onSaveAnnouncement(newAnn);
    }
    setAnnModalOpen(false);
  };

  // Event Handlers
  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setEventForm({
      titleKhmer: '',
      titleEnglish: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      type: 'EVENT'
    });
    setEventModalOpen(true);
  };

  const handleOpenEditEvent = (ev: SchoolEvent) => {
    setEditingEvent(ev);
    setEventForm({
      titleKhmer: ev.titleKhmer,
      titleEnglish: ev.titleEnglish,
      description: ev.description,
      startDate: ev.startDate,
      endDate: ev.endDate,
      type: ev.type
    });
    setEventModalOpen(true);
  };

  const handleSaveEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.titleKhmer) {
      alert('សូមបញ្ចូលឈ្មោះកម្មវិធី ឬព្រឹត្តិការណ៍');
      return;
    }

    if (editingEvent) {
      const updated: SchoolEvent = {
        ...editingEvent,
        titleKhmer: eventForm.titleKhmer,
        titleEnglish: eventForm.titleEnglish || '',
        description: eventForm.description || '',
        startDate: eventForm.startDate || '2026-09-01',
        endDate: eventForm.endDate || '2026-09-01',
        type: eventForm.type || 'EVENT'
      };
      onSaveEvent(updated);
    } else {
      const newEv: SchoolEvent = {
        id: `EV-${Date.now()}`,
        titleKhmer: eventForm.titleKhmer,
        titleEnglish: eventForm.titleEnglish || '',
        description: eventForm.description || '',
        startDate: eventForm.startDate || '2026-09-01',
        endDate: eventForm.endDate || '2026-09-01',
        type: eventForm.type || 'EVENT'
      };
      onSaveEvent(newEv);
    }
    setEventModalOpen(false);
  };

  // Sort pinned announcements to top
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white font-battambang flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            <span>ដំណឹង & ប្រតិទិនព្រឹត្តិការណ៍ (Announcements & Events)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ការជូនដំណឹងផ្លូវការ បុណ្យជាតិខ្មែរ ប្រតិទិនប្រឡង និងទិវាវប្បធម៌សាលា
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {tab === 'ANNOUNCEMENTS' ? (
            <button
              onClick={handleOpenAddAnn}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-500/20 font-battambang"
            >
              <Plus className="w-4 h-4" />
              <span>+ បង្កើតសេចក្តីជូនដំណឹង</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddEvent}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/20 font-battambang"
            >
              <Plus className="w-4 h-4" />
              <span>+ បន្ថែមព្រឹត្តិការណ៍ថ្មី</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-3 rounded-3xl border border-white/10 shadow-lg flex items-center justify-between">
        <div className="flex space-x-1 font-battambang text-xs">
          <button
            onClick={() => setTab('ANNOUNCEMENTS')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              tab === 'ANNOUNCEMENTS'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            សេចក្តីជូនដំណឹង ({announcements.length})
          </button>
          <button
            onClick={() => setTab('EVENTS')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              tab === 'EVENTS'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ប្រតិទិនព្រឹត្តិការណ៍ ({events.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ANNOUNCEMENTS CARDS */}
      {tab === 'ANNOUNCEMENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedAnnouncements.map(ann => {
            const isUrgent = ann.priority === 'URGENT';
            const isHigh = ann.priority === 'HIGH';

            return (
              <div
                key={ann.id}
                className={`bg-slate-900/60 backdrop-blur-xl rounded-3xl border shadow-lg p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition relative overflow-hidden ${
                  ann.isPinned ? 'border-indigo-500/40 bg-indigo-950/20' : 'border-white/10'
                }`}
              >
                {ann.isPinned && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-xl flex items-center space-x-1 shadow">
                    <Pin className="w-3 h-3" />
                    <span>ខ្ទាស់លើគេ</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isUrgent
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : isHigh
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}>
                      {isUrgent ? '🚨 បន្ទាន់បំផុត' : isHigh ? '⚠️ សំខាន់' : '📢 ដំណឹងទូទៅ'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{ann.createdAt}</span>
                  </div>

                  <h3 className="font-bold text-white text-base font-battambang leading-snug">
                    {ann.titleKhmer}
                  </h3>
                  {ann.titleEnglish && (
                    <p className="text-xs text-slate-400 italic mt-0.5">{ann.titleEnglish}</p>
                  )}

                  <p className="text-xs text-slate-300 font-battambang mt-3 leading-relaxed whitespace-pre-line">
                    {ann.contentKhmer}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-battambang">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-400">ផ្ញើជូន:</span>
                    {ann.targetRoles.map(r => (
                      <span key={r} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] text-slate-300">
                        {r === 'STUDENT' ? 'សិស្ស' : r === 'TEACHER' ? 'លោកគ្រូ-អ្នកគ្រូ' : 'មាតាបិតា'}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditAnn(ann)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                      title="កែប្រែ"
                    >
                      <Edit className="w-3.5 h-3.5 text-indigo-300" />
                    </button>
                    {onDeleteAnnouncement && (
                      <button
                        onClick={() => {
                          if (window.confirm(`លុបសេចក្តីជូនដំណឹងនេះ?`)) {
                            onDeleteAnnouncement(ann.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                        title="លុប"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: EVENTS LIST */}
      {tab === 'EVENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(ev => {
            const isHoliday = ev.type === 'HOLIDAY';
            const isExam = ev.type === 'EXAM';

            return (
              <div
                key={ev.id}
                className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isHoliday
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : isExam
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {isHoliday ? '🇰🇭 បុណ្យជាតិ' : isExam ? '📝 ការប្រឡង' : '🎉 កម្មវិធីសាលា'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{ev.startDate}</span>
                  </div>

                  <h3 className="font-bold text-white text-sm font-battambang leading-snug">
                    {ev.titleKhmer}
                  </h3>
                  {ev.titleEnglish && (
                    <p className="text-[11px] text-slate-400 italic mt-0.5">{ev.titleEnglish}</p>
                  )}

                  {ev.description && (
                    <p className="text-xs text-slate-300 font-battambang mt-2 leading-relaxed">
                      {ev.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-battambang">
                  <span className="text-[11px] font-mono text-emerald-400">
                    {ev.startDate === ev.endDate ? ev.startDate : `${ev.startDate} ដល់ ${ev.endDate}`}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditEvent(ev)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                      title="កែប្រែ"
                    >
                      <Edit className="w-3.5 h-3.5 text-indigo-300" />
                    </button>
                    {onDeleteEvent && (
                      <button
                        onClick={() => {
                          if (window.confirm(`លុបព្រឹត្តិការណ៍នេះ?`)) {
                            onDeleteEvent(ev.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                        title="លុប"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT ANNOUNCEMENT */}
      {annModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-battambang text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-indigo-400" />
                <span>{editingAnn ? 'កែប្រែសេចក្តីជូនដំណឹង' : 'បង្កើតសេចក្តីជូនដំណឹងថ្មី'}</span>
              </h3>
              <button onClick={() => setAnnModalOpen(false)} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">ចំណងជើងដំណឹង (ខ្មែរ)*</label>
                <input
                  type="text"
                  required
                  value={annForm.titleKhmer}
                  onChange={e => setAnnForm({ ...annForm, titleKhmer: e.target.value })}
                  placeholder="ឧ. សេចក្តីជូនដំណឹងស្តីពីការឈប់សម្រាកបុណ្យភ្ជុំបិណ្ឌ"
                  className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ចំណងជើងជាភាសាអង់គ្លេស</label>
                <input
                  type="text"
                  value={annForm.titleEnglish}
                  onChange={e => setAnnForm({ ...annForm, titleEnglish: e.target.value })}
                  placeholder="e.g. School Holiday for Pchum Ben Festival"
                  className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-200 outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ខ្លឹមសារដំណឹង*</label>
                <textarea
                  rows={4}
                  required
                  value={annForm.contentKhmer}
                  onChange={e => setAnnForm({ ...annForm, contentKhmer: e.target.value })}
                  placeholder="សូមជម្រាបជូនលោកគ្រូ អ្នកគ្រូ មាតាបិតា និងសិស្សានុសិស្សទាំងអស់..."
                  className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">កម្រិតអាទិភាព</label>
                  <select
                    value={annForm.priority}
                    onChange={e => setAnnForm({ ...annForm, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                  >
                    <option value="NORMAL">ធម្មតា (Normal)</option>
                    <option value="HIGH">សំខាន់ (High)</option>
                    <option value="URGENT">បន្ទាន់បំផុត (Urgent)</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={annForm.isPinned}
                      onChange={e => setAnnForm({ ...annForm, isPinned: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-white/20"
                    />
                    <span>ខ្ទាស់លើគេ (Pin to Top)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAnnModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20"
                >
                  ផ្សាយដំណឹង
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT EVENT */}
      {eventModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-battambang text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-teal-400" />
                <span>{editingEvent ? 'កែប្រែព្រឹត្តិការណ៍' : 'បន្ថែមព្រឹត្តិការណ៍ថ្មី'}</span>
              </h3>
              <button onClick={() => setEventModalOpen(false)} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEventSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">ឈ្មោះកម្មវិធី / ព្រឹត្តិការណ៍ (ខ្មែរ)*</label>
                <input
                  type="text"
                  required
                  value={eventForm.titleKhmer}
                  onChange={e => setEventForm({ ...eventForm, titleKhmer: e.target.value })}
                  placeholder="ឧ. ពិធីបុណ្យចូលឆ្នាំខ្មែរ ប្រពៃណីជាតិ"
                  className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ថ្ងៃចាប់ផ្តើម (Start Date)*</label>
                  <input
                    type="date"
                    required
                    value={eventForm.startDate}
                    onChange={e => setEventForm({ ...eventForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ថ្ងៃបញ្ចប់ (End Date)</label>
                  <input
                    type="date"
                    value={eventForm.endDate}
                    onChange={e => setEventForm({ ...eventForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ប្រភេទព្រឹត្តិការណ៍</label>
                <select
                  value={eventForm.type}
                  onChange={e => setEventForm({ ...eventForm, type: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                >
                  <option value="HOLIDAY">🇰🇭 បុណ្យជាតិ / ឈប់សម្រាក (Holiday)</option>
                  <option value="EXAM">📝 សម័យប្រឡង (Exam Session)</option>
                  <option value="CULTURAL">🎉 ទិវាវប្បធម៌ & សិល្បៈ (Cultural)</option>
                  <option value="MEETING">👥 កិច្ចប្រជុំមាតាបិតា (Meeting)</option>
                  <option value="EVENT">🏫 កម្មវិធីទូទៅ (School Event)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ព័ត៌មានបន្ថែម (Description)</label>
                <textarea
                  rows={3}
                  value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="ព័ត៌មានលម្អិត..."
                  className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-200 outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20"
                >
                  រក្សាទុកព្រឹត្តិការណ៍
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
