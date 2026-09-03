import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  X, 
  UserPlus, 
  Shield, 
  Lock, 
  Mail, 
  Phone, 
  User as UserIcon, 
  GraduationCap, 
  Briefcase, 
  Calculator, 
  BookOpen, 
  UserCheck,
  Sparkles,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';

interface SignUpUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (newUser: User, autoLogin: boolean) => void;
}

const roleOptions: { role: UserRole; titleKh: string; titleEn: string; desc: string; icon: any; color: string }[] = [
  { role: 'SUPER_ADMIN', titleKh: 'អភិបាលជាន់ខ្ពស់ (Super Admin)', titleEn: 'Super Administrator', desc: 'សិទ្ធិអំណាចពេញលេញលើប្រព័ន្ធ និងគ្រប់គ្រងអ្នកប្រើប្រាស់', icon: Shield, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { role: 'ADMIN', titleKh: 'រដ្ឋបាលទូទៅ (School Admin)', titleEn: 'School Administrator', desc: 'គ្រប់គ្រងទិន្នន័យសាលា សិស្ស គ្រូ និងថ្នាក់រៀន', icon: Shield, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { role: 'DIRECTOR', titleKh: 'នាយកសាលា (Director)', titleEn: 'School Director', desc: 'ពិនិត្យរបាយការណ៍ ស្ថិតិ ហិរញ្ញវត្ថុ និងចុះហត្ថលេខា', icon: Briefcase, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { role: 'TEACHER', titleKh: 'លោកគ្រូ អ្នកគ្រូ (Teacher)', titleEn: 'Teacher / Instructor', desc: 'កត់ត្រាវត្តមាន ដាក់ពិន្ទុ កិច្ចការផ្ទះ និងកាលវិភាគ', icon: GraduationCap, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { role: 'STUDENT', titleKh: 'សិស្សានុសិស្ស (Student)', titleEn: 'Student', desc: 'មើលកាលវិភាគ វត្តមាន លទ្ធផលសិក្សា និងបណ្ណាល័យ', icon: UserIcon, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { role: 'PARENT', titleKh: 'អាណាព្យាបាល (Parent)', titleEn: 'Parent / Guardian', desc: 'តាមដានវត្តមាន ពិន្ទុ និងបង់ថ្លៃសិក្សារបស់កូន', icon: UserCheck, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { role: 'ACCOUNTANT', titleKh: 'គណនេយ្យករ/បេឡា (Accountant)', titleEn: 'Accountant / Cashier', desc: 'គ្រប់គ្រងវិក្កយបត្រ បង់ប្រាក់ ចំណូលចំណាយ និង KHQR', icon: Calculator, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  { role: 'LIBRARIAN', titleKh: 'បណ្ណារក្ស (Librarian)', titleEn: 'Librarian', desc: 'គ្រប់គ្រងបញ្ជីសៀវភៅ និងការខ្ចី-សងសៀវភៅ', icon: BookOpen, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { role: 'STAFF', titleKh: 'បុគ្គលិកទូទៅ (Staff)', titleEn: 'General Staff', desc: 'សេវាកម្មទូទៅ និងការងាររដ្ឋបាលគាំទ្រ', icon: UserIcon, color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' }
];

const presetAvatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
];

export const SignUpUserModal: React.FC<SignUpUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated
}) => {
  const [nameKhmer, setNameKhmer] = useState('');
  const [nameEnglish, setNameEnglish] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('TEACHER');
  const [selectedAvatar, setSelectedAvatar] = useState(presetAvatars[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameKhmer.trim() || !nameEnglish.trim() || !email.trim() || !username.trim() || !password.trim()) {
      setError('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់ (Please fill all required fields)');
      return;
    }

    const newUser: User = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      nameKhmer: nameKhmer.trim(),
      nameEnglish: nameEnglish.trim(),
      role: role,
      avatar: selectedAvatar,
      phone: phone.trim() || undefined,
      schoolId: 'SCH-KH-001',
      lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'ACTIVE'
    };

    onUserCreated(newUser, autoLogin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-inner">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-battambang flex items-center gap-2">
                <span>ចុះឈ្មោះគណនីថ្មី (Sign Up New Account)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Role Switcher
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                បង្កើតគណនីប្រើប្រាស់ថ្មីសម្រាប់ប្រព័ន្ធគ្រប់គ្រងសាលារៀន
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <span className="font-bold">⚠️</span> {error}
            </div>
          )}

          {/* Role Selection Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 font-battambang flex items-center justify-between">
              <span>ជ្រើសរើសតួនាទី (Select Role) *</span>
              <span className="text-[11px] text-indigo-400 font-normal">ជ្រើសរើសសិទ្ធិដែលត្រូវកំណត់</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {roleOptions.map(opt => {
                const isSelected = role === opt.role;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => setRole(opt.role)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-400 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-1.5 rounded-lg border ${opt.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white font-battambang leading-tight">{opt.titleKh.split(' (')[0]}</p>
                      <p className="text-[10px] text-slate-400">{opt.titleEn}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-battambang">
                ឈ្មោះជាភាសាខ្មែរ (Khmer Full Name) *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="ឧទាហរណ៍: លោក ស៊ន វណ្ណារ៉ា"
                  value={nameKhmer}
                  onChange={e => setNameKhmer(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ឈ្មោះជាភាសាអង់គ្លេស (English Full Name) *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sorn Vannara"
                  value={nameEnglish}
                  onChange={e => setNameEnglish(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* Credentials Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-battambang">
                ឈ្មោះគណនីចូល (Username) *
              </label>
              <div className="relative">
                <span className="text-slate-400 text-xs font-bold absolute left-3.5 top-1/2 -translate-y-1/2">@</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. superadmin / teacher_sopheap"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-battambang">
                លេខសម្ងាត់ (Password) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-battambang">
                អ៊ីមែល (Email) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="user@tayaek.edu.kh"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 font-battambang">
                លេខទូរស័ព្ទ (Phone Number)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="012 345 678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 font-battambang">
              ជ្រើសរើសរូបតំណាង (Choose Profile Avatar)
            </label>
            <div className="flex items-center space-x-2.5 overflow-x-auto pb-1">
              {presetAvatars.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(url)}
                  className={`relative w-11 h-11 rounded-2xl overflow-hidden border-2 transition flex-shrink-0 ${
                    selectedAvatar === url ? 'border-indigo-400 ring-2 ring-indigo-500/50 scale-105' : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                  {selectedAvatar === url && (
                    <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Login Checkbox */}
          <div className="flex items-center space-x-2.5 pt-1">
            <input
              type="checkbox"
              id="autoLoginCheckbox"
              checked={autoLogin}
              onChange={e => setAutoLogin(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="autoLoginCheckbox" className="text-xs text-slate-300 cursor-pointer font-battambang">
              ចូលប្រើដោយស្វ័យប្រវត្តិបន្ទាប់ពីបង្កើតរួច (Auto switch & sign in immediately)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
            >
              បោះបង់ (Cancel)
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center space-x-2 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>បង្កើតគណនីថ្មី (Create Account)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
