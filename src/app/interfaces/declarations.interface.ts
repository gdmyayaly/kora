export interface Declaration {
  id: string;
  declarationNumber: string;
  type: DeclarationType;
  title: string;
  description?: string;
  period: string;
  year: number;
  month?: number;
  quarter?: number;
  dueDate: string;
  submissionDate?: string;
  status: DeclarationStatus;
  priority: DeclarationPriority;
  amount?: number;
  taxAmount?: number;
  penalties?: number;
  totalAmount?: number;
  attachments: DeclarationAttachment[];
  assignedTo?: string;
  reviewer?: string;
  comments: DeclarationComment[];
  reminders: DeclarationReminder[];
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  parentDeclarationId?: string;
  organization: string;
  recipient: string;
  submissionMethod: SubmissionMethod;
  confirmationNumber?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  validatedAt?: string;
}

export interface DeclarationAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  uploadedBy: string;
  uploadedAt: string;
  isRequired: boolean;
  status: AttachmentStatus;
}

export interface DeclarationComment {
  id: string;
  declarationId: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
  isInternal: boolean;
}

export interface DeclarationReminder {
  id: string;
  declarationId: string;
  title: string;
  message: string;
  reminderDate: string;
  reminderType: ReminderType;
  status: ReminderStatus;
  createdAt: string;
  sentAt?: string;
}

export interface DeclarationCalendarEvent {
  id: string;
  declarationId: string;
  title: string;
  type: DeclarationType;
  status: DeclarationStatus;
  priority: DeclarationPriority;
  dueDate: string;
  amount?: number;
  isOverdue: boolean;
  daysUntilDue: number;
}

export interface DeclarationMetrics {
  overview: {
    totalDeclarations: number;
    pendingDeclarations: number;
    submittedDeclarations: number;
    overdueDeclarations: number;
    upcomingDeclarations: number;
    totalTaxAmount: number;
    totalPenalties: number;
    avgSubmissionTime: number;
    complianceRate: number;
  };
  byType: DeclarationTypeMetrics[];
  byStatus: DeclarationStatusMetrics[];
  monthlyTrend: MonthlyDeclarationTrend[];
  upcomingDeadlines: UpcomingDeadline[];
  performance: {
    onTimeSubmissions: number;
    lateSubmissions: number;
    totalSubmissions: number;
    onTimeRate: number;
    avgDaysToSubmit: number;
    mostProblematicType: DeclarationType;
  };
}

export interface DeclarationTypeMetrics {
  type: DeclarationType;
  name: string;
  count: number;
  pendingCount: number;
  submittedCount: number;
  overdueCount: number;
  totalAmount: number;
  avgAmount: number;
  nextDueDate?: string;
}

export interface DeclarationStatusMetrics {
  status: DeclarationStatus;
  name: string;
  count: number;
  percentage: number;
  totalAmount: number;
}

export interface MonthlyDeclarationTrend {
  month: string;
  year: number;
  totalDeclarations: number;
  submittedDeclarations: number;
  overdueDeclarations: number;
  totalAmount: number;
  complianceRate: number;
}

export interface UpcomingDeadline {
  declarationId: string;
  title: string;
  type: DeclarationType;
  dueDate: string;
  daysRemaining: number;
  priority: DeclarationPriority;
  status: DeclarationStatus;
  amount?: number;
}

export interface RecurringPattern {
  frequency: RecurrenceFrequency;
  interval: number;
  monthlyPattern?: MonthlyPattern;
  quarterlyPattern?: QuarterlyPattern;
  yearlyPattern?: YearlyPattern;
  endDate?: string;
  maxOccurrences?: number;
}

export interface MonthlyPattern {
  dayOfMonth: number;
  isLastDayOfMonth: boolean;
}

export interface QuarterlyPattern {
  monthOfQuarter: number;
  dayOfMonth: number;
}

export interface YearlyPattern {
  month: number;
  dayOfMonth: number;
}

export interface DeclarationTemplate {
  id: string;
  type: DeclarationType;
  title: string;
  description: string;
  frequency: RecurrenceFrequency;
  daysBeforeDue: number;
  requiredAttachments: string[];
  defaultReminders: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeclarationFilter {
  types?: DeclarationType[];
  statuses?: DeclarationStatus[];
  priorities?: DeclarationPriority[];
  dateRange?: {
    start: string;
    end: string;
  };
  assignedTo?: string[];
  searchTerm?: string;
  organization?: string;
  isOverdue?: boolean;
}

export interface DeclarationExportConfig {
  format: ExportFormat;
  dateRange: {
    start: string;
    end: string;
  };
  includeAttachments: boolean;
  includeComments: boolean;
  groupBy: 'type' | 'status' | 'month' | 'none';
  filters?: DeclarationFilter;
}

export type DeclarationType =
  | 'tva'
  | 'dsn'
  | 'das2'
  | 'liasse_fiscale'
  | 'cvae'
  | 'cfe'
  | 'taxe_apprentissage'
  | 'formation_professionnelle'
  | 'participation_construction'
  | 'taxe_fonciere'
  | 'is'
  | 'ir'
  | 'douanes'
  | 'urssaf'
  | 'cnss'
  | 'ipres'
  | 'other';

export type DeclarationStatus =
  | 'draft'
  | 'in_preparation'
  | 'ready_to_submit'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'overdue'
  | 'archived';

export type DeclarationPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type AttachmentStatus =
  | 'pending'
  | 'uploaded'
  | 'validated'
  | 'rejected';

export type ReminderType =
  | 'email'
  | 'notification'
  | 'sms'
  | 'calendar';

export type ReminderStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'acknowledged';

export type SubmissionMethod =
  | 'online'
  | 'paper'
  | 'email'
  | 'edi'
  | 'api';

export type RecurrenceFrequency =
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom';

export type ExportFormat =
  | 'excel'
  | 'pdf'
  | 'csv'
  | 'json';