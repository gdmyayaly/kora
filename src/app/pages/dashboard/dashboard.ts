import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LineChartComponent, BarChartComponent, PieChartComponent } from '../../components/charts';
import { ChartService } from '../../services/chart.service';
import { ChartDataset, ChartEventData } from '../../interfaces/chart.interface';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, LineChartComponent, BarChartComponent, PieChartComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit {
  private chartService = inject(ChartService);

  // Signaux pour les données des graphiques
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | undefined>(undefined);

  // Données pour le graphique linéaire (évolution mensuelle)
  protected readonly monthlyEvolutionLabels = signal<string[]>([]);
  protected readonly monthlyEvolutionDatasets = signal<ChartDataset[]>([]);

  // Données pour le graphique en barres (répartition par mois)
  protected readonly monthlyDistributionLabels = signal<string[]>([]);
  protected readonly monthlyDistributionDatasets = signal<ChartDataset[]>([]);

  // Données pour le graphique circulaire (répartition par type)
  protected readonly typeDistributionLabels = signal<string[]>([]);
  protected readonly typeDistributionData = signal<number[]>([]);

  // Données pour les KPIs
  protected readonly kpis = signal({
    totalCompanies: 0,
    totalRevenue: 0,
    totalEmployees: 0,
    avgGrowth: 0
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);
    this.error.set(undefined);

    try {
      // Simulation de données - à remplacer par des appels API réels
      setTimeout(() => {
        this.generateSampleData();
        this.isLoading.set(false);
      }, 1000);

    } catch (error) {
      this.error.set('Erreur lors du chargement des données');
      this.isLoading.set(false);
    }
  }

  private generateSampleData(): void {
    // Génération des données d'évolution mensuelle
    const monthlyData = this.chartService.generateSampleData('monthly', 12);
    this.monthlyEvolutionLabels.set(monthlyData.labels);
    this.monthlyEvolutionDatasets.set([
      {
        label: 'Chiffre d\'affaires',
        data: monthlyData.data.map(val => val * 1000),
        borderColor: this.chartService.getColorPalette('primary')[0],
        backgroundColor: this.chartService.getColorPalette('primary')[0] + '20',
        fill: true
      },
      {
        label: 'Coûts',
        data: monthlyData.data.map(val => val * 600),
        borderColor: this.chartService.getColorPalette('danger')[0],
        backgroundColor: this.chartService.getColorPalette('danger')[0] + '20',
        fill: true
      }
    ]);

    // Génération des données de répartition mensuelle
    const distributionData = this.chartService.generateSampleData('monthly', 6);
    this.monthlyDistributionLabels.set(distributionData.labels);
    this.monthlyDistributionDatasets.set([
      {
        label: 'Entreprises créées',
        data: distributionData.data.map(val => Math.floor(val / 10)),
        backgroundColor: this.chartService.getColorPalette('primary')[0]
      }
    ]);

    // Génération des données de répartition par type
    const typeLabels = ['SARL', 'SAS', 'EURL', 'SA', 'Auto-entrepreneur'];
    const typeData = [45, 25, 15, 10, 5];
    this.typeDistributionLabels.set(typeLabels);
    this.typeDistributionData.set(typeData);

    // Génération des KPIs
    this.kpis.set({
      totalCompanies: 142,
      totalRevenue: 2450000,
      totalEmployees: 68,
      avgGrowth: 12.5
    });
  }

  protected onChartClick(event: ChartEventData): void {
    console.log('Chart clicked:', event);
    // Ici vous pouvez implémenter la navigation ou l'affichage de détails
  }

  protected onChartHover(event: ChartEventData): void {
    // Gestion du survol des graphiques si nécessaire
  }

  protected onRetryLoadData(): void {
    this.loadDashboardData();
  }

  protected refreshData(): void {
    this.loadDashboardData();
  }
}