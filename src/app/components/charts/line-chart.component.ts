import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartComponent } from './base-chart.component';
import { ChartService } from '../../services/chart.service';
import { ChartDataset, ChartEventData } from '../../interfaces/chart.interface';

@Component({
  selector: 'app-line-chart',
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
        type="line"
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

      <!-- Légende personnalisée -->
      @if (showCustomLegend() && chartData().datasets) {
        <div class="mt-4 flex flex-wrap gap-4 justify-center">
          @for (dataset of chartData().datasets; track dataset.label) {
            <div class="flex items-center gap-2">
              <div
                class="w-3 h-3 rounded-full"
                [style.background-color]="dataset.borderColor || dataset.backgroundColor">
              </div>
              <span class="text-sm text-foreground">{{ dataset.label }}</span>
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
export class LineChartComponent {
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
  readonly showCustomLegend = input<boolean>(false);
  readonly smooth = input<boolean>(true);
  readonly filled = input<boolean>(false);
  readonly stacked = input<boolean>(false);
  readonly currency = input<string>('XOF');
  readonly showGrid = input<boolean>(true);
  readonly showTooltips = input<boolean>(true);

  // Outputs
  readonly chartClick = output<ChartEventData>();
  readonly chartHover = output<ChartEventData>();
  readonly retry = output<void>();

  // Computed
  readonly chartData = computed((): ChartData => {
    const inputDatasets = this.datasets();
    const processedDatasets = inputDatasets.map((dataset, index) => ({
      ...dataset,
      fill: this.filled() ? true : (dataset.fill !== undefined ? dataset.fill : false),
      tension: this.smooth() ? 0.4 : 0,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderColor: dataset.borderColor || this.chartService.getColorPalette('primary')[index % this.chartService.getColorPalette('primary').length],
      backgroundColor: dataset.backgroundColor ||
        (this.filled()
          ? this.chartService.getColorPalette('primary')[index % this.chartService.getColorPalette('primary').length] + '30'
          : this.chartService.getColorPalette('primary')[index % this.chartService.getColorPalette('primary').length])
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
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        x: {
          ...baseOptions.scales?.['x'],
          grid: {
            ...baseOptions.scales?.['x']?.grid,
            display: this.showGrid()
          }
        },
        y: {
          ...baseOptions.scales?.['y'],
          stacked: this.stacked(),
          grid: {
            ...baseOptions.scales?.['y']?.grid,
            display: this.showGrid()
          },
          ticks: {
            ...baseOptions.scales?.['y']?.ticks,
            callback: (value: any) => {
              if (this.currency()) {
                return this.chartService.formatCurrency(value, this.currency());
              }
              return this.chartService.formatNumber(value);
            }
          }
        }
      },
      plugins: {
        ...baseOptions.plugins,
        legend: {
          ...baseOptions.plugins?.legend,
          display: !this.showCustomLegend()
        },
        tooltip: {
          ...baseOptions.plugins?.tooltip,
          enabled: this.showTooltips(),
          callbacks: {
            ...baseOptions.plugins?.tooltip?.callbacks,
            label: (context: any) => {
              const label = context.dataset.label || '';
              let value = context.parsed.y;

              if (this.currency()) {
                value = this.chartService.formatCurrency(value, this.currency());
              } else {
                value = this.chartService.formatNumber(value);
              }

              return `${label}: ${value}`;
            }
          }
        }
      },
      elements: {
        ...baseOptions.elements,
        line: {
          ...baseOptions.elements?.line,
          tension: this.smooth() ? 0.4 : 0
        }
      }
    };
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