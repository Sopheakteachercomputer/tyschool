import React, { useState } from 'react';
import { TimetableSlot, ClassRoom, Subject, Teacher, SchoolProfile } from '../types';
import { Clock, Building, Printer, Calendar, User, BookOpen, Plus, X } from 'lucide-react';

interface TimetableViewProps {
  slots: TimetableSlot[];
  classes: ClassRoom[];
  subjects: Subject[];
  teachers: Teacher[];
  school: SchoolProfile;
  onSaveSlot: (slot: TimetableSlot) => void;
}

const PERIOD_TIMES = [
  { period: 1, time: '07:00 - 07:50' },
  { period: 2, time: '07:55 - 08:45' },
  { period: 3, time: '09:05 - 09:55' }, // Break between 08:45 - 09:05
  { period: 4, time: '10:00 - 10:50' },
  { period: 5, time: '10:55 - 11:45' }
];

const DAYS = [
  { key: 'MONDAY', khmer: 'ថ្ងៃចន្ទ', english: 'Monday' },
  { key: 'TUESDAY', khmer: 'ថ្ងៃអង្គារ', english: 'Tuesday' },
  { key: 'WEDNESDAY', khmer: 'ថ្ងៃពុធ', english: 'Wednesday' },
  { key: 'THURSDAY', khmer: 'ថ្ងៃព្រហស្បតិ៍', english: 'Thursday' },
  { key: 'FRIDAY', khmer: 'ថ្ងៃសុក្រ', english: 'Friday' },
  { key: 'SATURDAY', khmer: 'ថ្ងៃសៅរ៍', english: 'Saturday' }
];

