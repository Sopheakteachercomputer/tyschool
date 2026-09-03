import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Flame, 
  FileCheck2,
  ChevronRight,
  Code
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { UserProgress, User } from '../types';

interface MyProgressViewProps {
  currentUser: User;
}

export const MyProgressView: React.FC<MyProgressViewProps> = ({ currentUser }) => {
  const [progressList, setProgressList] = useState<UserProgress[]>([]);

  useEffect(() => {
    const data = StorageService.getProgress(currentUser.id);
    setProgressList(data);
  }, [currentUser.id]);

  const totalCourses = progressList.length;
  const completedCourses = progressList.filter(p => p.isCompleted).length;
  const avgProgress = totalCourses > 0 
    ? Math.round(progressList.reduce((acc, p) => acc + p.progressPercent, 0) / totalCourses) 
    : 0;

  return (
    <div className="space-y-6 font-['Battambang',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 backdrop-blur-xl p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2 font-['Kantumruy_Pro',sans-serif]">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
              វឌ្ឍនភាពនៃការសិក្សា (My Learning & Progress)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Private Records
            </span>
          </div>
          <p className="text-xs text-slate-400">
            តាមដានវគ្គសិក្សា ចំនួនមេរៀនដែលបានបញ្ចប់ និងពិន្ទុតេស្តរបស់ {currentUser.nameKhmer}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center gap-2 text-indigo-300 text-xs">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Streak សិក្សា: <strong>៧ ថ្ងៃជាប់គ្នា</strong></span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalCourses}</div>
            <div className="text-xs text-slate-400">វគ្គសិក្សាដែលបានចុះឈ្មោះ</div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{completedCourses}</div>
            <div className="text-xs text-slate-400">វគ្គសិក្សាបានបញ្ចប់ ១០០%</div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{avgProgress}%</div>
            <div className="text-xs text-slate-400">មធ្យមភាគវឌ្ឍនភាពសរុប</div>
          </div>
        </div>
      </div>

      {/* Courses Roadmap List */}
      <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-5 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          <span>វគ្គបណ្តុះបណ្តាល និងកូដគំរូរបស់ខ្ញុំ (Enrolled Courses)</span>
        </h2>

        {progressList.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            មិនទាន់មានវគ្គសិក្សានៅឡើយទេ
          </div>
        ) : (
          <div className="space-y-4">
            {progressList.map((prog) => (
              <div
                key={prog.id}
                className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{prog.courseTitleKhmer}</h3>
                    <p className="text-xs text-slate-400">{prog.courseTitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {prog.isCompleted ? (
                      <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>បញ្ចប់រួចរាល់ (Completed)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-semibold rounded-lg flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>កំពុងសិក្សា ({prog.progressPercent}%)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>មេរៀនបានបញ្ចប់: {prog.completedLessons} / {prog.totalLessons}</span>
                    <span className="font-semibold text-slate-200">{prog.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        prog.progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${prog.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Details Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                  <span>មេរៀនចុងក្រោយ: <strong className="text-slate-200">{prog.lastLessonTitle || 'N/A'}</strong></span>
                  {prog.quizScore !== undefined && (
                    <span>ពិន្ទុតេស្តចុងក្រោយ: <strong className="text-emerald-400">{prog.quizScore}/100</strong></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
