import { Injectable, signal, computed } from '@angular/core';
import {
  JournalEntry,
  AccountingMetrics,
  JournalType,
  JournalEntryStatus,
  PurchaseCategory,
  SalesCategory,
  PayrollCategory,
  JournalFilter,
  ExportOptions,
  ExportFormat,
  JournalSortField,
  SortDirection,
  ChartOfAccounts,
  AccountType,
  PurchaseJournalEntry,
  SalesJournalEntry,
  PayrollJournalEntry
} from '../interfaces/comptabilite.interface';

@Injectable({
  providedIn: 'root'
})
export class ComptabiliteDataService {
  private readonly entriesSignal = signal<JournalEntry[]>([]);

  readonly entries = this.entriesSignal.asReadonly();

  readonly chartOfAccounts = signal<ChartOfAccounts[]>([
    // Comptes d'achats
    { account: '601', name: 'Achats stockés - Matières premières', type: AccountType.EXPENSE, level: 1, isActive: true },
    { account: '602', name: 'Achats stockés - Autres approvisionnements', type: AccountType.EXPENSE, level: 1, isActive: true },
    { account: '606', name: 'Achats non stockés de matières et fournitures', type: AccountType.EXPENSE, level: 1, isActive: true },
    { account: '4401', name: 'Fournisseurs', type: AccountType.LIABILITY, level: 1, isActive: true },
    { account: '44566', name: 'TVA déductible sur ABS', type: AccountType.ASSET, level: 1, isActive: true },

    // Comptes de ventes
    { account: '701', name: 'Ventes de produits finis', type: AccountType.REVENUE, level: 1, isActive: true },
    { account: '706', name: 'Prestations de services', type: AccountType.REVENUE, level: 1, isActive: true },
    { account: '708', name: 'Produits des activités annexes', type: AccountType.REVENUE, level: 1, isActive: true },
    { account: '4111', name: 'Clients', type: AccountType.ASSET, level: 1, isActive: true },
    { account: '44571', name: 'TVA collectée', type: AccountType.LIABILITY, level: 1, isActive: true },

    // Comptes de salaires
    { account: '641', name: 'Rémunérations du personnel', type: AccountType.EXPENSE, level: 1, isActive: true },
    { account: '645', name: 'Charges de sécurité sociale et de prévoyance', type: AccountType.EXPENSE, level: 1, isActive: true },
    { account: '647', name: 'Autres charges sociales', type: AccountType.EXPENSE, level: 1, isActive: true },
    { account: '421', name: 'Personnel - Rémunérations dues', type: AccountType.LIABILITY, level: 1, isActive: true },
    { account: '431', name: 'Sécurité sociale', type: AccountType.LIABILITY, level: 1, isActive: true },
  ]);

