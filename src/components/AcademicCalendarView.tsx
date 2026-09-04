import React, { useState, useMemo } from 'react';
import { SchoolEvent, UserRole, Language, ClassRoom } from '../types';
import { 
  Calendar as CalendarIcon, 
  CalendarDays, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  Users, 
  Award, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Tag, 
  LayoutGrid, 
  List, 
  Flag, 
  Bell, 
  Share2,
  CalendarRange,
  Bookmark,
  Check,
  HelpCircle
} from 'lucide-react';

interface AcademicCalendarViewProps {
  events: SchoolEvent[];
  onSaveEvent: (event: SchoolEvent) => void;
  onDeleteEvent?: (id: string) => void;
  onSaveEventsBatch?: (events: SchoolEvent[]) => void;
  userRole?: UserRole;
  language?: Language;
  classes?: ClassRoom[];
}

// Cambodian Public Holidays template list
const CAMBODIAN_HOLIDAYS_PRESET: Omit<SchoolEvent, 'id'>[] = [
  {
    titleKhmer: 'ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍',
    titleEnglish: 'Victory Over Genocide Day',
    startDate: '2027-01-07',
    endDate: '2027-01-07',
    isAllDay: true,
    type: 'HOLIDAY',
    description: 'ទិវាបុណ្យរំលឹកខួបនៃជ័យជម្នះជាប្រវត្តិសាស្ត្រ ៧ មករា',
    location: 'ទូទាំងប្រទេសកម្ពុជា',
    targetAudience: 'ALL',
    color: '#f59e0b',
    isImportant: true,
    academicYear: '2026-2027'
  },
  {
    titleKhmer: 'ទិវាសិទ្ធិនារីអន្តរជាតិ ៨ មីនា',
    titleEnglish: "International Women's Day",
    startDate: '2027-03-08',
    endDate: '2027-03-08',
    isAllDay: true,
    type: 'HOLIDAY',
    description: 'ទិវាលើកកម្ពស់សិទ្ធិ និងតម្លៃស្ត្រីទូទាំងសកលលោក',
    location: 'ទូទាំងប្រទេសកម្ពុជា',
    targetAudience: 'ALL',
    color: '#ec4899',
    isImportant: false,
    academicYear: '2026-2027'
  },
  {
    titleKhmer: 'ពិធីបុណ្យចូលឆ្នាំថ្មី ប្រពៃណីជាតិខ្មែរ',
    titleEnglish: 'Khmer Traditional New Year',
    startDate: '2027-04-13',
    endDate: '2027-04-16',
    isAllDay: true,
    type: 'HOLIDAY',
    description: 'ឈប់សម្រាកបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិខ្មែរ រយៈពេល ៤ ថ្ងៃ',
    location: 'ទូទាំងប្រទេសកម្ពុជា',
    targetAudience: 'ALL',
    color: '#f59e0b',
    isImportant: true,
    academicYear: '2026-2027'
  },
  {
    titleKhmer: 'ទិវាពលកម្មអន្តរជាតិ ១ ឧសភា',
    titleEnglish: 'International Labour Day',
    startDate: '2027-05-01',
    endDate: '2027-05-01',
    isAllDay: true,
    type: 'HOLIDAY',
    description: 'ទិវាពលកម្មអន្តរជាតិ',
    location: 'ទូទាំងប្រទេសកម្ពុជា',
    targetAudience: 'ALL',
    color: '#f59e0b',
    isImportant: false,
    academicYear: '2026-2027'
  },
  {
    titleKhmer: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះមហាក្សត្រ',
    titleEnglish: "King Norodom Sihamoni's Birthday",
    startDate: '2027-05-14',
    endDate: '2027-05-14',
    isAllDay: true,
    type: 'HOLIDAY',
    description: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះករុណា ព្រះបាទសម្តេច ព្រះបរមនាថ នរោត្តម សីហមុនី',
    location: 'ទូទាំងប្រទេសកម្ពុជា',
    targetAudience: 'ALL',
    color: '#eab308',
    isImportant: true,
    academicYear: '2026-2027'
  },
  {
    titleKhmer: 'ពិធីបុណ្យវិសាខបូជា',
    titleEnglish: 'Visak Bochea Day',
    startDate: '2027-05-20',
    endDate: '2027-05-20',
    isAllDay: true,
    type: 'HOLIDAY',
    description: 'ទិវារំលឹកដល់ការប្រសូត ការត្រាស់ដឹង និងការបរិនិព្វានរបស់ព្រះសម្មាសម្ពុទ្ធ',
    location: 'ទូទាំងប្រទេសកម្ពុជា',
    targetAudience: 'ALL',
    color: '#f59e0b',
    isImportant: true,
    academicYear: '2026-2027'
  },
  {
    titleKhmer: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល',
    titleEnglish: 'Royal Ploughing Ceremony',
    startDate: '2027-05-24',
    endDate: '2027-05-24',
    isAllDay: true,
    type: 'HOLIDAY',
    description: 'ព្រះរាជពិធីទស្សន៍ទាយផលដំណាំកសិកម្មប្រចាំឆ្នាំ',
    location: 'ទូទាំងប្រទេសកម្ពុជា',
    targetAudience: 'ALL',
    color: '#10b981',
    isImportant: false,
    academicYear: '2026-2027'
  },
  {
    titleKhmer: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (Pchum Ben Festival)',
    titleEnglish: 'Pchum Ben Festival',
    startDate: '2026-10-08',
    endDate: '2026-10-12',
    isAllDay: true,
    type: 'HOLIDAY',
    description: 'ពិធីបុណ្យកាន់បិណ្ឌ និងភ្ជុំបិណ្ឌប្រពៃណីជាតិខ្មែរ រយៈពេល ៥ ថ្ងៃ',
    location: 'ទូទាំងប្រទេសកម្ពុជា',
    targetAudience: 'ALL',
    color: '#f59e0b',
    isImportant: true,
    academicYear: '2026-2027'
  },
  {
    titleKhmer: 'ទិវាបុណ្យឯករាជ្យជាតិ ៩ វិច្ឆិកា',
    titleEnglish: 'National Independence Day',
    startDate: '2026-11-09',
    endDate: '2026-11-09',
    isAllDay: true,
    type: 'HOLIDAY',
    description: 'ទិវាបុណ្យរំលឹកខួបនៃការទទួលបានឯករាជ្យពីប្រទេសបារាំងក្នុងឆ្នាំ ១៩៥៣',
    location: 'ទូទាំងប្រទេសកម្ពុជា',
    targetAudience: 'ALL',
    color: '#f59e0b',
    isImportant: true,
    academicYear: '2026-2027'
  },
  {
    titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប និងសំពះព្រះខែ',
    titleEnglish: 'Water and Moon Festival',
    startDate: '2026-11-23',
    endDate: '2026-11-25',
    isAllDay: true,
    type: 'HOLIDAY',
    description: 'ព្រះរាជពិធីប្រពៃណីជាតិអុំទូក បណ្តែតប្រទីប អកអំបុក និងសំពះព្រះខែ',
    location: 'រាជធានីភ្នំពេញ និងទូទាំងប្រទេស',
    targetAudience: 'ALL',
    color: '#f59e0b',
    isImportant: true,
    academicYear: '2026-2027'
  }
];

