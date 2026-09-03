import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Student, ClassRoom, Gender, StudentStatus } from '../types';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Trash2, 
  Check, 
  Search, 
  RefreshCw, 
  ArrowRight,
  Sparkles,
  Users,
  Eye,
  FileCheck
} from 'lucide-react';

interface StudentExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoom[];
  academicYear: string;
  existingStudentsCount: number;
  onImportSuccess: (importedStudents: Student[], mode: 'APPEND' | 'REPLACE') => void;
}

interface ParsedStudentRow {
  index: number;
  raw: Record<string, any>;
  khmer_name: string;
  english_name: string;
  sex: string;
  age: string | number;
  grade: string;
  date_of_birth: string;
  rlc: string;
  phone_number: string;
  contributions: string | number;
  remark: string;
  orther: string;
  books: string;
  time_study: string;
  status: string;
  semester: string;
  payment_by: string;
  
  // Normalized & validated mapping
  mappedStudent: Student;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  selected: boolean;
}

export const StudentExcelImportModal: React.FC<StudentExcelImportModalProps> = ({
  isOpen,
  onClose,
  classes,
  academicYear,
  existingStudentsCount,
  onImportSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [importMode, setImportMode] = useState<'APPEND' | 'REPLACE'>('APPEND');
  const [searchPreview, setSearchPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importCompletedCount, setImportCompletedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Expected 16 headers according to user's exact field specification
  const EXPECTED_HEADERS = [
    'khmer_name',
    'english_name',
    'sex',
    'age',
    'grade',
    'date_of_birth',
    'rlc',
    'phone_number',
    'contributions',
    'remark',
    'orther',
    'books',
    'time_study',
    'status',
    'semester',
    'payment_by'
  ];

  // Helper to format Excel Date serials or strings to YYYY-MM-DD
  const parseExcelDate = (val: any): string => {
    if (!val) return '2008-01-01';
    if (typeof val === 'number') {
      // Excel serial date to JS Date
      const date = new Date(Math.round((val - (25567 + 2)) * 86400 * 1000));
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    const str = String(val).trim();
    // Check if DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }
    // Check if YYYY-MM-DD
    const ymdMatch = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
    if (ymdMatch) {
      const year = ymdMatch[1];
      const month = ymdMatch[2].padStart(2, '0');
      const day = ymdMatch[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return str || '2008-01-01';
  };

  // Helper to normalize gender
  const normalizeGender = (val: any): Gender => {
    if (!val) return 'MALE';
    const s = String(val).trim().toUpperCase();
    if (s === 'FEMALE' || s === 'F' || s.includes('ស្រី') || s === 'GIRL') return 'FEMALE';
    return 'MALE';
  };

  // Helper to normalize student status
  const normalizeStatus = (val: any): StudentStatus => {
    if (!val) return 'ACTIVE';
    const s = String(val).trim().toUpperCase();
    if (s.includes('INACTIVE') || s.includes('អសកម្ម') || s.includes('ផ្អាក')) return 'INACTIVE';
    if (s.includes('GRADUATED') || s.includes('បញ្ចប់')) return 'GRADUATED';
    if (s.includes('TRANSFERRED') || s.includes('ផ្ទេរ')) return 'TRANSFERRED';
    if (s.includes('SUSPENDED')) return 'SUSPENDED';
    return 'ACTIVE';
  };

  // Find or match appropriate Class
  const findMatchingClass = (gradeVal: string, rlcVal: string, timeVal: string): ClassRoom => {
    const cleanGrade = String(gradeVal || '').trim();
    const cleanRlc = String(rlcVal || '').trim().toLowerCase();
    const cleanTime = String(timeVal || '').trim().toLowerCase();

    // Match by Computer / Lab
    if (cleanGrade.toLowerCase().includes('comp') || cleanGrade.includes('កុំព្យូទ័រ') || cleanRlc.includes('comp') || cleanRlc.includes('lab')) {
      const compClass = classes.find(c => c.grade === 'Computer') || classes.find(c => c.id.includes('COMP'));
      if (compClass) return compClass;
    }

    // Match by exact grade number
    if (cleanGrade) {
      const matchedByGrade = classes.find(c => c.grade === cleanGrade || c.name.includes(cleanGrade));
      if (matchedByGrade) return matchedByGrade;
    }

    // Match by RLC code
    if (cleanRlc) {
      const matchedByRlc = classes.find(c => c.id.toLowerCase() === cleanRlc || c.name.toLowerCase().includes(cleanRlc));
      if (matchedByRlc) return matchedByRlc;
    }

    // Default fallback to first class
    return classes[0] || {
      id: 'CLS-12A',
      name: 'ថ្នាក់ទី១២ A',
      grade: '12',
      academicYear: academicYear,
      room: 'បន្ទប់ ១០១',
      capacity: 35,
      shift: 'MORNING',
      status: 'ACTIVE'
    };
  };

  // Download Sample Excel Template with exact 16 fields
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        khmer_name: 'សួស សុខា',
        english_name: 'Sous Sokha',
        sex: 'ប្រុស',
        age: 18,
        grade: '12',
        date_of_birth: '2008-05-15',
        rlc: 'RLC-12A',
        phone_number: '012 345 678',
        contributions: '$50.00',
        remark: 'សិស្សឆ្នើមផ្នែកគណិតវិទ្យា',
        orther: 'ប្អូនបង្កើតសិស្សចាស់',
        books: 'បានទទួលសៀវភៅពុម្ពពេញលេញ',
        time_study: '07:30 - 11:00 (វេនព្រឹក)',
        status: 'ACTIVE',
        semester: 'ឆមាសទី១',
        payment_by: 'ABA Bank'
      },
      {
        khmer_name: 'ឈៀង រដ្ឋា',
        english_name: 'Chheang Ratha',
        sex: 'ស្រី',
        age: 17,
        grade: '11',
        date_of_birth: '2009-08-20',
        rlc: 'RLC-11B',
        phone_number: '098 765 432',
        contributions: '$50.00',
        remark: 'ប្រធានក្រុមបច្ចេកវិទ្យា',
        orther: 'ស្នាក់នៅសង្កាត់ទួលទំពូង',
        books: 'បានទទួល ៤ ក្បាល',
        time_study: '13:30 - 17:00 (វេនរសៀល)',
        status: 'ACTIVE',
        semester: 'ឆមាសទី១',
        payment_by: 'Bakong KHQR'
      },
      {
        khmer_name: 'កែវ សោភា',
        english_name: 'Keo Sophea',
        sex: 'ស្រី',
        age: 16,
        grade: 'Computer',
        date_of_birth: '2010-03-12',
        rlc: 'CLS-COMP-A',
        phone_number: '017 889 900',
        contributions: '$35.00',
        remark: 'រៀនវគ្គ Photoshop & Coding Scratch',
        orther: 'អាហារូបករណ៍ ៥០%',
        books: 'សៀវភៅ IT 2026',
        time_study: '07:30 - 11:00',
        status: 'ACTIVE',
        semester: 'ឆមាសទី១',
        payment_by: 'Cash (សាច់ប្រាក់)'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: EXPECTED_HEADERS });
    
    // Set column widths for readability
    const colWidths = EXPECTED_HEADERS.map(h => ({ wch: Math.max(h.length + 4, 16) }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students_Import');
    
    XLSX.writeFile(workbook, `គំរូនាំចូលសិស្ស_Excel_Template_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Process Excel / CSV file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
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
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = (uploadedFile: File) => {
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setIsLoading(true);
    setImportCompletedCount(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse to JSON array of objects
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          alert('ឯកសារ Excel នេះគ្មានទិន្នន័យជួរដេកឡើយ!');
          setIsLoading(false);
          return;
        }

        // Map and normalize each row
        const mappedRows: ParsedStudentRow[] = rawJson.map((row, idx) => {
          // Normalize key lookups (case-insensitive and trim)
          const getVal = (possibleKeys: string[]): any => {
            for (const key of possibleKeys) {
              const matchedKey = Object.keys(row).find(
                k => k.trim().toLowerCase() === key.toLowerCase() ||
                     k.trim().toLowerCase().replace(/[\s_-]+/g, '') === key.replace(/[\s_-]+/g, '')
              );
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
                return row[matchedKey];
              }
            }
            return '';
          };

          const khmer_name = String(getVal(['khmer_name', 'khmer name', 'name_khmer', 'ឈ្មោះខ្មែរ', 'ឈ្មោះជាភាសាខ្មែរ', 'គោត្តនាមនិងនាម'])).trim();
          const english_name = String(getVal(['english_name', 'english name', 'name_english', 'ឈ្មោះឡាតាំង', 'ឈ្មោះអង់គ្លេស', 'latin_name'])).trim();
          const sex = String(getVal(['sex', 'gender', 'ភេទ'])).trim();
          const age = getVal(['age', 'អាយុ']);
          const grade = String(getVal(['grade', 'ថ្នាក់', 'កម្រិតថ្នាក់', 'class_grade'])).trim();
          const date_of_birth = parseExcelDate(getVal(['date_of_birth', 'date of birth', 'dob', 'ថ្ងៃខែឆ្នាំកំណើត', 'ថ្ងៃកំណើត']));
          const rlc = String(getVal(['rlc', 'rlc_code', 'អត្តលេខបន្ទប់', 'លេខសម្គាល់បន្ទប់'])).trim();
          const phone_number = String(getVal(['phone_number', 'phone', 'telephone', 'ទូរស័ព្ទ', 'លេខទូរស័ព្ទ'])).trim();
          const contributions = getVal(['contributions', 'contribution', 'fees', 'វិភាគទាន', 'បង់ថ្លៃសិក្សា', 'តម្លៃសិក្សា']);
          const remark = String(getVal(['remark', 'remarks', 'note', 'notes', 'ចំណាំ', 'ផ្សេងៗ'])).trim();
          const orther = String(getVal(['orther', 'other', 'ព័ត៌មានផ្សេងៗ'])).trim();
          const books = String(getVal(['books', 'book', 'សៀវភៅ', 'សៀវភៅពុម្ព'])).trim();
          const time_study = String(getVal(['time_study', 'time study', 'study_time', 'shift', 'ម៉ោងសិក្សា', 'វេនសិក្សា'])).trim();
          const status = String(getVal(['status', 'ស្ថានភាព', 'ស្ថានភាពសិស្ស'])).trim();
          const semester = String(getVal(['semester', 'ឆមាស', 'ឆមាសទី'])).trim();
          const payment_by = String(getVal(['payment_by', 'payment by', 'paid_by', 'payment_method', 'បង់តាម'])).trim();

          const errors: string[] = [];
          const warnings: string[] = [];

          if (!khmer_name) {
            errors.push('ខ្វះឈ្មោះជាភាសាខ្មែរ (khmer_name is required)');
          }

          if (!phone_number) {
            warnings.push('គ្មានលេខទូរស័ព្ទទំនាក់ទំនង');
          }

          const matchedClass = findMatchingClass(grade, rlc, time_study);
          const studentGender = normalizeGender(sex);
          const studentStatus = normalizeStatus(status);
          const nextIndex = existingStudentsCount + idx + 1;
          const generatedCode = `STU-2026-${String(nextIndex).padStart(5, '0')}`;

          const studentObj: Student = {
            id: `STU-IMP-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            studentCode: generatedCode,
            nameKhmer: khmer_name || `សិស្សថ្មី #${idx + 1}`,
            nameEnglish: english_name || '',
            gender: studentGender,
            dob: date_of_birth,
            pob: 'រាជធានីភ្នំពេញ',
            nationality: 'ខ្មែរ (Cambodian)',
            address: orther || 'រាជធានីភ្នំពេញ',
            province: 'រាជធានីភ្នំពេញ',
            phone: phone_number || '',
            photo: studentGender === 'FEMALE' 
              ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
            grade: grade || matchedClass.grade || '12',
            classId: matchedClass.id,
            className: matchedClass.name,
            academicYear: academicYear,
            status: studentStatus,
            enrollmentDate: new Date().toISOString().split('T')[0],
            emergencyContact: phone_number || '',
            parentNameKhmer: '',
            parentPhone: phone_number || '',

            // Exact User Fields
            age: age || '',
            rlc: rlc || '',
            contributions: contributions || '',
            remark: remark || '',
            orther: orther || '',
            books: books || '',
            timeStudy: time_study || '',
            time_study: time_study || '',
            semester: semester || 'ឆមាសទី១',
            paymentBy: payment_by || '',
            payment_by: payment_by || ''
          };

          return {
            index: idx + 1,
            raw: row,
            khmer_name,
            english_name,
            sex,
            age,
            grade,
            date_of_birth,
            rlc,
            phone_number,
            contributions,
            remark,
            orther,
            books,
            time_study,
            status,
            semester,
            payment_by,
            mappedStudent: studentObj,
            isValid: errors.length === 0,
            errors,
            warnings,
            selected: errors.length === 0
          };
        });

        setParsedRows(mappedRows);
        setIsLoading(false);
      } catch (err) {
        console.error('Error parsing Excel file:', err);
        alert('មានបញ្ហាក្នុងការអានឯកសារ Excel! សូមពិនិត្យមើលទ្រង់ទ្រាយឯកសារឡើងវិញ។');
        setIsLoading(false);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleToggleSelectAll = (check: boolean) => {
    setParsedRows(prev => prev.map(r => r.isValid ? { ...r, selected: check } : r));
  };

  const handleToggleRow = (idx: number) => {
    setParsedRows(prev => prev.map(r => r.index === idx ? { ...r, selected: !r.selected } : r));
  };

  const handleRemoveRow = (idx: number) => {
    setParsedRows(prev => prev.filter(r => r.index !== idx));
  };

  const handleReset = () => {
    setFile(null);
    setFileName('');
    setParsedRows([]);
    setImportCompletedCount(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImport = () => {
    const selectedToImport = parsedRows.filter(r => r.selected && r.isValid).map(r => r.mappedStudent);
    if (selectedToImport.length === 0) {
      alert('សូមជ្រើសរើសយ៉ាងហោចណាស់សិស្សម្នាក់ដែលមានទិន្នន័យត្រឹមត្រូវដើម្បីនាំចូល!');
      return;
    }

    onImportSuccess(selectedToImport, importMode);
    setImportCompletedCount(selectedToImport.length);

    setTimeout(() => {
      onClose();
      handleReset();
    }, 1200);
  };

  const selectedCount = parsedRows.filter(r => r.selected).length;
  const validCount = parsedRows.filter(r => r.isValid).length;
  const errorCount = parsedRows.filter(r => !r.isValid).length;

  const filteredPreviewRows = parsedRows.filter(r => {
    if (!searchPreview) return true;
    const query = searchPreview.toLowerCase();
    return (
      r.khmer_name.toLowerCase().includes(query) ||
      r.english_name.toLowerCase().includes(query) ||
      String(r.phone_number).includes(query) ||
      String(r.grade).toLowerCase().includes(query) ||
      String(r.rlc).toLowerCase().includes(query)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-battambang flex items-center gap-2">
                <span>នាំចូលទិន្នន័យសិស្សពី Excel (Import Students)</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  16 Fields Supported
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-battambang">
                គាំទ្រឯកសារ .xlsx, .xls, .csv ស្របតាមក្បាលតារាង: khmer_name, english_name, sex, age, grade, date_of_birth, rlc, phone_number, contributions, remark, orther, books, time_study, status, semester, payment_by
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-battambang transition shadow-sm"
              title="ទាញយកឯកសារគំរូ Excel ដែលមាន Field ទាំង ១៦"
            >
              <Download className="w-4 h-4" />
              <span>ទាញយកគំរូ Excel (Template)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

          {/* Success Banner if finished */}
          {importCompletedCount !== null && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center space-x-3 font-battambang animate-bounce">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
              <div>
                <strong className="block text-sm font-bold">នាំចូលទិន្នន័យបានជោគជ័យ!</strong>
                <span className="text-xs text-emerald-200">បានបញ្ចូលសិស្សចំនួន {importCompletedCount} នាក់ទៅក្នុងប្រព័ន្ធរួចរាល់។</span>
              </div>
            </div>
          )}

          {/* Upload Dropzone Section if no file loaded */}
          {!file && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 md:p-10 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-white/15 hover:border-cyan-500/50 hover:bg-white/5 bg-slate-950/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl">
                  <Upload className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white font-battambang">
                    ចុចទីនេះ ឬអូសទម្លាក់ឯកសារ Excel (Drag & Drop)
                  </h4>
                  <p className="text-xs text-slate-400 font-battambang">
                    គាំទ្រប្រភេទឯកសារ Microsoft Excel (.xlsx, .xls) និង CSV (.csv)
                  </p>
                </div>

                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/10 text-[11px] text-slate-300 font-mono border border-white/10">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ស្គាល់ Field ដោយស្វ័យប្រវត្ត: khmer_name, english_name, sex, age, grade, date_of_birth...</span>
                </div>
              </div>

              {/* Supported Fields Legend Chips */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 font-battambang flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>តារាងឈ្មោះ Field ទាំង ១៦ ដែលប្រព័ន្ធទទួលស្គាល់ (Recognized Column Headers):</span>
                  </span>
                  <button
                    onClick={handleDownloadTemplate}
                    className="text-[11px] text-cyan-300 hover:underline font-battambang"
                  >
                    + ទាញយកគំរូស្រាប់ (Sample File)
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {EXPECTED_HEADERS.map((h, i) => (
                    <span
                      key={h}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 text-[11px] font-mono text-cyan-300"
                    >
                      <strong className="text-slate-400 mr-1">{i + 1}.</strong>{h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Parsed Live Preview Section */}
          {file && (
            <div className="space-y-4">
              
              {/* File Info Bar and Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs sm:text-sm font-mono truncate max-w-xs sm:max-w-md">
                      {fileName}
                    </h5>
                    <div className="flex items-center space-x-3 text-[11px] font-battambang text-slate-400 mt-0.5">
                      <span>សរុប: <strong className="text-white font-mono">{parsedRows.length}</strong> ជួរ</span>
                      <span>ត្រឹមត្រូវ: <strong className="text-emerald-400 font-mono">{validCount}</strong></span>
                      {errorCount > 0 && <span>កំហុស: <strong className="text-rose-400 font-mono">{errorCount}</strong></span>}
                      <span>បានជ្រើសរើស: <strong className="text-cyan-400 font-mono">{selectedCount}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-battambang transition border border-white/10"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>ប្តូរឯកសារថ្មី</span>
                  </button>
                </div>
              </div>

              {/* Import Options & Search Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Search in parsed rows */}
                <div className="relative md:col-span-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchPreview}
                    onChange={e => setSearchPreview(e.target.value)}
                    placeholder="ស្វែងរកក្នុងទិន្នន័យ Preview..."
                    className="w-full pl-9 pr-3 py-2 bg-white/5 text-xs text-white placeholder-slate-400 rounded-xl border border-white/10 focus:border-cyan-400 outline-none"
                  />
                </div>

                {/* Import Mode Radio Selectors */}
                <div className="md:col-span-2 flex items-center justify-end space-x-3 text-xs font-battambang">
                  <span className="text-slate-400">របៀបនាំចូល:</span>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'APPEND'}
                      onChange={() => setImportMode('APPEND')}
                      className="text-cyan-500 focus:ring-0"
                    />
                    <span className="text-slate-200 font-medium">បន្ថែមបន្ត (Append)</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'REPLACE'}
                      onChange={() => setImportMode('REPLACE')}
                      className="text-rose-500 focus:ring-0"
                    />
                    <span className="text-slate-200 font-medium">ជំនួសទាំងអស់ (Replace All)</span>
                  </label>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950/60 max-h-80 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-900 border-b border-white/10 text-slate-300 font-battambang z-10">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCount === validCount && validCount > 0}
                          onChange={e => handleToggleSelectAll(e.target.checked)}
                          className="rounded text-cyan-500"
                        />
                      </th>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">ឈ្មោះខ្មែរ (khmer_name)</th>
                      <th className="py-2.5 px-3">ឈ្មោះឡាតាំង (english_name)</th>
                      <th className="py-2.5 px-3 text-center">ភេទ (sex)</th>
                      <th className="py-2.5 px-3 text-center">អាយុ (age)</th>
                      <th className="py-2.5 px-3 text-center">ថ្នាក់ (grade)</th>
                      <th className="py-2.5 px-3">ថ្ងៃខែឆ្នាំកំណើត (dob)</th>
                      <th className="py-2.5 px-3">RLC (rlc)</th>
                      <th className="py-2.5 px-3">ទូរស័ព្ទ (phone_number)</th>
                      <th className="py-2.5 px-3">វិភាគទាន (contributions)</th>
                      <th className="py-2.5 px-3">ម៉ោងសិក្សា (time_study)</th>
                      <th className="py-2.5 px-3">ស្ថានភាព (status)</th>
                      <th className="py-2.5 px-3 text-center">សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredPreviewRows.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="py-8 text-center text-slate-400 font-battambang">
                          មិនមានទិន្នន័យត្រូវតាមការស្វែងរកឡើយ
                        </td>
                      </tr>
                    ) : (
                      filteredPreviewRows.map(row => (
                        <tr
                          key={row.index}
                          className={`hover:bg-white/5 transition ${
                            !row.isValid
                              ? 'bg-rose-500/10'
                              : row.selected
                              ? 'bg-cyan-500/5'
                              : ''
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              disabled={!row.isValid}
                              checked={row.selected}
                              onChange={() => handleToggleRow(row.index)}
                              className="rounded text-cyan-500 disabled:opacity-30"
                            />
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-400 text-[11px]">
                            {row.index}
                          </td>
                          <td className="py-2 px-3 font-semibold text-white font-battambang">
                            <div className="flex items-center space-x-1.5">
                              <span>{row.khmer_name || '—'}</span>
                              {!row.isValid && (
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" title={row.errors.join(', ')} />
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-slate-300 font-sans">
                            {row.english_name || '—'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-battambang ${
                              row.sex === 'ស្រី' || row.sex.toUpperCase() === 'FEMALE' || row.sex.toUpperCase() === 'F'
                                ? 'bg-pink-500/20 text-pink-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {row.sex || 'ប្រុស'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-slate-300">
                            {row.age || '—'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold">
                              {row.grade || row.mappedStudent.grade}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-300 text-[11px]">
                            {row.date_of_birth || '—'}
                          </td>
                          <td className="py-2 px-3 font-mono text-indigo-300 text-[11px]">
                            {row.rlc || '—'}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-300 text-[11px]">
                            {row.phone_number || '—'}
                          </td>
                          <td className="py-2 px-3 font-mono text-emerald-300 text-[11px]">
                            {row.contributions || '—'}
                          </td>
                          <td className="py-2 px-3 text-slate-300 text-[11px] font-battambang">
                            {row.time_study || '—'}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                              {row.status || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => handleRemoveRow(row.index)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="លុបជួរដេកនេះចេញ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Guidance note */}
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-battambang bg-white/5 p-3 rounded-xl border border-white/5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  ប្រព័ន្ធនឹងបង្កើតលេខកូដអត្តលេខសិស្ស (Student ID Code), ផ្គូផ្គងថ្នាក់រៀនដោយស្វ័យប្រវត្តិ ព្រមទាំងរក្សាទុកទិន្នន័យទាំងអស់ (ទាំង ១៦ Fields) ទៅក្នុង LocalStorage ប្រកបដោយសុវត្ថិភាព។
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold font-battambang transition border border-white/10"
          >
            បោះបង់ (Cancel)
          </button>

          <div className="flex items-center space-x-3">
            {file && (
              <span className="text-xs text-slate-400 font-battambang">
                ត្រៀមនាំចូល: <strong className="text-cyan-400 font-mono">{selectedCount}</strong> នាក់
              </span>
            )}

            <button
              onClick={handleConfirmImport}
              disabled={!file || selectedCount === 0 || isLoading}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs font-battambang transition shadow-lg ${
                !file || selectedCount === 0 || isLoading
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>បញ្ជាក់ការនាំចូល ({selectedCount} នាក់)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
