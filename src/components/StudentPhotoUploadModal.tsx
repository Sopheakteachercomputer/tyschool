import React, { useState, useRef, useEffect } from 'react';
import { Student, ClassRoom, UserRole } from '../types';
import { 
  X, 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  Check, 
  Search, 
  Trash2, 
  Sparkles, 
  User, 
  RefreshCw, 
  FolderUp, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers,
  GraduationCap
} from 'lucide-react';
import { optimizePhotoUpload, isImageFile } from '../utils/imageCompressor';
import { getStudentDefaultAvatar } from '../utils/formatters';

interface StudentPhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  classes?: ClassRoom[];
  selectedStudent?: Student | null;
  initialSelectedStudent?: Student | null;
  onSaveStudent: (student: Student) => void;
  onSaveStudentsBatch?: (students: Student[], mode: 'APPEND' | 'REPLACE') => void;
  userRole?: UserRole | string;
}

export const StudentPhotoUploadModal: React.FC<StudentPhotoUploadModalProps> = ({
  isOpen,
  onClose,
  students,
  classes = [],
  selectedStudent,
  initialSelectedStudent,
  onSaveStudent,
  onSaveStudentsBatch,
  userRole
}) => {
  const isSuperAdmin = !userRole || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'SCHOOL_ADMIN' || userRole === 'DIRECTOR';
  const effectiveStudent = selectedStudent || initialSelectedStudent || null;
  const [activeTab, setActiveTab] = useState<'SINGLE' | 'BATCH' | 'CAMERA'>('SINGLE');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(effectiveStudent?.id || students[0]?.id || '');
  const [studentSearch, setStudentSearch] = useState('');
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string>(effectiveStudent?.photo || '');
  const [isDragging, setIsDragging] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  // Batch upload state
  interface BatchMatchedItem {
    file: File;
    fileName: string;
    previewUrl: string;
    studentId: string;
    studentNameKhmer: string;
    studentCode: string;
    className: string;
    matched: boolean;
  }
  const [batchItems, setBatchItems] = useState<BatchMatchedItem[]>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);

  // Sync state whenever the modal opens or targeted student changes
  useEffect(() => {
    if (isOpen) {
      if (effectiveStudent) {
        setSelectedStudentId(effectiveStudent.id);
        setPreviewPhotoUrl(effectiveStudent.photo || '');
      } else if (students.length > 0) {
        const found = students.find(s => s.id === selectedStudentId) || students[0];
        setSelectedStudentId(found.id);
        setPreviewPhotoUrl(found.photo || '');
      }
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, effectiveStudent]);

  // Selected student object
  const currentStudent = students.find(s => s.id === selectedStudentId);

  // Handle manual dropdown selection of student
  const handleSelectStudent = (newStudentId: string) => {
    setSelectedStudentId(newStudentId);
    const target = students.find(s => s.id === newStudentId);
    if (target) {
      setPreviewPhotoUrl(target.photo || '');
    }
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Clean up camera stream on close or tab change
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  if (!isOpen) return null;

  // Filter students for dropdown / selection
  const filteredStudents = students.filter(s => {
    const q = studentSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      s.nameKhmer.toLowerCase().includes(q) ||
      s.nameEnglish.toLowerCase().includes(q) ||
      s.studentCode.toLowerCase().includes(q) ||
      (s.className && s.className.toLowerCase().includes(q))
    );
  });

  // Helper to optimize and resize images with NO file size limit, downscaling to crisp HD DataURL (~15KB)
  const processImageFile = async (file: File): Promise<string> => {
    const res = await optimizePhotoUpload(file, { maxDim: 360, quality: 0.80 });
    return res.dataUrl;
  };

  const handleSingleFileSelect = async (file: File) => {
    setErrorMessage(null);
    try {
      const res = await optimizePhotoUpload(file, { maxDim: 360, quality: 0.80 });
      setPreviewPhotoUrl(res.dataUrl);
      setSuccessMessage(`បានផ្ទុករូបភាពរួចរាល់ (${res.originalSizeFormatted} ➔ ${res.compressedSizeFormatted})! សូមចុចប៊ូតុង "រក្សាទុករូបថត" ដើម្បីអនុវត្ត។`);
    } catch (err: any) {
      setErrorMessage(err.message || 'មានបញ្ហាក្នុងការផ្ទុករូបភាព');
    }
  };

  const handleSaveSinglePhoto = () => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចប្តូររូបថតសិស្សបាន!');
      return;
    }
    if (!currentStudent) {
      setErrorMessage('សូមជ្រើសរើសសិស្សជាមុនសិន!');
      return;
    }
    if (!previewPhotoUrl) {
      setErrorMessage('សូមជ្រើសរើស ឬថតរូបភាពជាមុនសិន!');
      return;
    }

    const updatedStudent: Student = {
      ...currentStudent,
      photo: previewPhotoUrl
    };

    onSaveStudent(updatedStudent);
    setSuccessMessage(`បានរក្សាទុករូបថតសម្រាប់ ${currentStudent.nameKhmer} (${currentStudent.studentCode}) ដោយជោគជ័យ!`);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  // Camera Handlers
  const handleStartCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } } 
      });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setErrorMessage('មិនអាចបើកកាមេរ៉ាបានទេ (សូមពិនិត្យសិទ្ធិកាមេរ៉ាក្នុង Browser របស់អ្នក)');
    }
  };

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const handleCaptureCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.80);
      setPreviewPhotoUrl(dataUrl);
      handleStopCamera();
      setActiveTab('SINGLE');
      setSuccessMessage('បានថតរូបភាពរួចរាល់! សូមចុចប៊ូតុង "រក្សាទុករូបថត" ដើម្បីអនុវត្ត។');
    }
  };

  // Batch Handlers
  const handleBatchFilesSelect = async (files: FileList) => {
    setBatchProcessing(true);
    setErrorMessage(null);
    const newItems: BatchMatchedItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!isImageFile(file)) continue;

      const baseName = file.name.replace(/\.[^/.]+$/, '').trim().toLowerCase();
      // Match by studentCode, id, nameKhmer, nameEnglish, or roll number / ID number
      const matchedStudent = students.find(s => {
        const code = s.studentCode.toLowerCase();
        const id = s.id.toLowerCase();
        const khName = s.nameKhmer.toLowerCase().replace(/\s+/g, '');
        const enName = s.nameEnglish.toLowerCase().replace(/\s+/g, '');
        const cleanBase = baseName.replace(/\s+/g, '');
        const studentNoStr = s.no !== undefined ? String(s.no) : '';

        // Extract numeric sequences
        const fileNumbers = baseName.match(/\d+/g)?.join('') || '';
        const codeNumbers = code.match(/\d+/g)?.join('') || '';

        return (
          code === baseName ||
          id === baseName ||
          baseName.includes(code) ||
          cleanBase.includes(khName) ||
          cleanBase.includes(enName) ||
          (studentNoStr && (baseName === studentNoStr || fileNumbers === studentNoStr)) ||
          (codeNumbers && fileNumbers && codeNumbers.endsWith(fileNumbers) && fileNumbers.length >= 3)
        );
      });

      try {
        const previewUrl = await processImageFile(file);
        newItems.push({
          file,
          fileName: file.name,
          previewUrl,
          studentId: matchedStudent ? matchedStudent.id : '',
          studentNameKhmer: matchedStudent ? matchedStudent.nameKhmer : '',
          studentCode: matchedStudent ? matchedStudent.studentCode : '',
          className: matchedStudent ? matchedStudent.className : '',
          matched: Boolean(matchedStudent)
        });
      } catch (e) {
        console.error('Error processing batch image', e);
      }
    }

    setBatchItems(prev => [...prev, ...newItems]);
    setBatchProcessing(false);
  };

  const handleApplyBatchPhotos = () => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចប្តូររូបថតសិស្សបាន!');
      return;
    }
    const matchedItems = batchItems.filter(item => item.studentId && item.previewUrl);
    if (matchedItems.length === 0) {
      setErrorMessage('មិនមានរូបថតដែលត្រូវគ្នានឹងសិស្សដើម្បីរក្សាទុកឡើយ!');
      return;
    }

    const updatedList: Student[] = [];
    matchedItems.forEach(item => {
      const targetStudent = students.find(s => s.id === item.studentId);
      if (targetStudent) {
        updatedList.push({
          ...targetStudent,
          photo: item.previewUrl
        });
      }
    });

    if (onSaveStudentsBatch) {
      onSaveStudentsBatch(updatedList, 'APPEND');
    } else {
      updatedList.forEach(st => onSaveStudent(st));
    }

    setSuccessMessage(`បានធ្វើបច្ចុប្បន្នភាពរូបថតសិស្សចំនួន ${updatedList.length} នាក់ដោយជោគជ័យ!`);
    setBatchItems([]);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fadeIn font-kantumruy">
      <div className="bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 p-4 sm:p-5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-2xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-battambang flex items-center gap-2">
                <span>ផ្ទុករូបថតសិស្ស (Upload Student Photo)</span>
                <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {students.length} សិស្សសរុប
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                ជ្រើសរើសសិស្ស ផ្ទុករូបភាពពីកុំព្យូទ័រ/ទូរស័ព្ទ ឬថតផ្ទាល់តាមកាមេរ៉ា
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              handleStopCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-white/5 px-4 pt-2 gap-2 flex-shrink-0">
          <button
            onClick={() => {
              handleStopCamera();
              setActiveTab('SINGLE');
            }}
            className={`px-4 py-2 text-xs font-bold font-battambang rounded-t-2xl border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'SINGLE'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>ផ្ទុករូបថតមួយៗ (Single Upload)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('CAMERA');
              handleStartCamera();
            }}
            className={`px-4 py-2 text-xs font-bold font-battambang rounded-t-2xl border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'CAMERA'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>ថតរូបតាមកាមេរ៉ា (Webcam Capture)</span>
          </button>

          <button
            onClick={() => {
              handleStopCamera();
              setActiveTab('BATCH');
            }}
            className={`px-4 py-2 text-xs font-bold font-battambang rounded-t-2xl border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'BATCH'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderUp className="w-3.5 h-3.5" />
            <span>ផ្ទុករូបច្រើនព្រមគ្នា (Batch Upload)</span>
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mx-4 mt-3 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-grow">
          
          {/* 1. SINGLE UPLOAD TAB */}
          {activeTab === 'SINGLE' && (
            <div className="space-y-4">
              
              {/* Student Selector */}
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <label className="block text-xs font-bold text-slate-200 font-battambang">
                  ១. ជ្រើសរើសសិស្ស (Select Student)
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      placeholder="ស្វែងរកឈ្មោះ ឬអត្តលេខ..."
                      className="w-full pl-8 pr-3 py-2 bg-slate-900/80 text-xs text-white rounded-xl border border-white/10 focus:border-indigo-400 outline-none"
                    />
                  </div>

                  <select
                    value={selectedStudentId}
                    onChange={e => handleSelectStudent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/80 text-xs text-indigo-200 font-battambang font-medium rounded-xl border border-indigo-500/30 outline-none"
                  >
                    {filteredStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nameKhmer} ({s.studentCode}) • {s.className}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Student Meta Pill */}
                {currentStudent && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-300">
                    <span className="font-bold text-white font-battambang">{currentStudent.nameKhmer}</span>
                    <span className="text-slate-400 font-mono">({currentStudent.studentCode})</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px]">
                      {currentStudent.className}
                    </span>
                    {(currentStudent.time_study || currentStudent.timeStudy) && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {currentStudent.time_study || currentStudent.timeStudy}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Upload & Preview Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                
                {/* Left: Avatar Preview */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-2xl border border-white/10 text-center">
                  <div className="relative group">
                    <img
                      src={previewPhotoUrl || getStudentDefaultAvatar(currentStudent)}
                      alt="Student Preview"
                      className="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl object-cover border-2 border-indigo-400 shadow-2xl bg-slate-800"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-3xl opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white text-xs font-semibold gap-1"
                      title="ចុចដើម្បីប្តូររូបភាព"
                    >
                      <Camera className="w-6 h-6 text-indigo-300" />
                      <span>ប្តូររូបថត</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 font-mono">
                    {currentStudent?.studentCode || 'STU-PREVIEW'}
                  </span>
                </div>

                {/* Right: Drag & Drop Zone */}
                <div className="sm:col-span-7 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.jpg,.jpeg,.png,.webp,.jfif,.heic,.heif,.bmp,.gif"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleSingleFileSelect(e.target.files[0]);
                      }
                      e.target.value = '';
                    }}
                  />

                  <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleSingleFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-indigo-400 bg-indigo-500/20'
                        : 'border-white/20 hover:border-indigo-400/60 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <Upload className="w-8 h-8 mx-auto text-indigo-400 mb-2 animate-bounce" />
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <p className="text-xs font-bold text-white font-battambang">
                        ចុច ឬទម្លាក់រូបថតសិស្សទីនេះ
                      </p>
                      <span className="text-[10px] text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-sans">
                        ⚡ មិនកំណត់ទំហំ
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      គាំទ្ររូបភាព JPG, PNG, WebP • មិនកំណត់ទំហំផ្ទុក (Auto-compressed HD)
                    </p>
                  </div>

                    {/* URL Input Fallback */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="ឬបិទភ្ជាប់តំណភ្ជាប់រូបភាព (Image URL)..."
                        value={previewPhotoUrl.startsWith('data:image/') ? '' : previewPhotoUrl}
                        onChange={e => setPreviewPhotoUrl(e.target.value)}
                        className="flex-grow px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-200 outline-none focus:border-indigo-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300')}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs whitespace-nowrap font-battambang"
                        title="ប្រើប្រាស់រូបគំរូដើម"
                      >
                        រូបដើម
                      </button>
                    </div>

                    {/* Presets */}
                    <div className="pt-2">
                      <span className="text-[11px] text-slate-400 block mb-1 font-battambang">
                        រូបថតគំរូ (Quick Presets):
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { id: 'p1', label: 'ស្រី ១', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' },
                          { id: 'p2', label: 'ស្រី ២', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300' },
                          { id: 'p3', label: 'ស្រី ៣', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300' },
                          { id: 'p4', label: 'ប្រុស ១', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300' },
                          { id: 'p5', label: 'ប្រុស ២', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' },
                          { id: 'p6', label: 'ប្រុស ៣', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300' }
                        ].map(preset => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setPreviewPhotoUrl(preset.url)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] border transition ${
                              previewPhotoUrl === preset.url
                                ? 'bg-indigo-600/40 border-indigo-400 text-indigo-200 ring-1 ring-indigo-400'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            <img src={preset.url} alt={preset.label} className="w-3.5 h-3.5 rounded-full object-cover" />
                            <span className="font-battambang">{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

              </div>

            </div>
          )}

          {/* 2. CAMERA WEBCAM TAB */}
          {activeTab === 'CAMERA' && (
            <div className="space-y-4 text-center">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-left">
                <label className="block text-xs font-bold text-slate-200 font-battambang mb-1">
                  ជ្រើសរើសសិស្សសម្រាប់ថតរូប
                </label>
                <select
                  value={selectedStudentId}
                  onChange={e => handleSelectStudent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 text-xs text-indigo-200 font-battambang rounded-xl border border-indigo-500/30 outline-none"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nameKhmer} ({s.studentCode}) • {s.className}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative inline-block max-w-sm w-full mx-auto bg-black rounded-3xl overflow-hidden border-2 border-indigo-500/50 shadow-2xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 sm:h-72 object-cover"
                />
                
                {/* Visual Avatar Frame Overlay */}
                <div className="absolute inset-0 border-2 border-white/20 rounded-3xl pointer-events-none flex items-center justify-center">
                  <div className="w-44 h-44 rounded-full border-2 border-dashed border-indigo-300/60 pointer-events-none"></div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCaptureCamera}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-indigo-500/30 flex items-center gap-2 font-battambang"
                >
                  <Camera className="w-4 h-4" />
                  <span>ថតយករូបភាព (Capture Photo)</span>
                </button>
                <button
                  type="button"
                  onClick={handleStartCamera}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-2xl transition"
                  title="បើកកាមេរ៉ាឡើងវិញ"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 3. BATCH UPLOAD TAB */}
          {activeTab === 'BATCH' && (
            <div className="space-y-4">
              <input
                ref={batchFileInputRef}
                type="file"
                multiple
                accept="image/*,.jpg,.jpeg,.png,.webp,.jfif,.heic,.heif,.bmp,.gif"
                className="hidden"
                onChange={e => {
                  if (e.target.files) {
                    handleBatchFilesSelect(e.target.files);
                  }
                  e.target.value = '';
                }}
              />

              <div
                onClick={() => batchFileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-white/20 hover:border-emerald-400 bg-white/5 hover:bg-white/10 rounded-2xl text-center cursor-pointer transition"
              >
                <FolderUp className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <p className="text-xs font-bold text-white font-battambang">
                    ជ្រើសរើសរូបថតសិស្សច្រើនព្រមគ្នា (Select Multiple Photos)
                  </p>
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-sans">
                    ⚡ មិនកំណត់ទំហំ
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  មិនកំណត់ទំហំឯកសារ (Auto-compressed) • គន្លឹះ៖ ដាក់ឈ្មោះរូបភាពតាមអត្តលេខសិស្ស (ឧ. <code className="text-emerald-300">STU-2026-00001.jpg</code> ឬ <code className="text-emerald-300">ហេង ពិសិដ្ឋ.png</code>) ប្រព័ន្ធនឹងផ្គូផ្គងស្វ័យប្រវត្តិ!
                </p>
              </div>

              {/* Matched List */}
              {batchItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-battambang">
                    <span>បញ្ជីរូបថតដែលបានជ្រើស ({batchItems.length} រូប)</span>
                    <button
                      type="button"
                      onClick={() => setBatchItems([])}
                      className="text-rose-400 hover:text-rose-300 text-[11px]"
                    >
                      ជម្រះទាំងអស់
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {batchItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/10 text-xs">
                        <div className="flex items-center gap-2.5">
                          <img src={item.previewUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/20" />
                          <div>
                            <span className="font-mono text-slate-300 text-[11px] block">{item.fileName}</span>
                            {item.matched ? (
                              <span className="text-[10px] text-emerald-300 font-battambang flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-400" />
                                ផ្គូផ្គង៖ {item.studentNameKhmer} ({item.studentCode})
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-400 font-battambang">
                                មិនទាន់ផ្គូផ្គង (សូមជ្រើសរើសសិស្សខាងក្រោម)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Assign manual student dropdown if not matched */}
                        <div className="flex items-center gap-2">
                          <select
                            value={item.studentId}
                            onChange={e => {
                              const st = students.find(s => s.id === e.target.value);
                              const updated = [...batchItems];
                              updated[idx].studentId = e.target.value;
                              updated[idx].studentNameKhmer = st?.nameKhmer || '';
                              updated[idx].studentCode = st?.studentCode || '';
                              updated[idx].matched = Boolean(st);
                              setBatchItems(updated);
                            }}
                            className="px-2 py-1 bg-slate-900 text-[11px] text-slate-200 rounded-lg border border-white/10 outline-none max-w-[140px]"
                          >
                            <option value="">ជ្រើសរើសសិស្ស...</option>
                            {students.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.nameKhmer} ({s.studentCode})
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => setBatchItems(batchItems.filter((_, i) => i !== idx))}
                            className="p-1 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              handleStopCamera();
              onClose();
            }}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl text-xs font-semibold transition border border-white/10"
          >
            បិទ (Close)
          </button>

          {activeTab === 'SINGLE' && (
            <button
              type="button"
              id="btn-save-student-photo-single"
              onClick={handleSaveSinglePhoto}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-indigo-500/20 border border-indigo-400/30 flex items-center gap-1.5 font-battambang"
            >
              <Check className="w-4 h-4" />
              <span>រក្សាទុករូបថតសិស្ស (Save Photo)</span>
            </button>
          )}

          {activeTab === 'CAMERA' && (
            <button
              type="button"
              onClick={handleCaptureCamera}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-indigo-500/20 border border-indigo-400/30 flex items-center gap-1.5 font-battambang"
            >
              <Camera className="w-4 h-4" />
              <span>ថតយករូបភាព</span>
            </button>
          )}

          {activeTab === 'BATCH' && (
            <button
              type="button"
              id="btn-apply-batch-photos"
              disabled={batchItems.filter(i => i.matched).length === 0}
              onClick={handleApplyBatchPhotos}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-lg flex items-center gap-1.5 font-battambang ${
                batchItems.filter(i => i.matched).length > 0
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20 border border-emerald-400/30'
                  : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>រក្សាទុករូបថតទាំងអស់ ({batchItems.filter(i => i.matched).length})</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
