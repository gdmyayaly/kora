import { Injectable, inject, signal } from '@angular/core';
import { ChartOptions, ChartData, TooltipItem, ChartType } from 'chart.js';
import {
  ChartTheme,
  ChartColorPalette,
  ChartConfig,
  ChartDataset,
  ChartExportOptions,
  AnimationConfig,
  ResponsiveChartOptions
} from '../interfaces/chart.interface';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private readonly currentTheme = signal<'light' | 'dark'>('light');

  private readonly lightTheme: ChartTheme = {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    gridColor: '#f3f4f6',
    textColor: '#374151',
    tooltipBackgroundColor: '#1f2937',
    tooltipTextColor: '#ffffff'
  };

  private readonly darkTheme: ChartTheme = {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    gridColor: '#4b5563',
    textColor: '#f9fafb',
    tooltipBackgroundColor: '#374151',
    tooltipTextColor: '#f9fafb'
  };

  private readonly colorPalette: ChartColorPalette = {
    primary: [
      '#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#1e3a8a',
      '#60a5fa', '#93c5fd', '#dbeafe', '#eff6ff'
    ],
    secondary: [
      '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827',
      '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6'
    ],
    success: [
      '#10b981', '#059669', '#047857', '#065f46', '#064e3b',
      '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'
    ],
    warning: [
      '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f',
      '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'
    ],
    danger: [
      '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
      '#f87171', '#fca5a5', '#fecaca', '#fee2e2'
    ],
    info: [
      '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63',
      '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe'
    ]
  };

  constructor() {
    this.detectSystemTheme();
  }

  private detectSystemTheme(): void {
    if (typeof window !== 'undefined') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme.set(isDark ? 'dark' : 'light');

      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          this.currentTheme.set(e.matches ? 'dark' : 'light');
        });
    }
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme.set(theme);
  }

  getTheme(): 'light' | 'dark' {
    return this.currentTheme();
  }

  getCurrentThemeColors(): ChartTheme {
    return this.currentTheme() === 'dark' ? this.darkTheme : this.lightTheme;
  }

  getColorPalette(type: keyof ChartColorPalette = 'primary'): string[] {
    return this.colorPalette[type];
  }

  createBaseOptions(): ChartOptions {
    const theme = this.getCurrentThemeColors();

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: theme.textColor,
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12,
              family: 'Inter, system-ui, sans-serif'
            }
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: theme.tooltipBackgroundColor,
          titleColor: theme.tooltipTextColor,
          bodyColor: theme.tooltipTextColor,
          borderColor: theme.borderColor,
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: (context: TooltipItem<any>) => {
              const label = context.dataset.label || '';
              const value = this.formatNumber(context.parsed.y || context.parsed);
              return `${label}: ${value}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: true,
            color: theme.gridColor
          },
          ticks: {
            color: theme.textColor,
            font: {
              size: 11,
              family: 'Inter, system-ui, sans-serif'
            }
          }
        },
        y: {
          grid: {
            display: true,
            color: theme.gridColor
          },
          ticks: {
            color: theme.textColor,
            font: {
              size: 11,
              family: 'Inter, system-ui, sans-serif'
            },
            callback: (value: any) => this.formatNumber(value)
          }
        }
      },
      animation: {
        duration: 750,
        easing: 'easeInOutCubic'
      },
      elements: {
        point: {
          radius: 4,
          hoverRadius: 6,
          borderWidth: 2
        },
        line: {
          borderWidth: 2,
          tension: 0.4
        },
        bar: {
          borderRadius: 4,
          borderWidth: 0
        }
      }
    };
  }

  createLineChartConfig(labels: string[], datasets: ChartDataset[]): ChartConfig {
    const baseOptions = this.createBaseOptions();

    return {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((dataset, index) => ({
          ...dataset,
          borderColor: dataset.borderColor || this.getColorPalette('primary')[index % this.getColorPalette('primary').length],
          backgroundColor: dataset.backgroundColor || this.getColorPalette('primary')[index % this.getColorPalette('primary').length] + '20',
          fill: dataset.fill !== undefined ? dataset.fill : false,
          tension: dataset.tension || 0.4,
          pointRadius: dataset.pointRadius || 4,
          pointHoverRadius: dataset.pointHoverRadius || 6
        }))
      },
      options: {
        ...baseOptions,
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    };
  }

  createBarChartConfig(labels: string[], datasets: ChartDataset[]): ChartConfig {
    const baseOptions = this.createBaseOptions();

    return {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map((dataset, index) => ({
          ...dataset,
          backgroundColor: dataset.backgroundColor || this.getColorPalette('primary')[index % this.getColorPalette('primary').length],
          borderColor: dataset.borderColor || this.getColorPalette('primary')[index % this.getColorPalette('primary').length],
          borderWidth: dataset.borderWidth || 0
        }))
      },
      options: {
        ...baseOptions,
        scales: {
          ...baseOptions.scales,
          x: {
            ...baseOptions.scales?.['x'],
            stacked: false
          },
          y: {
            ...baseOptions.scales?.['y'],
            stacked: false,
            beginAtZero: true
          }
        }
      }
    };
  }

  createPieChartConfig(labels: string[], data: number[], colors?: string[]): ChartConfig {
    const baseOptions = this.createBaseOptions();
    const pieColors = colors || this.getColorPalette('primary').slice(0, labels.length);

    return {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: 'Répartition',
          data,
          backgroundColor: pieColors,
          borderColor: this.getCurrentThemeColors().backgroundColor,
          borderWidth: 2
        }]
      },
      options: {
        ...baseOptions,
        scales: undefined, // Pas d'axes pour les graphiques circulaires
        plugins: {
          ...baseOptions.plugins,
          legend: {
            ...baseOptions.plugins?.legend,
            position: 'right'
          }
        }
      }
    };
  }

  createDoughnutChartConfig(labels: string[], data: number[], colors?: string[]): ChartConfig {
    const pieConfig = this.createPieChartConfig(labels, data, colors);
    return {
      ...pieConfig,
      type: 'doughnut',
      options: {
        ...pieConfig.options
      }
    };
  }

  createAreaChartConfig(labels: string[], datasets: ChartDataset[]): ChartConfig {
    const lineConfig = this.createLineChartConfig(labels, datasets);

    return {
      ...lineConfig,
      data: {
        ...lineConfig.data,
        datasets: lineConfig.data.datasets.map(dataset => ({
          ...dataset,
          fill: true,
          backgroundColor: typeof dataset.backgroundColor === 'string'
            ? dataset.backgroundColor
            : this.getColorPalette('primary')[0] + '30'
        }))
      }
    };
  }

  formatNumber(value: number, locale: string = 'fr-FR'): string {
    if (typeof value !== 'number') return '';

    if (value >= 1000000) {
      return new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay: 'short'
      }).format(value);
    }

    return new Intl.NumberFormat(locale).format(value);
  }

  formatCurrency(value: number, currency: string = 'XOF', locale: string = 'fr-FR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatPercentage(value: number, locale: string = 'fr-FR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  exportChart(chartElement: HTMLCanvasElement, options: ChartExportOptions): void {
    const { format, filename = 'chart', width, height, backgroundColor = '#ffffff' } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = width || chartElement.width;
    canvas.height = height || chartElement.height;

    // Fond blanc par défaut
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner le graphique
    ctx.drawImage(chartElement, 0, 0);

    // Télécharger
    const link = document.createElement('a');
    link.download = `${filename}.${format}`;

    if (format === 'png' || format === 'jpg') {
      link.href = canvas.toDataURL(`image/${format}`, 0.9);
    } else if (format === 'svg') {
      // Pour SVG, on devrait utiliser une librairie spécialisée
      console.warn('SVG export not implemented yet');
      return;
    }

    link.click();
  }

  generateSampleData(type: 'monthly' | 'quarterly' | 'yearly', count: number = 12): { labels: string[], data: number[] } {
    const labels: string[] = [];
    const data: number[] = [];

    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
      let date: Date;
      let label: string;

      switch (type) {
        case 'monthly':
          date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          label = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
          break;
        case 'quarterly':
          date = new Date(now.getFullYear(), now.getMonth() - (i * 3), 1);
          label = `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`;
          break;
        case 'yearly':
          date = new Date(now.getFullYear() - i, 0, 1);
          label = date.getFullYear().toString();
          break;
      }

      labels.push(label);
      data.push(Math.floor(Math.random() * 100) + 20);
    }

    return { labels, data };
  }
}