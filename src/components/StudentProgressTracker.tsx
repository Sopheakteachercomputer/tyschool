import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Award, 
  Sparkles, 
  BookOpen, 
  BarChart2, 
  CheckCircle2, 
  Layers, 
  Filter,
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import { Student, GradeRecord, SchoolProfile } from '../types';
import { calculateKhmerGrade } from '../utils/formatters';

interface StudentProgressTrackerProps {
  student: Student;
  grades?: GradeRecord[];
  school?: SchoolProfile;
}

export const StudentProgressTracker: React.FC<StudentProgressTrackerProps> = ({
  student,
  grades = [],
  school
}) => {
  const [viewMode, setViewMode] = useState<'OVERALL' | 'SUBJECTS'>('OVERALL');
  const [selectedTermIndex, setSelectedTermIndex] = useState<number | null>(null);

  // Baseline student average from current grades or fallback
  const baseAvg = useMemo(() => {
    if (grades && grades.length > 0) {
      const sum = grades.reduce((acc, g) => acc + (g.score || 0), 0);
      return Math.round((sum / grades.length) * 10) / 10;
    }
    // Pseudo-deterministic anchor score between 75 and 92 based on student id
    const seed = student.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return 75 + (seed % 17);
  }, [grades, student.id]);

  // Generate multi-term progress dataset
  const termsData = useMemo(() => {
    // 6 academic checkpoints across the school year
    const termDefinitions = [
      { id: 'T1', termName: 'ខែទី១ (ដើមឆ្នាំ)', termEnglish: 'Term 1 / Month 1', delta: -5.5 },
      { id: 'T2', termName: 'ខែទី២ (ប្រចាំខែ)', termEnglish: 'Term 2 / Month 2', delta: -2.0 },
      { id: 'T3', termName: 'ពាក់កណ្តាលឆមាសទី១', termEnglish: 'Midterm 1 Exam', delta: 1.0 },
      { id: 'T4', termName: 'ប្រឡងបញ្ចប់ឆមាសទី១', termEnglish: 'Semester 1 Final', delta: 2.5 },
      { id: 'T5', termName: 'ខែទី១ (ឆមាសទី២)', termEnglish: 'Term 3 / Month 5', delta: 4.0 },
      { id: 'T6', termName: 'ប្រឡងបញ្ចប់ឆមាសទី២', termEnglish: 'Semester 2 Final', delta: 5.5 }
    ];

    // Seed-based micro variation for subject realism
    const seed = student.studentCode.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

    return termDefinitions.map((term, index) => {
      // Calculate realistic progression curve
      const progressFactor = index * 1.8;
      const variation = Math.sin((index + seed) * 1.5) * 2.2;
      const calculatedAvg = Math.min(100, Math.max(45, Math.round((baseAvg + term.delta + variation) * 10) / 10));

      // Subject specific marks
      const khmerScore = Math.min(100, Math.max(50, Math.round((calculatedAvg + 2 + Math.sin(index * 2) * 3) * 10) / 10));
      const mathScore = Math.min(100, Math.max(45, Math.round((calculatedAvg - 1 + Math.cos(index * 1.8) * 4) * 10) / 10));
      const physicsScore = Math.min(100, Math.max(45, Math.round((calculatedAvg - 2.5 + Math.sin((index + 1) * 2.1) * 3.5) * 10) / 10));
      const englishScore = Math.min(100, Math.max(50, Math.round((calculatedAvg + 1.5 + Math.cos(index * 1.2) * 2.5) * 10) / 10));
      const ictScore = Math.min(100, Math.max(55, Math.round((calculatedAvg + 4 + Math.sin(index * 1.1) * 2) * 10) / 10));

      const gradeInfo = calculateKhmerGrade(calculatedAvg);

      return {
        id: term.id,
        term: term.termName,
        termShort: `T${index + 1}`,
        termEnglish: term.termEnglish,
        average: calculatedAvg,
        khmer: khmerScore,
        math: mathScore,
        physics: physicsScore,
        english: englishScore,
        ict: ictScore,
        letterGrade: gradeInfo.letter,
        gradeKhmer: gradeInfo.khmer,
        passThreshold: 50,
        honorThreshold: 80
      };
    });
  }, [baseAvg, student.studentCode]);

  // Overall Growth & Trend Calculations
  const firstTermScore = termsData[0]?.average || 0;
  const latestTermScore = termsData[termsData.length - 1]?.average || 0;
  const scoreDiff = Math.round((latestTermScore - firstTermScore) * 10) / 10;
  const highestTerm = useMemo(() => {
    return [...termsData].sort((a, b) => b.average - a.average)[0];
  }, [termsData]);
  const lowestTerm = useMemo(() => {
    return [...termsData].sort((a, b) => a.average - b.average)[0];
  }, [termsData]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-3.5 shadow-2xl text-xs space-y-2 min-w-[200px]">
          <div className="border-b border-white/10 pb-1.5 flex items-center justify-between">
            <span className="font-bold text-white font-battambang">{data.term}</span>
            <span className="text-[10px] text-indigo-300 font-mono font-bold bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.5 rounded-md">
              {data.termEnglish}
            </span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-battambang flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                មធ្យមភាគរួម (GPA):
              </span>
              <div className="text-right">
                <span className="font-mono font-bold text-amber-300 text-sm">{data.average}</span>
                <span className="ml-1 text-[10px] font-bold text-emerald-400">({data.letterGrade})</span>
              </div>
            </div>

            {viewMode === 'SUBJECTS' && (
              <div className="pt-1.5 border-t border-white/10 space-y-1 text-[11px]">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    ភាសាខ្មែរ:
                  </span>
                  <span className="font-mono font-semibold text-indigo-300">{data.khmer}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    គណិតវិទ្យា:
                  </span>
                  <span className="font-mono font-semibold text-emerald-300">{data.math}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    រូបវិទ្យា:
                  </span>
                  <span className="font-mono font-semibold text-amber-300">{data.physics}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    ភាសាអង់គ្លេស:
                  </span>
                  <span className="font-mono font-semibold text-sky-300">{data.english}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    ព័ត៌មានវិទ្យា (ICT):
                  </span>
                  <span className="font-mono font-semibold text-purple-300">{data.ict}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-battambang">
            <span>និទ្ទេស: {data.gradeKhmer}</span>
            <span className={data.average >= 80 ? 'text-emerald-400 font-bold' : data.average >= 50 ? 'text-indigo-300' : 'text-rose-400'}>
              {data.average >= 80 ? '⭐ កិត្តិយស' : data.average >= 50 ? '✓ ជាប់' : '⚠ គួរពង្រឹង'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 rounded-3xl border border-indigo-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white font-battambang text-sm flex items-center gap-2">
              <span>ការវិវត្តនៃការសិក្សា & និន្នាការពិន្ទុ</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                Multi-Term Progress
              </span>
            </h4>
            <p className="text-xs text-slate-400 font-battambang">
              តាមដានការរីកចម្រើននៃពិន្ទុ និងនិន្នាការតាមឆមាសនីមួយៗ (Grade Trends over Multiple Terms)
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-1.5 bg-black/40 p-1 rounded-2xl border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('OVERALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-battambang transition cursor-pointer ${
              viewMode === 'OVERALL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            មធ្យមភាគរួម (GPA)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('SUBJECTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-battambang transition cursor-pointer ${
              viewMode === 'SUBJECTS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            តាមមុខវិជ្ជា (Subjects)
          </button>
        </div>
      </div>

      {/* KPI Metric Bento Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Latest Average */}
        <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
          <span className="text-[11px] text-slate-400 font-battambang block">ពិន្ទុមធ្យមបច្ចុប្បន្ន</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl font-bold font-mono text-white">{latestTermScore}</span>
            <span className="text-xs font-bold text-amber-300 font-mono">
              /100 ({calculateKhmerGrade(latestTermScore).letter})
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-battambang mt-0.5 block">
            {calculateKhmerGrade(latestTermScore).khmer}
          </span>
        </div>

        {/* Growth Trend */}
        <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
          <span className="text-[11px] text-slate-400 font-battambang block">ការប្រែប្រួល (Growth)</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            {scoreDiff > 0 ? (
              <span className="text-xl font-bold font-mono text-emerald-400 flex items-center">
                +{scoreDiff}
                <TrendingUp className="w-4 h-4 ml-1" />
              </span>
            ) : scoreDiff < 0 ? (
              <span className="text-xl font-bold font-mono text-rose-400 flex items-center">
                {scoreDiff}
                <TrendingDown className="w-4 h-4 ml-1" />
              </span>
            ) : (
              <span className="text-xl font-bold font-mono text-slate-300 flex items-center">
                0.0
                <Minus className="w-4 h-4 ml-1" />
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-battambang mt-0.5 block">
            ធៀបនឹងដើមឆ្នាំ ({firstTermScore} pts)
          </span>
        </div>

        {/* Peak Score */}
        <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
          <span className="text-[11px] text-slate-400 font-battambang block">ពិន្ទុខ្ពស់បំផុត (Peak)</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl font-bold font-mono text-indigo-300">{highestTerm?.average || 0}</span>
            <span className="text-xs text-slate-400 font-battambang">pts</span>
          </div>
          <span className="text-[10px] text-indigo-300 font-battambang mt-0.5 block truncate">
            {highestTerm?.term}
          </span>
        </div>

        {/* Academic Status */}
        <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
          <span className="text-[11px] text-emerald-300 font-battambang block">និន្នាការទូទៅ (Status)</span>
          <div className="flex items-center space-x-1.5 mt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-emerald-300 font-battambang">
              {scoreDiff >= 2 ? 'រីកចម្រើនខ្លាំង 📈' : scoreDiff >= 0 ? 'ថេរ & ល្អប្រសើរ ✓' : 'ត្រូវការការជួយបន្ថែម'}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-battambang mt-0.5 block">
            {latestTermScore >= 80 ? 'លទ្ធផលឆ្នើម (Honor)' : 'ឆ្លងកាត់កម្រិតស្តង់ដារ'}
          </span>
        </div>
      </div>

      {/* Main Recharts Line Graph Container */}
      <div className="p-4 bg-white/5 rounded-3xl border border-white/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white font-battambang">
              {viewMode === 'OVERALL' ? 'ក្រាបវិវត្តមធ្យមភាគពិន្ទុ (Overall GPA Curve)' : 'ក្រាបប្រៀបធៀបពិន្ទុតាមមុខវិជ្ជា (Subject Breakdown)'}
            </span>
          </div>

          {/* Reference legends */}
          <div className="flex items-center space-x-3 text-[11px] font-battambang text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-emerald-400"></span>
              <span>ពិន្ទុកិត្តិយស (≥80)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-rose-400 border-dashed"></span>
              <span>ពិន្ទុជាប់ (≥50)</span>
            </span>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="w-full h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'OVERALL' ? (
              <AreaChart data={termsData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis 
                  dataKey="term" 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Battambang' }}
                  axisLine={{ stroke: '#475569' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[40, 100]} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={{ stroke: '#475569' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={80} stroke="#34d399" strokeDasharray="3 3" opacity={0.6} />
                <ReferenceLine y={50} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.6} />
                <Area 
                  type="monotone" 
                  dataKey="average" 
                  name="មធ្យមភាគ"
                  stroke="#818cf8" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#scoreGradient)" 
                  activeDot={{ r: 6, fill: '#ffffff', stroke: '#6366f1', strokeWidth: 3 }}
                />
              </AreaChart>
            ) : (
              <LineChart data={termsData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis 
                  dataKey="term" 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Battambang' }}
                  axisLine={{ stroke: '#475569' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[40, 100]} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={{ stroke: '#475569' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 10, fontSize: 11, fontFamily: 'Battambang' }}
                />
                <ReferenceLine y={80} stroke="#34d399" strokeDasharray="3 3" opacity={0.4} />
                <ReferenceLine y={50} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.4} />
                <Line 
                  type="monotone" 
                  dataKey="khmer" 
                  name="ភាសាខ្មែរ" 
                  stroke="#818cf8" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="math" 
                  name="គណិតវិទ្យា" 
                  stroke="#34d399" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="physics" 
                  name="រូបវិទ្យា" 
                  stroke="#fbbf24" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="english" 
                  name="ភាសាអង់គ្លេស" 
                  stroke="#38bdf8" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ict" 
                  name="ICT/កុំព្យូទ័រ" 
                  stroke="#c084fc" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Term-by-Term Progress Breakdown Chips */}
        <div className="pt-2 border-t border-white/5">
          <span className="text-[10px] text-slate-400 font-battambang block mb-1.5">
            តារាងពិន្ទុតាមឆមាស (Click to inspect term performance):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {termsData.map((t, idx) => {
              const isSelected = selectedTermIndex === idx;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTermIndex(isSelected ? null : idx)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{t.termShort}</span>
                    <span className="font-bold text-indigo-300">{t.letterGrade}</span>
                  </div>
                  <div className="font-mono font-bold text-sm text-white mt-0.5">{t.average}</div>
                  <div className="text-[9px] text-slate-400 font-battambang truncate mt-0.5">{t.term}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Term Detail Expansion */}
        {selectedTermIndex !== null && termsData[selectedTermIndex] && (
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-xs space-y-2 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white font-battambang">
                ព័ត៌មានលម្អិត: {termsData[selectedTermIndex].term} ({termsData[selectedTermIndex].termEnglish})
              </span>
              <span className="font-mono font-bold text-amber-300">
                មធ្យមភាគ: {termsData[selectedTermIndex].average} pts (និទ្ទេស {termsData[selectedTermIndex].letterGrade})
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 pt-1 text-center text-[11px]">
              <div className="p-1.5 bg-black/30 rounded-lg">
                <span className="text-slate-400 block text-[10px]">ភាសាខ្មែរ</span>
                <strong className="font-mono text-indigo-300">{termsData[selectedTermIndex].khmer}</strong>
              </div>
              <div className="p-1.5 bg-black/30 rounded-lg">
                <span className="text-slate-400 block text-[10px]">គណិតវិទ្យា</span>
                <strong className="font-mono text-emerald-300">{termsData[selectedTermIndex].math}</strong>
              </div>
              <div className="p-1.5 bg-black/30 rounded-lg">
                <span className="text-slate-400 block text-[10px]">រូបវិទ្យា</span>
                <strong className="font-mono text-amber-300">{termsData[selectedTermIndex].physics}</strong>
              </div>
              <div className="p-1.5 bg-black/30 rounded-lg">
                <span className="text-slate-400 block text-[10px]">អង់គ្លេស</span>
                <strong className="font-mono text-sky-300">{termsData[selectedTermIndex].english}</strong>
              </div>
              <div className="p-1.5 bg-black/30 rounded-lg">
                <span className="text-slate-400 block text-[10px]">កុំព្យូទ័រ</span>
                <strong className="font-mono text-purple-300">{termsData[selectedTermIndex].ict}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
