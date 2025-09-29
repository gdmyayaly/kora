import { ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';

// Use Chart.js types directly to avoid compatibility issues
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  hoverBackgroundColor?: string | string[];
  hoverBorderWidth?: number;
  borderRadius?: number;
}

export interface ChartConfig {
  type: ChartType;
  data: {
    labels: string[];
    datasets: ChartDataset[];
  };
  options?: ChartOptions;
}

export interface BaseChartProps {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  width?: number;
  height?: number;
  isLoading?: boolean;
  error?: string;
  theme?: 'light' | 'dark';
}

export interface ChartTheme {
  backgroundColor: string;
  borderColor: string;
  gridColor: string;
  textColor: string;
  tooltipBackgroundColor: string;
  tooltipTextColor: string;
}

export interface ChartColorPalette {
  primary: string[];
  secondary: string[];
  success: string[];
  warning: string[];
  danger: string[];
  info: string[];
}

export interface DashboardChartData {
  totalCompanies: number;
  companiesByMonth: {
    labels: string[];
    data: number[];
  };
  companiesByLegalForm: {
    labels: string[];
    data: number[];
  };
  companiesByCountry: {
    labels: string[];
    data: number[];
  };
}

export interface FinancialChartData {
  revenue: {
    labels: string[];
    data: number[];
  };
  expenses: {
    labels: string[];
    data: number[];
  };
  profit: {
    labels: string[];
    data: number[];
  };
}

export interface SalaryChartData {
  totalSalaries: number;
  salariesByMonth: {
    labels: string[];
    data: number[];
  };
  salariesByDepartment: {
    labels: string[];
    data: number[];
  };
  averageSalary: number;
}

export interface ChartExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf';
  filename?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export interface ChartTooltipData {
  label: string;
  value: number;
  dataset: string;
  color: string;
  formattedValue?: string;
}

export interface ChartFilterOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface ResponsiveChartOptions {
  maintainAspectRatio: boolean;
  responsive: boolean;
  aspectRatio?: number;
  breakpoints?: {
    mobile: ChartOptions;
    tablet: ChartOptions;
    desktop: ChartOptions;
  };
}

export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic';
  delay?: number;
  loop?: boolean;
}

export interface ChartEventData {
  type: 'click' | 'hover' | 'leave';
  dataIndex: number;
  datasetIndex: number;
  element: any;
  chart: any;
}

export type ChartEventHandler = (event: ChartEventData) => void;