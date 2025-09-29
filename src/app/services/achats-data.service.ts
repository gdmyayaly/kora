import { Injectable, signal, computed } from '@angular/core';
import {
  Supplier,
  PurchaseInvoice,
  ExpenseNote,
  AchatsMetrics,
  ChartData as AchatsChartData
} from '../interfaces/achats.interface';

@Injectable({
  providedIn: 'root'
})
export class AchatsDataService {

  // Signals pour les données
  private readonly suppliersSignal = signal<Supplier[]>(this.generateSuppliers());
  private readonly invoicesSignal = signal<PurchaseInvoice[]>(this.generateInvoices());
  private readonly expenseNotesSignal = signal<ExpenseNote[]>(this.generateExpenseNotes());

  // Getters publiques en lecture seule
  readonly suppliers = this.suppliersSignal.asReadonly();
  readonly invoices = this.invoicesSignal.asReadonly();
  readonly expenseNotes = this.expenseNotesSignal.asReadonly();

  // Métriques calculées
  readonly metrics = computed((): AchatsMetrics => {
    const suppliers = this.suppliers();
    const invoices = this.invoices();
    const expenses = this.expenseNotes();

    return {
      suppliers: this.calculateSupplierMetrics(suppliers),
      invoices: this.calculateInvoiceMetrics(invoices),
      expenses: this.calculateExpenseMetrics(expenses)
    };
  });

  // Données pour les graphiques
  readonly chartData = computed((): AchatsChartData => {
    const suppliers = this.suppliers();
    const invoices = this.invoices();
    const expenses = this.expenseNotes();

    return {
      suppliers: this.generateSupplierChartData(suppliers),
      invoices: this.generateInvoiceChartData(invoices),
      expenses: this.generateExpenseChartData(expenses)
    };
  });

