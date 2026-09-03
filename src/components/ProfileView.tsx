import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  ShieldCheck, 
  KeyRound, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  UserCheck, 
  Calendar,
  Sparkles,
  Camera,
  Loader2,
  Check,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { hashPassword, evaluatePasswordStrength } from '../utils/security';
import { User } from '../types';
import { compressAvatar } from '../utils/imageCompressor';

interface ProfileViewProps {
  currentUser: User;
  onUpdateUser: (updated: User) => void;
}

const PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
];

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onUpdateUser }) => {
  const [nameKhmer, setNameKhmer] = useState(currentUser.nameKhmer || '');
  const [nameEnglish, setNameEnglish] = useState(currentUser.nameEnglish || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const passwordStrength = evaluatePasswordStrength(newPassword);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressingPhoto(true);
      try {
        const compressed = await compressAvatar(file, 256, 0.8);
        setAvatar(compressed);
        setProfileMsg('បានជ្រើសរើសរូបថតថ្មី! សូមចុច "រក្សាទុកព័ត៌មាន (Save Changes)" ដើម្បីរក្សាទុកជាអចិន្ត្រៃយ៍។');
      } catch (err) {
        console.error('Error compressing photo:', err);
      } finally {
        setIsCompressingPhoto(false);
      }
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    const updatedUser: User = {
      ...currentUser,
      nameKhmer,
      nameEnglish,
      username,
      email,
      phone,
      avatar
    };

    StorageService.saveUser(updatedUser);
    onUpdateUser(updatedUser);
    setProfileMsg('បានរក្សាទុកព័ត៌មាន និងរូបថតគណនីជាអចិន្ត្រៃយ៍ដោយជោគជ័យ! (Saved forever with account)');
    setTimeout(() => setProfileMsg(null), 4000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: 'error', text: 'សូមបំពេញព័ត៌មានពាក្យសម្ងាត់ឱ្យបានពេញលេញ' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៦ តួអក្សរ' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'ពាក្យសម្ងាត់ថ្មី និងការបញ្ជាក់មិនត្រូវគ្នាទេ' });
      return;
    }

    const hashedCurrent = await hashPassword(currentPassword);
    const isCurrentMatch = currentUser.password === currentPassword || currentUser.password === hashedCurrent;

    if (!isCurrentMatch) {
      setPasswordMsg({ type: 'error', text: 'ពាក្យសម្ងាត់បច្ចុប្បន្នមិនត្រឹមត្រូវទេ' });
      return;
    }

    const hashedNew = await hashPassword(newPassword);
    const updatedUser: User = {
      ...currentUser,
      password: hashedNew
    };

    StorageService.saveUser(updatedUser);
    onUpdateUser(updatedUser);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMsg({ type: 'success', text: 'បានប្តូរពាក្យសម្ងាត់ថ្មីដោយជោគជ័យ!' });
    setTimeout(() => setPasswordMsg(null), 3500);
  };

  const avatarSeeds = ['Felix', 'Aneka', 'Mittens', 'Callie', 'Pepper', 'Simba', 'Caleb', 'Milo'];

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-['Battambang',sans-serif]">
      {/* Profile Header */}
      <div className="bg-slate-900/70 border border-slate-800 backdrop-blur-xl p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-5">
        <div className="relative group">
          <img
            src={avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`}
            alt={nameKhmer}
            className="w-24 h-24 rounded-2xl border-2 border-indigo-500/40 bg-slate-950 object-cover shadow-lg"
          />
          {isCompressingPhoto ? (
            <div className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center text-white">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span className="text-[9px] mt-1 font-semibold">កំពុងបង្រួម...</span>
            </div>
          ) : (
            <label className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-[10px] text-white font-semibold gap-1">
              <Camera className="w-5 h-5 text-indigo-300" />
              <span>ប្តូររូបថត</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
          <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-slate-900 shadow" title="រក្សាទុកជាអចិន្ត្រៃយ៍">
            <Check className="w-3 h-3" />
          </span>
        </div>
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl font-bold text-white font-['Kantumruy_Pro',sans-serif]">{nameKhmer}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              {currentUser.role}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
              ✓ រក្សាទុករូបថតជាអចិន្ត្រៃយ៍
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{nameEnglish} • @{username}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              {email}
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ID: {currentUser.id}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              ចូលចុងក្រោយ: {currentUser.lastLogin || 'ថ្មីៗ'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <UserIcon className="w-5 h-5 text-indigo-400" />
            <span>ព័ត៌មានគណនីផ្ទាល់ខ្លួន (Account Details)</span>
          </h2>

          {profileMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{profileMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div>
              <label className="block text-xs text-slate-300 mb-1">ឈ្មោះជាភាសាខ្មែរ (Name Khmer) *</label>
              <input
                type="text"
                value={nameKhmer}
                onChange={(e) => setNameKhmer(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">ឈ្មោះជាភាសាអង់គ្លេស (Name English)</label>
              <input
                type="text"
                value={nameEnglish}
                onChange={(e) => setNameEnglish(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">ឈ្មោះគណនី (Username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">លេខទូរស័ព្ទ (Phone)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">អ៊ីមែល (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Avatar & Photo Picker */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  <span>ប្តូររូបថតគណនី (Profile Photo)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    {showCustomUrlInput ? 'ជ្រើសរើសរូបភាព' : 'បញ្ចូល Image URL'}
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${username || 'user'}`)}
                      className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                      title="កំណត់រូបឡើងវិញ"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>កំណត់ឡើងវិញ</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Upload from device button */}
              <label className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-xs text-indigo-200 font-medium cursor-pointer transition">
                {isCompressingPhoto ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>កំពុងដំណើរការ និងបង្រួមរូបថត...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-indigo-400" />
                    <span>ជ្រើសរើសរូបថតពីទូរស័ព្ទ / ឧបករណ៍ (Upload from Device / Camera)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={isCompressingPhoto}
                  className="hidden"
                />
              </label>

              {showCustomUrlInput ? (
                <div className="space-y-1">
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500">បញ្ចូលតំណភ្ជាប់រូបភាពពីអ៊ីនធឺណិត (Image URL)</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Realistic Photo Presets */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1.5">រូបថតគំរូ (Real Photo Presets):</span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {PHOTO_PRESETS.map((photoUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(photoUrl)}
                          className={`relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                            avatar === photoUrl ? 'border-indigo-400 scale-105 shadow-md shadow-indigo-500/30' : 'border-slate-800 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={photoUrl} alt="Preset" className="w-full h-full object-cover" />
                          {avatar === photoUrl && (
                            <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottts Avatar Presets */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1.5">រូបគំនូរតំណាង (Vector Avatar Presets):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {avatarSeeds.map((seed) => {
                        const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                        return (
                          <button
                            key={seed}
                            type="button"
                            onClick={() => setAvatar(url)}
                            className={`p-1 rounded-lg border transition-all ${
                              avatar === url ? 'border-indigo-500 bg-indigo-950/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                            }`}
                          >
                            <img src={url} alt={seed} className="w-7 h-7 rounded-md" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>រូបថតដែលអ្នកជ្រើសរើសនឹងត្រូវរក្សាទុកជាអចិន្ត្រៃយ៍ជាមួយគណនីរបស់អ្នកជារៀងរហូត។</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>រក្សាទុកព័ត៌មាន (Save Changes)</span>
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Lock className="w-5 h-5 text-indigo-400" />
            <span>ផ្លាស់ប្តូរពាក្យសម្ងាត់ (Change Password)</span>
          </h2>

          {passwordMsg && (
            <div className={`p-3 border rounded-xl text-xs flex items-center gap-2 ${
              passwordMsg.type === 'success' 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}>
              {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs text-slate-300 mb-1">ពាក្យសម្ងាត់បច្ចុប្បន្ន (Current Password) *</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">ពាក្យសម្ងាត់ថ្មី (New Password) *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី (Confirm New Password) *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {newPassword && (
              <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">កម្រិតសុវត្ថិភាព:</span>
                  <span className={`font-semibold ${passwordStrength.color.split(' ')[0]}`}>
                    {passwordStrength.labelKhmer}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1.5">
                  <div className={`rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color.split(' ')[1] : 'bg-slate-700'}`} />
                  <div className={`rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color.split(' ')[1] : 'bg-slate-700'}`} />
                  <div className={`rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color.split(' ')[1] : 'bg-slate-700'}`} />
                  <div className={`rounded-full ${passwordStrength.score >= 4 ? passwordStrength.color.split(' ')[1] : 'bg-slate-700'}`} />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>ប្តូរពាក្យសម្ងាត់ថ្មី (Update Password)</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
