import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Book } from '../types';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  ExternalLink,
  BookOpen,
  Cloud,
  HardDrive,
  FileText,
  Printer,
  Moon,
  Sun,
  LayoutGrid,
  Columns,
  Square,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Info,
  CheckCircle,
  HelpCircle,
  Layers,
  Search,
  BookMarked
} from 'lucide-react';
import { toGoogleDrivePreviewUrl, toGoogleDriveViewUrl, toGoogleDriveDownloadUrl, extractGoogleDriveId } from './LibraryView';

// Configure PDF.js worker reliably
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF.js worker initialization:', e);
  }
}

interface PdfReaderModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfReaderModal: React.FC<PdfReaderModalProps> = ({
  book,
  isOpen,
  onClose
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jumpPageInput, setJumpPageInput] = useState<string>('1');
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'SINGLE' | 'DUAL'>('SINGLE');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [readerEngine, setReaderEngine] = useState<'CANVAS' | 'IFRAME' | 'DIGITAL_TEXTBOOK'>('CANVAS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasDualRef = useRef<HTMLCanvasElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const renderDualTaskRef = useRef<any>(null);

  const isDrive = book.pdfSource === 'GOOGLE_DRIVE' || (Boolean(book.pdfUrl) && book.pdfUrl!.includes('drive.google.com'));
  const isDevice = book.pdfSource === 'DEVICE' || (Boolean(book.pdfUrl) && (book.pdfUrl!.startsWith('data:') || book.pdfUrl!.startsWith('blob:')));

  // Reset & Load PDF document
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);
    setCurrentPage(1);
    setJumpPageInput('1');
    setPdfDoc(null);

    // If Google Drive link, default to IFRAME preview for direct Google Viewer embed
    if (isDrive && book.pdfUrl) {
      setReaderEngine('IFRAME');
      setIsLoading(false);
      return;
    }

    if (!book.pdfUrl) {
      setReaderEngine('DIGITAL_TEXTBOOK');
      setIsLoading(false);
      return;
    }

    const loadPdf = async () => {
      try {
        let loadingTask: any;

        if (book.pdfUrl?.startsWith('data:application/pdf;base64,')) {
          // Clean base64 Data URL decoding into ArrayBuffer
          const base64Data = book.pdfUrl.replace(/^data:application\/pdf;base64,/, '');
          const binaryString = window.atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          loadingTask = pdfjsLib.getDocument({ data: bytes.buffer });
        } else if (book.pdfUrl?.startsWith('data:')) {
          const parts = book.pdfUrl.split(',');
          const mime = parts[0].match(/:(.*?);/)?.[1] || '';
          if (parts[1]) {
            const binaryString = window.atob(parts[1]);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            loadingTask = pdfjsLib.getDocument({ data: bytes.buffer });
          } else {
            loadingTask = pdfjsLib.getDocument({ url: book.pdfUrl });
          }
        } else {
          // Normal URL or Blob URL
          loadingTask = pdfjsLib.getDocument({
            url: book.pdfUrl,
            cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/cmaps/`,
            cMapPacked: true,
          });
        }

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setReaderEngine('CANVAS');
        setIsLoading(false);
      } catch (err: any) {
        console.warn('PDF.js canvas render note:', err);
        if (!isMounted) return;
        
        // If it was a mock URL or dummy PDF or CORS blocked, fallback gracefully
        if (book.pdfUrl && (book.pdfUrl.startsWith('http://') || book.pdfUrl.startsWith('https://'))) {
          setReaderEngine('IFRAME');
        } else {
          setReaderEngine('DIGITAL_TEXTBOOK');
        }
        setIsLoading(false);
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
      if (renderDualTaskRef.current) {
        try {
          renderDualTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [isOpen, book.pdfUrl, isDrive]);

  // Render Current Page on Canvas with crisp High-DPI scaling
  useEffect(() => {
    if (!pdfDoc || readerEngine !== 'CANVAS' || !canvasRef.current) return;

    let isCancelled = false;

    const renderPages = async () => {
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }
        if (renderDualTaskRef.current) {
          try {
            renderDualTaskRef.current.cancel();
          } catch {}
        }

        // Render Page 1
        const page1 = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const viewport1 = page1.getViewport({ scale, rotation });
        const canvas1 = canvasRef.current;
        if (!canvas1) return;

        const context1 = canvas1.getContext('2d');
        if (!context1) return;

        const outputScale = window.devicePixelRatio || 1;
        canvas1.width = Math.floor(viewport1.width * outputScale);
        canvas1.height = Math.floor(viewport1.height * outputScale);
        canvas1.style.width = Math.floor(viewport1.width) + 'px';
        canvas1.style.height = Math.floor(viewport1.height) + 'px';

        const transform1 = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        const renderContext1 = {
          canvasContext: context1,
          transform: transform1 || undefined,
          viewport: viewport1,
        };

        const renderTask1 = page1.render(renderContext1 as any);
        renderTaskRef.current = renderTask1;
        await renderTask1.promise;

        // Render Page 2 (Dual Page Mode)
        if (viewMode === 'DUAL' && currentPage + 1 <= numPages && canvasDualRef.current) {
          const page2 = await pdfDoc.getPage(currentPage + 1);
          if (isCancelled) return;

          const viewport2 = page2.getViewport({ scale, rotation });
          const canvas2 = canvasDualRef.current;
          const context2 = canvas2.getContext('2d');

          if (context2) {
            canvas2.width = Math.floor(viewport2.width * outputScale);
            canvas2.height = Math.floor(viewport2.height * outputScale);
            canvas2.style.width = Math.floor(viewport2.width) + 'px';
            canvas2.style.height = Math.floor(viewport2.height) + 'px';

            const transform2 = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
            const renderContext2 = {
              canvasContext: context2,
              transform: transform2 || undefined,
              viewport: viewport2,
            };

            const renderTask2 = page2.render(renderContext2 as any);
            renderDualTaskRef.current = renderTask2;
            await renderTask2.promise;
          }
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Error rendering canvas page:', err);
        }
      }
    };

    renderPages();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, scale, rotation, viewMode, readerEngine, numPages]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevPage();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, numPages, isFullscreen, viewMode]);

  if (!isOpen) return null;

  const goToNextPage = () => {
    const step = viewMode === 'DUAL' ? 2 : 1;
    if (currentPage + step <= (numPages || 10)) {
      const next = currentPage + step;
      setCurrentPage(next);
      setJumpPageInput(String(next));
    }
  };

  const goToPrevPage = () => {
    const step = viewMode === 'DUAL' ? 2 : 1;
    if (currentPage - step >= 1) {
      const prev = currentPage - step;
      setCurrentPage(prev);
      setJumpPageInput(String(prev));
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    const maxP = numPages || 10;
    if (!isNaN(p) && p >= 1 && p <= maxP) {
      setCurrentPage(p);
    } else {
      setJumpPageInput(String(currentPage));
    }
  };

  const handleZoomIn = () => setScale(prev => Math.min(3.0, Number((prev + 0.2).toFixed(1))));
  const handleZoomOut = () => setScale(prev => Math.max(0.5, Number((prev - 0.2).toFixed(1))));
  const handleResetZoom = () => setScale(1.2);
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const getDirectDownloadUrl = () => {
    if (!book.pdfUrl) return '#';
    if (isDrive) {
      return toGoogleDriveDownloadUrl(book.pdfUrl);
    }
    return book.pdfUrl;
  };

  const getDirectViewUrl = () => {
    if (!book.pdfUrl) return '#';
    if (isDrive) {
      return toGoogleDriveViewUrl(book.pdfUrl);
    }
    return book.pdfUrl;
  };

  const handlePrint = () => {
    window.print();
  };

  // Sample chapters for rich interactive textbook reader mode
  const textbookChapters = [
    {
      page: 1,
      title: 'ក្របមុខ & ព័ត៌មានទូទៅ (Title & Cover Information)',
      content: `សៀវភៅ៖ ${book.titleKhmer}\nចំណងជើងអង់គ្លេស៖ ${book.titleEnglish || 'N/A'}\nអ្នកនិពន្ធ៖ ${book.authorKhmer || book.author || 'មិនស្គាល់'}\nប្រភេទ៖ ${book.category}\nលេខ ISBN៖ ${book.isbn}\nទីតាំងតម្កល់ក្នុងបណ្ណាល័យ៖ ទូ ${book.shelfLocation || book.shelf || 'A-01'}\n\nសេចក្តីសង្ខេប៖\n${book.description || 'សៀវភៅនេះត្រូវបានចងក្រងឡើងដើម្បីបម្រើដល់ការសិក្សាស្រាវជ្រាវរបស់លោកគ្រូ អ្នកគ្រូ និងសិស្សានុសិស្សនៅក្នុងសាលា ដោយផ្ដោតលើចំណេះដឹងទូទៅ និងជំនាញជាក់ស្ដែង។'}`
    },
    {
      page: 2,
      title: 'មាតិកាសៀវភៅ (Table of Contents)',
      content: `ជំពូកទី ១៖ សេចក្តីផ្តើម និងគោលការណ៍គ្រឹះ\n  • ១.១ មូលដ្ឋានគ្រឹះ និងប្រវត្តិសង្ខេប\n  • ១.២ និយមន័យ និងពាក្យគន្លឹះសំខាន់ៗ\n  • ១.៣ គោលបំណងនៃការរៀនសូត្រ\n\nជំពូកទី ២៖ ការអនុវត្តជាក់ស្តែង និងទ្រឹស្តីសំខាន់ៗ\n  • ២.១ ដំណើរការនៃការអនុវត្តជាជំហានៗ\n  • ២.២ គំរូលំហាត់ និងដំណោះស្រាយ\n  • ២.៣ គន្លឹះ និងវិធីសាស្ត្រងាយស្រួលយល់\n\nជំពូកទី ៣៖ សង្ខេបមេរៀន & កម្រងសំណួរស្វ័យសិក្សា\n  • ៣.១ សង្ខេបចំណុចគន្លឹះ\n  • ៣.២ សំណួរពិភាក្សា និងលំហាត់អនុវត្ត\n  • ៣.៣ ឯកសារយោង និងប្រភពសិក្សាបន្ថែម`
    },
    {
      page: 3,
      title: 'ជំពូកទី ១៖ សេចក្តីផ្តើម និងគោលការណ៍គ្រឹះ (Chapter 1)',
      content: `ការយល់ដឹងអំពី ${book.titleKhmer} គឺជាគ្រឹះយ៉ាងសំខាន់សម្រាប់ការកសាងសមត្ថភាពចំណេះដឹង។\n\n១. គោលគំនិតចម្បង៖\nនៅក្នុងបរិបទនៃការអប់រំទំនើប ការរៀបចំប្រព័ន្ធគិតបែបឡូជីខល និងការស្រាវជ្រាវជាប្រចាំជួយបង្កើនប្រសិទ្ធភាពការងារ និងការរៀនសូត្រ។\n\n២. ចំណុចត្រូវចងចាំ៖\n• ត្រូវអានដោយយកចិត្តទុកដាក់ និងកត់ត្រាចំណុចសំខាន់ៗ\n• អនុវត្តលំហាត់គំរូឲ្យបានទៀងទាត់\n• ពិភាក្សាជាមួយលោកគ្រូអ្នកគ្រូ និងមិត្តរួមថ្នាក់នៅពេលមានចម្ងល់។`
    },
    {
      page: 4,
      title: 'ជំពូកទី ២៖ ការវិភាគ និងការដោះស្រាយបញ្ហា (Chapter 2)',
      content: `នៅក្នុងជំពូកនេះ យើងនឹងសិក្សាលម្អិតអំពីវិធីសាស្ត្រក្នុងការអនុវត្ត និងការដោះស្រាយបញ្ហាជាក់ស្តែង៖\n\n១. វិធានការដោះស្រាយ៖\nជំហានទី១៖ កំណត់បញ្ហាឲ្យបានច្បាស់លាស់\nជំហានទី២៖ ស្វែងរកទិន្នន័យ និងទ្រឹស្តីពាក់ព័ន្ធ\nជំហានទី៣៖ ជ្រើសរើសរូបមន្ត ឬវិធីសាស្ត្រសមស្រប\nជំហានទី៤៖ ផ្ទៀងផ្ទាត់លទ្ធផល និងទាញសេចក្តីសន្និដ្ឋាន។\n\n២. ឧទាហរណ៍ជាក់ស្តែង៖\nតាមរយៈការស្រាវជ្រាវ សិស្សានុសិស្សអាចយល់ដឹងកាន់តែស៊ីជម្រៅតាមរយៈការអនុវត្តផ្ទាល់។`
    },
    {
      page: 5,
      title: 'ជំពូកទី ៣៖ សង្ខេបមេរៀន និងលំហាត់អនុវត្ត (Summary & Exercises)',
      content: `សង្ខេបមេរៀន៖\nតាមរយៈមេរៀនទាំងមូល យើងបានសិក្សាពីគោលការណ៍គ្រឹះ វិធីសាស្ត្រអនុវត្ត និងការដោះស្រាយបញ្ហាផ្សេងៗ។\n\nសំណួរ និងលំហាត់ស្វ័យសិក្សា៖\n១. ចូរបរិយាយពីគោលបំណងចម្បងនៃ ${book.titleKhmer}?\n២. តើចំណុចគន្លឹះអ្វីខ្លះដែលសិស្សត្រូវអនុវត្តជាប្រចាំ?\n៣. ចូរលើកឧទាហរណ៍ជាក់ស្តែងក្នុងការអនុវត្តប្រចាំថ្ងៃ?\n\n- ចប់មេរៀន -`
    }
  ];

  const currentChapter = textbookChapters[Math.min(currentPage - 1, textbookChapters.length - 1)] || textbookChapters[0];

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in select-none ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-4 md:p-6'
      }`}
    >
      <div className="bg-slate-900 border border-white/15 rounded-3xl shadow-2xl flex flex-col h-full overflow-hidden">
        
        {/* ========================================================================= */}
        {/* TOP TOOLBAR */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-950 border-b border-white/10 shrink-0 gap-2 flex-wrap">
          
          {/* Left: Book Meta */}
          <div className="flex items-center space-x-3 min-w-0 max-w-[42%] sm:max-w-[46%]">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
              isDrive
                ? 'bg-sky-500/20 border border-sky-500/30 text-sky-300'
                : 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
            }`}>
              {isDrive ? <Cloud className="w-5 h-5 text-sky-400" /> : <BookOpen className="w-5 h-5 text-purple-400" />}
            </div>
            <div className="min-w-0 truncate">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm md:text-base font-bold text-white font-battambang truncate" title={book.titleKhmer}>
                  {book.titleKhmer}
                </h3>
                {isDrive ? (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono hidden md:inline-flex items-center space-x-1 shrink-0">
                    <Cloud className="w-3 h-3" />
                    <span>Google Drive</span>
                  </span>
                ) : (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono hidden md:inline-flex items-center space-x-1 shrink-0">
                    <HardDrive className="w-3 h-3" />
                    <span>Device PDF</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-battambang truncate">
                ✍️ {book.authorKhmer || book.author || 'មិនស្គាល់'} • {book.category}
              </p>
            </div>
          </div>

          {/* Center: Page Controls */}
          {(readerEngine === 'CANVAS' || readerEngine === 'DIGITAL_TEXTBOOK') && (
            <div className="flex items-center space-x-1.5 bg-slate-900 px-3 py-1.5 rounded-2xl border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-white/5 text-white transition"
                title="ទំព័រមុន (Previous Page - Arrow Left)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <form onSubmit={handleJumpSubmit} className="flex items-center space-x-1 text-xs font-mono">
                <input
                  type="text"
                  value={jumpPageInput}
                  onChange={e => setJumpPageInput(e.target.value)}
                  onBlur={() => setJumpPageInput(String(currentPage))}
                  className="w-10 text-center py-1 bg-slate-950 rounded-lg border border-white/15 text-indigo-300 font-bold focus:border-indigo-400 outline-none"
                />
                <span className="text-slate-400">/ {numPages || textbookChapters.length}</span>
              </form>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={currentPage >= (numPages || textbookChapters.length)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-white/5 text-white transition"
                title="ទំព័របន្ទាប់ (Next Page - Arrow Right)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Right: Tools & Actions */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            
            {/* Engine Modes Switcher */}
            <div className="hidden xl:flex items-center bg-slate-900 p-0.5 rounded-xl border border-white/10 text-[11px] font-battambang">
              <button
                type="button"
                onClick={() => setReaderEngine('CANVAS')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  readerEngine === 'CANVAS' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Canvas Rendering (គុណភាពខ្ពស់)"
              >
                ⚡ Canvas
              </button>
              <button
                type="button"
                onClick={() => setReaderEngine('DIGITAL_TEXTBOOK')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  readerEngine === 'DIGITAL_TEXTBOOK' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="អានជាទម្រង់ E-Reader ខ្មែរ"
              >
                📖 E-Reader
              </button>
              <button
                type="button"
                onClick={() => setReaderEngine('IFRAME')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  readerEngine === 'IFRAME' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Web / Drive Embed"
              >
                🌐 Web
              </button>
            </div>

            {/* View Mode Toggle (Single vs Dual Page) */}
            {readerEngine === 'CANVAS' && (
              <div className="hidden sm:flex items-center bg-slate-900 p-0.5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode('SINGLE')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'SINGLE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="ទំព័រទោល (Single Page View)"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('DUAL')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'DUAL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="ទំព័រគូ (Two Page Spread)"
                >
                  <Columns className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            {readerEngine === 'CANVAS' && (
              <>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                  title="បង្រួម (Zoom Out)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="text-xs font-mono text-indigo-300 px-1.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hidden sm:inline-block"
                  title="កំណត់ទំហំដើម 100%"
                >
                  {Math.round(scale * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                  title="ពង្រីក (Zoom In)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition hidden md:inline-flex"
                  title="បង្វិល 90 ដឺក្រេ (Rotate)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Night Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsNightMode(!isNightMode)}
              className={`p-2 rounded-xl border transition ${
                isNightMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
              title={isNightMode ? 'ប្តូរទៅ Day Mode' : 'ប្តូរទៅ Night Mode (ស្រួលភ្នែក)'}
            >
              {isNightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Direct Open in Drive / New Tab */}
            {book.pdfUrl && (
              <>
                <a
                  href={getDirectViewUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition flex items-center space-x-1"
                  title="បើកក្នុងផ្ទាំងថ្មី (Open in New Tab)"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <a
                  href={getDirectDownloadUrl()}
                  download={book.pdfFileName || `${book.titleKhmer}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition"
                  title="ទាញយកឯកសារ PDF (Download)"
                >
                  <Download className="w-4 h-4" />
                </a>
              </>
            )}

            {/* Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
              title={isFullscreen ? 'ចេញពីពេញអេក្រង់' : 'ពេញអេក្រង់ (Fullscreen)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition"
              title="បិទការអាន (Close)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN READER VIEWPORT */}
        {/* ========================================================================= */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-auto p-4 flex flex-col items-center justify-start relative select-text ${
            isNightMode ? 'bg-slate-950' : 'bg-slate-950'
          }`}
        >
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20 space-y-3">
              <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-indigo-300 font-battambang animate-pulse">
                កំពុងដំណើរការបើកសៀវភៅ PDF សូមរង់ចាំបន្តិច...
              </p>
            </div>
          )}

          {/* ENGINE 1: HIGH PERFORMANCE CANVAS RENDERER */}
          {readerEngine === 'CANVAS' && pdfDoc && (
            <div className="w-full flex flex-col items-center justify-center my-auto min-h-full py-4 space-y-6">
              <div className="flex flex-wrap items-center justify-center gap-6">
                {/* Page 1 Canvas */}
                <div className={`rounded-2xl overflow-hidden shadow-2xl border transition-all ${
                  isNightMode ? 'border-white/20 filter invert hue-rotate-180' : 'border-white/20 bg-white'
                }`}>
                  <canvas ref={canvasRef} className="block max-w-full" />
                </div>

                {/* Page 2 Canvas (Dual Mode) */}
                {viewMode === 'DUAL' && currentPage + 1 <= numPages && (
                  <div className={`rounded-2xl overflow-hidden shadow-2xl border transition-all ${
                    isNightMode ? 'border-white/20 filter invert hue-rotate-180' : 'border-white/20 bg-white'
                  }`}>
                    <canvas ref={canvasDualRef} className="block max-w-full" />
                  </div>
                )}
              </div>

              {/* Floating Bottom Page Nav Pill */}
              {numPages > 1 && (
                <div className="sticky bottom-4 z-10 flex items-center space-x-3 bg-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/15 shadow-2xl">
                  <button
                    type="button"
                    onClick={goToPrevPage}
                    disabled={currentPage <= 1}
                    className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs font-battambang font-bold transition flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>ទំព័រមុន</span>
                  </button>

                  <span className="text-xs font-mono font-bold text-indigo-300">
                    {currentPage} {viewMode === 'DUAL' && currentPage + 1 <= numPages ? `& ${currentPage + 1}` : ''} / {numPages}
                  </span>

                  <button
                    type="button"
                    onClick={goToNextPage}
                    disabled={currentPage >= numPages}
                    className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs font-battambang font-bold transition flex items-center space-x-1"
                  >
                    <span>ទំព័របន្ទាប់</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ENGINE 2: DIGITAL TEXTBOOK / RICH KHMER E-READER */}
          {(readerEngine === 'DIGITAL_TEXTBOOK' || (!pdfDoc && readerEngine === 'CANVAS')) && (
            <div className="w-full max-w-4xl my-auto py-6 px-3 sm:px-6 space-y-6">
              
              {/* Document Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/30 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=80'}
                      alt={book.titleKhmer}
                      className="w-16 h-22 object-cover rounded-xl border border-white/20 shadow-md"
                    />
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                        {book.category}
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold text-white font-battambang mt-1">
                        {book.titleKhmer}
                      </h2>
                      <p className="text-xs text-slate-400 font-battambang">
                        អ្នកនិពន្ធ៖ <strong className="text-slate-200">{book.authorKhmer || book.author || 'មិនស្គាល់'}</strong> • បោះពុម្ព៖ {book.publisher || 'ក្រសួងអប់រំ យុវជន និងកីឡា'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    {book.pdfUrl && (
                      <a
                        href={getDirectViewUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-battambang transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>បើកក្នុងផ្ទាំងថ្មី</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setReaderEngine('IFRAME')}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-battambang transition flex items-center space-x-1.5"
                    >
                      <Cloud className="w-3.5 h-3.5 text-sky-400" />
                      <span>Web Viewer</span>
                    </button>
                  </div>
                </div>

                {/* Chapter Page Box */}
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center space-x-2">
                      <BookMarked className="w-4 h-4 text-amber-400" />
                      <h3 className="font-bold text-white text-sm font-battambang">
                        {currentChapter.title}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      ទំព័រ {currentPage} / {textbookChapters.length}
                    </span>
                  </div>

                  <div className="text-slate-200 text-sm font-battambang leading-relaxed whitespace-pre-line py-2">
                    {currentChapter.content}
                  </div>

                  {/* Chapter Nav */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={goToPrevPage}
                      disabled={currentPage <= 1}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white text-xs font-bold font-battambang transition flex items-center space-x-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>ទំព័រមុន</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      {textbookChapters.map((ch, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCurrentPage(idx + 1);
                            setJumpPageInput(String(idx + 1));
                          }}
                          className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition ${
                            currentPage === idx + 1
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={goToNextPage}
                      disabled={currentPage >= textbookChapters.length}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white text-xs font-bold font-battambang transition flex items-center space-x-1.5"
                    >
                      <span>ទំព័របន្ទាប់</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ENGINE 3: WEB EMBED / GOOGLE DRIVE PREVIEW */}
          {readerEngine === 'IFRAME' && (
            <div className="w-full h-full flex flex-col items-center justify-center p-1">
              <iframe
                src={
                  isDrive && book.pdfUrl
                    ? toGoogleDrivePreviewUrl(book.pdfUrl)
                    : book.pdfUrl?.startsWith('data:')
                    ? book.pdfUrl
                    : book.pdfUrl
                    ? `https://docs.google.com/viewer?url=${encodeURIComponent(book.pdfUrl)}&embedded=true`
                    : 'about:blank'
                }
                title={book.titleKhmer}
                allow="autoplay; encrypted-media; fullscreen"
                className="w-full h-full min-h-[680px] rounded-2xl border border-white/15 shadow-2xl bg-white"
              />
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* FOOTER INFO BAR */}
        {/* ========================================================================= */}
        <div className="p-3 bg-slate-950 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-battambang px-6 gap-2 shrink-0">
          <div className="flex items-center space-x-4 flex-wrap">
            <span>ISBN: <strong className="text-indigo-300 font-mono">{book.isbn}</strong></span>
            <span>ទីតាំងទូ: <strong className="text-emerald-300 font-mono">{book.shelfLocation || book.shelf || 'A-01'}</strong></span>
            {book.pdfFileSize && (
              <span>ទំហំ: <strong className="text-purple-300 font-mono">{book.pdfFileSize}</strong></span>
            )}
            {book.pdfSource && (
              <span>ប្រភព: <strong className="text-sky-300 font-mono">{book.pdfSource}</strong></span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-500 hidden sm:inline">
              ប្រព័ន្ធអានសៀវភៅបណ្ណាល័យឌីជីថល (Digital School Library)
            </span>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              {readerEngine} Mode
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