  private generateSuppliers(): Supplier[] {
    return [
      {
        id: '1',
        name: 'SONACOS SA',
        contactPerson: 'Amadou Diallo',
        email: 'amadou.diallo@sonacos.sn',
        phone: '+221 33 824 45 67',
        address: {
          street: 'Avenue Bourguiba, Zone Industrielle',
          city: 'Dakar',
          postalCode: '11000',
          country: 'Sénégal'
        },
        status: 'active',
        registrationNumber: 'SN-DAK-2019-B-1245',
        taxNumber: 'M051920194X',
        totalInvoiced: 15750000,
        lastInvoice: '2024-01-15',
        paymentTerms: 30,
        category: 'materials',
        createdAt: '2023-03-15'
      },
      {
        id: '2',
        name: 'ETS FALL & FRÈRES',
        contactPerson: 'Ousmane Fall',
        email: 'contact@fallfreres.sn',
        phone: '+221 33 822 11 89',
        address: {
          street: 'Marché Central, Allée 12',
          city: 'Thiès',
          postalCode: '21000',
          country: 'Sénégal'
        },
        status: 'active',
        registrationNumber: 'SN-THI-2020-B-0897',
        taxNumber: 'M052020198Y',
        totalInvoiced: 8920000,
        lastInvoice: '2024-01-12',
        paymentTerms: 15,
        category: 'services',
        createdAt: '2023-07-22'
      },
      {
        id: '3',
        name: 'TECHNOLOGIES PLUS SARL',
        contactPerson: 'Fatima Sow',
        email: 'f.sow@techplus.sn',
        phone: '+221 77 456 78 90',
        address: {
          street: 'Sicap Liberté 6, Villa 123',
          city: 'Dakar',
          postalCode: '11000',
          country: 'Sénégal'
        },
        status: 'pending',
        registrationNumber: 'SN-DAK-2023-B-2156',
        taxNumber: 'M052023201Z',
        totalInvoiced: 2340000,
        lastInvoice: '2024-01-08',
        paymentTerms: 30,
        category: 'equipment',
        createdAt: '2023-11-10'
      },
      {
        id: '4',
        name: 'SARL DISTRIBUTION IVOIRE',
        contactPerson: 'Koffi Kouassi',
        email: 'k.kouassi@distrib-ci.com',
        phone: '+225 27 22 44 55 66',
        address: {
          street: 'Zone 4C, Boulevard Lagunaire',
          city: 'Abidjan',
          postalCode: '01',
          country: 'Côte d\'Ivoire'
        },
        status: 'active',
        registrationNumber: 'CI-ABJ-2022-B-1789',
        taxNumber: 'CI2022B1789X',
        totalInvoiced: 12450000,
        lastInvoice: '2024-01-10',
        paymentTerms: 45,
        category: 'materials',
        createdAt: '2022-09-18'
      },
      {
        id: '5',
        name: 'BAMAKO SERVICES GÉNÉRAUX',
        contactPerson: 'Ibrahim Traoré',
        email: 'i.traore@bsg-mali.ml',
        phone: '+223 20 22 33 44',
        address: {
          street: 'Quartier du Fleuve, Rue 345',
          city: 'Bamako',
          postalCode: '1000',
          country: 'Mali'
        },
        status: 'inactive',
        registrationNumber: 'ML-BKO-2021-B-0456',
        taxNumber: 'ML2021045678',
        totalInvoiced: 5680000,
        lastInvoice: '2023-11-28',
        paymentTerms: 30,
        category: 'services',
        createdAt: '2021-12-03'
      },
      {
        id: '6',
        name: 'GLOBAL ÉQUIPEMENTS FRANCE',
        contactPerson: 'Marie Dubois',
        email: 'm.dubois@global-eq.fr',
        phone: '+33 1 42 89 67 45',
        address: {
          street: '15 Avenue des Champs-Élysées',
          city: 'Paris',
          postalCode: '75008',
          country: 'France'
        },
        status: 'active',
        registrationNumber: 'FR-PAR-2020-B-9876',
        taxNumber: 'FR20209876543',
        totalInvoiced: 28750000,
        lastInvoice: '2024-01-14',
        paymentTerms: 60,
        category: 'equipment',
        createdAt: '2020-05-15'
      },
      {
        id: '7',
        name: 'AFRICAN MINING CORP',
        contactPerson: 'Adama Koné',
        email: 'a.kone@amc-mining.ci',
        phone: '+225 27 21 55 66 77',
        address: {
          street: 'Plateau, Immeuble CCIA',
          city: 'Abidjan',
          postalCode: '01',
          country: 'Côte d\'Ivoire'
        },
        status: 'active',
        registrationNumber: 'CI-ABJ-2021-B-3456',
        taxNumber: 'CI2021345678',
        totalInvoiced: 45800000,
        lastInvoice: '2024-01-16',
        paymentTerms: 90,
        category: 'materials',
        createdAt: '2021-08-12'
      },
      {
        id: '8',
        name: 'NIGER LOGISTICS',
        contactPerson: 'Salim Hassan',
        email: 's.hassan@nigerlogistics.ne',
        phone: '+227 20 73 45 67',
        address: {
          street: 'Avenue du Niger, BP 1234',
          city: 'Niamey',
          postalCode: '8000',
          country: 'Niger'
        },
        status: 'pending',
        registrationNumber: 'NE-NIA-2023-B-0789',
        taxNumber: 'NE2023078901',
        totalInvoiced: 3200000,
        lastInvoice: '2024-01-05',
        paymentTerms: 30,
        category: 'services',
        createdAt: '2023-12-01'
      },
      {
        id: '9',
        name: 'BURKINA CONSTRUCTION',
        contactPerson: 'Rasmané Ouédraogo',
        email: 'r.ouedraogo@burkcons.bf',
        phone: '+226 25 30 45 67',
        address: {
          street: 'Zone du Bois, Secteur 15',
          city: 'Ouagadougou',
          postalCode: '01',
          country: 'Burkina Faso'
        },
        status: 'active',
        registrationNumber: 'BF-OUA-2022-B-1234',
        taxNumber: 'BF2022123456',
        totalInvoiced: 18500000,
        lastInvoice: '2024-01-11',
        paymentTerms: 45,
        category: 'materials',
        createdAt: '2022-06-18'
      },
      {
        id: '10',
        name: 'GHANA TECH SOLUTIONS',
        contactPerson: 'Kwame Asante',
        email: 'k.asante@ghanatech.gh',
        phone: '+233 30 276 45 67',
        address: {
          street: 'Accra Mall, East Legon',
          city: 'Accra',
          postalCode: 'GA-123-4567',
          country: 'Ghana'
        },
        status: 'active',
        registrationNumber: 'GH-ACC-2021-B-5678',
        taxNumber: 'GH2021567890',
        totalInvoiced: 22300000,
        lastInvoice: '2024-01-13',
        paymentTerms: 30,
        category: 'equipment',
        createdAt: '2021-11-25'
      },
      {
        id: '11',
        name: 'MAROC IMPORT EXPORT',
        contactPerson: 'Youssef Benali',
        email: 'y.benali@marocimpex.ma',
        phone: '+212 5 22 45 67 89',
        address: {
          street: 'Boulevard Mohammed V',
          city: 'Casablanca',
          postalCode: '20000',
          country: 'Maroc'
        },
        status: 'active',
        registrationNumber: 'MA-CAS-2020-B-9876',
        taxNumber: 'MA2020987654',
        totalInvoiced: 35600000,
        lastInvoice: '2024-01-17',
        paymentTerms: 60,
        category: 'materials',
        createdAt: '2020-03-10'
      },
      {
        id: '12',
        name: 'TUNISIA SERVICES PLUS',
        contactPerson: 'Amina Bennour',
        email: 'a.bennour@tunisiaservices.tn',
        phone: '+216 71 45 67 89',
        address: {
          street: 'Avenue Habib Bourguiba',
          city: 'Tunis',
          postalCode: '1000',
          country: 'Tunisie'
        },
        status: 'pending',
        registrationNumber: 'TN-TUN-2023-B-4567',
        taxNumber: 'TN2023456789',
        totalInvoiced: 7800000,
        lastInvoice: '2024-01-06',
        paymentTerms: 30,
        category: 'services',
        createdAt: '2023-09-14'
      },
      {
        id: '13',
        name: 'CAMEROUN EQUIPEMENTS',
        contactPerson: 'Paul Nkomo',
        email: 'p.nkomo@camequip.cm',
        phone: '+237 222 45 67 89',
        address: {
          street: 'Bonanjo, Rue Joss',
          city: 'Douala',
          postalCode: 'BP 1234',
          country: 'Cameroun'
        },
        status: 'active',
        registrationNumber: 'CM-DLA-2022-B-2345',
        taxNumber: 'CM2022234567',
        totalInvoiced: 14200000,
        lastInvoice: '2024-01-09',
        paymentTerms: 45,
        category: 'equipment',
        createdAt: '2022-04-22'
      },
      {
        id: '14',
        name: 'ALGERIE TRADING CO',
        contactPerson: 'Omar Benaissa',
        email: 'o.benaissa@algerietrading.dz',
        phone: '+213 21 45 67 89',
        address: {
          street: 'Hydra, Villa 45',
          city: 'Alger',
          postalCode: '16000',
          country: 'Algérie'
        },
        status: 'inactive',
        registrationNumber: 'DZ-ALG-2021-B-6789',
        taxNumber: 'DZ2021678901',
        totalInvoiced: 9800000,
        lastInvoice: '2023-12-15',
        paymentTerms: 30,
        category: 'materials',
        createdAt: '2021-07-08'
      },
      {
        id: '15',
        name: 'BENIN AGRO BUSINESS',
        contactPerson: 'Adjoua Kpohinto',
        email: 'a.kpohinto@beninagro.bj',
        phone: '+229 21 45 67 89',
        address: {
          street: 'Ganhi, Rue des Cocotiers',
          city: 'Cotonou',
          postalCode: '01',
          country: 'Bénin'
        },
        status: 'active',
        registrationNumber: 'BJ-COT-2023-B-1111',
        taxNumber: 'BJ2023111122',
        totalInvoiced: 6700000,
        lastInvoice: '2024-01-07',
        paymentTerms: 30,
        category: 'other',
        createdAt: '2023-05-30'
      }
    ];
  }

