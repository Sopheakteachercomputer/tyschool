import React, { useState, useRef, useEffect } from 'react';
import { Book, BookBorrow, Student } from '../types';
import { PdfReaderModal } from './PdfReaderModal';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Bookmark, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  X, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Calendar,
  FileText,
  Upload,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Eye,
  Printer,
  ExternalLink,
  FileCheck,
  BookMarked,
  HelpCircle,
  Info,
  FileUp,
  Image as ImageIcon,
  CheckCircle,
  HardDrive,
  Cloud,
  Link as LinkIcon,
  Copy,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag,
  Filter,
  SlidersHorizontal
} from 'lucide-react';

interface LibraryViewProps {
  books?: Book[];
  borrows?: BookBorrow[];
  students?: Student[];
  onSaveBook: (book: Book) => void;
  onDeleteBook?: (id: string) => void;
  onIssueBorrow: (borrow: BookBorrow, updatedBook: Book) => void;
  onReturnBook: (borrowId: string, updatedBook: Book) => void;
  onDeleteBorrow?: (id: string) => void;
  searchTerm?: string;
  userRole?: string;
}

export const CATEGORIES = [
  'ទាំងអស់ (All Categories)',
  'អក្សរសិល្ប៍ខ្មែរ (Khmer Literature)',
  'វិទ្យាសាស្ត្រ (Science)',
  'គណិតវិទ្យា (Mathematics)',
  'រូបវិទ្យា & គីមីវិទ្យា (Physics & Chemistry)',
  'ប្រវត្តិវិទ្យា & ភូមិវិទ្យា (History & Geography)',
  'បច្ចេកវិទ្យា & ICT (Technology & ICT)',
  'ភាសាបរទេស (Foreign Languages)',
  'វប្បធម៌ & សីលធម៌ (Culture & Ethics)',
  'ចំណេះដឹងទូទៅ (General Knowledge)'
];

export const GENRES = [
  'ទាំងអស់ (All Genres)',
  'ប្រលោមលោកបុរាណ & ទំនើប (Classic & Modern Novel)',
  'មនោសញ្ចេតនា (Drama & Romance)',
  'សៀវភៅពុម្ព & វិញ្ញាសា (Textbook & Exam Guide)',
  'ឯកសារស្រាវជ្រាវ (Research & Academic)',
  'សៀវភៅពិសោធន៍ (Lab & Practical Guide)',
  'កំណាព្យ & អក្សរសិល្ប៍ (Poetry & Literature)',
  'ប្រវត្តិសាស្ត្រ & ជីវប្រវត្តិ (History & Biography)',
  'វិទ្យាសាស្ត្រកុំព្យូទ័រ & AI (Computer Science & AI)',
  'វចនានុក្រម & ឯកសារយោង (Dictionary & Reference)'
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=300&auto=format&fit=crop&q=80'
];

// Sample Google Drive E-Books for quick pre-fill testing
const SAMPLE_DRIVE_BOOKS = [
  {
    titleKhmer: 'រឿង កុលាបប៉ៃលិន (Google Drive PDF)',
    titleEnglish: 'Rose of Pailin - MoEYS E-Book',
    authorKhmer: 'ញ៉ុក ថែម',
    category: 'អក្សរសិល្ប៍ខ្មែរ (Khmer Literature)',
    driveUrl: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing',
    driveFileId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    fileSize: '3.2 MB',
    pages: 128
  },
  {
    titleKhmer: 'រូបមន្តគណិតវិទ្យាថ្នាក់ទី១២ ត្រៀមបាក់ឌុប',
    titleEnglish: 'Grade 12 Math Formula & BacII Guide',
    authorKhmer: 'សាស្រ្តាចារ្យ គង់ វិរៈ',
    category: 'គណិតវិទ្យា & រូបវិទ្យា (Math & Physics)',
    driveUrl: 'https://drive.google.com/file/d/17b2W9iN5d3aKqL_MoEYS_Math12/view?usp=sharing',
    driveFileId: '17b2W9iN5d3aKqL_MoEYS_Math12',
    fileSize: '5.6 MB',
    pages: 240
  },
  {
    titleKhmer: 'មូលដ្ឋានគ្រឹះវិទ្យាសាស្ត្រកុំព្យូទ័រ & AI ឌីជីថល',
    titleEnglish: 'Fundamentals of CS & AI Handbook',
    authorKhmer: 'លោកគ្រូ តាំង គីមសាន',
    category: 'បច្ចេកវិទ្យា & ICT (Technology & ICT)',
    driveUrl: 'https://drive.google.com/file/d/1XyZ_AI_ComputerScience_Handbook/view?usp=sharing',
    driveFileId: '1XyZ_AI_ComputerScience_Handbook',
    fileSize: '4.1 MB',
    pages: 165
  }
];

/**
 * Utility to extract Google Drive file ID from various link formats
 */
export function extractGoogleDriveId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  
  // Format: /file/d/FILE_ID/view... or /file/d/FILE_ID
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Format: id=FILE_ID
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  // Format: /d/FILE_ID
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];

  // If user directly pasted an ID (20+ chars alphanumeric)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Convert any Google Drive link or ID to embed preview URL
 */
export function toGoogleDrivePreviewUrl(input: string): string {
  const fileId = extractGoogleDriveId(input);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return input;
}

/**
 * Convert to Google Drive direct view URL
 */
