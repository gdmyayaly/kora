import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { SalairesDataService } from '../../../services/salaires-data.service';
import { PaySlip, PaySlipStatus } from '../../../interfaces/salaires.interface';

@Component({
  selector: 'app-bulletins',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './bulletins.html',
  styleUrl: './bulletins.css'
})
export class Bulletins implements OnInit {
  private toastService = inject(ToastService);
  private salairesDataService = inject(SalairesDataService);

  protected readonly searchTerm = signal('');
  protected readonly selectedPeriod = signal<'all' | string>('all');
  protected readonly selectedStatus = signal<'all' | PaySlipStatus>('all');
  protected readonly selectedEmployee = signal<'all' | string>('all');
  protected readonly sortBy = signal<'paySlipNumber' | 'employee' | 'period' | 'grossSalary' | 'netSalary'>('paySlipNumber');
  protected readonly sortOrder = signal<'asc' | 'desc'>('desc');
  protected readonly isLoading = signal(false);
  protected readonly paySlips = signal<PaySlip[]>([]);
  protected readonly selectedPaySlips = signal<PaySlip[]>([]);

  protected readonly filteredPaySlips = computed(() => {
    const paySlips = this.paySlips();
    const search = this.searchTerm().toLowerCase();
    const period = this.selectedPeriod();
    const status = this.selectedStatus();
    const employee = this.selectedEmployee();
    const sortBy = this.sortBy();
    const sortOrder = this.sortOrder();

    let filtered = paySlips;

    // Filter by period
    if (period !== 'all') {
      filtered = filtered.filter(paySlip => paySlip.period === period);
    }

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(paySlip => paySlip.status === status);
    }

    // Filter by employee
    if (employee !== 'all') {
      filtered = filtered.filter(paySlip => paySlip.employeeName === employee);
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter(paySlip =>
        paySlip.paySlipNumber.toLowerCase().includes(search) ||
        paySlip.employeeName.toLowerCase().includes(search) ||
        paySlip.period.toLowerCase().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'paySlipNumber':
          aValue = a.paySlipNumber;
          bValue = b.paySlipNumber;
          break;
        case 'employee':
          aValue = a.employeeName;
          bValue = b.employeeName;
          break;
        case 'period':
          aValue = a.period;
          bValue = b.period;
          break;
        case 'grossSalary':
          aValue = a.grossSalary;
          bValue = b.grossSalary;
          break;
        case 'netSalary':
          aValue = a.netSalary;
          bValue = b.netSalary;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  });

  protected readonly availablePeriods = computed(() => {
    const paySlips = this.paySlips();
    const periods = [...new Set(paySlips.map(p => p.period))];
    return periods.sort((a, b) => b.localeCompare(a));
  });

  protected readonly availableEmployees = computed(() => {
    const paySlips = this.paySlips();
    const employees = [...new Set(paySlips.map(p => p.employeeName))];
    return employees.sort();
  });

  ngOnInit(): void {
    this.loadPaySlips();
  }

  private async loadPaySlips(): Promise<void> {
    this.isLoading.set(true);
    try {
      const paySlips = await this.salairesDataService.getPaySlips();
      this.paySlips.set(paySlips);
      this.toastService.success('Bulletins de paie chargés avec succès');
    } catch (error) {
      this.toastService.error('Erreur lors du chargement des bulletins de paie');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  protected onPeriodFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedPeriod.set(target.value);
  }

  protected onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus.set(target.value as any);
  }

  protected onEmployeeFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedEmployee.set(target.value);
  }

  protected onSort(field: 'paySlipNumber' | 'employee' | 'period' | 'grossSalary' | 'netSalary'): void {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
  }

  protected onToggleSelect(paySlip: PaySlip): void {
    const selected = this.selectedPaySlips();
    const isSelected = selected.some(p => p.id === paySlip.id);

    if (isSelected) {
      this.selectedPaySlips.set(selected.filter(p => p.id !== paySlip.id));
    } else {
      this.selectedPaySlips.set([...selected, paySlip]);
    }
  }

  protected onToggleSelectAll(): void {
    const filtered = this.filteredPaySlips();
    const selected = this.selectedPaySlips();

    if (this.isAllSelected()) {
      // Deselect all filtered
      const filteredIds = new Set(filtered.map(p => p.id));
      this.selectedPaySlips.set(selected.filter(p => !filteredIds.has(p.id)));
    } else {
      // Select all filtered
      const selectedIds = new Set(selected.map(p => p.id));
      const newSelections = filtered.filter(p => !selectedIds.has(p.id));
      this.selectedPaySlips.set([...selected, ...newSelections]);
    }
  }