  private generateInvoices(): PurchaseInvoice[] {
    const baseInvoices = [
      {
        id: '1',
        invoiceNumber: 'FA-2024-001',
        supplierId: '1',
        supplierName: 'SONACOS SA',
        issueDate: '2024-01-15',
        dueDate: '2024-02-14',
        amount: 2500000,
        taxAmount: 450000,
        totalAmount: 2950000,
        status: 'paid' as const,
        currency: 'XOF' as const,
        paymentMethod: 'transfer' as const,
        description: 'Achat de matières premières pour production',
        items: [
          {
            id: '1',
            description: 'Huile de palme brute - 10 tonnes',
            quantity: 10,
            unitPrice: 200000,
            taxRate: 18,
            totalPrice: 2000000
          },
          {
            id: '2',
            description: 'Transport et livraison',
            quantity: 1,
            unitPrice: 500000,
            taxRate: 18,
            totalPrice: 500000
          }
        ],
        attachments: ['facture-sonacos-001.pdf'],
        approvedBy: 'Amadou Diallo',
        paidAt: '2024-01-20',
        createdAt: '2024-01-15'
      }
      // Je vais générer plus d'invoices en utilisant une fonction helper
    ];

    // Générer plus de factures
    const additionalInvoices = this.generateAdditionalInvoices();
    return [...baseInvoices, ...additionalInvoices];
  }

