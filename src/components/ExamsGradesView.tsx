import React, { useState } from 'react';
import { 
  Student, 
  Subject, 
  ClassRoom, 
  Exam, 
  GradeRecord, 
  SchoolProfile 
} from '../types';
import { 
  Award, 
  Save, 
  Download, 
  Filter, 
  CheckCheck, 
  Building, 
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  Plus,
  X,
  FileText,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { calculateKhmerGrade, exportToCSV, getGenderKhmer } from '../utils/formatters';

interface ExamsGradesViewProps {
  students?: Student[];
  subjects?: Subject[];
  classes?: ClassRoom[];
  exams?: Exam[];
  gradeRecords?: GradeRecord[];
  school?: SchoolProfile;
  onSaveGradesBatch?: (records: GradeRecord[]) => void;
  onSaveGrades?: (records: GradeRecord[]) => void;
  onOpenReportCardModal?: (student: Student) => void;
  userRole?: string;
}

export const ExamsGradesView: React.FC<ExamsGradesViewProps> = ({
  students = [],
  subjects = [],
  classes = [],
  exams = [
    {
      id: 'EXAM-SEM1-2026',
      nameKhmer: 'ការប្រឡងឆមាសទី១ (Semester 1 Exam)',
      nameEnglish: 'Semester 1 Final Examination',
      academicYear: '2025-2026',
      semester: 'SEMESTER_1',
      startDate: '2026-02-15',
      endDate: '2026-02-20',
      status: 'COMPLETED'
    },
    {
      id: 'EXAM-SEM2-2026',
      nameKhmer: 'ការប្រឡងឆមាសទី២ (Semester 2 Exam)',
      nameEnglish: 'Semester 2 Final Examination',
      academicYear: '2025-2026',
      semester: 'SEMESTER_2',
      startDate: '2026-07-10',
      endDate: '2026-07-15',
      status: 'UPCOMING'
    }
  ],
  gradeRecords = [],
  school = {
    id: 'SCH-001',
    nameKhmer: 'វិទ្យាល័យ ព្រះស៊ីសុវត្ថិ',
    nameEnglish: 'Preah Sisowath High School',
    academicYear: '2025-2026',
    address: 'រាជធានីភ្នំពេញ',
    phone: '023 212 345',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150',
    exchangeRate: 4100
  },
  onSaveGradesBatch,
  onSaveGrades,
  onOpenReportCardModal,
  userRole = 'SUPER_ADMIN'
}) => {
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const saveBatch = onSaveGradesBatch || onSaveGrades || (() => {});
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'CLS-12A');
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || 'EXAM-SEM1-2026');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Filter students and subjects for this class
  const currentClass = classes.find(c => c.id === selectedClassId);
  const classStudents = students.filter(s => s.classId === selectedClassId);
  const gradeSubjects = subjects.filter(s => s.grade === currentClass?.grade || s.grade === '12');

  // Key: studentId-subjectId -> score
  const [scoreMap, setScoreMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    gradeRecords.forEach(gr => {
      if (gr.examId === selectedExamId) {
        map[`${gr.studentId}-${gr.subjectId}`] = gr.score;
      }
    });
    return map;
  });

  const handleClassOrExamChange = (classId: string, examId: string) => {
    setSelectedClassId(classId);
    setSelectedExamId(examId);
    setSavedSuccess(false);

    const map: Record<string, number> = {};
    gradeRecords.forEach(gr => {
      if (gr.examId === examId) {
        map[`${gr.studentId}-${gr.subjectId}`] = gr.score;
      }
    });
    setScoreMap(map);
  };

  const handleScoreChange = (studentId: string, subjectId: string, value: string) => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកែប្រែពិន្ទុសិស្សបាន!');
      return;
    }
    const num = Math.min(100, Math.max(0, parseFloat(value) || 0));
    setScoreMap(prev => ({
      ...prev,
      [`${studentId}-${subjectId}`]: isNaN(num) ? 0 : num
    }));
    setSavedSuccess(false);
  };

  // Compute student summary statistics (Total, Average, Grade, Rank)
  const studentResults = classStudents.map(st => {
    let totalScore = 0;
    let subjectCount = 0;

    gradeSubjects.forEach(sub => {
      const rawScore = scoreMap[`${st.id}-${sub.id}`];
      const score = typeof rawScore === 'number' && !isNaN(rawScore) ? rawScore : 75;
      totalScore += score;
      subjectCount += 1;
    });

    const average = subjectCount > 0 && !isNaN(totalScore) ? totalScore / subjectCount : 0;
    const { gradeKhmer, gradeEnglish, labelKhmer } = calculateKhmerGrade(average);

    return {
      student: st,
      totalScore: isNaN(totalScore) ? 0 : totalScore,
      average: isNaN(average) ? 0 : average,
      gradeKhmer: gradeKhmer || 'C',
      gradeEnglish: gradeEnglish || 'C',
      labelKhmer: labelKhmer || 'ល្អ'
    };
  });

  // Calculate Ranks
  const sortedByAverage = [...studentResults].sort((a, b) => b.average - a.average);
  const rankMap = new Map<string, number>();
  sortedByAverage.forEach((res, index) => {
    rankMap.set(res.student.id, index + 1);
  });

  const handleSaveAll = () => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចរក្សាទុកពិន្ទុសិស្សបាន!');
      return;
    }
    const recordsToSave: GradeRecord[] = [];
    const currentExam = exams.find(e => e.id === selectedExamId);

    classStudents.forEach(st => {
      gradeSubjects.forEach(sub => {
        const score = scoreMap[`${st.id}-${sub.id}`] ?? 75;
        const { gradeKhmer, gradeEnglish } = calculateKhmerGrade(score);

        recordsToSave.push({
          id: `GR-${selectedExamId}-${st.id}-${sub.id}`,
          examId: selectedExamId,
          examNameKhmer: currentExam?.nameKhmer || 'ការប្រឡងឆមាស',
          studentId: st.id,
          studentNameKhmer: st.nameKhmer,
          studentCode: st.studentCode,
          classId: selectedClassId,
          className: currentClass?.name || '',
          subjectId: sub.id,
          subjectNameKhmer: sub.nameKhmer,
          score,
          maxScore: 100,
          gradeKhmer,
          gradeEnglish,
          semester: currentExam?.semester || 'SEMESTER_1',
          academicYear: currentExam?.academicYear || school.academicYear,
          recordedAt: new Date().toISOString().split('T')[0]
        });
      });
    });

    saveBatch(recordsToSave);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleExportCSV = () => {
    const currentExam = exams.find(e => e.id === selectedExamId);
    const headers = ['លេខកូដ', 'ឈ្មោះសិស្ស', 'ភេទ', ...gradeSubjects.map(s => s.nameKhmer), 'សរុប', 'មធ្យមភាគ', 'និទ្ទេស', 'ចំណាត់ថ្នាក់'];
    const rows = studentResults.map(res => {
      const subjectScores = gradeSubjects.map(sub => scoreMap[`${res.student.id}-${sub.id}`] ?? 75);
      return [
        res.student.studentCode,
        res.student.nameKhmer,
        getGenderKhmer(res.student.gender),
        ...subjectScores,
        res.totalScore.toFixed(1),
        res.average.toFixed(2),
        res.gradeKhmer,
        rankMap.get(res.student.id) || 1
      ];
    });

    exportToCSV(`តារាងពិន្ទុ_${currentClass?.name}_${currentExam?.nameKhmer}.csv`, [headers, ...rows]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white font-battambang flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>ការប្រឡង & បញ្ចូលពិន្ទុសិស្ស (Examinations & Grades Matrix)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ប្រព័ន្ធគណនាពិន្ទុ មធ្យមភាគ និទ្ទេសក្រសួងអប់រំ (A, B, C, D, E, F) និងចំណាត់ថ្នាក់ស្វ័យប្រវត្តិ
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition shadow-sm font-battambang"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>ទាញយក Excel / CSV</span>
          </button>

          {isSuperAdmin ? (
            <button
              onClick={handleSaveAll}
              className="flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/20 font-battambang"
            >
              <Save className="w-4 h-4" />
              <span>រក្សាទុកពិន្ទុទាំងអស់</span>
            </button>
          ) : (
            <button
              disabled
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800/80 text-slate-400 border border-white/5 rounded-xl text-xs font-semibold cursor-not-allowed opacity-60 font-battambang"
              title="មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកែប្រែនិងរក្សាទុកពិន្ទុបាន (Super Admin Only)"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              <span>រក្សាទុកពិន្ទុ (Super Admin)</span>
            </button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-battambang flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>បានរក្សាទុកពិន្ទុប្រឡងដោយជោគជ័យ និងធ្វើបច្ចុប្បន្នភាពសៀវភៅតាមដានសិស្សរួចរាល់!</span>
        </div>
      )}

      {/* Selector Toolbar */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-4 font-battambang text-xs">
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">ជ្រើសរើសសម័យប្រឡង:</span>
            <select
              value={selectedExamId}
              onChange={e => handleClassOrExamChange(selectedClassId, e.target.value)}
              className="px-3.5 py-2 bg-slate-950/80 rounded-xl border border-white/10 text-white font-bold outline-none focus:border-indigo-400"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.nameKhmer}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">ជ្រើសរើសថ្នាក់រៀន:</span>
            <select
              value={selectedClassId}
              onChange={e => handleClassOrExamChange(e.target.value, selectedExamId)}
              className="px-3.5 py-2 bg-slate-950/80 rounded-xl border border-white/10 text-white font-bold outline-none focus:border-indigo-400"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-slate-300">
          <span className="text-xs">សិស្សសរុប: <strong className="text-white font-mono">{classStudents.length} នាក់</strong></span>
          <span>•</span>
          <span className="text-xs">មុខវិជ្ជាប្រឡង: <strong className="text-indigo-300 font-mono">{gradeSubjects.length} មុខ</strong></span>
        </div>

      </div>

      {/* Dynamic Grade Matrix Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-battambang">
            <thead className="bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 w-12 text-center">ល.រ</th>
                <th className="p-3.5 min-w-[160px]">ឈ្មោះសិស្ស</th>
                <th className="p-3.5 w-16 text-center">ភេទ</th>
                
                {/* Subject Columns */}
                {gradeSubjects.map(sub => (
                  <th key={sub.id} className="p-3.5 text-center min-w-[90px]">
                    <span className="block font-bold text-white text-[11px]">{sub.nameKhmer}</span>
                    <span className="block text-[9px] text-slate-400 font-mono font-normal">Max: 100</span>
                  </th>
                ))}

                <th className="p-3.5 text-center min-w-[70px] text-indigo-300 font-bold bg-indigo-950/20">សរុប</th>
                <th className="p-3.5 text-center min-w-[75px] text-emerald-300 font-bold bg-emerald-950/20">មធ្យមភាគ</th>
                <th className="p-3.5 text-center min-w-[70px] text-amber-300 font-bold bg-amber-950/20">និទ្ទេស</th>
                <th className="p-3.5 text-center min-w-[70px] text-purple-300 font-bold bg-purple-950/20">ចំណាត់ថ្នាក់</th>
                <th className="p-3.5 text-right min-w-[110px]">សៀវភៅតាមដាន</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-white/5">
              {studentResults.map((res, index) => {
                const rank = rankMap.get(res.student.id) || (index + 1);

                return (
                  <tr key={res.student.id} className="hover:bg-white/5 transition">
                    <td className="p-3.5 text-center font-mono text-slate-400 text-xs">
                      {index + 1}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={res.student.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={res.student.nameKhmer}
                          className="w-7 h-7 rounded-full object-cover border border-white/10 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white text-xs">{res.student.nameKhmer}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{res.student.studentCode}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-center font-bold text-slate-300">
                      {getGenderKhmer(res.student.gender)}
                    </td>

                    {/* Subject Score Inputs */}
                    {gradeSubjects.map(sub => {
                      const score = scoreMap[`${res.student.id}-${sub.id}`] ?? 75;

                      return (
                        <td key={sub.id} className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={score}
                            readOnly={!isSuperAdmin}
                            title={isSuperAdmin ? "កែប្រែពិន្ទុ (Super Admin)" : "មានតែ Super Admin ប៉ុណ្ណោះដែលអាចបញ្ចូលពិន្ទុ"}
                            onChange={e => handleScoreChange(res.student.id, sub.id, e.target.value)}
                            className={`w-16 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg border outline-none transition ${
                              !isSuperAdmin ? 'cursor-not-allowed opacity-80 ' : ''
                            }${
                              score >= 85
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 focus:border-emerald-400'
                                : score >= 65
                                ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200 focus:border-indigo-400'
                                : score >= 50
                                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 focus:border-amber-400'
                                : 'bg-rose-950/40 border-rose-500/40 text-rose-300 focus:border-rose-400'
                            }`}
                          />
                        </td>
                      );
                    })}

                    {/* Total Score */}
                    <td className="p-3.5 text-center font-mono font-bold text-indigo-300 bg-indigo-950/20 text-xs">
                      {(res.totalScore || 0).toFixed(1)}
                    </td>

                    {/* Average */}
                    <td className="p-3.5 text-center font-mono font-bold text-emerald-400 bg-emerald-950/20 text-xs">
                      {(res.average || 0).toFixed(2)}
                    </td>

                    {/* Grade Badge */}
                    <td className="p-3.5 text-center bg-amber-950/20">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] font-mono border ${
                        res.gradeKhmer === 'A'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : res.gradeKhmer === 'B'
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                          : res.gradeKhmer === 'C'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : res.gradeKhmer === 'D'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {res.gradeKhmer}
                      </span>
                    </td>

                    {/* Rank */}
                    <td className="p-3.5 text-center bg-purple-950/20">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                        rank === 1
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : rank <= 3
                          ? 'bg-purple-500/30 text-purple-200 border border-purple-500/40'
                          : 'text-slate-300'
                      }`}>
                        {rank === 1 ? '🥇 លេខ ១' : rank === 2 ? '🥈 លេខ ២' : rank === 3 ? '🥉 លេខ ៣' : `លេខ ${rank}`}
                      </span>
                    </td>

                    {/* Report Card Action */}
                    <td className="p-3.5 text-right">
                      {onOpenReportCardModal && (
                        <button
                          onClick={() => onOpenReportCardModal(res.student)}
                          className="flex items-center space-x-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-white rounded-lg text-[11px] font-semibold ml-auto transition border border-white/10"
                        >
                          <FileText className="w-3 h-3" />
                          <span>សៀវភៅតាមដាន</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
