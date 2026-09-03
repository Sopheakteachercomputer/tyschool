import React, { useState } from 'react';
import { Teacher, ClassRoom, Subject, SchoolProfile } from '../types';
import { isFemaleGender, isMaleGender, formatGender, getGenderKhmer } from '../utils/formatters';
import { 
  Plus, 
  Search, 
  GraduationCap, 
  BookOpen, 
  Phone, 
  Mail, 
  Building, 
  Edit3, 
  Trash2, 
  Calendar,
  X,
  UserCheck,
  Sparkles,
  LayoutGrid,
  List,
  Printer,
  Eye,
  CheckCircle2,
  Users,
  Award,
  Filter,
  Check,
  ShieldAlert,
  ChevronRight,
  Briefcase
} from 'lucide-react';

interface TeachersViewProps {
  teachers?: Teacher[];
  classes?: ClassRoom[];
  subjects?: Subject[];
  school?: SchoolProfile;
  onSaveTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  searchTerm?: string;
  userRole?: string;
}

export const TeachersView: React.FC<TeachersViewProps> = ({
  teachers = [],
  classes = [],
  subjects = [],
  school = {
    id: 'SCH-001',
    nameKhmer: 'មណ្ឌលតាយ៉ែក',
    nameEnglish: 'Ta Yaek Learning Center',
    code: 'TYLC-2026',
    principalKhmer: 'ឯកឧត្តមបណ្ឌិត ស៊ន វណ្ណារ៉ា',
    principalEnglish: 'H.E. Dr. Sorn Vannara',
    academicYear: '2025-2026',
    currentSemester: 'ឆមាសទី១ (Semester 1)',
    address: 'ភូមិតាយ៉ែក ឃុំតាយ៉ែក ស្រុកសូទ្រនិគម ខេត្តសៀមរាប',
    province: 'ខេត្តសៀមរាប',
    district: 'ស្រុកសូទ្រនិគម',
    commune: 'ឃុំតាយ៉ែក',
    phone: '023 218 899 / 012 889 900',
    email: 'info@tayaek.edu.kh',
    website: 'https://tayaek.edu.kh',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlbk_1TFY_Nc7BotKu8JxYNI4ApQpVLkkjfE7-aTvDsw&s',
    currency: 'USD',
    exchangeRate: 4100
  },
  onSaveTeacher,
  onDeleteTeacher,
  searchTerm: globalSearch = '',
  userRole = 'SUPER_ADMIN'
}) => {
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const [localSearch, setLocalSearch] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalTeacher, setDetailModalTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [printRosterOpen, setPrintRosterOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Teacher>>({
    nameKhmer: '',
    nameEnglish: '',
    gender: 'MALE',
    dob: '1988-01-01',
    phone: '',
    email: '',
    address: 'រាជធានីភ្នំពេញ',
    qualification: 'បរិញ្ញាបត្រអប់រំ (Bachelor of Education)',
    specialization: 'គណិតវិទ្យា',
    position: 'គ្រូបង្រៀនពេញម៉ោង',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    assignedClassIds: [],
    assignedSubjectIds: [],
    status: 'ACTIVE'
  });

  const search = (globalSearch || localSearch).trim().toLowerCase();

  // Distinct specializations list for filter pills
  const specializations = ['ALL', ...Array.from(new Set(teachers.map(t => t.specialization.trim()).filter(Boolean)))];

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = !search || 
      t.nameKhmer.toLowerCase().includes(search) ||
      t.nameEnglish.toLowerCase().includes(search) ||
      t.teacherCode.toLowerCase().includes(search) ||
      t.specialization.toLowerCase().includes(search) ||
      t.phone.includes(search) ||
      t.email.toLowerCase().includes(search);

    const matchesSpecialization = selectedSpecialization === 'ALL' || t.specialization.trim() === selectedSpecialization;
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;

    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  // KPI Metrics
  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(t => t.status === 'ACTIVE').length;
  const femaleTeachers = teachers.filter(t => isFemaleGender(t.gender)).length;
  const advancedDegreeTeachers = teachers.filter(t => 
    t.qualification.toLowerCase().includes('master') || 
    t.qualification.toLowerCase().includes('អនុបណ្ឌិត') ||
    t.qualification.toLowerCase().includes('បណ្ឌិត') ||
    t.qualification.toLowerCase().includes('phd')
  ).length;

  const handleOpenAddModal = () => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែ/បន្ថែមត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចបន្ថែមគ្រូបង្រៀនថ្មីបាន!');
      return;
    }
    setEditingTeacher(null);
    const code = `TCH-2026-${String(teachers.length + 1).padStart(4, '0')}`;
    setFormData({
      teacherCode: code,
      nameKhmer: '',
      nameEnglish: '',
      gender: 'MALE',
      dob: '1988-01-01',
      phone: '',
      email: '',
      address: 'រាជធានីភ្នំពេញ',
      qualification: 'បរិញ្ញាបត្រអប់រំ (Bachelor of Education)',
      specialization: subjects[0]?.nameKhmer || 'គណិតវិទ្យា',
      employmentDate: '2020-01-01',
      position: 'គ្រូបង្រៀនពេញម៉ោង',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      assignedClassIds: [classes[0]?.id || 'CLS-12A'],
      assignedSubjectIds: [subjects[0]?.id || 'SUB-MATH-12'],
      status: 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (t: Teacher) => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកែប្រែទិន្នន័យគ្រូបង្រៀនបាន!');
      return;
    }
    setEditingTeacher(t);
    setFormData({ 
      ...t,
      assignedClassIds: t.assignedClassIds || [],
      assignedSubjectIds: t.assignedSubjectIds || []
    });
    setModalOpen(true);
  };

  const handleToggleClassAssignment = (classId: string) => {
    const current = formData.assignedClassIds || [];
    if (current.includes(classId)) {
      setFormData({ ...formData, assignedClassIds: current.filter(id => id !== classId) });
    } else {
      setFormData({ ...formData, assignedClassIds: [...current, classId] });
    }
  };

  const handleToggleSubjectAssignment = (subjectId: string) => {
    const current = formData.assignedSubjectIds || [];
    if (current.includes(subjectId)) {
      setFormData({ ...formData, assignedSubjectIds: current.filter(id => id !== subjectId) });
    } else {
      setFormData({ ...formData, assignedSubjectIds: [...current, subjectId] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចរក្សាទុកទិន្នន័យគ្រូបង្រៀនបាន!');
      return;
    }
    if (!formData.nameKhmer) return;

    const teacherToSave: Teacher = {
      id: editingTeacher ? editingTeacher.id : `TCH-${Date.now()}`,
      teacherCode: formData.teacherCode || `TCH-2026-${String(teachers.length + 1).padStart(4, '0')}`,
      nameKhmer: formData.nameKhmer || '',
      nameEnglish: formData.nameEnglish || '',
      gender: formData.gender || 'MALE',
      dob: formData.dob || '1988-01-01',
      phone: formData.phone || '',
      email: formData.email || '',
      address: formData.address || 'រាជធានីភ្នំពេញ',
      qualification: formData.qualification || 'បរិញ្ញាបត្រ',
      specialization: formData.specialization || '',
      employmentDate: formData.employmentDate || '2020-01-01',
      position: formData.position || 'គ្រូបង្រៀនពេញម៉ោង',
      photo: formData.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      assignedClassIds: formData.assignedClassIds || [],
      assignedSubjectIds: formData.assignedSubjectIds || [],
      status: formData.status || 'ACTIVE'
    };

    onSaveTeacher(teacherToSave);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-battambang flex items-center gap-2">
            <span>គ្រប់គ្រងលោកគ្រូ-អ្នកគ្រូ</span>
            <span className="text-xs text-purple-300 font-sans font-normal border border-purple-400/30 bg-purple-500/20 px-2.5 py-0.5 rounded-full">
              {filteredTeachers.length} / {totalTeachers} នាក់
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            បញ្ជីសាស្រ្តាចារ្យ គ្រូបង្រៀន មុខវិជ្ជាឯកទេស បន្ទុកថ្នាក់ និងការបង្រៀន
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setPrintRosterOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded-2xl text-xs font-semibold transition border border-white/15 backdrop-blur-md font-battambang"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>បោះពុម្ពបញ្ជីគ្រូ</span>
          </button>

          {isSuperAdmin ? (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-2xl text-xs font-semibold transition shadow-lg shadow-indigo-500/20 border border-indigo-400/30 backdrop-blur-md font-battambang"
            >
              <Plus className="w-4 h-4" />
              <span>បន្ថែមគ្រូបង្រៀនថ្មី</span>
            </button>
          ) : (
            <button
              disabled
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800/80 text-slate-400 rounded-2xl text-xs font-semibold border border-white/5 cursor-not-allowed opacity-60 backdrop-blur-md font-battambang"
              title="មានតែ Super Admin ប៉ុណ្ណោះដែលអាចបន្ថែមគ្រូបង្រៀនបាន (Super Admin Only)"
            >
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              <span>បន្ថែមគ្រូ (Super Admin)</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-3xl p-4 flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-battambang block">គ្រូបង្រៀនសរុប</span>
            <span className="text-2xl font-extrabold text-white font-mono">{totalTeachers} <span className="text-xs text-slate-400 font-battambang">នាក់</span></span>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-4 flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <span className="text-[11px] text-emerald-400 font-battambang block">កំពុងបង្រៀនសកម្ម</span>
            <span className="text-2xl font-extrabold text-emerald-300 font-mono">{activeTeachers} <span className="text-xs text-slate-400 font-battambang">នាក់</span></span>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-4 flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-pink-300" />
          </div>
          <div>
            <span className="text-[11px] text-pink-400 font-battambang block">គ្រូបង្រៀនជាស្រ្តី</span>
            <span className="text-2xl font-extrabold text-pink-300 font-mono">{femaleTeachers} <span className="text-xs text-slate-400 font-battambang">នាក់</span></span>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-4 flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <span className="text-[11px] text-amber-400 font-battambang block">កម្រិតអនុបណ្ឌិតឡើង</span>
            <span className="text-2xl font-extrabold text-amber-300 font-mono">{advancedDegreeTeachers} <span className="text-xs text-slate-400 font-battambang">នាក់</span></span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-3xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="ស្វែងរកឈ្មោះ អត្តលេខ ឬលេខទូរស័ព្ទគ្រូ..."
              className="w-full pl-9 pr-3 py-2 bg-white/5 text-xs text-slate-100 placeholder-slate-400 rounded-2xl border border-white/10 focus:border-indigo-400 outline-none backdrop-blur-md"
            />
          </div>

          {/* Status and View Mode */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`px-3 py-1 text-xs rounded-xl transition font-battambang ${
                  selectedStatus === 'ALL' ? 'bg-indigo-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                ទាំងអស់
              </button>
              <button
                onClick={() => setSelectedStatus('ACTIVE')}
                className={`px-3 py-1 text-xs rounded-xl transition font-battambang ${
                  selectedStatus === 'ACTIVE' ? 'bg-emerald-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                សកម្ម
              </button>
              <button
                onClick={() => setSelectedStatus('ON_LEAVE')}
                className={`px-3 py-1 text-xs rounded-xl transition font-battambang ${
                  selectedStatus === 'ON_LEAVE' ? 'bg-amber-600 text-white font-semibold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                ច្បាប់
              </button>
            </div>

            {/* Grid vs List toggle */}
            <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-xl transition ${viewMode === 'GRID' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`p-1.5 rounded-xl transition ${viewMode === 'LIST' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Specialization Tags Scroll */}
        {specializations.length > 1 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 pb-1 scrollbar-thin">
            <span className="text-[11px] text-slate-400 font-battambang shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> ឯកទេស:
            </span>
            {specializations.map(spec => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialization(spec)}
                className={`px-3 py-1 rounded-xl text-xs font-battambang shrink-0 transition border ${
                  selectedSpecialization === spec
                    ? 'bg-purple-600 text-white border-purple-400 font-semibold shadow-xs'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                {spec === 'ALL' ? 'គ្រប់ឯកទេសទាំងអស់' : spec}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Teachers Display Section */}
      {filteredTeachers.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <GraduationCap className="w-12 h-12 text-slate-500 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-white font-battambang">មិនមានទិន្នន័យគ្រូបង្រៀនដែលត្រូវនឹងការស្វែងរក</h3>
          <p className="text-xs text-slate-400">សូមសាកល្បងផ្លាស់ប្តូរពាក្យគន្លឹះ ឬជ្រើសរើសឯកទេសផ្សេង</p>
        </div>
      ) : viewMode === 'GRID' ? (
        
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.map(teacher => {
            const assignedClassesList = classes.filter(c => (teacher.assignedClassIds || []).includes(c.id));
            const assignedSubjectsList = subjects.filter(s => (teacher.assignedSubjectIds || []).includes(s.id));

            return (
              <div 
                key={teacher.id} 
                className="glass-card-interactive rounded-3xl p-6 flex flex-col justify-between space-y-4 group cursor-pointer"
                onClick={() => setDetailModalTeacher(teacher)}
              >
                
                <div>
                  {/* Top Avatar & Code */}
                  <div className="flex items-start space-x-3.5">
                    <div className="relative shrink-0">
                      <img 
                        src={teacher.photo} 
                        alt={teacher.nameKhmer}
                        className="w-14 h-14 rounded-2xl object-cover border border-white/20 shadow-md group-hover:scale-105 transition duration-200"
                        onError={(e) => { (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'); }}
                      />
                      <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                        teacher.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                          {teacher.teacherCode}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                          teacher.status === 'ACTIVE' 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {teacher.status === 'ACTIVE' ? 'សកម្ម' : teacher.status === 'ON_LEAVE' ? 'ច្បាប់' : 'អសកម្ម'}
                        </span>
                      </div>
                      <h3 className="font-bold text-white font-battambang text-sm mt-1 truncate group-hover:text-indigo-300 transition">
                        {teacher.nameKhmer}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium truncate">{teacher.nameEnglish}</p>
                    </div>
                  </div>

                  {/* Teaching Details & Contact */}
                  <div className="mt-4 pt-3 border-t border-white/10 space-y-2 text-xs">
                    <div className="flex items-center text-slate-300 space-x-2">
                      <BookOpen className="w-4 h-4 text-purple-300 shrink-0" />
                      <span className="truncate">ឯកទេស: <strong className="text-white font-battambang">{teacher.specialization}</strong></span>
                    </div>
                    
                    <div className="flex items-center text-slate-300 space-x-2">
                      <GraduationCap className="w-4 h-4 text-indigo-300 shrink-0" />
                      <span className="truncate text-slate-300">{teacher.qualification}</span>
                    </div>

                    <div className="flex items-center text-slate-300 space-x-2 font-mono">
                      <Phone className="w-4 h-4 text-emerald-300 shrink-0" />
                      <span>{teacher.phone || '012 xxx xxx'}</span>
                    </div>
                  </div>

                  {/* Assigned Classes Preview */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {assignedClassesList.slice(0, 3).map(cls => (
                      <span key={cls.id} className="text-[10px] bg-white/10 text-slate-200 px-2 py-0.5 rounded-lg border border-white/10 font-battambang">
                        {cls.name}
                      </span>
                    ))}
                    {assignedClassesList.length > 3 && (
                      <span className="text-[10px] bg-white/10 text-indigo-300 px-1.5 py-0.5 rounded-lg font-mono">
                        +{assignedClassesList.length - 3} ថ្នាក់
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div 
                  className="pt-3 border-t border-white/10 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setDetailModalTeacher(teacher)}
                    className="flex items-center space-x-1 text-xs text-indigo-300 hover:text-white font-battambang"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>មើលលម្អិត</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {isSuperAdmin ? (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(teacher)}
                          className="p-1.5 text-amber-300 hover:bg-white/10 rounded-xl transition"
                          title="កែប្រែ (Super Admin)"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`តើអ្នកពិតជាចង់លុបគ្រូ ${teacher.nameKhmer} (${teacher.teacherCode}) មែនទេ?`)) {
                              onDeleteTeacher(teacher.id);
                            }
                          }}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-xl transition"
                          title="លុបគ្រូ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="p-1.5 text-slate-500 opacity-40 cursor-not-allowed" title="សិទ្ធិកែប្រែ៖ Super Admin ប៉ុណ្ណោះ">
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (

        /* LIST / TABLE VIEW */
        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-slate-300 font-battambang">
                  <th className="py-3.5 px-4">អត្តលេខ</th>
                  <th className="py-3.5 px-4">រូបថត & ឈ្មោះគ្រូ</th>
                  <th className="py-3.5 px-4">ភេទ</th>
                  <th className="py-3.5 px-4">ឯកទេស & កម្រិតវប្បធម៌</th>
                  <th className="py-3.5 px-4">ថ្នាក់ទទួលបន្ទុក</th>
                  <th className="py-3.5 px-4">ទូរស័ព្ទ / អ៊ីមែល</th>
                  <th className="py-3.5 px-4">ស្ថានភាព</th>
                  <th className="py-3.5 px-4 text-center">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {filteredTeachers.map(teacher => {
                  const assignedClassesList = classes.filter(c => (teacher.assignedClassIds || []).includes(c.id));

                  return (
                    <tr key={teacher.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-300">
                        {teacher.teacherCode}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <img 
                            src={teacher.photo} 
                            alt={teacher.nameKhmer}
                            className="w-9 h-9 rounded-xl object-cover border border-white/20 shrink-0"
                            onError={(e) => { (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'); }}
                          />
                          <div>
                            <p className="font-bold text-white font-battambang text-sm leading-tight">{teacher.nameKhmer}</p>
                            <p className="text-[10px] text-slate-400">{teacher.nameEnglish}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isFemaleGender(teacher.gender)
                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {isFemaleGender(teacher.gender) ? 'ស្រី (F)' : 'ប្រុស (M)'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-purple-300 font-battambang">{teacher.specialization}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{teacher.qualification}</p>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {assignedClassesList.map(c => (
                            <span key={c.id} className="text-[10px] bg-white/10 text-slate-200 px-1.5 py-0.5 rounded-md font-battambang">
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <p className="text-emerald-300">{teacher.phone}</p>
                        <p className="text-slate-400 text-[10px] truncate max-w-[140px]">{teacher.email}</p>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                          teacher.status === 'ACTIVE' 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {teacher.status === 'ACTIVE' ? 'សកម្ម' : 'ច្បាប់'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setDetailModalTeacher(teacher)}
                            className="p-1.5 text-indigo-300 hover:bg-white/10 rounded-xl transition"
                            title="មើលព័ត៌មាន"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isSuperAdmin ? (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(teacher)}
                                className="p-1.5 text-amber-300 hover:bg-white/10 rounded-xl transition"
                                title="កែប្រែ (Super Admin)"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`តើអ្នកពិតជាចង់លុបគ្រូ ${teacher.nameKhmer} មែនទេ?`)) {
                                    onDeleteTeacher(teacher.id);
                                  }
                                }}
                                className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-xl transition"
                                title="លុបគ្រូ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className="p-1.5 text-slate-500 opacity-40 cursor-not-allowed" title="សិទ្ធិកែប្រែ៖ Super Admin ប៉ុណ្ណោះ">
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEACHER DETAIL MODAL */}
      {detailModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center space-x-3">
                <img 
                  src={detailModalTeacher.photo} 
                  alt={detailModalTeacher.nameKhmer}
                  className="w-12 h-12 rounded-2xl object-cover border border-white/20 shadow-md"
                  onError={(e) => { (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'); }}
                />
                <div>
                  <h3 className="font-bold text-white font-battambang text-base leading-tight">
                    {detailModalTeacher.nameKhmer}
                  </h3>
                  <p className="text-xs text-indigo-300 font-mono">
                    {detailModalTeacher.nameEnglish} • {detailModalTeacher.teacherCode}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    handleOpenEditModal(detailModalTeacher);
                    setDetailModalTeacher(null);
                  }}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 rounded-xl text-xs font-semibold font-battambang transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                  <span>កែប្រែ</span>
                </button>
                <button 
                  onClick={() => setDetailModalTeacher(null)} 
                  className="p-2 text-slate-400 hover:text-white rounded-2xl hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Top Banner Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-[11px] text-indigo-300 font-battambang block flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> តួនាទី & ការងារ
                  </span>
                  <p className="text-sm font-bold text-white font-battambang">{detailModalTeacher.position}</p>
                  <p className="text-slate-400">ថ្ងៃចូលបម្រើការងារ: <span className="font-mono text-slate-200">{detailModalTeacher.employmentDate || '2020-01-01'}</span></p>
                  <p className="text-slate-400">ស្ថានភាព: <strong className="text-emerald-300 font-battambang">{detailModalTeacher.status === 'ACTIVE' ? 'កំពុងបម្រើការងារសកម្ម' : detailModalTeacher.status}</strong></p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-[11px] text-purple-300 font-battambang block flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> ឯកទេស & សញ្ញាបត្រ
                  </span>
                  <p className="text-sm font-bold text-white font-battambang">{detailModalTeacher.specialization}</p>
                  <p className="text-slate-300">{detailModalTeacher.qualification}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <h4 className="font-bold text-white font-battambang flex items-center space-x-2 text-xs">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>ព័ត៌មានទំនាក់ទំនង & អាសយដ្ឋាន</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 pt-1">
                  <p>លេខទូរស័ព្ទ: <strong className="text-white font-mono">{detailModalTeacher.phone}</strong></p>
                  <p>អ៊ីមែល: <strong className="text-indigo-300 font-mono">{detailModalTeacher.email}</strong></p>
                  <p>ថ្ងៃខែឆ្នាំកំណើត: <span className="font-mono text-slate-200">{detailModalTeacher.dob}</span></p>
                  <p>ភេទ: <span className="text-slate-200">{formatGender(detailModalTeacher.gender, 'both')}</span></p>
                  <p className="sm:col-span-2">អាសយដ្ឋានបច្ចុប្បន្ន: <span className="text-slate-200 font-battambang">{detailModalTeacher.address || detailModalTeacher.addressKhmer || 'រាជធានីភ្នំពេញ'}</span></p>
                </div>
              </div>

              {/* Assigned Classes */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                <h4 className="font-bold text-white font-battambang flex items-center space-x-2 text-xs">
                  <Building className="w-4 h-4 text-indigo-400" />
                  <span>ថ្នាក់រៀនទទួលបន្ទុក ({detailModalTeacher.assignedClassIds?.length || 0} ថ្នាក់)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(detailModalTeacher.assignedClassIds || []).map(clsId => {
                    const cls = classes.find(c => c.id === clsId);
                    return (
                      <div key={clsId} className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                        <span className="font-bold text-white font-battambang">{cls?.name || clsId}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{cls?.room}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assigned Subjects */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                <h4 className="font-bold text-white font-battambang flex items-center space-x-2 text-xs">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span>មុខវិជ្ជាបង្រៀន ({detailModalTeacher.assignedSubjectIds?.length || 0} មុខវិជ្ជា)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(detailModalTeacher.assignedSubjectIds || []).map(subId => {
                    const sub = subjects.find(s => s.id === subId);
                    return (
                      <div key={subId} className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                        <span className="font-bold text-purple-300 font-battambang">{sub?.nameKhmer || subId}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{sub?.code}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-white/10 bg-white/5 flex items-center justify-end space-x-2">
              <button
                onClick={() => setDetailModalTeacher(null)}
                className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-xs font-semibold transition"
              >
                បិទ (Close)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD / EDIT TEACHER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <h3 className="font-bold text-white font-battambang text-base">
                {editingTeacher ? 'កែប្រែព័ត៌មានគ្រូបង្រៀន (Edit Teacher)' : 'បន្ថែមគ្រូបង្រៀនថ្មី (Add Teacher)'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ឈ្មោះជាភាសាខ្មែរ*</label>
                  <input
                    type="text"
                    required
                    value={formData.nameKhmer || ''}
                    onChange={e => setFormData({ ...formData, nameKhmer: e.target.value })}
                    placeholder="ឧ. លោកគ្រូ សុខ សុវណ្ណ"
                    className="w-full px-3 py-2 bg-white/5 text-white rounded-2xl border border-white/10 focus:border-indigo-400 font-battambang outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ឈ្មោះឡាតាំង (English Name)*</label>
                  <input
                    type="text"
                    required
                    value={formData.nameEnglish || ''}
                    onChange={e => setFormData({ ...formData, nameEnglish: e.target.value })}
                    placeholder="e.g. Sok Sovann"
                    className="w-full px-3 py-2 bg-white/5 text-white rounded-2xl border border-white/10 focus:border-indigo-400 outline-none"
                  />
                </div>
              </div>

              {/* Gender & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">អត្តលេខគ្រូ (Teacher Code)</label>
                  <input
                    type="text"
                    value={formData.teacherCode || ''}
                    onChange={e => setFormData({ ...formData, teacherCode: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 text-indigo-300 font-mono font-bold rounded-2xl border border-white/10 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ភេទ (Gender)</label>
                  <select
                    value={formData.gender || 'MALE'}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-2xl border border-white/10 outline-none cursor-pointer"
                  >
                    <option value="MALE">ប្រុស (Male)</option>
                    <option value="FEMALE">ស្រី (Female)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ថ្ងៃខែឆ្នាំកំណើត (DOB)</label>
                  <input
                    type="date"
                    value={formData.dob || '1988-01-01'}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 text-white rounded-2xl border border-white/10 outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Specialization & Qualification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">មុខវិជ្ជាឯកទេស*</label>
                  <input
                    type="text"
                    required
                    value={formData.specialization || ''}
                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="ឧ. គណិតវិទ្យា, ភាសាខ្មែរ, រូបវិទ្យា..."
                    className="w-full px-3 py-2 bg-white/5 text-white rounded-2xl border border-white/10 font-battambang outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">កម្រិតវប្បធម៌ / សញ្ញាបត្រ</label>
                  <input
                    type="text"
                    value={formData.qualification || ''}
                    onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="បរិញ្ញាបត្រ / អនុបណ្ឌិត..."
                    className="w-full px-3 py-2 bg-white/5 text-white rounded-2xl border border-white/10 outline-none"
                  />
                </div>
              </div>

              {/* Position & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">តួនាទី / មុខតំណែង</label>
                  <input
                    type="text"
                    value={formData.position || ''}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                    placeholder="ឧ. គ្រូបង្រៀនពេញម៉ោង, ប្រធានដេប៉ាតឺម៉ង់..."
                    className="w-full px-3 py-2 bg-white/5 text-white rounded-2xl border border-white/10 font-battambang outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ស្ថានភាពការងារ</label>
                  <select
                    value={formData.status || 'ACTIVE'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-2xl border border-white/10 outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">សកម្ម (Active)</option>
                    <option value="ON_LEAVE">ឈប់សម្រាកច្បាប់ (On Leave)</option>
                    <option value="INACTIVE">អសកម្ម (Inactive)</option>
                  </select>
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">លេខទូរស័ព្ទ</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="012 xxx xxx"
                    className="w-full px-3 py-2 bg-white/5 text-white rounded-2xl border border-white/10 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">អ៊ីមែល</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="teacher@school.edu.kh"
                    className="w-full px-3 py-2 bg-white/5 text-white rounded-2xl border border-white/10 outline-none"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">អាសយដ្ឋានបច្ចុប្បន្ន</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="រាជធានីភ្នំពេញ..."
                  className="w-full px-3 py-2 bg-white/5 text-white rounded-2xl border border-white/10 font-battambang outline-none"
                />
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">តំណភ្ជាប់រូបថត (Photo URL)</label>
                <input
                  type="text"
                  value={formData.photo || ''}
                  onChange={e => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 outline-none font-mono text-[11px]"
                />
              </div>

              {/* Assign Classes Multi-Select */}
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <label className="block text-slate-200 font-bold font-battambang">
                  ជ្រើសរើសថ្នាក់រៀនទទួលបន្ទុក (Assigned Classes):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {classes.map(c => {
                    const isChecked = (formData.assignedClassIds || []).includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => handleToggleClassAssignment(c.id)}
                        className={`p-2 rounded-xl text-left border flex items-center justify-between transition ${
                          isChecked
                            ? 'bg-indigo-600/30 text-white border-indigo-400'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        <span className="font-battambang font-medium">{c.name}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-indigo-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assign Subjects Multi-Select */}
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <label className="block text-slate-200 font-bold font-battambang">
                  ជ្រើសរើសមុខវិជ្ជាបង្រៀន (Assigned Subjects):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {subjects.map(s => {
                    const isChecked = (formData.assignedSubjectIds || []).includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => handleToggleSubjectAssignment(s.id)}
                        className={`p-2 rounded-xl text-left border flex items-center justify-between transition ${
                          isChecked
                            ? 'bg-purple-600/30 text-white border-purple-400'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        <span className="font-battambang font-medium truncate">{s.nameKhmer}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-purple-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl text-xs font-semibold transition border border-white/10"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-semibold transition shadow-lg shadow-indigo-500/20 border border-indigo-400/30 font-battambang"
                >
                  {editingTeacher ? 'រក្សាទុកការកែប្រែ' : 'បន្ថែមគ្រូបង្រៀន'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PRINT TEACHER ROSTER MODAL */}
      {printRosterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto print:p-0 print:bg-white print:fixed">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 print:border-none print:shadow-none print:bg-white text-slate-900">
            
            {/* Header controls for screen only */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 no-print">
              <h3 className="font-bold text-slate-800 font-battambang text-sm">
                បញ្ជីរាយនាមលោកគ្រូ-អ្នកគ្រូ (Official Teacher Directory)
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm font-battambang"
                >
                  <Printer className="w-4 h-4" />
                  <span>បោះពុម្ពបញ្ជី (Print)</span>
                </button>
                <button
                  onClick={() => setPrintRosterOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 print:p-4 font-sans text-xs space-y-6">
              
              {/* Letterhead */}
              <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
                <p className="font-moul text-sm text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p className="font-battambang text-xs text-slate-700">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <div className="pt-2">
                  <h2 className="font-bold text-base font-battambang text-slate-900">{school.nameKhmer}</h2>
                  <p className="font-semibold text-xs text-slate-600 uppercase tracking-wider">{school.nameEnglish}</p>
                  <p className="text-[11px] text-slate-500">{school.address} • ទូរស័ព្ទ: {school.phone}</p>
                </div>
                <h3 className="font-bold text-sm font-battambang pt-3 text-indigo-900 uppercase">
                  បញ្ជីរាយនាមបុគ្គលិកអប់រំ និងសាស្រ្តាចារ្យ ឆ្នាំសិក្សា {school.academicYear}
                </h3>
              </div>

              {/* Table */}
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-battambang border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300 text-center">ល.រ</th>
                    <th className="p-2 border-r border-slate-300">អត្តលេខ</th>
                    <th className="p-2 border-r border-slate-300">គោត្តនាម-នាម</th>
                    <th className="p-2 border-r border-slate-300 text-center">ភេទ</th>
                    <th className="p-2 border-r border-slate-300">មុខវិជ្ជាឯកទេស</th>
                    <th className="p-2 border-r border-slate-300">កម្រិតវប្បធម៌</th>
                    <th className="p-2 border-r border-slate-300">ថ្នាក់ទទួលបន្ទុក</th>
                    <th className="p-2">លេខទូរស័ព្ទ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {teachers.map((t, idx) => {
                    const assignedClassesNames = classes
                      .filter(c => (t.assignedClassIds || []).includes(c.id))
                      .map(c => c.name)
                      .join(', ');

                    return (
                      <tr key={t.id} className="text-slate-800">
                        <td className="p-2 text-center border-r border-slate-300 font-mono">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-300 font-mono font-bold text-indigo-950">{t.teacherCode}</td>
                        <td className="p-2 border-r border-slate-300 font-bold font-battambang">{t.nameKhmer}</td>
                        <td className="p-2 text-center border-r border-slate-300">{getGenderKhmer(t.gender)}</td>
                        <td className="p-2 border-r border-slate-300 font-battambang">{t.specialization}</td>
                        <td className="p-2 border-r border-slate-300">{t.qualification}</td>
                        <td className="p-2 border-r border-slate-300 font-battambang">{assignedClassesNames || '-'}</td>
                        <td className="p-2 font-mono">{t.phone}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="pt-8 flex justify-between text-center font-battambang text-xs">
                <div>
                  <p>បានឃើញ និងឯកភាព</p>
                  <p className="font-bold pt-1">ប្រធានការិយាល័យបុគ្គលិក</p>
                  <div className="h-16"></div>
                  <p className="text-slate-400">................................................</p>
                </div>

                <div>
                  <p>ថ្ងៃទី...... ខែ...... ឆ្នាំ២០២៦</p>
                  <p className="font-bold pt-1">នាយកសាលា</p>
                  <div className="h-16"></div>
                  <p className="font-bold text-slate-800">{school.principalKhmer || 'ឯកឧត្តមបណ្ឌិត ស៊ន វណ្ណារ៉ា'}</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
