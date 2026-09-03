import React, { useState } from 'react';
import { 
  FeeInvoice, 
  PaymentRecord, 
  ExpenseRecord, 
  Student, 
  SchoolProfile, 
  InvoiceStatus, 
  PaymentMethod,
  UserRole
} from '../types';
import { 
  DollarSign, 
  Plus, 
  Printer, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  QrCode, 
  Search, 
  Filter, 
  Download, 
  X,
  CreditCard,
  Trash2,
  Edit,
  Wallet,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Calendar,
  Check,
  Upload,
  RefreshCw,
  Lock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatBothCurrencies, formatCurrency } from '../utils/formatters';
import { PaymentQrModal } from './PaymentQrModal';

interface FeesFinanceViewProps {
  invoices?: FeeInvoice[];
  payments?: PaymentRecord[];
  expenses?: ExpenseRecord[];
  students?: Student[];
  school: SchoolProfile;
  onSaveInvoice: (invoice: FeeInvoice) => void;
  onDeleteInvoice?: (id: string) => void;
  onRecordPayment: (payment: PaymentRecord, updatedInvoice: FeeInvoice) => void;
  onSaveExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense?: (id: string) => void;
  onPrintReceipt: (payment: PaymentRecord) => void;
  onSaveSchool?: (school: SchoolProfile) => void;
  searchTerm?: string;
  userRole?: UserRole | string;
}

