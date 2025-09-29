import { Injectable, signal, computed } from '@angular/core';
import {
  Declaration,
  DeclarationMetrics,
  DeclarationCalendarEvent,
  DeclarationType,
  DeclarationStatus,
  DeclarationPriority,
  DeclarationTypeMetrics,
  DeclarationStatusMetrics,
  MonthlyDeclarationTrend,
  UpcomingDeadline,
  DeclarationFilter,
  DeclarationExportConfig
} from '../interfaces/declarations.interface';

@Injectable({
  providedIn: 'root'
})
export class DeclarationsDataService {
  private readonly declarations = signal<Declaration[]>([
    {
      id: '1',
      declarationNumber: 'TVA-2024-01',
      type: 'tva',
      title: 'Déclaration TVA Janvier 2024',
      description: 'Déclaration mensuelle de la Taxe sur la Valeur Ajoutée',
      period: 'Janvier 2024',
      year: 2024,
      month: 1,
      dueDate: '2024-02-20',
      submissionDate: '2024-02-18',
      status: 'submitted',
      priority: 'medium',
      amount: 2450000,
      taxAmount: 441000,
      penalties: 0,
      totalAmount: 2891000,
      attachments: [
        {
          id: 'att-1',
          fileName: 'factures_janvier_2024.pdf',
          fileSize: 2456789,
          fileType: 'application/pdf',
          filePath: '/uploads/declarations/tvá/2024/01/',
          uploadedBy: 'Fatou Seck',
          uploadedAt: '2024-02-15',
          isRequired: true,
          status: 'validated'
        }
      ],
      assignedTo: 'Comptable Principal',
      reviewer: 'Expert-Comptable',
      comments: [
        {
          id: 'comm-1',
          declarationId: '1',
          userId: 'user-1',
          userName: 'Fatou Seck',
          comment: 'Vérification des factures terminée, tout est conforme',
          createdAt: '2024-02-16',
          isInternal: true
        }
      ],
      reminders: [],
      isRecurring: true,
      recurringPattern: {
        frequency: 'monthly',
        interval: 1,
        monthlyPattern: {
          dayOfMonth: 20,
          isLastDayOfMonth: false
        }
      },
      organization: 'Direction Générale des Impôts et Domaines',
      recipient: 'DGID Sénégal',
      submissionMethod: 'online',
      confirmationNumber: 'TVA240118789',
      createdAt: '2024-01-15',
      updatedAt: '2024-02-18',
      submittedAt: '2024-02-18',
      validatedAt: '2024-02-19'
    },
    {
      id: '2',
      declarationNumber: 'DSN-2024-01',
      type: 'dsn',
      title: 'Déclaration Sociale Nominative Janvier 2024',
      description: 'Déclaration mensuelle des cotisations sociales',
      period: 'Janvier 2024',
      year: 2024,
      month: 1,
      dueDate: '2024-02-15',
      status: 'overdue',
      priority: 'urgent',
      amount: 1850000,
      taxAmount: 333000,
      penalties: 92500,
      totalAmount: 2275500,
      attachments: [
        {
          id: 'att-2',
          fileName: 'dsn_janvier_2024.xml',
          fileSize: 156789,
          fileType: 'application/xml',
          filePath: '/uploads/declarations/dsn/2024/01/',
          uploadedBy: 'Moussa Ba',
          uploadedAt: '2024-02-10',
          isRequired: true,
          status: 'pending'
        }
      ],
      assignedTo: 'Responsable RH',
      comments: [
        {
          id: 'comm-2',
          declarationId: '2',
          userId: 'user-2',
          userName: 'Moussa Ba',
          comment: 'Retard dû à la vérification des données salariales',
          createdAt: '2024-02-16',
          isInternal: true
        }
      ],
      reminders: [
        {
          id: 'rem-1',
          declarationId: '2',
          title: 'Déclaration DSN en retard',
          message: 'La déclaration DSN de janvier est en retard. Veuillez la soumettre rapidement.',
          reminderDate: '2024-02-16',
          reminderType: 'email',
          status: 'sent',
          createdAt: '2024-02-15',
          sentAt: '2024-02-16'
        }
      ],
      isRecurring: true,
      recurringPattern: {
        frequency: 'monthly',
        interval: 1,
        monthlyPattern: {
          dayOfMonth: 15,
          isLastDayOfMonth: false
        }
      },
      organization: 'Caisse Nationale de Sécurité Sociale',
      recipient: 'CNSS Sénégal',
      submissionMethod: 'online',
      createdAt: '2024-01-20',
      updatedAt: '2024-02-16'
    },
    {
      id: '3',
      declarationNumber: 'TVA-2024-02',
      type: 'tva',
      title: 'Déclaration TVA Février 2024',
      description: 'Déclaration mensuelle de la Taxe sur la Valeur Ajoutée',
      period: 'Février 2024',
      year: 2024,
      month: 2,
      dueDate: '2024-03-20',
      status: 'in_preparation',
      priority: 'medium',
      amount: 2850000,
      taxAmount: 513000,
      totalAmount: 3363000,
      attachments: [],
      assignedTo: 'Comptable Principal',
      comments: [],
      reminders: [
        {
          id: 'rem-2',
          declarationId: '3',
          title: 'Préparation TVA Février',
          message: 'N\'oubliez pas de préparer la déclaration TVA pour février',
          reminderDate: '2024-03-15',
          reminderType: 'notification',
          status: 'pending',
          createdAt: '2024-03-01'
        }
      ],
      isRecurring: true,
      parentDeclarationId: '1',
      organization: 'Direction Générale des Impôts et Domaines',
      recipient: 'DGID Sénégal',
      submissionMethod: 'online',
      createdAt: '2024-02-20',
      updatedAt: '2024-03-01'
    },
    {
      id: '4',
      declarationNumber: 'DAS2-2023',
      type: 'das2',
      title: 'Déclaration Annuelle des Salaires 2023',
      description: 'Déclaration annuelle obligatoire des salaires versés',
      period: 'Année 2023',
      year: 2023,
      dueDate: '2024-03-31',
      status: 'ready_to_submit',
      priority: 'high',
      amount: 28500000,
      taxAmount: 5130000,
      totalAmount: 33630000,
      attachments: [
        {
          id: 'att-3',
          fileName: 'das2_2023_final.pdf',
          fileSize: 1256789,
          fileType: 'application/pdf',
          filePath: '/uploads/declarations/das2/2023/',
          uploadedBy: 'Expert Comptable',
          uploadedAt: '2024-03-10',
          isRequired: true,
          status: 'validated'
        },
        {
          id: 'att-4',
          fileName: 'bulletins_salaires_2023.zip',
          fileSize: 15678900,
          fileType: 'application/zip',
          filePath: '/uploads/declarations/das2/2023/',
          uploadedBy: 'Responsable RH',
          uploadedAt: '2024-03-08',
          isRequired: true,
          status: 'validated'
        }
      ],
      assignedTo: 'Expert Comptable',
      reviewer: 'Directeur Financier',
      comments: [
        {
          id: 'comm-3',
          declarationId: '4',
          userId: 'user-3',
          userName: 'Expert Comptable',
          comment: 'Tous les documents sont prêts, validation finale en cours',
          createdAt: '2024-03-10',
          isInternal: true
        }
      ],
      reminders: [],
      isRecurring: true,
      recurringPattern: {
        frequency: 'yearly',
        interval: 1,
        yearlyPattern: {
          month: 3,
          dayOfMonth: 31
        }
      },
      organization: 'Direction Générale des Impôts et Domaines',
      recipient: 'DGID Sénégal',
      submissionMethod: 'online',
      createdAt: '2024-01-15',
      updatedAt: '2024-03-10'
    },
    {
      id: '5',
      declarationNumber: 'LIASSE-2023',
      type: 'liasse_fiscale',
      title: 'Liasse Fiscale 2023',
      description: 'Déclaration annuelle des résultats comptables et fiscaux',
      period: 'Exercice 2023',
      year: 2023,
      dueDate: '2024-04-30',
      status: 'draft',
      priority: 'high',
      amount: 125000000,
      taxAmount: 22500000,
      totalAmount: 147500000,
      attachments: [
        {
          id: 'att-5',
          fileName: 'bilan_2023_provisoire.pdf',
          fileSize: 856789,
          fileType: 'application/pdf',
          filePath: '/uploads/declarations/liasse/2023/',
          uploadedBy: 'Expert Comptable',
          uploadedAt: '2024-03-05',
          isRequired: true,
          status: 'pending'
        }
      ],
      assignedTo: 'Expert Comptable',
      comments: [
        {
          id: 'comm-4',
          declarationId: '5',
          userId: 'user-3',
          userName: 'Expert Comptable',
          comment: 'En attente de la clôture définitive des comptes',
          createdAt: '2024-03-05',
          isInternal: true
        }
      ],
      reminders: [
        {
          id: 'rem-3',
          declarationId: '5',
          title: 'Liasse fiscale à finaliser',
          message: 'La liasse fiscale 2023 doit être finalisée avant le 30 avril',
          reminderDate: '2024-04-15',
          reminderType: 'email',
          status: 'pending',
          createdAt: '2024-03-01'
        }
      ],
      isRecurring: true,
      recurringPattern: {
        frequency: 'yearly',
        interval: 1,
        yearlyPattern: {
          month: 4,
          dayOfMonth: 30
        }
      },
      organization: 'Direction Générale des Impôts et Domaines',
      recipient: 'DGID Sénégal',
      submissionMethod: 'online',
      createdAt: '2024-02-01',
      updatedAt: '2024-03-05'
    },
    {
      id: '6',
      declarationNumber: 'CNSS-2024-02',
      type: 'cnss',
      title: 'Déclaration CNSS Février 2024',
      description: 'Déclaration mensuelle des cotisations CNSS',
      period: 'Février 2024',
      year: 2024,
      month: 2,
      dueDate: '2024-03-25',
      status: 'under_review',
      priority: 'medium',
      amount: 1650000,
      taxAmount: 297000,
      totalAmount: 1947000,
      attachments: [
        {
          id: 'att-6',
          fileName: 'cnss_fevrier_2024.pdf',
          fileSize: 456789,
          fileType: 'application/pdf',
          filePath: '/uploads/declarations/cnss/2024/02/',
          uploadedBy: 'Responsable RH',
          uploadedAt: '2024-03-20',
          isRequired: true,
          status: 'validated'
        }
      ],
      assignedTo: 'Responsable RH',
      reviewer: 'Expert Comptable',
      comments: [],
      reminders: [],
      isRecurring: true,
      recurringPattern: {
        frequency: 'monthly',
        interval: 1,
        monthlyPattern: {
          dayOfMonth: 25,
          isLastDayOfMonth: false
        }
      },
      organization: 'Caisse Nationale de Sécurité Sociale',
      recipient: 'CNSS Sénégal',
      submissionMethod: 'online',
      confirmationNumber: 'CNSS240220456',
      createdAt: '2024-02-25',
      updatedAt: '2024-03-20',
      submittedAt: '2024-03-20'
    }
  ]);

