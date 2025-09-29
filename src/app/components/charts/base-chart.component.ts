import { Component, input, output, viewChild, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions, ChartType, Chart, ChartEvent, ActiveElement } from 'chart.js';
import { ChartService } from '../../services/chart.service';
import {
  BaseChartProps,
  ChartEventData,
  ChartEventHandler,
  ChartExportOptions
} from '../../interfaces/chart.interface';

@Component({
  selector: 'app-base-chart',
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="relative w-full" [style.height.px]="height()">
      <!-- Loader -->
      @if (isLoading()) {
        <div class="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-lg z-10">
          <div class="flex items-center gap-3">
            <i class="fas fa-spinner fa-spin text-primary text-lg"></i>
            <span class="text-sm text-muted-foreground">Chargement du graphique...</span>
          </div>
        </div>
      }

      <!-- Erreur -->
      @if (error() && !isLoading()) {
        <div class="absolute inset-0 flex items-center justify-center bg-card rounded-lg border border-red-200 dark:border-red-800">
          <div class="text-center p-6">
            <i class="fas fa-chart-bar text-4xl text-red-500 mb-4"></i>
            <h3 class="text-lg font-medium text-foreground mb-2">Erreur de chargement</h3>
            <p class="text-sm text-muted-foreground mb-4">{{ error() }}</p>
            <button
              (click)="onRetry()"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
              <i class="fas fa-redo mr-2"></i>
              Réessayer
            </button>
          </div>
        </div>
      }

      <!-- Graphique -->
      @if (!error() && chartData()) {
        <canvas
          #chartCanvas
          baseChart
          [type]="type()"
          [data]="chartData()!"
          [options]="chartOptions()"
          [width]="width()"
          [height]="height()"
          (chartClick)="onChartClick($event)"
          class="w-full h-full">
        </canvas>
      }

      <!-- Actions du graphique -->
      @if (showActions() && !isLoading() && !error()) {
        <div class="absolute top-2 right-2 flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity bg-card/80 backdrop-blur-sm rounded-lg p-1">
          <button
            (click)="refreshChart()"
            class="w-8 h-8 flex items-center justify-center hover:bg-accent rounded-md transition-colors"
            title="Actualiser">
            <i class="fas fa-sync text-xs text-muted-foreground"></i>
          </button>
          <button
            (click)="exportChart('png')"
            class="w-8 h-8 flex items-center justify-center hover:bg-accent rounded-md transition-colors"
            title="Exporter en PNG">
            <i class="fas fa-download text-xs text-muted-foreground"></i>
          </button>
          <button
            (click)="toggleFullscreen()"
            class="w-8 h-8 flex items-center justify-center hover:bg-accent rounded-md transition-colors"
            title="Plein écran">
            <i class="fas fa-expand text-xs text-muted-foreground"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }

    .chart-container {
      position: relative;
      width: 100%;
      transition: all 0.3s ease;
    }

    .chart-actions {
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    canvas {
      display: block;
      max-width: 100%;
      height: auto;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .chart-container {
      animation: fadeIn 0.4s ease-out;
    }
  `]
})
export class BaseChartComponent implements OnInit, OnDestroy {
  private chartService = inject(ChartService);

  // Inputs
  readonly type = input.required<ChartType>();
  readonly data = input.required<ChartData>();
  readonly options = input<ChartOptions>();
  readonly width = input<number>(400);
  readonly height = input<number>(300);
  readonly isLoading = input<boolean>(false);
  readonly error = input<string>();
  readonly theme = input<'light' | 'dark'>();
  readonly showActions = input<boolean>(true);

  // Outputs
  readonly chartClick = output<ChartEventData>();
  readonly chartHover = output<ChartEventData>();
  readonly chartReady = output<Chart>();
  readonly chartError = output<string>();
  readonly retry = output<void>();

  // ViewChild
  readonly chartDirective = viewChild<BaseChartDirective>('chartCanvas');

  // Signals
  private readonly themeSignal = signal<'light' | 'dark'>('light');

  // Computed
  readonly chartData = computed(() => {
    const inputData = this.data();
    if (!inputData) return null;

    // Appliquer les couleurs du thème si elles ne sont pas définies
    return {
      ...inputData,
      datasets: inputData.datasets?.map((dataset, index) => ({
        ...dataset,
        backgroundColor: dataset.backgroundColor || this.chartService.getColorPalette('primary')[index % this.chartService.getColorPalette('primary').length],
        borderColor: dataset.borderColor || this.chartService.getColorPalette('primary')[index % this.chartService.getColorPalette('primary').length]
      }))
    } as any;
  });

  readonly chartOptions = computed(() => {
    const baseOptions = this.chartService.createBaseOptions();
    const customOptions = this.options();

    return {
      ...baseOptions,
      ...customOptions,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...baseOptions.plugins,
        ...customOptions?.plugins
      }
    };
  });

  ngOnInit(): void {
    // Définir le thème
    const inputTheme = this.theme();
    if (inputTheme) {
      this.themeSignal.set(inputTheme);
      this.chartService.setTheme(inputTheme);
    } else {
      this.themeSignal.set(this.chartService.getTheme());
    }
  }

  ngOnDestroy(): void {
    // Nettoyage si nécessaire
  }

  onChartClick(event: any): void {
    if (!event.active?.length) return;

    const activeElement = event.active[0];
    const chart = this.chartDirective()?.chart;

    if (chart && activeElement) {
      const eventData: ChartEventData = {
        type: 'click',
        dataIndex: activeElement.index,
        datasetIndex: activeElement.datasetIndex,
        element: activeElement,
        chart: chart
      };

      this.chartClick.emit(eventData);
    }
  }

  onChartHover(event: any): void {
    const activeElement = event.active?.[0];
    const chart = this.chartDirective()?.chart;

    if (chart && activeElement) {
      const eventData: ChartEventData = {
        type: 'hover',
        dataIndex: activeElement.index,
        datasetIndex: activeElement.datasetIndex,
        element: activeElement,
        chart: chart
      };

      this.chartHover.emit(eventData);
    }
  }

  onRetry(): void {
    this.retry.emit();
  }

  refreshChart(): void {
    const chart = this.chartDirective()?.chart;
    if (chart) {
      chart.update('active');
    }
  }

  exportChart(format: 'png' | 'jpg' | 'svg' | 'pdf' = 'png'): void {
    const canvas = this.chartDirective()?.chart?.canvas;
    if (canvas) {
      const exportOptions: ChartExportOptions = {
        format,
        filename: `chart-${Date.now()}`,
        backgroundColor: this.chartService.getCurrentThemeColors().backgroundColor
      };

      this.chartService.exportChart(canvas, exportOptions);
    }
  }

  toggleFullscreen(): void {
    const element = this.chartDirective()?.chart?.canvas?.parentElement;
    if (element) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        element.requestFullscreen();
      }
    }
  }

  updateData(newData: ChartData): void {
    const chart = this.chartDirective()?.chart;
    if (chart) {
      chart.data = newData;
      chart.update('active');
    }
  }

  updateOptions(newOptions: ChartOptions): void {
    const chart = this.chartDirective()?.chart;
    if (chart) {
      chart.options = { ...chart.options, ...newOptions };
      chart.update('active');
    }
  }

  getChartInstance(): Chart | undefined {
    return this.chartDirective()?.chart;
  }

  destroy(): void {
    const chart = this.chartDirective()?.chart;
    if (chart) {
      chart.destroy();
    }
  }
}