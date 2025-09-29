import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartComponent } from './base-chart.component';
import { ChartService } from '../../services/chart.service';
import { ChartDataset, ChartEventData } from '../../interfaces/chart.interface';

@Component({
  selector: 'app-bar-chart',
  imports: [CommonModule, BaseChartComponent],
  template: `
    <div class="w-full">
      <!-- En-tête du graphique -->
      @if (title() || subtitle()) {
        <div class="mb-4">
          @if (title()) {
            <h3 class="text-lg font-semibold text-foreground">{{ title() }}</h3>
          }
          @if (subtitle()) {
            <p class="text-sm text-muted-foreground">{{ subtitle() }}</p>
          }
        </div>
      }

      <!-- Graphique -->
      <app-base-chart
        type="bar"
        [data]="chartData()"
        [options]="chartOptions()"
        [width]="width()"
        [height]="height()"
        [isLoading]="isLoading()"
        [error]="error()"
        [theme]="theme()"
        [showActions]="showActions()"
        (chartClick)="onChartClick($event)"
        (chartHover)="onChartHover($event)"
        (retry)="onRetry()">
      </app-base-chart>

      <!-- Statistiques -->
      @if (showStats() && chartData().datasets) {
        <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (stat of computedStats(); track stat.label) {
            <div class="bg-card rounded-lg p-3 border">
              <div class="text-xs text-muted-foreground">{{ stat.label }}</div>
              <div class="text-lg font-semibold text-foreground">{{ stat.value }}</div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class BarChartComponent {
  private chartService = inject(ChartService);

  // Inputs
  readonly labels = input.required<string[]>();
  readonly datasets = input.required<ChartDataset[]>();
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly width = input<number>(400);
  readonly height = input<number>(300);
  readonly isLoading = input<boolean>(false);
  readonly error = input<string>();
  readonly theme = input<'light' | 'dark'>();
  readonly showActions = input<boolean>(true);
  readonly horizontal = input<boolean>(false);
  readonly stacked = input<boolean>(false);
  readonly currency = input<string>('XOF');
  readonly showGrid = input<boolean>(true);
  readonly showStats = input<boolean>(false);
  readonly borderRadius = input<number>(4);

  // Outputs
  readonly chartClick = output<ChartEventData>();
  readonly chartHover = output<ChartEventData>();
  readonly retry = output<void>();

  // Computed
  readonly chartData = computed((): ChartData => {
    const inputDatasets = this.datasets();
    const processedDatasets = inputDatasets.map((dataset, index) => ({
      ...dataset,
      borderRadius: this.borderRadius(),
      borderWidth: 0,
      backgroundColor: dataset.backgroundColor || this.chartService.getColorPalette('primary')[index % this.chartService.getColorPalette('primary').length],
      borderColor: dataset.borderColor || this.chartService.getColorPalette('primary')[index % this.chartService.getColorPalette('primary').length],
      hoverBackgroundColor: dataset.backgroundColor || this.chartService.getColorPalette('primary')[index % this.chartService.getColorPalette('primary').length] + 'DD'
    }));

    return {
      labels: this.labels(),
      datasets: processedDatasets
    };
  });

  readonly chartOptions = computed((): ChartOptions => {
    const baseOptions = this.chartService.createBaseOptions();

    return {
      ...baseOptions,
      indexAxis: this.horizontal() ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ...baseOptions.scales?.['x'],
          stacked: this.stacked(),
          grid: {
            ...baseOptions.scales?.['x']?.grid,
            display: this.showGrid() && !this.horizontal()
          },
          ticks: {
            ...baseOptions.scales?.['x']?.ticks,
            callback: this.horizontal() ? (value: any) => {
              if (this.currency()) {
                return this.chartService.formatCurrency(value, this.currency());
              }
              return this.chartService.formatNumber(value);
            } : undefined
          }
        },
        y: {
          ...baseOptions.scales?.['y'],
          stacked: this.stacked(),
          beginAtZero: true,
          grid: {
            ...baseOptions.scales?.['y']?.grid,
            display: this.showGrid() && this.horizontal()
          },
          ticks: {
            ...baseOptions.scales?.['y']?.ticks,
            callback: !this.horizontal() ? (value: any) => {
              if (this.currency()) {
                return this.chartService.formatCurrency(value, this.currency());
              }
              return this.chartService.formatNumber(value);
            } : undefined
          }
        }
      },
      plugins: {
        ...baseOptions.plugins,
        tooltip: {
          ...baseOptions.plugins?.tooltip,
          callbacks: {
            ...baseOptions.plugins?.tooltip?.callbacks,
            label: (context: any) => {
              const label = context.dataset.label || '';
              let value = this.horizontal() ? context.parsed.x : context.parsed.y;

              if (this.currency()) {
                value = this.chartService.formatCurrency(value, this.currency());
              } else {
                value = this.chartService.formatNumber(value);
              }

              return `${label}: ${value}`;
            }
          }
        }
      }
    };
  });

  readonly computedStats = computed(() => {
    const datasets = this.chartData().datasets;
    if (!datasets || !this.showStats()) return [];

    const stats = [];
    const allValues = datasets.flatMap(dataset => dataset.data as number[]);

    if (allValues.length > 0) {
      const total = allValues.reduce((sum, val) => sum + val, 0);
      const average = total / allValues.length;
      const max = Math.max(...allValues);
      const min = Math.min(...allValues);

      const formatValue = (value: number) => {
        return this.currency()
          ? this.chartService.formatCurrency(value, this.currency())
          : this.chartService.formatNumber(value);
      };

      stats.push(
        { label: 'Total', value: formatValue(total) },
        { label: 'Moyenne', value: formatValue(average) },
        { label: 'Maximum', value: formatValue(max) },
        { label: 'Minimum', value: formatValue(min) }
      );
    }

    return stats;
  });

  onChartClick(event: ChartEventData): void {
    this.chartClick.emit(event);
  }

  onChartHover(event: ChartEventData): void {
    this.chartHover.emit(event);
  }

  onRetry(): void {
    this.retry.emit();
  }
}