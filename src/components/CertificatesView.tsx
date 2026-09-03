import React, { useState, useRef } from 'react';
import { CertificateRecord, Student, SchoolProfile } from '../types';
import {
  Award,
  Plus,
  Printer,
  Search,
  Sparkles,
  User,
  Calendar,
  X,
  Eye,
  Upload,
  Image as ImageIcon,
  Sliders,
  CheckCircle2,
  FileCheck,
  Palette
} from 'lucide-react';
import { CertificateBackgroundModal, CERTIFICATE_PRESETS } from './CertificateBackgroundModal';

interface CertificatesViewProps {
  certificates: CertificateRecord[];
  students: Student[];
  school: SchoolProfile;
  onSaveSchool?: (school: SchoolProfile) => void;
  onSaveCertificate: (cert: CertificateRecord) => void;
  onOpenCertificateModal: (cert: CertificateRecord) => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  certificates,
  students,
  school,
  onSaveSchool,
  onSaveCertificate,
  onOpenCertificateModal
}) => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [bgModalOpen, setBgModalOpen] = useState(false);
  const quickUploadRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [form, setForm] = useState<{
    studentId: string;
    type: 'MERIT' | 'COMPLETION' | 'EXCELLENCE' | 'APPRECIATION';
    titleKhmer: string;
    descriptionKhmer: string;
    backgroundUrl?: string;
    borderStyle?: 'ORNATE_GOLD' | 'ROYAL_BLUE' | 'EMERALD' | 'PARCHMENT' | 'MINIMAL' | 'NONE';
  }>({
    studentId: students[0]?.id || '',
    type: 'MERIT',
    titleKhmer: 'ប័ណ្ណសរសើរ សិស្សពូកែប្រចាំឆ្នាំ',
    descriptionKhmer: 'បានខិតខំប្រឹងប្រែងរៀនសូត្រ គោរពវិន័យបានល្អប្រសើរ និងទទួលបានលទ្ធផលចំណាត់ថ្នាក់លេខ១ ប្រចាំឆ្នាំសិក្សា ២០២៥-២០២៦។',
    backgroundUrl: school.certificateBackgroundUrl || CERTIFICATE_PRESETS[0].url,
    borderStyle: school.certificateBorderStyle || 'ORNATE_GOLD'
  });

  const filtered = certificates.filter(c =>
    c.certNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.studentNameKhmer.toLowerCase().includes(search.toLowerCase()) ||
    c.titleKhmer.toLowerCase().includes(search.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleQuickUploadBg = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('សូមជ្រើសរើសឯកសារជារូបភាព (PNG, JPG, SVG, WebP)!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (onSaveSchool) {
        onSaveSchool({
          ...school,
          certificateBackgroundUrl: result,
          certificateBgOpacity: school.certificateBgOpacity !== undefined ? school.certificateBgOpacity : 0.95,
          certificateBorderStyle: school.certificateBorderStyle || 'ORNATE_GOLD',
          certificateTheme: 'CUSTOM'
        });
      }
      showToast('បានផ្ទុកឡើង Background វិញ្ញាបនបត្រថ្មីជោគជ័យ!');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBackgroundConfig = (bgData: {
    backgroundUrl: string;
    bgOpacity: number;
    borderStyle: 'ORNATE_GOLD' | 'ROYAL_BLUE' | 'EMERALD' | 'PARCHMENT' | 'MINIMAL' | 'NONE';
    theme: 'CLASSIC_GOLD' | 'ROYAL_BLUE' | 'EMERALD' | 'PARCHMENT' | 'CUSTOM';
    customLayout?: Record<string, any>;
  }) => {
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
    showToast('បានរក្សាទុកការកំណត់ Background & អត្ថបទវិញ្ញាបនបត្ររួចរាល់!');
  };

  const handleGenerateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === form.studentId);
    if (!st) return;

    const newCert: CertificateRecord = {
      id: `CERT-${Date.now()}`,
      certNumber: `SIS-CERT-2026-${String(certificates.length + 1).padStart(4, '0')}`,
      studentId: st.id,
      studentNameKhmer: st.nameKhmer,
      studentNameEnglish: st.nameEnglish,
      gender: st.gender,
      dob: st.dob,
      gradeLevel: st.className,
      academicYear: school.academicYear,
      type: form.type,
      titleKhmer: form.titleKhmer,
      descriptionKhmer: form.descriptionKhmer,
      issueDate: new Date().toISOString().split('T')[0],
      directorName: school.directorName || 'គណៈនាយក',
      backgroundUrl: form.backgroundUrl || school.certificateBackgroundUrl || CERTIFICATE_PRESETS[0].url,
      borderStyle: form.borderStyle || school.certificateBorderStyle || 'ORNATE_GOLD',
      bgOpacity: school.certificateBgOpacity !== undefined ? school.certificateBgOpacity : 0.95
    };

    onSaveCertificate(newCert);
    setModalOpen(false);
    onOpenCertificateModal(newCert);
  };

  const activeBackgroundPreview = school.certificateBackgroundUrl || CERTIFICATE_PRESETS[0].url;

  return (
    <div className="space-y-6">
      
      {/* Hidden file input for quick direct upload */}
      <input
        type="file"
        ref={quickUploadRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleQuickUploadBg(e.target.files[0]);
          }
        }}
      />

      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-5 rounded-3xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40 shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 font-battambang flex items-center gap-2.5">
              <span>វិញ្ញាបនបត្រ & លិខិត (Certificates & Letters)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans">
                {certificates.length} សន្លឹក
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-battambang mt-0.5">
              គ្រប់គ្រង បោះពុម្ព និងកំណត់ Background វិញ្ញាបនបត្រផ្លូវការសម្រាប់សិស្សានុសិស្ស
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 font-battambang">
          
          {/* Direct Upload Background Button */}
          <button
            type="button"
            id="btn-quick-upload-bg"
            onClick={() => quickUploadRef.current?.click()}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-2xl text-xs font-semibold transition border border-amber-500/40 shadow-sm"
            title="ផ្ទុកឡើងរូបភាព Background វិញ្ញាបនបត្រ (Upload Certificate Background)"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>ផ្ទុកឡើង Background</span>
          </button>

          {/* Background Manager & Template Selector */}
          <button
            type="button"
            id="btn-open-bg-manager"
            onClick={() => setBgModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 rounded-2xl text-xs font-semibold transition border border-amber-500/40"
            title="កំណត់ទម្រង់ & គំរូក្បាច់ Background (Template Manager)"
          >
            <Palette className="w-4 h-4 text-amber-400" />
            <span>ទម្រង់ Background</span>
          </button>

          {/* Issue New Certificate Button */}
          <button
            type="button"
            id="btn-issue-new-certificate"
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 rounded-2xl text-xs font-bold transition shadow-lg shadow-amber-500/20 border border-amber-300"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>ចេញប័ណ្ណសរសើរថ្មី</span>
          </button>

        </div>
      </div>

      {/* Active Certificate Background Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-4 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-11 rounded-xl border border-amber-500/50 overflow-hidden bg-slate-950 relative shrink-0 shadow-inner">
            <div
              className="w-full h-full bg-cover bg-center opacity-90"
              style={{ backgroundImage: `url("${activeBackgroundPreview}")` }}
            />
          </div>
          <div>
            <p className="font-bold text-amber-200 font-battambang flex items-center gap-1.5">
              <span>Background ស្តង់ដារបច្ចុប្បន្ន:</span>
              <span className="text-white font-normal">
                {school.certificateTheme === 'CUSTOM' ? 'រូបភាពផ្ទាល់ខ្លួន (Custom Uploaded)' : 'ក្បាច់មាសរាជប្រណិត (Royal Gold)'}
              </span>
            </p>
            <p className="text-[11px] text-slate-400">
              ស៊ុម: <span className="font-mono text-slate-300">{school.certificateBorderStyle || 'ORNATE_GOLD'}</span> | កម្រិតពន្លឺ: <span className="font-mono text-slate-300">{Math.round((school.certificateBgOpacity !== undefined ? school.certificateBgOpacity : 0.95) * 100)}%</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setBgModalOpen(true)}
          className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 rounded-xl text-xs font-semibold font-battambang transition border border-amber-500/30 self-start sm:self-auto"
        >
          ប្តូរ ឬកែតម្រូវ
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ស្វែងរកលេខកូដវិញ្ញាបនបត្រ ឬឈ្មោះសិស្ស..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 text-xs text-slate-800 rounded-xl border border-slate-200 focus:border-amber-500 focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Certificates Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(cert => {
          const certBg = cert.backgroundUrl || school.certificateBackgroundUrl || CERTIFICATE_PRESETS[0].url;
          return (
            <div
              key={cert.id}
              className="bg-[#fcfbf7] rounded-3xl border-2 border-amber-300/80 p-5 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 relative overflow-hidden group"
            >
              {/* Subtle background preview watermark */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none transition group-hover:opacity-25"
                style={{ backgroundImage: `url("${certBg}")` }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300/60">
                    {cert.certNumber}
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full">
                    {cert.academicYear}
                  </span>
                </div>

                <div className="mt-3 flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 font-battambang text-base leading-tight">
                    {cert.titleKhmer}
                  </h3>
                </div>

                <div className="mt-3 p-3 bg-white/90 rounded-2xl border border-amber-200/80 space-y-1 text-xs backdrop-blur-xs">
                  <p className="text-slate-500 text-[11px]">ប្រគល់ជូនសិស្ស:</p>
                  <p className="font-bold text-slate-900 font-battambang text-sm">{cert.studentNameKhmer} ({cert.studentNameEnglish})</p>
                  <p className="text-slate-600 text-[11px]">ថ្នាក់: <strong>{cert.gradeLevel}</strong> | ថ្ងៃកំណើត: {cert.dob}</p>
                </div>

                <p className="text-xs text-slate-700 font-kantumruy mt-3 line-clamp-2 leading-relaxed">
                  {cert.descriptionKhmer}
                </p>
              </div>

              <div className="pt-3 border-t border-amber-200/80 flex items-center justify-between relative z-10">
                <span className="text-[10px] text-slate-500 font-mono">ថ្ងៃចេញ: {cert.issueDate}</span>
                <button
                  type="button"
                  onClick={() => onOpenCertificateModal(cert)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-semibold transition shadow-sm font-battambang"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>មើល & បោះពុម្ព</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Generate Certificate Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 font-battambang text-base">ចេញប័ណ្ណសរសើរ / វិញ្ញាបនបត្រថ្មី</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateCertificate} className="p-6 space-y-4 text-xs font-battambang">
              <div>
                <label className="block text-slate-700 font-bold mb-1">ជ្រើសរើសសិស្ស (Select Student)*</label>
                <select
                  value={form.studentId}
                  onChange={e => setForm({ ...form, studentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold focus:border-amber-500 outline-none"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.nameKhmer} ({s.studentCode}) - ថ្នាក់ {s.className}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ប្រភេទប័ណ្ណ / វិញ្ញាបនបត្រ</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 font-semibold focus:border-amber-500 outline-none"
                >
                  <option value="MERIT">ប័ណ្ណសរសើរ (Certificate of Merit)</option>
                  <option value="EXCELLENCE">សិស្សឆ្នើម (Certificate of Excellence)</option>
                  <option value="COMPLETION">វិញ្ញាបនបត្របញ្ចប់ការសិក្សា (Certificate of Completion)</option>
                  <option value="APPRECIATION">លិខិតថ្លែងអំណរគុណ (Certificate of Appreciation)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ចំណងជើងប័ណ្ណសរសើរ*</label>
                <input
                  type="text"
                  required
                  value={form.titleKhmer}
                  onChange={e => setForm({ ...form, titleKhmer: e.target.value })}
                  placeholder="ឧ. ប័ណ្ណសរសើរ សិស្សពូកែប្រចាំឆ្នាំ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">ខ្លឹមសារសរសើរ (Description)*</label>
                <textarea
                  rows={3}
                  required
                  value={form.descriptionKhmer}
                  onChange={e => setForm({ ...form, descriptionKhmer: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 font-kantumruy focus:border-amber-500 outline-none"
                />
              </div>

              {/* Background Preset Selection */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Background សម្រាប់ប័ណ្ណនេះ:</label>
                <select
                  value={form.backgroundUrl}
                  onChange={e => setForm({ ...form, backgroundUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-amber-500 outline-none"
                >
                  <option value={school.certificateBackgroundUrl || CERTIFICATE_PRESETS[0].url}>
                    តាមការកំណត់សាលាស្តង់ដារ ({school.certificateTheme === 'CUSTOM' ? 'រូបភាពផ្ទាល់ខ្លួន' : 'ក្បាច់មាសរាជ'})
                  </option>
                  {CERTIFICATE_PRESETS.map(p => (
                    <option key={p.id} value={p.url}>
                      {p.nameKhmer}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20"
                >
                  បង្កើត & បើកបោះពុម្ព
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Certificate Background Customizer Modal */}
      {bgModalOpen && (
        <CertificateBackgroundModal
          isOpen={bgModalOpen}
          school={school}
          onClose={() => setBgModalOpen(false)}
          onSaveBackground={handleSaveBackgroundConfig}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-5 py-3.5 bg-slate-900 border border-amber-500/40 text-white rounded-2xl shadow-2xl shadow-amber-950/60 backdrop-blur-xl animate-in slide-in-from-bottom-5 font-battambang">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-300">{toastMessage}</p>
            <p className="text-[11px] text-slate-300">Background វិញ្ញាបនបត្រត្រូវបានធ្វើបច្ចុប្បន្នភាព</p>
          </div>
        </div>
      )}

    </div>
  );
};