  readonly declarationsReadonly = this.declarations.asReadonly();

  readonly metrics = computed((): DeclarationMetrics => {
    const declarations = this.declarations();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const totalDeclarations = declarations.length;
    const pendingDeclarations = declarations.filter(d =>
      ['draft', 'in_preparation', 'ready_to_submit'].includes(d.status)
    ).length;
    const submittedDeclarations = declarations.filter(d =>
      ['submitted', 'under_review', 'accepted'].includes(d.status)
    ).length;
    const overdueDeclarations = declarations.filter(d => {
      const dueDate = new Date(d.dueDate);
      return dueDate < currentDate && !['submitted', 'under_review', 'accepted'].includes(d.status);
    }).length;
    const upcomingDeclarations = declarations.filter(d => {
      const dueDate = new Date(d.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 30 && daysUntilDue > 0 && !['submitted', 'accepted'].includes(d.status);
    }).length;

    const totalTaxAmount = declarations.reduce((sum, d) => sum + (d.taxAmount || 0), 0);
    const totalPenalties = declarations.reduce((sum, d) => sum + (d.penalties || 0), 0);

    const submittedOnTime = declarations.filter(d => {
      if (!d.submittedAt) return false;
      const submitted = new Date(d.submittedAt);
      const due = new Date(d.dueDate);
      return submitted <= due;
    }).length;

    const totalSubmissions = declarations.filter(d => d.submittedAt).length;
    const complianceRate = totalSubmissions > 0 ? (submittedOnTime / totalSubmissions) * 100 : 0;

    const avgSubmissionTime = this.calculateAverageSubmissionTime(declarations);

    return {
      overview: {
        totalDeclarations,
        pendingDeclarations,
        submittedDeclarations,
        overdueDeclarations,
        upcomingDeclarations,
        totalTaxAmount,
        totalPenalties,
        avgSubmissionTime,
        complianceRate
      },
      byType: this.getDeclarationsByType(declarations),
      byStatus: this.getDeclarationsByStatus(declarations),
      monthlyTrend: this.generateMonthlyTrend(declarations),
      upcomingDeadlines: this.getUpcomingDeadlines(declarations),
      performance: {
        onTimeSubmissions: submittedOnTime,
        lateSubmissions: totalSubmissions - submittedOnTime,
        totalSubmissions,
        onTimeRate: complianceRate,
        avgDaysToSubmit: avgSubmissionTime,
        mostProblematicType: this.getMostProblematicType(declarations)
      }
    };
  });

  readonly calendarEvents = computed((): DeclarationCalendarEvent[] => {
    const declarations = this.declarations();
    const currentDate = new Date();

    return declarations.map(declaration => {
      const dueDate = new Date(declaration.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      const isOverdue = dueDate < currentDate && !['submitted', 'accepted'].includes(declaration.status);

      return {
        id: declaration.id,
        declarationId: declaration.id,
        title: declaration.title,
        type: declaration.type,
        status: declaration.status,
        priority: declaration.priority,
        dueDate: declaration.dueDate,
        amount: declaration.totalAmount,
        isOverdue,
        daysUntilDue
      };
    });
  });

  private calculateAverageSubmissionTime(declarations: Declaration[]): number {
    const submittedDeclarations = declarations.filter(d => d.submittedAt && d.createdAt);
    if (submittedDeclarations.length === 0) return 0;

    const totalDays = submittedDeclarations.reduce((sum, d) => {
      const created = new Date(d.createdAt);
      const submitted = new Date(d.submittedAt!);
      const days = Math.ceil((submitted.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / submittedDeclarations.length);
  }

  private getDeclarationsByType(declarations: Declaration[]): DeclarationTypeMetrics[] {
    const typeMap = new Map<DeclarationType, any>();

    declarations.forEach(declaration => {
      const existing = typeMap.get(declaration.type) || {
        type: declaration.type,
        name: this.getTypeLabel(declaration.type),
        count: 0,
        pendingCount: 0,
        submittedCount: 0,
        overdueCount: 0,
        totalAmount: 0,
        amounts: []
      };

      existing.count++;
      existing.totalAmount += declaration.totalAmount || 0;
      existing.amounts.push(declaration.totalAmount || 0);

      if (['draft', 'in_preparation', 'ready_to_submit'].includes(declaration.status)) {
        existing.pendingCount++;
      } else if (['submitted', 'under_review', 'accepted'].includes(declaration.status)) {
        existing.submittedCount++;
      }

      if (declaration.status === 'overdue') {
        existing.overdueCount++;
      }

      typeMap.set(declaration.type, existing);
    });

    return Array.from(typeMap.values()).map(item => ({
      ...item,
      avgAmount: item.amounts.length > 0 ? item.amounts.reduce((a: number, b: number) => a + b, 0) / item.amounts.length : 0,
      amounts: undefined
    }));
  }

  private getDeclarationsByStatus(declarations: Declaration[]): DeclarationStatusMetrics[] {
    const statusMap = new Map<DeclarationStatus, any>();
    const total = declarations.length;

    declarations.forEach(declaration => {
      const existing = statusMap.get(declaration.status) || {
        status: declaration.status,
        name: this.getStatusLabel(declaration.status),
        count: 0,
        totalAmount: 0
      };

      existing.count++;
      existing.totalAmount += declaration.totalAmount || 0;

      statusMap.set(declaration.status, existing);
    });

    return Array.from(statusMap.values()).map(item => ({
      ...item,
      percentage: total > 0 ? (item.count / total) * 100 : 0
    }));
  }

  private generateMonthlyTrend(declarations: Declaration[]): MonthlyDeclarationTrend[] {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentYear = new Date().getFullYear();

    return months.map((month, index) => {
      const monthDeclarations = declarations.filter(d => {
        const dueDate = new Date(d.dueDate);
        return dueDate.getMonth() === index && dueDate.getFullYear() === currentYear;
      });

      const submitted = monthDeclarations.filter(d => ['submitted', 'accepted'].includes(d.status)).length;
      const overdue = monthDeclarations.filter(d => d.status === 'overdue').length;
      const total = monthDeclarations.length;

      return {
        month,
        year: currentYear,
        totalDeclarations: total,
        submittedDeclarations: submitted,
        overdueDeclarations: overdue,
        totalAmount: monthDeclarations.reduce((sum, d) => sum + (d.totalAmount || 0), 0),
        complianceRate: total > 0 ? (submitted / total) * 100 : 0
      };
    });
  }

  private getUpcomingDeadlines(declarations: Declaration[]): UpcomingDeadline[] {
    const currentDate = new Date();
    const thirtyDaysFromNow = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    return declarations
      .filter(d => {
        const dueDate = new Date(d.dueDate);
        return dueDate >= currentDate && dueDate <= thirtyDaysFromNow &&
               !['submitted', 'accepted'].includes(d.status);
      })
      .map(d => {
        const dueDate = new Date(d.dueDate);
        const daysRemaining = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          declarationId: d.id,
          title: d.title,
          type: d.type,
          dueDate: d.dueDate,
          daysRemaining,
          priority: d.priority,
          status: d.status,
          amount: d.totalAmount
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  private getMostProblematicType(declarations: Declaration[]): DeclarationType {
    const typeProblems = new Map<DeclarationType, number>();

    declarations.forEach(d => {
      if (d.status === 'overdue' || d.penalties && d.penalties > 0) {
        const current = typeProblems.get(d.type) || 0;
        typeProblems.set(d.type, current + 1);
      }
    });

    let mostProblematic: DeclarationType = 'tva';
    let maxProblems = 0;

    typeProblems.forEach((problems, type) => {
      if (problems > maxProblems) {
        maxProblems = problems;
        mostProblematic = type;
      }
    });

    return mostProblematic;
  }

  async getDeclarations(filter?: DeclarationFilter): Promise<Declaration[]> {
    await this.simulateDelay();
    let filtered = this.declarations();

    if (filter) {
      if (filter.types && filter.types.length > 0) {
        filtered = filtered.filter(d => filter.types!.includes(d.type));
      }
      if (filter.statuses && filter.statuses.length > 0) {
        filtered = filtered.filter(d => filter.statuses!.includes(d.status));
      }
      if (filter.priorities && filter.priorities.length > 0) {
        filtered = filtered.filter(d => filter.priorities!.includes(d.priority));
      }
      if (filter.dateRange) {
        const start = new Date(filter.dateRange.start);
        const end = new Date(filter.dateRange.end);
        filtered = filtered.filter(d => {
          const dueDate = new Date(d.dueDate);
          return dueDate >= start && dueDate <= end;
        });
      }
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        filtered = filtered.filter(d =>
          d.title.toLowerCase().includes(term) ||
          d.description?.toLowerCase().includes(term) ||
          d.declarationNumber.toLowerCase().includes(term)
        );
      }
      if (filter.isOverdue !== undefined) {
        const currentDate = new Date();
        filtered = filtered.filter(d => {
          const isOverdue = new Date(d.dueDate) < currentDate && !['submitted', 'accepted'].includes(d.status);
          return filter.isOverdue ? isOverdue : !isOverdue;
        });
      }
    }

    return filtered;
  }

  async getDeclarationById(id: string): Promise<Declaration | undefined> {
    await this.simulateDelay();
    return this.declarations().find(d => d.id === id);
  }

  async createDeclaration(declaration: Omit<Declaration, 'id' | 'declarationNumber' | 'createdAt' | 'updatedAt'>): Promise<Declaration> {
    await this.simulateDelay();
    const year = declaration.year;
    const nextNumber = this.declarations().filter(d => d.year === year).length + 1;
    const declarationNumber = `${declaration.type.toUpperCase()}-${year}-${nextNumber.toString().padStart(2, '0')}`;

    const newDeclaration: Declaration = {
      ...declaration,
      id: this.generateId(),
      declarationNumber,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    this.declarations.update(declarations => [...declarations, newDeclaration]);
    return newDeclaration;
  }

  async updateDeclaration(id: string, updates: Partial<Declaration>): Promise<Declaration | undefined> {
    await this.simulateDelay();
    const declaration = this.declarations().find(d => d.id === id);
    if (!declaration) return undefined;

    const updatedDeclaration = {
      ...declaration,
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    this.declarations.update(declarations =>
      declarations.map(d => d.id === id ? updatedDeclaration : d)
    );
    return updatedDeclaration;
  }

  async deleteDeclaration(id: string): Promise<boolean> {
    await this.simulateDelay();
    const initialLength = this.declarations().length;
    this.declarations.update(declarations => declarations.filter(d => d.id !== id));
    return this.declarations().length < initialLength;
  }

  async exportDeclarations(config: DeclarationExportConfig): Promise<Blob> {
    await this.simulateDelay(1000);

    // Simulation d'export - dans la vraie implementation, ceci générerait un fichier réel
    const declarations = await this.getDeclarations(config.filters);
    const data = JSON.stringify(declarations, null, 2);

    return new Blob([data], {
      type: config.format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
           config.format === 'pdf' ? 'application/pdf' :
           config.format === 'csv' ? 'text/csv' : 'application/json'
    });
  }

  private simulateDelay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getStatusLabel(status: DeclarationStatus): string {
    const labels: Record<DeclarationStatus, string> = {
      draft: 'Brouillon',
      in_preparation: 'En préparation',
      ready_to_submit: 'Prête à soumettre',
      submitted: 'Soumise',
      under_review: 'En cours de révision',
      accepted: 'Acceptée',
      rejected: 'Rejetée',
      overdue: 'En retard',
      archived: 'Archivée'
    };
    return labels[status] || status;
  }

  getTypeLabel(type: DeclarationType): string {
    const labels: Record<DeclarationType, string> = {
      tva: 'TVA',
      dsn: 'DSN',
      das2: 'DAS2',
      liasse_fiscale: 'Liasse fiscale',
      cvae: 'CVAE',
      cfe: 'CFE',
      taxe_apprentissage: 'Taxe d\'apprentissage',
      formation_professionnelle: 'Formation professionnelle',
      participation_construction: 'Participation construction',
      taxe_fonciere: 'Taxe foncière',
      is: 'Impôt sur les sociétés',
      ir: 'Impôt sur le revenu',
      douanes: 'Douanes',
      urssaf: 'URSSAF',
      cnss: 'CNSS',
      ipres: 'IPRES',
      other: 'Autre'
    };
    return labels[type] || type;
  }

  getPriorityLabel(priority: DeclarationPriority): string {
    const labels: Record<DeclarationPriority, string> = {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Élevée',
      urgent: 'Urgente'
    };
    return labels[priority] || priority;
  }

  getStatusColor(status: DeclarationStatus): string {
    const colors: Record<DeclarationStatus, string> = {
      draft: 'text-gray-600',
      in_preparation: 'text-blue-600',
      ready_to_submit: 'text-orange-600',
      submitted: 'text-green-600',
      under_review: 'text-purple-600',
      accepted: 'text-green-700',
      rejected: 'text-red-600',
      overdue: 'text-red-700',
      archived: 'text-gray-500'
    };
    return colors[status] || 'text-gray-600';
  }

  getPriorityColor(priority: DeclarationPriority): string {
    const colors: Record<DeclarationPriority, string> = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  }
}