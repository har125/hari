export interface Student {
  id: number;
  nis: string;
  name: string;
  class: string;
  status: 'Aktif' | 'Non-Aktif' | 'Pindah';
}

export interface Transaction {
  id: number;
  studentId: number;
  type: string;
  month: string;
  year: string;
  amount: number;
  date: string;
  status: 'Lunas' | 'Cicilan 1' | 'Cicilan 2' | 'Belum Lunas';
}

export interface AppSettings {
  darkMode: boolean;
  textSize: 'small' | 'normal' | 'large';
  language: 'id' | 'en';
}

export const INITIAL_STUDENTS: Student[] = [
  { id: 1, nis: '2024001', name: 'Ahmad Muzaki', class: '9A', status: 'Aktif' },
  { id: 2, nis: '2024002', name: 'Siti Aminah', class: '9A', status: 'Aktif' },
  { id: 3, nis: '2024003', name: 'Budi Santoso', class: '9A', status: 'Aktif' },
  { id: 4, nis: '2024004', name: 'Dewi Sartika', class: '9A', status: 'Aktif' },
  { id: 5, nis: '2024005', name: 'Eko Prasetyo', class: '9A', status: 'Aktif' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 101, studentId: 1, type: 'SPP', month: 'Januari', year: '2024', amount: 150000, date: '2024-01-10', status: 'Lunas' },
  { id: 102, studentId: 2, type: 'SPP', month: 'Januari', year: '2024', amount: 150000, date: '2024-01-11', status: 'Lunas' },
  { id: 103, studentId: 1, type: 'LKS', month: '-', year: '-', amount: 200000, date: '2024-01-12', status: 'Lunas' },
  { id: 104, studentId: 3, type: 'SPP', month: 'Januari', year: '2024', amount: 150000, date: '2024-01-15', status: 'Lunas' },
  { id: 105, studentId: 4, type: 'Uang Gedung', month: '-', year: '-', amount: 500000, date: '2024-01-20', status: 'Cicilan 1' },
];

export const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export const PAYMENT_TYPES = ['SPP', 'Uang Gedung', 'LKS', 'Seragam', 'Infaq', 'Lainnya'];
export const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];