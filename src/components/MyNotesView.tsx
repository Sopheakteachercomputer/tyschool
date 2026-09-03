import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Pin, 
  Save, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Tag, 
  Clock, 
  Search 
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Note, User } from '../types';

interface MyNotesViewProps {
  currentUser: User;
}

export const MyNotesView: React.FC<MyNotesViewProps> = ({ currentUser }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');

  // Edit states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('indigo');
  const [isPinned, setIsPinned] = useState(false);

  const loadNotes = () => {
    const data = StorageService.getNotes(currentUser.id);
    setNotes(data);
  };

  useEffect(() => {
    loadNotes();
  }, [currentUser.id]);

  const handleStartNew = () => {
    setActiveNote(null);
    setTitle('');
    setContent('');
    setColor('indigo');
    setIsPinned(false);
    setIsEditing(true);
  };

  const handleSelectNote = (n: Note) => {
    setActiveNote(n);
    setTitle(n.title);
    setContent(n.content);
    setColor(n.color || 'indigo');
    setIsPinned(!!n.isPinned);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    const res = StorageService.saveNote({
      id: activeNote?.id,
      title: title || 'ចំណាំគ្មានចំណងជើង',
      content,
      color,
      isPinned
    }, currentUser.id);

    if (res.success && res.note) {
      setActiveNote(res.note);
      setIsEditing(false);
      loadNotes();
    } else {
      alert(res.error || 'បរាជ័យក្នុងការរក្សាទុក');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('តើអ្នកពិតជាចង់លុបកំណត់ត្រានេះមែនទេ?')) {
      const res = StorageService.deleteNote(id, currentUser.id);
      if (res.success) {
        if (activeNote?.id === id) {
          setActiveNote(null);
        }
        loadNotes();
      }
    }
  };

  const colorOptions = [
    { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-950/40 border-indigo-500/40', dot: 'bg-indigo-500' },
    { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-950/40 border-emerald-500/40', dot: 'bg-emerald-500' },
    { id: 'amber', label: 'Amber', bg: 'bg-amber-950/40 border-amber-500/40', dot: 'bg-amber-500' },
    { id: 'purple', label: 'Purple', bg: 'bg-purple-950/40 border-purple-500/40', dot: 'bg-purple-500' },
    { id: 'rose', label: 'Rose', bg: 'bg-rose-950/40 border-rose-500/40', dot: 'bg-rose-500' },
  ];

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-['Battambang',sans-serif]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 backdrop-blur-xl p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2 font-['Kantumruy_Pro',sans-serif]">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              កំណត់ចំណាំផ្ទាល់ខ្លួន (My Notes)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              User ID: {currentUser.id}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            កត់ត្រាចំណេះដឹង កិច្ចការផ្ទះ ឬផែនការសិក្សាផ្ទាល់ខ្លួន។ សម្ងាត់ និងមានសុវត្ថិភាពខ្ពស់។
          </p>
        </div>

        <button
          onClick={handleStartNew}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>បង្កើតកំណត់ចំណាំថ្មី (New Note)</span>
        </button>
      </div>

      {/* Grid: Notes + Active Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Notes Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ស្វែងរកកំណត់ចំណាំ..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">មិនមានកំណត់ចំណាំទេ</p>
              </div>
            ) : (
              filteredNotes.map((n) => {
                const isSelected = activeNote?.id === n.id && !isEditing;
                const col = colorOptions.find(c => c.id === n.color) || colorOptions[0];
                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNote(n)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? `${col.bg} ring-2 ring-indigo-500 shadow-lg`
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {n.isPinned && <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        <h3 className="text-sm font-bold text-white line-clamp-1">{n.title}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectNote(n);
                            setIsEditing(true);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-300 rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(n.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 line-clamp-3 whitespace-pre-wrap">{n.content}</p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {n.updatedAt ? n.updatedAt.slice(0, 16) : 'ថ្មីៗ'}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Note Editor/View */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-5 flex flex-col">
          {activeNote || isEditing ? (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                {isEditing ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ចំណងជើងកំណត់ចំណាំ..."
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 mr-2"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    {activeNote?.isPinned && <Pin className="w-4 h-4 text-amber-400 fill-amber-400" />}
                    <h2 className="text-base font-bold text-white">{activeNote?.title}</h2>
                  </div>
                )}

                <div className="flex items-center gap-2">
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
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>រក្សាទុក (Save)</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>កែប្រែ (Edit)</span>
                    </button>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">ពណ៌កំណត់សម្គាល់:</span>
                    <div className="flex items-center gap-1.5">
                      {colorOptions.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setColor(c.id)}
                          className={`w-5 h-5 rounded-full ${c.dot} ${color === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'opacity-60'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600"
                    />
                    <span>ដាក់នៅខាងលើ (Pin Note)</span>
                  </label>
                </div>
              )}

              <textarea
                readOnly={!isEditing}
                value={isEditing ? content : (activeNote?.content || '')}
                onChange={(e) => setContent(e.target.value)}
                placeholder="សរសេរខ្លឹមសារចំណាំនៅទីនេះ..."
                rows={12}
                className={`flex-1 w-full p-4 text-xs rounded-xl border focus:outline-none transition-all leading-relaxed whitespace-pre-wrap ${
                  isEditing
                    ? 'bg-slate-950 text-slate-100 border-indigo-500/50 focus:ring-2 focus:ring-indigo-500'
                    : 'bg-slate-950/70 text-slate-200 border-slate-800 cursor-default'
                }`}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-700" />
              <p className="text-sm">សូមជ្រើសរើសកំណត់ចំណាំ ឬបង្កើតថ្មី</p>
              <button
                onClick={handleStartNew}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
              >
                + បង្កើតកំណត់ចំណាំថ្មី
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
