import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { 
  X, 
  Save, 
  User as UserIcon, 
  Mail, 
  Phone, 
  KeyRound, 
  Shield, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Image as ImageIcon, 
  Crown, 
  Check, 
  Trash2,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  Loader2,
  Camera
} from 'lucide-react';
import { roleLabels } from './Navbar';
import { compressAvatar } from '../utils/imageCompressor';

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  currentUser: User;
  onClose: () => void;
  onSaveUser: (updatedUser: User) => void;
  onDeleteUser?: (userId: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
];

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  currentUser,
  onClose,
  onSaveUser,
  onDeleteUser
}) => {
  // All hooks MUST be declared at the top of the component unconditionally
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isEditingSelf = Boolean(user && currentUser && currentUser.id === user.id);

  const [formData, setFormData] = useState<User>(() => user || currentUser);
  const [showPassword, setShowPassword] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
      setConfirmDelete(false);
    }
  }, [user, isOpen]);

  // Conditional return only AFTER hooks
  if (!isOpen || !user) return null;

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      password: res,
      passwordHint: `Auto-generated: ${res}`
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUser({
      ...formData,
      status: formData.status || 'ACTIVE'
    });
    onClose();
  };

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressingAvatar(true);
      try {
        const compressed = await compressAvatar(file, 256, 0.8);
        setFormData(prev => ({ ...prev, avatar: compressed }));
      } catch (err) {
        console.error('Error compressing avatar:', err);
      } finally {
        setIsCompressingAvatar(false);
      }
    }
  };

  const currentRoleMeta = roleLabels[formData.role] || roleLabels.ADMIN;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-inner">
              {formData.role === 'SUPER_ADMIN' ? (
                <Crown className="w-5 h-5 text-amber-400" />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-battambang flex items-center gap-2">
                <span>{isEditingSelf ? 'កែប្រែព័ត៌មានផ្ទាល់ខ្លួន (Edit My Profile)' : 'កែប្រែគណនីអ្នកប្រើប្រាស់ (Edit User Profile)'}</span>
                {isSuperAdmin && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                    Super Admin Control
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                ID: {formData.id} • {formData.email}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs font-battambang">
          
          {/* Avatar Preview & Picker */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={formData.avatar}
                alt={formData.nameKhmer}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-400 shadow-xl bg-slate-800"
              />
              {isCompressingAvatar ? (
                <div className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  <span className="text-[9px] mt-1 font-semibold">កំពុងបង្រួម...</span>
                </div>
              ) : (
                <label className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-[10px] text-white font-semibold gap-1">
                  <Camera className="w-4 h-4 text-indigo-300" />
                  <span>ប្តូររូបថត</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <span>រូបថតគណនី (Profile Picture):</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                    រក្សាទុកជាអចិន្ត្រៃយ៍
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setCustomAvatarInput(!customAvatarInput)}
                  className="text-[11px] text-indigo-300 hover:text-white transition underline"
                >
                  {customAvatarInput ? 'ជ្រើសរើសពីបញ្ជី' : 'បញ្ចូល Image URL'}
                </button>
              </div>

              {customAvatarInput ? (
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-950/80 rounded-xl border border-white/10 text-white font-mono text-[11px] outline-none focus:border-indigo-400"
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {AVATAR_PRESETS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: av })}
                        className={`relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                          formData.avatar === av ? 'border-indigo-400 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={av} alt="Preset" className="w-full h-full object-cover" />
                        {formData.avatar === av && (
                          <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Device upload button */}
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-[11px] text-indigo-200 cursor-pointer transition">
                    <Camera className="w-3.5 h-3.5 text-indigo-400" />
                    <span>ជ្រើសរើសរូបថតផ្ទាល់ខ្លួនពីទូរស័ព្ទ / ឧបករណ៍ (Upload Photo)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Khmer Name */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                ឈ្មោះពេញ (ភាសាខ្មែរ) *
              </label>
              <input
                type="text"
                required
                value={formData.nameKhmer}
                onChange={e => setFormData({ ...formData, nameKhmer: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white font-bold text-sm focus:border-indigo-400 outline-none"
              />
            </div>

            {/* English Name */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Full Name (English) *
              </label>
              <input
                type="text"
                required
                value={formData.nameEnglish}
                onChange={e => setFormData({ ...formData, nameEnglish: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white font-semibold text-sm focus:border-indigo-400 outline-none"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                ឈ្មោះគណនី (Username) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.username || ''}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-7 pr-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-200 font-mono text-xs focus:border-indigo-400 outline-none"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">@</span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                អ៊ីមែល (Email Address) *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-200 font-mono text-xs focus:border-indigo-400 outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                លេខទូរស័ព្ទ (Phone Number)
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="012 345 678"
                className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-200 font-mono text-xs focus:border-indigo-400 outline-none"
              />
            </div>

            {/* Role Select (Super Admin can change for all users) */}
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                <span>តួនាទីក្នុងប្រព័ន្ធ (User Role) *</span>
                {!isSuperAdmin && (
                  <span className="text-[10px] text-slate-400">(កែបានដោយ Super Admin ប៉ុណ្ណោះ)</span>
                )}
              </label>
              <select
                disabled={!isSuperAdmin && !isEditingSelf}
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3.5 py-2.5 bg-slate-950/90 rounded-xl border border-white/10 text-white font-semibold text-xs focus:border-indigo-400 outline-none disabled:opacity-60"
              >
                <option value="SUPER_ADMIN">អភិបាលជាន់ខ្ពស់ (Super Admin)</option>
                <option value="ADMIN">រដ្ឋបាលទូទៅ (School Admin)</option>
                <option value="DIRECTOR">នាយកសាលា (School Director)</option>
                <option value="TEACHER">គ្រូបង្រៀន (Teacher)</option>
                <option value="STUDENT">សិស្សានុសិស្ស (Student)</option>
                <option value="PARENT">អាណាព្យាបាល (Parent)</option>
                <option value="ACCOUNTANT">គណនេយ្យករ (Accountant)</option>
                <option value="LIBRARIAN">បណ្ណារក្ស (Librarian)</option>
                <option value="STAFF">បុគ្គលិកទូទៅ (Staff)</option>
              </select>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                ស្ថានភាពគណនី (Status) *
              </label>
              <select
                disabled={!isSuperAdmin}
                value={formData.status || 'ACTIVE'}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-slate-950/90 rounded-xl border border-white/10 text-white font-semibold text-xs focus:border-indigo-400 outline-none disabled:opacity-60"
              >
                <option value="ACTIVE">សកម្ម (Active - អាចប្រើប្រាស់បាន)</option>
                <option value="INACTIVE">អសកម្ម (Inactive)</option>
                <option value="SUSPENDED">ផ្អាកបណ្តោះអាសន្ន (Suspended)</option>
              </select>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">លេខសម្ងាត់ (Password)</label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] text-indigo-300 hover:text-white flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>បង្កើតលេខកូដថ្មី</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password || ''}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-100 font-mono text-xs focus:border-indigo-400 outline-none"
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

          {/* Password Hint / Security Note */}
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">ចំណាំជំនួយលេខសម្ងាត់ (Password Hint):</label>
            <input
              type="text"
              value={formData.passwordHint || ''}
              onChange={e => setFormData({ ...formData, passwordHint: e.target.value })}
              placeholder="ឧទាហរណ៍៖ លេខទូរស័ព្ទ ឬកូដសម្ងាត់ផ្ទាល់ខ្លួន"
              className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-300 text-xs focus:border-indigo-400 outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
            
            {/* Delete Account button (for Super Admin, when not deleting self) */}
            {isSuperAdmin && !isEditingSelf && onDeleteUser ? (
              confirmDelete ? (
                <div className="flex items-center space-x-2 bg-rose-950/60 p-2 rounded-xl border border-rose-500/40">
                  <span className="text-[11px] text-rose-300">តើចង់លុបពិតមែនទេ?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteUser(formData.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    បញ្ជាក់លុប
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 bg-white/10 text-slate-300 hover:text-white rounded-lg text-xs transition"
                  >
                    បោះបង់
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition text-xs font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>លុបគណនីនេះ</span>
                </button>
              )
            ) : <div />}

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition font-semibold"
              >
                បោះបង់ (Cancel)
              </button>

              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold shadow-lg shadow-indigo-500/30 transition"
              >
                <Save className="w-4 h-4" />
                <span>រក្សាទុកការកែប្រែ (Save Changes)</span>
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};