  private generateAdditionalInvoices(): PurchaseInvoice[] {
    // Génération de 24 factures supplémentaires avec des données variées
    const suppliers = this.generateSuppliers();
    const invoices: PurchaseInvoice[] = [];
    const statuses: ('draft' | 'pending' | 'approved' | 'paid' | 'overdue' | 'cancelled')[] =
      ['draft', 'pending', 'approved', 'paid', 'overdue', 'cancelled'];

    for (let i = 2; i <= 25; i++) {
      const supplier = suppliers[(i - 2) % suppliers.length];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const baseAmount = Math.floor(Math.random() * 10000000) + 500000;
      const taxAmount = Math.floor(baseAmount * 0.18);

      invoices.push({
        id: i.toString(),
        invoiceNumber: `FA-2024-${i.toString().padStart(3, '0')}`,
        supplierId: supplier.id,
        supplierName: supplier.name,
        issueDate: this.getRandomDate('2024-01-01', '2024-01-20'),
        dueDate: this.getRandomDate('2024-02-01', '2024-03-15'),
        amount: baseAmount,
        taxAmount: taxAmount,
        totalAmount: baseAmount + taxAmount,
        status: status,
        currency: Math.random() > 0.8 ? 'EUR' : 'XOF',
        paymentMethod: ['transfer', 'check', 'cash'][Math.floor(Math.random() * 3)] as any,
        description: this.getRandomInvoiceDescription(),
        items: this.generateInvoiceItems(),
        attachments: [`facture-${supplier.id}-${i.toString().padStart(3, '0')}.pdf`],
        approvedBy: status === 'approved' || status === 'paid' ? 'Manager' : undefined,
        paidAt: status === 'paid' ? this.getRandomDate('2024-01-15', '2024-01-25') : undefined,
        createdAt: this.getRandomDate('2024-01-01', '2024-01-20')
      });
    }

    return invoices;
  }

