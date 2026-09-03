import React from 'react';
import { PaymentRecord, SchoolProfile } from '../types';
import { Printer, X, CheckCircle, QrCode, Building2, User, CreditCard } from 'lucide-react';
import { formatBothCurrencies } from '../utils/formatters';

interface ReceiptModalProps {
  payment: PaymentRecord;
  school: SchoolProfile;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, school, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 no-print">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-800 text-base">បង្កាន់ដៃទទួលប្រាក់ផ្លូវការ (Official Receipt)</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ពវិក្កយបត្រ (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 print:p-4 text-slate-800 font-sans">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-6 mb-6">
            <div className="flex items-center space-x-4">
              <img src={school.logo} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-battambang leading-tight">{school.nameKhmer}</h2>
                <h3 className="text-sm font-semibold text-slate-600 tracking-wide uppercase">{school.nameEnglish}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{school.address}</p>
                <p className="text-xs text-slate-500">ទូរស័ព្ទ: {school.phone} | អ៊ីមែល: {school.email}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                ទូទាត់រួចរាល់ (PAID)
              </span>
              <p className="text-xs text-slate-500">លេខបង្កាន់ដៃ (Receipt No):</p>
              <p className="font-mono font-bold text-base text-slate-900">{payment.receiptNumber}</p>
              <p className="text-xs text-slate-500 mt-1">កាលបរិច្ឆេទ: {payment.date}</p>
            </div>
          </div>

          <div className="text-center my-4">
            <h1 className="text-xl font-bold font-battambang text-slate-900">បង្កាន់ដៃទទួលប្រាក់</h1>
            <p className="text-xs font-semibold text-slate-500 tracking-widest uppercase">OFFICIAL PAYMENT RECEIPT</p>
          </div>

          {/* Student Info Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-xs text-slate-500">បានទទួលពីសិស្ស (Received From):</p>
              <p className="font-bold text-slate-900 font-battambang text-base">{payment.studentNameKhmer}</p>
              <p className="text-xs text-slate-600">អត្តលេខសិស្ស: <span className="font-mono font-bold">{payment.studentCode}</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">យោងតាមវិក្កយបត្រ (Invoice Ref):</p>
              <p className="font-mono font-bold text-slate-800">{payment.invoiceNumber}</p>
              <p className="text-xs text-slate-600">វិធីសាស្រ្តទូទាត់: <span className="font-bold text-indigo-700">{payment.method}</span></p>
            </div>
          </div>

          {/* Table of items */}
          <table className="w-full border-collapse mb-6 text-sm">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-300 text-slate-700">
                <th className="py-2.5 px-3 text-left font-semibold">ល.រ (No.)</th>
                <th className="py-2.5 px-3 text-left font-semibold">បរិយាយ (Description)</th>
                <th className="py-2.5 px-3 text-right font-semibold">ចំនួនទឹកប្រាក់ (USD)</th>
                <th className="py-2.5 px-3 text-right font-semibold">ជាប្រាក់រៀល (KHR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3 px-3 font-mono text-slate-500">01</td>
                <td className="py-3 px-3 font-medium text-slate-800">
                  {payment.notes || 'ការទូទាត់ថ្លៃសិក្សា / Tuition Fee Payment'}
                  {payment.transactionRef && (
                    <span className="block text-xs text-slate-500 font-mono">Ref: {payment.transactionRef}</span>
                  )}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">${(payment.amountUSD || 0).toFixed(2)}</td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{(payment.amountKHR || 0).toLocaleString('km-KH')} ៛</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-800 font-bold bg-slate-50">
                <td colSpan={2} className="py-3 px-3 text-right">ទឹកប្រាក់សរុប (Total Paid):</td>
                <td className="py-3 px-3 text-right text-indigo-700 font-mono text-base">${(payment.amountUSD || 0).toFixed(2)}</td>
                <td className="py-3 px-3 text-right text-indigo-700 font-mono text-base">{(payment.amountKHR || 0).toLocaleString('km-KH')} ៛</td>
              </tr>
            </tfoot>
          </table>

          {/* Signatures & Stamp */}
          <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs border-t border-slate-200">
            <div>
              <p className="font-semibold text-slate-700 mb-12">អ្នកបង់ប្រាក់ (Payer)</p>
              <p className="text-slate-500 border-t border-slate-300 pt-1">ហត្ថលេខា / ស្នាមមេដៃ</p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="border border-slate-300 p-2 rounded-lg bg-white shadow-xs">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">KHQR VERIFIED</p>
            </div>

            <div className="relative">
              <p className="font-semibold text-slate-700 mb-2">បេឡា / អ្នកទទួល (Cashier)</p>
              
              {/* Simulated School Stamp */}
              <div className="inline-block relative">
                <div className="w-16 h-16 rounded-full border-2 border-red-500 text-red-600 flex flex-col items-center justify-center opacity-85 transform -rotate-12 mx-auto my-1">
                  <span className="text-[8px] font-bold">វិទ្យាល័យ</span>
                  <span className="text-[7px] font-bold">ព្រះស៊ីសុវត្ថិ</span>
                  <span className="text-[6px]">PAID</span>
                </div>
              </div>
              
              <p className="font-medium text-slate-800 border-t border-slate-300 pt-1">{payment.receivedBy}</p>
            </div>
          </div>

          <div className="mt-8 text-center text-[11px] text-slate-400 border-t border-slate-100 pt-3">
            សូមរក្សាទុកបង្កាន់ដៃនេះជាភស្តុតាងនៃការបង់ប្រាក់ • Please keep this receipt for your records.
          </div>

        </div>

      </div>
    </div>
  );
};
