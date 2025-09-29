import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { SalairesDataService } from '../../../services/salaires-data.service';
import { SalaryMetrics, EmployeeDepartment } from '../../../interfaces/salaires.interface';

@Component({
  selector: 'app-statistiques-salaires',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './statistiques.html',
  styleUrl: './statistiques.css'
})
export class StatistiquesSalaires implements OnInit {
  private toastService = inject(ToastService);
  private salairesDataService = inject(SalairesDataService);

  protected readonly isLoading = signal(false);

  protected readonly metrics = computed((): SalaryMetrics => {
    return this.salairesDataService.metrics();
  });

  ngOnInit(): void {
    this.loadStatistics();
  }

  private async loadStatistics(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      this.toastService.success('Statistiques chargées avec succès');
    } catch (error) {
      this.toastService.error('Erreur lors du chargement des statistiques');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onRefresh(): void {
    this.loadStatistics();
  }

  protected onExportDashboard(): void {
    this.toastService.success('Export du tableau de bord en cours...');
    setTimeout(() => {
      this.toastService.info('Export terminé ! Fichier téléchargé.');
    }, 2000);
  }

  protected formatCurrency(amount: number): string {
    return this.salairesDataService.formatCurrency(amount);
  }

  protected getDepartmentLabel(department: EmployeeDepartment): string {
    return this.salairesDataService.getDepartmentLabel(department);
  }

  protected calculateChargesPercentage(): number {
    const metrics = this.metrics();
    const totalGross = metrics.payroll.currentMonth.totalGross;
    const totalContributions = metrics.payroll.currentMonth.totalContributions;

    if (totalGross === 0) return 0;
    return (totalContributions / totalGross) * 100;
  }

  protected getGrossChange(): number {
    const metrics = this.metrics();
    const current = metrics.payroll.currentMonth.totalGross;
    const previous = metrics.payroll.previousMonth.totalGross;

    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  protected getNetChange(): number {
    const metrics = this.metrics();
    const current = metrics.payroll.currentMonth.totalNet;
    const previous = metrics.payroll.previousMonth.totalNet;

    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  protected getContributionsChange(): number {
    const metrics = this.metrics();
    const current = metrics.payroll.currentMonth.totalContributions;
    const previous = metrics.payroll.previousMonth.totalContributions;

    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  protected getBarHeight(value: number, type: 'max' | 'charges'): number {
    const metrics = this.metrics();

    if (type === 'charges') {
      // For charges, calculate relative to the max total gross
      const maxGross = Math.max(...metrics.monthlyTrends.map(t => t.totalGross));
      return maxGross > 0 ? (value / maxGross) * 100 : 0;
    }

    // For max type, find the maximum value across all trends
    const maxValue = Math.max(
      ...metrics.monthlyTrends.map(t => Math.max(t.totalGross, t.totalNet))
    );

    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  }
}