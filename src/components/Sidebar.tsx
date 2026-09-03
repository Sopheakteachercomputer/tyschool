import React, { useState } from 'react';
import { UserRole, Language } from '../types';
import { getTranslation } from '../utils/i18n';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  UserCheck, 
  Building, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  Clock, 
  Award, 
  FileText, 
  DollarSign, 
  BookMarked, 
  Megaphone, 
  CalendarDays, 
  Scroll, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ClipboardList,
  FileSpreadsheet,
  Sparkles,
  Code2,
  TrendingUp,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Pin,
  PinOff,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Bell,
  MessageSquare,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
  language: Language;
  collapsed: boolean;
  onToggleCollapse: () => void;
  autoHide?: boolean;
  onToggleAutoHide?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
  badgeCounts?: {
    unpaidFees?: number;
    pendingBorrows?: number;
    pendingAssignments?: number;
    unreadNotifications?: number;
  };
}

interface NavItem {
  id: string;
  labelKhmer: string;
  labelEnglish: string;
  icon: any;
  allowedRoles: UserRole[];
  badge?: number;
  badgeColor?: string;
}

interface NavGroup {
  groupNameKhmer: string;
  groupNameEnglish: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  language,
  collapsed,
  onToggleCollapse,
  autoHide = false,
  onToggleAutoHide,
  mobileOpen = false,
  onCloseMobile,
  onLogout,
  badgeCounts = { unpaidFees: 0, pendingBorrows: 0, pendingAssignments: 0, unreadNotifications: 0 }
}) => {
  const t = getTranslation(language);
  const [isHovered, setIsHovered] = useState(false);

  // If autoHide is enabled, expand on hover and collapse on mouse leave
  const isExpanded = autoHide ? isHovered : !collapsed;
  const isMini = !isExpanded;

  const handleTabClick = (tabId: string) => {
    if (tabId === 'chat_direct') {
      window.dispatchEvent(new CustomEvent('open-chat-modal', { detail: { tab: 'DIRECT' } }));
      if (mobileOpen && onCloseMobile) {
        onCloseMobile();
      }
      return;
    }
    onTabChange(tabId);
    if (autoHide) {
      setIsHovered(false);
    }
    if (mobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  const navGroups: NavGroup[] = [
    {
      groupNameKhmer: 'ទូទៅ',
      groupNameEnglish: 'General',
      items: [
        {
          id: 'dashboard',
          labelKhmer: 'ផ្ទាំងគ្រប់គ្រង',
          labelEnglish: 'Dashboard',
          icon: LayoutDashboard,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'STAFF', 'STUDENT', 'PARENT']
        },
        {
          id: 'notifications',
          labelKhmer: 'ការជូនដំណឹង',
          labelEnglish: 'Notifications',
          icon: Bell,
          badge: badgeCounts?.unreadNotifications,
          badgeColor: 'bg-rose-500 shadow-sm shadow-rose-500/50',
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'STAFF', 'STUDENT', 'PARENT']
        },
        {
          id: 'weekly_report',
          labelKhmer: 'របាយការណ៍ប្រចាំសប្តាហ៍',
          labelEnglish: 'Weekly Report',
          icon: FileSpreadsheet,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'STAFF', 'STUDENT', 'PARENT']
        }
      ]
    },
    {
      groupNameKhmer: 'កន្លែងផ្ទាល់ខ្លួន (My Workspace)',
      groupNameEnglish: 'User-Owned Workspace',
      items: [
        {
          id: 'ai_studio',
          labelKhmer: 'មជ្ឈមណ្ឌល Gemini AI (Multimodal)',
          labelEnglish: 'Gemini AI Studio Suite',
          icon: Sparkles,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'STAFF', 'STUDENT', 'PARENT']
        },
        {
          id: 'chat_direct',
          labelKhmer: 'ជជែកផ្ទាល់ & AI Bot',
          labelEnglish: 'Direct Chat & AI Bot',
          icon: MessageSquare,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'STAFF', 'STUDENT', 'PARENT']
        },
        {
          id: 'my_projects',
          labelKhmer: 'គម្រោងកូដផ្ទាល់ខ្លួន',
          labelEnglish: 'My Projects',
          icon: Code2,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'STAFF', 'STUDENT', 'PARENT']
        },
        {
          id: 'my_notes',
          labelKhmer: 'កំណត់ចំណាំរបស់ខ្ញុំ',
          labelEnglish: 'My Notes',
          icon: BookOpen,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'STAFF', 'STUDENT', 'PARENT']
        },
        {
          id: 'my_progress',
          labelKhmer: 'វឌ្ឍនភាពសិក្សា',
          labelEnglish: 'My Progress',
          icon: TrendingUp,
          allowedRoles: ['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN', 'PARENT']
        },
        {
          id: 'profile',
          labelKhmer: 'គណនីផ្ទាល់ខ្លួន',
          labelEnglish: 'My Profile',
          icon: UserIcon,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'STAFF', 'STUDENT', 'PARENT']
        },
        {
          id: 'security_tests',
          labelKhmer: 'តេស្តសុវត្ថិភាព (IDOR)',
          labelEnglish: 'Security Tests',
          icon: ShieldCheck,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT']
        }
      ]
    },
    {
      groupNameKhmer: 'ការគ្រប់គ្រងបុគ្គលិក-សិស្ស',
      groupNameEnglish: 'People Management',
      items: [
        {
          id: 'students',
          labelKhmer: 'គ្រប់គ្រងសិស្ស',
          labelEnglish: 'Students',
          icon: Users,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'STAFF']
        },
        {
          id: 'teachers',
          labelKhmer: 'គ្រប់គ្រងគ្រូ',
          labelEnglish: 'Teachers',
          icon: GraduationCap,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'STAFF']
        },
        {
          id: 'parents',
          labelKhmer: 'អាណាព្យាបាល',
          labelEnglish: 'Parents',
          icon: UserCheck,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER']
        }
      ]
    },
    {
      groupNameKhmer: 'ការសិក្សា & បង្រៀន',
      groupNameEnglish: 'Academics & Teaching',
      items: [
        {
          id: 'classes_subjects',
          labelKhmer: 'ថ្នាក់រៀន & មុខវិជ្ជា',
          labelEnglish: 'Classes & Subjects',
          icon: Building,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER']
        },
        {
          id: 'weekly_quiz',
          labelKhmer: 'ពិន្ទុតេស្ត Typing • Writing • Practice',
          labelEnglish: 'Weekly Quiz Scores',
          icon: Award,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT']
        },
        {
          id: 'attendance',
          labelKhmer: 'វត្តមានសិស្ស',
          labelEnglish: 'Attendance',
          icon: CheckSquare,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER']
        },
        {
          id: 'cleaning_groups',
          labelKhmer: 'ក្រុមវេនសម្អាត & ពិន្ទុ',
          labelEnglish: 'Class Cleaning & Score',
          icon: Sparkles,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'STAFF', 'PARENT']
        },
        {
          id: 'timetable',
          labelKhmer: 'កាលវិភាគ',
          labelEnglish: 'Timetable',
          icon: Clock,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']
        },
        {
          id: 'exams_grades',
          labelKhmer: 'ការប្រឡង & ពិន្ទុ',
          labelEnglish: 'Exams & Grades',
          icon: Award,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER']
        },
        {
          id: 'report_cards',
          labelKhmer: 'ព្រឹត្តិបត្រពិន្ទុ',
          labelEnglish: 'Report Cards',
          icon: FileText,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT']
        },
        {
          id: 'assignments',
          labelKhmer: 'កិច្ចការសិស្ស',
          labelEnglish: 'Assignments',
          icon: ClipboardList,
          badge: badgeCounts.pendingAssignments,
          badgeColor: 'bg-indigo-500/80',
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT']
        }
      ]
    },
    {
      groupNameKhmer: 'ហិរញ្ញវត្ថុ & រដ្ឋបាល',
      groupNameEnglish: 'Finance & Admin',
      items: [
        {
          id: 'fees_finance',
          labelKhmer: 'ថ្លៃសិក្សា & ចំណាយ',
          labelEnglish: 'Fees & Finance',
          icon: DollarSign,
          badge: badgeCounts.unpaidFees,
          badgeColor: 'bg-rose-500/80',
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'STUDENT', 'PARENT']
        },
        {
          id: 'library',
          labelKhmer: 'បណ្ណាល័យ',
          labelEnglish: 'Library',
          icon: BookMarked,
          badge: badgeCounts.pendingBorrows,
          badgeColor: 'bg-amber-500/80',
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'LIBRARIAN', 'TEACHER', 'STUDENT']
        },
        {
          id: 'announcements',
          labelKhmer: 'ដំណឹង & ព្រឹត្តិការណ៍',
          labelEnglish: 'Notices & Events',
          icon: Megaphone,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT', 'LIBRARIAN']
        },
        {
          id: 'certificates',
          labelKhmer: 'វិញ្ញាបនបត្រ & លិខិត',
          labelEnglish: 'Certificates',
          icon: Scroll,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER']
        },
        {
          id: 'reports',
          labelKhmer: 'មជ្ឈមណ្ឌលរបាយការណ៍',
          labelEnglish: 'Reports Center',
          icon: BarChart3,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'ACCOUNTANT']
        }
      ]
    },
    {
      groupNameKhmer: 'ប្រព័ន្ធ',
      groupNameEnglish: 'System',
      items: [
        {
          id: 'audit_logs',
          labelKhmer: 'សវនកម្ម (Audit Log)',
          labelEnglish: 'Audit Logs',
          icon: ShieldAlert,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN']
        },
        {
          id: 'settings',
          labelKhmer: 'ការកំណត់ប្រព័ន្ធ & ទិន្នន័យ',
          labelEnglish: 'Settings & All Data',
          icon: Settings,
          allowedRoles: ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'STAFF', 'STUDENT', 'PARENT']
        }
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full w-full select-none">
      
      {/* Top Header / Mode Controls */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between gap-1.5">
        {isExpanded ? (
          <div className="flex items-center justify-between w-full px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-200 font-battambang">
                {autoHide ? 'Auto-Hide (លាក់ស្វ័យប្រវត្តិ)' : 'មឺនុយបញ្ជា (Navigation)'}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              {onToggleAutoHide && (
                <button
                  onClick={onToggleAutoHide}
                  className={`p-1.5 rounded-lg border text-xs transition ${
                    autoHide 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' 
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                  title={autoHide ? 'បិទ Auto-Hide (ខ្ទាស់ជាប់ / Pin)' : 'បើក Auto-Hide (លាក់ស្វ័យប្រវត្តិ)'}
                >
                  {autoHide ? <Zap className="w-3.5 h-3.5 text-amber-400" /> : <Pin className="w-3.5 h-3.5" />}
                </button>
              )}

              {onCloseMobile && mobileOpen && (
                <button
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 lg:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center w-full py-1">
            {onToggleAutoHide && (
              <button
                onClick={onToggleAutoHide}
                className={`p-2 rounded-xl border transition ${
                  autoHide 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
                title={autoHide ? 'កំពុងបើក Auto-Hide (Hover ដើម្បីពង្រីក)' : 'ចុចដើម្បីបើក Auto-Hide'}
              >
                {autoHide ? <Zap className="w-4 h-4 text-amber-400" /> : <PinOff className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5 custom-scrollbar">
        {navGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter(item => item.allowedRoles.includes(userRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIdx} className="space-y-1">
              {isExpanded && (
                <h4 className="px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase font-battambang truncate">
                  {language === 'km' ? group.groupNameKhmer : group.groupNameEnglish}
                </h4>
              )}
              {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center ${
                      isMini ? 'justify-center px-2' : 'justify-between px-3'
                    } py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all group relative ${
                      isActive 
                        ? 'bg-white/10 text-white border border-white/15 shadow-lg shadow-indigo-500/10 font-semibold' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                    title={language === 'km' ? item.labelKhmer : item.labelEnglish}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {isActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                      ) : (
                        <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-indigo-300 transition-colors" />
                      )}
                      {isActive && <Icon className="w-4 h-4 shrink-0 text-indigo-300" />}
                      {isExpanded && (
                        <span className="font-battambang tracking-wide text-xs truncate">
                          {language === 'km' ? item.labelKhmer : item.labelEnglish}
                        </span>
                      )}
                    </div>

                    {isExpanded && item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10 shrink-0 ${item.badgeColor || 'bg-indigo-500/80'}`}>
                        {item.badge}
                      </span>
                    )}

                    {isMini && (
                      <div className="absolute left-full ml-2.5 px-3 py-1.5 bg-slate-900/95 backdrop-blur-xl text-white text-xs font-battambang rounded-xl whitespace-nowrap shadow-2xl border border-white/15 pointer-events-none opacity-0 group-hover:opacity-100 transition z-50">
                        {language === 'km' ? item.labelKhmer : item.labelEnglish}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Frosted Bottom Status Box */}
      {isExpanded && (
        <div className="p-3">
          <div className="p-3 rounded-2xl bg-linear-to-br from-indigo-500/15 via-purple-500/15 to-transparent border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-indigo-200 font-battambang font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'km' ? 'ស្ថានភាពប្រព័ន្ធ' : 'System Status'}</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
              <div className="h-full bg-linear-to-r from-indigo-400 to-purple-400 w-full"></div>
            </div>
            <p className="text-[10px] mt-1.5 text-slate-400 font-mono">
              {language === 'km' ? '100% ដំណើរការល្អ (Nominal)' : '100% Operational (Nominal)'}
            </p>
          </div>
        </div>
      )}

      {/* Logout & Collapse Controls */}
      <div className="p-2.5 border-t border-white/10 space-y-1.5">
        {onLogout && (
          <button
            onClick={() => {
              if (window.confirm(language === 'km' ? 'តើអ្នកពិតជាចង់ចាកចេញពីប្រព័ន្ធមែនទេ?' : 'Are you sure you want to log out?')) {
                onLogout();
              }
            }}
            className={`w-full flex items-center ${
              isMini ? 'justify-center p-2' : 'space-x-2.5 px-3 py-2'
            } rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/15 border border-rose-500/20 transition-all`}
            title={t.logout}
          >
            <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
            {isExpanded && <span>{t.logout}</span>}
          </button>
        )}

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
          title={isExpanded ? (language === 'km' ? 'បង្រួម' : 'Collapse') : (language === 'km' ? 'ពង្រីក' : 'Expand')}
        >
          {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside 
        onMouseEnter={() => {
          if (autoHide) setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (autoHide) setIsHovered(false);
        }}
        className={`hidden lg:flex flex-col bg-slate-950/50 backdrop-blur-xl text-slate-300 border-r border-white/10 transition-all duration-300 z-30 no-print ${
          autoHide && isHovered
            ? 'w-64 absolute left-0 top-0 bottom-0 h-full shadow-2xl bg-slate-950/95 border-r border-indigo-500/30'
            : isExpanded ? 'w-64' : 'w-18'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-over) with Backdrop Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={onCloseMobile} 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] bg-slate-950/95 backdrop-blur-2xl border-r border-white/15 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

