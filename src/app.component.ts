import { Component, signal, computed, effect, inject, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from './components/icon.component';
import { TRANSLATIONS } from './translations';
import { Student, Transaction, AppSettings, INITIAL_STUDENTS, INITIAL_TRANSACTIONS, MONTHS, PAYMENT_TYPES, CHART_COLORS } from './services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  // State
  isLoggedIn = signal(false);
  activeTab = signal('dashboard');
  isMobileMenuOpen = signal(false);
  
  // Data
  students = signal<Student[]>(INITIAL_STUDENTS);
  transactions = signal<Transaction[]>(INITIAL_TRANSACTIONS);
  
  // Settings
  profile = signal({
    name: 'Bpk. Ahmad Fauzi',
    role: 'Walikelas 9A',
    avatarInitials: 'AF'
  });
  
  appSettings = signal<AppSettings>({
    darkMode: false,
    textSize: 'normal',
    language: 'id'
  });

  // Modals
  showPaymentModal = signal(false);
  showStudentModal = signal(false);
  isEditingStudent = signal(false);

  // Forms
  paymentForm = signal({
    studentId: '',
    type: 'SPP',
    month: MONTHS[new Date().getMonth()],
    year: new Date().getFullYear().toString(),
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    status: 'Lunas' as Transaction['status']
  });

  studentForm = signal<Partial<Student>>({
    id: 0,
    nis: '',
    name: '',
    class: '9A',
    status: 'Aktif'
  });

  // Password Form (Local)
  passwordForm = signal({ current: '', new: '', confirm: '' });

  // Constants
  MONTHS = MONTHS;
  PAYMENT_TYPES = PAYMENT_TYPES;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor() {
    effect(() => {
      // Apply dark mode
      if (this.appSettings().darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }

  // --- Computed Values ---

  t = computed(() => {
    const lang = this.appSettings().language;
    return (key: string) => TRANSLATIONS[lang][key] || key;
  });

  totalCollected = computed(() => 
    this.transactions().reduce((acc, curr) => acc + curr.amount, 0)
  );

  totalTransactions = computed(() => this.transactions().length);

  monthlyStats = computed(() => {
    const monthlyTarget = this.students().length * 150000;
    const currentMonthSPP = this.transactions()
      .filter(t => t.type === 'SPP' && t.month === 'Januari')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const percentage = monthlyTarget > 0 ? Math.round((currentMonthSPP / monthlyTarget) * 100) : 0;
    const paidCount = Math.round((currentMonthSPP / 150000));
    
    return { monthlyTarget, currentMonthSPP, percentage, paidCount };
  });

  chartData = computed(() => {
    const counts: {[key: string]: number} = {};
    const txs = this.transactions();
    txs.forEach(t => { counts[t.type] = (counts[t.type] || 0) + t.amount; });
    
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    let currentDeg = 0;
    const data = Object.entries(counts).map(([label, value], index) => {
      const percentage = total > 0 ? (value / total) * 100 : 0;
      const deg = total > 0 ? (value / total) * 360 : 0;
      const color = CHART_COLORS[index % CHART_COLORS.length];
      const segment = `${color} ${currentDeg}deg ${currentDeg + deg}deg`;
      currentDeg += deg;
      return { label, value, percentage, color, segment };
    });
    
    const gradient = data.length > 0 
      ? `conic-gradient(${data.map(d => d.segment).join(', ')})`
      : `conic-gradient(${this.appSettings().darkMode ? '#334155' : '#f1f5f9'} 0deg 360deg)`;
      
    return { data, gradient, total };
  });

  // --- Styles ---

  getTextSizeClass = computed(() => {
    switch(this.appSettings().textSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  });

  getBgClass = computed(() => this.appSettings().darkMode ? 'bg-slate-900' : 'bg-slate-50');
  getTextClass = computed(() => this.appSettings().darkMode ? 'text-slate-100' : 'text-slate-900');
  getCardBgClass = computed(() => this.appSettings().darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100');
  getSubTextClass = computed(() => this.appSettings().darkMode ? 'text-slate-400' : 'text-slate-500');

  // --- Actions ---

  handleLogin(e: Event) {
    e.preventDefault();
    this.isLoggedIn.set(true);
  }

  handleLogout() {
    this.isLoggedIn.set(false);
    this.activeTab.set('dashboard');
  }

  formatRupiah(num: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  }

  getStudentName(id: number): string {
    return this.students().find(s => s.id === id)?.name || 'Unknown';
  }

  // Transaction Actions
  handleAddPayment(e: Event) {
    e.preventDefault();
    const form = this.paymentForm();
    const student = this.students().find(s => s.id === parseInt(form.studentId));
    if (!student) return;

    const newTx: Transaction = {
      id: Date.now(),
      studentId: parseInt(form.studentId),
      type: form.type,
      month: form.type === 'SPP' ? form.month : '-',
      year: form.type === 'SPP' ? form.year : '-',
      amount: form.amount,
      date: form.date,
      status: form.status
    };

    this.transactions.update(txs => [newTx, ...txs]);
    this.showPaymentModal.set(false);
    
    // Reset form
    this.paymentForm.set({
      studentId: '',
      type: 'SPP',
      month: MONTHS[new Date().getMonth()],
      year: new Date().getFullYear().toString(),
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      status: 'Lunas'
    });
  }

  // Student Actions
  openAddStudentModal() {
    this.isEditingStudent.set(false);
    this.studentForm.set({ id: 0, nis: '', name: '', class: '9A', status: 'Aktif' });
    this.showStudentModal.set(true);
  }

  openEditStudentModal(student: Student) {
    this.isEditingStudent.set(true);
    this.studentForm.set({ ...student });
    this.showStudentModal.set(true);
  }

  handleSaveStudent(e: Event) {
    e.preventDefault();
    const form = this.studentForm();
    
    if (this.isEditingStudent()) {
      this.students.update(list => list.map(s => s.id === form.id ? form as Student : s));
    } else {
      const newStudent = { ...form, id: Date.now() } as Student;
      this.students.update(list => [...list, newStudent]);
    }
    this.showStudentModal.set(false);
  }

  handleDeleteStudent(id: number) {
    if (confirm(this.t()('alert_delete_confirm'))) {
      this.students.update(list => list.filter(s => s.id !== id));
    }
  }

  // Import/Export
  handleExportData() {
    const t = this.t();
    const headers = [`${t('th_id')},${t('th_student')},${t('th_type')},${t('label_month_bill')},${t('label_year_bill')},${t('th_date')},${t('th_amount')},${t('th_status')}`];
    
    const rows = this.transactions().map(tx => {
      const studentName = this.students().find(s => s.id === tx.studentId)?.name || 'Siswa Dihapus';
      return `${tx.id},"${studentName}",${tx.type},${tx.month},${tx.year},${tx.date},${tx.amount},${tx.status}`;
    });
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  handleImportClick() {
    this.fileInput.nativeElement.click();
  }

  handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const startIndex = lines[0].toLowerCase().includes('nis') ? 1 : 0;
      const newStudents: Student[] = [];
      let importedCount = 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const [nis, name, className] = line.split(',');
          if (nis && name) {
            newStudents.push({
              id: Date.now() + i, 
              nis: nis.trim(), 
              name: name.replace(/"/g, '').trim(), 
              class: className?.trim() || '9A', 
              status: 'Aktif'
            });
            importedCount++;
          }
        }
      }

      if (importedCount > 0) {
        this.students.update(prev => [...prev, ...newStudents]);
        alert(`${this.t()('alert_import_success')} ${importedCount} data!`);
      }
    };
    reader.readAsText(file);
    target.value = '';
  }

  // Setting actions
  updateProfile(name: string, role: string) {
    this.profile.update(p => ({ ...p, name, role }));
    alert(this.t()('alert_profile_saved'));
  }

  updatePassword(e: Event) {
    e.preventDefault();
    const form = this.passwordForm();
    if (form.new !== form.confirm) {
      alert(this.t()('alert_pass_mismatch'));
      return;
    }
    alert(this.t()('alert_pass_saved'));
    this.passwordForm.set({ current: '', new: '', confirm: '' });
  }

  updateSettings(key: keyof AppSettings, value: any) {
    this.appSettings.update(s => ({ ...s, [key]: value }));
  }
}