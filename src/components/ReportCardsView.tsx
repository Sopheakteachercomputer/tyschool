import React, { useState } from 'react';
import { 
  Student, 
  ClassRoom, 
  Subject, 
  GradeRecord, 
  AttendanceRecord, 
  SchoolProfile 
} from '../types';
import { FileText, Printer, Award, Building, UserCheck, CheckCircle, Search, ChevronRight } from 'lucide-react';
import { calculateKhmerGrade, getStudentDefaultAvatar } from '../utils/formatters';

interface ReportCardsViewProps {
  students: Student[];
  classes: ClassRoom[];
  subjects: Subject[];
  gradeRecords: GradeRecord[];
  attendanceRecords: AttendanceRecord[];
  school: SchoolProfile;
  onOpenReportCardModal: (student: Student) => void;
  onOpenCertificateModal?: (student: Student) => void;
}

export const ReportCardsView: React.FC<ReportCardsViewProps> = ({
  students = [],
  classes = [],
  subjects = [],
  gradeRecords = [],
  attendanceRecords = [],
  school,
  onOpenReportCardModal,
  onOpenCertificateModal
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'CLS-12A');
  const [selectedSemester, setSelectedSemester] = useState<'ឆមាសទី១' | 'ឆមាសទី២' | 'ប្រចាំឆ្នាំ'>('ឆមាសទី១');
  const [search, setSearch] = useState('');

  const classStudents = students.filter(s => s.classId === selectedClassId);
  const currentClass = classes.find(c => c.id === selectedClassId);

  const filteredStudents = classStudents.filter(s =>
    s.nameKhmer.toLowerCase().includes(search.toLowerCase()) ||
    s.nameEnglish.toLowerCase().includes(search.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-battambang">មជ្ឈមណ្ឌលព្រឹត្តិបត្រពិន្ទុ (Report Cards Center)</h2>
          <p className="text-xs text-slate-500">បង្កើត បោះពុម្ព និងផ្ទៀងផ្ទាត់សៀវភៅតាមដានការសិក្សា និងប័ណ្ណសរសើរផ្លូវការ</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm font-battambang"
          >
            <Printer className="w-4 h-4" />
            <span>បោះពុម្ពទាំងថ្នាក់ (Batch Print)</span>
          </button>
        </div>
      </div>

      {/* Selector Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Class Select */}
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-slate-400" />
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 text-xs text-slate-800 font-semibold rounded-xl border border-slate-200 outline-none font-battambang"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.room})</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 text-xs text-slate-800 font-semibold rounded-xl border border-slate-200 outline-none font-battambang"
            >
              <option value="ឆមាសទី១">ឆមាសទី១ (Semester 1)</option>
              <option value="ឆមាសទី២">ឆមាសទី២ (Semester 2)</option>
              <option value="ប្រចាំឆ្នាំ">លទ្ធផលប្រចាំឆ្នាំ (Annual Result)</option>
            </select>
          </div>

        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ស្វែងរកសិស្សក្នុងថ្នាក់..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white outline-none font-battambang"
          />
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student, idx) => {
          // Calculate student average from grade records
          const sGrades = gradeRecords.filter(g => g.studentId === student.id);
          const totalScore = sGrades.reduce((sum, g) => sum + g.score, 0);
          const avg = sGrades.length > 0 ? Number((totalScore / sGrades.length).toFixed(2)) : 82.5;
          const gradeInfo = calculateKhmerGrade(avg);
          const rank = idx + 1; // sample rank

          return (
            <div key={student.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between space-y-4">
              
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {student.studentCode}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-400">ចំណាត់ថ្នាក់:</span>
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold font-mono text-xs ${
                      rank === 1 ? 'bg-amber-400 text-slate-900' :
                      rank === 2 ? 'bg-slate-300 text-slate-900' :
                      rank === 3 ? 'bg-amber-200 text-amber-900' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {rank}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3.5 mt-3">
                  <img 
                    src={getStudentDefaultAvatar(student)} 
                    alt={student.nameKhmer} 
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs bg-slate-100"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = getStudentDefaultAvatar({ gender: student.gender });
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 font-battambang text-sm">{student.nameKhmer}</h3>
                    <p className="text-[11px] text-slate-400">{student.nameEnglish}</p>
                    <p className="text-[11px] text-slate-500 font-battambang mt-0.5">{student.className}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">មធ្យមភាគ</span>
                    <span className="font-extrabold text-slate-900 font-mono text-sm">{avg}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">និទ្ទេស</span>
                    <span className={`font-bold font-mono text-sm ${
                      gradeInfo.letter === 'A' ? 'text-emerald-600' :
                      gradeInfo.letter === 'B' ? 'text-blue-600' : 'text-slate-800'
                    }`}>
                      {gradeInfo.letter} ({gradeInfo.khmer})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">លទ្ធផល</span>
                    <span className="font-bold text-emerald-600 text-xs">ជាប់ (Pass)</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {onOpenCertificateModal && rank <= 3 ? (
                  <button
                    onClick={() => onOpenCertificateModal(student)}
                    className="flex items-center space-x-1 text-amber-700 hover:text-amber-800 text-xs font-semibold"
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>ប័ណ្ណសរសើរ</span>
                  </button>
                ) : <div />}

                <button
                  onClick={() => onOpenReportCardModal(student)}
                  className="flex items-center space-x-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-xs font-battambang"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>បើកព្រឹត្តិបត្រពិន្ទុ</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
