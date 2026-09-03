import { Language } from '../types';

export const formatCurrency = (amountUSD: number, currency: 'USD' | 'KHR' = 'USD', exchangeRate: number = 4100): string => {
  if (currency === 'KHR') {
    const khr = Math.round(amountUSD * exchangeRate);
    return `${khr.toLocaleString('km-KH')} ៛`;
  }
  return `$${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatBothCurrencies = (amountUSD: number, exchangeRate: number = 4100): string => {
  const khr = Math.round(amountUSD * exchangeRate);
  return `$${amountUSD.toFixed(2)} (${khr.toLocaleString('km-KH')} ៛)`;
};

export const exportToCSV = (
  filename: string,
  rowsOrHeaders: Record<string, any>[] | string[],
  maybeRows?: (string | number | boolean | null | undefined)[][]
): void => {
  const separator = ',';
  let csvContent = '\uFEFF'; // UTF-8 BOM for Khmer text support in Excel

  if (Array.isArray(maybeRows)) {
    const headers = rowsOrHeaders as string[];
    const rows = maybeRows;
    const headerLine = headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(separator);
    const dataLines = rows.map(row => 
      row.map(cell => {
        const val = cell === null || cell === undefined ? '' : String(cell);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(separator)
    );
    csvContent += [headerLine, ...dataLines].join('\n');
  } else {
    const rows = rowsOrHeaders as Record<string, any>[];
    if (!rows || !rows.length) return;
    const keys = Object.keys(rows[0]);
    csvContent +=
      keys.join(separator) +
      '\n' +
      rows
        .map(row => {
          return keys
            .map(k => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
              cell = cell.replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join('\n');
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const getKhmerGradeLetter = (score: number): { letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; labelKhmer: string; color: string } => {
  const safeScore = isNaN(score) ? 0 : score;
  if (safeScore >= 90) return { letter: 'A', labelKhmer: 'ល្អប្រសើរ (Excellent)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (safeScore >= 80) return { letter: 'B', labelKhmer: 'ល្អណាស់ (Very Good)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  if (safeScore >= 70) return { letter: 'C', labelKhmer: 'ល្អ (Good)', color: 'text-teal-700 bg-teal-50 border-teal-200' };
  if (safeScore >= 60) return { letter: 'D', labelKhmer: 'មធ្យម (Fair)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  if (safeScore >= 50) return { letter: 'E', labelKhmer: 'ខ្សោយ (Pass)', color: 'text-orange-700 bg-orange-50 border-orange-200' };
  return { letter: 'F', labelKhmer: 'ធ្លាក់ (Fail)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
};

export const calculateKhmerGrade = (score: number): { 
  letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; 
  gradeKhmer: string;
  gradeEnglish: string;
  khmer: string; 
  labelKhmer: string; 
  color: string; 
  gpa: number 
} => {
  const res = getKhmerGradeLetter(score);
  const gpaMap: Record<string, number> = { A: 4.0, B: 3.0, C: 2.0, D: 1.5, E: 1.0, F: 0.0 };
  return {
    letter: res.letter,
    gradeKhmer: res.letter,
    gradeEnglish: res.letter,
    khmer: res.labelKhmer.split(' (')[0],
    labelKhmer: res.labelKhmer,
    color: res.color,
    gpa: gpaMap[res.letter] || 0.0
  };
};

export const isFemaleGender = (gender?: string | null): boolean => {
  if (!gender) return false;
  const s = String(gender).trim().toUpperCase();
  return s === 'FEMALE' || s === 'F' || s === 'ស្រី' || s === 'GIRL' || s === 'WOMAN';
};

export const isMaleGender = (gender?: string | null): boolean => {
  if (!gender) return false;
  const s = String(gender).trim().toUpperCase();
  return s === 'MALE' || s === 'M' || s === 'ប្រុស' || s === 'BOY' || s === 'MAN';
};

export const formatGender = (gender?: string | null, style: 'khmer' | 'english' | 'both' = 'both'): string => {
  if (isFemaleGender(gender)) {
    if (style === 'khmer') return 'ស្រី';
    if (style === 'english') return 'Female';
    return 'ស្រី (Female)';
  }
  if (isMaleGender(gender)) {
    if (style === 'khmer') return 'ប្រុស';
    if (style === 'english') return 'Male';
    return 'ប្រុស (Male)';
  }
  if (style === 'khmer') return 'ផ្សេងៗ';
  if (style === 'english') return 'Other';
  return 'ផ្សេងៗ (Other)';
};

export const getGenderKhmer = (gender?: string | null): string => {
  return isFemaleGender(gender) ? 'ស្រី' : 'ប្រុស';
};

export const getGenderEnglish = (gender?: string | null): string => {
  return isFemaleGender(gender) ? 'Female' : 'Male';
};