export const AcademicCalendarView: React.FC<AcademicCalendarViewProps> = ({
  events = [],
  onSaveEvent,
  onDeleteEvent,
  onSaveEventsBatch,
  userRole = 'ADMIN',
  language = 'km',
  classes = []
}) => {
  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN'].includes(userRole);

  // View state: 'grid' (month matrix), 'list' (chronological agenda), 'week' (7-day timeline)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'week'>('grid');

  // Calendar navigation state - default to current date
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 8, 4)); // Sept 2026
  const [selectedDay, setSelectedDay] = useState<string>('2026-09-04');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedAudience, setSelectedAudience] = useState<string>('ALL');

  // Modals
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [detailModalEvent, setDetailModalEvent] = useState<SchoolEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [holidaysPresetModalOpen, setHolidaysPresetModalOpen] = useState(false);
  const [selectedPresetIndices, setSelectedPresetIndices] = useState<number[]>(() => 
    CAMBODIAN_HOLIDAYS_PRESET.map((_, i) => i)
  );

  // Event Form State
  const initialFormState: Partial<SchoolEvent> = {
    titleKhmer: '',
    titleEnglish: '',
    type: 'HOLIDAY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '11:00',
    isAllDay: true,
    location: '',
    description: '',
    targetAudience: 'ALL',
    targetClass: '',
    color: '#f59e0b',
    isImportant: false,
    academicYear: '2026-2027',
    semester: 'SEMESTER_1'
  };

  const [formData, setFormData] = useState<Partial<SchoolEvent>>(initialFormState);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date(2026, 8, 4);
    setCurrentDate(today);
    setSelectedDay('2026-09-04');
  };

  // Month names
  const khmerMonths = [
    'មករា (January)', 'កុម្ភៈ (February)', 'មីនា (March)', 'មេសា (April)',
    'ឧសភា (May)', 'មិថុនា (June)', 'កក្កដា (July)', 'សីហា (August)',
    'កញ្ញា (September)', 'តុលា (October)', 'វិច្ឆិកា (November)', 'ធ្នូ (December)'
  ];

  const weekDayNames = [
    { km: 'ច័ន្ទ', en: 'Mon' },
    { km: 'អង្គារ', en: 'Tue' },
    { km: 'ពុធ', en: 'Wed' },
    { km: 'ព្រហស្បតិ៍', en: 'Thu' },
    { km: 'សុក្រ', en: 'Fri' },
    { km: 'សៅរ៍', en: 'Sat' },
    { km: 'អាទិត្យ', en: 'Sun' },
  ];

  // Helper to format ISO date string to Khmer display
  const formatKhmerDateDisplay = (isoStr: string) => {
    if (!isoStr) return '';
    try {
      const parts = isoStr.split('-');
      if (parts.length === 3) {
        const y = parts[0];
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        const mName = khmerMonths[m - 1] ? khmerMonths[m - 1].split(' ')[0] : parts[1];
        return `${d} ${mName} ${y}`;
      }
    } catch {
      // fallback
    }
    return isoStr;
  };

  // Type styling and badges
  const getTypeMeta = (type: string) => {
    switch (type) {
      case 'HOLIDAY':
        return {
          labelKm: 'ថ្ងៃឈប់សម្រាក',
          labelEn: 'Holiday',
          badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          dotColor: 'bg-amber-400',
          borderColor: '#f59e0b',
          icon: Flag
        };
      case 'EXAM':
        return {
          labelKm: 'កាលបរិច្ឆេទប្រឡង',
          labelEn: 'Examination',
          badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          dotColor: 'bg-rose-400',
          borderColor: '#ef4444',
          icon: Award
        };
      case 'EVENT':
        return {
          labelKm: 'កម្មវិធីសាលា',
          labelEn: 'School Event',
          badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          dotColor: 'bg-indigo-400',
          borderColor: '#6366f1',
          icon: Sparkles
        };
      case 'ACADEMIC':
        return {
          labelKm: 'កាលវិភាគសិក្សា',
          labelEn: 'Academic',
          badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
          dotColor: 'bg-sky-400',
          borderColor: '#0284c7',
          icon: CalendarRange
        };
      case 'CEREMONY':
      case 'FESTIVAL':
        return {
          labelKm: 'ពិធីបុណ្យ/ពិធីការ',
          labelEn: 'Ceremony/Festival',
          badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          dotColor: 'bg-purple-400',
          borderColor: '#a855f7',
          icon: Sparkles
        };
      case 'MEETING':
        return {
          labelKm: 'កិច្ចប្រជុំ',
          labelEn: 'Meeting',
          badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          dotColor: 'bg-emerald-400',
          borderColor: '#10b981',
          icon: Users
        };
      case 'SPORTS':
        return {
          labelKm: 'កីឡា',
          labelEn: 'Sports',
          badgeBg: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
          dotColor: 'bg-teal-400',
          borderColor: '#14b8a6',
          icon: Award
        };
      default:
        return {
          labelKm: 'ព្រឹត្តិការណ៍',
          labelEn: 'Event',
          badgeBg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
          dotColor: 'bg-slate-400',
          borderColor: '#64748b',
          icon: CalendarIcon
        };
    }
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchSearch = searchQuery.trim() === '' || 
        e.titleKhmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.titleEnglish && e.titleEnglish.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = selectedType === 'ALL' || e.type === selectedType;
      const matchAudience = selectedAudience === 'ALL' || e.targetAudience === selectedAudience || e.targetAudience === 'ALL';

      return matchSearch && matchType && matchAudience;
    }).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events, searchQuery, selectedType, selectedAudience]);

  // Statistics
  const stats = useMemo(() => {
    const total = events.length;
    const holidays = events.filter(e => e.type === 'HOLIDAY').length;
    const exams = events.filter(e => e.type === 'EXAM').length;
    const schoolEvents = events.filter(e => ['EVENT', 'FESTIVAL', 'CEREMONY', 'SPORTS'].includes(e.type)).length;
    const academic = events.filter(e => ['ACADEMIC', 'MEETING'].includes(e.type)).length;

    // Upcoming next event
    const todayStr = '2026-09-04';
    const upcoming = events
      .filter(e => e.startDate >= todayStr)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

    return { total, holidays, exams, schoolEvents, academic, upcoming };
  }, [events]);

  // Generate Month Grid Days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const totalDays = lastDayOfMonth.getDate();
    
    // Day of week: 0 = Sun, 1 = Mon ... 6 = Sat.
    // In Cambodia and international standard, week starts Monday (0 = Mon, ..., 6 = Sun)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes index 6

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: SchoolEvent[];
    }> = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const pDate = new Date(year, month - 1, pDay);
      const yStr = pDate.getFullYear();
      const mStr = String(pDate.getMonth() + 1).padStart(2, '0');
      const dStr = String(pDay).padStart(2, '0');
      const dateStr = `${yStr}-${mStr}-${dStr}`;

      const dayEvents = filteredEvents.filter(e => {
        return dateStr >= e.startDate && dateStr <= e.endDate;
      });

      days.push({
        dateStr,
        dayNumber: pDay,
        isCurrentMonth: false,
        isToday: dateStr === '2026-09-04',
        events: dayEvents
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;

      const dayEvents = filteredEvents.filter(e => {
        return dateStr >= e.startDate && dateStr <= e.endDate;
      });

      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === '2026-09-04',
        events: dayEvents
      });
    }

    // Next month padding to reach a complete grid of multiple of 7
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nDate = new Date(year, month + 1, d);
        const yStr = nDate.getFullYear();
        const mStr = String(nDate.getMonth() + 1).padStart(2, '0');
        const dStr = String(d).padStart(2, '0');
        const dateStr = `${yStr}-${mStr}-${dStr}`;

        const dayEvents = filteredEvents.filter(e => {
          return dateStr >= e.startDate && dateStr <= e.endDate;
        });

        days.push({
          dateStr,
          dayNumber: d,
          isCurrentMonth: false,
          isToday: dateStr === '2026-09-04',
          events: dayEvents
        });
      }
    }

    return days;
  }, [year, month, filteredEvents]);

  // Open modal to add new event
  const handleOpenAddEvent = (prefilledDate?: string) => {
    const d = prefilledDate || `${year}-${String(month + 1).padStart(2, '0')}-01`;
    setEditingEvent(null);
    setFormData({
      ...initialFormState,
      startDate: d,
      endDate: d
    });
    setEventModalOpen(true);
  };

  // Open modal to edit event
  const handleOpenEditEvent = (ev: SchoolEvent) => {
    setEditingEvent(ev);
    setFormData({ ...ev });
    setEventModalOpen(true);
  };

  // Save Event
  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleKhmer || !formData.startDate) {
      alert('សូមបញ្ចូលចំណងជើង និងកាលបរិច្ឆេទចាប់ផ្តើម!');
      return;
    }

    const eventToSave: SchoolEvent = {
      id: editingEvent ? editingEvent.id : `EV-${Date.now()}`,
      titleKhmer: formData.titleKhmer.trim(),
      titleEnglish: formData.titleEnglish?.trim() || '',
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      startTime: formData.isAllDay ? undefined : (formData.startTime || '08:00'),
      endTime: formData.isAllDay ? undefined : (formData.endTime || '11:00'),
      isAllDay: formData.isAllDay !== false,
      type: formData.type || 'HOLIDAY',
      description: formData.description?.trim() || '',
      location: formData.location?.trim() || '',
      targetAudience: formData.targetAudience || 'ALL',
      targetClass: formData.targetClass || '',
      color: formData.color || '#f59e0b',
      isImportant: !!formData.isImportant,
      academicYear: formData.academicYear || '2026-2027',
      semester: formData.semester || 'SEMESTER_1',
      createdAt: editingEvent?.createdAt || new Date().toISOString()
    };

    onSaveEvent(eventToSave);
    setEventModalOpen(false);
    setEditingEvent(null);
  };

  // Delete Event
  const handleDeleteEvent = (id: string, title: string) => {
    if (confirm(`តើអ្នកពិតជាចង់លុបព្រឹត្តិការណ៍ "${title}" នេះមែនទេ?`)) {
      if (onDeleteEvent) {
        onDeleteEvent(id);
      }
      if (detailModalEvent && detailModalEvent.id === id) {
        setDetailModalEvent(null);
      }
    }
  };

  // Import Cambodian Public Holidays batch
  const handleImportPresets = () => {
    if (!onSaveEventsBatch) {
      // Fallback one by one
      selectedPresetIndices.forEach(idx => {
        const item = CAMBODIAN_HOLIDAYS_PRESET[idx];
        if (item) {
          onSaveEvent({
            ...item,
            id: `EV-KH-${Date.now()}-${idx}`
          });
        }
      });
    } else {
      const toAdd: SchoolEvent[] = selectedPresetIndices.map((idx, i) => {
        const item = CAMBODIAN_HOLIDAYS_PRESET[idx];
        return {
          ...item,
          id: `EV-KH-${Date.now()}-${i}`
        };
      });
      onSaveEventsBatch(toAdd);
    }
    setHolidaysPresetModalOpen(false);
    alert(`បានបញ្ចូលថ្ងៃឈប់សម្រាក និងបុណ្យជាតិកម្ពុជាចំនួន ${selectedPresetIndices.length} ដោយជោគជ័យ!`);
  };

  // Export to iCal (.ics) file
  const handleExportICS = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Cambodian School Management System//Academic Calendar//KM',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Academic Calendar (ប្រតិទិនអប់រំ)',
      'X-WR-TIMEZONE:Asia/Phnom_Penh'
    ];

    events.forEach(ev => {
      const startClean = ev.startDate.replace(/-/g, '');
      // If end date is same, add 1 day for all-day ics format
      let endClean = ev.endDate ? ev.endDate.replace(/-/g, '') : startClean;

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${ev.id}@cambodianschool.edu.kh`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART;VALUE=DATE:${startClean}`,
        `DTEND;VALUE=DATE:${endClean}`,
        `SUMMARY:${ev.titleKhmer} ${ev.titleEnglish ? '(' + ev.titleEnglish + ')' : ''}`,
        `DESCRIPTION:${ev.description || ''}`,
        `LOCATION:${ev.location || 'សាលារៀន'}`,
        `CATEGORIES:${ev.type}`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `academic_calendar_${year}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Calendar View
  const handlePrint = () => {
    window.print();
  };

  // Calculate day difference relative to 2026-09-04
  const getRelativeDaysText = (dateStr: string) => {
    const today = new Date('2026-09-04').getTime();
    const target = new Date(dateStr).getTime();
    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'ថ្ងៃនេះ (Today)', color: 'text-amber-400 bg-amber-500/20' };
    if (diffDays === 1) return { text: 'ថ្ងៃស្អែក (Tomorrow)', color: 'text-emerald-400 bg-emerald-500/20' };
    if (diffDays > 1 && diffDays <= 7) return { text: `នៅសល់ ${diffDays} ថ្ងៃ (In ${diffDays}d)`, color: 'text-indigo-400 bg-indigo-500/20' };
    if (diffDays > 7) return { text: `នៅសល់ ${diffDays} ថ្ងៃ`, color: 'text-slate-400 bg-white/5' };
    return { text: `កន្លងផុត ${Math.abs(diffDays)} ថ្ងៃ`, color: 'text-slate-500 bg-white/5' };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-indigo-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
              <span>ឆ្នាំសិក្សា ២០២៦-២០២៧ • Academic Calendar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-battambang tracking-tight">
              ប្រតិទិនអប់រំ & កាលវិភាគព្រឹត្តិការណ៍
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-battambang max-w-2xl leading-relaxed">
              គ្រប់គ្រង និងតាមដានថ្ងៃឈប់សម្រាកប្រពៃណីជាតិ កាលបរិច្ឆេទប្រឡងប្រចាំឆមាស និងកម្មវិធីសាលាគ្រប់កម្រិតថ្នាក់
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isAdmin && (
              <>
                <button
                  onClick={() => setHolidaysPresetModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
                  title="បញ្ចូលថ្ងៃឈប់សម្រាកប្រពៃណី និងបុណ្យជាតិកម្ពុជា"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-battambang">បុណ្យជាតិកម្ពុជា</span>
                </button>
                <button
                  onClick={() => handleOpenAddEvent()}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-battambang">បន្ថែមព្រឹត្តិការណ៍</span>
                </button>
              </>
            )}

            <button
              onClick={handleExportICS}
              className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium flex items-center space-x-2 transition-all"
              title="ទាញយកជាឯកសារ iCal (.ics) ដើម្បី Sync ជាមួយ Google Calendar"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span className="font-battambang hidden sm:inline">Sync iCal</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium flex items-center space-x-2 transition-all"
              title="ព្រីនប្រតិទិន"
            >
              <Printer className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Quick Stats Pill Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-battambang">ថ្ងៃឈប់សម្រាក</p>
              <p className="text-lg font-bold text-white font-mono">{stats.holidays} <span className="text-xs font-normal text-slate-400">ថ្ងៃ</span></p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-battambang">កាលបរិច្ឆេទប្រឡង</p>
              <p className="text-lg font-bold text-white font-mono">{stats.exams} <span className="text-xs font-normal text-slate-400">លើក</span></p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-battambang">កម្មវិធីសាលា</p>
              <p className="text-lg font-bold text-white font-mono">{stats.schoolEvents} <span className="text-xs font-normal text-slate-400">កម្មវិធី</span></p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-400 font-battambang">ព្រឹត្តិការណ៍បន្ទាប់</p>
              <p className="text-xs font-bold text-white font-battambang truncate" title={stats.upcoming?.titleKhmer}>
                {stats.upcoming ? stats.upcoming.titleKhmer : 'គ្មាន'}
              </p>
              {stats.upcoming && (
                <p className="text-[10px] text-indigo-300 font-mono">{stats.upcoming.startDate}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Month Switcher, Search, Type Filters, View Mode Toggles */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Month Navigation & Today */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="ខែមុន"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-white text-sm sm:text-base px-3 font-battambang min-w-[170px] text-center">
              {khmerMonths[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="ខែបន្ទាប់"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3 py-2 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold font-battambang transition-colors"
          >
            ថ្ងៃនេះ
          </button>
        </div>

        {/* Filters & View Switches */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ស្វែងរកព្រឹត្តិការណ៍..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-400 focus:border-indigo-400 outline-none font-battambang"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs text-slate-200 outline-none font-battambang"
          >
            <option value="ALL" className="bg-slate-900 text-white">គ្រប់ប្រភេទ (All Types)</option>
            <option value="HOLIDAY" className="bg-slate-900 text-white">🏖️ ថ្ងៃឈប់សម្រាក (Holidays)</option>
            <option value="EXAM" className="bg-slate-900 text-white">📝 ការប្រឡង (Exams)</option>
            <option value="EVENT" className="bg-slate-900 text-white">🎉 កម្មវិធីសាលា (Events)</option>
            <option value="ACADEMIC" className="bg-slate-900 text-white">📚 កាលវិភាគសិក្សា (Academic)</option>
            <option value="MEETING" className="bg-slate-900 text-white">👥 កិច្ចប្រជុំ (Meetings)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title="ទិដ្ឋភាពក្រឡាចត្រង្គប្រចាំខែ (Month Grid)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-battambang">ក្រឡា</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title="ទិដ្ឋភាពតារាងបញ្ជី (List View)"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-battambang">បញ្ជី</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View: GRID or LIST */}
      {viewMode === 'grid' ? (
        <div className="glass-panel rounded-3xl p-4 sm:p-6 overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {weekDayNames.map((w, idx) => (
              <div 
                key={idx} 
                className={`py-2 text-xs font-bold font-battambang rounded-xl ${
                  idx >= 5 ? 'text-amber-400 bg-amber-500/5' : 'text-slate-300 bg-white/5'
                }`}
              >
                <span>{w.km}</span>
                <span className="text-[10px] text-slate-400 block font-sans font-normal">{w.en}</span>
              </div>
            ))}
          </div>

          {/* Calendar Matrix Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((cell, idx) => {
              const hasEvents = cell.events.length > 0;
              const isSelected = cell.dateStr === selectedDay;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(cell.dateStr)}
                  onDoubleClick={() => isAdmin && handleOpenAddEvent(cell.dateStr)}
                  className={`min-h-[105px] sm:min-h-[120px] p-2 rounded-2xl border transition-all flex flex-col justify-between group cursor-pointer relative ${
                    cell.isCurrentMonth
                      ? cell.isToday
                        ? 'bg-indigo-500/10 border-indigo-500/40 ring-2 ring-indigo-500/30'
                        : isSelected
                          ? 'bg-white/10 border-white/30'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15'
                      : 'bg-white/[0.02] border-white/[0.02] opacity-40 hover:opacity-70'
                  }`}
                >
                  {/* Day number & today marker */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-bold font-mono rounded-lg w-6 h-6 flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/50'
                          : cell.isCurrentMonth
                            ? 'text-slate-200'
                            : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {isAdmin && cell.isCurrentMonth && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddEvent(cell.dateStr);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white transition-all"
                        title="បន្ថែមព្រឹត្តិការណ៍ក្នុងថ្ងៃនេះ"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Events list chips inside the cell */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-[68px] no-scrollbar">
                    {cell.events.slice(0, 2).map(ev => {
                      const meta = getTypeMeta(ev.type);
                      const IconComp = meta.icon;

                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailModalEvent(ev);
                          }}
                          className={`px-1.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-medium border truncate cursor-pointer transition-transform hover:scale-[1.02] flex items-center space-x-1 ${meta.badgeBg}`}
                          title={`${ev.titleKhmer} (${meta.labelKm})`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor} shrink-0`} />
                          <span className="font-battambang truncate">{ev.titleKhmer}</span>
                        </div>
                      );
                    })}

                    {cell.events.length > 2 && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDay(cell.dateStr);
                          setViewMode('list');
                        }}
                        className="text-[10px] text-indigo-300 font-semibold px-1 hover:underline cursor-pointer"
                      >
                        +{cell.events.length - 2} ទៀត...
                      </div>
                    )}
                  </div>

                  {/* Footer indicator if multi-day or exam */}
                  <div className="h-1 flex items-center space-x-0.5">
                    {cell.events.some(e => e.type === 'EXAM') && (
                      <span className="w-full h-0.5 bg-rose-500 rounded-full" />
                    )}
                    {cell.events.some(e => e.type === 'HOLIDAY') && (
                      <span className="w-full h-0.5 bg-amber-500 rounded-full" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend Guide */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10 text-xs text-slate-400 font-battambang">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-300 font-semibold">សម្គាល់ពណ៌:</span>
              <span className="inline-flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>ថ្ងៃឈប់សម្រាក (Holidays)</span>
              </span>
              <span className="inline-flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>ការប្រឡង (Examinations)</span>
              </span>
              <span className="inline-flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                <span>កម្មវិធីសាលា (School Events)</span>
              </span>
              <span className="inline-flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span>កាលវិភាគសិក្សា (Academic)</span>
              </span>
            </div>

            <span className="text-[11px] text-slate-400">
              ចុចពីរដង (Double click) លើកាលបរិច្ឆេទដើម្បីបង្កើតព្រឹត្តិការណ៍ថ្មី
            </span>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
              <CalendarIcon className="w-12 h-12 text-slate-500 mx-auto stroke-1" />
              <p className="text-slate-300 font-battambang text-base font-semibold">
                មិនមានព្រឹត្តិការណ៍ ឬកាលបរិច្ឆេទក្នុងលក្ខខណ្ឌស្វែងរកនេះទេ
              </p>
              <p className="text-slate-400 text-xs font-battambang">
                សូមផ្លាស់ប្តូរពាក្យស្វែងរក ឬប្រភេទតម្រងឡើងវិញ
              </p>
              {isAdmin && (
                <button
                  onClick={() => handleOpenAddEvent()}
                  className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold font-battambang"
                >
                  + បង្កើតព្រឹត្តិការណ៍ថ្មី
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map(ev => {
                const meta = getTypeMeta(ev.type);
                const IconComp = meta.icon;
                const relTime = getRelativeDaysText(ev.startDate);

                return (
                  <div
                    key={ev.id}
                    onClick={() => setDetailModalEvent(ev)}
                    className="glass-panel rounded-3xl p-5 border border-white/10 hover:border-white/20 transition-all hover:shadow-xl cursor-pointer group flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Bar: Date badge, Type badge, Relative Days */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono border ${meta.badgeBg}`}>
                            <span className="text-sm font-black leading-none">{ev.startDate.split('-')[2]}</span>
                            <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">
                              {ev.startDate.split('-')[1]}
                            </span>
                          </div>

                          <div>
                            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.badgeBg}`}>
                              <IconComp className="w-3 h-3" />
                              <span className="font-battambang">{meta.labelKm}</span>
                            </span>
                            <h3 className="font-bold text-white font-battambang text-sm mt-1 leading-snug group-hover:text-indigo-300 transition-colors">
                              {ev.titleKhmer}
                            </h3>
                            {ev.titleEnglish && (
                              <p className="text-[11px] text-slate-400 font-sans">{ev.titleEnglish}</p>
                            )}
                          </div>
                        </div>

                        <span className={`px-2 py-1 rounded-xl text-[10px] font-semibold font-battambang whitespace-nowrap ${relTime.color}`}>
                          {relTime.text}
                        </span>
                      </div>

                      {/* Description */}
                      {ev.description && (
                        <p className="text-xs text-slate-300 font-battambang mt-3 line-clamp-2 leading-relaxed bg-white/[0.02] p-2.5 rounded-2xl border border-white/5">
                          {ev.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Info: Duration, Location, Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400 font-battambang">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 text-slate-300 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>
                            {ev.isAllDay ? 'ពេញមួយថ្ងៃ' : `${ev.startTime || ''} - ${ev.endTime || ''}`}
                          </span>
                        </div>

                        {ev.location && (
                          <div className="flex items-center space-x-1 text-slate-400 text-[11px] truncate max-w-[120px]">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </div>
                        )}
                      </div>

                      {isAdmin && (
                        <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenEditEvent(ev)}
                            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="កែប្រែ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev.id, ev.titleKhmer)}
                            className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                            title="លុប"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {detailModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-white/20 shadow-2xl relative space-y-5 bg-slate-900/95">
            <button
              onClick={() => setDetailModalEvent(null)}
              className="absolute top-5 right-5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-2">
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getTypeMeta(detailModalEvent.type).badgeBg}`}>
                <span className={`w-2 h-2 rounded-full ${getTypeMeta(detailModalEvent.type).dotColor}`} />
                <span className="font-battambang">{getTypeMeta(detailModalEvent.type).labelKm}</span>
              </span>
              <h2 className="text-xl font-bold text-white font-battambang leading-tight">
                {detailModalEvent.titleKhmer}
              </h2>
              {detailModalEvent.titleEnglish && (
                <p className="text-xs text-slate-400 font-sans">{detailModalEvent.titleEnglish}</p>
              )}
            </div>

            {/* Grid of details */}
            <div className="grid grid-cols-2 gap-3 text-xs font-battambang">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">កាលបរិច្ឆេទចាប់ផ្តើម:</span>
                <p className="font-semibold text-white font-mono flex items-center space-x-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{detailModalEvent.startDate}</span>
                </p>
                <span className="text-[10px] text-indigo-300 block">
                  {formatKhmerDateDisplay(detailModalEvent.startDate)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">កាលបរិច្ឆេទបញ្ចប់:</span>
                <p className="font-semibold text-white font-mono flex items-center space-x-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{detailModalEvent.endDate || detailModalEvent.startDate}</span>
                </p>
                <span className="text-[10px] text-indigo-300 block">
                  {formatKhmerDateDisplay(detailModalEvent.endDate || detailModalEvent.startDate)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">ពេលវេលា:</span>
                <p className="font-semibold text-white flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{detailModalEvent.isAllDay ? 'ពេញមួយថ្ងៃ (All Day)' : `${detailModalEvent.startTime} - ${detailModalEvent.endTime}`}</span>
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] block">ទីតាំង:</span>
                <p className="font-semibold text-white flex items-center space-x-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{detailModalEvent.location || 'ទីធ្លាសាលារៀន'}</span>
                </p>
              </div>
            </div>

            {/* Description */}
            {detailModalEvent.description && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 text-xs font-battambang">
                <span className="text-slate-400 text-[11px] block">ពិពណ៌នាលម្អិត:</span>
                <p className="text-slate-200 leading-relaxed">{detailModalEvent.description}</p>
              </div>
            )}

            {/* Audience & Target */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-battambang pt-2">
              <div className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>
                  ក្រុមគោលដៅ: <strong className="text-white">
                    {detailModalEvent.targetAudience === 'ALL' ? 'សាលាទាំងមូល (All School)' : 
                     detailModalEvent.targetAudience === 'TEACHERS' ? 'លោកគ្រូ-អ្នកគ្រូ (Teachers)' : 
                     detailModalEvent.targetAudience === 'STUDENTS' ? 'សិស្សានុសិស្ស (Students)' : 'អាណាព្យាបាល (Parents)'}
                  </strong>
                </span>
              </div>

              {detailModalEvent.academicYear && (
                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 font-mono text-[11px]">
                  {detailModalEvent.academicYear}
                </span>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-white/10 font-battambang">
              {isAdmin && (
                <>
                  <button
                    onClick={() => {
                      const ev = detailModalEvent;
                      setDetailModalEvent(null);
                      handleOpenEditEvent(ev);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center space-x-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>កែប្រែ</span>
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(detailModalEvent.id, detailModalEvent.titleKhmer)}
                    className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-2xl text-xs font-bold flex items-center space-x-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>លុប</span>
                  </button>
                </>
              )}
              <button
                onClick={() => setDetailModalEvent(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-200 rounded-2xl text-xs font-bold"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel w-full max-w-xl rounded-3xl p-6 sm:p-7 border border-white/20 shadow-2xl relative my-8 bg-slate-900/95 space-y-6">
            <button
              onClick={() => setEventModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white font-battambang">
                {editingEvent ? 'កែប្រែព្រឹត្តិការណ៍ / ថ្ងៃឈប់សម្រាក' : 'បន្ថែមព្រឹត្តិការណ៍ / ថ្ងៃឈប់សម្រាកថ្មី'}
              </h2>
              <p className="text-xs text-slate-400 font-battambang">
                សូមបំពេញព័ត៌មានលម្អិតអំពីថ្ងៃឈប់សម្រាក ការប្រឡង ឬកម្មវិធីសាលា
              </p>
            </div>

            <form onSubmit={handleSubmitEvent} className="space-y-4 font-battambang">
              {/* Event Type & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">ប្រភេទព្រឹត្តិការណ៍*</label>
                  <select
                    required
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-slate-200 focus:border-indigo-400 outline-none"
                  >
                    <option value="HOLIDAY" className="bg-slate-900 text-white">🏖️ ថ្ងៃឈប់សម្រាក (Holiday)</option>
                    <option value="EXAM" className="bg-slate-900 text-white">📝 កាលបរិច្ឆេទប្រឡង (Examination)</option>
                    <option value="EVENT" className="bg-slate-900 text-white">🎉 កម្មវិធីសាលា (School Event)</option>
                    <option value="ACADEMIC" className="bg-slate-900 text-white">📚 កាលវិភាគសិក្សា (Academic Milestone)</option>
                    <option value="CEREMONY" className="bg-slate-900 text-white">🏛️ ពិធីការ / បវេសនកាល (Ceremony)</option>
                    <option value="MEETING" className="bg-slate-900 text-white">👥 កិច្ចប្រជុំគ្រូ/អាណាព្យាបាល (Meeting)</option>
                    <option value="SPORTS" className="bg-slate-900 text-white">⚽ កីឡាសាលា (Sports Day)</option>
                    <option value="GRADUATION" className="bg-slate-900 text-white">🎓 ពិធីចែកសញ្ញាបត្រ (Graduation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">ក្រុមគោលដៅ*</label>
                  <select
                    value={formData.targetAudience}
                    onChange={e => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-slate-200 focus:border-indigo-400 outline-none"
                  >
                    <option value="ALL" className="bg-slate-900 text-white">សាលាទាំងមូល (All School)</option>
                    <option value="STUDENTS" className="bg-slate-900 text-white">សិស្សានុសិស្ស (Students)</option>
                    <option value="TEACHERS" className="bg-slate-900 text-white">លោកគ្រូ-អ្នកគ្រូ (Teachers)</option>
                    <option value="PARENTS" className="bg-slate-900 text-white">អាណាព្យាបាល (Parents)</option>
                  </select>
                </div>
              </div>

              {/* Title Khmer & English */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    ចំណងជើងជាភាសាខ្មែរ*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧ. ពិធីបុណ្យភ្ជុំបិណ្ឌ ឬ ការប្រឡងឆមាសទី១"
                    value={formData.titleKhmer || ''}
                    onChange={e => setFormData({ ...formData, titleKhmer: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:border-indigo-400 outline-none placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    ចំណងជើងជាភាសាអង់គ្លេស (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pchum Ben Festival or Semester 1 Final Exams"
                    value={formData.titleEnglish || ''}
                    onChange={e => setFormData({ ...formData, titleEnglish: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:border-indigo-400 outline-none placeholder-slate-500 font-sans"
                  />
                </div>
              </div>

              {/* Date Ranges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">កាលបរិច្ឆេទចាប់ផ្តើម*</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate || ''}
                    onChange={e => setFormData({ 
                      ...formData, 
                      startDate: e.target.value,
                      endDate: formData.endDate && formData.endDate >= e.target.value ? formData.endDate : e.target.value
                    })}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:border-indigo-400 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">កាលបរិច្ឆេទបញ្ចប់*</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate || formData.startDate || ''}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:border-indigo-400 outline-none font-mono"
                  />
                </div>
              </div>

              {/* All day toggle & times */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-200 font-semibold">ព្រឹត្តិការណ៍ពេញមួយថ្ងៃ (All Day)</span>
                  <input
                    type="checkbox"
                    checked={formData.isAllDay !== false}
                    onChange={e => setFormData({ ...formData, isAllDay: e.target.checked })}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>

                {!formData.isAllDay && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">ម៉ោងចាប់ផ្តើម</label>
                      <input
                        type="time"
                        value={formData.startTime || '08:00'}
                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">ម៉ោងបញ្ចប់</label>
                      <input
                        type="time"
                        value={formData.endTime || '11:00'}
                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white font-mono outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Location & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">ទីតាំង / បន្ទប់</label>
                  <input
                    type="text"
                    placeholder="ឧ. សាលប្រជុំធំ ឬ បន្ទប់ប្រឡង A1"
                    value={formData.location || ''}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:border-indigo-400 outline-none placeholder-slate-500"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.isImportant}
                      onChange={e => setFormData({ ...formData, isImportant: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="text-xs text-amber-300 font-semibold">សម្គាល់ជាព្រឹត្តិការណ៍សំខាន់</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">ពិពណ៌នាលម្អិត</label>
                <textarea
                  rows={3}
                  placeholder="បញ្ជាក់ព័ត៌មានបន្ថែមសម្រាប់សិស្ស គ្រូ ឬអាណាព្យាបាល..."
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:border-indigo-400 outline-none placeholder-slate-500 leading-relaxed"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-slate-300 rounded-2xl text-xs font-bold transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-colors shadow-lg shadow-indigo-600/30"
                >
                  {editingEvent ? 'រក្សាទុកការកែប្រែ' : 'បញ្ចូលព្រឹត្តិការណ៍'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cambodian Public Holidays Preset Import Modal */}
      {holidaysPresetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-7 border border-white/20 shadow-2xl relative my-8 bg-slate-900/95 space-y-5">
            <button
              onClick={() => setHolidaysPresetModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Cambodian Public Holidays Presets</span>
              </div>
              <h2 className="text-xl font-bold text-white font-battambang">
                បញ្ចូលថ្ងៃឈប់សម្រាកប្រពៃណី និងបុណ្យជាតិកម្ពុជា
              </h2>
              <p className="text-xs text-slate-300 font-battambang">
                ជ្រើសរើសថ្ងៃឈប់សម្រាកជាតិផ្លូវការ ដើម្បីបញ្ចូលទៅក្នុងប្រតិទិនអប់រំសាលាដោយស្វ័យប្រវត្តិ
              </p>
            </div>

            {/* Select all / Deselect all */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-battambang pt-2">
              <span>បានជ្រើសរើស: <strong className="text-amber-400">{selectedPresetIndices.length}</strong> / {CAMBODIAN_HOLIDAYS_PRESET.length}</span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedPresetIndices(CAMBODIAN_HOLIDAYS_PRESET.map((_, i) => i))}
                  className="text-indigo-400 hover:underline"
                >
                  ជ្រើសទាំងអស់
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setSelectedPresetIndices([])}
                  className="text-slate-400 hover:underline"
                >
                  ដោះទាំងអស់
                </button>
              </div>
            </div>

            {/* List of holidays */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {CAMBODIAN_HOLIDAYS_PRESET.map((h, index) => {
                const isChecked = selectedPresetIndices.includes(index);

                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (isChecked) {
                        setSelectedPresetIndices(selectedPresetIndices.filter(i => i !== index));
                      } else {
                        setSelectedPresetIndices([...selectedPresetIndices, index]);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-amber-500 border-amber-500 text-slate-900' : 'border-white/20'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div>
                        <p className="font-bold font-battambang text-xs text-white">
                          {h.titleKhmer}
                        </p>
                        <p className="text-[11px] text-slate-400 font-sans">{h.titleEnglish}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs text-amber-300 font-semibold block">
                        {h.startDate}
                      </span>
                      {h.startDate !== h.endDate && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          ដល់ {h.endDate}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-white/10 font-battambang">
              <button
                type="button"
                onClick={() => setHolidaysPresetModalOpen(false)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-slate-300 rounded-2xl text-xs font-bold transition-colors"
              >
                បោះបង់
              </button>
              <button
                type="button"
                disabled={selectedPresetIndices.length === 0}
                onClick={handleImportPresets}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-2xl text-xs font-bold transition-colors shadow-lg shadow-amber-500/20 flex items-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>បញ្ចូល {selectedPresetIndices.length} ថ្ងៃឈប់សម្រាក</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
