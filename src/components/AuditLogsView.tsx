import React, { useState, useMemo } from 'react';
import { AuditLog, UserRole } from '../types';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Activity, 
  Download, 
  Trash2, 
  RefreshCw, 
  FileText, 
  Eye, 
  Calendar, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowUpDown,
  X,
  Copy,
  Check,
  HardDriveDownload,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';

interface AuditLogsViewProps {
  logs: AuditLog[];
  searchTerm: string;
  onClearLogs?: () => void;
  onRefreshLogs?: () => void;
  userRole?: string;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  logs,
  searchTerm: globalSearch,
  onClearLogs,
  onRefreshLogs,
  userRole
}) => {
  const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
  const [localSearch, setLocalSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [copiedDetail, setCopiedDetail] = useState(false);
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const search = (globalSearch || localSearch).trim().toLowerCase();

  // Extract unique modules/resources from logs for filter dropdown
  const uniqueModules = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      const mod = l.resource || l.module;
      if (mod) set.add(mod);
    });
    return Array.from(set);
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return logs.filter(l => {
      const userName = (l.userName || '').toLowerCase();
      const action = (l.action || '').toLowerCase();
      const resource = (l.resource || l.module || '').toLowerCase();
      const details = (l.details || '').toLowerCase();
      const ip = (l.ipAddress || l.ip || '').toLowerCase();
      const role = (l.userRole || l.role || '').toUpperCase();

      // Search match
      const matchesSearch = !search || 
        userName.includes(search) || 
        action.includes(search) || 
        resource.includes(search) || 
        details.includes(search) || 
        ip.includes(search) ||
        role.includes(search);

      // Action Filter
      let matchesAction = true;
      if (actionFilter !== 'ALL') {
        const actUpper = (l.action || '').toUpperCase();
        if (actionFilter === 'CREATE') matchesAction = actUpper.includes('CREATE') || actUpper.includes('បង្កើត') || actUpper.includes('បញ្ចូល');
        else if (actionFilter === 'UPDATE') matchesAction = actUpper.includes('UPDATE') || actUpper.includes('កែប្រែ') || actUpper.includes('ប្តូរ');
        else if (actionFilter === 'DELETE') matchesAction = actUpper.includes('DELETE') || actUpper.includes('លុប');
        else if (actionFilter === 'LOGIN') matchesAction = actUpper.includes('LOGIN') || actUpper.includes('ចូល');
        else if (actionFilter === 'PAYMENT') matchesAction = actUpper.includes('PAY') || actUpper.includes('ប្រាក់') || actUpper.includes('វិក្កយបត្រ');
        else if (actionFilter === 'EXPORT') matchesAction = actUpper.includes('EXPORT') || actUpper.includes('ទាញយក');
        else matchesAction = actUpper.includes(actionFilter);
      }

      // Module Filter
      const matchesModule = moduleFilter === 'ALL' || (l.resource || l.module) === moduleFilter;

      // Role Filter
      const matchesRole = roleFilter === 'ALL' || role.includes(roleFilter);

      // Date Filter
      let matchesDate = true;
      if (dateFilter !== 'ALL') {
        const logDate = new Date(l.timestamp);
        if (dateFilter === 'TODAY') {
          matchesDate = (l.timestamp || '').startsWith(todayStr);
        } else if (dateFilter === 'WEEK') {
          matchesDate = logDate >= sevenDaysAgo;
        } else if (dateFilter === 'MONTH') {
          matchesDate = logDate >= thirtyDaysAgo;
        }
      }

      return matchesSearch && matchesAction && matchesModule && matchesRole && matchesDate;
    }).sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime() || 0;
      const timeB = new Date(b.timestamp).getTime() || 0;
      return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
    });
  }, [logs, search, actionFilter, moduleFilter, roleFilter, dateFilter, sortOrder]);

  // Statistics Metrics
  const stats = useMemo(() => {
    let total = logs.length;
    let creates = 0;
    let updates = 0;
    let deletes = 0;
    let logins = 0;

    logs.forEach(l => {
      const act = (l.action || '').toUpperCase();
      if (act.includes('CREATE') || act.includes('បង្កើត') || act.includes('បញ្ចូល')) creates++;
      else if (act.includes('UPDATE') || act.includes('កែប្រែ')) updates++;
      else if (act.includes('DELETE') || act.includes('លុប')) deletes++;
      else if (act.includes('LOGIN') || act.includes('ចូល')) logins++;
    });

    return { total, creates, updates, deletes, logins };
  }, [logs]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'កាលបរិច្ឆេទ & ម៉ោង (Timestamp)', 'អ្នកប្រើប្រាស់ (User)', 'តួនាទី (Role)', 'សកម្មភាព (Action)', 'ទិន្នន័យគោលដៅ (Module/Resource)', 'ព័ត៌មានលម្អិត (Details)', 'IP Address'];
    
    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${(l.userName || '').replace(/"/g, '""')}"`,
      `"${l.userRole || l.role || 'ADMIN'}"`,
      `"${(l.action || '').replace(/"/g, '""')}"`,
      `"${(l.resource || l.module || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ipAddress || l.ip || '192.168.1.102'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `audit_logs_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Helper for action badge colors
  const getActionBadge = (action: string) => {
    const act = (action || '').toUpperCase();
    if (act.includes('CREATE') || act.includes('បង្កើត') || act.includes('បញ្ចូល')) {
      return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'បង្កើត (CREATE)' };
    }
    if (act.includes('UPDATE') || act.includes('កែប្រែ') || act.includes('ប្តូរ')) {
      return { bg: 'bg-sky-500/20 text-sky-300 border-sky-500/30', label: 'កែប្រែ (UPDATE)' };
    }
    if (act.includes('DELETE') || act.includes('លុប')) {
      return { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30', label: 'លុប (DELETE)' };
    }
    if (act.includes('LOGIN') || act.includes('ចូល')) {
      return { bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', label: 'ចូលប្រើ (LOGIN)' };
    }
    if (act.includes('PAY') || act.includes('ប្រាក់') || act.includes('វិក្កយបត្រ')) {
      return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', label: 'ទូទាត់ (PAYMENT)' };
    }
    if (act.includes('EXPORT') || act.includes('ទាញយក')) {
      return { bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'នាំចេញ (EXPORT)' };
    }
    return { bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: action || 'សកម្មភាព' };
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Live Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-battambang flex items-center gap-2">
              <span>កំណត់ត្រាសវនកម្ម & សុវត្ថិភាព (System Audit Logs)</span>
              <span className="flex items-center space-x-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Active 24/7</span>
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              តាមដានរាល់សកម្មភាពកត់ត្រា បង្កើត កែប្រែ លុប និងការទូទាត់ប្រាក់ក្នុងប្រព័ន្ធគ្រប់គ្រងសាលា
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {onRefreshLogs && (
            <button
              onClick={onRefreshLogs}
              title="Reload logs"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold border border-emerald-500/30 transition shadow-md font-battambang"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ទាញយក Excel / CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition font-battambang"
          >
            <HardDriveDownload className="w-4 h-4 text-indigo-400" />
            <span>Backup JSON</span>
          </button>

          {onClearLogs && isSuperAdmin && (
            <button
              id="btn-clear-audit-logs"
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600/80 to-red-600/80 hover:from-rose-600 hover:to-red-600 text-white border border-rose-500/40 text-xs font-semibold transition shadow-md shadow-rose-600/20 font-battambang"
              title="សម្អាតកំណត់ត្រាសវនកម្មទាំងអស់ (Clear Audit Logs)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>សម្អាត Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-battambang">សកម្មភាពសរុប (Total)</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{stats.total}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">កំណត់ត្រាក្នុងប្រព័ន្ធ</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-emerald-300 font-battambang">បង្កើតថ្មី (Created)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-300 font-mono">{stats.creates}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">សិស្ស គ្រូ ថ្នាក់ វិក្កយបត្រ</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-sky-300 font-battambang">កែប្រែទិន្នន័យ (Updated)</span>
            <RefreshCw className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-sky-300 font-mono">{stats.updates}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">បច្ចុប្បន្នភាពព័ត៌មាន</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-rose-300 font-battambang">លុប & សន្តិសុខ (Deletes)</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-300 font-mono">{stats.deletes}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">សកម្មភាពលុបទិន្នន័យ</p>
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-lg space-y-3">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះអ្នកប្រើប្រាស់ សកម្មភាព ម៉ូឌុល ព័ត៌មានលម្អិត ឬ IP... (Search Logs)"
              className="w-full pl-9 pr-4 py-2 bg-white/5 hover:bg-white/10 focus:bg-white/10 text-xs sm:text-sm text-white placeholder-slate-400 rounded-xl border border-white/10 focus:border-indigo-400 outline-none transition"
            />
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1 font-battambang">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>កាលបរិច្ឆេទ:</span>
            </span>
            {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDateFilter(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  dateFilter === d 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {d === 'ALL' ? 'ទាំងអស់' : d === 'TODAY' ? 'ថ្ងៃនេះ' : d === 'WEEK' ? '៧ ថ្ងៃ' : '៣០ ថ្ងៃ'}
              </button>
            ))}
          </div>

        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1 border-t border-white/10 text-xs">
          
          {/* Action Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-battambang">ប្រភេទសកម្មភាព (Action)</label>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950/80 text-xs text-white rounded-xl border border-white/10 focus:border-indigo-400 outline-none"
            >
              <option value="ALL">គ្រប់សកម្មភាពទាំងអស់ (All)</option>
              <option value="CREATE">បង្កើតថ្មី (CREATE)</option>
              <option value="UPDATE">កែប្រែទិន្នន័យ (UPDATE)</option>
              <option value="DELETE">លុបទិន្នន័យ (DELETE)</option>
              <option value="LOGIN">ការចូលប្រព័ន្ធ (LOGIN)</option>
              <option value="PAYMENT">ហិរញ្ញវត្ថុ/ទូទាត់ (PAYMENT)</option>
              <option value="EXPORT">នាំចេញទិន្នន័យ (EXPORT)</option>
            </select>
          </div>

          {/* Module / Resource Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-battambang">ម៉ូឌុលគោលដៅ (Module / Resource)</label>
            <select
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950/80 text-xs text-white rounded-xl border border-white/10 focus:border-indigo-400 outline-none"
            >
              <option value="ALL">គ្រប់ម៉ូឌុលទាំងអស់ (All Modules)</option>
              {uniqueModules.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-battambang">តួនាទីអ្នកធ្វើ (User Role)</label>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950/80 text-xs text-white rounded-xl border border-white/10 focus:border-indigo-400 outline-none"
            >
              <option value="ALL">គ្រប់តួនាទី (All Roles)</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">School Admin</option>
              <option value="DIRECTOR">Director</option>
              <option value="TEACHER">Teacher</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="LIBRARIAN">Librarian</option>
              <option value="STUDENT">Student</option>
              <option value="PARENT">Parent</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-battambang">តម្រៀបតាមពេលវេលា (Sorting)</label>
            <button
              onClick={() => setSortOrder(s => s === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
              className="w-full px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs text-slate-200 rounded-xl border border-white/10 flex items-center justify-between transition"
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{sortOrder === 'NEWEST' ? 'ថ្មីបំផុតមុន (Newest)' : 'ចាស់បំផុតមុន (Oldest)'}</span>
              </span>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

        </div>

      </div>

      {/* 4. Logs Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-white font-battambang">បញ្ជីកំណត់ត្រាសកម្មភាព</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-mono">
              បង្ហាញ {filteredLogs.length} នៃ {logs.length}
            </span>
          </div>
          {(actionFilter !== 'ALL' || moduleFilter !== 'ALL' || roleFilter !== 'ALL' || dateFilter !== 'ALL' || search) && (
            <button
              onClick={() => {
                setActionFilter('ALL');
                setModuleFilter('ALL');
                setRoleFilter('ALL');
                setDateFilter('ALL');
                setLocalSearch('');
              }}
              className="text-[11px] text-indigo-300 hover:text-white font-semibold transition"
            >
              សម្អាតតម្រង (Reset Filters)
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-battambang uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">កាលបរិច្ឆេទ & ម៉ោង</th>
                <th className="py-3 px-4 font-semibold">អ្នកប្រើប្រាស់ (User)</th>
                <th className="py-3 px-4 font-semibold">តួនាទី</th>
                <th className="py-3 px-4 font-semibold">សកម្មភាព (Action)</th>
                <th className="py-3 px-4 font-semibold">ម៉ូឌុលគោលដៅ</th>
                <th className="py-3 px-4 font-semibold">ព័ត៌មានលម្អិត</th>
                <th className="py-3 px-4 font-semibold font-mono">IP Address</th>
                <th className="py-3 px-4 text-right">លម្អិត</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-battambang">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-60" />
                    <p className="font-semibold text-sm">រកមិនឃើញកំណត់ត្រាសវនកម្មដែលត្រូវគ្នានឹងតម្រងទេ</p>
                    <p className="text-xs text-slate-500 mt-1">សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬសម្អាតតម្រង</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const badge = getActionBadge(log.action);
                  const roleStr = log.userRole || log.role || 'ADMIN';
                  const resStr = log.resource || log.module || 'ប្រព័ន្ធទូទៅ';
                  const ipStr = log.ipAddress || log.ip || '192.168.1.102';

                  return (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-white/5 transition cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-400 opacity-70" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-[10px]">
                            {log.userName.charAt(0) || 'U'}
                          </div>
                          <span className="font-bold text-white group-hover:text-indigo-300 transition">
                            {log.userName}
                          </span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[10px] font-semibold">
                          {roleStr}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Resource / Module */}
                      <td className="py-3.5 px-4 font-semibold text-indigo-300 whitespace-nowrap">
                        {resStr}
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>

                      {/* IP Address */}
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {ipStr}
                      </td>

                      {/* Inspect Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                          title="ពិនិត្យលម្អិត"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Detailed Audit Log Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-inner">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-battambang flex items-center gap-2">
                    <span>ព័ត៌មានលម្អិតសវនកម្ម (Audit Details)</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {selectedLog.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs font-battambang">
              
              <div className="grid grid-cols-2 gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">កាលបរិច្ឆេទ & ម៉ោង</span>
                  <span className="text-white font-mono font-semibold">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">IP Address & ទីតាំង</span>
                  <span className="text-indigo-300 font-mono font-semibold">{selectedLog.ipAddress || selectedLog.ip || '192.168.1.102'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">អ្នកធ្វើសកម្មភាព (Actor)</span>
                  <span className="text-white font-bold">{selectedLog.userName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">តួនាទី (Role)</span>
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 text-[10px]">
                    {selectedLog.userRole || selectedLog.role || 'ADMIN'}
                  </span>
                </div>
              </div>

              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">ប្រភេទសកម្មភាព & ម៉ូឌុល</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    {selectedLog.action}
                  </span>
                </div>
                <p className="text-indigo-300 font-bold text-sm">
                  {selectedLog.resource || selectedLog.module}
                </p>
              </div>

              {/* Full Description / Payload */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5">សេចក្តីពិពណ៌នាលម្អិតនៃប្រតិបត្តិការ (Payload Details):</label>
                <div className="bg-black/50 p-3.5 rounded-2xl border border-white/10 text-slate-200 font-mono text-xs leading-relaxed max-h-36 overflow-y-auto">
                  {selectedLog.details}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
                    setCopiedDetail(true);
                    setTimeout(() => setCopiedDetail(false), 2000);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition text-xs"
                >
                  {copiedDetail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDetail ? 'បានចម្លង JSON' : 'ចម្លង JSON Log'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition text-xs"
                >
                  បិទ (Close)
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 6. Clear Audit Logs Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl shadow-rose-950/50 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-battambang flex items-center gap-2">
                    <span>សម្អាតកំណត់ត្រាសវនកម្ម (Logs)</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 font-mono font-semibold">
                      {logs.length}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">Clear System Audit Logs Confirmation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Text */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-start space-x-3 text-xs text-rose-200 leading-relaxed font-battambang">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-300">តើលោកអ្នកពិតជាចង់សម្អាតកំណត់ត្រាសវនកម្មទាំងអស់ ({logs.length} កំណត់ត្រា) មែនដែរឬទេ?</p>
                <p className="mt-1 text-slate-300">
                  ទិន្នន័យប្រវត្តិសកម្មភាពសវនកម្ម (Audit Logs) ទាំងអស់ក្នុងមូលដ្ឋានទិន្នន័យនឹងត្រូវលុបសម្អាតដើម្បីសន្សំទំហំផ្ទុក។
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-white/10 font-battambang">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                id="btn-confirm-clear-logs"
                onClick={() => {
                  if (onClearLogs) {
                    onClearLogs();
                  }
                  setIsClearModalOpen(false);
                  setShowSuccessToast(true);
                  setTimeout(() => setShowSuccessToast(false), 3500);
                }}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/30 border border-rose-400/40"
              >
                <Trash2 className="w-4 h-4" />
                <span>បញ្ជាក់ការសម្អាត Logs ទាំងអស់</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Success Toast Banner */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-5 py-3.5 bg-slate-900 border border-emerald-500/40 text-white rounded-2xl shadow-2xl shadow-emerald-950/60 backdrop-blur-xl animate-in slide-in-from-bottom-5 font-battambang">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-300">បានសម្អាតជោគជ័យ!</p>
            <p className="text-[11px] text-slate-300">កំណត់ត្រាសវនកម្ម (Audit Logs) ត្រូវបានសម្អាតរួចរាល់</p>
          </div>
        </div>
      )}

    </div>
  );
};