export function toGoogleDriveViewUrl(input: string): string {
  const fileId = extractGoogleDriveId(input);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view`;
  }
  return input;
}

/**
 * Convert to Google Drive direct download URL
 */
export function toGoogleDriveDownloadUrl(input: string): string {
  const fileId = extractGoogleDriveId(input);
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return input;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  books = [],
  borrows = [],
  students = [],
  onSaveBook,
  onDeleteBook,
  onIssueBorrow,
  onReturnBook,
  onDeleteBorrow,
  searchTerm: globalSearch = '',
  userRole
}) => {
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'EBOOKS' | 'BORROWS'>('CATALOG');
  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ទាំងអស់ (All Categories)');
  const [selectedGenre, setSelectedGenre] = useState('ទាំងអស់ (All Genres)');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'DEVICE' | 'GOOGLE_DRIVE'>('ALL');
  const [availableOnly, setAvailableOnly] = useState(false);
  
  // Modals
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [pdfReaderModalOpen, setPdfReaderModalOpen] = useState(false);
  const [selectedReadingBook, setSelectedReadingBook] = useState<Book | null>(null);
  const [readerZoom, setReaderZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Upload Mode in Book Modal: 'DEVICE' vs 'GOOGLE_DRIVE' vs 'URL'
  const [pdfUploadMode, setPdfUploadMode] = useState<'DEVICE' | 'GOOGLE_DRIVE' | 'URL'>('DEVICE');
  const [driveInputUrl, setDriveInputUrl] = useState('');
  const [isDriveValid, setIsDriveValid] = useState(false);
  const [detectedDriveId, setDetectedDriveId] = useState<string | null>(null);
  const [driveHelpOpen, setDriveHelpOpen] = useState(false);

  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'BOOK' | 'BORROW';
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: 'BOOK',
    id: '',
    title: ''
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Book Form State
  const [bookForm, setBookForm] = useState<Partial<Book>>({
    isbn: 'ISBN 978-99950-01',
    titleKhmer: '',
    titleEnglish: '',
    authorKhmer: '',
    author: '',
    publisher: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
    category: 'អក្សរសិល្ប៍ខ្មែរ (Khmer Literature)',
    genre: 'Classic & Modern Novel',
    genreKhmer: 'ប្រលោមលោកបុរាណ & ទំនើប',
    tags: [],
    shelfLocation: 'A-01',
    totalCopies: 10,
    availableCopies: 10,
    coverImage: PRESET_COVERS[0],
    pdfUrl: '',
    pdfFileName: '',
    pdfFileSize: '',
    pdfPageCount: 50,
    isDigital: false,
    pdfSource: 'DEVICE',
    driveFileId: '',
    description: '',
    priceUSD: 5.00
  });

  // Borrow Form State
  const [borrowForm, setBorrowForm] = useState<{
    studentId: string;
    bookId: string;
    dueDate: string;
  }>({
    studentId: students[0]?.id || '',
    bookId: books[0]?.id || '',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  });

  // Watch Drive input URL for auto-detection
  useEffect(() => {
    if (pdfUploadMode === 'GOOGLE_DRIVE') {
      const driveId = extractGoogleDriveId(driveInputUrl);
      if (driveId) {
        setIsDriveValid(true);
        setDetectedDriveId(driveId);
        const previewUrl = `https://drive.google.com/file/d/${driveId}/preview`;
        setBookForm(prev => ({
          ...prev,
          pdfUrl: previewUrl,
          driveFileId: driveId,
          pdfSource: 'GOOGLE_DRIVE',
          pdfFileName: prev.pdfFileName || 'GoogleDrive_Document.pdf',
          pdfFileSize: prev.pdfFileSize || 'Cloud Stream (Drive)',
          isDigital: true
        }));
      } else {
        setIsDriveValid(false);
        setDetectedDriveId(null);
      }
    }
  }, [driveInputUrl, pdfUploadMode]);

  const search = globalSearch || localSearch;

  // Filtered books
  const filteredBooks = books.filter(b => {
    const totalCount = b.totalCopies ?? b.totalQty ?? 1;
    const availCount = b.availableCopies ?? b.availableQty ?? 0;
    const authorName = b.authorKhmer || b.author || '';

    const matchesSearch = !search ||
      b.titleKhmer.toLowerCase().includes(search.toLowerCase()) ||
      (b.titleEnglish && b.titleEnglish.toLowerCase().includes(search.toLowerCase())) ||
      authorName.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.toLowerCase().includes(search.toLowerCase()) ||
      (b.category && b.category.toLowerCase().includes(search.toLowerCase())) ||
      (b.genre && b.genre.toLowerCase().includes(search.toLowerCase())) ||
      (b.genreKhmer && b.genreKhmer.toLowerCase().includes(search.toLowerCase())) ||
      (b.tags && b.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase()));
    
    // Category Matching
    const matchesCat = (() => {
      if (selectedCategory === 'ទាំងអស់ (All Categories)' || selectedCategory === 'ទាំងអស់ (All)') return true;
      const cleanSelected = selectedCategory.toLowerCase();
      const bCat = (b.category || '').toLowerCase();
      if (bCat.includes(cleanSelected) || cleanSelected.includes(bCat)) return true;
      if (cleanSelected.includes('khmer literature') && (bCat.includes('khmer literature') || bCat.includes('អក្សរសិល្ប៍'))) return true;
      if (cleanSelected.includes('science') && (bCat.includes('science') || bCat.includes('វិទ្យាសាស្ត្រ'))) return true;
      if (cleanSelected.includes('mathematics') && (bCat.includes('math') || bCat.includes('គណិតវិទ្យា'))) return true;
      if (cleanSelected.includes('physics') && (bCat.includes('physic') || bCat.includes('រូបវិទ្យា') || bCat.includes('គីមី'))) return true;
      if (cleanSelected.includes('history') && (bCat.includes('histor') || bCat.includes('ប្រវត្តិ') || bCat.includes('ភូមិវិទ្យា'))) return true;
      if (cleanSelected.includes('technology') && (bCat.includes('techno') || bCat.includes('ict') || bCat.includes('បច្ចេកវិទ្យា'))) return true;
      if (cleanSelected.includes('languages') || cleanSelected.includes('language')) {
        if (bCat.includes('languag') || bCat.includes('ភាសា')) return true;
      }
      if (cleanSelected.includes('culture') && (bCat.includes('cultur') || bCat.includes('វប្បធម៌') || bCat.includes('សីលធម៌'))) return true;
      if (cleanSelected.includes('general') && (bCat.includes('general') || bCat.includes('ទូទៅ'))) return true;
      return bCat.includes(selectedCategory.split(' ')[0].toLowerCase());
    })();

    // Genre Matching
    const matchesGenre = (() => {
      if (selectedGenre === 'ទាំងអស់ (All Genres)' || selectedGenre === 'ទាំងអស់ (All)') return true;
      const cleanGenre = selectedGenre.toLowerCase();
      const bGenre = (b.genre || '').toLowerCase();
      const bGenreKh = (b.genreKhmer || '').toLowerCase();
      if (bGenre.includes(cleanGenre) || bGenreKh.includes(cleanGenre)) return true;
      if (cleanGenre.includes('novel') && (bGenre.includes('novel') || bGenreKh.includes('ប្រលោមលោក'))) return true;
      if (cleanGenre.includes('romance') && (bGenre.includes('romance') || bGenreKh.includes('មនោសញ្ចេតនា'))) return true;
      if (cleanGenre.includes('textbook') && (bGenre.includes('textbook') || bGenreKh.includes('ពុម្ព') || bGenreKh.includes('វិញ្ញាសា'))) return true;
      if (cleanGenre.includes('research') && (bGenre.includes('research') || bGenreKh.includes('ស្រាវជ្រាវ') || bGenreKh.includes('academic'))) return true;
      if (cleanGenre.includes('laboratory') || cleanGenre.includes('practical')) {
        if (bGenre.includes('lab') || bGenreKh.includes('ពិសោធន៍') || bGenreKh.includes('អនុវត្ត')) return true;
      }
      if (cleanGenre.includes('poetry') && (bGenre.includes('poet') || bGenreKh.includes('កំណាព្យ') || bGenreKh.includes('កាព្យ'))) return true;
      if (cleanGenre.includes('history') && (bGenre.includes('histor') || bGenreKh.includes('ប្រវត្តិ') || bGenreKh.includes('ជីវប្រវត្តិ'))) return true;
      if (cleanGenre.includes('computer') && (bGenre.includes('computer') || bGenre.includes('ai') || bGenreKh.includes('កុំព្យូទ័រ'))) return true;
      if (cleanGenre.includes('dictionary') && (bGenre.includes('dict') || bGenreKh.includes('វចនានុក្រម') || bGenreKh.includes('ឯកសារយោង'))) return true;
      return false;
    })();

    const matchesPdf = activeTab === 'EBOOKS' ? Boolean(b.pdfUrl || b.isDigital) : true;
    const matchesAvail = availableOnly ? availCount > 0 : true;

    // Filter by PDF Source
    let matchesSource = true;
    if (sourceFilter === 'DEVICE') {
      matchesSource = Boolean(b.pdfUrl && (!b.pdfSource || b.pdfSource === 'DEVICE' || b.pdfUrl.startsWith('data:')));
    } else if (sourceFilter === 'GOOGLE_DRIVE') {
      matchesSource = Boolean(b.pdfSource === 'GOOGLE_DRIVE' || (b.pdfUrl && b.pdfUrl.includes('drive.google.com')));
    }

    return matchesSearch && matchesCat && matchesGenre && matchesPdf && matchesAvail && matchesSource;
  });

  // Filtered borrows
  const filteredBorrows = borrows.filter(br =>
    !search ||
    br.studentNameKhmer.toLowerCase().includes(search.toLowerCase()) ||
    br.studentCode.toLowerCase().includes(search.toLowerCase()) ||
    (br.bookTitleKhmer && br.bookTitleKhmer.toLowerCase().includes(search.toLowerCase())) ||
    (br.bookTitle && br.bookTitle.toLowerCase().includes(search.toLowerCase()))
  );

  // Stats
  const totalBookCount = books.reduce((s, b) => s + (b.totalCopies ?? b.totalQty ?? 1), 0);
  const availableCopiesCount = books.reduce((s, b) => s + (b.availableCopies ?? b.availableQty ?? 0), 0);
  const digitalBooksCount = books.filter(b => Boolean(b.pdfUrl || b.isDigital)).length;
  const driveBooksCount = books.filter(b => b.pdfSource === 'GOOGLE_DRIVE' || (b.pdfUrl && b.pdfUrl.includes('drive.google.com'))).length;
  const deviceBooksCount = books.filter(b => b.pdfSource === 'DEVICE' || (b.pdfUrl && b.pdfUrl.startsWith('data:'))).length;
  const activeBorrowsCount = borrows.filter(b => b.status === 'BORROWED').length;
  const overdueBorrowsCount = borrows.filter(b => b.status === 'OVERDUE').length;

  // Book Handlers
  const handleOpenAddBook = (presetMode: 'DEVICE' | 'GOOGLE_DRIVE' = 'DEVICE') => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចបន្ថែមសៀវភៅ ឬផ្ទុក PDF បាន!');
      return;
    }
    setEditingBook(null);
    setPdfUploadMode(presetMode);
    setDriveInputUrl('');
    setIsDriveValid(false);
    setDetectedDriveId(null);

    setBookForm({
      isbn: `ISBN 978-99950-${String(books.length + 10).padStart(3, '0')}`,
      titleKhmer: '',
      titleEnglish: '',
      authorKhmer: '',
      author: '',
      publisher: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
      category: 'អក្សរសិល្ប៍ខ្មែរ (Khmer Literature)',
      genre: 'Classic & Modern Novel',
      genreKhmer: 'ប្រលោមលោកបុរាណ & ទំនើប',
      tags: [],
      shelfLocation: 'A-01',
      totalCopies: 10,
      availableCopies: 10,
      coverImage: PRESET_COVERS[books.length % PRESET_COVERS.length],
      pdfUrl: '',
      pdfFileName: '',
      pdfFileSize: '',
      pdfPageCount: 45,
      isDigital: false,
      pdfSource: presetMode,
      driveFileId: '',
      description: '',
      priceUSD: 5.00
    });
    setBookModalOpen(true);
  };

  const handleOpenEditBook = (bk: Book) => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកែប្រែសៀវភៅបាន!');
      return;
    }
    setEditingBook(bk);
    const isDrive = bk.pdfSource === 'GOOGLE_DRIVE' || (Boolean(bk.pdfUrl) && bk.pdfUrl!.includes('drive.google.com'));
    const isLocal = bk.pdfSource === 'DEVICE' || (Boolean(bk.pdfUrl) && bk.pdfUrl!.startsWith('data:'));
    
    const mode = isDrive ? 'GOOGLE_DRIVE' : isLocal ? 'DEVICE' : 'URL';
    setPdfUploadMode(mode);
    setDriveInputUrl(bk.pdfUrl || '');
    
    const driveId = extractGoogleDriveId(bk.pdfUrl || '');
    setDetectedDriveId(driveId);
    setIsDriveValid(Boolean(driveId));

    setBookForm({
      isbn: bk.isbn,
      titleKhmer: bk.titleKhmer,
      titleEnglish: bk.titleEnglish || '',
      authorKhmer: bk.authorKhmer || bk.author || '',
      author: bk.author || bk.authorKhmer || '',
      publisher: bk.publisher || 'ក្រសួងអប់រំ យុវជន និងកីឡា',
      category: bk.category || 'អក្សរសិល្ប៍ខ្មែរ (Khmer Literature)',
      genre: bk.genre || '',
      genreKhmer: bk.genreKhmer || '',
      tags: bk.tags || [],
      shelfLocation: bk.shelfLocation || bk.shelf || 'A-01',
      totalCopies: bk.totalCopies ?? bk.totalQty ?? 1,
      availableCopies: bk.availableCopies ?? bk.availableQty ?? 1,
      coverImage: bk.coverImage || PRESET_COVERS[0],
      pdfUrl: bk.pdfUrl || '',
      pdfFileName: bk.pdfFileName || (bk.pdfUrl ? 'Book_Document.pdf' : ''),
      pdfFileSize: bk.pdfFileSize || '',
      pdfPageCount: bk.pdfPageCount || 50,
      isDigital: bk.isDigital ?? Boolean(bk.pdfUrl),
      pdfSource: mode,
      driveFileId: driveId || bk.driveFileId || '',
      description: bk.description || '',
      priceUSD: bk.priceUSD || 5.00
    });
    setBookModalOpen(true);
  };

  // Handle PDF File Upload from Device via FileReader
  const handlePdfFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('សូមជ្រើសរើសតែឯកសារ PDF (File format: .pdf) ប៉ុណ្ណោះ!');
      return;
    }

    const fileSizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBookForm(prev => ({
        ...prev,
        pdfUrl: result,
        pdfFileName: file.name,
        pdfFileSize: fileSizeFormatted,
        pdfSource: 'DEVICE',
        isDigital: true,
        titleKhmer: prev.titleKhmer || file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')
      }));
      showToast(`📁 បានផ្ទុកឯកសារ PDF ពីឧបករណ៍ "${file.name}" (${fileSizeFormatted}) ដោយជោគជ័យ`);
    };
    reader.readAsDataURL(file);
  };

  // Handle Cover Image Upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setBookForm(prev => ({
        ...prev,
        coverImage: reader.result as string
      }));
      showToast(`🖼️ បានផ្ទុករូបក្របសៀវភៅរួចរាល់`);
    };
    reader.readAsDataURL(file);
  };

  // Apply Sample Google Drive E-Book
  const handleApplySampleDriveBook = (sample: typeof SAMPLE_DRIVE_BOOKS[0]) => {
    setDriveInputUrl(sample.driveUrl);
    setDetectedDriveId(sample.driveFileId);
    setIsDriveValid(true);
    setBookForm(prev => ({
      ...prev,
      titleKhmer: prev.titleKhmer || sample.titleKhmer,
      titleEnglish: prev.titleEnglish || sample.titleEnglish,
      authorKhmer: prev.authorKhmer || sample.authorKhmer,
      category: sample.category,
      pdfUrl: `https://drive.google.com/file/d/${sample.driveFileId}/preview`,
      pdfFileName: `${sample.titleEnglish.replace(/\s+/g, '_')}.pdf`,
      pdfFileSize: sample.fileSize,
      pdfPageCount: sample.pages,
      pdfSource: 'GOOGLE_DRIVE',
      driveFileId: sample.driveFileId,
      isDigital: true
    }));
    showToast(`☁️ បានភ្ជាប់គំរូសៀវភៅ Google Drive "${sample.titleKhmer}"`);
  };

  // Load sample test device PDF
  const handleLoadSampleDevicePdf = () => {
    setBookForm(prev => ({
      ...prev,
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pdfFileName: 'MoEYS_Cambodia_Textbook_Grade12.pdf',
      pdfFileSize: '3.4 MB',
      pdfPageCount: 120,
      pdfSource: 'DEVICE',
      isDigital: true
    }));
    showToast('✨ បានភ្ជាប់ឯកសារ PDF គំរូ MoEYS Sample រួចរាល់');
  };

  const handleSaveBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចរក្សាទុកព័ត៌មានសៀវភៅបាន!');
      return;
    }
    if (!bookForm.titleKhmer) {
      alert('សូមបញ្ចូលចំណងជើងសៀវភៅជាភាសាខ្មែរ');
      return;
    }

    const total = Number(bookForm.totalCopies) || 1;
    const avail = Number(bookForm.availableCopies) ?? total;

    let finalPdfUrl = bookForm.pdfUrl;
    let finalSource: 'DEVICE' | 'GOOGLE_DRIVE' | 'URL' = bookForm.pdfSource || 'DEVICE';
    let finalDriveId = bookForm.driveFileId;

    if (pdfUploadMode === 'GOOGLE_DRIVE') {
      const driveId = extractGoogleDriveId(driveInputUrl || bookForm.pdfUrl || '');
      if (driveId) {
        finalPdfUrl = `https://drive.google.com/file/d/${driveId}/preview`;
        finalSource = 'GOOGLE_DRIVE';
        finalDriveId = driveId;
      }
    } else if (pdfUploadMode === 'DEVICE') {
      finalSource = 'DEVICE';
    }

    const bookPayload: Book = {
      id: editingBook ? editingBook.id : `BK-${Date.now()}`,
      isbn: bookForm.isbn || `ISBN 978-99950-${Date.now().toString().slice(-4)}`,
      titleKhmer: bookForm.titleKhmer.trim(),
      titleEnglish: bookForm.titleEnglish?.trim() || '',
      authorKhmer: bookForm.authorKhmer?.trim() || 'មិនស្គាល់',
      author: bookForm.authorKhmer?.trim() || bookForm.author?.trim() || 'មិនស្គាល់',
      publisher: bookForm.publisher || 'ក្រសួងអប់រំ យុវជន និងកីឡា',
      category: bookForm.category || 'អក្សរសិល្ប៍ខ្មែរ (Khmer Literature)',
      genre: bookForm.genre?.trim() || undefined,
      genreKhmer: bookForm.genreKhmer?.trim() || undefined,
      tags: Array.isArray(bookForm.tags) ? bookForm.tags : [],
      shelfLocation: bookForm.shelfLocation || 'A-01',
      shelf: bookForm.shelfLocation || 'A-01',
      totalCopies: total,
      totalQty: total,
      availableCopies: Math.min(avail, total),
      availableQty: Math.min(avail, total),
      coverImage: bookForm.coverImage || PRESET_COVERS[0],
      pdfUrl: finalPdfUrl || undefined,
      pdfFileName: bookForm.pdfFileName || (finalPdfUrl ? (finalSource === 'GOOGLE_DRIVE' ? 'GoogleDrive_Book.pdf' : 'Book_Doc.pdf') : undefined),
      pdfFileSize: bookForm.pdfFileSize || (finalPdfUrl ? (finalSource === 'GOOGLE_DRIVE' ? 'Drive Cloud' : '2.5 MB') : undefined),
      pdfPageCount: Number(bookForm.pdfPageCount) || 50,
      isDigital: Boolean(finalPdfUrl || bookForm.isDigital),
      pdfSource: finalPdfUrl ? finalSource : undefined,
      driveFileId: finalDriveId || undefined,
      description: bookForm.description || '',
      priceUSD: Number(bookForm.priceUSD) || 5.00,
      status: Math.min(avail, total) > 0 ? 'AVAILABLE' : 'BORROWED'
    };

    onSaveBook(bookPayload);
    showToast(editingBook ? `💾 បានកែប្រែព័ត៌មានសៀវភៅ "${bookPayload.titleKhmer}"` : `✨ បានបញ្ចូលសៀវភៅថ្មី "${bookPayload.titleKhmer}"`);
    setBookModalOpen(false);
  };

  // Open PDF Reader Modal
  const handleOpenPdfReader = (bk: Book) => {
    setSelectedReadingBook(bk);
    setReaderZoom(100);
    setIsFullscreen(false);
    setPdfReaderModalOpen(true);
  };

  // Borrow Handlers
  const handleOpenBorrowModal = (presetBookId?: string) => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចចេញប័ណ្ណខ្ចីសៀវភៅបាន!');
      return;
    }
    setBorrowForm({
      studentId: students[0]?.id || '',
      bookId: presetBookId || books[0]?.id || '',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
    });
    setBorrowModalOpen(true);
  };

  const handleIssueBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចចេញប័ណ្ណខ្ចីសៀវភៅបាន!');
      return;
    }
    const st = students.find(s => s.id === borrowForm.studentId);
    const bk = books.find(b => b.id === borrowForm.bookId);

    if (!st || !bk) {
      alert('សូមជ្រើសរើសសិស្ស និងសៀវភៅ');
      return;
    }

    const currentAvail = bk.availableCopies ?? bk.availableQty ?? 0;
    const currentTotal = bk.totalCopies ?? bk.totalQty ?? 1;

    if (currentAvail <= 0) {
      alert('សៀវភៅនេះអស់ពីស្តុកហើយ មិនអាចខ្ចីបានទេ!');
      return;
    }

    const updatedBook: Book = {
      ...bk,
      availableCopies: Math.max(0, currentAvail - 1),
      availableQty: Math.max(0, currentAvail - 1),
      status: currentAvail - 1 > 0 ? 'AVAILABLE' : 'BORROWED'
    };

    const newBorrow: BookBorrow = {
      id: `BRW-${Date.now()}`,
      borrowCode: `BOR-${Date.now().toString().slice(-6)}`,
      bookId: bk.id,
      bookTitleKhmer: bk.titleKhmer,
      bookTitle: bk.titleKhmer,
      isbn: bk.isbn,
      studentId: st.id,
      studentNameKhmer: st.nameKhmer,
      studentCode: st.studentCode,
      className: st.className,
      borrowDate: new Date().toISOString().split('T')[0],
      dueDate: borrowForm.dueDate,
      status: 'BORROWED',
      fineKHR: 0,
      fineUSD: 0
    };

    onIssueBorrow(newBorrow, updatedBook);
    showToast(`📖 បានចេញប័ណ្ណខ្ចីសៀវភៅ "${bk.titleKhmer}" ជូនសិស្ស "${st.nameKhmer}"`);
    setBorrowModalOpen(false);
  };

  const handleReturnAction = (br: BookBorrow) => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចទទួលសងសៀវភៅបាន!');
      return;
    }
    const bk = books.find(b => b.id === br.bookId);
    if (!bk) return;

    const currentAvail = bk.availableCopies ?? bk.availableQty ?? 0;
    const currentTotal = bk.totalCopies ?? bk.totalQty ?? 1;

    const updatedBook: Book = {
      ...bk,
      availableCopies: Math.min(currentTotal, currentAvail + 1),
      availableQty: Math.min(currentTotal, currentAvail + 1),
      status: 'AVAILABLE'
    };

    onReturnBook(br.id, updatedBook);
    showToast(`✓ បានទទួលសងសៀវភៅ "${br.bookTitleKhmer || br.bookTitle}" ចូលស្តុកវិញ`);
  };

  const handleConfirmDelete = () => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចលុបសៀវភៅ ឬកំណត់ត្រាខ្ចីបាន!');
      setDeleteConfirm({ isOpen: false, type: 'BOOK', id: '', title: '' });
      return;
    }
    if (deleteConfirm.type === 'BOOK') {
      if (onDeleteBook) {
        onDeleteBook(deleteConfirm.id);
        showToast(`🗑️ បានលុបសៀវភៅ "${deleteConfirm.title}"`);
      }
    } else if (deleteConfirm.type === 'BORROW') {
      if (onDeleteBorrow) {
        onDeleteBorrow(deleteConfirm.id);
        showToast(`🗑️ បានលុបកំណត់ត្រាខ្ចី "${deleteConfirm.title}"`);
      }
    }
    setDeleteConfirm({ isOpen: false, type: 'BOOK', id: '', title: '' });
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 bg-emerald-950/90 text-emerald-200 border border-emerald-500/30 rounded-2xl shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 font-battambang text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-battambang flex items-center gap-2 flex-wrap">
                <span>បណ្ណាល័យសាលា & សៀវភៅអេឡិចត្រូនិច (School E-Library)</span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                  <Cloud className="w-3 h-3 text-sky-400" />
                  <span>Google Drive & Device PDF</span>
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                គ្រប់គ្រងកាតាឡុកសៀវភៅ ផ្ទុក PDF ពី Device & Google Drive អានអនឡាញ គ្រប់គ្រងស្តុក និងការខ្ចី-សង
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isSuperAdmin ? (
            <>
              <button
                onClick={() => handleOpenBorrowModal()}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 font-battambang"
              >
                <Bookmark className="w-4 h-4" />
                <span>+ ខ្ចីសៀវភៅ</span>
              </button>

              <button
                onClick={() => handleOpenAddBook('GOOGLE_DRIVE')}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-sky-500/20 font-battambang"
              >
                <Cloud className="w-4 h-4" />
                <span>+ ភ្ជាប់ Google Drive</span>
              </button>

              <button
                onClick={() => handleOpenAddBook('DEVICE')}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-indigo-500/20 font-battambang"
              >
                <Plus className="w-4 h-4" />
                <span>+ ផ្ទុក PDF ពី Device</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs text-slate-300 font-battambang">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>របៀបមើល & អានសៀវភៅ (សិទ្ធិកែប្រែ៖ Super Admin ប៉ុណ្ណោះ)</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/60 backdrop-blur-xl p-4.5 rounded-3xl border border-white/10 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-battambang">ចំណងជើងសរុប</p>
            <h3 className="text-2xl font-bold text-white font-mono mt-1">{books.length} ក្បាល</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{totalBookCount} ច្បាប់ក្នុងស្តុក</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl p-4.5 rounded-3xl border border-purple-500/20 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-300 font-battambang">សៀវភៅ E-Book PDF</p>
            <h3 className="text-2xl font-bold text-purple-400 font-mono mt-1">{digitalBooksCount} ក្បាល</h3>
            <p className="text-[10px] text-purple-300/80 mt-0.5">
              <span>{driveBooksCount} លើ Drive</span> • <span>{deviceBooksCount} ពី Device</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl p-4.5 rounded-3xl border border-emerald-500/20 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-300 font-battambang">សៀវភៅទំនេរ (In Stock)</p>
            <h3 className="text-2xl font-bold text-emerald-400 font-mono mt-1">{availableCopiesCount} ក្បាល</h3>
            <p className="text-[10px] text-emerald-400/80 mt-0.5">រួចរាល់សម្រាប់ខ្ចី</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl p-4.5 rounded-3xl border border-amber-500/20 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-300 font-battambang">កំពុងខ្ចី (Borrowed)</p>
            <h3 className="text-2xl font-bold text-amber-400 font-mono mt-1">{activeBorrowsCount} ក្បាល</h3>
            <p className="text-[10px] text-amber-300/80 mt-0.5">សិស្សកំពុងអាន</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl p-4.5 rounded-3xl border border-rose-500/20 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-rose-300 font-battambang">យឺតកាលកំណត់</p>
            <h3 className="text-2xl font-bold text-rose-400 font-mono mt-1">{overdueBorrowsCount} ក្បាល</h3>
            <p className="text-[10px] text-rose-300/80 mt-0.5">ត្រូវតាមដាន & រំលឹក</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-slate-900/70 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-xl space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 font-battambang text-xs">
            <button
              onClick={() => { setActiveTab('CATALOG'); setSourceFilter('ALL'); }}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'CATALOG'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>កាតាឡុកសៀវភៅ ({books.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('EBOOKS'); }}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'EBOOKS'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white hover:bg-purple-500/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>សៀវភៅអេឡិចត្រូនិច PDF ({digitalBooksCount})</span>
            </button>

            <button
              onClick={() => { setActiveTab('BORROWS'); }}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'BORROWS'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>កំណត់ត្រាខ្ចី-សង ({borrows.length})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {activeTab !== 'BORROWS' && (
              <>
                {/* PDF Source Filter */}
                <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-white/10 text-xs font-battambang">
                  <button
                    type="button"
                    onClick={() => setSourceFilter('ALL')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                      sourceFilter === 'ALL' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ទាំងអស់
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceFilter('DEVICE')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center space-x-1 ${
                      sourceFilter === 'DEVICE' ? 'bg-purple-600 text-white shadow' : 'text-purple-300/80 hover:text-purple-200'
                    }`}
                  >
                    <HardDrive className="w-3 h-3" />
                    <span>Device</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceFilter('GOOGLE_DRIVE')}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center space-x-1 ${
                      sourceFilter === 'GOOGLE_DRIVE' ? 'bg-sky-600 text-white shadow' : 'text-sky-300/80 hover:text-sky-200'
                    }`}
                  >
                    <Cloud className="w-3 h-3" />
                    <span>Drive</span>
                  </button>
                </div>

                {/* Genre Selector */}
                <div className="flex items-center space-x-1 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-white/10">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedGenre}
                    onChange={e => setSelectedGenre(e.target.value)}
                    className="bg-transparent text-xs text-white outline-none focus:text-indigo-300 font-battambang py-1 cursor-pointer"
                  >
                    {GENRES.map(gn => (
                      <option key={gn} value={gn} className="bg-slate-900 text-white">{gn}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setAvailableOnly(!availableOnly)}
                  className={`px-3 py-2 rounded-xl text-xs font-battambang font-medium border transition ${
                    availableOnly
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  {availableOnly ? '✓ មានក្នុងស្តុក' : 'មានក្នុងស្តុក'}
                </button>
              </>
            )}

            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="ស្វែងរកចំណងជើង, ប្រភេទ, អ្នកនិពន្ធ..."
                className="w-full pl-9 pr-3.5 py-2 bg-white/5 text-xs text-white placeholder-slate-400 rounded-xl border border-white/10 outline-none focus:border-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Quick Category Filter Bar */}
        {activeTab !== 'BORROWS' && (
          <div className="pt-2 border-t border-white/5 flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-battambang text-slate-400 flex items-center space-x-1 shrink-0 mr-1">
              <Filter className="w-3 h-3 text-indigo-400" />
              <span>ជំពូក/ប្រភេទ:</span>
            </span>
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat;
              const count = cat.startsWith('ទាំងអស់') 
                ? books.length 
                : books.filter(b => (b.category || '').toLowerCase().includes(cat.split(' ')[0].toLowerCase())).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-battambang whitespace-nowrap transition flex items-center space-x-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-white/10 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* TAB 1 & 2: CATALOG & EBOOKS GRID */}
      {(activeTab === 'CATALOG' || activeTab === 'EBOOKS') && (
        <>
          {filteredBooks.length === 0 ? (
            <div className="bg-slate-900/40 backdrop-blur-xl p-12 rounded-3xl border border-white/10 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 mx-auto">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white font-battambang">រកមិនឃើញសៀវភៅដែលស្វែងរកឡើយ</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                សូមសាកល្បងផ្លាស់ប្តូរពាក្យគន្លឹះ ឬចុចប៊ូតុងខាងក្រោមដើម្បីបន្ថែមសៀវភៅថ្មីពី Device ឬភ្ជាប់ Google Drive
              </p>
              <div className="flex items-center justify-center space-x-2 pt-2">
                <button
                  onClick={() => handleOpenAddBook('DEVICE')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-battambang"
                >
                  + ផ្ទុក PDF ពី Device
                </button>
                <button
                  onClick={() => handleOpenAddBook('GOOGLE_DRIVE')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold font-battambang"
                >
                  + ភ្ជាប់ Google Drive PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map(bk => {
                const totalCopies = bk.totalCopies ?? bk.totalQty ?? 1;
                const availCopies = bk.availableCopies ?? bk.availableQty ?? 0;
                const isAvail = availCopies > 0;
                const hasPdf = Boolean(bk.pdfUrl || bk.isDigital);
                const isDrive = bk.pdfSource === 'GOOGLE_DRIVE' || (Boolean(bk.pdfUrl) && bk.pdfUrl!.includes('drive.google.com'));
                const isDevice = bk.pdfSource === 'DEVICE' || (Boolean(bk.pdfUrl) && bk.pdfUrl!.startsWith('data:'));
                const authorDisplay = bk.authorKhmer || bk.author || 'មិនស្គាល់';
                const shelfDisplay = bk.shelfLocation || bk.shelf || 'A-01';

                return (
                  <div 
                    key={bk.id}
                    className={`bg-slate-900/60 backdrop-blur-xl rounded-3xl border shadow-lg p-5 flex flex-col justify-between space-y-4 transition group hover:shadow-2xl ${
                      isDrive 
                        ? 'border-sky-500/30 hover:border-sky-400/60' 
                        : hasPdf 
                        ? 'border-purple-500/30 hover:border-purple-400/60' 
                        : 'border-white/10 hover:border-indigo-500/40'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                            {bk.isbn}
                          </span>
                          
                          {/* Source Badges */}
                          {isDrive ? (
                            <span className="text-[10px] font-bold text-sky-300 bg-sky-500/15 px-2 py-0.5 rounded-lg border border-sky-500/30 flex items-center space-x-1">
                              <Cloud className="w-3 h-3 text-sky-400" />
                              <span>Google Drive</span>
                            </span>
                          ) : isDevice ? (
                            <span className="text-[10px] font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-lg border border-purple-500/30 flex items-center space-x-1">
                              <HardDrive className="w-3 h-3 text-purple-400" />
                              <span>Device PDF</span>
                            </span>
                          ) : hasPdf ? (
                            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-lg border border-indigo-500/30 flex items-center space-x-1">
                              <FileText className="w-3 h-3 text-indigo-400" />
                              <span>E-Book</span>
                            </span>
                          ) : null}
                        </div>

                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                          isAvail 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>
                          {isAvail ? `នៅសល់ ${availCopies}/${totalCopies}` : 'អស់ពីស្តុក'}
                        </span>
                      </div>

                      {/* Main Card Info */}
                      <div className="flex items-start space-x-3.5">
                        <div className="relative shrink-0 group/cover">
                          <img 
                            src={bk.coverImage || PRESET_COVERS[0]} 
                            alt={bk.titleKhmer} 
                            className="w-18 h-24 object-cover rounded-2xl border border-white/15 shadow-md group-hover/cover:scale-105 transition" 
                          />
                          {isDrive ? (
                            <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-sky-600 text-white shadow-md border border-sky-400">
                              <Cloud className="w-3 h-3" />
                            </div>
                          ) : hasPdf ? (
                            <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-purple-600 text-white shadow-md border border-purple-400">
                              <FileCheck className="w-3 h-3" />
                            </div>
                          ) : null}
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm font-battambang leading-snug group-hover:text-indigo-300 transition line-clamp-2">
                            {bk.titleKhmer}
                          </h4>
                          {bk.titleEnglish && (
                            <p className="text-[11px] text-slate-400 italic truncate">{bk.titleEnglish}</p>
                          )}
                          <p className="text-[11px] text-slate-300 font-battambang truncate">
                            ✍️ <span className="font-medium text-white">{authorDisplay}</span>
                          </p>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-battambang pt-0.5 flex-wrap">
                            <span>📍 ទូ: <strong className="text-indigo-300 font-mono">{shelfDisplay}</strong></span>
                            {bk.pdfFileSize && (
                              <span className={isDrive ? 'text-sky-300 font-mono' : 'text-purple-300 font-mono'}>
                                💾 {bk.pdfFileSize}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Category & Genre Badges */}
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 mt-2.5">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-[10px] font-medium text-indigo-300 font-battambang">
                          <Layers className="w-2.5 h-2.5 text-indigo-400" />
                          <span>{bk.category || 'អក្សរសិល្ប៍ខ្មែរ'}</span>
                        </span>

                        {(bk.genreKhmer || bk.genre) && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/25 text-[10px] font-medium text-purple-300 font-battambang">
                            <Tag className="w-2.5 h-2.5 text-purple-400" />
                            <span>{bk.genreKhmer || bk.genre}</span>
                          </span>
                        )}

                        {Array.isArray(bk.tags) && bk.tags.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-slate-400 font-battambang">
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* Description excerpt */}
                      {bk.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-2.5 font-battambang bg-white/5 p-2 rounded-xl border border-white/5">
                          {bk.description}
                        </p>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-battambang gap-2">
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{bk.publisher || bk.category}</span>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        {/* Read PDF Button */}
                        {hasPdf && (
                          <button
                            type="button"
                            onClick={() => handleOpenPdfReader(bk)}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl font-bold text-white shadow-md text-xs transition ${
                              isDrive 
                                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-sky-500/20' 
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/20'
                            }`}
                            title={isDrive ? 'បើកអាន Google Drive PDF' : 'បើកអានសៀវភៅ PDF នេះ'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isDrive ? 'អាន Drive PDF' : 'អាន PDF'}</span>
                          </button>
                        )}

                        {/* Super Admin Only: Borrow, Edit, Delete */}
                        {isSuperAdmin && (
                          <>
                            {/* Borrow Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenBorrowModal(bk.id)}
                              disabled={!isAvail}
                              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 text-xs ${
                                isAvail 
                                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 text-white shadow-sm'
                                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
                              }`}
                              title={isAvail ? 'ចេញប័ណ្ណខ្ចីសៀវភៅ' : 'សៀវភៅអស់ពីស្តុក'}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>ខ្ចី</span>
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditBook(bk)}
                              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                              title="កែប្រែព័ត៌មាន & ផ្ទុក PDF ថ្មី"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-indigo-300" />
                            </button>

                            {/* Delete Button */}
                            {onDeleteBook && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: 'BOOK',
                                    id: bk.id,
                                    title: bk.titleKhmer
                                  });
                                }}
                                className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition"
                                title="លុបសៀវភៅ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 3: BORROW RECORDS TABLE */}
      {activeTab === 'BORROWS' && (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-battambang">
                <tr>
                  <th className="p-4">សៀវភៅ</th>
                  <th className="p-4">សិស្សអ្នកខ្ចី</th>
                  <th className="p-4">ថ្នាក់</th>
                  <th className="p-4">ថ្ងៃខ្ចី</th>
                  <th className="p-4">ថ្ងៃត្រូវសង</th>
                  <th className="p-4">ស្ថានភាព</th>
                  <th className="p-4 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-battambang">
                {filteredBorrows.map(br => {
                  const isReturned = br.status === 'RETURNED';
                  const isOverdue = br.status === 'OVERDUE';

                  return (
                    <tr key={br.id} className="hover:bg-white/5 transition">
                      <td className="p-4">
                        <p className="font-bold text-white">{br.bookTitleKhmer || br.bookTitle}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{br.isbn || 'ISBN'}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-white">{br.studentNameKhmer}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{br.studentCode}</p>
                      </td>
                      <td className="p-4 text-slate-300">{br.className || 'ថ្នាក់រៀន'}</td>
                      <td className="p-4 text-slate-400 font-mono text-[11px]">{br.borrowDate}</td>
                      <td className="p-4 text-slate-400 font-mono text-[11px]">{br.dueDate}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isReturned
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : isOverdue
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {isReturned ? '✓ បានសងរួច' : isOverdue ? '⚠️ ហួសកំណត់' : '⏳ កំពុងខ្ចី'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isSuperAdmin ? (
                            <>
                              {!isReturned && (
                                <button
                                  type="button"
                                  onClick={() => handleReturnAction(br)}
                                  className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>ទទួលសង</span>
                                </button>
                              )}
                              {onDeleteBorrow && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteConfirm({
                                      isOpen: true,
                                      type: 'BORROW',
                                      id: br.id,
                                      title: `${br.studentNameKhmer} (${br.bookTitleKhmer || br.bookTitle})`
                                    });
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                                  title="លុប"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">មើលប៉ុណ្ណោះ</span>
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

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT BOOK WITH DUAL PDF (DEVICE + GOOGLE DRIVE) UPLOAD */}
      {/* ========================================================================= */}
      {bookModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 font-battambang text-xs text-slate-200 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingBook ? 'កែប្រែព័ត៌មានសៀវភៅ & ឯកសារ PDF' : 'បញ្ចូលសៀវភៅ & ផ្ទុក PDF (Device & Google Drive)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    បញ្ចូលព័ត៌មានសៀវភៅ ជ្រើសរើសផ្ទុក PDF ពី Device ឬតភ្ជាប់ពី Google Drive
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setBookModalOpen(false)} 
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBookSubmit} className="space-y-4">
              
              {/* ================================================================= */}
              {/* PDF UPLOAD SOURCE SWITCHER (DEVICE vs GOOGLE DRIVE vs URL) */}
              {/* ================================================================= */}
              <div className="p-4.5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 space-y-3.5 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-white font-bold flex items-center space-x-2 text-xs">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>ប្រភពឯកសារ E-Book PDF (PDF Source)</span>
                  </label>
                  
                  {/* Source Switch Tabs */}
                  <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setPdfUploadMode('DEVICE')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                        pdfUploadMode === 'DEVICE' 
                          ? 'bg-purple-600 text-white shadow-md' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>ឧបករណ៍ (Device)</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPdfUploadMode('GOOGLE_DRIVE')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                        pdfUploadMode === 'GOOGLE_DRIVE' 
                          ? 'bg-sky-600 text-white shadow-md' 
                          : 'text-sky-400/80 hover:text-sky-300'
                      }`}
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      <span>Google Drive</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPdfUploadMode('URL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                        pdfUploadMode === 'URL' 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Direct URL</span>
                    </button>
                  </div>
                </div>

                {/* OPTION 1: DEVICE UPLOAD */}
                {pdfUploadMode === 'DEVICE' && (
                  <div className="space-y-2.5 animate-in fade-in">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handlePdfFileUpload}
                      className="hidden"
                    />

                    {bookForm.pdfUrl && bookForm.pdfSource === 'DEVICE' ? (
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-purple-900/30 border border-purple-500/40 text-purple-200">
                        <div className="flex items-center space-x-3 truncate">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
                            <FileCheck className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-white text-xs truncate">
                              {bookForm.pdfFileName || 'Device_Document.pdf'}
                            </p>
                            <p className="text-[10px] text-purple-300 flex items-center space-x-2 font-mono">
                              <span>📁 ទំហំ: {bookForm.pdfFileSize || '2.4 MB'}</span>
                              <span>•</span>
                              <span className="text-emerald-400">✓ ផ្ទុកពី Device រួចរាល់</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-[11px] font-medium transition"
                          >
                            ប្តូរ PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => setBookForm({ ...bookForm, pdfUrl: '', pdfFileName: '', pdfFileSize: '', isDigital: false })}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition"
                            title="លុប PDF ចោល"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-purple-500/30 hover:border-purple-400/70 bg-purple-500/5 hover:bg-purple-500/10 p-4 rounded-xl text-center cursor-pointer transition space-y-1.5 group"
                      >
                        <FileUp className="w-8 h-8 text-purple-400 mx-auto group-hover:scale-110 transition" />
                        <p className="font-bold text-white text-xs">
                          ចុចទីនេះដើម្បីជ្រើសរើសឯកសារ PDF ពីកុំព្យូទ័រ / ទូរស័ព្ទ (Upload from Device)
                        </p>
                        <p className="text-[10px] text-slate-400">
                          គាំទ្រឯកសារ .pdf (ទំហំអតិបរមា 50MB) សម្រាប់សិស្ស-គ្រូអានក្នុងបណ្ណាល័យ
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleLoadSampleDevicePdf}
                        className="text-[10px] text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/30 font-medium transition flex items-center space-x-1"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>ប្រើ PDF គំរូសាកល្បង (Sample Device PDF)</span>
                      </button>
                      <span className="text-[10px] text-slate-400">ផ្ទុកចូល Local Storage សុវត្ថិភាព</span>
                    </div>
                  </div>
                )}

                {/* OPTION 2: GOOGLE DRIVE UPLOAD / CONNECT */}
                {pdfUploadMode === 'GOOGLE_DRIVE' && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sky-300 text-xs font-semibold flex items-center space-x-1.5">
                          <Cloud className="w-4 h-4 text-sky-400" />
                          <span>បិទភ្ជាប់តំណ Google Drive Link (Sharing Link)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setDriveHelpOpen(!driveHelpOpen)}
                          className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center space-x-1 underline"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>របៀបយក Link ពី Google Drive?</span>
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={driveInputUrl}
                          onChange={e => setDriveInputUrl(e.target.value)}
                          placeholder="ឧ. https://drive.google.com/file/d/1BxiMVs0XRA5.../view?usp=sharing"
                          className={`w-full pl-3.5 pr-24 py-2.5 bg-slate-950/80 rounded-xl border text-xs text-sky-200 placeholder-slate-500 outline-none font-mono ${
                            isDriveValid ? 'border-emerald-500/60 focus:border-emerald-400' : 'border-sky-500/30 focus:border-sky-400'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (driveInputUrl) {
                              const preview = toGoogleDrivePreviewUrl(driveInputUrl);
                              window.open(toGoogleDriveViewUrl(driveInputUrl), '_blank');
                            }
                          }}
                          disabled={!isDriveValid}
                          className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center space-x-1 ${
                            isDriveValid
                              ? 'bg-sky-600 hover:bg-sky-500 text-white'
                              : 'bg-white/5 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>តេស្តបើក</span>
                        </button>
                      </div>
                    </div>

                    {/* Google Drive Status Indicator */}
                    {isDriveValid && detectedDriveId && (
                      <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5 truncate">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-white text-xs truncate">
                              ✓ បានស្គាល់ Google Drive File ID ដោយជោគជ័យ
                            </p>
                            <p className="text-[10px] font-mono text-emerald-400 truncate">
                              ID: {detectedDriveId}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-mono shrink-0">
                          Embed Ready
                        </span>
                      </div>
                    )}

                    {/* How to share Google Drive Guide Dropdown */}
                    {driveHelpOpen && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-sky-500/30 text-[11px] text-slate-300 space-y-1.5 font-battambang animate-in fade-in">
                        <p className="font-bold text-sky-300 flex items-center space-x-1">
                          <Info className="w-3.5 h-3.5" />
                          <span>ការណែនាំចែករំលែក Google Drive ដើម្បីអានក្នុងកម្មវិធី៖</span>
                        </p>
                        <ol className="list-decimal list-inside space-y-0.5 text-slate-400 text-[10px]">
                          <li>ចូលទៅកាន់ Google Drive ហើយចុច Right-Click លើឯកសារ PDF</li>
                          <li>ជ្រើសរើសយក <strong className="text-white">Share (ចែករំលែក) &gt; Share</strong></li>
                          <li>នៅត្រង់ General Access ប្តូរទៅជា <strong className="text-emerald-400">"Anyone with the link (អ្នកដែលមានតំណភ្ជាប់)"</strong></li>
                          <li>ចុច <strong className="text-white">"Copy link"</strong> រួចបិទភ្ជាប់ (Paste) ក្នុងប្រអប់ខាងលើ</li>
                        </ol>
                      </div>
                    )}

                    {/* Preset Sample Drive Books for Quick Test */}
                    <div className="pt-1">
                      <p className="text-[10px] text-slate-400 mb-1.5 font-battambang">
                        ⚡ ឬជ្រើសរើសសៀវភៅគំរូពី Google Drive សាកល្បងភ្លាមៗ៖
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        {SAMPLE_DRIVE_BOOKS.map((sample, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => handleApplySampleDriveBook(sample)}
                            className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 hover:border-sky-500/40 text-left transition text-[10px] space-y-0.5"
                          >
                            <p className="font-bold text-sky-200 truncate">{sample.titleKhmer}</p>
                            <p className="text-slate-400 font-mono text-[9px]">{sample.fileSize} • Drive</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* OPTION 3: DIRECT WEB URL */}
                {pdfUploadMode === 'URL' && (
                  <div className="space-y-2 animate-in fade-in">
                    <label className="text-slate-300 text-xs font-semibold">តំណភ្ជាប់ URL ឯកសារ PDF (Direct Web URL)</label>
                    <input
                      type="url"
                      placeholder="https://example.com/books/my_textbook.pdf"
                      value={bookForm.pdfUrl && !bookForm.pdfUrl.startsWith('data:') ? bookForm.pdfUrl : ''}
                      onChange={e => {
                        const val = e.target.value;
                        setBookForm({
                          ...bookForm,
                          pdfUrl: val,
                          pdfFileName: val ? 'Web_EBook.pdf' : '',
                          pdfFileSize: val ? 'Web URL' : '',
                          pdfSource: 'URL',
                          isDigital: Boolean(val)
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-xs text-purple-200 placeholder-slate-500 outline-none focus:border-indigo-400 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* ================================================================= */}
              {/* BASIC BOOK INFO FORM */}
              {/* ================================================================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">លេខ ISBN / Barcode*</label>
                  <input
                    type="text"
                    required
                    value={bookForm.isbn}
                    onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-indigo-300 font-mono outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ទីតាំងទូ (Shelf Location)</label>
                  <input
                    type="text"
                    value={bookForm.shelfLocation}
                    onChange={e => setBookForm({ ...bookForm, shelfLocation: e.target.value })}
                    placeholder="ឧ. A-01, D-04"
                    className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ចំណងជើងសៀវភៅ (ខ្មែរ)*</label>
                <input
                  type="text"
                  required
                  value={bookForm.titleKhmer}
                  onChange={e => setBookForm({ ...bookForm, titleKhmer: e.target.value })}
                  placeholder="ឧ. រឿងរាមកេរ្តិ៍ខ្មែរ ឬ គណិតវិទ្យាថ្នាក់ទី១២"
                  className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white text-sm font-semibold outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ចំណងជើងជាភាសាអង់គ្លេស</label>
                  <input
                    type="text"
                    value={bookForm.titleEnglish}
                    onChange={e => setBookForm({ ...bookForm, titleEnglish: e.target.value })}
                    placeholder="e.g. History of Cambodia"
                    className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-200 outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">អ្នកនិពន្ធ (Author)</label>
                  <input
                    type="text"
                    value={bookForm.authorKhmer}
                    onChange={e => setBookForm({ ...bookForm, authorKhmer: e.target.value, author: e.target.value })}
                    placeholder="ឧ. ញ៉ុក ថែម ឬ ក្រសួងអប់រំ"
                    className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-200 outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ជំពូក / ប្រភេទធំ (Category)*</label>
                  <select
                    value={bookForm.category}
                    onChange={e => setBookForm({ ...bookForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400 font-battambang text-xs"
                  >
                    {CATEGORIES.filter(c => !c.startsWith('ទាំងអស់')).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ប្រភេទរង / ទម្រង់ (Genre / Sub-category)</label>
                  <select
                    value={bookForm.genreKhmer || bookForm.genre || ''}
                    onChange={e => {
                      const selectedVal = e.target.value;
                      setBookForm({ 
                        ...bookForm, 
                        genreKhmer: selectedVal, 
                        genre: selectedVal 
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400 font-battambang text-xs"
                  >
                    <option value="">-- ជ្រើសរើសប្រភេទរង (Select Genre) --</option>
                    {GENRES.filter(g => !g.startsWith('ទាំងអស់')).map(gn => (
                      <option key={gn} value={gn}>{gn}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">រោងពុម្ព / ស្ថាប័នបោះពុម្ព</label>
                  <input
                    type="text"
                    value={bookForm.publisher}
                    onChange={e => setBookForm({ ...bookForm, publisher: e.target.value })}
                    placeholder="ឧ. រោងពុម្ពពុទ្ធសាសនបណ្ឌិត្យ"
                    className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-200 outline-none focus:border-indigo-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ពាក្យគន្លឹះ / Tags (ញែកដោយសញ្ញាក្បៀស)</label>
                  <input
                    type="text"
                    value={Array.isArray(bookForm.tags) ? bookForm.tags.join(', ') : ''}
                    onChange={e => {
                      const tagsArr = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                      setBookForm({ ...bookForm, tags: tagsArr });
                    }}
                    placeholder="ឧ. ថ្នាក់ទី១២, បាក់ឌុប, រូបមន្ត"
                    className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-200 outline-none focus:border-indigo-400 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ចំនួនច្បាប់សរុប*</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bookForm.totalCopies}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setBookForm({ ...bookForm, totalCopies: val, availableCopies: val });
                    }}
                    className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-emerald-400 font-mono font-bold outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ចំនួននៅសល់</label>
                  <input
                    type="number"
                    min="0"
                    max={bookForm.totalCopies}
                    value={bookForm.availableCopies}
                    onChange={e => setBookForm({ ...bookForm, availableCopies: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-indigo-300 font-mono font-bold outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ចំនួនទំព័រ</label>
                  <input
                    type="number"
                    min="1"
                    value={bookForm.pdfPageCount || 50}
                    onChange={e => setBookForm({ ...bookForm, pdfPageCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-200 font-mono outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* Cover Image Upload / Selection */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">រូបភាពក្របសៀវភៅ (Book Cover)</label>
                <div className="flex items-center space-x-3">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  <img
                    src={bookForm.coverImage || PRESET_COVERS[0]}
                    alt="Cover Preview"
                    className="w-12 h-16 object-cover rounded-xl border border-white/20 shadow-md shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition flex items-center space-x-1.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>ផ្ទុករូបភាពក្របថ្មី</span>
                      </button>
                      <span className="text-[10px] text-slate-400">ឬជ្រើសរើសគំរូ៖</span>
                    </div>
                    <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
                      {PRESET_COVERS.map((cov, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setBookForm({ ...bookForm, coverImage: cov })}
                          className={`w-7 h-9 rounded-md overflow-hidden border transition shrink-0 ${
                            bookForm.coverImage === cov ? 'border-indigo-400 scale-105 shadow-md' : 'border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={cov} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">សេចក្តីសង្ខេប / មាតិកាសៀវភៅ (Description)</label>
                <textarea
                  rows={2}
                  value={bookForm.description}
                  onChange={e => setBookForm({ ...bookForm, description: e.target.value })}
                  placeholder="សរសេរពិពណ៌នាត្រួសៗអំពីខ្លឹមសារសៀវភៅ..."
                  className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400 resize-none text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setBookModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold transition"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition"
                >
                  {editingBook ? '💾 រក្សាទុកការកែប្រែ' : '✨ រក្សាទុកសៀវភៅ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DIGITAL PDF E-BOOK READER (FULL GOOGLE DRIVE & LOCAL SUPPORT) */}
      {/* ========================================================================= */}
      {pdfReaderModalOpen && selectedReadingBook && (
        <PdfReaderModal
          book={selectedReadingBook}
          isOpen={pdfReaderModalOpen}
          onClose={() => setPdfReaderModalOpen(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ISSUE BORROW MODAL */}
      {/* ========================================================================= */}
      {borrowModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-battambang text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                  <Bookmark className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">ចេញប័ណ្ណខ្ចីសៀវភៅ (Issue Borrow)</h3>
              </div>
              <button 
                onClick={() => setBorrowModalOpen(false)} 
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueBorrowSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">ជ្រើសរើសសៀវភៅ (Book)*</label>
                <select
                  value={borrowForm.bookId}
                  onChange={e => setBorrowForm({ ...borrowForm, bookId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                >
                  {books.map(b => {
                    const avail = b.availableCopies ?? b.availableQty ?? 0;
                    return (
                      <option key={b.id} value={b.id} disabled={avail <= 0}>
                        {b.titleKhmer} ({avail > 0 ? `សល់ ${avail} ក្បាល` : 'អស់ពីស្តុក'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ជ្រើសរើសសិស្សអ្នកខ្ចី (Student)*</label>
                <select
                  value={borrowForm.studentId}
                  onChange={e => setBorrowForm({ ...borrowForm, studentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nameKhmer} ({s.studentCode} • {s.className})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">កាលបរិច្ឆេទកំណត់សង (Due Date)*</label>
                <input
                  type="date"
                  required
                  value={borrowForm.dueDate}
                  onChange={e => setBorrowForm({ ...borrowForm, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setBorrowModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20"
                >
                  ចេញប័ណ្ណខ្ចី
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SAFE DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 font-battambang text-xs text-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">តើអ្នកពិតជាចង់លុបមែនទេ?</h3>
              <p className="text-slate-400 mt-1.5">
                អ្នកកំពុងស្នើសុំលុប {deleteConfirm.type === 'BOOK' ? 'សៀវភៅ' : 'កំណត់ត្រាខ្ចី'}{' '}
                <strong className="text-white">"{deleteConfirm.title}"</strong>
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false, type: 'BOOK', id: '', title: '' })}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold transition"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-lg shadow-rose-600/25"
              >
                លុបចោល
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
