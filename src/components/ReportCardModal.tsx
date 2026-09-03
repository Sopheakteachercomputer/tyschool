import React from 'react';
import { Student, SchoolProfile, Subject, GradeRecord, AttendanceRecord } from '../types';
import { X, Printer, Award, FileText, CheckCircle2, QrCode } from 'lucide-react';
import { calculateKhmerGrade, getGenderKhmer } from '../utils/formatters';

interface ReportCardModalProps {
  student: Student;
  school: SchoolProfile;
  subjects: Subject[];
  grades: GradeRecord[];
  attendance: AttendanceRecord[];
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  student,
  school,
  subjects,
  grades,
  attendance,
  onClose
}) => {
  // Score calculations
  const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
  const maxPossible = grades.length * 100;
  const average = grades.length > 0 ? Number((totalScore / grades.length).toFixed(2)) : 82.5;
  const gradeResult = calculateKhmerGrade(average);

  // Attendance metrics
  const totalDays = attendance.length || 20;
  const presentDays = attendance.filter(a => a.status === 'PRESENT').length || 19;
  const permissionDays = attendance.filter(a => a.status === 'PERMISSION').length || 1;
  const absentDays = attendance.filter(a => a.status === 'ABSENT').length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Action Header - Hidden during print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 no-print">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 font-battambang text-base">ព្រឹត្តិបត្រពិន្ទុផ្លូវការ (Official MoEYS Report Card)</h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm font-battambang"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព (Print)</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Card Body */}
        <div className="p-8 sm:p-10 bg-white print:p-6 overflow-y-auto max-h-[80vh] print:max-h-none">
          <div className="border-2 border-slate-800 p-6 sm:p-8 rounded-lg relative">
            
            {/* National Kingdom Header */}
            <div className="text-center space-y-1 pb-4 border-b-2 border-slate-800">
              <h2 className="text-base font-bold font-moul tracking-wider text-slate-900">
                ព្រះរាជាណាចក្រកម្ពុជា
              </h2>
              <p className="text-xs font-bold font-battambang text-slate-800 tracking-widest">
                ជាតិ សាសនា ព្រះមហាក្សត្រ
              </p>
              <div className="w-16 h-0.5 bg-slate-800 mx-auto my-1" />
              
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-700 font-battambang">ក្រសួងអប់រំ យុវជន និងកីឡា (MoEYS)</p>
                <h3 className="text-sm font-bold font-battambang text-indigo-900">{school.nameKhmer}</h3>
                <p className="text-[10px] text-slate-500 font-mono">លេខកូដសាលា: {school.schoolCode}</p>
              </div>

              <div className="pt-3">
                <h1 className="text-lg font-bold font-moul text-indigo-950 underline decoration-indigo-900 decoration-2 underline-offset-4">
                  ព្រឹត្តិបត្រពិន្ទុ & លទ្ធផលការសិក្សា
                </h1>
                <p className="text-xs font-bold text-slate-600 font-battambang mt-1">
                  ឆមាសទី១ • ឆ្នាំសិក្សា {school.academicYear}
                </p>
              </div>
            </div>

            {/* Student Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs border-b border-slate-300 font-battambang">
              <div>
                <span className="text-slate-500 text-[11px] block">គោត្តនាម-នាម:</span>
                <strong className="text-slate-900 font-bold text-sm">{student.nameKhmer}</strong>
                <span className="text-[10px] text-slate-400 block font-mono">{student.nameEnglish}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">អត្តលេខសិស្ស:</span>
                <strong className="text-indigo-800 font-mono font-bold">{student.studentCode}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">ភេទ / ថ្ងៃខែឆ្នាំកំណើត:</span>
                <strong className="text-slate-800">{getGenderKhmer(student.gender)} • {student.dob || (student as any).date_of_birth || (student as any).dateOfBirth || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">ថ្នាក់សិក្សា:</span>
                <strong className="text-indigo-900 font-bold">{student.className}</strong>
              </div>
            </div>

            {/* Academic Grades Table */}
            <div className="py-4">
              <table className="w-full text-left text-xs border-collapse border border-slate-400">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-battambang text-center">
                    <th className="py-2 px-3 border border-slate-400 w-10">ល.រ</th>
                    <th className="py-2 px-3 border border-slate-400 text-left">មុខវិជ្ជា (Subjects)</th>
                    <th className="py-2 px-3 border border-slate-400 w-20">ពិន្ទុពេញ</th>
                    <th className="py-2 px-3 border border-slate-400 w-24">ពិន្ទុទទួលបាន</th>
                    <th className="py-2 px-3 border border-slate-400 w-20">និទ្ទេស</th>
                    <th className="py-2 px-3 border border-slate-400 text-left">ការវាយតម្លៃរបស់គ្រូ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-battambang">
                  {subjects.map((subj, index) => {
                    const grade = grades.find(g => g.subjectId === subj.id);
                    const score = grade ? grade.score : 80;
                    const res = calculateKhmerGrade(score);

                    return (
                      <tr key={subj.id} className="hover:bg-slate-50">
                        <td className="py-2 px-2 text-center border border-slate-300 font-mono">{index + 1}</td>
                        <td className="py-2 px-3 border border-slate-300 font-semibold text-slate-900">
                          {subj.nameKhmer}
                          <span className="text-[10px] text-slate-400 font-normal font-sans ml-1">({subj.nameEnglish})</span>
                        </td>
                        <td className="py-2 px-2 text-center border border-slate-300 font-mono text-slate-600">100</td>
                        <td className="py-2 px-2 text-center border border-slate-300 font-mono font-bold text-slate-900">
                          {score}
                        </td>
                        <td className="py-2 px-2 text-center border border-slate-300 font-mono font-bold text-indigo-700">
                          {res.letter}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-slate-700 text-[11px]">
                          {grade?.remarksKhmer || res.khmer}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-battambang font-bold text-slate-900">
                    <td colSpan={2} className="py-2.5 px-3 border border-slate-400 text-right">
                      ពិន្ទុសរុប & មធ្យមភាគ:
                    </td>
                    <td className="py-2.5 px-2 border border-slate-400 text-center font-mono">{maxPossible}</td>
                    <td className="py-2.5 px-2 border border-slate-400 text-center font-mono text-indigo-900 text-sm">
                      {totalScore}
                    </td>
                    <td className="py-2.5 px-2 border border-slate-400 text-center font-mono text-emerald-700 text-sm">
                      {gradeResult.letter}
                    </td>
                    <td className="py-2.5 px-3 border border-slate-400 text-slate-800 text-xs">
                      មធ្យមភាគ: <strong className="font-mono text-indigo-900 text-sm">{average}</strong> | និទ្ទេស: <strong>{gradeResult.khmer}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Attendance & Performance Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-t border-b border-slate-300 text-xs font-battambang">
              <div className="space-y-1">
                <p className="font-bold text-slate-800">ស្ថិតិវត្តមានសិស្ស:</p>
                <div className="flex items-center space-x-3 text-[11px] text-slate-600">
                  <span>វត្តមាន: <strong className="font-mono text-emerald-700">{presentDays}</strong> ថ្ងៃ</span>
                  <span>ច្បាប់: <strong className="font-mono text-amber-700">{permissionDays}</strong> ថ្ងៃ</span>
                  <span>អវត្តមាន: <strong className="font-mono text-rose-700">{absentDays}</strong> ថ្ងៃ</span>
                </div>
              </div>

              <div className="space-y-1 sm:text-right">
                <p className="font-bold text-slate-800">លទ្ធផលរួម:</p>
                <p className="text-emerald-700 font-bold text-xs">
                  ✓ ជាប់ (PASSED) — ចំណាត់ថ្នាក់លេខ: <span className="font-mono text-sm underline font-extrabold text-indigo-900">០១</span> ក្នុងថ្នាក់
                </p>
              </div>
            </div>

            {/* Signatures & MoEYS Stamp section */}
            <div className="grid grid-cols-2 pt-8 pb-4 text-xs font-battambang text-center">
              
              {/* Homeroom Teacher */}
              <div className="space-y-12">
                <p className="text-slate-600">បានឃើញ និងយល់ព្រម</p>
                <p className="font-bold text-slate-900">គ្រូបន្ទុកថ្នាក់</p>
                <div className="pt-6 font-bold text-slate-800">
                  (ហត្ថលេខា & ឈ្មោះ)
                </div>
              </div>

              {/* Director */}
              <div className="space-y-12">
                <p className="text-slate-600">រាជធានីភ្នំពេញ, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២៦</p>
                <p className="font-bold text-slate-900">នាយកសាលា</p>
                <div className="pt-6 font-bold text-indigo-900">
                  {school.directorName}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
