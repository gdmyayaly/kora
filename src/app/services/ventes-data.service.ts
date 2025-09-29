import { Injectable, signal, computed } from '@angular/core';
import { Customer, Article, SalesInvoice, VentesMetrics, Payment, SalesInvoiceItem } from '../interfaces/ventes.interface';

@Injectable({
  providedIn: 'root'
})
export class VentesDataService {
  private readonly customers = signal<Customer[]>([
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
      customerType: 'company',
      paymentTerms: 30,
      creditLimit: 25000000,
      totalSales: 45750000,
      lastSale: '2024-01-15',
      category: 'enterprise',
      assignedSalesperson: 'Fatou Seck',
      createdAt: '2023-03-15'
    },
    {
      id: '2',
      name: 'Ousmane Fall',
      contactPerson: 'Ousmane Fall',
      email: 'ousmane.fall@gmail.com',
      phone: '+221 77 456 78 90',
      address: {
        street: 'Cité Keur Gorgui, Villa 123',
        city: 'Dakar',
        postalCode: '11000',
        country: 'Sénégal'
      },
      status: 'active',
      customerType: 'individual',
      paymentTerms: 15,
      creditLimit: 2000000,
      totalSales: 3250000,
      lastSale: '2024-01-12',
      category: 'retail',
      assignedSalesperson: 'Moussa Ba',
      createdAt: '2023-07-22'
    },
    {
      id: '3',
      name: 'MAIRIE DE RUFISQUE',
      contactPerson: 'Mariama Ndiaye',
      email: 'procurement@rufisque.gov.sn',
      phone: '+221 33 836 42 15',
      address: {
        street: 'Avenue Général de Gaulle',
        city: 'Rufisque',
        postalCode: '12000',
        country: 'Sénégal'
      },
      status: 'active',
      registrationNumber: 'GOV-RUF-2022',
      customerType: 'government',
      paymentTerms: 60,
      creditLimit: 50000000,
      totalSales: 18960000,
      lastSale: '2024-01-08',
      category: 'government',
      assignedSalesperson: 'Ibrahima Diop',
      createdAt: '2022-11-10'
    },
    {
      id: '4',
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
      status: 'prospect',
      registrationNumber: 'SN-DAK-2023-B-2156',
      taxNumber: 'M052023201Z',
      customerType: 'company',
      paymentTerms: 30,
      creditLimit: 15000000,
      totalSales: 8340000,
      lastSale: '2024-01-05',
      category: 'enterprise',
      assignedSalesperson: 'Awa Dieng',
      createdAt: '2023-11-10'
    },
    {
      id: '5',
      name: 'ENDA TIERS MONDE',
      contactPerson: 'Dr. Cheikh Ba',
      email: 'cheikh.ba@enda.sn',
      phone: '+221 33 889 34 20',
      address: {
        street: 'Sicap Point E, Rue 6',
        city: 'Dakar',
        postalCode: '11000',
        country: 'Sénégal'
      },
      status: 'active',
      registrationNumber: 'NGO-SN-1990-456',
      customerType: 'ngo',
      paymentTerms: 45,
      creditLimit: 12000000,
      totalSales: 6780000,
      lastSale: '2023-12-28',
      category: 'wholesale',
      assignedSalesperson: 'Mame Diarra',
      createdAt: '2021-12-03'
    }
  ]);

  private readonly articles = signal<Article[]>([
    {
      id: '1',
      name: 'Ordinateur Portable Dell Latitude 5420',
      description: 'Ordinateur portable professionnel avec Intel Core i5, 8GB RAM, 256GB SSD',
      sku: 'DELL-LAT-5420',
      barcode: '123456789012',
      category: 'product',
      subcategory: 'Informatique',
      unitPrice: 850000,
      costPrice: 680000,
      taxRate: 18,
      unit: 'piece',
      stock: {
        available: 25,
        reserved: 5,
        minThreshold: 10,
        maxThreshold: 100
      },
      isActive: true,
      supplier: 'Dell Sénégal',
      brand: 'Dell',
      dimensions: {
        length: 35.7,
        width: 23.5,
        height: 1.99,
        weight: 1.4
      },
      images: ['/assets/products/dell-latitude-5420.jpg'],
      totalSold: 148,
      lastSold: '2024-01-15',
      createdAt: '2023-05-10',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Consultation Stratégique IT',
      description: 'Service de consultation pour la transformation digitale et stratégie IT',
      sku: 'SERV-CONSULT-IT',
      category: 'service',
      subcategory: 'Conseil',
      unitPrice: 75000,
      costPrice: 45000,
      taxRate: 18,
      unit: 'hour',
      stock: {
        available: 1000,
        reserved: 0,
        minThreshold: 0,
        maxThreshold: 1000
      },
      isActive: true,
      images: ['/assets/services/consultation-it.jpg'],
      totalSold: 320,
      lastSold: '2024-01-12',
      createdAt: '2023-01-15',
      updatedAt: '2024-01-12'
    },
    {
      id: '3',
      name: 'Imprimante HP LaserJet Pro M404dn',
      description: 'Imprimante laser noir et blanc, recto-verso automatique, réseau',
      sku: 'HP-LJ-M404DN',
      barcode: '123456789013',
      category: 'product',
      subcategory: 'Informatique',
      unitPrice: 145000,
      costPrice: 115000,
      taxRate: 18,
      unit: 'piece',
      stock: {
        available: 8,
        reserved: 2,
        minThreshold: 5,
        maxThreshold: 50
      },
      isActive: true,
      supplier: 'HP Sénégal',
      brand: 'HP',
      dimensions: {
        length: 36.8,
        width: 36.0,
        height: 20.0,
        weight: 11.2
      },
      images: ['/assets/products/hp-laserjet-m404dn.jpg'],
      totalSold: 89,
      lastSold: '2024-01-10',
      createdAt: '2023-06-20',
      updatedAt: '2024-01-10'
    },
    {
      id: '4',
      name: 'Maintenance Système Informatique',
      description: 'Service de maintenance préventive et corrective des systèmes informatiques',
      sku: 'SERV-MAINT-IT',
      category: 'service',
      subcategory: 'Maintenance',
      unitPrice: 45000,
      costPrice: 25000,
      taxRate: 18,
      unit: 'month',
      stock: {
        available: 1000,
        reserved: 0,
        minThreshold: 0,
        maxThreshold: 1000
      },
      isActive: true,
      images: ['/assets/services/maintenance-it.jpg'],
      totalSold: 156,
      lastSold: '2024-01-08',
      createdAt: '2023-02-10',
      updatedAt: '2024-01-08'
    },
    {
      id: '5',
      name: 'Écran Samsung 24" Full HD',
      description: 'Moniteur LED 24 pouces, résolution Full HD 1920x1080, HDMI/VGA',
      sku: 'SAMSUNG-24-FHD',
      barcode: '123456789014',
      category: 'product',
      subcategory: 'Informatique',
      unitPrice: 95000,
      costPrice: 75000,
      taxRate: 18,
      unit: 'piece',
      stock: {
        available: 3,
        reserved: 1,
        minThreshold: 8,
        maxThreshold: 40
      },
      isActive: true,
      supplier: 'Samsung Sénégal',
      brand: 'Samsung',
      dimensions: {
        length: 54.0,
        width: 32.3,
        height: 4.2,
        weight: 3.1
      },
      images: ['/assets/products/samsung-24-monitor.jpg'],
      totalSold: 67,
      lastSold: '2024-01-05',
      createdAt: '2023-08-15',
      updatedAt: '2024-01-05'
    }
  ]);

  private readonly salesInvoices = signal<SalesInvoice[]>([
    {
      id: '1',
      invoiceNumber: 'VTE-2024-001',
      customerId: '1',
      customerName: 'SONACOS SA',
      customerEmail: 'amadou.diallo@sonacos.sn',
      issueDate: '2024-01-15',
      dueDate: '2024-02-14',
      amount: 2550000,
      taxAmount: 459000,
      discountAmount: 0,
      totalAmount: 3009000,
      paidAmount: 3009000,
      remainingAmount: 0,
      status: 'paid',
      currency: 'XOF',
      paymentMethod: 'transfer',
      paymentStatus: 'paid',
      description: 'Fourniture équipements informatiques',
      items: [
        {
          id: '1-1',
          articleId: '1',
          articleName: 'Ordinateur Portable Dell Latitude 5420',
          description: 'Ordinateur portable professionnel',
          quantity: 3,
          unitPrice: 850000,
          discountRate: 0,
          discountAmount: 0,
          taxRate: 18,
          taxAmount: 459000,
          totalPrice: 2550000,
          unit: 'piece'
        }
      ],
      payments: [
        {
          id: 'PAY-001',
          invoiceId: '1',
          amount: 3009000,
          paymentDate: '2024-01-20',
          paymentMethod: 'transfer',
          reference: 'TRF-20240120-001',
          createdAt: '2024-01-20'
        }
      ],
      salesRep: 'Fatou Seck',
      createdAt: '2024-01-15',
      sentAt: '2024-01-15',
      viewedAt: '2024-01-16',
      paidAt: '2024-01-20'
    },
    {
      id: '2',
      invoiceNumber: 'VTE-2024-002',
      customerId: '2',
      customerName: 'Ousmane Fall',
      customerEmail: 'ousmane.fall@gmail.com',
      issueDate: '2024-01-12',
      dueDate: '2024-01-27',
      amount: 225000,
      taxAmount: 40500,
      discountAmount: 25000,
      totalAmount: 240500,
      paidAmount: 240500,
      remainingAmount: 0,
      status: 'paid',
      currency: 'XOF',
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      description: 'Service de consultation IT',
      items: [
        {
          id: '2-1',
          articleId: '2',
          articleName: 'Consultation Stratégique IT',
          description: 'Consultation transformation digitale',
          quantity: 3,
          unitPrice: 75000,
          discountRate: 10,
          discountAmount: 22500,
          taxRate: 18,
          taxAmount: 40500,
          totalPrice: 202500,
          unit: 'hour'
        }
      ],
      payments: [
        {
          id: 'PAY-002',
          invoiceId: '2',
          amount: 240500,
          paymentDate: '2024-01-12',
          paymentMethod: 'cash',
          createdAt: '2024-01-12'
        }
      ],
      salesRep: 'Moussa Ba',
      createdAt: '2024-01-12',
      sentAt: '2024-01-12',
      viewedAt: '2024-01-12',
      paidAt: '2024-01-12'
    },
    {
      id: '3',
      invoiceNumber: 'VTE-2024-003',
      customerId: '3',
      customerName: 'MAIRIE DE RUFISQUE',
      customerEmail: 'procurement@rufisque.gov.sn',
      issueDate: '2024-01-08',
      dueDate: '2024-03-08',
      amount: 580000,
      taxAmount: 104400,
      discountAmount: 0,
      totalAmount: 684400,
      paidAmount: 0,
      remainingAmount: 684400,
      status: 'sent',
      currency: 'XOF',
      paymentStatus: 'pending',
      description: 'Fourniture équipements bureau',
      items: [
        {
          id: '3-1',
          articleId: '3',
          articleName: 'Imprimante HP LaserJet Pro M404dn',
          description: 'Imprimante laser professionnelle',
          quantity: 4,
          unitPrice: 145000,
          discountRate: 0,
          discountAmount: 0,
          taxRate: 18,
          taxAmount: 104400,
          totalPrice: 580000,
          unit: 'piece'
        }
      ],
      payments: [],
      salesRep: 'Ibrahima Diop',
      createdAt: '2024-01-08',
      sentAt: '2024-01-08',
      viewedAt: '2024-01-10'
    },
    {
      id: '4',
      invoiceNumber: 'VTE-2024-004',
      customerId: '4',
      customerName: 'TECHNOLOGIES PLUS SARL',
      customerEmail: 'f.sow@techplus.sn',
      issueDate: '2024-01-05',
      dueDate: '2024-02-04',
      amount: 380000,
      taxAmount: 68400,
      discountAmount: 0,
      totalAmount: 448400,
      paidAmount: 200000,
      remainingAmount: 248400,
      status: 'partial',
      currency: 'XOF',
      paymentMethod: 'transfer',
      paymentStatus: 'partial',
      description: 'Écrans et maintenance',
      items: [
        {
          id: '4-1',
          articleId: '5',
          articleName: 'Écran Samsung 24" Full HD',
          description: 'Moniteur LED 24 pouces',
          quantity: 4,
          unitPrice: 95000,
          discountRate: 0,
          discountAmount: 0,
          taxRate: 18,
          taxAmount: 68400,
          totalPrice: 380000,
          unit: 'piece'
        }
      ],
      payments: [
        {
          id: 'PAY-004',
          invoiceId: '4',
          amount: 200000,
          paymentDate: '2024-01-15',
          paymentMethod: 'transfer',
          reference: 'TRF-20240115-002',
          createdAt: '2024-01-15'
        }
      ],
      salesRep: 'Awa Dieng',
      createdAt: '2024-01-05',
      sentAt: '2024-01-05',
      viewedAt: '2024-01-06'
    }
  ]);

  readonly customersReadonly = this.customers.asReadonly();
  readonly articlesReadonly = this.articles.asReadonly();
  readonly salesInvoicesReadonly = this.salesInvoices.asReadonly();

  readonly metrics = computed((): VentesMetrics => {
    const customers = this.customers();
    const articles = this.articles();
    const invoices = this.salesInvoices();

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const activeCustomers = customers.filter(c => c.status === 'active');
    const prospects = customers.filter(c => c.status === 'prospect');
    const newThisMonth = customers.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const monthlyRevenue = invoices
      .filter(inv => {
        const invDate = new Date(inv.issueDate);
        return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'viewed');
    const overdueInvoices = invoices.filter(inv => {
      const dueDate = new Date(inv.dueDate);
      return dueDate < currentDate && inv.status !== 'paid';
    });

    const lowStockItems = articles.filter(a => a.stock.available <= a.stock.minThreshold);
    const outOfStockItems = articles.filter(a => a.stock.available === 0);
    const activeProducts = articles.filter(a => a.isActive);

    return {
      customers: {
        total: customers.length,
        active: activeCustomers.length,
        prospects: prospects.length,
        newThisMonth: newThisMonth.length,
        topCustomers: customers
          .sort((a, b) => b.totalSales - a.totalSales)
          .slice(0, 5)
          .map(c => ({ customer: c.name, amount: c.totalSales }))
      },
      sales: {
        totalRevenue,
        monthlyRevenue,
        yearlyRevenue: totalRevenue,
        averageOrderValue: totalRevenue / invoices.length || 0,
        totalInvoices: invoices.length,
        paidInvoices: paidInvoices.length,
        pendingInvoices: pendingInvoices.length,
        overdueInvoices: overdueInvoices.length,
        monthlyTrend: this.generateMonthlyTrend(invoices),
        revenueByCategory: this.getRevenueByCategory(invoices, articles),
        topProducts: this.getTopProducts(invoices)
      },
      articles: {
        totalProducts: articles.length,
        activeProducts: activeProducts.length,
        lowStockItems: lowStockItems.length,
        outOfStockItems: outOfStockItems.length,
        totalValue: articles.reduce((sum, a) => sum + (a.unitPrice * a.stock.available), 0),
        topSellingProducts: articles
          .sort((a, b) => b.totalSold - a.totalSold)
          .slice(0, 5)
          .map(a => ({ product: a.name, quantity: a.totalSold })),
        categoryDistribution: this.getCategoryDistribution(articles)
      },
      performance: {
        conversionRate: 75,
        averageDaysToPayment: 25,
        customerRetentionRate: 85,
        salesGrowthRate: 12,
        profitMargin: 25
      }
    };
  });

  private generateMonthlyTrend(invoices: SalesInvoice[]): { month: string; revenue: number; invoices: number }[] {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentYear = new Date().getFullYear();

    return months.map((month, index) => {
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.issueDate);
        return invDate.getMonth() === index && invDate.getFullYear() === currentYear;
      });

      return {
        month,
        revenue: monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        invoices: monthInvoices.length
      };
    });
  }

  private getRevenueByCategory(invoices: SalesInvoice[], articles: Article[]): { category: string; amount: number }[] {
    const categoryRevenue = new Map<string, number>();

    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const article = articles.find(a => a.id === item.articleId);
        if (article) {
          const current = categoryRevenue.get(article.subcategory) || 0;
          categoryRevenue.set(article.subcategory, current + item.totalPrice);
        }
      });
    });

    return Array.from(categoryRevenue.entries()).map(([category, amount]) => ({ category, amount }));
  }

  private getTopProducts(invoices: SalesInvoice[]): { product: string; quantity: number; revenue: number }[] {
    const productStats = new Map<string, { quantity: number; revenue: number }>();

    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const current = productStats.get(item.articleName) || { quantity: 0, revenue: 0 };
        productStats.set(item.articleName, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + item.totalPrice
        });
      });
    });

    return Array.from(productStats.entries())
      .map(([product, stats]) => ({ product, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  private getCategoryDistribution(articles: Article[]): { category: string; count: number }[] {
    const categoryCount = new Map<string, number>();

    articles.forEach(article => {
      const current = categoryCount.get(article.subcategory) || 0;
      categoryCount.set(article.subcategory, current + 1);
    });

    return Array.from(categoryCount.entries()).map(([category, count]) => ({ category, count }));
  }

  async getCustomers(): Promise<Customer[]> {
    await this.simulateDelay();
    return this.customers();
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    await this.simulateDelay();
    return this.customers().find(c => c.id === id);
  }

  async createCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    await this.simulateDelay();
    const newCustomer: Customer = {
      ...customer,
      id: this.generateId(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.customers.update(customers => [...customers, newCustomer]);
    return newCustomer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined> {
    await this.simulateDelay();
    const customer = this.customers().find(c => c.id === id);
    if (!customer) return undefined;

    const updatedCustomer = { ...customer, ...updates };
    this.customers.update(customers =>
      customers.map(c => c.id === id ? updatedCustomer : c)
    );
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    await this.simulateDelay();
    const initialLength = this.customers().length;
    this.customers.update(customers => customers.filter(c => c.id !== id));
    return this.customers().length < initialLength;
  }

  async getArticles(): Promise<Article[]> {
    await this.simulateDelay();
    return this.articles();
  }

  async getArticleById(id: string): Promise<Article | undefined> {
    await this.simulateDelay();
    return this.articles().find(a => a.id === id);
  }

  async createArticle(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
    await this.simulateDelay();
    const now = new Date().toISOString().split('T')[0];
    const newArticle: Article = {
      ...article,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now
    };
    this.articles.update(articles => [...articles, newArticle]);
    return newArticle;
  }

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article | undefined> {
    await this.simulateDelay();
    const article = this.articles().find(a => a.id === id);
    if (!article) return undefined;

    const updatedArticle = {
      ...article,
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.articles.update(articles =>
      articles.map(a => a.id === id ? updatedArticle : a)
    );
    return updatedArticle;
  }

  async deleteArticle(id: string): Promise<boolean> {
    await this.simulateDelay();
    const initialLength = this.articles().length;
    this.articles.update(articles => articles.filter(a => a.id !== id));
    return this.articles().length < initialLength;
  }

  async getSalesInvoices(): Promise<SalesInvoice[]> {
    await this.simulateDelay();
    return this.salesInvoices();
  }

  async getSalesInvoiceById(id: string): Promise<SalesInvoice | undefined> {
    await this.simulateDelay();
    return this.salesInvoices().find(i => i.id === id);
  }

  async createSalesInvoice(invoice: Omit<SalesInvoice, 'id' | 'invoiceNumber' | 'createdAt'>): Promise<SalesInvoice> {
    await this.simulateDelay();
    const year = new Date().getFullYear();
    const nextNumber = this.salesInvoices().length + 1;
    const invoiceNumber = `VTE-${year}-${nextNumber.toString().padStart(3, '0')}`;

    const newInvoice: SalesInvoice = {
      ...invoice,
      id: this.generateId(),
      invoiceNumber,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.salesInvoices.update(invoices => [...invoices, newInvoice]);
    return newInvoice;
  }

  async updateSalesInvoice(id: string, updates: Partial<SalesInvoice>): Promise<SalesInvoice | undefined> {
    await this.simulateDelay();
    const invoice = this.salesInvoices().find(i => i.id === id);
    if (!invoice) return undefined;

    const updatedInvoice = { ...invoice, ...updates };
    this.salesInvoices.update(invoices =>
      invoices.map(i => i.id === id ? updatedInvoice : i)
    );
    return updatedInvoice;
  }

  async deleteSalesInvoice(id: string): Promise<boolean> {
    await this.simulateDelay();
    const initialLength = this.salesInvoices().length;
    this.salesInvoices.update(invoices => invoices.filter(i => i.id !== id));
    return this.salesInvoices().length < initialLength;
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

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Actif',
      inactive: 'Inactif',
      prospect: 'Prospect',
      draft: 'Brouillon',
      sent: 'Envoyée',
      viewed: 'Vue',
      paid: 'Payée',
      partial: 'Partiellement payée',
      overdue: 'En retard',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      retail: 'Détail',
      wholesale: 'Gros',
      enterprise: 'Entreprise',
      government: 'Gouvernement',
      product: 'Produit',
      service: 'Service'
    };
    return labels[category] || category;
  }
}