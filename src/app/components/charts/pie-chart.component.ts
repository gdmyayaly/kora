import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartComponent } from './base-chart.component';
import { ChartService } from '../../services/chart.service';
import { ChartEventData } from '../../interfaces/chart.interface';

@Component({
  selector: 'app-pie-chart',
  imports: [CommonModule, BaseChartComponent],
  template: `
    <div class="w-full">
      <!-- En-tête du graphique -->
      @if (title() || subtitle()) {
        <div class="mb-4 text-center">
          @if (title()) {
            <h3 class="text-lg font-semibold text-foreground">{{ title() }}</h3>
          }
          @if (subtitle()) {
            <p class="text-sm text-muted-foreground">{{ subtitle() }}</p>
          }
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Graphique -->
        <div [class.lg:col-span-2]="showLegendTable()" [class.lg:col-span-3]="!showLegendTable()">
          <app-base-chart
            [type]="chartType()"
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
        </div>

        <!-- Légende avec détails -->
        @if (showLegendTable()) {
          <div class="lg:col-span-1">
            <div class="bg-card rounded-lg border p-4">
              <h4 class="font-medium text-foreground mb-4">Détails</h4>
              <div class="space-y-3">
                @for (item of legendData(); track item.label; let i = $index) {
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div
                        class="w-3 h-3 rounded-full"
                        [style.background-color]="item.color">
                      </div>
                      <span class="text-sm text-foreground">{{ item.label }}</span>
                    </div>
                    <div class="text-right">
                      <div class="text-sm font-medium text-foreground">
                        {{ formatValue(item.value) }}
                      </div>
                      <div class="text-xs text-muted-foreground">
                        {{ item.percentage }}%
                      </div>
                    </div>
                  </div>
                }
              </div>

              @if (showTotal()) {
                <div class="mt-4 pt-4 border-t border-border">
                  <div class="flex items-center justify-between font-medium">
                    <span class="text-foreground">Total</span>
                    <span class="text-foreground">{{ formatValue(totalValue()) }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Statistiques supplémentaires -->
      @if (showStats()) {
        <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (stat of computedStats(); track stat.label) {
            <div class="bg-card rounded-lg p-3 border text-center">
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
export class PieChartComponent {
  private chartService = inject(ChartService);

  // Inputs
  readonly labels = input.required<string[]>();
  readonly data = input.required<number[]>();
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly width = input<number>(400);
  readonly height = input<number>(300);
  readonly isLoading = input<boolean>(false);
  readonly error = input<string>();
  readonly theme = input<'light' | 'dark'>();
  readonly showActions = input<boolean>(true);
  readonly variant = input<'pie' | 'doughnut'>('pie');
  readonly colors = input<string[]>();
  readonly showLegendTable = input<boolean>(true);
  readonly showTotal = input<boolean>(true);
  readonly showStats = input<boolean>(false);
  readonly currency = input<string>('XOF');
  readonly cutout = input<number>(60); // Pour doughnut

  // Outputs
  readonly chartClick = output<ChartEventData>();
  readonly chartHover = output<ChartEventData>();
  readonly retry = output<void>();

  // Computed
  readonly chartType = computed(() => this.variant());

  readonly totalValue = computed(() => {
    return this.data().reduce((sum, value) => sum + value, 0);
  });

  readonly chartData = computed((): ChartData => {
    const inputColors = this.colors();
    const defaultColors = this.chartService.getColorPalette('primary').slice(0, this.labels().length);
    const colors = inputColors && inputColors.length >= this.labels().length ? inputColors : defaultColors;

    return {
      labels: this.labels(),
      datasets: [{
        data: this.data(),
        backgroundColor: colors,
        borderColor: this.chartService.getCurrentThemeColors().backgroundColor,
        borderWidth: 2,
        hoverBackgroundColor: colors.map(color => color + 'DD'),
        hoverBorderWidth: 3
      }]
    };
  });

  readonly chartOptions = computed((): ChartOptions => {
    const baseOptions = this.chartService.createBaseOptions();

    const options: any = {
      ...baseOptions,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...baseOptions.plugins,
        legend: {
          ...baseOptions.plugins?.legend,
          display: !this.showLegendTable(),
          position: 'bottom'
        },
        tooltip: {
          ...baseOptions.plugins?.tooltip,
          callbacks: {
            ...baseOptions.plugins?.tooltip?.callbacks,
            label: (context: any) => {
              const label = context.label || '';
              const value = context.parsed;
              const total = this.totalValue();
              const percentage = ((value / total) * 100).toFixed(1);

              const formattedValue = this.formatValue(value);
              return `${label}: ${formattedValue} (${percentage}%)`;
            }
          }
        }
      }
    };

    // Add cutout for doughnut charts
    if (this.variant() === 'doughnut') {
      options.cutout = `${this.cutout()}%`;
    }

    return options;
  });

  readonly legendData = computed(() => {
    const labels = this.labels();
    const data = this.data();
    const total = this.totalValue();
    const colors = this.chartData().datasets[0].backgroundColor as string[];

    return labels.map((label, index) => ({
      label,
      value: data[index],
      percentage: ((data[index] / total) * 100).toFixed(1),
      color: colors[index]
    }));
  });

  readonly computedStats = computed(() => {
    if (!this.showStats()) return [];

    const data = this.data();
    const total = this.totalValue();
    const average = total / data.length;
    const max = Math.max(...data);
    const min = Math.min(...data);

    return [
      { label: 'Éléments', value: data.length.toString() },
      { label: 'Moyenne', value: this.formatValue(average) },
      { label: 'Maximum', value: this.formatValue(max) },
      { label: 'Minimum', value: this.formatValue(min) }
    ];
  });

  formatValue(value: number): string {
    return this.currency()
      ? this.chartService.formatCurrency(value, this.currency())
      : this.chartService.formatNumber(value);
  }

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