import React, { useState, useRef, useMemo, useEffect } from 'react';
import { SchoolProfile } from '../types';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Check,
  X,
  Trash2,
  Sliders,
  Eye,
  Layers,
  Award,
  Maximize2,
  FileCheck,
  RefreshCw,
  Info,
  Type,
  Move,
  Wand2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  AlignCenter,
  AlignLeft,
  AlignRight,
  RotateCw,
  Palette,
  Bold,
  Italic,
  Underline,
  ZoomIn,
  ZoomOut,
  MousePointer,
  Sparkle
} from 'lucide-react';

export interface CertTextItem {
  id: string;
  labelKhmer: string;
  labelEnglish: string;
  category: 'HEADER' | 'TITLE' | 'RECIPIENT' | 'BODY' | 'FOOTER';
  text: string;
  offsetX: number; // in pixels
  offsetY: number; // in pixels
  fontSizeScale: number; // 0.6 to 2.5
  color: string;
  fontWeight: 'normal' | 'semibold' | 'bold' | 'extrabold';
  fontFamily: 'battambang' | 'kantumruy' | 'moul' | 'sans' | 'serif';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  letterSpacing: number; // in px
  textAlign: 'center' | 'left' | 'right';
  textTransform: 'none' | 'uppercase' | 'capitalize';
  rotation: number; // in degrees
  shadow: 'none' | 'subtle' | 'gold' | 'glow';
}

interface CertificateBackgroundModalProps {
  isOpen: boolean;
  school: SchoolProfile;
  onClose: () => void;
  onSaveBackground: (bgData: {
    backgroundUrl: string;
    bgOpacity: number;
    borderStyle: 'ORNATE_GOLD' | 'ROYAL_BLUE' | 'EMERALD' | 'PARCHMENT' | 'MINIMAL' | 'NONE';
    theme: 'CLASSIC_GOLD' | 'ROYAL_BLUE' | 'EMERALD' | 'PARCHMENT' | 'CUSTOM';
    customLayout?: Record<string, any>;
  }) => void;
}

export interface BackgroundPreset {
  id: string;
  nameKhmer: string;
  nameEnglish: string;
  theme: 'CLASSIC_GOLD' | 'ROYAL_BLUE' | 'EMERALD' | 'PARCHMENT' | 'CUSTOM';
  borderStyle: 'ORNATE_GOLD' | 'ROYAL_BLUE' | 'EMERALD' | 'PARCHMENT' | 'MINIMAL' | 'NONE';
  url: string;
  thumbnail: string;
  description: string;
  badge?: string;
}

// Built-in high-definition certificate background templates with authentic SVG ornate patterns
export const CERTIFICATE_PRESETS: BackgroundPreset[] = [
  {
    id: 'preset-royal-khmer-gold',
    nameKhmer: 'ក្បាច់មាសរាជប្រណិត (Royal Khmer Gold)',
    nameEnglish: 'Royal Khmer Ornate Gold',
    theme: 'CLASSIC_GOLD',
    borderStyle: 'ORNATE_GOLD',
    badge: 'ពេញនិយម',
    description: 'ក្បាច់រចនាមាសសុទ្ធ រំលេចផ្កាចន្ទន៍ និងបន្ទាត់មាសទ្វេបែបបុរាណប្រណិត',
    thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23fdfbf7"/><rect x="8" y="8" width="284" height="184" fill="none" stroke="%23b45309" stroke-width="4"/><rect x="14" y="14" width="272" height="172" fill="none" stroke="%23d97706" stroke-width="1.5" stroke-dasharray="4,2"/><circle cx="150" cy="100" r="45" fill="none" stroke="%23f59e0b" stroke-width="1" opacity="0.4"/><polygon points="150,75 160,95 180,95 165,105 170,125 150,113 130,125 135,105 120,95 140,95" fill="%23fef3c7" stroke="%23d97706" stroke-width="1" opacity="0.35"/></svg>',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fffdfa"/><stop offset="50%" stop-color="%23fbf8f0"/><stop offset="100%" stop-color="%23f7f2e4"/></linearGradient><linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%2392400e"/><stop offset="25%" stop-color="%23d97706"/><stop offset="50%" stop-color="%23fbbf24"/><stop offset="75%" stop-color="%23d97706"/><stop offset="100%" stop-color="%2378350f"/></linearGradient><pattern id="mesh" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 40 M 0 0 L 40 40" fill="none" stroke="%23d97706" stroke-width="0.3" opacity="0.12"/></pattern></defs><rect width="1200" height="850" fill="url(%23g1)"/><rect width="1200" height="850" fill="url(%23mesh)"/><rect x="25" y="25" width="1150" height="800" fill="none" stroke="url(%23goldG)" stroke-width="8" rx="6"/><rect x="42" y="42" width="1116" height="766" fill="none" stroke="%23b45309" stroke-width="2" stroke-dasharray="8,4"/><g stroke="url(%23goldG)" stroke-width="3" fill="none"><path d="M 45 90 L 45 45 L 90 45"/><circle cx="45" cy="45" r="8" fill="%23d97706"/><path d="M 1155 90 L 1155 45 L 1110 45"/><circle cx="1155" cy="45" r="8" fill="%23d97706"/><path d="M 45 760 L 45 805 L 90 805"/><circle cx="45" cy="805" r="8" fill="%23d97706"/><path d="M 1155 760 L 1155 805 L 1110 805"/><circle cx="1155" cy="805" r="8" fill="%23d97706"/></g><g transform="translate(600, 425)" opacity="0.08"><circle r="190" fill="none" stroke="%23b45309" stroke-width="4"/><circle r="160" fill="none" stroke="%23d97706" stroke-width="2" stroke-dasharray="6,4"/><polygon points="0,-120 35,-35 120,-35 50,15 75,95 0,50 -75,95 -50,15 -120,-35 -35,-35" fill="%23d97706"/></g></svg>'
  },
  {
    id: 'preset-moeys-royal-blue',
    nameKhmer: 'ស៊ុមខៀវរាជ & មាសក្រសួង (MoEYS Royal Blue)',
    nameEnglish: 'Heritage Royal Blue & Gold',
    theme: 'ROYAL_BLUE',
    borderStyle: 'ROYAL_BLUE',
    badge: 'ផ្លូវការ',
    description: 'ក្បាច់រចនាផ្លូវការបែបក្រសួងអប់រំ ស៊ុមខៀវរាជក្បាច់ផ្កាមាសរំលេចភាពថ្លៃថ្នូរ',
    thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f8fafc"/><rect x="8" y="8" width="284" height="184" fill="none" stroke="%231e3a8a" stroke-width="5"/><rect x="15" y="15" width="270" height="170" fill="none" stroke="%23d97706" stroke-width="2"/><circle cx="150" cy="100" r="40" fill="none" stroke="%231e40af" stroke-width="1.5" opacity="0.3"/></svg>',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850"><defs><linearGradient id="bgBlue" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fbfcfe"/><stop offset="50%" stop-color="%23f0f4f8"/><stop offset="100%" stop-color="%23e8eef5"/></linearGradient><linearGradient id="blueG" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23172554"/><stop offset="50%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%231e40af"/></linearGradient><linearGradient id="goldBand" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23d97706"/><stop offset="100%" stop-color="%23b45309"/></linearGradient></defs><rect width="1200" height="850" fill="url(%23bgBlue)"/><rect x="22" y="22" width="1156" height="806" fill="none" stroke="url(%23blueG)" stroke-width="12" rx="4"/><rect x="38" y="38" width="1124" height="774" fill="none" stroke="url(%23goldBand)" stroke-width="3"/><rect x="46" y="46" width="1108" height="758" fill="none" stroke="%231e3a8a" stroke-width="1" stroke-dasharray="4,4"/><g fill="%23d97706"><polygon points="38,38 75,38 38,75"/><polygon points="1162,38 1125,38 1162,75"/><polygon points="38,812 75,812 38,775"/><polygon points="1162,812 1125,812 1162,775"/></g><g transform="translate(600, 425)" opacity="0.07"><circle r="180" fill="none" stroke="%231e3a8a" stroke-width="5"/><circle r="140" fill="none" stroke="%23d97706" stroke-width="3"/></g></svg>'
  },
  {
    id: 'preset-emerald-prestige',
    nameKhmer: 'ក្បាច់ត្បូងមរកតប្រណិត (Emerald Prestige)',
    nameEnglish: 'Emerald & Gold Luxury',
    theme: 'EMERALD',
    borderStyle: 'EMERALD',
    badge: 'ប្រណិត',
    description: 'ក្បាច់ពណ៌បៃតងត្បូងមរកត និងបន្ទាត់មាសភ្លឺចែងចាំង សម្រាប់សិស្សឆ្នើម',
    thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f0fdf4"/><rect x="8" y="8" width="284" height="184" fill="none" stroke="%23065f46" stroke-width="4"/><rect x="14" y="14" width="272" height="172" fill="none" stroke="%23d97706" stroke-width="1.5"/><circle cx="150" cy="100" r="40" fill="none" stroke="%23059669" stroke-width="1" opacity="0.3"/></svg>',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850"><defs><linearGradient id="bgEm" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fafffa"/><stop offset="50%" stop-color="%23f2faf5"/><stop offset="100%" stop-color="%23e6f4ec"/></linearGradient><linearGradient id="emG" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23064e3b"/><stop offset="50%" stop-color="%23047857"/><stop offset="100%" stop-color="%23065f46"/></linearGradient></defs><rect width="1200" height="850" fill="url(%23bgEm)"/><rect x="24" y="24" width="1152" height="802" fill="none" stroke="url(%23emG)" stroke-width="10" rx="8"/><rect x="38" y="38" width="1124" height="774" fill="none" stroke="%23d97706" stroke-width="3"/><rect x="46" y="46" width="1108" height="758" fill="none" stroke="%23047857" stroke-width="1" stroke-dasharray="6,4"/><g fill="%23d97706"><circle cx="46" cy="46" r="10"/><circle cx="1154" cy="46" r="10"/><circle cx="46" cy="804" r="10"/><circle cx="1154" cy="804" r="10"/></g></svg>'
  },
  {
    id: 'preset-vintage-parchment',
    nameKhmer: 'ក្រដាសបុរាណសំពត់ទេស (Classic Parchment)',
    nameEnglish: 'Vintage Antique Parchment',
    theme: 'PARCHMENT',
    borderStyle: 'PARCHMENT',
    badge: 'បុរាណ',
    description: 'ផ្ទៃក្រដាសបុរាណពណ៌លឿងទុំស្រាល បែបសញ្ញាបត្រកិត្តិយសអន្តរជាតិ',
    thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23fef3c7"/><rect x="10" y="10" width="280" height="180" fill="none" stroke="%2378350f" stroke-width="3"/><rect x="16" y="16" width="268" height="168" fill="none" stroke="%23b45309" stroke-width="1"/></svg>',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850"><defs><radialGradient id="vignette" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="%23fffbeb"/><stop offset="60%" stop-color="%23fef3c7"/><stop offset="100%" stop-color="%23fde68a"/></radialGradient></defs><rect width="1200" height="850" fill="url(%23vignette)"/><rect x="30" y="30" width="1140" height="790" fill="none" stroke="%2378350f" stroke-width="6"/><rect x="42" y="42" width="1116" height="766" fill="none" stroke="%23b45309" stroke-width="2" stroke-dasharray="10,5"/></svg>'
  }
];

