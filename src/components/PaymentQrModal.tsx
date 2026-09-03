import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SchoolProfile, Student, FeeInvoice, UserRole } from '../types';
import { 
  X, 
  Upload, 
  QrCode, 
  Check, 
  Download, 
  Printer, 
  Copy, 
  Sparkles, 
  CreditCard, 
  Building2, 
  User, 
  FileText, 
  RefreshCw, 
  Image as ImageIcon,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Smartphone
} from 'lucide-react';

interface PaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolProfile;
  onSaveSchool: (updatedProfile: SchoolProfile) => void;
  // Optional specific student context
  student?: Student | null;
  invoice?: FeeInvoice | null;
  amountUSD?: number;
  amountKHR?: number;
  totalStudentsCount?: number;
  initialMode?: 'VIEW' | 'CHANGE';
  userRole?: UserRole | string;
}

export const PaymentQrModal: React.FC<PaymentQrModalProps> = ({
  isOpen,
  onClose,
  school,
  onSaveSchool,
  student,
  invoice,
  amountUSD,
  amountKHR,
  totalStudentsCount = 0,
  initialMode = 'VIEW',
  userRole
}) => {
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const [activeTab, setActiveTab] = useState<'VIEW' | 'CHANGE'>(isSuperAdmin && initialMode === 'CHANGE' ? 'CHANGE' : 'VIEW');
  
  useEffect(() => {
    if (!isSuperAdmin && activeTab === 'CHANGE') {
      setActiveTab('VIEW');
    }
  }, [isSuperAdmin, activeTab]);

  useEffect(() => {
    if (isSuperAdmin && initialMode === 'CHANGE') {
      setActiveTab('CHANGE');
    } else {
      setActiveTab('VIEW');
    }
  }, [initialMode, isSuperAdmin, isOpen]);
  
  // Edit Form State for QR
  const [accountName, setAccountName] = useState(school.paymentQrAccountName || 'RIN SOPHEAK');
  const [bankName, setBankName] = useState(school.paymentQrBankName || 'Bakong KHQR');
  const [accountNumber, setAccountNumber] = useState(school.paymentQrAccountNumber || 'rinsopheak@bakong');
  const [currency, setCurrency] = useState<'KHR' | 'USD' | 'BOTH'>(school.paymentQrCurrency || 'KHR');
  const [notes, setNotes] = useState(school.paymentQrNotes || 'សូមស្កេនបង់ប្រាក់ថ្លៃសិក្សា ដោយបញ្ជាក់ឈ្មោះសិស្ស និងលេខកូដសិស្សក្នុង Remark');
  const [qrImageUrl, setQrImageUrl] = useState<string>(school.paymentQrUrl || '');
  const [isDragging, setIsDragging] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrCardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Calculate dynamic amounts
  const rate = school.exchangeRate || 4100;
  const displayAmountUSD = amountUSD !== undefined 
    ? amountUSD 
    : (invoice ? invoice.remainingUSD : 0);
  const displayAmountKHR = amountKHR !== undefined 
    ? amountKHR 
    : (displayAmountUSD > 0 ? displayAmountUSD * rate : (invoice?.remainingKHR || 0));

  // Generate KHQR payload data string if no image uploaded
  const khqrPayload = JSON.stringify({
    system: "BAKONG_KHQR",
    accountName: accountName,
    bank: bankName,
    accountNumber: accountNumber,
    currency: currency,
    amountUSD: displayAmountUSD,
    amountKHR: displayAmountKHR,
    studentCode: student?.studentCode || 'ALL_STUDENTS',
    studentName: student?.nameKhmer || 'សិស្សទូទៅ',
    school: school.nameKhmer,
    invoiceNo: invoice?.invoiceNumber || 'INV-DIRECT'
  });

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('សូមជ្រើសរើសឯកសារជារូបភាព (PNG, JPG, JPEG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setQrImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSaveQRSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('សិទ្ធិត្រូវបានបដិសេធ៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចផ្លាស់ប្តូរ QR Payment បាន (Only Super Admin can modify QR Payment)');
      return;
    }
    const updatedProfile: SchoolProfile = {
      ...school,
      paymentQrAccountName: accountName.trim() || 'RIN SOPHEAK',
      paymentQrBankName: bankName.trim() || 'Bakong KHQR',
      paymentQrAccountNumber: accountNumber.trim(),
      paymentQrCurrency: currency,
      paymentQrNotes: notes.trim(),
      paymentQrUrl: qrImageUrl,
      paymentQrUpdatedAt: new Date().toISOString()
    };

    onSaveSchool(updatedProfile);
    setSaveSuccessMsg('បានរក្សាទុក និងអនុវត្ត QR ថ្មីទៅកាន់បញ្ជីសិស្សទាំងអស់ដោយជោគជ័យ!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setActiveTab('VIEW');
    }, 1500);
  };

  const handleUseRinSopheakDefault = () => {
    setAccountName('RIN SOPHEAK');
    setBankName('Bakong KHQR');
    setAccountNumber('rinsopheak@bakong');
    setCurrency('KHR');
    setNotes('សូមស្កេនបង់ប្រាក់ថ្លៃសិក្សា ដោយបញ្ជាក់ឈ្មោះសិស្ស និងលេខកូដសិស្សក្នុង Remark');
    setQrImageUrl('');
  };

  const handleCopyDetails = () => {
    const textToCopy = `គណនីបង់ប្រាក់សាលា (${school.nameKhmer}):\nឈ្មោះគណនី: ${accountName}\nធនាគារ: ${bankName}\nលេខគណនី/Bakong: ${accountNumber || 'RIN SOPHEAK'}\nសិស្ស: ${student ? `${student.nameKhmer} (${student.studentCode})` : 'សិស្សទាំងអស់'}\nទឹកប្រាក់: ${displayAmountUSD > 0 ? `$${displayAmountUSD} (៛${displayAmountKHR.toLocaleString('km-KH')})` : 'តាមការកំណត់'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    if (qrImageUrl) {
      const link = document.createElement('a');
      link.href = qrImageUrl;
      link.download = `KHQR_Payment_${accountName.replace(/\s+/g, '_')}_${student ? student.studentCode : 'School'}.png`;
      link.click();
      return;
    }

    const svgElement = document.getElementById('khqr-svg-code');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 500;
      canvas.height = 700;
      if (ctx) {
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.roundRect ? ctx.roundRect(0, 0, 500, 700, 24) : ctx.fillRect(0, 0, 500, 700);
        ctx.fill();

        // Top notch red
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(420, 0);
        ctx.lineTo(500, 0);
        ctx.lineTo(500, 80);
        ctx.closePath();
        ctx.fill();

        // Header text
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(accountName, 40, 55);

        ctx.font = 'bold 36px sans-serif';
        const amtText = displayAmountUSD > 0 
          ? (currency === 'USD' ? `$ ${displayAmountUSD}` : `៛ ${displayAmountKHR.toLocaleString('km-KH')}`)
          : `៛ 0`;
        ctx.fillText(amtText, 40, 105);

        // Dashed line
        ctx.strokeStyle = '#cbd5e1';
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(20, 135);
        ctx.lineTo(480, 135);
        ctx.stroke();
        ctx.setLineDash([]);

        // QR Code
        ctx.drawImage(img, 60, 160, 380, 380);

        // Footer info
        ctx.fillStyle = '#64748b';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        if (student) {
          ctx.fillText(`សិស្ស: ${student.nameKhmer} (${student.studentCode}) • ${student.className}`, 250, 580);
        }
        ctx.fillText(`${school.nameKhmer} • Bakong KHQR Payment`, 250, 610);
      }

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `KHQR_${accountName.replace(/\s+/g, '_')}_${student ? student.studentCode : 'School'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:fixed">
      <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden font-battambang animate-in fade-in zoom-in-95 duration-200 print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Header with Switcher Tabs */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-950/80 border-b border-white/10 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight flex items-center gap-2">
                <span>QR ទទួលប្រាក់សិស្ស (Student Payment KHQR)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                  {school.paymentQrBankName || 'Bakong KHQR'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {student ? `សម្រាប់សិស្ស: ${student.nameKhmer} (${student.studentCode})` : 'អនុវត្តទៅកាន់សិស្សទាំងអស់ក្នុងប្រព័ន្ធដោយស្វ័យប្រវត្តិ'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View / Change Tabs */}
            <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setActiveTab('VIEW')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'VIEW'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                បង្ហាញ QR
              </button>
              {isSuperAdmin ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('CHANGE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1 ${
                    activeTab === 'CHANGE'
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>ប្តូរ/បញ្ចូល QR ថ្មី</span>
                </button>
              ) : (
                <div 
                  className="px-2.5 py-1 text-[11px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center space-x-1 cursor-not-allowed"
                  title="មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកែប្រែ QR Payment បាន"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>កែប្រែ (Super Admin)</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="បិទ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-5 py-3 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: VIEW STUDENT PAYMENT QR */}
          {activeTab === 'VIEW' && (
            <div className="space-y-6">
              
              {/* Top Summary Banner */}
              <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-rose-500/10 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">ម្ចាស់គណនីទទួល:</span>
                    <strong className="text-rose-400 font-mono text-sm tracking-wide">{school.paymentQrAccountName || 'RIN SOPHEAK'}</strong>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    ស្កេនតាមរយៈកម្មវិធី Bakong, ABA Mobile, ACLEDA mobile, Wing, Canadia និងគ្រប់ធនាគារក្នុងប្រទេសកម្ពុជា
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {isSuperAdmin ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab('CHANGE')}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition flex items-center space-x-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-rose-400" />
                      <span>ប្តូររូបភាព QR នេះ</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 bg-black/30 px-3 py-1.5 rounded-xl border border-white/5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>សិទ្ធិកែប្រែ QR: Super Admin Only</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Central KHQR Card with Authentic Cambodian KHQR Styling */}
              <div className="flex justify-center">
                <div 
                  ref={qrCardRef}
                  className="w-full max-w-sm bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 relative transform transition hover:scale-[1.01]"
                >
                  
                  {/* Top Red Notch Decor (Authentic KHQR) */}
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
                    <div className="bg-red-600 text-white w-24 h-8 transform rotate-45 translate-x-3 -translate-y-1 flex items-center justify-center font-bold text-[9px] shadow-md">
                      KHQR
                    </div>
                  </div>

                  {/* Top KHQR Info Header */}
                  <div className="p-6 pb-4">
                    <h4 className="text-sm font-extrabold text-slate-900 tracking-wider uppercase font-sans">
                      {school.paymentQrAccountName || 'RIN SOPHEAK'}
                    </h4>
                    
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 font-sans tracking-tight">
                        {displayAmountUSD > 0 ? (
                          currency === 'USD' ? `$ ${displayAmountUSD.toFixed(2)}` : `៛ ${displayAmountKHR.toLocaleString('km-KH')}`
                        ) : (
                          `៛ 0`
                        )}
                      </span>
                      {displayAmountUSD > 0 && currency !== 'USD' && (
                        <span className="text-xs text-slate-500 font-mono">
                          (${displayAmountUSD.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dashed Separator Line */}
                  <div className="border-b-2 border-dashed border-slate-200 my-1 relative">
                    <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-slate-900" />
                    <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-slate-900" />
                  </div>

                  {/* QR Body Viewport */}
                  <div className="p-6 pt-4 flex flex-col items-center justify-center">
                    {school.paymentQrUrl ? (
                      /* Display Custom Uploaded QR Code Image */
                      <div className="w-56 h-56 rounded-2xl overflow-hidden border border-slate-200 bg-white p-2 flex items-center justify-center shadow-inner">
                        <img
                          src={school.paymentQrUrl}
                          alt={`KHQR ${school.paymentQrAccountName || 'RIN SOPHEAK'}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      /* Display High-Fidelity SVG KHQR Code */
                      <div className="w-56 h-56 p-2 bg-white rounded-2xl flex items-center justify-center relative">
                        <QRCodeSVG
                          id="khqr-svg-code"
                          value={khqrPayload}
                          size={210}
                          level="H"
                          includeMargin={false}
                          imageSettings={{
                            src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Emblem_of_Cambodia.svg/120px-Emblem_of_Cambodia.svg.png",
                            x: undefined,
                            y: undefined,
                            height: 38,
                            width: 38,
                            excavate: true,
                          }}
                        />
                        {/* Center Bakong / Riel Emblem Badge */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-slate-950 border-2 border-white flex items-center justify-center text-white font-bold text-sm shadow-md font-battambang">
                            ៛
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Student & Invoice Meta details if present */}
                    {student && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 w-full text-center space-y-0.5">
                        <p className="text-xs font-bold text-slate-800 font-battambang">
                          {student.nameKhmer} ({student.nameEnglish})
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          ID: <strong>{student.studentCode}</strong> • {student.className}
                        </p>
                        {invoice && (
                          <p className="text-[10px] text-indigo-700 font-mono font-semibold">
                            វិក្កយបត្រ: {invoice.invoiceNumber}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-[10px] text-slate-400 mt-3 text-center">
                      ស្កេនទូទាត់ប្រាក់តាម KHQR ងាយស្រួល និងសុវត្ថិភាពខ្ពស់
                    </p>
                  </div>

                  {/* Card Bottom Footer */}
                  <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{school.code || 'TYLC-2026'}</span>
                    <span className="font-bold text-red-600">Bakong KHQR</span>
                  </div>

                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 print:hidden">
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>ទាញយករូបភាព QR (PNG)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition flex items-center space-x-2 border border-white/10"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>បោះពុម្ពសន្លឹក QR</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyDetails}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-2xl text-xs font-semibold transition flex items-center space-x-2 border border-white/10"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copiedText ? 'បានចម្លងរួចរាល់!' : 'ចម្លងព័ត៌មានគណនី'}</span>
                </button>
              </div>

              {/* Automatic Propagation Notice */}
              <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-300 text-xs flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>មុខងារស្វ័យប្រវត្តិ (Auto-Synced to All Students):</strong> QR ទទួលប្រាក់នេះត្រូវបានភ្ជាប់ដោយស្វ័យប្រវត្តិទៅកាន់សិស្សទាំងអស់ {totalStudentsCount > 0 ? `(${totalStudentsCount} នាក់)` : ''} ក្នុងប្រព័ន្ធបណ្ណាល័យ វិក្កយបត្រ ថ្នាក់រៀន និងប្រព័ន្ធអាណាព្យាបាល។
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: UPLOAD & CHANGE PAYMENT QR */}
          {activeTab === 'CHANGE' && (
            <form onSubmit={handleSaveQRSettings} className="space-y-5">
              
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-300 flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-0.5">ប្តូរ QR ទទួលប្រាក់សាលា និងសិស្ស</h4>
                  <p className="text-[11px] text-slate-300">
                    នៅពេលអ្នកផ្ទុករូបភាព QR ថ្មី ឬកែប្រែឈ្មោះគណនី (ឧ. <strong>RIN SOPHEAK</strong>) ប្រព័ន្ធនឹងធ្វើបច្ចុប្បន្នភាព និងអនុវត្ត QR នេះទៅកាន់សិស្សទាំងអស់ដោយស្វ័យប្រវត្តិ។
                  </p>
                </div>
              </div>

              {/* Upload Drag & Drop Box */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white">
                  ផ្ទុករូបភាព QR ថ្មី (Upload QR Image)*
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
                    isDragging 
                      ? 'border-rose-500 bg-rose-500/10' 
                      : qrImageUrl 
                      ? 'border-emerald-500/50 bg-emerald-500/5' 
                      : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-rose-400'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  {qrImageUrl ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <img
                        src={qrImageUrl}
                        alt="Uploaded QR Preview"
                        className="w-28 h-28 object-contain rounded-2xl border border-white/20 bg-white p-1.5 shadow-lg"
                      />
                      <div className="text-left space-y-1">
                        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>រូបភាព QR ត្រូវបានផ្ទុកជោគជ័យ!</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          ចុចទីនេះដើម្បីជ្រើសរើសរូបភាពផ្សេង ឬអូសទម្លាក់រូបភាពថ្មី
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQrImageUrl('');
                          }}
                          className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline mt-1"
                        >
                          លុបរូបភាពចេញ (ប្រើ SVG Generator)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          ចុចទីនេះដើម្បីផ្ទុករូបភាព QR ពីកុំព្យូទ័រ/ទូរស័ព្ទ ឬអូសទម្លាក់រូបភាព
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          គាំទ្រឯកសាររូបភាព PNG, JPG, JPEG, WebP (Bakong KHQR, ABA, ACLEDA...)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Template Preset */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">គំរូទូទៅ:</span>
                <button
                  type="button"
                  onClick={handleUseRinSopheakDefault}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ប្រើគំរូដើម RIN SOPHEAK (Bakong KHQR ៛)</span>
                </button>
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    ឈ្មោះម្ចាស់គណនី (Account Name)*
                  </label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="ឧ. RIN SOPHEAK"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white font-mono font-bold outline-none focus:border-rose-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    ធនាគារ / ប្រភព QR (Bank/Provider)
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white font-battambang outline-none focus:border-rose-500"
                  >
                    <option value="Bakong KHQR">Bakong KHQR (គ្រប់ធនាគារ)</option>
                    <option value="ABA KHQR">ABA Bank KHQR</option>
                    <option value="ACLEDA KHQR">ACLEDA Bank KHQR</option>
                    <option value="Wing KHQR">Wing Bank KHQR</option>
                    <option value="Canadia KHQR">Canadia Bank KHQR</option>
                    <option value="Sathapana KHQR">Sathapana Bank KHQR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    លេខគណនី ឬ Bakong Account ID
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="ឧ. rinsopheak@bakong ឬ 012 889 900"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white font-mono outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    រូបិយប័ណ្ណបង្ហាញ (Currency)
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white font-battambang outline-none focus:border-rose-500"
                  >
                    <option value="KHR">ប្រាក់រៀល (KHR ៛) - ដូចក្នុងរូបភាព</option>
                    <option value="USD">ប្រាក់ដុល្លារ (USD $)</option>
                    <option value="BOTH">ទាំងពីរ (USD & KHR)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">
                    ការណែនាំ ឬចំណាំសម្រាប់អាណាព្យាបាល/សិស្ស
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="បញ្ជាក់ការទូទាត់..."
                    className="w-full px-3.5 py-2 bg-slate-950/80 rounded-xl border border-white/10 text-slate-200 font-battambang outline-none focus:border-rose-500 text-xs"
                  />
                </div>

              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('VIEW')}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition"
                >
                  បោះបង់
                </button>
                
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 hover:from-rose-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-rose-500/25 transition flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>រក្សាទុក & អនុវត្តទៅសិស្សទាំងអស់ (Save & Auto Sync)</span>
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-6 gap-2 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ប្រព័ន្ធទូទាត់ប្រាក់ KHQR ស្វ័យប្រវត្តិកម្ពុជា (National Payment Gateway)</span>
          </div>
          <div>
            <span>គណនីបច្ចុប្បន្ន: <strong className="text-white font-mono">{school.paymentQrAccountName || 'RIN SOPHEAK'}</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
