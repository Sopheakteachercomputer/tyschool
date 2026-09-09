import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Student, SchoolProfile, GradeRecord, FeeInvoice, AttendanceRecord, UserRole } from '../types';
import { 
  X, 
  Printer, 
  FileText, 
  QrCode, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  CreditCard, 
  Award, 
  CheckCircle2, 
  Clock, 
  Building,
  HeartPulse,
  Download,
  Scan,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  TrendingUp,
  LineChart as LineChartIcon
} from 'lucide-react';
import { calculateKhmerGrade, formatBothCurrencies, formatGender, getStudentDefaultAvatar } from '../utils/formatters';
import { PaymentQrModal } from './PaymentQrModal';
import { StorageService } from '../services/storageService';
import { StudentProgressTracker } from './StudentProgressTracker';

interface StudentDetailModalProps {
  student: Student;
  school: SchoolProfile;
  grades: GradeRecord[];
  invoices: FeeInvoice[];
  attendance: AttendanceRecord[];
  onClose: () => void;
  onOpenReportCard: (student: Student) => void;
  onSaveSchool?: (school: SchoolProfile) => void;
  userRole?: UserRole | string;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  school,
  grades,
  invoices,
  attendance,
  onClose,
  onOpenReportCard,
  onSaveSchool,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'ID_CARD' | 'ACADEMIC' | 'PROGRESS' | 'FEES' | 'ATTENDANCE' | 'CLEANING'>('ID_CARD');
  const cleaningSummary = StorageService.getStudentCleaningScoreSummary(student.id);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [scanSimulated, setScanSimulated] = useState<string | null>(null);
  const [isPaymentQrOpen, setIsPaymentQrOpen] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);

  // Attendance metrics
  const totalDays = attendance.length || 20;
  const presentDays = attendance.filter(a => a.status === 'PRESENT').length || 19;
  const permissionDays = attendance.filter(a => a.status === 'PERMISSION').length || 1;
  const absentDays = attendance.filter(a => a.status === 'ABSENT').length || 0;

  // Grade metrics
  const totalScore = grades.reduce((sum, g) => sum + g.score, 0);
  const avgScore = grades.length > 0 ? Number((totalScore / grades.length).toFixed(2)) : 88.5;
  const overallGrade = calculateKhmerGrade(avgScore);

  // QR Code payload formatted for quick attendance scanner devices & mobile cameras
  const qrData = JSON.stringify({
    system: "CAMBODIA_SMS",
    type: "STUDENT_ATTENDANCE_VERIFICATION",
    schoolCode: school.code || school.schoolCode || "SCH-001",
    studentCode: student.studentCode,
    studentId: student.id,
    nameKhmer: student.nameKhmer,
    nameEnglish: student.nameEnglish,
    className: student.className,
    classId: student.classId,
    dob: student.dob || (student as any).date_of_birth || (student as any).dateOfBirth || '',
    gender: student.gender,
    academicYear: school.academicYear,
    timestamp: new Date().toISOString()
  });

  const handleCopyQRPayload = () => {
    navigator.clipboard.writeText(qrData);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleSimulateAttendanceScan = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setScanSimulated(`វត្តមានត្រូវបានកត់ត្រាជោគជ័យ! (Scanned at ${timeStr} • សិស្សមានវត្តមាន)`);
    setTimeout(() => {
      setScanSimulated(null);
    }, 4000);
  };

  const handleDownloadQR = () => {
    const svgElement = document.getElementById('student-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20, 360, 360);
      }
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${student.studentCode}_${student.nameEnglish.replace(/\s+/g, '_')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:fixed">
      <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-200 print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 print:hidden">
          <div className="flex items-center space-x-3">
            <img
              src={getStudentDefaultAvatar(student)}
              alt={student.nameKhmer}
              className="w-11 h-11 rounded-2xl object-cover border border-white/20 shadow-md bg-slate-800"
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = getStudentDefaultAvatar({ gender: student.gender });
                if (target.src !== fallback) {
                  target.src = fallback;
                }
              }}
            />
            <div>
              <h3 className="font-bold text-white font-battambang text-base leading-tight">
                {student.nameKhmer} ({student.nameEnglish})
              </h3>
              <p className="text-xs text-indigo-300 font-mono flex items-center gap-1.5 mt-0.5">
                <span className="bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.2 rounded-full font-bold">
                  {student.studentCode}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300 font-battambang">{student.className}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenReportCard(student)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 rounded-2xl text-xs font-semibold font-battambang transition backdrop-blur-md cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-300" />
              <span>ព្រឹត្តិបត្រពិន្ទុ</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-white rounded-2xl hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="px-6 pt-3 border-b border-white/10 flex flex-wrap gap-1 text-xs font-semibold font-battambang bg-white/[0.02] print:hidden">
          <button
            onClick={() => setActiveTab('ID_CARD')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'ID_CARD' ? 'border-indigo-400 text-indigo-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>កាតសិស្ស & QR</span>
          </button>
          <button
            onClick={() => setActiveTab('PROGRESS')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'PROGRESS' ? 'border-indigo-400 text-indigo-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>ការវិវត្ត & និន្នាការ (Progress)</span>
          </button>
          <button
            onClick={() => setActiveTab('ACADEMIC')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'ACADEMIC' ? 'border-indigo-400 text-indigo-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            លទ្ធផលសិក្សា ({grades.length})
          </button>
          <button
            onClick={() => setActiveTab('FEES')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'FEES' ? 'border-indigo-400 text-indigo-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ថ្លៃសិក្សា ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'ATTENDANCE' ? 'border-indigo-400 text-indigo-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            វត្តមានសិស្ស
          </button>
          <button
            onClick={() => setActiveTab('CLEANING')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CLEANING' ? 'border-indigo-400 text-indigo-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>វេនសម្អាត</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
              cleaningSummary.totalScore >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {cleaningSummary.totalScore >= 0 ? `+${cleaningSummary.totalScore}` : cleaningSummary.totalScore}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[72vh] space-y-6">
          
          {/* TAB 1: ID Card & QR Code Generation */}
          {activeTab === 'ID_CARD' && (
            <div className="space-y-6">
              
              {/* Scan simulation notification */}
              {scanSimulated && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center space-x-2.5 text-emerald-200 text-xs font-battambang animate-in fade-in slide-in-from-top-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{scanSimulated}</span>
                </div>
              )}

              {/* Official Cambodian Student ID Card */}
              <div className="flex flex-col items-center">
                <div 
                  ref={idCardRef}
                  id="printable-id-card"
                  className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400/60 bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 text-white p-5 relative print:shadow-none print:border-indigo-900 print:text-slate-900 print:bg-white print:max-w-full"
                >
                  
                  {/* Subtle Angkor Wat / Cambodian Emblem Watermark */}
                  <div className="absolute right-3 bottom-4 opacity-5 text-white font-serif text-9xl pointer-events-none select-none font-bold">
                    🇰🇭
                  </div>

                  {/* Header */}
                  <div className="text-center border-b border-white/15 pb-3">
                    <p className="text-[11px] font-moul tracking-wider text-amber-300 drop-shadow-xs">ព្រះរាជាណាចក្រកម្ពុជា</p>
                    <p className="text-[9px] font-battambang text-indigo-200">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                    <div className="mt-1 flex items-center justify-center space-x-1.5">
                      <img 
                        src={school.logo} 
                        alt="Logo" 
                        className="w-4 h-4 rounded-full object-contain"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      <h4 className="font-bold text-xs font-battambang text-white">{school.nameKhmer}</h4>
                    </div>
                    <div className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40">
                      <p className="text-[8px] font-bold text-amber-300 font-battambang tracking-widest uppercase">
                        កាតសម្គាល់ខ្លួនសិស្ស • STUDENT ID CARD
                      </p>
                    </div>
                  </div>

                  {/* Body with Photo and details */}
                  <div className="flex items-start space-x-4 mt-4">
                    <div className="shrink-0 text-center">
                      <div className="relative">
                        <img
                          src={getStudentDefaultAvatar(student)}
                          alt={student.nameKhmer}
                          className="w-20 h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-md bg-slate-800"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallback = getStudentDefaultAvatar({ gender: student.gender });
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                        />
                        <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-indigo-950"></span>
                      </div>
                      <span className="font-mono text-[9px] text-amber-300 block mt-1.5 font-bold tracking-wider">
                        {student.studentCode}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs flex-1">
                      <div>
                        <span className="text-[9px] text-indigo-300 block font-battambang">គោត្តនាម-នាម:</span>
                        <strong className="font-bold text-sm text-white font-battambang drop-shadow-xs">{student.nameKhmer}</strong>
                        <p className="text-[10px] text-indigo-200 font-medium">{student.nameEnglish}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px] pt-0.5">
                        <div>
                          <span className="text-[9px] text-indigo-300 block font-battambang">ភេទ (Gender):</span>
                          <span className="font-semibold text-slate-200">{formatGender(student.gender, 'both')}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-indigo-300 block font-battambang">ថ្នាក់រៀន:</span>
                          <span className="font-bold text-amber-300 font-battambang">{student.className}</span>
                        </div>
                      </div>

                      <div className="text-[11px]">
                        <span className="text-[9px] text-indigo-300 block font-battambang">ថ្ងៃខែឆ្នាំកំណើត:</span>
                        <span className="font-mono text-slate-200">{student.dob || (student as any).date_of_birth || (student as any).dateOfBirth || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* ID Card Footer with QR Code Component */}
                  <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-indigo-200 block font-battambang">ឆ្នាំសិក្សា: {school.academicYear}</span>
                      <span className="text-[8px] text-indigo-400 block font-mono">សុពលភាពដល់: 31-08-2026</span>
                      <span className="text-[8px] text-amber-300/80 font-mono mt-0.5 block">VERIFIED # {student.id.slice(-6)}</span>
                    </div>

                    {/* Integrated Scannable QR Code */}
                    <div className="p-1.5 bg-white rounded-xl shadow-lg border border-amber-300/50 flex flex-col items-center">
                      <QRCodeSVG
                        id="student-qr-svg"
                        value={qrData}
                        size={64}
                        level="M"
                        includeMargin={false}
                        fgColor="#0f172a"
                        bgColor="#ffffff"
                      />
                      <span className="text-[6px] font-mono font-bold text-slate-800 mt-0.5 uppercase tracking-tighter">
                        SCAN ID
                      </span>
                    </div>
                  </div>

                </div>

                {/* ID Card & QR Action Controls */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 print:hidden">
                  <button
                    onClick={() => setIsPaymentQrOpen(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:from-rose-500 text-white rounded-2xl text-xs font-bold transition border border-rose-400/30 font-battambang shadow-md shadow-rose-600/20"
                    title="បើក QR ទទួលប្រាក់សិស្ស (Bakong KHQR)"
                  >
                    <QrCode className="w-3.5 h-3.5 text-rose-200" />
                    <span>QR ទទួលប្រាក់សិស្ស ({school.paymentQrAccountName || 'RIN SOPHEAK'})</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-semibold transition border border-white/15 font-battambang shadow-sm backdrop-blur-md"
                    title="Print ID Card"
                  >
                    <Printer className="w-3.5 h-3.5 text-indigo-300" />
                    <span>បោះពុម្ពកាតសិស្ស</span>
                  </button>

                  <button
                    onClick={handleDownloadQR}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 rounded-2xl text-xs font-semibold transition border border-purple-500/30 font-battambang shadow-sm backdrop-blur-md"
                    title="Download QR Code PNG"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-300" />
                    <span>ទាញយក QR Code</span>
                  </button>

                  <button
                    onClick={handleSimulateAttendanceScan}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 rounded-2xl text-xs font-semibold transition border border-emerald-500/30 font-battambang shadow-sm backdrop-blur-md"
                    title="Simulate quick attendance check"
                  >
                    <Scan className="w-3.5 h-3.5 text-emerald-300" />
                    <span>តេស្តស្កេនវត្តមាន (Test Scan)</span>
                  </button>
                </div>
              </div>

              {/* QR Verification & Scanner Meta Section */}
              <div className="p-4 bg-white/5 rounded-3xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <QrCode className="w-4 h-4 text-indigo-300" />
                    <h4 className="font-bold text-white font-battambang text-xs">
                      ទិន្នន័យសម្គាល់ QR Code សម្រាប់ផ្ទៀងផ្ទាត់វត្តមាន (Scannable QR Payload)
                    </h4>
                  </div>
                  <button
                    onClick={handleCopyQRPayload}
                    className="flex items-center space-x-1 text-[11px] text-indigo-300 hover:text-white px-2 py-1 bg-white/5 rounded-xl border border-white/10 transition"
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300">បានចម្លង!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>ចម្លងទិន្នន័យ (Copy JSON)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-black/40 rounded-2xl border border-white/5 font-mono text-[10px] text-slate-300 overflow-x-auto">
                  <p className="text-indigo-400 font-bold mb-1">// Unique Student QR Attendance Payload</p>
                  <p className="whitespace-pre-wrap break-all leading-relaxed opacity-90">{qrData}</p>
                </div>
                
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>
                    លោកគ្រូ-អ្នកគ្រូ អាចប្រើប្រាស់ម៉ាស៊ីនស្កេនបាកូដ ឬកាមេរ៉ាទូរស័ព្ទដើម្បីស្កេនកាតសិស្សនេះ កត់ត្រាវត្តមានចូលរៀនដោយស្វ័យប្រវត្តិ។
                  </span>
                </p>
              </div>

              {/* Complete Profile Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Guardian & Contact */}
                <div className="p-4 bg-white/5 rounded-3xl border border-white/10 space-y-2.5">
                  <h4 className="font-bold text-white font-battambang flex items-center space-x-2 text-xs">
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>ព័ត៌មានអាណាព្យាបាល (Guardian)</span>
                  </h4>
                  <div className="space-y-1.5 text-slate-300">
                    <p>ឈ្មោះអាណាព្យាបាល: <strong className="text-white font-battambang">{student.guardianNameKhmer}</strong></p>
                    <p>ទំនាក់ទំនង: <strong className="text-indigo-300 font-mono">{student.guardianPhone}</strong></p>
                    <p>ទំនាក់ទំនងបន្ទាន់: <span className="font-mono text-slate-300">{student.emergencyContact || student.guardianPhone}</span></p>
                  </div>
                </div>

                {/* Address & Medical */}
                <div className="p-4 bg-white/5 rounded-3xl border border-white/10 space-y-2.5">
                  <h4 className="font-bold text-white font-battambang flex items-center space-x-2 text-xs">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span>អាសយដ្ឋាន & សុខភាព</span>
                  </h4>
                  <div className="space-y-1.5 text-slate-300">
                    <p>អាសយដ្ឋាន: <strong className="text-white font-battambang">{student.addressKhmer || student.address || 'រាជធានីភ្នំពេញ'}</strong></p>
                    <p>ទីកន្លែងកំណើត: <span className="text-slate-200 font-battambang">{student.pobKhmer || student.pob || 'រាជធានីភ្នំពេញ'}</span></p>
                    <p>សុខភាព/ប្រតិកម្ម: <span className="text-slate-200 font-battambang">{student.medicalNotes || 'ធម្មតា (ល្អ)'}</span></p>
                  </div>
                </div>

              </div>

              {/* 16 Fields Extended Info Section */}
              <div className="p-4 bg-cyan-500/5 rounded-3xl border border-cyan-500/20 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-cyan-300 font-battambang flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>ព័ត៌មានលម្អិត ១៦ ចំណុច (Excel Extended Profile Attributes)</span>
                  </h4>
                  {student.rlc && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-[10px]">
                      RLC: {student.rlc}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-[11px]">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-400 block">អាយុ (Age):</span>
                    <strong className="text-white font-mono">{student.age || '—'} ឆ្នាំ</strong>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-400 block">វិភាគទាន (Contributions):</span>
                    <strong className="text-emerald-300 font-mono">{student.contributions || '—'}</strong>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-400 block">ម៉ោងសិក្សា (Time Study):</span>
                    <strong className="text-amber-300 font-battambang">{student.time_study || student.timeStudy || '—'}</strong>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-400 block">ឆមាស (Semester):</span>
                    <strong className="text-indigo-300 font-battambang">{student.semester || 'ឆមាសទី១'}</strong>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-400 block">បង់ប្រាក់តាម (Payment By):</span>
                    <strong className="text-slate-200 font-battambang">{student.payment_by || student.paymentBy || '—'}</strong>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-slate-400 block">សៀវភៅ (Books):</span>
                    <strong className="text-slate-200 font-battambang">{student.books || '—'}</strong>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 col-span-2">
                    <span className="text-slate-400 block">ព័ត៌មានផ្សេងៗ (Other):</span>
                    <strong className="text-slate-200 font-battambang">{student.orther || student.other || '—'}</strong>
                  </div>
                </div>

                {student.remark && (
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-[11px]">
                    <span className="text-slate-400">សម្គាល់ (Remark): </span>
                    <span className="text-slate-200 font-battambang">{student.remark}</span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: Academic Multi-Term Progress Tracking & Trends */}
          {activeTab === 'PROGRESS' && (
            <div className="space-y-4">
              <StudentProgressTracker student={student} grades={grades} school={school} />
            </div>
          )}

          {/* TAB 2: Academic Grades */}
          {activeTab === 'ACADEMIC' && (
            <div className="space-y-5">
              <div className="p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs text-indigo-300 font-battambang font-medium">មធ្យមភាគរួម (GPA)</span>
                  <p className="text-2xl font-extrabold text-white font-mono">{avgScore}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-battambang">និទ្ទេសរួម:</span>
                  <p className="text-lg font-bold text-emerald-400 font-mono">{overallGrade.letter} ({overallGrade.khmer})</p>
                </div>
              </div>

              {/* Progress Tracker inside Academic Tab */}
              <StudentProgressTracker student={student} grades={grades} school={school} />

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 font-battambang flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>តារាងពិន្ទុលម្អិតតាមមុខវិជ្ជាបច្ចុប្បន្ន (Current Subject Grades Breakdown)</span>
                </h4>
                <div className="border border-white/10 rounded-3xl overflow-hidden bg-white/5">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 border-b border-white/10 text-slate-300 font-battambang">
                      <tr>
                        <th className="py-2.5 px-3">មុខវិជ្ជា</th>
                        <th className="py-2.5 px-3 text-center">ពិន្ទុ</th>
                        <th className="py-2.5 px-3 text-center">និទ្ទេស</th>
                        <th className="py-2.5 px-3">ការវាយតម្លៃ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {grades.map(g => {
                        const gr = calculateKhmerGrade(g.score);
                        return (
                          <tr key={g.id} className="hover:bg-white/5 transition">
                            <td className="py-2.5 px-3 font-semibold text-white font-battambang">{g.subjectNameKhmer}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-300">{g.score}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-indigo-300">{gr.letter}</td>
                            <td className="py-2.5 px-3 text-slate-300 font-battambang">{g.remarksKhmer || gr.khmer}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Fee Invoices */}
          {activeTab === 'FEES' && (
            <div className="space-y-3">
              {/* Payment KHQR Quick Card */}
              <div className="p-4 bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 rounded-3xl border border-rose-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white font-battambang text-xs flex items-center gap-1.5">
                      <span>Bakong KHQR បង់ប្រាក់សិស្ស</span>
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded-full font-mono">
                        {school.paymentQrAccountName || 'RIN SOPHEAK'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 font-battambang">
                      ស្កេនទូទាត់ថ្លៃសិក្សា & សេវាកម្មសាលា បានគ្រប់ធនាគារ (ABA, Wing, ACLEDA, Bakong)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPaymentQrOpen(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-600/20 flex items-center space-x-1 font-battambang shrink-0"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>បើកមើល QR</span>
                </button>
              </div>

              {invoices.length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-3xl border border-white/5 text-slate-400 text-xs font-battambang">
                  មិនទាន់មានវិក្កយបត្រថ្លៃសិក្សានៅឡើយទេ
                </div>
              ) : (
                invoices.map(inv => (
                  <div key={inv.id} className="p-4 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-indigo-300">{inv.invoiceNumber}</span>
                      <p className="font-bold text-white font-battambang text-sm mt-0.5">{inv.titleKhmer}</p>
                      <p className="text-[11px] text-slate-400 font-mono">កាលបរិច្ឆេទកំណត់: {inv.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-white">${inv.amountUSD - inv.discountUSD}</span>
                      <span className={`block text-[10px] font-bold mt-0.5 px-2.5 py-0.5 rounded-full border ${
                        inv.status === 'PAID' 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {inv.status === 'PAID' ? 'បង់រួចរាល់' : `នៅសល់ $${inv.remainingUSD}`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: Attendance */}
          {activeTab === 'ATTENDANCE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <span className="text-xs text-emerald-300 font-battambang block">មានវត្តមាន (Present)</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">{presentDays} ថ្ងៃ</span>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <span className="text-xs text-amber-300 font-battambang block">សុំច្បាប់ (Permission)</span>
                  <span className="text-xl font-bold font-mono text-amber-400">{permissionDays} ថ្ងៃ</span>
                </div>
                <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                  <span className="text-xs text-rose-300 font-battambang block">អវត្តមាន (Absent)</span>
                  <span className="text-xl font-bold font-mono text-rose-400">{absentDays} ថ្ងៃ</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Cleaning Duty & Cleanliness Score */}
          {activeTab === 'CLEANING' && (
            <div className="space-y-4">
              {/* Score Bento */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <span className="text-xs text-emerald-300 font-battambang block">បានសម្អាត (+20)</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">{cleaningSummary.cleanedCount} លើក</span>
                </div>
                <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                  <span className="text-xs text-rose-300 font-battambang block">មិនបានសម្អាត (-20)</span>
                  <span className="text-xl font-bold font-mono text-rose-400">{cleaningSummary.missedCount} លើក</span>
                </div>
                <div className={`p-3 rounded-2xl border ${
                  cleaningSummary.totalScore >= 0 
                    ? 'bg-indigo-500/10 border-indigo-500/30' 
                    : 'bg-rose-500/10 border-rose-500/30'
                }`}>
                  <span className="text-xs text-slate-300 font-battambang block">ពិន្ទុអនាម័យសរុប</span>
                  <span className={`text-xl font-bold font-mono ${
                    cleaningSummary.totalScore >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {cleaningSummary.totalScore >= 0 ? `+${cleaningSummary.totalScore}` : cleaningSummary.totalScore} pts
                  </span>
                </div>
              </div>

              {/* History Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ប្រវត្តិនៃការកត់ត្រាវេនសម្អាត (Duty Log History)
                </h4>
                {cleaningSummary.history.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 bg-white/5 rounded-2xl border border-white/10 text-xs">
                    មិនទាន់មានប្រវត្តិវេនសម្អាតនៅឡើយទេ
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cleaningSummary.history.map(rec => (
                      <div
                        key={rec.id}
                        className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            rec.status === 'CLEANED' ? 'bg-emerald-400' : rec.status === 'NOT_CLEANED' ? 'bg-rose-400' : 'bg-amber-400'
                          }`} />
                          <div>
                            <div className="font-semibold text-white">
                              {rec.date} ({rec.dayOfWeek}) • {rec.groupName || 'ក្រុមវេនសម្អាត'}
                            </div>
                            {rec.notes && <div className="text-[11px] text-slate-400">{rec.notes}</div>}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                            rec.scoreChange > 0
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : rec.scoreChange < 0
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-slate-700 text-slate-300'
                          }`}>
                            {rec.scoreChange > 0 ? `+${rec.scoreChange}` : rec.scoreChange}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-white/5 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-xs font-semibold transition border border-white/10 font-battambang"
          >
            បិទ (Close)
          </button>
        </div>

      </div>

      {/* Student Payment QR Modal */}
      <PaymentQrModal
        isOpen={isPaymentQrOpen}
        onClose={() => setIsPaymentQrOpen(false)}
        school={school}
        onSaveSchool={onSaveSchool || (() => {})}
        student={student}
        initialMode="VIEW"
        userRole={userRole}
      />
    </div>
  );
};