// Color palette presets for certificate typography
const COLOR_PRESETS = [
  { name: 'Royal Gold', value: '#78350f', bg: 'bg-amber-900', border: 'border-amber-700' },
  { name: 'Gold Accent', value: '#d97706', bg: 'bg-amber-600', border: 'border-amber-500' },
  { name: 'MoEYS Blue', value: '#172554', bg: 'bg-blue-950', border: 'border-blue-900' },
  { name: 'Emerald', value: '#064e3b', bg: 'bg-emerald-950', border: 'border-emerald-800' },
  { name: 'Deep Crimson', value: '#881337', bg: 'bg-rose-950', border: 'border-rose-800' },
  { name: 'Obsidian Black', value: '#0f172a', bg: 'bg-slate-900', border: 'border-slate-800' },
  { name: 'Charcoal Gray', value: '#334155', bg: 'bg-slate-700', border: 'border-slate-600' }
];

export const CertificateBackgroundModal: React.FC<CertificateBackgroundModalProps> = ({
  isOpen,
  school,
  onClose,
  onSaveBackground
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLDivElement>(null);

  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => {
    if (school.certificateTheme === 'ROYAL_BLUE') return 'preset-moeys-royal-blue';
    if (school.certificateTheme === 'EMERALD') return 'preset-emerald-prestige';
    if (school.certificateTheme === 'PARCHMENT') return 'preset-vintage-parchment';
    if (school.certificateBackgroundUrl) return 'custom-uploaded';
    return 'preset-royal-khmer-gold';
  });

  const [backgroundUrl, setBackgroundUrl] = useState<string>(
    school.certificateBackgroundUrl || CERTIFICATE_PRESETS[0].url
  );
  const [bgOpacity, setBgOpacity] = useState<number>(
    school.certificateBgOpacity !== undefined ? school.certificateBgOpacity : 0.95
  );
  const [borderStyle, setBorderStyle] = useState<'ORNATE_GOLD' | 'ROYAL_BLUE' | 'EMERALD' | 'PARCHMENT' | 'MINIMAL' | 'NONE'>(
    school.certificateBorderStyle || 'ORNATE_GOLD'
  );
  const [theme, setTheme] = useState<'CLASSIC_GOLD' | 'ROYAL_BLUE' | 'EMERALD' | 'PARCHMENT' | 'CUSTOM'>(
    school.certificateTheme || 'CLASSIC_GOLD'
  );

  // Primary Tool Modes
  type ToolMode = 'BACKGROUND' | 'EDIT_TEXT' | 'MOVE_TEXT' | 'TRANSFORM_TEXT';
  const [toolMode, setToolMode] = useState<ToolMode>('BACKGROUND');

  // Active Selected Element for on-canvas editing / moving / transforming
  const [selectedElementId, setSelectedElementId] = useState<string>('cert_title');

  // Background sub-tabs
  const [urlInput, setUrlInput] = useState('');
  const [bgSubTab, setBgSubTab] = useState<'UPLOAD' | 'PRESETS' | 'URL'>('UPLOAD');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Dragging on canvas state
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [elementInitialOffset, setElementInitialOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Default Text Elements Configuration
  const initialTextItems: Record<string, CertTextItem> = useMemo(() => {
    const saved = (school.certificateCustomLayout || {}) as Record<string, Partial<CertTextItem>>;
    return {
      kingdom_header: {
        id: 'kingdom_header',
        labelKhmer: 'ចំណងជើងព្រះរាជាណាចក្រ',
        labelEnglish: 'Kingdom Header',
        category: 'HEADER',
        text: 'ព្រះរាជាណាចក្រកម្ពុជា',
        offsetX: 0,
        offsetY: 0,
        fontSizeScale: 1.05,
        color: '#451a03',
        fontWeight: 'bold',
        fontFamily: 'battambang',
        fontStyle: 'normal',
        textDecoration: 'none',
        letterSpacing: 1,
        textAlign: 'center',
        textTransform: 'none',
        rotation: 0,
        shadow: 'none',
        ...(saved.kingdom_header || {})
      },
      kingdom_motto: {
        id: 'kingdom_motto',
        labelKhmer: 'ពាក្យស្លោកជាតិ',
        labelEnglish: 'Kingdom Motto',
        category: 'HEADER',
        text: 'ជាតិ សាសនា ព្រះមហាក្សត្រ',
        offsetX: 0,
        offsetY: 0,
        fontSizeScale: 0.9,
        color: '#78350f',
        fontWeight: 'bold',
        fontFamily: 'battambang',
        fontStyle: 'normal',
        textDecoration: 'none',
        letterSpacing: 2,
        textAlign: 'center',
        textTransform: 'none',
        rotation: 0,
        shadow: 'none',
        ...(saved.kingdom_motto || {})
      },
      ministry_school: {
        id: 'ministry_school',
        labelKhmer: 'ក្រសួង & ឈ្មោះសាលា',
        labelEnglish: 'Ministry & School',
        category: 'HEADER',
        text: `ក្រសួងអប់រំ យុវជន និងកីឡា\n${school.nameKhmer || 'វិទ្យាល័យ តាឯក'}`,
        offsetX: 0,
        offsetY: 0,
        fontSizeScale: 0.9,
        color: '#1e293b',
        fontWeight: 'bold',
        fontFamily: 'battambang',
        fontStyle: 'normal',
        textDecoration: 'none',
        letterSpacing: 0,
        textAlign: 'left',
        textTransform: 'none',
        rotation: 0,
        shadow: 'none',
        ...(saved.ministry_school || {})
      },
      cert_code: {
        id: 'cert_code',
        labelKhmer: 'លេខកូដ & ឆ្នាំសិក្សា',
        labelEnglish: 'Cert Code & Year',
        category: 'HEADER',
        text: `លេខ: SIS-CERT-2026\nឆ្នាំ: ${school.academicYear || '2025-2026'}`,
        offsetX: 0,
        offsetY: 0,
        fontSizeScale: 0.85,
        color: '#475569',
        fontWeight: 'semibold',
        fontFamily: 'sans',
        fontStyle: 'normal',
        textDecoration: 'none',
        letterSpacing: 0,
        textAlign: 'right',
        textTransform: 'none',
        rotation: 0,
        shadow: 'none',
        ...(saved.cert_code || {})
      },
      cert_title: {
        id: 'cert_title',
        labelKhmer: 'ចំណងជើងប័ណ្ណសរសើរ',
        labelEnglish: 'Certificate Title',
        category: 'TITLE',
        text: 'ប័ណ្ណសរសើរ សិស្សឆ្នើមប្រចាំឆ្នាំ',
        offsetX: 0,
        offsetY: 0,
        fontSizeScale: 1.25,
        color: '#451a03',
        fontWeight: 'extrabold',
        fontFamily: 'battambang',
        fontStyle: 'normal',
        textDecoration: 'none',
        letterSpacing: 1,
        textAlign: 'center',
        textTransform: 'none',
        rotation: 0,
        shadow: 'gold',
        ...(saved.cert_title || {})
      },
      cert_subtitle: {
        id: 'cert_subtitle',
        labelKhmer: 'ចំណងជើងរងអង់គ្លេស',
        labelEnglish: 'Certificate Subtitle',
        category: 'TITLE',
        text: 'CERTIFICATE OF HONOR',
        offsetX: 0,
        offsetY: 0,
        fontSizeScale: 0.85,
        color: '#92400e',
        fontWeight: 'bold',
        fontFamily: 'sans',
        fontStyle: 'normal',
        textDecoration: 'none',
        letterSpacing: 3,
        textAlign: 'center',
        textTransform: 'uppercase',
        rotation: 0,
        shadow: 'none',
        ...(saved.cert_subtitle || {})
      },
      recipient_intro: {
        id: 'recipient_intro',
        labelKhmer: 'ពាក្យផ្តើមប្រគល់ជូន',
        labelEnglish: 'Recipient Intro',
        category: 'RECIPIENT',
        text: 'សូមប្រគល់ជូនដល់សិស្សឈ្មោះ៖',
        offsetX: 0,
        offsetY: 0,
        fontSizeScale: 0.9,
        color: '#334155',
        fontWeight: 'normal',
        fontFamily: 'kantumruy',
        fontStyle: 'normal',
        textDecoration: 'none',
        letterSpacing: 0,
        textAlign: 'center',
        textTransform: 'none',
        rotation: 0,
        shadow: 'none',
        ...(saved.recipient_intro || {})
      },
      recipient_name: {
        id: 'recipient_name',
        labelKhmer: 'ឈ្មោះសិស្សទទួលប័ណ្ណ',
        labelEnglish: 'Recipient Name',
        category: 'RECIPIENT',
        text: 'សុខ ចាន់ដារ៉ា (SOK CHANDARA)',
        offsetX: 0,
        offsetY: 0,
        fontSizeScale: 1.2,
        color: '#0f172a',
        fontWeight: 'bold',
        fontFamily: 'battambang',
        fontStyle: 'normal',
        textDecoration: 'underline',
        letterSpacing: 0.5,
        textAlign: 'center',
        textTransform: 'none',
        rotation: 0,
        shadow: 'none',
        ...(saved.recipient_name || {})
      },
      recipient_meta: {
        id: 'recipient_meta',
        labelKhmer: 'ព័ត៌មានលម្អិតសិស្ស',
        labelEnglish: 'Recipient Details',
        category: 'RECIPIENT',
        text: 'ភេទ: ប្រុស | ថ្នាក់ទី: 12A | លទ្ធផល: ចំណាត់ថ្នាក់លេខ១',
        offsetX: 0,
        offsetY: 0,
        fontSizeScale: 0.85,
        color: '#475569',
        fontWeight: 'normal',
        fontFamily: 'battambang',
        fontStyle: 'normal',
        textDecoration: 'none',
        letterSpacing: 0,
        textAlign: 'center',
        textTransform: 'none',
        rotation: 0,
        shadow: 'none',
        ...(saved.recipient_meta || {})
      },
      cert_description: {
        id: 'cert_description',
        labelKhmer: 'ខ្លឹមសារលិខិតសរសើរ',
        labelEnglish: 'Commendation Body Text',
        category: 'BODY',
        text: 'ដែលមានការខិតខំប្រឹងប្រែងរៀនសូត្រ ប្រឡងជាប់ចំណាត់ថ្នាក់កិត្តិយស និងមានវិន័យ សីលធម៌ថ្លៃថ្នូរប្រចាំឆ្នាំសិក្សា។',
        offsetX: 0,
        offsetY: 0,
        fontSizeScale: 0.9,
        color: '#1e293b',
        fontWeight: 'normal',
        fontFamily: 'kantumruy',
        fontStyle: 'normal',
        textDecoration: 'none',
        letterSpacing: 0,
        textAlign: 'center',
        textTransform: 'none',
        rotation: 0,
        shadow: 'none',
        ...(saved.cert_description || {})
      },
      cert_date: {
        id: 'cert_date',
        labelKhmer: 'កាលបរិច្ឆេទចេញប័ណ្ណ',
        labelEnglish: 'Date & Location',
        category: 'FOOTER',
        text: `ថ្ងៃទី ${new Date().toISOString().split('T')[0]}`,
        offsetX: 0,
        offsetY: 0,
        fontSizeScale: 0.8,
        color: '#475569',
        fontWeight: 'normal',
        fontFamily: 'battambang',
        fontStyle: 'normal',
        textDecoration: 'none',
        letterSpacing: 0,
        textAlign: 'right',
        textTransform: 'none',
        rotation: 0,
        shadow: 'none',
        ...(saved.cert_date || {})
      },
      director_title: {
        id: 'director_title',
        labelKhmer: 'តួនាទីអ្នកចុះហត្ថលេខា',
        labelEnglish: 'Signer Role Title',
        category: 'FOOTER',
        text: 'នាយកវិទ្យាល័យ',
        offsetX: 0,
        offsetY: 0,
        fontSizeScale: 0.9,
        color: '#0f172a',
        fontWeight: 'bold',
        fontFamily: 'battambang',
        fontStyle: 'normal',
        textDecoration: 'none',
        letterSpacing: 0,
        textAlign: 'right',
        textTransform: 'none',
        rotation: 0,
        shadow: 'none',
        ...(saved.director_title || {})
      },
      director_name: {
        id: 'director_name',
        labelKhmer: 'ឈ្មោះនាយកសាលា',
        labelEnglish: 'Director Name',
        category: 'FOOTER',
        text: school.directorName || 'ឯកឧត្តមបណ្ឌិត រិន សុភ័ក្ត្រ',
        offsetX: 0,
        offsetY: 0,
        fontSizeScale: 0.95,
        color: '#78350f',
        fontWeight: 'bold',
        fontFamily: 'battambang',
        fontStyle: 'normal',
        textDecoration: 'none',
        letterSpacing: 0,
        textAlign: 'right',
        textTransform: 'none',
        rotation: 0,
        shadow: 'none',
        ...(saved.director_name || {})
      }
    };
  }, [school]);

  const [textItems, setTextItems] = useState<Record<string, CertTextItem>>(initialTextItems);

  // Active current item
  const currentItem = textItems[selectedElementId] || textItems.cert_title;

  if (!isOpen) return null;

  // File Upload Handlers
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('សូមជ្រើសរើសឯកសារជារូបភាព (PNG, JPG, SVG, WebP)!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setBackgroundUrl(result);
      setSelectedPresetId('custom-uploaded');
      setTheme('CUSTOM');
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (preset: BackgroundPreset) => {
    setSelectedPresetId(preset.id);
    setBackgroundUrl(preset.url);
    setBorderStyle(preset.borderStyle);
    setTheme(preset.theme);
    setFileName(null);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setBackgroundUrl(urlInput.trim());
    setSelectedPresetId('custom-uploaded');
    setTheme('CUSTOM');
    setFileName('External URL Image');
  };

  // Text state update helpers
  const updateCurrentItem = (updates: Partial<CertTextItem>) => {
    setTextItems(prev => ({
      ...prev,
      [selectedElementId]: {
        ...prev[selectedElementId],
        ...updates
      }
    }));
  };

  // Move Text Nudge Helpers
  const nudgeCurrentItem = (dx: number, dy: number) => {
    updateCurrentItem({
      offsetX: Math.max(-200, Math.min(200, (currentItem.offsetX || 0) + dx)),
      offsetY: Math.max(-200, Math.min(200, (currentItem.offsetY || 0) + dy))
    });
  };

  const resetCurrentItemPosition = () => {
    updateCurrentItem({ offsetX: 0, offsetY: 0, rotation: 0 });
  };

  const resetAllTextItems = () => {
    setTextItems(initialTextItems);
  };

  // Mouse Drag on Canvas
  const handleCanvasMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setSelectedElementId(itemId);
    setIsDraggingElement(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setElementInitialOffset({
      x: textItems[itemId]?.offsetX || 0,
      y: textItems[itemId]?.offsetY || 0
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingElement || !selectedElementId) return;
    const dx = e.clientX - dragStartPos.x;
    const dy = e.clientY - dragStartPos.y;
    updateCurrentItem({
      offsetX: Math.round(elementInitialOffset.x + dx),
      offsetY: Math.round(elementInitialOffset.y + dy)
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingElement(false);
  };

  // Save changes
  const handleSave = () => {
    onSaveBackground({
      backgroundUrl,
      bgOpacity,
      borderStyle,
      theme,
      customLayout: textItems
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleResetToClean = () => {
    const defaultPreset = CERTIFICATE_PRESETS[0];
    setSelectedPresetId(defaultPreset.id);
    setBackgroundUrl(defaultPreset.url);
    setBorderStyle(defaultPreset.borderStyle);
    setTheme(defaultPreset.theme);
    setBgOpacity(0.95);
    setFileName(null);
    setUrlInput('');
    resetAllTextItems();
  };

  // Helper to construct style object for text items
  const getItemInlineStyle = (item: CertTextItem) => {
    const fontFamilyMap: Record<string, string> = {
      battambang: "'Battambang', system-ui, sans-serif",
      kantumruy: "'Kantumruy Pro', system-ui, sans-serif",
      moul: "'Moul', 'Battambang', serif",
      sans: "system-ui, -apple-system, sans-serif",
      serif: "Georgia, Cambria, 'Times New Roman', serif"
    };

    let textShadow = 'none';
    if (item.shadow === 'subtle') textShadow = '0 1px 2px rgba(0,0,0,0.2)';
    if (item.shadow === 'gold') textShadow = '0 1px 3px rgba(217,119,6,0.35)';
    if (item.shadow === 'glow') textShadow = '0 0 6px rgba(245,158,11,0.4)';

    return {
      transform: `translate(${item.offsetX || 0}px, ${item.offsetY || 0}px) rotate(${item.rotation || 0}deg) scale(${item.fontSizeScale || 1})`,
      transformOrigin: item.textAlign === 'left' ? 'left center' : item.textAlign === 'right' ? 'right center' : 'center center',
      color: item.color,
      fontFamily: fontFamilyMap[item.fontFamily] || fontFamilyMap.battambang,
      fontWeight: item.fontWeight === 'extrabold' ? 900 : item.fontWeight === 'bold' ? 700 : item.fontWeight === 'semibold' ? 600 : 400,
      fontStyle: item.fontStyle,
      textDecoration: item.textDecoration === 'underline' ? 'underline' : 'none',
      letterSpacing: `${item.letterSpacing || 0}px`,
      textAlign: item.textAlign,
      textTransform: item.textTransform,
      textShadow,
      transition: isDraggingElement ? 'none' : 'transform 0.15s ease-out, color 0.15s ease'
    };
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
    >
      <div className="relative w-full max-w-6xl bg-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-amber-950/50 space-y-5 my-4 max-h-[94vh] flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-950/40">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-battambang flex items-center gap-2">
                <span>កំណត់ & ផ្ទុកឡើង Background វិញ្ញាបនបត្រ & លិខិត</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans font-medium">
                  HD Certificate Studio
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">Upload Background, Edit Texts, Move Layout & Transform Typography</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRIMARY TOOLBAR: 4 Primary Design Modes */}
        <div className="flex items-center justify-between flex-wrap gap-2 bg-slate-950/70 p-1.5 rounded-2xl border border-white/10 shrink-0 font-battambang">
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs overflow-x-auto custom-scrollbar">
            
            {/* Mode 1: Background */}
            <button
              type="button"
              id="btn-tab-cert-bg"
              onClick={() => setToolMode('BACKGROUND')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
                toolMode === 'BACKGROUND'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950/60 ring-1 ring-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-amber-300" />
              <span>Background & ស៊ុម</span>
            </button>

            {/* Mode 2: Edit Text (Requested Button) */}
            <button
              type="button"
              id="btn-tab-edit-text"
              onClick={() => setToolMode('EDIT_TEXT')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
                toolMode === 'EDIT_TEXT'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/60 ring-1 ring-cyan-400'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Type className="w-4 h-4 text-cyan-300" />
              <span>✏️ Edit text (កែអត្ថបទ)</span>
            </button>

            {/* Mode 3: Move Text (Requested Button) */}
            <button
              type="button"
              id="btn-tab-move-text"
              onClick={() => setToolMode('MOVE_TEXT')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
                toolMode === 'MOVE_TEXT'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/60 ring-1 ring-emerald-400'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Move className="w-4 h-4 text-emerald-300" />
              <span>✥ Move text (ផ្លាស់ទី)</span>
            </button>

            {/* Mode 4: Transform Text (Requested Button) */}
            <button
              type="button"
              id="btn-tab-transform-text"
              onClick={() => setToolMode('TRANSFORM_TEXT')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
                toolMode === 'TRANSFORM_TEXT'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-950/60 ring-1 ring-purple-400'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Wand2 className="w-4 h-4 text-purple-300" />
              <span>⚡ Transform text (បម្លែងទម្រង់)</span>
            </button>

          </div>

          {/* Quick Active Element Selector */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 text-[11px] hidden sm:inline">អត្ថបទសកម្ម៖</span>
            <select
              value={selectedElementId}
              onChange={(e) => setSelectedElementId(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-battambang focus:border-amber-400 outline-none"
            >
              {(Object.values(textItems) as CertTextItem[]).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.labelKhmer} ({item.labelEnglish})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Layout: 2 Columns (Controls on Left, Live Mockup on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto pr-1 flex-1">
          
          {/* Left Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 overflow-y-auto max-h-[58vh] pr-1.5 custom-scrollbar">
            
            {/* PANEL 1: BACKGROUND & FRAME */}
            {toolMode === 'BACKGROUND' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Background Tabs */}
                <div className="flex p-1 bg-slate-800/80 rounded-2xl border border-white/10 font-battambang text-xs">
                  <button
                    type="button"
                    onClick={() => setBgSubTab('UPLOAD')}
                    className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center space-x-1.5 transition ${
                      bgSubTab === 'UPLOAD'
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>ផ្ទុកឡើង (Upload)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgSubTab('PRESETS')}
                    className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center space-x-1.5 transition ${
                      bgSubTab === 'PRESETS'
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>គំរូក្បាច់ (Presets)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgSubTab('URL')}
                    className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center space-x-1.5 transition ${
                      bgSubTab === 'URL'
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Link URL</span>
                  </button>
                </div>

                {/* Sub Tab: Upload */}
                {bgSubTab === 'UPLOAD' && (
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={() => setIsDraggingFile(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-5 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
                        isDraggingFile
                          ? 'border-amber-400 bg-amber-500/10'
                          : 'border-slate-700 hover:border-amber-500/60 bg-slate-800/40 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2 shadow-inner">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-white font-battambang">ចុចទីនេះ ឬទម្លាក់រូបភាព Background</p>
                      <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WebP, SVG (A4 Landscape 4:3 ឬ 16:9)</p>
                      <div className="mt-2 px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-amber-300 font-sans">
                        ទំហំច្បាស់កម្រិតខ្ពស់ (HD/4K Recommended)
                      </div>
                    </div>

                    {fileName && (
                      <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-200">
                        <div className="flex items-center space-x-2 truncate">
                          <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="truncate font-mono text-[11px]">{fileName}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md shrink-0">បានជ្រើស</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub Tab: Presets */}
                {bgSubTab === 'PRESETS' && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-slate-300 font-battambang">ជ្រើសរើសគំរូក្បាច់កិត្តិយសផ្លូវការដែលរចនារួចជាស្រេច៖</p>
                    <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {CERTIFICATE_PRESETS.map((preset) => {
                        const isSelected = selectedPresetId === preset.id;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => handleSelectPreset(preset)}
                            className={`p-2 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-1.5 ${
                              isSelected
                                ? 'bg-amber-950/50 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                                : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                            }`}
                          >
                            <div className="relative aspect-[3/2] w-full rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                              <img
                                src={preset.thumbnail}
                                alt={preset.nameKhmer}
                                className="w-full h-full object-cover"
                              />
                              {preset.badge && (
                                <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-amber-500 text-slate-950 font-battambang">
                                  {preset.badge}
                                </span>
                              )}
                              {isSelected && (
                                <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-white font-battambang leading-tight">{preset.nameKhmer}</p>
                              <p className="text-[9px] text-slate-400 line-clamp-1">{preset.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sub Tab: URL */}
                {bgSubTab === 'URL' && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-slate-300 font-battambang">បញ្ចូលតំណភ្ជាប់រូបភាព Background ពីអ៊ីនធឺណិត (Web Image Link):</p>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/certificate-background.jpg"
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyUrl}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold font-battambang transition cursor-pointer"
                      >
                        អនុវត្ត
                      </button>
                    </div>
                  </div>
                )}

                {/* Style & Opacity Controls */}
                <div className="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-battambang border-b border-slate-700 pb-2">
                    <span className="text-slate-300 flex items-center space-x-1.5">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span>កម្រិតពន្លឺ & ស៊ុមគែម (Style & Opacity)</span>
                    </span>
                    <span className="font-mono text-amber-300 font-bold">{Math.round(bgOpacity * 100)}%</span>
                  </div>

                  {/* Opacity Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>ស្រាល (Watermark)</span>
                      <span>ផ្ទៃច្បាស់ (Full Solid)</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="1"
                      step="0.05"
                      value={bgOpacity}
                      onChange={(e) => setBgOpacity(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Border Mode */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-battambang block">ទម្រង់ស៊ុមគែម (Border Framing):</label>
                    <select
                      value={borderStyle}
                      onChange={(e) => setBorderStyle(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 outline-none font-battambang"
                    >
                      <option value="ORNATE_GOLD">ស៊ុមមាស Classic Ornate (Double Gold Border)</option>
                      <option value="ROYAL_BLUE">ស៊ុមខៀវរាជ MoEYS Royal Blue</option>
                      <option value="EMERALD">ស៊ុមត្បូងមរកត Emerald Luxury</option>
                      <option value="PARCHMENT">ស៊ុមក្រដាសបុរាណ Vintage Border</option>
                      <option value="MINIMAL">ស៊ុមស្ដើងទាន់សម័យ Minimal Frame</option>
                      <option value="NONE">គ្មានស៊ុម (No Border - សម្រាប់ Background ពេញលេញ)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 2: EDIT TEXT (Requested Feature) */}
            {toolMode === 'EDIT_TEXT' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Type className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-200 font-battambang">
                      កែសម្រួលខ្លឹមសារអត្ថបទ (Edit Text Content)
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                    {currentItem.labelKhmer}
                  </span>
                </div>

                {/* Primary Field Editor for Active Selection */}
                <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-slate-200 font-battambang flex items-center justify-between">
                    <span>{currentItem.labelKhmer} ({currentItem.labelEnglish})</span>
                    <span className="text-[10px] text-cyan-400 font-sans">កំពុងកែសម្រួលផ្ទាល់</span>
                  </label>
                  
                  {currentItem.text.includes('\n') || currentItem.category === 'BODY' ? (
                    <textarea
                      rows={3}
                      value={currentItem.text}
                      onChange={(e) => updateCurrentItem({ text: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-battambang"
                      placeholder="បញ្ចូលខ្លឹមសារ..."
                    />
                  ) : (
                    <input
                      type="text"
                      value={currentItem.text}
                      onChange={(e) => updateCurrentItem({ text: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/50 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-battambang"
                      placeholder="បញ្ចូលខ្លឹមសារ..."
                    />
                  )}
                </div>

                {/* Quick List of All Certificate Fields */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-300 font-battambang">បញ្ជីអត្ថបទទាំងអស់លើវិញ្ញាបនបត្រ៖</p>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                    {(Object.values(textItems) as CertTextItem[]).map((item) => {
                      const isSelected = selectedElementId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedElementId(item.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition ${
                            isSelected
                              ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/40 text-white'
                              : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-500 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-battambang mb-1">
                            <span className="font-bold text-cyan-300">{item.labelKhmer}</span>
                            <span className="text-[9px] text-slate-400 font-sans">{item.labelEnglish}</span>
                          </div>
                          <p className="text-xs truncate font-battambang text-slate-200">
                            {item.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 3: MOVE TEXT (Requested Feature) */}
            {toolMode === 'MOVE_TEXT' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Move className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-200 font-battambang">
                      ផ្លាស់ទីទីតាំងអត្ថបទ (Move & Position Text)
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    X: {currentItem.offsetX || 0}px | Y: {currentItem.offsetY || 0}px
                  </span>
                </div>

                {/* Interactive Direction Pad */}
                <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-3">
                  <p className="text-xs text-slate-300 font-battambang text-center">
                    ផ្លាស់ទីអត្ថបទ <strong className="text-emerald-300">{currentItem.labelKhmer}</strong>៖
                  </p>

                  <div className="flex flex-col items-center justify-center space-y-2 py-2">
                    {/* Up */}
                    <button
                      type="button"
                      onClick={() => nudgeCurrentItem(0, -6)}
                      className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-emerald-600 text-white flex items-center justify-center transition shadow-md cursor-pointer border border-white/10"
                      title="រំកិលឡើងលើ (Move Up)"
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>

                    {/* Middle Row: Left, Reset, Right */}
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => nudgeCurrentItem(-6, 0)}
                        className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-emerald-600 text-white flex items-center justify-center transition shadow-md cursor-pointer border border-white/10"
                        title="រំកិលទៅឆ្វេង (Move Left)"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={resetCurrentItemPosition}
                        className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold font-battambang border border-slate-700 cursor-pointer"
                        title="កំណត់ទីតាំងកណ្តាលដើម (Center Reset)"
                      >
                        ចំកណ្តាល (0,0)
                      </button>

                      <button
                        type="button"
                        onClick={() => nudgeCurrentItem(6, 0)}
                        className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-emerald-600 text-white flex items-center justify-center transition shadow-md cursor-pointer border border-white/10"
                        title="រំកិលទៅស្តាំ (Move Right)"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Down */}
                    <button
                      type="button"
                      onClick={() => nudgeCurrentItem(0, 6)}
                      className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-emerald-600 text-white flex items-center justify-center transition shadow-md cursor-pointer border border-white/10"
                      title="រំកិលចុះក្រោម (Move Down)"
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Sliders for exact Precision */}
                  <div className="space-y-3 pt-2 border-t border-slate-700/60">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>ផ្ដេក (X Offset):</span>
                        <span className="font-mono text-emerald-300">{currentItem.offsetX || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="-150"
                        max="150"
                        step="2"
                        value={currentItem.offsetX || 0}
                        onChange={(e) => updateCurrentItem({ offsetX: parseInt(e.target.value) })}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>បញ្ឈរ (Y Offset):</span>
                        <span className="font-mono text-emerald-300">{currentItem.offsetY || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="-150"
                        max="150"
                        step="2"
                        value={currentItem.offsetY || 0}
                        onChange={(e) => updateCurrentItem({ offsetY: parseInt(e.target.value) })}
                        className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
                      />
                    </div>
                  </div>

                  {/* Alignment Preset Buttons */}
                  <div className="pt-2 flex items-center justify-between text-xs font-battambang">
                    <span className="text-slate-400 text-[11px]">តម្រឹម (Align):</span>
                    <div className="flex space-x-1.5">
                      <button
                        type="button"
                        onClick={() => updateCurrentItem({ textAlign: 'left', offsetX: -30 })}
                        className={`p-1.5 rounded-lg border ${currentItem.textAlign === 'left' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCurrentItem({ textAlign: 'center', offsetX: 0 })}
                        className={`p-1.5 rounded-lg border ${currentItem.textAlign === 'center' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCurrentItem({ textAlign: 'right', offsetX: 30 })}
                        className={`p-1.5 rounded-lg border ${currentItem.textAlign === 'right' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-battambang text-center">
                    💡 គន្លឹះ៖ លោកអ្នកក៏អាចចុចផ្ទាល់ និងអូស (Drag) អត្ថបទនៅលើផ្ទាំង Preview ខាងស្តាំបានដែរ!
                  </p>
                </div>
              </div>
            )}

            {/* PANEL 4: TRANSFORM TEXT (Requested Feature) */}
            {toolMode === 'TRANSFORM_TEXT' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-purple-200 font-battambang">
                      បម្លែងទម្រង់ & រចនាប័ទ្មអក្សរ (Transform Text)
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                    {currentItem.labelKhmer}
                  </span>
                </div>

                <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-3.5">
                  
                  {/* Font Size Scaling */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-300 font-battambang">
                      <span className="flex items-center space-x-1">
                        <ZoomIn className="w-3.5 h-3.5 text-purple-400" />
                        <span>ទំហំអក្សរ (Font Size Scale):</span>
                      </span>
                      <span className="font-mono text-purple-300 font-bold">{Math.round((currentItem.fontSizeScale || 1) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="2.2"
                      step="0.05"
                      value={currentItem.fontSizeScale || 1}
                      onChange={(e) => updateCurrentItem({ fontSizeScale: parseFloat(e.target.value) })}
                      className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
                    />
                    <div className="flex items-center justify-between gap-1 text-[10px] font-battambang pt-1">
                      {[
                        { label: 'តូច (80%)', scale: 0.8 },
                        { label: 'ធម្មតា (100%)', scale: 1.0 },
                        { label: 'ធំ (130%)', scale: 1.3 },
                        { label: 'ធំខ្លាំង (160%)', scale: 1.6 }
                      ].map(preset => (
                        <button
                          key={preset.scale}
                          type="button"
                          onClick={() => updateCurrentItem({ fontSizeScale: preset.scale })}
                          className={`px-2 py-1 rounded-lg border transition cursor-pointer ${
                            Math.abs((currentItem.fontSizeScale || 1) - preset.scale) < 0.04
                              ? 'bg-purple-600 text-white border-purple-400'
                              : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Family Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-battambang block">ពុម្ពអក្សរ (Font Family):</label>
                    <div className="grid grid-cols-2 gap-1.5 text-xs font-battambang">
                      {[
                        { id: 'battambang', label: 'បាត់ដំបង (Battambang)' },
                        { id: 'kantumruy', label: 'កន្ទុំរុយ (Kantumruy Pro)' },
                        { id: 'moul', label: 'ក្បាច់មូល (Moul Classic)' },
                        { id: 'sans', label: 'អង់គ្លេស Sans-Serif' },
                        { id: 'serif', label: 'រ៉ូម៉ាំង Classical Serif' }
                      ].map(font => (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => updateCurrentItem({ fontFamily: font.id as any })}
                          className={`px-2.5 py-1.5 rounded-xl border text-left truncate transition cursor-pointer text-[11px] ${
                            currentItem.fontFamily === font.id
                              ? 'bg-purple-950 border-purple-400 text-white font-bold'
                              : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {font.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Color Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-battambang">
                      <span className="flex items-center space-x-1">
                        <Palette className="w-3.5 h-3.5 text-purple-400" />
                        <span>ពណ៌អក្សរ (Text Color):</span>
                      </span>
                      <span className="font-mono text-[11px] text-purple-300">{currentItem.color}</span>
                    </div>

                    <div className="flex items-center flex-wrap gap-1.5">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => updateCurrentItem({ color: color.value })}
                          title={color.name}
                          className={`w-7 h-7 rounded-full border-2 transition shadow-xs cursor-pointer flex items-center justify-center ${
                            currentItem.color === color.value
                              ? 'ring-2 ring-purple-400 scale-110 border-white'
                              : 'border-white/20 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.value }}
                        >
                          {currentItem.color === color.value && (
                            <Check className="w-3.5 h-3.5 text-white drop-shadow-md stroke-[3]" />
                          )}
                        </button>
                      ))}

                      {/* Custom Color Input */}
                      <label className="w-7 h-7 rounded-full border border-white/20 bg-slate-900 flex items-center justify-center cursor-pointer overflow-hidden" title="ជ្រើសពណ៌ផ្ទាល់ខ្លួន (Custom)">
                        <input
                          type="color"
                          value={currentItem.color || '#000000'}
                          onChange={(e) => updateCurrentItem({ color: e.target.value })}
                          className="opacity-0 w-full h-full cursor-pointer"
                        />
                        <Palette className="w-3.5 h-3.5 text-purple-300 pointer-events-none" />
                      </label>
                    </div>
                  </div>

                  {/* Styling Toggles: Bold, Italic, Underline, Uppercase */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-battambang block">រចនាប័ទ្មបន្ថែម (Styles & Effects):</label>
                    <div className="flex items-center flex-wrap gap-1.5 text-xs font-battambang">
                      {/* Bold */}
                      <button
                        type="button"
                        onClick={() => updateCurrentItem({
                          fontWeight: currentItem.fontWeight === 'bold' || currentItem.fontWeight === 'extrabold' ? 'normal' : 'bold'
                        })}
                        className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1 cursor-pointer transition ${
                          currentItem.fontWeight === 'bold' || currentItem.fontWeight === 'extrabold'
                            ? 'bg-purple-600 text-white border-purple-400 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        <Bold className="w-3.5 h-3.5" />
                        <span>ដិត (Bold)</span>
                      </button>

                      {/* Italic */}
                      <button
                        type="button"
                        onClick={() => updateCurrentItem({
                          fontStyle: currentItem.fontStyle === 'italic' ? 'normal' : 'italic'
                        })}
                        className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1 cursor-pointer transition ${
                          currentItem.fontStyle === 'italic'
                            ? 'bg-purple-600 text-white border-purple-400 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        <Italic className="w-3.5 h-3.5" />
                        <span>ទ្រេត (Italic)</span>
                      </button>

                      {/* Underline */}
                      <button
                        type="button"
                        onClick={() => updateCurrentItem({
                          textDecoration: currentItem.textDecoration === 'underline' ? 'none' : 'underline'
                        })}
                        className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1 cursor-pointer transition ${
                          currentItem.textDecoration === 'underline'
                            ? 'bg-purple-600 text-white border-purple-400 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        <Underline className="w-3.5 h-3.5" />
                        <span>គូសបន្ទាត់</span>
                      </button>

                      {/* Uppercase */}
                      <button
                        type="button"
                        onClick={() => updateCurrentItem({
                          textTransform: currentItem.textTransform === 'uppercase' ? 'none' : 'uppercase'
                        })}
                        className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1 cursor-pointer transition ${
                          currentItem.textTransform === 'uppercase'
                            ? 'bg-purple-600 text-white border-purple-400 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        <span>AA អក្សរធំ</span>
                      </button>
                    </div>
                  </div>

                  {/* Letter Spacing Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400 font-battambang">
                      <span>គម្លាតតួអក្សរ (Tracking / Letter Spacing):</span>
                      <span className="font-mono text-purple-300">{currentItem.letterSpacing || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-1"
                      max="10"
                      step="0.5"
                      value={currentItem.letterSpacing || 0}
                      onChange={(e) => updateCurrentItem({ letterSpacing: parseFloat(e.target.value) })}
                      className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Rotation Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400 font-battambang">
                      <span className="flex items-center space-x-1">
                        <RotateCw className="w-3.5 h-3.5 text-purple-400" />
                        <span>បង្វិល (Rotation):</span>
                      </span>
                      <span className="font-mono text-purple-300">{currentItem.rotation || 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="1"
                      value={currentItem.rotation || 0}
                      onChange={(e) => updateCurrentItem({ rotation: parseInt(e.target.value) })}
                      className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
                    />
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Right Live Preview Canvas (7 Cols) */}
          <div className="lg:col-span-7 space-y-2.5 flex flex-col justify-between">
            
            {/* Canvas Header Toolbar */}
            <div className="flex items-center justify-between text-xs text-slate-300 font-battambang">
              <span className="flex items-center space-x-1.5">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>ការបង្ហាញផ្ទាល់ (Live Certificate Mockup Preview):</span>
              </span>
              
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-amber-400 font-sans hidden sm:inline">A4 Landscape HD</span>
                <button
                  type="button"
                  onClick={resetAllTextItems}
                  className="text-[10px] px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition border border-white/10 cursor-pointer"
                  title="កំណត់អត្ថបទទាំងអស់ឡើងវិញ (Reset All Texts)"
                >
                  Reset All Layout
                </button>
              </div>
            </div>

            {/* Certificate Preview Card with Background Image and Interactive Text Layers */}
            <div 
              ref={previewCanvasRef}
              className="relative aspect-[4/2.9] w-full rounded-2xl overflow-hidden border-4 border-amber-900/40 shadow-2xl bg-slate-950 flex items-center justify-center p-4 select-none"
            >
              
              {/* Background Layer */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-300 pointer-events-none"
                style={{
                  backgroundImage: `url("${backgroundUrl}")`,
                  opacity: bgOpacity
                }}
              />

              {/* Dynamic Frame styling depending on borderStyle */}
              {borderStyle === 'ORNATE_GOLD' && (
                <div className="absolute inset-3 border-4 border-double border-amber-600 rounded-lg pointer-events-none shadow-sm" />
              )}
              {borderStyle === 'ROYAL_BLUE' && (
                <div className="absolute inset-3 border-4 border-blue-900 rounded-lg pointer-events-none shadow-sm" />
              )}
              {borderStyle === 'EMERALD' && (
                <div className="absolute inset-3 border-4 border-emerald-800 rounded-lg pointer-events-none shadow-sm" />
              )}
              {borderStyle === 'MINIMAL' && (
                <div className="absolute inset-3 border border-amber-500/60 rounded-lg pointer-events-none shadow-sm" />
              )}

              {/* Realistic Overlay Preview Content with Interactive Draggable/Editable Text Blocks */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between text-center p-2 text-slate-900">
                
                {/* 1. TOP KINGDOM HEADER */}
                <div className="relative">
                  
                  {/* Kingdom Main */}
                  <div
                    onMouseDown={(e) => handleCanvasMouseDown(e, 'kingdom_header')}
                    onClick={() => setSelectedElementId('kingdom_header')}
                    className={`cursor-move transition-all inline-block px-2 py-0.5 rounded-lg ${
                      selectedElementId === 'kingdom_header'
                        ? 'ring-2 ring-amber-400 bg-amber-500/10 shadow-xs'
                        : 'hover:bg-amber-500/5'
                    }`}
                    style={getItemInlineStyle(textItems.kingdom_header)}
                  >
                    <h4 className="text-[13px] leading-tight font-battambang">
                      {textItems.kingdom_header.text}
                    </h4>
                  </div>

                  {/* Kingdom Motto */}
                  <div
                    onMouseDown={(e) => handleCanvasMouseDown(e, 'kingdom_motto')}
                    onClick={() => setSelectedElementId('kingdom_motto')}
                    className={`cursor-move transition-all block px-2 py-0.5 rounded-lg ${
                      selectedElementId === 'kingdom_motto'
                        ? 'ring-2 ring-amber-400 bg-amber-500/10'
                        : 'hover:bg-amber-500/5'
                    }`}
                    style={getItemInlineStyle(textItems.kingdom_motto)}
                  >
                    <p className="text-[9px] font-battambang">
                      {textItems.kingdom_motto.text}
                    </p>
                  </div>

                  <div className="w-12 h-0.5 bg-amber-600 mx-auto my-1 opacity-60" />
                  
                  {/* Ministry & Logo & Cert Code Row */}
                  <div className="flex items-center justify-between px-3 mt-1 text-[9px]">
                    {/* Ministry / School */}
                    <div
                      onMouseDown={(e) => handleCanvasMouseDown(e, 'ministry_school')}
                      onClick={() => setSelectedElementId('ministry_school')}
                      className={`cursor-move transition-all px-1.5 py-0.5 rounded-lg max-w-[40%] ${
                        selectedElementId === 'ministry_school'
                          ? 'ring-2 ring-amber-400 bg-amber-500/10'
                          : 'hover:bg-amber-500/5'
                      }`}
                      style={getItemInlineStyle(textItems.ministry_school)}
                    >
                      <p className="whitespace-pre-line leading-tight">
                        {textItems.ministry_school.text}
                      </p>
                    </div>

                    <img
                      src={school.logo}
                      alt="Logo"
                      className="w-7 h-7 rounded-full object-cover border border-amber-500 shadow-xs"
                    />

                    {/* Cert Code */}
                    <div
                      onMouseDown={(e) => handleCanvasMouseDown(e, 'cert_code')}
                      onClick={() => setSelectedElementId('cert_code')}
                      className={`cursor-move transition-all px-1.5 py-0.5 rounded-lg max-w-[40%] ${
                        selectedElementId === 'cert_code'
                          ? 'ring-2 ring-amber-400 bg-amber-500/10'
                          : 'hover:bg-amber-500/5'
                      }`}
                      style={getItemInlineStyle(textItems.cert_code)}
                    >
                      <p className="whitespace-pre-line leading-tight">
                        {textItems.cert_code.text}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. CENTER TITLE & RECIPIENT */}
                <div className="my-auto space-y-1 relative">
                  
                  {/* Main Title */}
                  <div
                    onMouseDown={(e) => handleCanvasMouseDown(e, 'cert_title')}
                    onClick={() => setSelectedElementId('cert_title')}
                    className={`cursor-move transition-all inline-flex items-center space-x-1 px-3 py-1 rounded-xl ${
                      selectedElementId === 'cert_title'
                        ? 'ring-2 ring-amber-400 bg-amber-500/15 shadow-md'
                        : 'hover:bg-amber-500/5'
                    }`}
                    style={getItemInlineStyle(textItems.cert_title)}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-sm font-extrabold border-b border-amber-600 px-1">
                      {textItems.cert_title.text}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  </div>

                  {/* Subtitle */}
                  <div
                    onMouseDown={(e) => handleCanvasMouseDown(e, 'cert_subtitle')}
                    onClick={() => setSelectedElementId('cert_subtitle')}
                    className={`cursor-move transition-all block px-2 py-0.5 rounded-lg ${
                      selectedElementId === 'cert_subtitle'
                        ? 'ring-2 ring-amber-400 bg-amber-500/10'
                        : 'hover:bg-amber-500/5'
                    }`}
                    style={getItemInlineStyle(textItems.cert_subtitle)}
                  >
                    <p className="text-[8px] font-bold">
                      {textItems.cert_subtitle.text}
                    </p>
                  </div>

                  {/* Recipient Details Block */}
                  <div className="pt-1 space-y-0.5">
                    {/* Intro */}
                    <div
                      onMouseDown={(e) => handleCanvasMouseDown(e, 'recipient_intro')}
                      onClick={() => setSelectedElementId('recipient_intro')}
                      className={`cursor-move transition-all inline-block px-2 py-0.5 rounded-lg ${
                        selectedElementId === 'recipient_intro'
                          ? 'ring-2 ring-amber-400 bg-amber-500/10'
                          : 'hover:bg-amber-500/5'
                      }`}
                      style={getItemInlineStyle(textItems.recipient_intro)}
                    >
                      <p className="text-[9px]">
                        {textItems.recipient_intro.text}
                      </p>
                    </div>

                    {/* Student Name */}
                    <div>
                      <div
                        onMouseDown={(e) => handleCanvasMouseDown(e, 'recipient_name')}
                        onClick={() => setSelectedElementId('recipient_name')}
                        className={`cursor-move transition-all inline-block px-3 py-1 rounded-xl ${
                          selectedElementId === 'recipient_name'
                            ? 'ring-2 ring-amber-400 bg-amber-500/15 shadow-sm'
                            : 'hover:bg-amber-500/5'
                        }`}
                        style={getItemInlineStyle(textItems.recipient_name)}
                      >
                        <p className="text-sm font-bold underline decoration-amber-500">
                          {textItems.recipient_name.text}
                        </p>
                      </div>
                    </div>

                    {/* Recipient Meta */}
                    <div
                      onMouseDown={(e) => handleCanvasMouseDown(e, 'recipient_meta')}
                      onClick={() => setSelectedElementId('recipient_meta')}
                      className={`cursor-move transition-all inline-block px-2 py-0.5 rounded-lg ${
                        selectedElementId === 'recipient_meta'
                          ? 'ring-2 ring-amber-400 bg-amber-500/10'
                          : 'hover:bg-amber-500/5'
                      }`}
                      style={getItemInlineStyle(textItems.recipient_meta)}
                    >
                      <p className="text-[8px]">
                        {textItems.recipient_meta.text}
                      </p>
                    </div>

                    {/* Commendation Description */}
                    <div
                      onMouseDown={(e) => handleCanvasMouseDown(e, 'cert_description')}
                      onClick={() => setSelectedElementId('cert_description')}
                      className={`cursor-move transition-all block px-4 py-1 rounded-xl max-w-[85%] mx-auto ${
                        selectedElementId === 'cert_description'
                          ? 'ring-2 ring-amber-400 bg-amber-500/10'
                          : 'hover:bg-amber-500/5'
                      }`}
                      style={getItemInlineStyle(textItems.cert_description)}
                    >
                      <p className="text-[8.5px] leading-relaxed">
                        {textItems.cert_description.text}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. FOOTER SIGNATURES & QR */}
                <div className="flex items-end justify-between px-3 text-[8px] pt-1 border-t border-amber-900/20">
                  <div className="text-left font-mono text-[7px] text-slate-500">
                    <div className="w-6 h-6 border border-slate-400 bg-white/80 rounded-sm mb-0.5 flex items-center justify-center font-bold text-[6px]">QR</div>
                    <span>VERIFY CODE</span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-xs flex items-center justify-center text-amber-950">
                    <Award className="w-4 h-4" />
                  </div>

                  {/* Signatures */}
                  <div className="text-right font-battambang space-y-0.5">
                    {/* Date */}
                    <div
                      onMouseDown={(e) => handleCanvasMouseDown(e, 'cert_date')}
                      onClick={() => setSelectedElementId('cert_date')}
                      className={`cursor-move transition-all inline-block px-1.5 py-0.5 rounded-lg ${
                        selectedElementId === 'cert_date'
                          ? 'ring-2 ring-amber-400 bg-amber-500/10'
                          : 'hover:bg-amber-500/5'
                      }`}
                      style={getItemInlineStyle(textItems.cert_date)}
                    >
                      <p className="text-[7px]">
                        {textItems.cert_date.text}
                      </p>
                    </div>

                    {/* Signer Title */}
                    <div>
                      <div
                        onMouseDown={(e) => handleCanvasMouseDown(e, 'director_title')}
                        onClick={() => setSelectedElementId('director_title')}
                        className={`cursor-move transition-all inline-block px-1.5 py-0.5 rounded-lg ${
                          selectedElementId === 'director_title'
                            ? 'ring-2 ring-amber-400 bg-amber-500/10'
                            : 'hover:bg-amber-500/5'
                        }`}
                        style={getItemInlineStyle(textItems.director_title)}
                      >
                        <p className="font-bold">
                          {textItems.director_title.text}
                        </p>
                      </div>
                    </div>

                    {/* Signer Name */}
                    <div>
                      <div
                        onMouseDown={(e) => handleCanvasMouseDown(e, 'director_name')}
                        onClick={() => setSelectedElementId('director_name')}
                        className={`cursor-move transition-all inline-block px-1.5 py-0.5 rounded-lg ${
                          selectedElementId === 'director_name'
                            ? 'ring-2 ring-amber-400 bg-amber-500/10'
                            : 'hover:bg-amber-500/5'
                        }`}
                        style={getItemInlineStyle(textItems.director_name)}
                      >
                        <p className="font-bold">
                          {textItems.director_name.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Hint & Status Banner */}
            <div className="p-2.5 bg-slate-800/40 border border-slate-700/60 rounded-2xl flex items-center justify-between text-xs text-slate-400 font-battambang">
              <div className="flex items-center space-x-2 truncate">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="truncate text-[11px]">
                  {toolMode === 'EDIT_TEXT' && '✏️ កំពុងស្ថិតក្នុងទម្រង់កែអត្ថបទ៖ ចុចលើអត្ថបទដើម្បីកែសម្រួលខ្លឹមសារ។'}
                  {toolMode === 'MOVE_TEXT' && '✥ កំពុងស្ថិតក្នុងទម្រង់ផ្លាស់ទី៖ ចុចលើអត្ថបទ ហើយអូសលើ Preview ដើម្បីប្តូរទីតាំង។'}
                  {toolMode === 'TRANSFORM_TEXT' && '⚡ កំពុងស្ថិតក្នុងទម្រង់បម្លែងទម្រង់៖ កែទំហំ ពណ៌ ពុម្ពអក្សរ និងរចនាប័ទ្ម។'}
                  {toolMode === 'BACKGROUND' && '🖼️ រៀបចំ Background និងស៊ុមគែមវិញ្ញាបនបត្រស្តង់ដារ។'}
                </p>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setToolMode('EDIT_TEXT')}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border font-battambang transition cursor-pointer ${toolMode === 'EDIT_TEXT' ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setToolMode('MOVE_TEXT')}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border font-battambang transition cursor-pointer ${toolMode === 'MOVE_TEXT' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                >
                  Move
                </button>
                <button
                  type="button"
                  onClick={() => setToolMode('TRANSFORM_TEXT')}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border font-battambang transition cursor-pointer ${toolMode === 'TRANSFORM_TEXT' ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                >
                  Transform
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-amber-500/20 font-battambang shrink-0">
          <button
            type="button"
            onClick={handleResetToClean}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition border border-white/10 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>កំណត់ឡើងវិញ (Reset All)</span>
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-700 cursor-pointer"
            >
              បោះបង់ (Cancel)
            </button>
            <button
              type="button"
              id="btn-save-cert-background"
              onClick={handleSave}
              className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-extrabold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 border border-amber-300 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{savedSuccess ? 'បានរក្សាទុកជោគជ័យ!' : 'រក្សាទុកជា Background & Layout ស្តង់ដារ'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
