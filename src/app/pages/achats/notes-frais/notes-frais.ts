import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { AchatsDataService } from '../../../services/achats-data.service';
import { BarChartComponent } from '../../../components/charts/bar-chart.component';
import { PieChartComponent } from '../../../components/charts/pie-chart.component';
import { LineChartComponent } from '../../../components/charts/line-chart.component';
import { ExpenseNote, AchatsMetrics } from '../../../interfaces/achats.interface';

@Component({
  selector: 'app-notes-frais',
  imports: [CommonModule, BarChartComponent, PieChartComponent, LineChartComponent],
  templateUrl: './notes-frais.html',
  styleUrl: './notes-frais.css'
})
export class NotesFrais {
  private toastService = inject(ToastService);
  private achatsDataService = inject(AchatsDataService);

  protected readonly searchTerm = signal('');
  protected readonly selectedStatus = signal<'all' | 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid'>('all');
  protected readonly selectedEmployee = signal<'all' | string>('all');
  protected readonly selectedCategory = signal<'all' | 'transport' | 'accommodation' | 'meals' | 'supplies' | 'travel' | 'other'>('all');
  protected readonly dateRange = signal<'all' | 'thisMonth' | 'lastMonth' | 'thisYear'>('all');
  protected readonly isLoading = signal(false);

  // Utiliser le service pour les données
  protected readonly expenseNotes = this.achatsDataService.expenseNotes;
  protected readonly metrics = computed(() => this.achatsDataService.metrics().expenses);
  protected readonly chartData = computed(() => this.achatsDataService.chartData().expenses);

  // Employés uniques pour le filtre
  protected readonly availableEmployees = computed(() => {
    const employees = this.expenseNotes().map(note => ({
      id: note.employeeId,
      name: note.employeeName
    }));
    return employees.filter((emp, index, self) =>
      index === self.findIndex(e => e.id === emp.id)
    ).sort((a, b) => a.name.localeCompare(b.name));
  });

  protected readonly filteredExpenseNotes = computed(() => {
    const notes = this.expenseNotes();
    const search = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();
    const employee = this.selectedEmployee();
    const category = this.selectedCategory();
    const range = this.dateRange();

    let filtered = notes;

    if (status !== 'all') {
      filtered = filtered.filter(note => note.status === status);
    }

    if (employee !== 'all') {
      filtered = filtered.filter(note => note.employeeId === employee);
    }

    if (category !== 'all') {
      filtered = filtered.filter(note => note.category === category);
    }

    if (search) {
      filtered = filtered.filter(note =>
        note.noteNumber.toLowerCase().includes(search) ||
        note.employeeName.toLowerCase().includes(search) ||
        note.title.toLowerCase().includes(search) ||
        note.description.toLowerCase().includes(search)
      );
    }

    if (range !== 'all') {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      filtered = filtered.filter(note => {
        const noteDate = new Date(note.submittedAt);
        const noteMonth = noteDate.getMonth();
        const noteYear = noteDate.getFullYear();

        switch (range) {
          case 'thisMonth':
            return noteMonth === currentMonth && noteYear === currentYear;
          case 'lastMonth':
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return noteMonth === lastMonth && noteYear === lastMonthYear;
          case 'thisYear':
            return noteYear === currentYear;
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  });

  ngOnInit(): void {
    this.loadExpenseNotes();
  }

  private loadExpenseNotes(): void {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.toastService.success('Notes de frais chargées avec succès');
    }, 1000);
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  protected onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus.set(target.value as 'all' | 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid');
  }

  protected onEmployeeFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedEmployee.set(target.value);
  }

  protected onCategoryFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory.set(target.value as 'all' | 'transport' | 'accommodation' | 'meals' | 'supplies' | 'travel' | 'other');
  }

  protected onDateRangeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.dateRange.set(target.value as 'all' | 'thisMonth' | 'lastMonth' | 'thisYear');
  }

  protected onCreateExpenseNote(): void {
    this.toastService.info('Fonctionnalité de création de note de frais à implémenter');
  }

  protected onEditExpenseNote(note: ExpenseNote): void {
    this.toastService.info(`Modification de la note ${note.noteNumber} à implémenter`);
  }

  protected onDeleteExpenseNote(note: ExpenseNote): void {
    this.toastService.warning(`Suppression de la note ${note.noteNumber} à implémenter`);
  }

  protected onApproveExpenseNote(note: ExpenseNote): void {
    this.achatsDataService.updateExpenseNote(note.id, {
      status: 'approved',
      approvedBy: 'Utilisateur actuel',
      approvedAt: new Date().toISOString().split('T')[0]
    });
    this.toastService.success(`Note ${note.noteNumber} approuvée`);
  }

  protected onRejectExpenseNote(note: ExpenseNote): void {
    const reason = prompt('Raison du rejet:');
    if (reason) {
      this.achatsDataService.updateExpenseNote(note.id, {
        status: 'rejected',
        rejectedAt: new Date().toISOString().split('T')[0],
        rejectionReason: reason
      });
      this.toastService.warning(`Note ${note.noteNumber} rejetée`);
    }
  }

  protected onPayExpenseNote(note: ExpenseNote): void {
    this.achatsDataService.updateExpenseNote(note.id, { status: 'paid' });
    this.toastService.success(`Note ${note.noteNumber} marquée comme payée`);
  }

  protected onRefresh(): void {
    this.loadExpenseNotes();
  }

  protected onExportExcel(): void {
    this.toastService.success('Export Excel en cours de préparation...');
    setTimeout(() => {
      this.toastService.info('Export terminé ! Fichier téléchargé.');
    }, 2000);
  }

  protected getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      submitted: 'Soumise',
      approved: 'Approuvée',
      rejected: 'Rejetée',
      paid: 'Payée'
    };
    return labels[status] || status;
  }

  protected getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      transport: 'Transport',
      accommodation: 'Hébergement',
      meals: 'Repas',
      supplies: 'Fournitures',
      travel: 'Déplacement',
      other: 'Autre'
    };
    return labels[category] || category;
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  protected getEmployeeInitials(employeeName: string): string {
    return employeeName.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  protected getUniqueEmployees(): { id: string; name: string }[] {
    const employees = this.expenseNotes().map(note => ({
      id: note.employeeId,
      name: note.employeeName
    }));

    return employees.filter((employee, index, self) =>
      index === self.findIndex(e => e.id === employee.id)
    );
  }

  protected getRandomColor(): string {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}