  private generateExpenseNotes(): ExpenseNote[] {
    const employees = [
      { id: '1', name: 'Amadou Diallo', email: 'amadou.diallo@company.sn' },
      { id: '2', name: 'Fatou Sow', email: 'fatou.sow@company.sn' },
      { id: '3', name: 'Moussa Ba', email: 'moussa.ba@company.sn' },
      { id: '4', name: 'Awa Diop', email: 'awa.diop@company.sn' },
      { id: '5', name: 'Ousmane Ndiaye', email: 'ousmane.ndiaye@company.sn' },
      { id: '6', name: 'Mariam Thiam', email: 'mariam.thiam@company.sn' },
      { id: '7', name: 'Ibrahima Fall', email: 'ibrahima.fall@company.sn' },
      { id: '8', name: 'Aissatou Kane', email: 'aissatou.kane@company.sn' }
    ];

    const expenseNotes: ExpenseNote[] = [];
    const statuses: ('draft' | 'submitted' | 'approved' | 'rejected' | 'paid')[] =
      ['draft', 'submitted', 'approved', 'rejected', 'paid'];
    const categories: ('transport' | 'accommodation' | 'meals' | 'supplies' | 'travel' | 'other')[] =
      ['transport', 'accommodation', 'meals', 'supplies', 'travel', 'other'];

    for (let i = 1; i <= 20; i++) {
      const employee = employees[Math.floor(Math.random() * employees.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const totalAmount = Math.floor(Math.random() * 500000) + 25000;

      expenseNotes.push({
        id: i.toString(),
        noteNumber: `NF-2024-${i.toString().padStart(3, '0')}`,
        employeeId: employee.id,
        employeeName: employee.name,
        employeeEmail: employee.email,
        title: this.getRandomExpenseTitle(category),
        description: this.getRandomExpenseDescription(category),
        totalAmount: totalAmount,
        status: status,
        category: category,
        submittedAt: this.getRandomDate('2024-01-01', '2024-01-20'),
        approvedAt: status === 'approved' || status === 'paid' ?
          this.getRandomDate('2024-01-02', '2024-01-22') : undefined,
        approvedBy: status === 'approved' || status === 'paid' ? 'Manager' : undefined,
        rejectedAt: status === 'rejected' ?
          this.getRandomDate('2024-01-02', '2024-01-22') : undefined,
        rejectionReason: status === 'rejected' ? 'Justificatifs incomplets' : undefined,
        expenses: this.generateExpenseItems(category, totalAmount),
        attachments: [`note-${i.toString().padStart(3, '0')}.pdf`],
        createdAt: this.getRandomDate('2024-01-01', '2024-01-20')
      });
    }

    return expenseNotes;
  }

  private calculateSupplierMetrics(suppliers: Supplier[]): AchatsMetrics['suppliers'] {
    const total = suppliers.length;
    const active = suppliers.filter(s => s.status === 'active').length;
    const pending = suppliers.filter(s => s.status === 'pending').length;
    const newThisMonth = suppliers.filter(s => {
      const created = new Date(s.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    // Groupement par pays
    const countryGroups = suppliers.reduce((acc, supplier) => {
      const country = supplier.address.country;
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCountry = Object.entries(countryGroups)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    // Groupement par catégorie
    const categoryGroups = suppliers.reduce((acc, supplier) => {
      acc[supplier.category] = (acc[supplier.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = Object.entries(categoryGroups)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Croissance mensuelle simulée
    const monthlyGrowth = [
      { month: 'Oct 2023', count: 8 },
      { month: 'Nov 2023', count: 10 },
      { month: 'Déc 2023', count: 12 },
      { month: 'Jan 2024', count: total }
    ];

    const averagePaymentTerms = Math.round(
      suppliers.reduce((sum, s) => sum + s.paymentTerms, 0) / suppliers.length
    );

    const totalInvoiced = suppliers.reduce((sum, s) => sum + s.totalInvoiced, 0);

    return {
      total,
      active,
      newThisMonth,
      pending,
      byCountry,
      byCategory,
      monthlyGrowth,
      averagePaymentTerms,
      totalInvoiced
    };
  }

  private calculateInvoiceMetrics(invoices: PurchaseInvoice[]): AchatsMetrics['invoices'] {
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const pending = invoices.filter(inv => inv.status === 'pending').length;
    const approved = invoices.filter(inv => inv.status === 'approved').length;
    const paid = invoices.filter(inv => inv.status === 'paid').length;
    const overdue = invoices.filter(inv => inv.status === 'overdue').length;
    const draft = invoices.filter(inv => inv.status === 'draft').length;

    // Groupement par fournisseur (top 10)
    const supplierGroups = invoices.reduce((acc, invoice) => {
      const supplier = invoice.supplierName;
      acc[supplier] = (acc[supplier] || 0) + invoice.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    const bySupplier = Object.entries(supplierGroups)
      .map(([supplier, amount]) => ({ supplier, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // Groupement par statut avec montants
    const statusGroups = invoices.reduce((acc, invoice) => {
      const status = invoice.status;
      if (!acc[status]) {
        acc[status] = { count: 0, amount: 0 };
      }
      acc[status].count += 1;
      acc[status].amount += invoice.totalAmount;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    const byStatus = Object.entries(statusGroups)
      .map(([status, data]) => ({ status, count: data.count, amount: data.amount }));

    // Tendance mensuelle simulée
    const monthlyTrend = [
      { month: 'Oct 2023', amount: totalAmount * 0.7 },
      { month: 'Nov 2023', amount: totalAmount * 0.85 },
      { month: 'Déc 2023', amount: totalAmount * 0.9 },
      { month: 'Jan 2024', amount: totalAmount }
    ];

    const averageAmount = Math.round(totalAmount / invoices.length);

    // Groupement par devise
    const currencyGroups = invoices.reduce((acc, invoice) => {
      acc[invoice.currency] = (acc[invoice.currency] || 0) + invoice.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    const currency = Object.entries(currencyGroups)
      .map(([currency, amount]) => ({ currency, amount }));

    return {
      totalAmount,
      pending,
      approved,
      paid,
      overdue,
      draft,
      monthlyTrend,
      bySupplier,
      byStatus,
      averageAmount,
      currency
    };
  }

  private calculateExpenseMetrics(expenses: ExpenseNote[]): AchatsMetrics['expenses'] {
    const totalPending = expenses
      .filter(exp => exp.status === 'submitted')
      .reduce((sum, exp) => sum + exp.totalAmount, 0);

    const approvedThisMonth = expenses
      .filter(exp => exp.status === 'approved' && exp.approvedAt &&
        new Date(exp.approvedAt).getMonth() === new Date().getMonth())
      .reduce((sum, exp) => sum + exp.totalAmount, 0);

    // Groupement par catégorie
    const categoryGroups = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    const totalByCategory = Object.entries(categoryGroups)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Groupement par employé
    const employeeGroups = expenses.reduce((acc, expense) => {
      acc[expense.employeeName] = (acc[expense.employeeName] || 0) + expense.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    const byEmployee = Object.entries(employeeGroups)
      .map(([employee, amount]) => ({ employee, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Groupement par statut
    const statusGroups = expenses.reduce((acc, expense) => {
      const status = expense.status;
      if (!acc[status]) {
        acc[status] = { count: 0, amount: 0 };
      }
      acc[status].count += 1;
      acc[status].amount += expense.totalAmount;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    const byStatus = Object.entries(statusGroups)
      .map(([status, data]) => ({ status, count: data.count, amount: data.amount }));

    // Tendance mensuelle simulée
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
    const monthlyTrend = [
      { month: 'Oct 2023', amount: totalAmount * 0.6 },
      { month: 'Nov 2023', amount: totalAmount * 0.8 },
      { month: 'Déc 2023', amount: totalAmount * 0.9 },
      { month: 'Jan 2024', amount: totalAmount }
    ];

    const averageProcessingTime = 3; // jours simulés
    const rejectionRate = Math.round((expenses.filter(e => e.status === 'rejected').length / expenses.length) * 100);

    return {
      totalPending,
      approvedThisMonth,
      totalByCategory,
      byEmployee,
      byStatus,
      monthlyTrend,
      averageProcessingTime,
      rejectionRate
    };
  }

  private generateSupplierChartData(suppliers: Supplier[]) {
    const countryDistribution = this.metrics().suppliers.byCountry;
    const categoryDistribution = this.metrics().suppliers.byCategory;
    const monthlyGrowth = this.metrics().suppliers.monthlyGrowth;

    return {
      countryDistribution: {
        labels: countryDistribution.map(item => item.country),
        data: countryDistribution.map(item => item.count)
      },
      categoryDistribution: {
        labels: categoryDistribution.map(item => this.getCategoryLabel(item.category)),
        data: categoryDistribution.map(item => item.count)
      },
      monthlyGrowth: {
        labels: monthlyGrowth.map(item => item.month),
        data: monthlyGrowth.map(item => item.count)
      }
    };
  }

  private generateInvoiceChartData(invoices: PurchaseInvoice[]) {
    const supplierAmounts = this.metrics().invoices.bySupplier.slice(0, 8);
    const monthlyTrend = this.metrics().invoices.monthlyTrend;
    const statusDistribution = this.metrics().invoices.byStatus;

    return {
      supplierAmounts: {
        labels: supplierAmounts.map(item => item.supplier.substring(0, 20) + '...'),
        data: supplierAmounts.map(item => Math.round(item.amount / 1000000))
      },
      monthlyTrend: {
        labels: monthlyTrend.map(item => item.month),
        data: monthlyTrend.map(item => Math.round(item.amount / 1000000))
      },
      statusDistribution: {
        labels: statusDistribution.map(item => this.getStatusLabel(item.status)),
        data: statusDistribution.map(item => item.count)
      }
    };
  }

  private generateExpenseChartData(expenses: ExpenseNote[]) {
    const employeeSpending = this.metrics().expenses.byEmployee.slice(0, 8);
    const categoryDistribution = this.metrics().expenses.totalByCategory;
    const monthlyTrend = this.metrics().expenses.monthlyTrend;

    return {
      employeeSpending: {
        labels: employeeSpending.map(item => item.employee.split(' ').map(n => n[0]).join('.')),
        data: employeeSpending.map(item => Math.round(item.amount / 1000))
      },
      categoryDistribution: {
        labels: categoryDistribution.map(item => this.getExpenseCategoryLabel(item.category)),
        data: categoryDistribution.map(item => Math.round(item.amount / 1000))
      },
      monthlyTrend: {
        labels: monthlyTrend.map(item => item.month),
        data: monthlyTrend.map(item => Math.round(item.amount / 1000))
      }
    };
  }

  // Helper methods
  private getRandomDate(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    return new Date(randomTime).toISOString().split('T')[0];
  }

  private getRandomInvoiceDescription(): string {
    const descriptions = [
      'Fournitures de bureau et matériel informatique',
      'Prestations de maintenance préventive',
      'Achat de matières premières',
      'Services de transport et logistique',
      'Équipements industriels importés',
      'Travaux de construction et rénovation',
      'Licences logiciels et formation',
      'Matériaux de construction divers',
      'Services de conseil et expertise',
      'Équipements de sécurité'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private getRandomExpenseTitle(category: string): string {
    const titles: Record<string, string[]> = {
      transport: ['Déplacement client', 'Mission commerciale', 'Transport urbain', 'Location véhicule'],
      accommodation: ['Hébergement formation', 'Nuitée hôtel', 'Séminaire résidentiel', 'Mission terrain'],
      meals: ['Repas d\'affaires', 'Déjeuner client', 'Petit déjeuner réunion', 'Dîner équipe'],
      supplies: ['Fournitures bureau', 'Matériel informatique', 'Consommables', 'Papeterie'],
      travel: ['Formation externe', 'Conférence internationale', 'Salon professionnel', 'Visite partenaire'],
      other: ['Formation continue', 'Abonnement logiciel', 'Frais bancaires', 'Documentation']
    };
    const categoryTitles = titles[category] || titles['other'];
    return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
  }

  private getRandomExpenseDescription(category: string): string {
    const descriptions: Record<string, string[]> = {
      transport: ['Déplacement pour rencontrer les clients', 'Mission commerciale en région', 'Transport pour réunion'],
      accommodation: ['Hébergement durant formation', 'Nuitée pour mission terrain', 'Séjour professionnel'],
      meals: ['Repas avec prospect important', 'Déjeuner d\'affaires', 'Collation équipe projet'],
      supplies: ['Achat de matériel nécessaire', 'Fournitures pour le service', 'Consommables bureau'],
      travel: ['Participation à formation externe', 'Conférence spécialisée', 'Salon professionnel'],
      other: ['Formation continue obligatoire', 'Licence logiciel métier', 'Frais divers']
    };
    const categoryDescriptions = descriptions[category] || descriptions['other'];
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
  }

  private generateInvoiceItems() {
    const items = [
      { description: 'Article principal', basePrice: 500000 },
      { description: 'Service associé', basePrice: 200000 },
      { description: 'Livraison et installation', basePrice: 100000 }
    ];

    return items.map((item, index) => ({
      id: (index + 1).toString(),
      description: item.description,
      quantity: Math.floor(Math.random() * 5) + 1,
      unitPrice: item.basePrice + Math.floor(Math.random() * 100000),
      taxRate: 18,
      totalPrice: item.basePrice
    }));
  }

  private generateExpenseItems(category: string, totalAmount: number) {
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const baseAmount = Math.floor(totalAmount / itemCount);

    return Array.from({ length: itemCount }, (_, index) => ({
      id: (index + 1).toString(),
      description: `Dépense ${category} ${index + 1}`,
      amount: baseAmount + Math.floor(Math.random() * 10000),
      category: category as any,
      date: this.getRandomDate('2024-01-01', '2024-01-20'),
      receipt: `receipt-${index + 1}.jpg`
    }));
  }

  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      materials: 'Matériaux',
      services: 'Services',
      equipment: 'Équipements',
      other: 'Autre'
    };
    return labels[category] || category;
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      pending: 'En attente',
      approved: 'Approuvée',
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée',
      submitted: 'Soumise',
      rejected: 'Rejetée'
    };
    return labels[status] || status;
  }

  private getExpenseCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      transport: 'Transport',
      accommodation: 'Hébergement',
      meals: 'Repas',
      supplies: 'Fournitures',
      travel: 'Déplacement',
      other: 'Autre'
    };
    return labels[category] || category;
  }

  // Méthodes publiques pour manipuler les données
  updateSupplier(id: string, updates: Partial<Supplier>): void {
    this.suppliersSignal.update(suppliers =>
      suppliers.map(supplier =>
        supplier.id === id ? { ...supplier, ...updates } : supplier
      )
    );
  }

  updateInvoice(id: string, updates: Partial<PurchaseInvoice>): void {
    this.invoicesSignal.update(invoices =>
      invoices.map(invoice =>
        invoice.id === id ? { ...invoice, ...updates } : invoice
      )
    );
  }

  updateExpenseNote(id: string, updates: Partial<ExpenseNote>): void {
    this.expenseNotesSignal.update(notes =>
      notes.map(note =>
        note.id === id ? { ...note, ...updates } : note
      )
    );
  }
}