export const TimetableView: React.FC<TimetableViewProps> = ({
  slots = [],
  classes = [],
  subjects = [],
  teachers = [],
  school,
  onSaveSlot
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'CLS-12A');
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState<Partial<TimetableSlot>>({
    classId: selectedClassId,
    dayOfWeek: 'MONDAY',
    periodNumber: 1,
    startTime: '07:00',
    endTime: '07:50',
    subjectId: subjects[0]?.id || '',
    teacherId: teachers[0]?.id || '',
    room: 'បន្ទប់ A101'
  });

  const currentClass = classes.find(c => c.id === selectedClassId);

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find(s => s.id === form.subjectId);
    const tch = teachers.find(t => t.id === form.teacherId);
    const period = PERIOD_TIMES.find(p => p.period === Number(form.periodNumber));

    const newSlot: TimetableSlot = {
      id: `TTS-${Date.now()}`,
      classId: selectedClassId,
      dayOfWeek: form.dayOfWeek as any || 'MONDAY',
      periodNumber: Number(form.periodNumber) || 1,
      startTime: period?.time.split(' - ')[0] || '07:00',
      endTime: period?.time.split(' - ')[1] || '07:50',
      subjectId: form.subjectId || '',
      subjectNameKhmer: subj?.nameKhmer || '',
      teacherId: form.teacherId || '',
      teacherNameKhmer: tch?.nameKhmer || '',
      room: form.room || currentClass?.room || 'បន្ទប់ A101'
    };

    onSaveSlot(newSlot);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-battambang">កាលវិភាគបង្រៀន & រៀន (Class Timetable)</h2>
          <p className="text-xs text-slate-500">កាលវិភាគប្រចាំសប្តាហ៍ (ចន្ទ-សៅរ៍) វេនសិក្សា និងការបែងចែកម៉ោងបង្រៀន</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>បោះពុម្ពកាលវិភាគ</span>
          </button>

          <button
            onClick={() => {
              setForm({ ...form, classId: selectedClassId, room: currentClass?.room || 'បន្ទប់ A101' });
              setModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm font-battambang"
          >
            <Plus className="w-4 h-4" />
            <span>បន្ថែមម៉ោងរៀន</span>
          </button>
        </div>
      </div>

      {/* Class Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between no-print">
        <div className="flex items-center space-x-3">
          <Building className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700 font-battambang">ជ្រើសរើសថ្នាក់រៀន:</span>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-3.5 py-1.5 bg-slate-50 text-xs text-slate-900 font-bold rounded-xl border border-slate-200 outline-none font-battambang"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.room}) - គ្រូបន្ទុក: {c.teacherName}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          <span>វេនព្រឹក: <strong>07:00 - 11:45</strong> (ចេញលេង 08:45 - 09:05)</span>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden print:border-none print:shadow-none">
        
        {/* Printable Header for print mode */}
        <div className="hidden print:block p-6 text-center border-b border-slate-300">
          <h2 className="text-lg font-bold font-battambang">{school.nameKhmer}</h2>
          <h3 className="text-sm font-bold font-battambang text-indigo-800">កាលវិភាគសិក្សា {currentClass?.name} - ឆ្នាំសិក្សា {school.academicYear}</h3>
          <p className="text-xs text-slate-600">បន្ទប់រៀន: {currentClass?.room} | គ្រូបន្ទុកថ្នាក់: {currentClass?.teacherName}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-battambang">
                <th className="py-3.5 px-3 w-28 border-r border-slate-800">ម៉ោងសិក្សា (Period)</th>
                {DAYS.map(day => (
                  <th key={day.key} className="py-3.5 px-3 border-r border-slate-800 last:border-r-0">
                    <span className="block font-bold text-sm leading-tight">{day.khmer}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{day.english}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {PERIOD_TIMES.map(period => (
                <tr key={period.period} className="hover:bg-slate-50/60 transition">
                  
                  {/* Period Time Header */}
                  <td className="py-4 px-2 bg-slate-50 font-bold border-r border-slate-200">
                    <span className="block text-indigo-700 font-battambang font-extrabold">ម៉ោងទី {period.period}</span>
                    <span className="font-mono text-[10px] text-slate-500 font-normal">{period.time}</span>
                  </td>

                  {/* Day Slots */}
                  {DAYS.map(day => {
                    const slot = slots.find(
                      s => s.classId === selectedClassId && s.dayOfWeek === day.key && s.periodNumber === period.period
                    );

                    return (
                      <td key={day.key} className="py-3 px-2 border-r border-slate-100 last:border-r-0 align-top">
                        {slot ? (
                          <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 hover:border-indigo-300 transition text-left space-y-1">
                            <p className="font-bold text-slate-900 font-battambang text-xs leading-tight">
                              {slot.subjectNameKhmer}
                            </p>
                            <p className="text-[11px] text-indigo-700 font-medium font-battambang truncate flex items-center space-x-1">
                              <User className="w-3 h-3 text-indigo-500 shrink-0" />
                              <span className="truncate">{slot.teacherNameKhmer}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">{slot.room}</p>
                          </div>
                        ) : (
                          <div className="h-14 flex items-center justify-center text-slate-300 text-[11px] italic">
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add Slot Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900 font-battambang text-base">បន្ថែមម៉ោងរៀនក្នុងកាលវិភាគ</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ថ្ងៃក្នុងសប្តាហ៍</label>
                  <select
                    value={form.dayOfWeek}
                    onChange={e => setForm({ ...form, dayOfWeek: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-battambang"
                  >
                    {DAYS.map(d => (
                      <option key={d.key} value={d.key}>{d.khmer}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">ម៉ោងទី (Period)</label>
                  <select
                    value={form.periodNumber}
                    onChange={e => setForm({ ...form, periodNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-battambang"
                  >
                    {PERIOD_TIMES.map(p => (
                      <option key={p.period} value={p.period}>ម៉ោងទី {p.period} ({p.time})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">មុខវិជ្ជា (Subject)*</label>
                <select
                  value={form.subjectId}
                  onChange={e => setForm({ ...form, subjectId: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-battambang"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.nameKhmer} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">គ្រូបង្រៀន (Teacher)*</label>
                <select
                  value={form.teacherId}
                  onChange={e => setForm({ ...form, teacherId: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-battambang"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.nameKhmer} ({t.specialization})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">បន្ទប់សិក្សា</label>
                <input
                  type="text"
                  value={form.room || ''}
                  onChange={e => setForm({ ...form, room: e.target.value })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200"
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