  protected onClearSelection(): void {
    this.selectedPaySlips.set([]);
  }

  protected isSelected(paySlip: PaySlip): boolean {
    return this.selectedPaySlips().some(p => p.id === paySlip.id);
  }

  protected isAllSelected(): boolean {
    const filtered = this.filteredPaySlips();
    const selected = this.selectedPaySlips();
    const filteredIds = new Set(filtered.map(p => p.id));
    const selectedFilteredCount = selected.filter(p => filteredIds.has(p.id)).length;
    return filtered.length > 0 && selectedFilteredCount === filtered.length;
  }

  protected isPartiallySelected(): boolean {
    const filtered = this.filteredPaySlips();
    const selected = this.selectedPaySlips();
    const filteredIds = new Set(filtered.map(p => p.id));
    const selectedFilteredCount = selected.filter(p => filteredIds.has(p.id)).length;
    return selectedFilteredCount > 0 && selectedFilteredCount < filtered.length;
  }

  protected onViewPaySlip(paySlip: PaySlip): void {
    this.toastService.info(`Affichage du bulletin ${paySlip.paySlipNumber}`);
  }

  protected onEditPaySlip(paySlip: PaySlip): void {
    this.toastService.info(`Modification du bulletin ${paySlip.paySlipNumber} à implémenter`);
  }

  protected onDeletePaySlip(paySlip: PaySlip): void {
    this.toastService.warning(`Suppression du bulletin ${paySlip.paySlipNumber} à implémenter`);
  }

  protected onGeneratePaySlip(paySlip: PaySlip): void {
    this.toastService.info(`Génération du bulletin ${paySlip.paySlipNumber} en cours...`);
    setTimeout(() => {
      this.toastService.success(`Bulletin ${paySlip.paySlipNumber} généré avec succès`);
    }, 1500);
  }

  protected onSendPaySlip(paySlip: PaySlip): void {
    this.toastService.info(`Envoi du bulletin ${paySlip.paySlipNumber} en cours...`);
    setTimeout(() => {
      this.toastService.success(`Bulletin ${paySlip.paySlipNumber} envoyé avec succès`);
    }, 1000);
  }

  protected onDownloadPaySlip(paySlip: PaySlip): void {
    this.toastService.success(`Téléchargement du bulletin ${paySlip.paySlipNumber} en cours...`);
  }

  protected onGenerateAll(): void {
    this.toastService.info('Génération de tous les bulletins en cours...');
    setTimeout(() => {
      this.toastService.success('Tous les bulletins ont été générés');
    }, 3000);
  }

  protected onSendAll(): void {
    this.toastService.info('Envoi de tous les bulletins en cours...');
    setTimeout(() => {
      this.toastService.success('Tous les bulletins ont été envoyés');
    }, 2500);
  }

  protected onBulkGenerate(): void {
    const count = this.selectedPaySlips().length;
    this.toastService.info(`Génération de ${count} bulletin(s) en cours...`);
    setTimeout(() => {
      this.toastService.success(`${count} bulletin(s) généré(s) avec succès`);
      this.onClearSelection();
    }, 2000);
  }

  protected onBulkSend(): void {
    const count = this.selectedPaySlips().length;
    this.toastService.info(`Envoi de ${count} bulletin(s) en cours...`);
    setTimeout(() => {
      this.toastService.success(`${count} bulletin(s) envoyé(s) avec succès`);
      this.onClearSelection();
    }, 1500);
  }

  protected onBulkDownload(): void {
    const count = this.selectedPaySlips().length;
    this.toastService.success(`Téléchargement de ${count} bulletin(s) en cours...`);
    this.onClearSelection();
  }

  protected onRefresh(): void {
    this.loadPaySlips();
  }

  protected onExportExcel(): void {
    this.toastService.success('Export Excel en cours de préparation...');
    setTimeout(() => {
      this.toastService.info('Export terminé ! Fichier téléchargé.');
    }, 2000);
  }

  protected formatCurrency(amount: number): string {
    return this.salairesDataService.formatCurrency(amount);
  }

  protected getStatusLabel(status: PaySlipStatus): string {
    return this.salairesDataService.getStatusLabel(status);
  }

  protected getEmployeeInitials(employeeName: string): string {
    return employeeName.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  protected getPaySlipsByStatus(status: PaySlipStatus): PaySlip[] {
    return this.filteredPaySlips().filter(paySlip => paySlip.status === status);
  }

  protected getGeneratedPaySlips(): PaySlip[] {
    return this.filteredPaySlips().filter(paySlip => paySlip.status === 'generated');
  }
}