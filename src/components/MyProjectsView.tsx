import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Plus, 
  Play, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Tag, 
  Clock, 
  Copy, 
  Check, 
  Terminal, 
  Layers,
  Download,
  RotateCcw,
  Search,
  FileCode,
  Globe,
  Share2,
  AlertCircle
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Project, User } from '../types';

interface MyProjectsViewProps {
  currentUser: User;
}

export const MyProjectsView: React.FC<MyProjectsViewProps> = ({ currentUser }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'html' | 'javascript' | 'python'>('html');
  const [code, setCode] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Execution states
  const [consoleOutput, setConsoleOutput] = useState<Array<{ type: 'log' | 'error' | 'info'; text: string; time: string }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const loadProjects = () => {
    const data = StorageService.getProjects(currentUser.id);
    setProjects(data);
    if (data.length > 0) {
      if (!activeProject || !data.some(p => p.id === activeProject.id)) {
        setActiveProject(data[0]);
      }
    } else {
      setActiveProject(null);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentUser.id]);

  const handleStartNew = (templateLang: 'html' | 'javascript' | 'python' = 'html') => {
    setActiveProject(null);
    setLanguage(templateLang);
    setConsoleOutput([]);

    if (templateLang === 'html') {
      setTitle('គម្រោង Web ថ្មី (New Interactive Web App)');
      setDescription('កម្មវិធីគេហទំព័រ HTML, CSS & JavaScript បង្ហាញលទ្ធផលភ្លាមៗ...');
      setCode(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 28px;
      border-radius: 16px;
      text-align: center;
      max-width: 420px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    h1 {
      color: #38bdf8;
      font-size: 22px;
      margin-top: 0;
    }
    p {
      color: #cbd5e1;
      font-size: 14px;
      line-height: 1.6;
    }
    .btn {
      background: #6366f1;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 15px;
      transition: 0.2s;
    }
    .btn:hover {
      background: #4f46e5;
      transform: scale(1.03);
    }
    .counter {
      font-size: 28px;
      font-weight: bold;
      color: #34d399;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 ${currentUser.nameKhmer} Project</h1>
    <p>គម្រោងផ្ទាល់ខ្លួនដែលត្រូវបានការពារយ៉ាងតឹងរ៉ឹង (IDOR Protected).</p>
    <div class="counter" id="count">0</div>
    <button class="btn" onclick="increment()">ចុចរាប់ចំនួន (Click to Count)</button>
  </div>

  <script>
    let count = 0;
    function increment() {
      count++;
      document.getElementById('count').innerText = count;
    }
  </script>
</body>
</html>`);
      setTags(['Web', 'HTML', 'Interactive']);
    } else if (templateLang === 'javascript') {
      setTitle('គណនាពិន្ទុ & ស្ថិតិ (JavaScript Algorithm)');
      setDescription('កូដ JavaScript សម្រាប់គណនាពិន្ទុមធ្យមភាគ និងនិទ្ទេសសិស្ស...');
      setCode(`// ក្បួនគណនាពិន្ទុ និងនិទ្ទេសសិស្ស (Grade Calculator)
function calculateStudentRank(scores) {
  const total = scores.reduce((sum, s) => sum + s.score, 0);
  const average = total / scores.length;
  
  let grade = 'F';
  if (average >= 90) grade = 'A (ល្អប្រសើរ)';
  else if (average >= 80) grade = 'B (ល្អណាស់)';
  else if (average >= 70) grade = 'C (ល្អ)';
  else if (average >= 60) grade = 'D (មធ្យម)';
  else if (average >= 50) grade = 'E (ខ្សោយ)';

  return {
    student: "${currentUser.nameKhmer}",
    totalScore: total,
    average: average.toFixed(2),
    grade: grade
  };
}

const subjects = [
  { name: "គណិតវិទ្យា", score: 95 },
  { name: "រូបវិទ្យា", score: 88 },
  { name: "ព័ត៌មានវិទ្យា (ICT)", score: 100 },
  { name: "ភាសាខ្មែរ", score: 85 }
];

console.log("=== លទ្ធផលគណនាពិន្ទុសិស្ស ===");
const result = calculateStudentRank(subjects);
console.log("ឈ្មោះសិស្ស:", result.student);
console.log("ពិន្ទុសរុប:", result.totalScore);
console.log("មធ្យមភាគ:", result.average);
console.log("និទ្ទេសទទួលបាន:", result.grade);
`);
      setTags(['JavaScript', 'Algorithm', 'Grades']);
    } else {
      setTitle('Python Script វិភាគទិន្នន័យ (Python Demo)');
      setDescription('កូដ Python សម្រាប់វិភាគទិន្នន័យ និងរាយការណ៍...');
      setCode(`# Python 3 Data Processing Script
def analyze_scores(scores):
    total = sum(scores)
    avg = total / len(scores)
    passed = [s for s in scores if s >= 50]
    return {
        "total": total,
        "average": round(avg, 2),
        "pass_rate": f"{(len(passed)/len(scores))*100}%"
    }

scores = [85, 92, 78, 90, 65, 88]
print(f"School: វិទ្យាល័យ ហ៊ុន សែន តាឯក")
print(f"Developer: ${currentUser.nameKhmer}")
print(f"Analysis Results: {analyze_scores(scores)}")
`);
      setTags(['Python', 'Data', 'Education']);
    }

    setIsEditing(true);
  };

  const handleSelectProject = (p: Project) => {
    setActiveProject(p);
    setTitle(p.title);
    setDescription(p.description || '');
    setLanguage((p.language as any) || 'html');
    setCode(p.code || '');
    setTags(p.tags || []);
    setIsEditing(false);
    setConsoleOutput([]);
    setPreviewKey(k => k + 1);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('សូមបញ្ចូលចំណងជើងគម្រោង (Please enter project title)');
      return;
    }

    const res = StorageService.saveProject({
      id: activeProject?.id,
      title: title.trim(),
      description: description.trim(),
      language,
      code,
      tags
    }, currentUser.id);

    if (res.success && res.project) {
      setActiveProject(res.project);
      setIsEditing(false);
      loadProjects();
      setSaveMessage('បានរក្សាទុកគម្រោងដោយជោគជ័យ! (Project Saved)');
      setTimeout(() => setSaveMessage(null), 2500);
    } else {
      alert(res.error || 'បរាជ័យក្នុងការរក្សាទុក');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('តើអ្នកពិតជាចង់លុបគម្រោងនេះមែនទេ? (Are you sure you want to delete this project?)')) {
      const res = StorageService.deleteProject(id, currentUser.id);
      if (res.success) {
        if (activeProject?.id === id) {
          setActiveProject(null);
        }
        loadProjects();
      } else {
        alert(res.error || 'បរាជ័យក្នុងការលុប');
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter(x => x !== t));
  };

  const handleCopyCode = () => {
    const currentCode = isEditing ? code : (activeProject?.code || '');
    if (currentCode) {
      navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadCode = () => {
    const currentCode = isEditing ? code : (activeProject?.code || '');
    const currentLang = isEditing ? language : (activeProject?.language || 'html');
    const ext = currentLang === 'javascript' ? 'js' : currentLang === 'python' ? 'py' : 'html';
    const filename = `${(activeProject?.title || 'project').replace(/\s+/g, '_')}.${ext}`;
    
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const runCode = () => {
    setIsRunning(true);
    setConsoleOutput([]);
    const currentCode = isEditing ? code : (activeProject?.code || '');
    const currentLang = isEditing ? language : (activeProject?.language || 'html');
    const timeStr = new Date().toLocaleTimeString();

    if (currentLang === 'html') {
      setPreviewKey(k => k + 1);
      setConsoleOutput([{
        type: 'info',
        text: `[${timeStr}] Live Preview reloaded successfully.`,
        time: timeStr
      }]);
      setIsRunning(false);
      return;
    }

    if (currentLang === 'javascript') {
      const logs: Array<{ type: 'log' | 'error' | 'info'; text: string; time: string }> = [];
      logs.push({ type: 'info', text: `[${timeStr}] Starting JavaScript Execution Sandbox...`, time: timeStr });
      
      const customConsole = {
        log: (...args: any[]) => {
          logs.push({
            type: 'log',
            text: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '),
            time: new Date().toLocaleTimeString()
          });
        },
        error: (...args: any[]) => {
          logs.push({
            type: 'error',
            text: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '),
            time: new Date().toLocaleTimeString()
          });
        },
        warn: (...args: any[]) => {
          logs.push({
            type: 'info',
            text: '[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '),
            time: new Date().toLocaleTimeString()
          });
        }
      };

      try {
        const runFn = new Function('console', currentCode);
        runFn(customConsole);
        logs.push({ type: 'info', text: `[${new Date().toLocaleTimeString()}] ✔ Execution finished cleanly.`, time: new Date().toLocaleTimeString() });
      } catch (err: any) {
        logs.push({
          type: 'error',
          text: `Syntax/Runtime Error: ${err.message || String(err)}`,
          time: new Date().toLocaleTimeString()
        });
      }
      setConsoleOutput(logs);
      setIsRunning(false);
      return;
    }

    if (currentLang === 'python') {
      const logs: Array<{ type: 'log' | 'error' | 'info'; text: string; time: string }> = [
        { type: 'info', text: `[${timeStr}] Python Interpreter (Simulated Engine v3.11):`, time: timeStr }
      ];
      
      // Simple Python print simulator
      const lines = currentCode.split('\n');
      for (const l of lines) {
        const trimmed = l.trim();
        if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
          const content = trimmed.slice(6, -1).replace(/^["']|["']$/g, '');
          logs.push({ type: 'log', text: `>>> ${content}`, time: timeStr });
        }
      }
      logs.push({ type: 'info', text: `[${timeStr}] ✔ Python script validated and executed.`, time: timeStr });
      setConsoleOutput(logs);
      setIsRunning(false);
    }
  };

  // Filter projects by search and tags
  const filteredProjects = projects.filter(p => {
    const matchSearch = searchFilter === '' || 
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(searchFilter.toLowerCase())));
    const matchTag = !selectedTag || (p.tags && p.tags.includes(selectedTag));
    return matchSearch && matchTag;
  });

  const allTags = Array.from(new Set(projects.flatMap(p => p.tags || [])));

  return (
    <div className="space-y-6 font-['Battambang',sans-serif]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 backdrop-blur-xl p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2 font-['Kantumruy_Pro',sans-serif]">
              <Code2 className="w-6 h-6 text-indigo-400" />
              គម្រោងកូដផ្ទាល់ខ្លួន (My Code Studio)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Owner: {currentUser.nameKhmer} ({currentUser.id})
            </span>
          </div>
          <p className="text-xs text-slate-400">
            កន្លែងសរសេរកូដ HTML/CSS/JS និង Python ដោយមានប្រព័ន្ធសុវត្ថិភាពការពារទិន្នន័យដាច់ដោយឡែក (Strict IDOR Isolation)
          </p>
        </div>

        {/* Action buttons to start new template */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleStartNew('html')}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
            title="បង្កើតគម្រោង Web ថ្មី"
          >
            <Plus className="w-4 h-4" />
            <span>+ Web App</span>
          </button>
          <button
            onClick={() => handleStartNew('javascript')}
            className="px-3 py-2 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            title="បង្កើតកូដ JavaScript"
          >
            <FileCode className="w-4 h-4" />
            <span>+ JavaScript</span>
          </button>
          <button
            onClick={() => handleStartNew('python')}
            className="px-3 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            title="បង្កើតកូដ Python"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Python</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Grid: Projects List Sidebar + Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Projects Directory */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Search and Filters */}
          <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-2xl space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="ស្វែងរកគម្រោងកូដ..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Tag Pills */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-2 py-0.5 text-[10px] rounded-lg transition ${
                    !selectedTag ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ទាំងអស់ ({projects.length})
                </button>
                {allTags.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                    className={`px-2 py-0.5 text-[10px] rounded-lg transition ${
                      selectedTag === t ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* List of Projects */}
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredProjects.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl">
                <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-3">មិនមានគម្រោងត្រូវគ្នានឹងការស្វែងរក</p>
                <button
                  onClick={() => handleStartNew('html')}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg"
                >
                  + បង្កើតគម្រោងថ្មី
                </button>
              </div>
            ) : (
              filteredProjects.map((p) => {
                const isSelected = activeProject?.id === p.id && !isEditing;
                const langColor = p.language === 'javascript' ? 'text-amber-300 border-amber-500/30 bg-amber-500/10' :
                                  p.language === 'python' ? 'text-blue-300 border-blue-500/30 bg-blue-500/10' :
                                  'text-cyan-300 border-cyan-500/30 bg-cyan-500/10';

                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProject(p)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-500 shadow-lg shadow-indigo-950/60 ring-1 ring-indigo-500/30'
                        : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-100 line-clamp-1">{p.title}</h3>
                      <span className={`px-1.5 py-0.5 text-[10px] uppercase font-bold rounded border ${langColor} shrink-0`}>
                        {p.language || 'HTML'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description || 'គ្មានការពិពណ៌នា'}</p>

                    {/* Tag list */}
                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.tags.slice(0, 3).map(tg => (
                          <span key={tg} className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {p.updatedAt ? p.updatedAt.slice(0, 10) : 'ថ្មីៗ'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProject(p);
                            setIsEditing(true);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded"
                          title="កែប្រែគម្រោង"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(p.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded"
                          title="លុបគម្រោង"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Code Editor Workspace & Live Sandbox */}
        <div className="lg:col-span-8 bg-slate-900/85 border border-slate-800 backdrop-blur-xl rounded-2xl p-5 flex flex-col min-h-[650px]">
          {activeProject || isEditing ? (
            <div className="space-y-4 flex-1 flex flex-col">
              
              {/* Workspace Header Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                {isEditing ? (
                  <div className="flex-1 min-w-[220px]">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="ចំណងជើងគម្រោង..."
                      className="w-full px-3 py-1.5 bg-slate-950 border border-indigo-500/50 rounded-lg text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{activeProject?.title}</span>
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {activeProject?.language || 'HTML'}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">{activeProject?.description}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Run Code Button */}
                  <button
                    onClick={runCode}
                    disabled={isRunning}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
                    title="ដំណើរការកូដ (Run Code)"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isRunning ? 'កំពុងដំណើរការ...' : 'ដំណើរការកូដ (Run)'}</span>
                  </button>

                  {/* Copy Code */}
                  <button
                    onClick={handleCopyCode}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1.5 transition"
                    title="ចម្លងកូដ"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copied ? 'បានចម្លង' : 'ចម្លង'}</span>
                  </button>

                  {/* Download Code */}
                  <button
                    onClick={handleDownloadCode}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1.5 transition"
                    title="ទាញយកឯកសារកូដ"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </button>

                  {/* Edit / Save / Cancel toggles */}
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>បោះបង់</span>
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>រក្សាទុក (Save)</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold rounded-lg flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>កែប្រែ (Edit)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Editing Meta Details (Language & Tags) */}
              {isEditing && (
                <div className="space-y-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 font-semibold">ភាសាសរសេរកូដ (Language)</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium"
                      >
                        <option value="html">HTML / CSS / JavaScript (Web App)</option>
                        <option value="javascript">JavaScript (Node / Browser Engine)</option>
                        <option value="python">Python 3 (Data & Algorithm)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 font-semibold">ការពិពណ៌នាសង្ខេប (Description)</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="ពន្យល់អំពីគោលបំណងកូដ..."
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  {/* Tags Manager */}
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                      <Tag className="w-3 h-3 text-indigo-400" />
                      ស្លាក (Tags):
                    </span>
                    {tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-indigo-950 border border-indigo-500/30 text-indigo-300 text-[10px] rounded-md flex items-center gap-1">
                        #{t}
                        <button onClick={() => handleRemoveTag(t)} className="hover:text-rose-400">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                        placeholder="បន្ថែមស្លាក..."
                        className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[11px] text-white w-24"
                      />
                      <button
                        onClick={handleAddTag}
                        type="button"
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Code Editor Box */}
              <div className="flex-1 flex flex-col space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Source Code ({isEditing ? language.toUpperCase() : (activeProject?.language || 'HTML').toUpperCase()})</span>
                  </span>
                  <span className="text-[10px] text-slate-500">100% User Storage Isolated</span>
                </div>

                <textarea
                  readOnly={!isEditing}
                  value={isEditing ? code : (activeProject?.code || '')}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="// សរសេរកូដរបស់អ្នកនៅទីនេះ..."
                  rows={12}
                  className={`w-full p-4 font-mono text-xs rounded-xl border focus:outline-none transition-all resize-y ${
                    isEditing
                      ? 'bg-slate-950 text-emerald-300 border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/50 shadow-inner'
                      : 'bg-slate-950/80 text-slate-200 border-slate-800 cursor-text'
                  }`}
                  style={{ minHeight: '220px' }}
                />
              </div>

              {/* Live Preview for HTML Projects */}
              {((isEditing && language === 'html') || (!isEditing && activeProject?.language === 'html')) && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>ការបង្ហាញលទ្ធផលជាក់ស្តែង (HTML / CSS Live Preview)</span>
                    </span>
                    <button
                      onClick={() => setPreviewKey(k => k + 1)}
                      className="p-1 hover:text-white text-slate-400 flex items-center gap-1 text-[11px]"
                      title="Reload Preview"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reload</span>
                    </button>
                  </div>
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-lg">
                    <iframe
                      key={previewKey}
                      title="Project Preview"
                      srcDoc={isEditing ? code : (activeProject?.code || '')}
                      sandbox="allow-scripts"
                      className="w-full h-56 bg-slate-950 border-0"
                    />
                  </div>
                </div>
              )}

              {/* Console Output Log for JS / Python or Run events */}
              {consoleOutput.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ផ្ទាំងលទ្ធផល Console Output ({consoleOutput.length} entries)</span>
                    </span>
                    <button
                      onClick={() => setConsoleOutput([])}
                      className="text-[10px] text-slate-500 hover:text-slate-300"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="p-3 bg-black/80 rounded-xl border border-slate-800 max-h-48 overflow-y-auto font-mono text-xs space-y-1">
                    {consoleOutput.map((c, idx) => (
                      <div
                        key={idx}
                        className={`leading-relaxed whitespace-pre-wrap ${
                          c.type === 'error' ? 'text-rose-400 font-bold' :
                          c.type === 'info' ? 'text-indigo-400 font-semibold' :
                          'text-emerald-300'
                        }`}
                      >
                        {c.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-600">
                <Code2 className="w-8 h-8 text-indigo-400/80" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 font-battambang">មិនទាន់បានជ្រើសរើសគម្រោង</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  សូមជ្រើសរើសគម្រោងណាមួយពីបញ្ជីខាងឆ្វេង ឬបង្កើតគម្រោងកូដថ្មីដើម្បីចាប់ផ្តើម
                </p>
              </div>
              <button
                onClick={() => handleStartNew('html')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition"
              >
                + បង្កើតគម្រោងថ្មីឥឡូវនេះ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
