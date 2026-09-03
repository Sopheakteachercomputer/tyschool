import React, { useRef, useState } from 'react';
import { CertificateRecord, SchoolProfile } from '../types';
import { CertificateBackgroundModal, CERTIFICATE_PRESETS, CertTextItem } from './CertificateBackgroundModal';
import { 
  Printer, 
  X, 
  Sparkles, 
  Award, 
  QrCode, 
  Download, 
  Share2, 
  Check, 
  Upload, 
  Sliders, 
  Image as ImageIcon,
  Type,
  Move,
  Wand2,
  Edit3
} from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  certificate: CertificateRecord;
  school: SchoolProfile;
  onClose: () => void;
  onSaveSchool?: (school: SchoolProfile) => void;
  onSaveCertificate?: (cert: CertificateRecord) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  certificate,
  school,
  onClose,
  onSaveSchool,
  onSaveCertificate
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);

  // Background and Layout customizer states
  const [currentBgUrl, setCurrentBgUrl] = useState<string>(
    certificate.backgroundUrl || school.certificateBackgroundUrl || CERTIFICATE_PRESETS[0].url
  );
  const [bgOpacity, setBgOpacity] = useState<number>(
    certificate.bgOpacity !== undefined ? certificate.bgOpacity : (school.certificateBgOpacity !== undefined ? school.certificateBgOpacity : 0.95)
  );
  const [borderStyle, setBorderStyle] = useState<'ORNATE_GOLD' | 'ROYAL_BLUE' | 'EMERALD' | 'PARCHMENT' | 'MINIMAL' | 'NONE'>(
    certificate.borderStyle || school.certificateBorderStyle || 'ORNATE_GOLD'
  );
  const [hideDefaultBorder, setHideDefaultBorder] = useState<boolean>(
    certificate.hideDefaultBorders !== undefined ? certificate.hideDefaultBorders : (borderStyle === 'NONE')
  );

  // Active custom layout overrides
  const [customLayout, setCustomLayout] = useState<Record<string, Partial<CertTextItem>>>(
    (certificate.customLayout || school.certificateCustomLayout || {}) as Record<string, Partial<CertTextItem>>
  );

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getGenderKhmer = (gender: any) => {
    return gender === 'FEMALE' || gender === 'F' ? 'ស្រី' : 'ប្រុស';
  };

  const handleQuickUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('សូមជ្រើសរើសឯកសារជារូបភាព (PNG, JPG, SVG, WebP)!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCurrentBgUrl(result);
      if (onSaveSchool) {
        onSaveSchool({
          ...school,
          certificateBackgroundUrl: result,
          certificateTheme: 'CUSTOM'
        });
      }
      if (onSaveCertificate) {
        onSaveCertificate({
          ...certificate,
          backgroundUrl: result
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyBackgroundData = (bgData: {
    backgroundUrl: string;
    bgOpacity: number;
    borderStyle: 'ORNATE_GOLD' | 'ROYAL_BLUE' | 'EMERALD' | 'PARCHMENT' | 'MINIMAL' | 'NONE';
    theme: 'CLASSIC_GOLD' | 'ROYAL_BLUE' | 'EMERALD' | 'PARCHMENT' | 'CUSTOM';
    customLayout?: Record<string, any>;
  }) => {
    setCurrentBgUrl(bgData.backgroundUrl);
    setBgOpacity(bgData.bgOpacity);
    setBorderStyle(bgData.borderStyle);
    setHideDefaultBorder(bgData.borderStyle === 'NONE');
    if (bgData.customLayout) {
      setCustomLayout(bgData.customLayout);
    }

    if (onSaveSchool) {
      onSaveSchool({
        ...school,
        certificateBackgroundUrl: bgData.backgroundUrl,
        certificateBgOpacity: bgData.bgOpacity,
        certificateBorderStyle: bgData.borderStyle,
        certificateTheme: bgData.theme,
        certificateCustomLayout: bgData.customLayout
      });
    }

    if (onSaveCertificate) {
      onSaveCertificate({
        ...certificate,
        backgroundUrl: bgData.backgroundUrl,
        bgOpacity: bgData.bgOpacity,
        borderStyle: bgData.borderStyle,
        hideDefaultBorders: bgData.borderStyle === 'NONE',
        customLayout: bgData.customLayout
      });
    }
  };

  // Helper to resolve inline styling based on customLayout
  const getElementStyle = (key: string, baseStyle: React.CSSProperties = {}) => {
    const item = customLayout[key];
    if (!item) return baseStyle;

    const fontFamilyMap: Record<string, string> = {
      battambang: "'Battambang', system-ui, sans-serif",
      kantumruy: "'Kantumruy Pro', system-ui, sans-serif",
      moul: "'Moul', 'Battambang', serif",
      sans: "system-ui, -apple-system, sans-serif",
      serif: "Georgia, Cambria, 'Times New Roman', serif"
    };

    return {
      ...baseStyle,
      transform: `translate(${item.offsetX || 0}px, ${item.offsetY || 0}px) rotate(${item.rotation || 0}deg) scale(${item.fontSizeScale || 1})`,
      transformOrigin: item.textAlign === 'left' ? 'left center' : item.textAlign === 'right' ? 'right center' : 'center center',
      color: item.color || baseStyle.color,
      fontFamily: item.fontFamily ? fontFamilyMap[item.fontFamily] : baseStyle.fontFamily,
      fontWeight: item.fontWeight === 'extrabold' ? 900 : item.fontWeight === 'bold' ? 700 : item.fontWeight === 'semibold' ? 600 : (baseStyle.fontWeight || 400),
      fontStyle: item.fontStyle || baseStyle.fontStyle,
      textDecoration: item.textDecoration === 'underline' ? 'underline' : (baseStyle.textDecoration || 'none'),
      letterSpacing: item.letterSpacing !== undefined ? `${item.letterSpacing}px` : baseStyle.letterSpacing,
      textAlign: item.textAlign || baseStyle.textAlign,
      textTransform: item.textTransform || baseStyle.textTransform
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      
      {/* Hidden file input for instant background upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleQuickUpload(e.target.files[0]);
          }
        }}
      />

      <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden border border-amber-500/30 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Actions bar (hidden in print) */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-amber-500/20 bg-slate-950 text-white gap-3 no-print">
          
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm font-battambang flex items-center gap-2">
                <span>វិញ្ញាបនបត្រ & ប័ណ្ណសរសើរផ្លូវការ</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  {certificate.certNumber}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">Official Certificate with Custom Background & Typography</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 font-battambang text-xs">
            
            {/* BUTTON 1: Edit Text (Requested Button) */}
            <button
              type="button"
              id="btn-modal-edit-text"
              onClick={() => setIsBgModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-900/60 to-blue-900/60 hover:from-cyan-800 hover:to-blue-800 text-cyan-200 rounded-xl font-bold transition border border-cyan-500/40 shadow-xs cursor-pointer"
              title="កែសម្រួលខ្លឹមសារអត្ថបទវិញ្ញាបនបត្រ (Edit Text)"
            >
              <Type className="w-3.5 h-3.5 text-cyan-400" />
              <span>Edit text (កែអត្ថបទ)</span>
            </button>

            {/* BUTTON 2: Move Text (Requested Button) */}
            <button
              type="button"
              id="btn-modal-move-text"
              onClick={() => setIsBgModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-900/60 to-teal-900/60 hover:from-emerald-800 hover:to-teal-800 text-emerald-200 rounded-xl font-bold transition border border-emerald-500/40 shadow-xs cursor-pointer"
              title="ផ្លាស់ទីទីតាំងអត្ថបទលើវិញ្ញាបនបត្រ (Move Text)"
            >
              <Move className="w-3.5 h-3.5 text-emerald-400" />
              <span>Move text (ផ្លាស់ទី)</span>
            </button>

            {/* BUTTON 3: Transform Text (Requested Button) */}
            <button
              type="button"
              id="btn-modal-transform-text"
              onClick={() => setIsBgModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-800 hover:to-pink-800 text-purple-200 rounded-xl font-bold transition border border-purple-500/40 shadow-xs cursor-pointer"
              title="បម្លែងទម្រង់អក្សរ ទំហំ ពណ៌ និងពុម្ពអក្សរ (Transform Text)"
            >
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Transform text (បម្លែង)</span>
            </button>

            {/* Background Studio & Presets */}
            <button
              type="button"
              id="btn-modal-customize-cert-bg"
              onClick={() => setIsBgModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl font-medium transition border border-amber-500/40 cursor-pointer"
              title="ជ្រើសរើសគំរូក្បាច់ ឬផ្ទុកឡើង Background (Background Studio)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Background & ស៊ុម</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              id="btn-print-certificate"
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-extrabold rounded-xl transition shadow-md shadow-amber-500/20 border border-amber-300 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>បោះពុម្ព (Print)</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Certificate Printable Canvas Container */}
        <div className="p-4 sm:p-8 print:p-0 flex justify-center bg-slate-950/60 print:bg-white overflow-x-auto">
          
          <div
            id="certificate-print-area"
            className="w-full max-w-[880px] min-h-[620px] p-6 sm:p-10 rounded-2xl relative flex flex-col justify-between text-center shadow-2xl print:shadow-none print:w-full print:max-w-none print:rounded-none overflow-hidden"
            style={{
              backgroundColor: '#fcfbf7',
              border: hideDefaultBorder ? 'none' : '10px double #b45309',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }}
          >
            
            {/* Background Graphic Layer */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none transition-all duration-300"
              style={{
                backgroundImage: `url("${currentBgUrl}")`,
                opacity: bgOpacity,
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }}
            />

            {/* Decorative Corner Borders if not hidden */}
            {!hideDefaultBorder && (
              <>
                <div className="absolute inset-3 border border-amber-600/40 pointer-events-none" />
                <div className="absolute top-4 left-4 w-9 h-9 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
                <div className="absolute top-4 right-4 w-9 h-9 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-9 h-9 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-9 h-9 border-b-2 border-r-2 border-amber-600 pointer-events-none" />
              </>
            )}

            {/* Top Kingdom Header */}
            <div className="relative z-10">
              <h2 
                className="text-xl sm:text-2xl font-bold font-battambang text-amber-950 tracking-wider transition-transform duration-150 inline-block"
                style={getElementStyle('kingdom_header')}
              >
                {customLayout.kingdom_header?.text || 'ព្រះរាជាណាចក្រកម្ពុជា'}
              </h2>
              <h3 
                className="text-xs sm:text-sm font-bold font-battambang text-amber-900 tracking-widest mt-0.5 transition-transform duration-150"
                style={getElementStyle('kingdom_motto')}
              >
                {customLayout.kingdom_motto?.text || 'ជាតិ សាសនា ព្រះមហាក្សត្រ'}
              </h3>
              <div className="w-24 sm:w-32 h-0.5 bg-amber-600 mx-auto my-2 opacity-70" />
              
              <div className="flex items-center justify-between px-4 sm:px-8 mt-3">
                <div 
                  className="text-left font-battambang transition-transform duration-150"
                  style={getElementStyle('ministry_school')}
                >
                  <p className="text-[11px] sm:text-xs font-bold text-slate-800">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                  <p className="text-xs sm:text-sm font-bold text-amber-950">{school.nameKhmer}</p>
                </div>
                <img
                  src={school.logo}
                  alt="Logo"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-amber-500 shadow-md bg-white"
                />
                <div 
                  className="text-right text-[11px] sm:text-xs text-slate-600 font-sans transition-transform duration-150"
                  style={getElementStyle('cert_code')}
                >
                  <p>លេខ: <span className="font-mono font-bold text-slate-900">{certificate.certNumber}</span></p>
                  <p>ឆ្នាំសិក្សា: <span className="font-semibold text-slate-800">{certificate.academicYear}</span></p>
                </div>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="my-5 sm:my-7 relative z-10">
              <div 
                className="inline-flex items-center justify-center space-x-2 sm:space-x-3 transition-transform duration-150"
                style={getElementStyle('cert_title')}
              >
                <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-amber-600" />
                <h1 className="text-2xl sm:text-4xl font-extrabold text-amber-950 font-battambang px-4 sm:px-6 py-1 border-b-2 border-amber-600">
                  {certificate.titleKhmer}
                </h1>
                <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-amber-600" />
              </div>
              <p 
                className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-800 font-bold mt-1.5 font-sans transition-transform duration-150"
                style={getElementStyle('cert_subtitle')}
              >
                {customLayout.cert_subtitle?.text || 'CERTIFICATE OF HONOR & EXCELLENCE'}
              </p>
            </div>

            {/* Body Description */}
            <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4 text-slate-900 relative z-10 leading-relaxed font-sans px-2">
              <p 
                className="text-sm sm:text-base font-kantumruy transition-transform duration-150"
                style={getElementStyle('recipient_intro')}
              >
                {customLayout.recipient_intro?.text || `គណៈនាយកនៃ ${school.nameKhmer} សូមបញ្ជាក់ និងប្រគល់ជូនដល់៖`}
              </p>

              <div className="py-1 sm:py-2">
                <h2 
                  className="text-2xl sm:text-3xl font-bold font-battambang text-slate-950 underline decoration-amber-500 underline-offset-8 transition-transform duration-150 inline-block"
                  style={getElementStyle('recipient_name')}
                >
                  {certificate.studentNameKhmer} ({certificate.studentNameEnglish})
                </h2>
                <p 
                  className="text-xs sm:text-sm text-slate-700 mt-2 font-battambang transition-transform duration-150"
                  style={getElementStyle('recipient_meta')}
                >
                  ភេទ: <strong>{getGenderKhmer(certificate.gender)}</strong> | កាលបរិច្ឆេទកំណើត: <strong>{certificate.dob}</strong> | ថ្នាក់រៀន: <strong>{certificate.gradeLevel}</strong>
                </p>
              </div>

              <p 
                className="text-xs sm:text-sm font-kantumruy text-slate-800 px-4 leading-relaxed font-medium transition-transform duration-150"
                style={getElementStyle('cert_description')}
              >
                {certificate.descriptionKhmer}
              </p>
            </div>

            {/* Bottom Footer: Signatures, Seal & Verification QR */}
            <div className="grid grid-cols-3 items-end pt-6 sm:pt-8 pb-1 px-4 sm:px-8 relative z-10 text-xs">
              
              {/* QR Verification */}
              <div className="text-center">
                <div className="inline-block p-1.5 bg-white border border-amber-300 rounded-xl shadow-xs mb-1">
                  <QrCode className="w-12 h-12 sm:w-14 sm:h-14 text-slate-900" />
                </div>
                <p className="text-[9px] text-slate-600 font-mono font-bold">VERIFY CODE</p>
                <p className="text-[8px] text-slate-500 font-mono">{certificate.certNumber}</p>
              </div>

              {/* Official Gold Seal Badge */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 p-0.5 shadow-lg flex items-center justify-center text-amber-950">
                  <div className="w-full h-full rounded-full border-2 border-amber-800/60 flex flex-col items-center justify-center bg-gradient-to-b from-yellow-300 to-amber-500">
                    <Award className="w-7 h-7 sm:w-9 sm:h-9 text-amber-950 drop-shadow-xs" />
                    <span className="text-[7px] font-extrabold uppercase tracking-wider text-amber-950">OFFICIAL SEAL</span>
                  </div>
                </div>
              </div>

              {/* Director Signature & Stamp */}
              <div className="text-right">
                <p 
                  className="text-slate-700 mb-1 font-kantumruy text-[11px] transition-transform duration-150"
                  style={getElementStyle('cert_date')}
                >
                  រាជធានីភ្នំពេញ, ថ្ងៃទី {certificate.issueDate}
                </p>
                <p 
                  className="font-bold text-slate-950 font-battambang text-xs sm:text-sm mb-6 transition-transform duration-150"
                  style={getElementStyle('director_title')}
                >
                  {customLayout.director_title?.text || 'នាយកវិទ្យាល័យ'}
                </p>
                <p 
                  className="font-bold text-amber-950 font-battambang border-t border-slate-500 pt-1 inline-block min-w-[140px] text-xs sm:text-sm transition-transform duration-150"
                  style={getElementStyle('director_name')}
                >
                  {certificate.directorName || school.directorName}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Background & Typography Studio Modal */}
      {isBgModalOpen && (
        <CertificateBackgroundModal
          isOpen={isBgModalOpen}
          school={school}
          onClose={() => setIsBgModalOpen(false)}
          onSaveBackground={handleApplyBackgroundData}
        />
      )}

    </div>
  );
};