export const FeesFinanceView: React.FC<FeesFinanceViewProps> = ({
  invoices = [],
  payments = [],
  expenses = [],
  students = [],
  school,
  onSaveInvoice,
  onDeleteInvoice,
  onRecordPayment,
  onSaveExpense,
  onDeleteExpense,
  onPrintReceipt,
  onSaveSchool,
  searchTerm: globalSearch = '',
  userRole
}) => {
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const [activeTab, setActiveTab] = useState<'INVOICES' | 'PAYMENTS' | 'EXPENSES' | 'ANALYTICS'>('INVOICES');
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Modals
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [isGlobalQrModalOpen, setIsGlobalQrModalOpen] = useState(false);
  const [globalQrModalMode, setGlobalQrModalMode] = useState<'VIEW' | 'CHANGE'>('VIEW');
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<FeeInvoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<FeeInvoice | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

  // Forms
  const [invoiceForm, setInvoiceForm] = useState<Partial<FeeInvoice>>({
    studentId: students[0]?.id || '',
    feeType: 'TUITION',
    titleKhmer: 'ថ្លៃសិក្សាឆមាសទី១ (Semester 1 Tuition)',
    academicYear: school.academicYear,
    amountUSD: 450,
    discountUSD: 0,
    dueDate: '2026-09-30'
  });

  const [paymentForm, setPaymentForm] = useState<{
    amountUSD: number;
    method: PaymentMethod;
    transactionRef: string;
    notes: string;
  }>({
    amountUSD: 0,
    method: 'BAKONG_KHQR',
    transactionRef: '',
    notes: 'បង់ថ្លៃសិក្សា'
  });

  const [expenseForm, setExpenseForm] = useState<Partial<ExpenseRecord>>({
    titleKhmer: 'ទិញសម្ភារៈបង្រៀន & ក្រដាសប្រឡង',
    category: 'SUPPLIES',
    amountUSD: 85,
    paymentMethod: 'CASH',
    paidTo: 'ហាងសម្ភារៈសិក្សា សៀមរាប',
    approvedBy: school.directorName || 'លោកនាយកសាលា',
    notes: ''
  });

  const search = globalSearch || localSearch;

  // Filtered lists
  const filteredInvoices = invoices.filter(i => {
    const matchesSearch = !search ||
      i.studentNameKhmer.toLowerCase().includes(search.toLowerCase()) ||
      i.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.titleKhmer.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = payments.filter(p =>
    !search ||
    p.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.studentNameKhmer.toLowerCase().includes(search.toLowerCase()) ||
    p.studentCode.toLowerCase().includes(search.toLowerCase()) ||
    p.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const filteredExpenses = expenses.filter(e =>
    !search ||
    e.titleKhmer.toLowerCase().includes(search.toLowerCase()) ||
    e.paidTo.toLowerCase().includes(search.toLowerCase()) ||
    (e.expenseNumber && e.expenseNumber.toLowerCase().includes(search.toLowerCase()))
  );

  // Financial Totals
  const totalInvoicedUSD = invoices.reduce((sum, i) => sum + (i.amountUSD - i.discountUSD), 0);
  const totalPaidUSD = invoices.reduce((sum, i) => sum + i.paidUSD, 0);
  const totalPendingUSD = invoices.reduce((sum, i) => sum + i.remainingUSD, 0);
  const totalExpenseUSD = expenses.reduce((sum, e) => sum + e.amountUSD, 0);
  const netIncomeUSD = totalPaidUSD - totalExpenseUSD;

  // Invoice Handlers
  const handleOpenAddInvoice = () => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែ/បន្ថែមត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចចេញវិក្កយបត្រថ្មីបាន!');
      return;
    }
    setEditingInvoice(null);
    setInvoiceForm({
      studentId: students[0]?.id || '',
      feeType: 'TUITION',
      titleKhmer: 'ថ្លៃសិក្សាឆមាសទី១',
      academicYear: school.academicYear,
      amountUSD: 450,
      discountUSD: 0,
      dueDate: '2026-09-30'
    });
    setInvoiceModalOpen(true);
  };

  const handleOpenEditInvoice = (inv: FeeInvoice) => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកែប្រែវិក្កយបត្របាន!');
      return;
    }
    setEditingInvoice(inv);
    setInvoiceForm({
      studentId: inv.studentId,
      feeType: inv.feeType,
      titleKhmer: inv.titleKhmer,
      academicYear: inv.academicYear,
      amountUSD: inv.amountUSD,
      discountUSD: inv.discountUSD,
      dueDate: inv.dueDate
    });
    setInvoiceModalOpen(true);
  };

  const handleSaveInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចរក្សាទុកវិក្កយបត្របាន!');
      return;
    }
    const st = students.find(s => s.id === invoiceForm.studentId);
    if (!st) {
      alert('សូមជ្រើសរើសសិស្ស');
      return;
    }

    const amountUSD = Number(invoiceForm.amountUSD) || 0;
    const discountUSD = Number(invoiceForm.discountUSD) || 0;
    const netUSD = Math.max(0, amountUSD - discountUSD);

    if (editingInvoice) {
      const updatedInv: FeeInvoice = {
        ...editingInvoice,
        studentId: st.id,
        studentNameKhmer: st.nameKhmer,
        studentCode: st.studentCode,
        feeType: invoiceForm.feeType || 'TUITION',
        titleKhmer: invoiceForm.titleKhmer || 'ថ្លៃសិក្សា',
        academicYear: invoiceForm.academicYear || school.academicYear,
        amountUSD,
        amountKHR: amountUSD * school.exchangeRate,
        discountUSD,
        discountKHR: discountUSD * school.exchangeRate,
        remainingUSD: Math.max(0, netUSD - editingInvoice.paidUSD),
        remainingKHR: Math.max(0, netUSD - editingInvoice.paidUSD) * school.exchangeRate,
        dueDate: invoiceForm.dueDate || editingInvoice.dueDate,
        status: (netUSD - editingInvoice.paidUSD) <= 0 ? 'PAID' : editingInvoice.paidUSD > 0 ? 'PARTIAL' : 'PENDING'
      };
      onSaveInvoice(updatedInv);
    } else {
      const newInv: FeeInvoice = {
        id: `INV-${Date.now()}`,
        invoiceNumber: `INV-2026-${String(invoices.length + 1).padStart(5, '0')}`,
        studentId: st.id,
        studentNameKhmer: st.nameKhmer,
        studentCode: st.studentCode,
        feeType: invoiceForm.feeType || 'TUITION',
        titleKhmer: invoiceForm.titleKhmer || 'ថ្លៃសិក្សា',
        academicYear: invoiceForm.academicYear || school.academicYear,
        amountUSD,
        amountKHR: amountUSD * school.exchangeRate,
        discountUSD,
        discountKHR: discountUSD * school.exchangeRate,
        paidUSD: 0,
        paidKHR: 0,
        remainingUSD: netUSD,
        remainingKHR: netUSD * school.exchangeRate,
        dueDate: invoiceForm.dueDate || '2026-09-30',
        status: 'PENDING',
        createdAt: new Date().toISOString().split('T')[0]
      };
      onSaveInvoice(newInv);
    }
    setInvoiceModalOpen(false);
  };

  // Payment Handler
  const handleOpenPaymentModal = (invoice: FeeInvoice) => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែ/បង់ប្រាក់ត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកត់ត្រាការបង់ប្រាក់បាន!');
      return;
    }
    setSelectedInvoiceForPayment(invoice);
    setPaymentForm({
      amountUSD: invoice.remainingUSD,
      method: 'BAKONG_KHQR',
      transactionRef: `KHQR-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: `បង់លើវិក្កយបត្រ ${invoice.invoiceNumber}`
    });
    setPaymentModalOpen(true);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចរក្សាទុកការបង់ប្រាក់បាន!');
      return;
    }
    if (!selectedInvoiceForPayment) return;

    const payUSD = Number(paymentForm.amountUSD) || 0;
    const payKHR = payUSD * school.exchangeRate;

    const newPaidUSD = selectedInvoiceForPayment.paidUSD + payUSD;
    const newRemainingUSD = Math.max(0, selectedInvoiceForPayment.remainingUSD - payUSD);
    const newStatus: InvoiceStatus = newRemainingUSD <= 0 ? 'PAID' : 'PARTIAL';

    const updatedInvoice: FeeInvoice = {
      ...selectedInvoiceForPayment,
      paidUSD: newPaidUSD,
      paidKHR: newPaidUSD * school.exchangeRate,
      remainingUSD: newRemainingUSD,
      remainingKHR: newRemainingUSD * school.exchangeRate,
      status: newStatus
    };

    const newPayment: PaymentRecord = {
      id: `PAY-${Date.now()}`,
      receiptNumber: `REC-2026-${String(payments.length + 1).padStart(5, '0')}`,
      invoiceId: selectedInvoiceForPayment.id,
      invoiceNumber: selectedInvoiceForPayment.invoiceNumber,
      studentId: selectedInvoiceForPayment.studentId,
      studentNameKhmer: selectedInvoiceForPayment.studentNameKhmer,
      studentCode: selectedInvoiceForPayment.studentCode,
      amountUSD: payUSD,
      amountKHR: payKHR,
      date: new Date().toISOString().split('T')[0],
      method: paymentForm.method,
      transactionRef: paymentForm.transactionRef,
      receivedBy: 'គណនេយ្យករ / បេឡា',
      notes: paymentForm.notes
    };

    onRecordPayment(newPayment, updatedInvoice);
    setPaymentModalOpen(false);
    onPrintReceipt(newPayment);
  };

  // Expense Handlers
  const handleOpenAddExpense = () => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែ/បន្ថែមត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកត់ត្រាចំណាយបាន!');
      return;
    }
    setEditingExpense(null);
    setExpenseForm({
      titleKhmer: 'ទិញសម្ភារៈបង្រៀន & ក្រដាសប្រឡង',
      category: 'SUPPLIES',
      amountUSD: 85,
      paymentMethod: 'CASH',
      paidTo: 'ហាងសម្ភារៈសិក្សា សៀមរាប',
      approvedBy: school.directorName || 'លោកនាយកសាលា',
      notes: ''
    });
    setExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (exp: ExpenseRecord) => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកែប្រែកំណត់ត្រាចំណាយបាន!');
      return;
    }
    setEditingExpense(exp);
    setExpenseForm({
      titleKhmer: exp.titleKhmer,
      category: exp.category,
      amountUSD: exp.amountUSD,
      paymentMethod: exp.paymentMethod,
      paidTo: exp.paidTo,
      approvedBy: exp.approvedBy,
      notes: exp.notes
    });
    setExpenseModalOpen(true);
  };

  const handleSaveExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចរក្សាទុកកំណត់ត្រាចំណាយបាន!');
      return;
    }
    const amountUSD = Number(expenseForm.amountUSD) || 0;

    if (editingExpense) {
      const updatedExp: ExpenseRecord = {
        ...editingExpense,
        titleKhmer: expenseForm.titleKhmer || 'ចំណាយប្រតិបត្តិការ',
        category: expenseForm.category || 'OPERATIONS',
        amountUSD,
        amountKHR: amountUSD * school.exchangeRate,
        paidTo: expenseForm.paidTo || '',
        approvedBy: expenseForm.approvedBy || 'នាយកសាលា',
        paymentMethod: expenseForm.paymentMethod || 'CASH',
        notes: expenseForm.notes
      };
      onSaveExpense(updatedExp);
    } else {
      const newExp: ExpenseRecord = {
        id: `EXP-${Date.now()}`,
        expenseNumber: `EXP-2026-${String(expenses.length + 1).padStart(4, '0')}`,
        titleKhmer: expenseForm.titleKhmer || 'ចំណាយប្រតិបត្តិការ',
        category: expenseForm.category || 'OPERATIONS',
        amountUSD,
        amountKHR: amountUSD * school.exchangeRate,
        date: new Date().toISOString().split('T')[0],
        paidTo: expenseForm.paidTo || '',
        approvedBy: expenseForm.approvedBy || school.directorName || 'នាយកសាលា',
        paymentMethod: expenseForm.paymentMethod || 'CASH',
        notes: expenseForm.notes
      };
      onSaveExpense(newExp);
    }
    setExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white font-battambang flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>ថ្លៃសិក្សា & ចំណាយហិរញ្ញវត្ថុ (Fees & Finance)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            គណនារូបិយប័ណ្ណទ្វេ (USD & KHR • អត្រា $1 = {school.exchangeRate.toLocaleString('km-KH')}៛) បង្កាន់ដៃ Bakong KHQR និងការគ្រប់គ្រងចំណាយ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Global Payment QR Management Button */}
          <button
            onClick={() => {
              setGlobalQrModalMode(isSuperAdmin ? 'VIEW' : 'VIEW');
              setIsGlobalQrModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:from-rose-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-500/20 border border-rose-400/40 font-battambang"
            title="ពិនិត្យ QR ទទួលប្រាក់សិស្ស (Auto sync to all students)"
          >
            <QrCode className="w-4 h-4 text-rose-200" />
            <span>💳 QR ទទួលប្រាក់សិស្ស</span>
            <span className="hidden sm:inline-block text-[10px] bg-black/30 text-rose-200 px-1.5 py-0.5 rounded-full font-mono">
              {school.paymentQrAccountName || 'RIN SOPHEAK'}
            </span>
          </button>

          {isSuperAdmin ? (
            <>
              <button
                onClick={handleOpenAddExpense}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition shadow-sm font-battambang"
              >
                <Plus className="w-4 h-4" />
                <span>+ កត់ត្រាចំណាយ</span>
              </button>

              <button
                onClick={handleOpenAddInvoice}
                className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/20 font-battambang"
              >
                <Plus className="w-4 h-4" />
                <span>+ ចេញវិក្កយបត្រថ្លៃសិក្សា</span>
              </button>
            </>
          ) : (
            <span className="text-[11px] font-medium text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>សិទ្ធិកែប្រែ៖ Super Admin ប៉ុណ្ណោះ</span>
            </span>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Invoiced */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-battambang">វិក្កយបត្រសរុប (Total Invoiced)</p>
            <h3 className="text-xl font-bold text-white font-mono mt-1">${totalInvoicedUSD.toLocaleString()}</h3>
            <p className="text-[10px] text-emerald-400 font-mono mt-0.5">៛{(totalInvoicedUSD * school.exchangeRate).toLocaleString('km-KH')}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Collected Revenue */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-battambang">ប្រមូលបាន (Collected Revenue)</p>
            <h3 className="text-xl font-bold text-emerald-400 font-mono mt-1">${totalPaidUSD.toLocaleString()}</h3>
            <p className="text-[10px] text-emerald-300/80 font-mono mt-0.5">៛{(totalPaidUSD * school.exchangeRate).toLocaleString('km-KH')}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Pending / Overdue */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-battambang">នៅជំពាក់ (Pending / Overdue)</p>
            <h3 className="text-xl font-bold text-amber-400 font-mono mt-1">${totalPendingUSD.toLocaleString()}</h3>
            <p className="text-[10px] text-amber-300/80 font-mono mt-0.5">៛{(totalPendingUSD * school.exchangeRate).toLocaleString('km-KH')}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* School Expenses */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-battambang">ចំណាយសាលា (Total Expenses)</p>
            <h3 className="text-xl font-bold text-rose-400 font-mono mt-1">${totalExpenseUSD.toLocaleString()}</h3>
            <p className="text-[10px] text-rose-300/80 font-mono mt-0.5">ចំណូលសុទ្ធ: ${netIncomeUSD.toLocaleString()}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-3.5 rounded-3xl border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-4">
        
        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 font-battambang text-xs">
          <button
            onClick={() => setActiveTab('INVOICES')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              activeTab === 'INVOICES'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            វិក្កយបត្រថ្លៃសិក្សា ({invoices.length})
          </button>

          <button
            onClick={() => setActiveTab('PAYMENTS')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              activeTab === 'PAYMENTS'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            កំណត់ត្រាបង់ប្រាក់ & បង្កាន់ដៃ ({payments.length})
          </button>

          <button
            onClick={() => setActiveTab('EXPENSES')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              activeTab === 'EXPENSES'
                ? 'bg-gradient-to-r from-rose-500 to-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            កំណត់ត្រាចំណាយសាលា ({expenses.length})
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {activeTab === 'INVOICES' && (
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950/80 text-xs text-white rounded-xl border border-white/10 outline-none focus:border-indigo-400 font-battambang"
            >
              <option value="ALL">គ្រប់ស្ថានភាព</option>
              <option value="PAID">បង់រួច (Paid)</option>
              <option value="PARTIAL">បង់ខ្លះ (Partial)</option>
              <option value="PENDING">មិនទាន់បង់ (Pending)</option>
              <option value="OVERDUE">ហួសកាលកំណត់ (Overdue)</option>
            </select>
          )}

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះ, លេខកូដ, ឬវិក្កយបត្រ..."
              className="w-full pl-9 pr-3.5 py-2 bg-white/5 text-xs text-white placeholder-slate-400 rounded-xl border border-white/10 outline-none focus:border-indigo-400"
            />
          </div>
        </div>

      </div>

      {/* TAB 1: INVOICES TABLE */}
      {activeTab === 'INVOICES' && (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-battambang">
                <tr>
                  <th className="p-4">លេខវិក្កយបត្រ</th>
                  <th className="p-4">សិស្ស (Student)</th>
                  <th className="p-4">ប្រភេទថ្លៃសិក្សា</th>
                  <th className="p-4">តម្លៃសរុប (USD/KHR)</th>
                  <th className="p-4">បានបង់</th>
                  <th className="p-4">នៅសល់</th>
                  <th className="p-4">កាលបរិច្ឆេទ</th>
                  <th className="p-4">ស្ថានភាព</th>
                  <th className="p-4 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-battambang">
                {filteredInvoices.map(inv => {
                  const isPaid = inv.status === 'PAID';
                  const isPartial = inv.status === 'PARTIAL';

                  return (
                    <tr key={inv.id} className="hover:bg-white/5 transition">
                      <td className="p-4 font-mono font-bold text-indigo-300">{inv.invoiceNumber}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-white text-xs">{inv.studentNameKhmer}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{inv.studentCode}</p>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">{inv.titleKhmer}</td>
                      <td className="p-4 font-mono font-bold text-white">
                        ${inv.amountUSD - inv.discountUSD}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          ៛{((inv.amountUSD - inv.discountUSD) * school.exchangeRate).toLocaleString('km-KH')}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-400">${inv.paidUSD}</td>
                      <td className="p-4 font-mono font-bold text-amber-400">${inv.remainingUSD}</td>
                      <td className="p-4 text-slate-400 text-[11px] font-mono">{inv.dueDate}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isPaid 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : isPartial 
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {isPaid ? '✓ បង់រួច' : isPartial ? 'បង់ខ្លះ' : '⏳ មិនទាន់បង់'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {!isPaid && isSuperAdmin && (
                            <button
                              onClick={() => handleOpenPaymentModal(inv)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>បង់ប្រាក់ KHQR</span>
                            </button>
                          )}
                          {isSuperAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEditInvoice(inv)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                                title="កែប្រែវិក្កយបត្រ"
                              >
                                <Edit className="w-3.5 h-3.5 text-indigo-300" />
                              </button>
                              {onDeleteInvoice && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`លុបវិក្កយបត្រ ${inv.invoiceNumber}?`)) {
                                      onDeleteInvoice(inv.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                                  title="លុបវិក្កយបត្រ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                          {!isSuperAdmin && (
                            <span className="text-[10px] text-slate-500 font-mono">មើលតែប៉ុណ្ណោះ</span>
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

      {/* TAB 2: PAYMENTS & RECEIPTS TABLE */}
      {activeTab === 'PAYMENTS' && (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-battambang">
                <tr>
                  <th className="p-4">លេខបង្កាន់ដៃ</th>
                  <th className="p-4">សិស្ស</th>
                  <th className="p-4">វិក្កយបត្រ</th>
                  <th className="p-4">ចំនួនទឹកប្រាក់</th>
                  <th className="p-4">វិធីសាស្ត្រទូទាត់</th>
                  <th className="p-4">កាលបរិច្ឆេទ</th>
                  <th className="p-4">អ្នកទទួល</th>
                  <th className="p-4 text-right">បោះពុម្ព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-battambang">
                {filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition">
                    <td className="p-4 font-mono font-bold text-emerald-400">{p.receiptNumber}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-white text-xs">{p.studentNameKhmer}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.studentCode}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{p.invoiceNumber}</td>
                    <td className="p-4 font-mono font-bold text-white">
                      ${p.amountUSD}
                      <span className="block text-[10px] text-emerald-400 font-normal">
                        ៛{p.amountKHR.toLocaleString('km-KH')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold font-mono">
                        {p.method}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">{p.date}</td>
                    <td className="p-4 text-slate-300">{p.receivedBy}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onPrintReceipt(p)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold ml-auto transition border border-white/10 shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-300" />
                        <span>បង្កាន់ដៃ</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSES TABLE */}
      {activeTab === 'EXPENSES' && (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-battambang">
                <tr>
                  <th className="p-4">លេខកូដចំណាយ</th>
                  <th className="p-4">បរិយាយចំណាយ</th>
                  <th className="p-4">ប្រភេទ</th>
                  <th className="p-4">ទឹកប្រាក់ (USD/KHR)</th>
                  <th className="p-4">ទូទាត់ជូន</th>
                  <th className="p-4">អនុម័តដោយ</th>
                  <th className="p-4">កាលបរិច្ឆេទ</th>
                  <th className="p-4 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-battambang">
                {filteredExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-white/5 transition">
                    <td className="p-4 font-mono font-bold text-rose-400">{e.expenseNumber || e.id}</td>
                    <td className="p-4 font-bold text-white">{e.titleKhmer}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 text-[10px] font-semibold">
                        {e.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-rose-400">
                      ${e.amountUSD}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        ៛{(e.amountUSD * school.exchangeRate).toLocaleString('km-KH')}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{e.paidTo}</td>
                    <td className="p-4 text-slate-300">{e.approvedBy}</td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">{e.date}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {isSuperAdmin ? (
                          <>
                            <button
                              onClick={() => handleOpenEditExpense(e)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                              title="កែប្រែចំណាយ"
                            >
                              <Edit className="w-3.5 h-3.5 text-indigo-300" />
                            </button>
                            {onDeleteExpense && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`លុបកំណត់ត្រាចំណាយ ${e.titleKhmer}?`)) {
                                    onDeleteExpense(e.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                                title="លុប"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">មើលតែប៉ុណ្ណោះ</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT INVOICE */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-battambang text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <span>{editingInvoice ? 'កែប្រែវិក្កយបត្រ' : 'បង្កើតវិក្កយបត្រថ្មី'}</span>
              </h3>
              <button onClick={() => setInvoiceModalOpen(false)} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoiceSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">ជ្រើសរើសសិស្ស (Student)*</label>
                <select
                  value={invoiceForm.studentId}
                  onChange={e => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
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
                <label className="block text-slate-300 font-medium mb-1">ចំណងជើងវិក្កយបត្រ*</label>
                <input
                  type="text"
                  required
                  value={invoiceForm.titleKhmer}
                  onChange={e => setInvoiceForm({ ...invoiceForm, titleKhmer: e.target.value })}
                  placeholder="ឧ. ថ្លៃសិក្សាឆមាសទី១"
                  className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ទឹកប្រាក់សរុប ($ USD)*</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.amountUSD}
                    onChange={e => setInvoiceForm({ ...invoiceForm, amountUSD: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-emerald-400 font-mono font-bold outline-none focus:border-indigo-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    = ៛{((Number(invoiceForm.amountUSD) || 0) * school.exchangeRate).toLocaleString('km-KH')}
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">បញ្ចុះតម្លៃ ($ USD)</label>
                  <input
                    type="number"
                    value={invoiceForm.discountUSD}
                    onChange={e => setInvoiceForm({ ...invoiceForm, discountUSD: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-amber-400 font-mono font-bold outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">កាលបរិច្ឆេទកំណត់បង់ (Due Date)</label>
                <input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInvoiceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20"
                >
                  រក្សាទុកវិក្កយបត្រ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BAKONG KHQR PAYMENT POPUP */}
      {paymentModalOpen && selectedInvoiceForPayment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-battambang text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  <span>បង់ប្រាក់តាម KHQR / សាច់ប្រាក់</span>
                </h3>
                <p className="text-[10px] text-slate-400">{selectedInvoiceForPayment.invoiceNumber} • {selectedInvoiceForPayment.studentNameKhmer}</p>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated KHQR Visual Display with Authentic Bakong / Uploaded QR */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-rose-950/40 via-slate-950 to-slate-950 border border-rose-500/30 text-center space-y-2">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold shadow-md">
                  <span>{school.paymentQrBankName || 'BAKONG KHQR'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGlobalQrModalMode('CHANGE');
                    setIsGlobalQrModalOpen(true);
                  }}
                  className="text-[10px] text-rose-300 hover:text-rose-200 underline font-semibold flex items-center space-x-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>ប្តូររូបភាព QR</span>
                </button>
              </div>

              <div className="text-left pt-1">
                <p className="text-[11px] font-bold text-white font-mono uppercase tracking-wider">{school.paymentQrAccountName || 'RIN SOPHEAK'}</p>
              </div>

              <p className="text-lg font-mono font-bold text-white">
                ${paymentForm.amountUSD} / ៛{(paymentForm.amountUSD * school.exchangeRate).toLocaleString('km-KH')}
              </p>

              {/* Dynamic QR Code Pattern or Custom Uploaded Image */}
              <div className="w-48 h-48 mx-auto bg-white p-2.5 rounded-2xl shadow-xl flex flex-col items-center justify-center border-4 border-rose-500 overflow-hidden relative">
                {school.paymentQrUrl ? (
                  <img
                    src={school.paymentQrUrl}
                    alt={`KHQR ${school.paymentQrAccountName || 'RIN SOPHEAK'}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative">
                    <QRCodeSVG
                      value={JSON.stringify({
                        system: "BAKONG_KHQR",
                        accountName: school.paymentQrAccountName || 'RIN SOPHEAK',
                        amountUSD: paymentForm.amountUSD,
                        amountKHR: paymentForm.amountUSD * school.exchangeRate,
                        invoice: selectedInvoiceForPayment.invoiceNumber,
                        student: selectedInvoiceForPayment.studentNameKhmer
                      })}
                      size={160}
                      level="H"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-7 h-7 rounded-full bg-slate-950 border-2 border-white flex items-center justify-center text-white font-bold text-xs">
                        ៛
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Scan via ABA, ACLEDA, Wing, or Bakong App</p>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">ចំនួនទឹកប្រាក់បង់ ($ USD)*</label>
                <input
                  type="number"
                  required
                  max={selectedInvoiceForPayment.remainingUSD}
                  value={paymentForm.amountUSD}
                  onChange={e => setPaymentForm({ ...paymentForm, amountUSD: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-emerald-400 font-mono font-bold text-sm outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">វិធីសាស្ត្រទូទាត់ (Method)</label>
                <select
                  value={paymentForm.method}
                  onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value as PaymentMethod })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                >
                  <option value="BAKONG_KHQR">BAKONG KHQR (Scan & Pay)</option>
                  <option value="ABA_PAY">ABA PAY</option>
                  <option value="WING_MONEY">Wing Money</option>
                  <option value="ACLEDA_PAY">ACLEDA Pay</option>
                  <option value="CASH">សាច់ប្រាក់សុទ្ធ (Cash)</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">លេខកូដប្រតិបត្តិការ (Ref Number)</label>
                <input
                  type="text"
                  value={paymentForm.transactionRef}
                  onChange={e => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-200 font-mono text-xs outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20"
                >
                  បញ្ជាក់ការបង់ & ចេញបង្កាន់ដៃ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT EXPENSE */}
      {expenseModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 font-battambang text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-rose-400" />
                <span>{editingExpense ? 'កែប្រែចំណាយ' : 'កត់ត្រាចំណាយសាលាថ្មី'}</span>
              </h3>
              <button onClick={() => setExpenseModalOpen(false)} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">បរិយាយចំណាយ (Description)*</label>
                <input
                  type="text"
                  required
                  value={expenseForm.titleKhmer}
                  onChange={e => setExpenseForm({ ...expenseForm, titleKhmer: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ចំនួនទឹកប្រាក់ ($ USD)*</label>
                  <input
                    type="number"
                    required
                    value={expenseForm.amountUSD}
                    onChange={e => setExpenseForm({ ...expenseForm, amountUSD: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-rose-400 font-mono font-bold outline-none focus:border-indigo-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    = ៛{((Number(expenseForm.amountUSD) || 0) * school.exchangeRate).toLocaleString('km-KH')}
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ប្រភេទចំណាយ (Category)</label>
                  <select
                    value={expenseForm.category}
                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                  >
                    <option value="SUPPLIES">សម្ភារៈសិក្សា & បង្រៀន (Supplies)</option>
                    <option value="UTILITIES">ទឹក ភ្លើង អ៊ីនធឺណិត (Utilities)</option>
                    <option value="SALARY">ប្រាក់បៀវត្ស & ឧបត្ថម្ភ (Salaries)</option>
                    <option value="MAINTENANCE">ជួសជុល & ថែទាំ (Maintenance)</option>
                    <option value="EVENTS">កម្មវិធី & ព្រឹត្តិការណ៍ (Events)</option>
                    <option value="OPERATIONS">ប្រតិបត្តិការទូទៅ (Operations)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ទូទាត់ជូន (Paid To)</label>
                  <input
                    type="text"
                    value={expenseForm.paidTo}
                    onChange={e => setExpenseForm({ ...expenseForm, paidTo: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-200 outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">អនុម័តដោយ (Approved By)</label>
                  <input
                    type="text"
                    value={expenseForm.approvedBy}
                    onChange={e => setExpenseForm({ ...expenseForm, approvedBy: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-200 outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 text-white rounded-xl font-bold shadow-md shadow-rose-500/20"
                >
                  រក្សាទុកកំណត់ត្រាចំណាយ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Payment QR Management Modal */}
      <PaymentQrModal
        isOpen={isGlobalQrModalOpen}
        onClose={() => setIsGlobalQrModalOpen(false)}
        school={school}
        onSaveSchool={onSaveSchool || (() => {})}
        totalStudentsCount={students.length}
        initialMode={globalQrModalMode}
        userRole={userRole}
      />

    </div>
  );
};
