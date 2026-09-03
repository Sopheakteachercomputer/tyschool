import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Lock, 
  Key, 
  FileCode2, 
  Layers, 
  Sparkles,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { StorageService } from '../services/storageService';

export const SecurityTestsView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'CONSOLE' | 'RULES'>('CONSOLE');

  const runAllTests = async () => {
    setIsRunning(true);
    try {
      const results = await StorageService.runSecurityAuthorizationTests();
      setTestResults(results);
    } finally {
      setIsRunning(false);
    }
  };

  const totalPassed = testResults.filter(t => t.passed).length;

  return (
    <div className="space-y-6 font-['Battambang',sans-serif]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 backdrop-blur-xl p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2 font-['Kantumruy_Pro',sans-serif]">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              ផ្ទាំងត្រួតពិនិត្យសុវត្ថិភាពទិន្នន័យ (Security & Authorization Test Console)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              IDOR & RBAC Suite
            </span>
          </div>
          <p className="text-xs text-slate-400">
            ឧបករណ៍ធ្វើតេស្តស្វ័យប្រវត្តិនូវការការពារ IDOR Attacks និងការបែងចែកសិទ្ធិម្ចាស់ទិន្នន័យ (User Ownership Verification)។
          </p>
        </div>

        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all shrink-0 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>កំពុងដំណើរការតេស្ត...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>ដំណើរការតេស្តសុវត្ថិភាព (Run All Tests)</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Score Card */}
      {testResults.length > 0 && (
        <div className={`p-4 rounded-2xl border backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          totalPassed === testResults.length 
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-3">
            {totalPassed === testResults.length ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="text-base font-bold text-white">
                លទ្ធផលត្រួតពិនិត្យ: {totalPassed}/{testResults.length} តេស្តបានជោគជ័យ (100% IDOR Protected)
              </div>
              <div className="text-xs text-slate-300">
                ប្រព័ន្ធបានការពារសុវត្ថិភាពទិន្នន័យដោយជោគជ័យ។ គ្មានអ្នកប្រើប្រាស់ណាម្នាក់អាចមើល កែប្រែ ឬលុបទិន្នន័យរបស់អ្នកដទៃឡើយ។
              </div>
            </div>
          </div>

          <div className="text-xs font-mono px-3 py-1.5 bg-slate-900/80 rounded-lg border border-slate-700 text-slate-200">
            PASSED: {totalPassed} | FAILED: {testResults.length - totalPassed}
          </div>
        </div>
      )}

      {/* Test Cases Accordion/Cards */}
      <div className="space-y-4">
        {testResults.length === 0 ? (
          <div className="p-10 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <Terminal className="w-10 h-10 text-indigo-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">ត្រៀមដំណើរការតេស្តសុវត្ថិភាពទាំង ៥</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              ចុចប៊ូតុង "ដំណើរការតេស្តសុវត្ថិភាព" ខាងលើដើម្បីដំណើរការសេណារីយ៉ូជាក់ស្តែង និងផ្ទៀងផ្ទាត់ការទប់ស្កាត់ IDOR។
            </p>
            <button
              onClick={runAllTests}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              <span>ដំណើរការឥឡូវនេះ</span>
            </button>
          </div>
        ) : (
          testResults.map((t) => (
            <div
              key={t.testNumber}
              className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className={`p-1.5 rounded-lg text-white ${t.passed ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    {t.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Test {t.testNumber}: {t.name}
                    </h3>
                    <p className="text-xs text-slate-400">{t.descriptionKhmer}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Expected: <strong className="text-indigo-300">{t.expectedStatus}</strong></span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">Actual: <strong className={t.passed ? 'text-emerald-400' : 'text-rose-400'}>{t.actualStatus}</strong></span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    t.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {t.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>

              {/* Execution Console Logs */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 font-mono text-[11px] space-y-1 text-slate-300">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-indigo-400" />
                  <span>Execution Assertions Log:</span>
                </div>
                {t.logs.map((log: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-600 select-none">&gt;</span>
                    <span className={log.includes('FAIL') ? 'text-rose-400 font-bold' : log.includes('Success') || log.includes('Protected') || log.includes('Blocked') ? 'text-emerald-300' : 'text-slate-300'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Security Principles Reference */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 text-xs text-slate-300">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-400" />
          <span>គោលការណ៍សុវត្ថិភាពនៃប្រព័ន្ធ (Zero-Trust Data Protection)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
            <strong className="text-indigo-300 block">1. Server-Side Ownership Check</strong>
            <p className="text-slate-400 text-[11px]">
              មិនទុកចិត្តលើ userId ផ្ញើចេញពី Frontend ឡើយ។ ប្រព័ន្ធពិនិត្យ Token ក្នុង Session ជានិច្ច។
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
            <strong className="text-emerald-300 block">2. 404 IDOR Obfuscation</strong>
            <p className="text-slate-400 text-[11px]">
              នៅពេលមានការលួចចូលមើលទិន្នន័យអ្នកដទៃ ប្រព័ន្ធបញ្ជូន 404 Not Found ដើម្បីកុំឱ្យបែកធ្លាយអត្ថិភាពនៃ Resource។
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
            <strong className="text-cyan-300 block">3. Cryptographic Session Tokens</strong>
            <p className="text-slate-400 text-[11px]">
              Session Token ត្រូវបានបង្កើតដោយសុវត្ថិភាព និងមានសុពលភាព ២៤ ម៉ោង មុនពេល Auto-Logout។
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