  readonly metrics = computed((): AccountingMetrics => {
    const entries = this.entries();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculs généraux
    const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);
    const balance = totalDebit - totalCredit;

    // Évolutions mensuelles
    const currentMonthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    const lastMonthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return entryDate.getMonth() === lastMonth && entryDate.getFullYear() === lastMonthYear;
    });

    const currentMonthTotal = currentMonthEntries.reduce((sum, entry) => sum + Math.abs(entry.debit + entry.credit), 0);
    const lastMonthTotal = lastMonthEntries.reduce((sum, entry) => sum + Math.abs(entry.debit + entry.credit), 0);
    const monthlyEvolution = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // Métriques par journal
    const purchaseEntries = entries.filter(e => e.journalType === JournalType.PURCHASE);
    const salesEntries = entries.filter(e => e.journalType === JournalType.SALES);
    const payrollEntries = entries.filter(e => e.journalType === JournalType.PAYROLL);

    const getJournalMetrics = (journalEntries: JournalEntry[]) => ({
      totalEntries: journalEntries.length,
      totalDebit: journalEntries.reduce((sum, entry) => sum + entry.debit, 0),
      totalCredit: journalEntries.reduce((sum, entry) => sum + entry.credit, 0),
      balance: journalEntries.reduce((sum, entry) => sum + (entry.debit - entry.credit), 0),
      evolution: 0, // À calculer selon la période
      averageEntry: journalEntries.length > 0 ?
        journalEntries.reduce((sum, entry) => sum + Math.abs(entry.debit + entry.credit), 0) / journalEntries.length : 0,
      topAccounts: this.getTopAccountsForEntries(journalEntries).slice(0, 5)
    });

    // Top comptes globaux
    const topAccounts = this.getTopAccountsForEntries(entries).slice(0, 10);

    // Entrées récentes
    const recentEntries = [...entries]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Tendances mensuelles
    const monthlyTrends = this.getMonthlyTrends(entries);

    return {
      overview: {
        totalEntries: entries.length,
        totalDebit,
        totalCredit,
        balance,
        monthlyEvolution,
        yearlyEvolution: 0 // À implémenter si nécessaire
      },
      byJournal: {
        purchases: getJournalMetrics(purchaseEntries),
        sales: getJournalMetrics(salesEntries),
        payroll: getJournalMetrics(payrollEntries)
      },
      topAccounts,
      recentEntries,
      monthlyTrends
    };
  });

  constructor() {
    this.loadMockData();
  }

  private getTopAccountsForEntries(entries: JournalEntry[]) {
    const accountTotals = new Map<string, {
      account: string;
      accountName: string;
      totalDebit: number;
      totalCredit: number;
      entriesCount: number;
    }>();

    entries.forEach(entry => {
      const existing = accountTotals.get(entry.account) || {
        account: entry.account,
        accountName: entry.accountName,
        totalDebit: 0,
        totalCredit: 0,
        entriesCount: 0
      };

      existing.totalDebit += entry.debit;
      existing.totalCredit += entry.credit;
      existing.entriesCount++;

      accountTotals.set(entry.account, existing);
    });

    const total = entries.reduce((sum, entry) => sum + Math.abs(entry.debit + entry.credit), 0);

    return Array.from(accountTotals.values())
      .map(account => ({
        ...account,
        balance: account.totalDebit - account.totalCredit,
        percentage: total > 0 ? ((account.totalDebit + account.totalCredit) / total) * 100 : 0
      }))
      .sort((a, b) => (b.totalDebit + b.totalCredit) - (a.totalDebit + a.totalCredit));
  }

  private getMonthlyTrends(entries: JournalEntry[]) {
    const monthlyData = new Map<string, {
      month: string;
      year: number;
      purchases: number;
      sales: number;
      payroll: number;
    }>();

    entries.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('fr-FR', { month: 'long' });

      const existing = monthlyData.get(monthKey) || {
        month: monthName,
        year: date.getFullYear(),
        purchases: 0,
        sales: 0,
        payroll: 0
      };

      const amount = Math.abs(entry.debit + entry.credit);

      switch (entry.journalType) {
        case JournalType.PURCHASE:
          existing.purchases += amount;
          break;
        case JournalType.SALES:
          existing.sales += amount;
          break;
        case JournalType.PAYROLL:
          existing.payroll += amount;
          break;
      }

      monthlyData.set(monthKey, existing);
    });

    return Array.from(monthlyData.values())
      .map(data => ({
        ...data,
        total: data.purchases + data.sales + data.payroll
      }))
      .sort((a, b) => a.year - b.year || a.month.localeCompare(b.month));
  }

  private loadMockData(): void {
    const mockEntries: JournalEntry[] = [
      // Entrées d'achats
      {
        id: '1',
        date: '2024-12-15',
        entryNumber: 'AC001',
        description: 'Achat matières premières - Fournisseur SARL Martin',
        account: '601',
        accountName: 'Achats stockés - Matières premières',
        debit: 15000,
        credit: 0,
        balance: 15000,
        reference: 'FACT-2024-001',
        thirdParty: 'FURN001',
        thirdPartyName: 'SARL Martin',
        journalType: JournalType.PURCHASE,
        status: JournalEntryStatus.POSTED,
        tags: ['matières-premières', 'production'],
        createdAt: '2024-12-15T10:00:00Z',
        updatedAt: '2024-12-15T10:00:00Z',
        createdBy: 'comptable@kora.com'
      },
      {
        id: '2',
        date: '2024-12-15',
        entryNumber: 'AC001',
        description: 'TVA déductible - Achat matières premières',
        account: '44566',
        accountName: 'TVA déductible sur ABS',
        debit: 3000,
        credit: 0,
        balance: 3000,
        reference: 'FACT-2024-001',
        thirdParty: 'FURN001',
        thirdPartyName: 'SARL Martin',
        journalType: JournalType.PURCHASE,
        status: JournalEntryStatus.POSTED,
        tags: ['tva', 'déductible'],
        createdAt: '2024-12-15T10:00:00Z',
        updatedAt: '2024-12-15T10:00:00Z',
        createdBy: 'comptable@kora.com'
      },
      {
        id: '3',
        date: '2024-12-15',
        entryNumber: 'AC001',
        description: 'Dettes fournisseurs - SARL Martin',
        account: '4401',
        accountName: 'Fournisseurs',
        debit: 0,
        credit: 18000,
        balance: -18000,
        reference: 'FACT-2024-001',
        thirdParty: 'FURN001',
        thirdPartyName: 'SARL Martin',
        journalType: JournalType.PURCHASE,
        status: JournalEntryStatus.POSTED,
        tags: ['fournisseur', 'dette'],
        createdAt: '2024-12-15T10:00:00Z',
        updatedAt: '2024-12-15T10:00:00Z',
        createdBy: 'comptable@kora.com'
      },

      // Entrées de ventes
      {
        id: '4',
        date: '2024-12-18',
        entryNumber: 'VT001',
        description: 'Vente produits finis - Client TechCorp',
        account: '4111',
        accountName: 'Clients',
        debit: 24000,
        credit: 0,
        balance: 24000,
        reference: 'FACT-V-2024-001',
        thirdParty: 'CLI001',
        thirdPartyName: 'TechCorp SAS',
        journalType: JournalType.SALES,
        status: JournalEntryStatus.POSTED,
        tags: ['client', 'créance'],
        createdAt: '2024-12-18T14:30:00Z',
        updatedAt: '2024-12-18T14:30:00Z',
        createdBy: 'commercial@kora.com'
      },
      {
        id: '5',
        date: '2024-12-18',
        entryNumber: 'VT001',
        description: 'TVA collectée - Vente produits',
        account: '44571',
        accountName: 'TVA collectée',
        debit: 0,
        credit: 4000,
        balance: -4000,
        reference: 'FACT-V-2024-001',
        thirdParty: 'CLI001',
        thirdPartyName: 'TechCorp SAS',
        journalType: JournalType.SALES,
        status: JournalEntryStatus.POSTED,
        tags: ['tva', 'collectée'],
        createdAt: '2024-12-18T14:30:00Z',
        updatedAt: '2024-12-18T14:30:00Z',
        createdBy: 'commercial@kora.com'
      },
      {
        id: '6',
        date: '2024-12-18',
        entryNumber: 'VT001',
        description: 'Ventes de produits finis',
        account: '701',
        accountName: 'Ventes de produits finis',
        debit: 0,
        credit: 20000,
        balance: -20000,
        reference: 'FACT-V-2024-001',
        thirdParty: 'CLI001',
        thirdPartyName: 'TechCorp SAS',
        journalType: JournalType.SALES,
        status: JournalEntryStatus.POSTED,
        tags: ['vente', 'produits'],
        createdAt: '2024-12-18T14:30:00Z',
        updatedAt: '2024-12-18T14:30:00Z',
        createdBy: 'commercial@kora.com'
      },

      // Entrées de salaires
      {
        id: '7',
        date: '2024-12-31',
        entryNumber: 'PAY001',
        description: 'Salaires décembre 2024',
        account: '641',
        accountName: 'Rémunérations du personnel',
        debit: 45000,
        credit: 0,
        balance: 45000,
        reference: 'PAY-2024-12',
        thirdParty: 'EMP001',
        thirdPartyName: 'Personnel - Salaires',
        journalType: JournalType.PAYROLL,
        status: JournalEntryStatus.POSTED,
        tags: ['salaire', 'personnel'],
        createdAt: '2024-12-31T16:00:00Z',
        updatedAt: '2024-12-31T16:00:00Z',
        createdBy: 'rh@kora.com'
      },
      {
        id: '8',
        date: '2024-12-31',
        entryNumber: 'PAY001',
        description: 'Charges sociales patronales',
        account: '645',
        accountName: 'Charges de sécurité sociale et de prévoyance',
        debit: 18000,
        credit: 0,
        balance: 18000,
        reference: 'PAY-2024-12',
        thirdParty: 'ORG001',
        thirdPartyName: 'Organismes sociaux',
        journalType: JournalType.PAYROLL,
        status: JournalEntryStatus.POSTED,
        tags: ['charges-sociales', 'patronal'],
        createdAt: '2024-12-31T16:00:00Z',
        updatedAt: '2024-12-31T16:00:00Z',
        createdBy: 'rh@kora.com'
      },
      {
        id: '9',
        date: '2024-12-31',
        entryNumber: 'PAY001',
        description: 'Dettes personnel - Salaires nets',
        account: '421',
        accountName: 'Personnel - Rémunérations dues',
        debit: 0,
        credit: 35000,
        balance: -35000,
        reference: 'PAY-2024-12',
        thirdParty: 'EMP001',
        thirdPartyName: 'Personnel - Salaires',
        journalType: JournalType.PAYROLL,
        status: JournalEntryStatus.POSTED,
        tags: ['personnel', 'dette'],
        createdAt: '2024-12-31T16:00:00Z',
        updatedAt: '2024-12-31T16:00:00Z',
        createdBy: 'rh@kora.com'
      },
      {
        id: '10',
        date: '2024-12-31',
        entryNumber: 'PAY001',
        description: 'Dettes organismes sociaux',
        account: '431',
        accountName: 'Sécurité sociale',
        debit: 0,
        credit: 28000,
        balance: -28000,
        reference: 'PAY-2024-12',
        thirdParty: 'ORG001',
        thirdPartyName: 'Organismes sociaux',
        journalType: JournalType.PAYROLL,
        status: JournalEntryStatus.POSTED,
        tags: ['organismes-sociaux', 'dette'],
        createdAt: '2024-12-31T16:00:00Z',
        updatedAt: '2024-12-31T16:00:00Z',
        createdBy: 'rh@kora.com'
      },

      // Entrées supplémentaires pour plus de variété
      {
        id: '11',
        date: '2024-11-20',
        entryNumber: 'AC002',
        description: 'Achat fournitures bureau - Stationery Plus',
        account: '606',
        accountName: 'Achats non stockés de matières et fournitures',
        debit: 850,
        credit: 0,
        balance: 850,
        reference: 'FACT-2024-045',
        thirdParty: 'FURN002',
        thirdPartyName: 'Stationery Plus',
        journalType: JournalType.PURCHASE,
        status: JournalEntryStatus.POSTED,
        tags: ['fournitures', 'bureau'],
        createdAt: '2024-11-20T09:15:00Z',
        updatedAt: '2024-11-20T09:15:00Z',
        createdBy: 'comptable@kora.com'
      },
      {
        id: '12',
        date: '2024-11-25',
        entryNumber: 'VT002',
        description: 'Prestation de service - Conseil IT',
        account: '706',
        accountName: 'Prestations de services',
        debit: 0,
        credit: 5000,
        balance: -5000,
        reference: 'FACT-V-2024-032',
        thirdParty: 'CLI002',
        thirdPartyName: 'StartupTech',
        journalType: JournalType.SALES,
        status: JournalEntryStatus.POSTED,
        tags: ['conseil', 'service'],
        createdAt: '2024-11-25T11:45:00Z',
        updatedAt: '2024-11-25T11:45:00Z',
        createdBy: 'commercial@kora.com'
      }
    ];

    this.entriesSignal.set(mockEntries);
  }

  async getJournalEntries(filter?: JournalFilter): Promise<JournalEntry[]> {
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 100));

    let entries = this.entries();

    if (filter) {
      entries = this.filterEntries(entries, filter);
    }

    return entries;
  }

  async getJournalEntriesByType(journalType: JournalType): Promise<JournalEntry[]> {
    return this.getJournalEntries({ journalType });
  }

  private filterEntries(entries: JournalEntry[], filter: JournalFilter): JournalEntry[] {
    return entries.filter(entry => {
      // Recherche textuelle
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        const matchesSearch =
          entry.description.toLowerCase().includes(searchTerm) ||
          entry.entryNumber.toLowerCase().includes(searchTerm) ||
          entry.accountName.toLowerCase().includes(searchTerm) ||
          entry.thirdPartyName?.toLowerCase().includes(searchTerm) ||
          false;
        if (!matchesSearch) return false;
      }

      // Filtre par type de journal
      if (filter.journalType && entry.journalType !== filter.journalType) {
        return false;
      }

      // Filtre par compte
      if (filter.account && entry.account !== filter.account) {
        return false;
      }

      // Filtre par tiers
      if (filter.thirdParty && entry.thirdParty !== filter.thirdParty) {
        return false;
      }

      // Filtre par statut
      if (filter.status && entry.status !== filter.status) {
        return false;
      }

      // Filtre par dates
      if (filter.dateFrom) {
        if (new Date(entry.date) < new Date(filter.dateFrom)) {
          return false;
        }
      }
      if (filter.dateTo) {
        if (new Date(entry.date) > new Date(filter.dateTo)) {
          return false;
        }
      }

      // Filtre par montants
      const amount = Math.abs(entry.debit + entry.credit);
      if (filter.amountMin !== null && filter.amountMin !== undefined && amount < filter.amountMin) {
        return false;
      }
      if (filter.amountMax !== null && filter.amountMax !== undefined && amount > filter.amountMax) {
        return false;
      }

      return true;
    });
  }

  sortEntries(entries: JournalEntry[], field: JournalSortField, direction: SortDirection): JournalEntry[] {
    return [...entries].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // Gestion spéciale pour les dates
      if (field === 'date' || field === 'createdAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      // Gestion spéciale pour les strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      const result = (aValue || 0) < (bValue || 0) ? -1 : (aValue || 0) > (bValue || 0) ? 1 : 0;
      return direction === 'asc' ? result : -result;
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  getJournalTypeLabel(type: JournalType): string {
    const labels: Record<JournalType, string> = {
      [JournalType.PURCHASE]: 'Achats',
      [JournalType.SALES]: 'Ventes',
      [JournalType.PAYROLL]: 'Salaires',
      [JournalType.GENERAL]: 'Général'
    };
    return labels[type];
  }

  getStatusLabel(status: JournalEntryStatus): string {
    const labels: Record<JournalEntryStatus, string> = {
      [JournalEntryStatus.DRAFT]: 'Brouillon',
      [JournalEntryStatus.POSTED]: 'Comptabilisé',
      [JournalEntryStatus.CANCELLED]: 'Annulé',
      [JournalEntryStatus.PENDING_VALIDATION]: 'En attente de validation'
    };
    return labels[status];
  }

  getStatusColor(status: JournalEntryStatus): string {
    const colors: Record<JournalEntryStatus, string> = {
      [JournalEntryStatus.DRAFT]: 'text-gray-600',
      [JournalEntryStatus.POSTED]: 'text-green-600',
      [JournalEntryStatus.CANCELLED]: 'text-red-600',
      [JournalEntryStatus.PENDING_VALIDATION]: 'text-orange-600'
    };
    return colors[status];
  }

  async exportJournal(options: ExportOptions): Promise<string> {
    // Simulation d'export
    console.log('Export journal avec options:', options);
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'export-journal-' + Date.now() + '.' + options.format;
  }

  async createEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry> {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.entriesSignal.update(entries => [...entries, newEntry]);
    return newEntry;
  }

  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    const entries = this.entries();
    const index = entries.findIndex(e => e.id === id);

    if (index === -1) {
      throw new Error('Écriture non trouvée');
    }

    const updatedEntry = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.entriesSignal.update(entries => {
      const newEntries = [...entries];
      newEntries[index] = updatedEntry;
      return newEntries;
    });

    return updatedEntry;
  }

  async deleteEntry(id: string): Promise<void> {
    this.entriesSignal.update(entries => entries.filter(e => e.id !== id));
  }
}