import React from 'react';
import { Student, SchoolProfile } from '../types';
import { Printer, X, QrCode, ShieldCheck, Phone, Calendar, BookOpen } from 'lucide-react';
import { formatGender } from '../utils/formatters';

interface IdCardModalProps {
  student: Student;
  school: SchoolProfile;
  onClose: () => void;
}

export const IdCardModal: React.FC<IdCardModalProps> = ({ student, school, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 no-print">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-800 text-base">កាតសម្គាល់ខ្លួនសិស្ស (Student ID Card)</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable ID Card Container */}
        <div className="p-8 flex flex-col items-center justify-center bg-slate-100 print:bg-white print:p-0">
          
          {/* Card Front */}
          <div className="w-[320px] h-[480px] bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden border border-indigo-700/50 print:shadow-none print:border-slate-800">
            
            {/* Background watermarks & accents */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -right-8 -bottom-8 opacity-5 text-white pointer-events-none text-9xl font-bold">
              🇰🇭
            </div>

            {/* School Header */}
            <div className="text-center z-10 border-b border-indigo-800/80 pb-3">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <img 
                  src={school.logo} 
                  alt="School Logo" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-sm"
                />
                <div className="text-left">
                  <h4 className="font-bold text-xs text-amber-300 tracking-wide font-battambang leading-tight">{school.nameKhmer}</h4>
                  <p className="text-[10px] text-slate-300 font-medium tracking-wider uppercase">{school.nameEnglish}</p>
                </div>
              </div>
              <div className="inline-block bg-amber-400/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-400/30 mt-1">
                ប័ណ្ណសម្គាល់ខ្លួនសិស្ស • STUDENT CARD
              </div>
            </div>

            {/* Student Photo & Details */}
            <div className="flex flex-col items-center text-center my-auto z-10">
              <div className="relative mb-3">
                <img 
                  src={student.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                  alt={student.nameKhmer}
                  className="w-24 h-28 object-cover rounded-xl border-2 border-white shadow-md"
                />
                <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow">
                  {student.grade ? `ថ្នាក់ទី ${student.grade}` : 'សិស្ស'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white font-battambang leading-tight mb-0.5">{student.nameKhmer}</h3>
              <p className="text-xs text-indigo-200 font-medium tracking-wide">{student.nameEnglish}</p>
              
              <div className="mt-3 bg-white/10 backdrop-blur-md rounded-xl p-2.5 w-full border border-white/10 text-left text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300">អត្តលេខ (ID):</span>
                  <span className="font-mono font-bold text-amber-300">{student.studentCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">ថ្នាក់រៀន (Class):</span>
                  <span className="font-medium text-white">{student.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">ឆ្នាំសិក្សា (AY):</span>
                  <span className="font-medium text-white">{student.academicYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">ភេទ (Gender):</span>
                  <span className="font-medium text-white">{formatGender(student.gender, 'both')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">ថ្ងៃខែឆ្នាំកំណើត:</span>
                  <span className="font-medium text-white">{student.dob}</span>
                </div>
              </div>
            </div>

            {/* Card Footer: Barcode/QR & Emergency */}
            <div className="pt-2 border-t border-indigo-800/80 flex items-center justify-between z-10">
              <div className="text-[9px] text-slate-300 space-y-0.5">
                <p className="flex items-center space-x-1">
                  <Phone className="w-2.5 h-2.5 text-amber-400" />
                  <span>អាណាព្យាបាល: {student.parentPhone || student.emergencyContact}</span>
                </p>
                <p className="text-[8px] text-slate-400">ទូរស័ព្ទសាលា: {school.phone.split('/')[0]}</p>
              </div>
              <div className="bg-white p-1 rounded-md shadow-sm">
                <div className="w-9 h-9 bg-slate-900 rounded flex items-center justify-center text-white">
                  <QrCode className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

          </div>

          <p className="text-xs text-slate-500 mt-4 text-center no-print">
            កាតនេះមានសុពលភាពសម្រាប់ឆ្នាំសិក្សា ២០២៥-២០២៦។ សូមយកកាតនេះមកជាមួយរាល់ពេលចូលសាលា។
          </p>
        </div>

      </div>
    </div>
  );
};
