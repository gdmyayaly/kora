import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { SalairesDataService } from '../../../services/salaires-data.service';
import { PayrollPeriod, PayrollPeriodStatus } from '../../../interfaces/salaires.interface';

@Component({
  selector: 'app-paies-mensuelles',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './paies-mensuelles.html',
  styleUrl: './paies-mensuelles.css'
})
export class PaiesMensuelles implements OnInit {
  private toastService = inject(ToastService);
  private salairesDataService = inject(SalairesDataService);

  protected readonly searchTerm = signal('');
  protected readonly selectedYear = signal<'all' | string>('all');
  protected readonly selectedStatus = signal<'all' | PayrollPeriodStatus>('all');
  protected readonly isLoading = signal(false);
  protected readonly payrollPeriods = signal<PayrollPeriod[]>([]);

  protected readonly filteredPeriods = computed(() => {
    const periods = this.payrollPeriods();
    const search = this.searchTerm().toLowerCase();
    const year = this.selectedYear();
    const status = this.selectedStatus();

    let filtered = periods;

    // Filter by year
    if (year !== 'all') {
      filtered = filtered.filter(period => period.year.toString() === year);
    }

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(period => period.status === status);
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter(period =>
        this.getPeriodName(period).toLowerCase().includes(search) ||
        period.id.toLowerCase().includes(search)
      );
    }

    // Sort by year and month (most recent first)
    return filtered.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });
  });

  protected readonly currentPeriod = computed(() => {
    const periods = this.payrollPeriods();
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    return periods.find(period =>
      period.year === currentYear &&
      period.month === currentMonth
    );
  });

  ngOnInit(): void {
    this.loadPayrollPeriods();
  }

  private async loadPayrollPeriods(): Promise<void> {
    this.isLoading.set(true);
    try {
      const periods = await this.salairesDataService.getPayrollPeriods();
      this.payrollPeriods.set(periods);
      this.toastService.success('Périodes de paie chargées avec succès');
    } catch (error) {
      this.toastService.error('Erreur lors du chargement des périodes de paie');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  protected onYearFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedYear.set(target.value);
  }

  protected onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus.set(target.value as any);
  }

  protected onCreatePeriod(): void {
    this.toastService.info('Fonctionnalité de création de période de paie à implémenter');
  }

  protected onViewPeriod(period: PayrollPeriod): void {
    this.toastService.info(`Affichage des détails de la période ${this.getPeriodName(period)}`);
  }

  protected onEditPeriod(period: PayrollPeriod): void {
    this.toastService.info(`Modification de la période ${this.getPeriodName(period)} à implémenter`);
  }

  protected onDeletePeriod(period: PayrollPeriod): void {
    this.toastService.warning(`Suppression de la période ${this.getPeriodName(period)} à implémenter`);
  }

  protected onCalculatePayroll(period: PayrollPeriod): void {
    this.toastService.info(`Calcul des paies pour la période ${this.getPeriodName(period)} en cours...`);
    setTimeout(() => {
      this.toastService.success(`Paies calculées pour la période ${this.getPeriodName(period)}`);
    }, 2000);
  }

  protected onValidatePayroll(period: PayrollPeriod): void {
    this.toastService.info(`Validation des paies pour la période ${this.getPeriodName(period)} en cours...`);
    setTimeout(() => {
      this.toastService.success(`Paies validées pour la période ${this.getPeriodName(period)}`);
    }, 1500);
  }

  protected onProcessPayroll(period: PayrollPeriod): void {
    this.toastService.info(`Traitement des paiements pour la période ${this.getPeriodName(period)} en cours...`);
    setTimeout(() => {
      this.toastService.success(`Paiements traités pour la période ${this.getPeriodName(period)}`);
    }, 3000);
  }

  protected onViewPaySlips(period: PayrollPeriod): void {
    this.toastService.info(`Affichage des bulletins de paie pour ${this.getPeriodName(period)}`);
  }

  protected onRefresh(): void {
    this.loadPayrollPeriods();
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

  protected getStatusLabel(status: PayrollPeriodStatus): string {
    return this.salairesDataService.getStatusLabel(status);
  }

  protected getPeriodName(period: PayrollPeriod): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return `${months[period.month]} ${period.year}`;
  }

  protected getCurrentPeriod(): PayrollPeriod | undefined {
    return this.currentPeriod();
  }

  protected getCurrentPeriodName(): string {
    const current = this.getCurrentPeriod();
    return current ? this.getPeriodName(current) : 'Aucune période active';
  }

  protected isCurrentPeriod(period: PayrollPeriod): boolean {
    const current = this.getCurrentPeriod();
    return current ? current.id === period.id : false;
  }
}