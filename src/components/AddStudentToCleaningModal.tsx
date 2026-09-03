import React, { useState, useMemo } from 'react';
import { Student, ClassRoom, CleaningDutyDay, CleaningDutyGroup } from '../types';
import { getGenderKhmer } from '../utils/formatters';
import { 
  X, 
  Search, 
  UserPlus, 
  Check, 
  Calendar, 
  Users, 
  Sparkles, 
  Filter, 
  CheckSquare, 
  Square,
  Clock 
} from 'lucide-react';

interface AddStudentToCleaningModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoom[];
  students: Student[];
  currentClassId: string;
  selectedDay: CleaningDutyDay;
  initialTimeStudy?: string;
  existingGroups: CleaningDutyGroup[];
  onAddStudents: (classId: string, dayOfWeek: CleaningDutyDay, studentIds: string[]) => void;
}

const DAY_OPTIONS: { id: CleaningDutyDay; labelKhmer: string; labelEn: string; color: string }[] = [
  { id: 'MONDAY', labelKhmer: 'ថ្ងៃច័ន្ទ', labelEn: 'Monday', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { id: 'TUESDAY', labelKhmer: 'ថ្ងៃអង្គារ', labelEn: 'Tuesday', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  { id: 'WEDNESDAY', labelKhmer: 'ថ្ងៃពុធ', labelEn: 'Wednesday', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  { id: 'THURSDAY', labelKhmer: 'ថ្ងៃព្រហស្បតិ៍', labelEn: 'Thursday', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { id: 'FRIDAY', labelKhmer: 'ថ្ងៃសុក្រ', labelEn: 'Friday', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
];

export const AddStudentToCleaningModal: React.FC<AddStudentToCleaningModalProps> = ({
  isOpen,
  onClose,
  classes,
  students,
  currentClassId,
  selectedDay: initialDay,
  initialTimeStudy = 'ALL',
  existingGroups,
  onAddStudents
}) => {
  const targetClassId = currentClassId || 'ALL';
  const [targetDay, setTargetDay] = useState<CleaningDutyDay>(initialDay || 'MONDAY');
  const [selectedTimeStudy, setSelectedTimeStudy] = useState<string>(initialTimeStudy || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUnassignedOnly, setShowUnassignedOnly] = useState<boolean>(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Update targetDay when props change
  React.useEffect(() => {
    if (initialDay) setTargetDay(initialDay);
    if (initialTimeStudy) setSelectedTimeStudy(initialTimeStudy);
    setSelectedStudentIds([]);
  }, [currentClassId, initialDay, initialTimeStudy, isOpen]);

  // All students from Student Management
  const allStudents = useMemo(() => {
    return students;
  }, [students]);

  // Available Time Study options from all students
  const availableTimeStudyOptions = useMemo(() => {
    const times = new Set<string>();
    allStudents.forEach(s => {
      const t = (s.time_study || s.timeStudy || '').trim();
      if (t) times.add(t);
    });
    return Array.from(times).sort();
  }, [allStudents]);

  // Map student ID to their assigned day(s) across all cleaning groups
  const studentAssignedDayMap = useMemo(() => {
    const map: Record<string, CleaningDutyDay[]> = {};
    existingGroups.forEach(g => {
      g.studentIds.forEach(stId => {
        if (!map[stId]) map[stId] = [];
        if (!map[stId].includes(g.dayOfWeek)) {
          map[stId].push(g.dayOfWeek);
        }
      });
    });
    return map;
  }, [existingGroups]);

  // Current day's existing group students across all groups for that day
  const alreadyInTargetDay = useMemo(() => {
    const ids = existingGroups
      .filter(g => g.dayOfWeek === targetDay)
      .flatMap(g => g.studentIds);
    return new Set(ids);
  }, [existingGroups, targetDay]);

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return allStudents.filter(st => {
      const matchesSearch = 
        st.nameKhmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.studentCode.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const sTime = (st.time_study || st.timeStudy || '').trim();
      const matchesTime = selectedTimeStudy === 'ALL' || sTime === selectedTimeStudy;
      if (!matchesTime) return false;

      if (showUnassignedOnly) {
        const assignedDays = studentAssignedDayMap[st.id] || [];
        return assignedDays.length === 0;
      }

      return true;
    });
  }, [allStudents, searchQuery, showUnassignedOnly, studentAssignedDayMap, selectedTimeStudy]);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const selectable = filteredStudents
      .filter(st => !alreadyInTargetDay.has(st.id))
      .map(st => st.id);
    setSelectedStudentIds(selectable);
  };

  const handleDeselectAll = () => {
    setSelectedStudentIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) return;
    onAddStudents(targetClassId, targetDay, selectedStudentIds);
    setSelectedStudentIds([]);
    onClose();
  };

  if (!isOpen) return null;

  const currentDayInfo = DAY_OPTIONS.find(d => d.id === targetDay) || DAY_OPTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        id="modal-add-cleaning-student"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex flex-wrap items-center gap-2">
                <span>បញ្ចូលសិស្សក្នុងក្រុមវេនសម្អាត</span>
              </h2>
              <p className="text-xs text-slate-400">
                ជ្រើសរើសថ្ងៃពីច័ន្ទ ដល់សុក្រ និងជ្រើសរើសសិស្សដើម្បីចាត់តាំងវេនសម្អាត
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Duty Day Selection (Mon - Fri) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              ជ្រើសរើសថ្ងៃវេនសម្អាត (Duty Day: Mon - Fri)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {DAY_OPTIONS.map(day => {
                const isSelected = targetDay === day.id;
                return (
                  <button
                    key={day.id}
                    type="button"
                    id={`btn-day-pick-${day.id.toLowerCase()}`}
                    onClick={() => setTargetDay(day.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <div className="font-bold text-sm">{day.labelKhmer.replace('ថ្ងៃ', '')}</div>
                    <div className="text-[11px] opacity-75">{day.labelEn}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Target Banner */}
          <div className="bg-gradient-to-r from-slate-800/80 to-indigo-950/40 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${currentDayInfo.color}`}>
                {currentDayInfo.labelKhmer} ({currentDayInfo.labelEn})
              </span>
              <span className="text-xs text-slate-300">
                សិស្សក្នុងវេនស្រាប់: <strong className="text-indigo-300">{alreadyInTargetDay.size} នាក់</strong>
              </span>
            </div>
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              បំពេញវេនបាន +20 ពិន្ទុ
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto flex-1">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="input-search-student-modal"
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខកូដសិស្ស..."
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Time Study Filter in Modal */}
              <div className="flex items-center gap-1.5 bg-slate-800/90 border border-amber-500/30 rounded-xl px-2.5 py-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <select
                  value={selectedTimeStudy}
                  onChange={e => setSelectedTimeStudy(e.target.value)}
                  className="bg-transparent text-xs text-amber-300 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900 text-white">🕒 គ្រប់ម៉ោងសិក្សា</option>
                  {availableTimeStudyOptions.map(t => (
                    <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showUnassignedOnly}
                  onChange={e => setShowUnassignedOnly(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-slate-400">បង្ហាញតែសិស្សគ្មានវេន</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center gap-1"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  ជ្រើសទាំងអស់
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-xs text-slate-400 hover:text-slate-300 transition-colors font-medium flex items-center gap-1"
                >
                  <Square className="w-3.5 h-3.5" />
                  ដោះទាំងអស់
                </button>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="border border-slate-700/80 rounded-xl divide-y divide-slate-800 bg-slate-950/40 max-h-64 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-medium">រកមិនឃើញសិស្សទេ</p>
                <p className="text-xs text-slate-500">សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬដោះការច្រោះ</p>
              </div>
            ) : (
              filteredStudents.map(student => {
                const isAlreadyInTargetDay = alreadyInTargetDay.has(student.id);
                const isSelected = selectedStudentIds.includes(student.id);
                const assignedDays = studentAssignedDayMap[student.id] || [];

                return (
                  <div
                    key={student.id}
                    onClick={() => {
                      if (!isAlreadyInTargetDay) toggleStudent(student.id);
                    }}
                    className={`p-3 flex items-center justify-between transition-colors ${
                      isAlreadyInTargetDay
                        ? 'opacity-60 bg-slate-900/50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-indigo-950/30 border-l-4 border-l-indigo-500 cursor-pointer'
                        : 'hover:bg-slate-850 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={student.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={student.nameKhmer}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px]">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                          {student.nameKhmer}
                          <span className="text-xs font-normal text-slate-400">({student.nameEnglish})</span>
                        </div>
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="font-mono text-slate-500">{student.studentCode}</span>
                          <span>•</span>
                          <span>{getGenderKhmer(student.gender)}</span>
                          {(student.time_study || student.timeStudy) && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-battambang bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{student.time_study || student.timeStudy}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAlreadyInTargetDay ? (
                        <span className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 rounded-lg text-xs font-medium">
                          មានក្នុងថ្ងៃនេះហើយ
                        </span>
                      ) : assignedDays.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {assignedDays.map(d => (
                            <span key={d} className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[10px]">
                              {d === 'MONDAY' ? 'ច័ន្ទ' : d === 'TUESDAY' ? 'អង្គារ' : d === 'WEDNESDAY' ? 'ពុធ' : d === 'THURSDAY' ? 'ព្រហស្បតិ៍' : 'សុក្រ'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          មិនទាន់មានវេន
                        </span>
                      )}

                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isAlreadyInTargetDay
                          ? 'border-slate-700 bg-slate-800 text-slate-600'
                          : isSelected
                          ? 'border-indigo-500 bg-indigo-600 text-white'
                          : 'border-slate-600 bg-slate-800'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            បានជ្រើសរើស: <strong className="text-white">{selectedStudentIds.length} នាក់</strong> សម្រាប់ <strong className="text-indigo-300">{currentDayInfo.labelKhmer}</strong>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              បោះបង់ (Cancel)
            </button>
            <button
              type="button"
              id="btn-confirm-add-students-to-group"
              onClick={handleSubmit}
              disabled={selectedStudentIds.length === 0}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedStudentIds.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              បញ្ចូលក្នុងក្រុមវេន ({selectedStudentIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
