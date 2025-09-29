import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { AchatsDataService } from '../../../services/achats-data.service';
import { BarChartComponent } from '../../../components/charts/bar-chart.component';
import { PieChartComponent } from '../../../components/charts/pie-chart.component';
import { LineChartComponent } from '../../../components/charts/line-chart.component';
import { PurchaseInvoice, AchatsMetrics } from '../../../interfaces/achats.interface';

@Component({
  selector: 'app-factures-achat',
  imports: [CommonModule, BarChartComponent, PieChartComponent, LineChartComponent],
  templateUrl: './factures-achat.html',
  styleUrl: './factures-achat.css'
})
export class FacturesAchat {
  private toastService = inject(ToastService);
  private achatsDataService = inject(AchatsDataService);

  protected readonly Math = Math;

  protected readonly searchTerm = signal('');
  protected readonly selectedStatus = signal<'all' | 'draft' | 'pending' | 'approved' | 'paid' | 'overdue' | 'cancelled'>('all');
  protected readonly selectedSupplier = signal<'all' | string>('all');
  protected readonly dateRange = signal<'all' | 'thisMonth' | 'lastMonth' | 'thisYear'>('all');
  protected readonly sortBy = signal<'date' | 'amount' | 'supplier'>('date');
  protected readonly sortOrder = signal<'asc' | 'desc'>('desc');
  protected readonly isLoading = signal(false);

  // Utiliser le service pour les données
  protected readonly invoices = this.achatsDataService.invoices;
  protected readonly metrics = computed(() => this.achatsDataService.metrics().invoices);
  protected readonly chartData = computed(() => this.achatsDataService.chartData().invoices);

  // Fournisseurs uniques pour le filtre
  protected readonly availableSuppliers = computed(() => {
    const suppliers = this.invoices().map((invoice: PurchaseInvoice) => ({
      id: invoice.supplierId,
      name: invoice.supplierName
    }));
    return suppliers.filter((supplier: {id: string, name: string}, index: number, self: {id: string, name: string}[]) =>
      index === self.findIndex((s: {id: string, name: string}) => s.id === supplier.id)
    ).sort((a: {id: string, name: string}, b: {id: string, name: string}) => a.name.localeCompare(b.name));
  });


  protected readonly filteredInvoices = computed(() => {
    const invoices = this.invoices();
    const search = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();
    const supplier = this.selectedSupplier();
    const range = this.dateRange();
    const sortBy = this.sortBy();
    const sortOrder = this.sortOrder();

    let filtered = invoices;

    if (status !== 'all') {
      filtered = filtered.filter((invoice: PurchaseInvoice) => invoice.status === status);
    }

    if (supplier !== 'all') {
      filtered = filtered.filter((invoice: PurchaseInvoice) => invoice.supplierId === supplier);
    }

    if (search) {
      filtered = filtered.filter((invoice: PurchaseInvoice) =>
        invoice.invoiceNumber.toLowerCase().includes(search) ||
        invoice.supplierName.toLowerCase().includes(search) ||
        invoice.description.toLowerCase().includes(search)
      );
    }

    if (range !== 'all') {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      filtered = filtered.filter((invoice: PurchaseInvoice) => {
        const invoiceDate = new Date(invoice.issueDate);
        const invoiceMonth = invoiceDate.getMonth();
        const invoiceYear = invoiceDate.getFullYear();

        switch (range) {
          case 'thisMonth':
            return invoiceMonth === currentMonth && invoiceYear === currentYear;
          case 'lastMonth':
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return invoiceMonth === lastMonth && invoiceYear === lastMonthYear;
          case 'thisYear':
            return invoiceYear === currentYear;
          default:
            return true;
        }
      });
    }

    // Tri
    filtered.sort((a: PurchaseInvoice, b: PurchaseInvoice) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
          break;
        case 'amount':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'supplier':
          comparison = a.supplierName.localeCompare(b.supplierName);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  });

  ngOnInit(): void {
    this.loadInvoices();
  }

  private loadInvoices(): void {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.toastService.success('Factures chargées avec succès');
    }, 1000);
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  protected onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus.set(target.value as 'all' | 'draft' | 'pending' | 'approved' | 'paid' | 'overdue' | 'cancelled');
  }

  protected onSupplierFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedSupplier.set(target.value);
  }

  protected onDateRangeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.dateRange.set(target.value as 'all' | 'thisMonth' | 'lastMonth' | 'thisYear');
  }

  protected onSortChange(field: 'date' | 'amount' | 'supplier'): void {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('desc');
    }
  }

  protected onCreateInvoice(): void {
    this.toastService.info('Fonctionnalité de création de facture à implémenter');
  }

  protected onEditInvoice(invoice: PurchaseInvoice): void {
    this.toastService.info(`Modification de la facture ${invoice.invoiceNumber} à implémenter`);
  }

  protected onDeleteInvoice(invoice: PurchaseInvoice): void {
    this.toastService.warning(`Suppression de la facture ${invoice.invoiceNumber} à implémenter`);
  }

  protected onApproveInvoice(invoice: PurchaseInvoice): void {
    this.achatsDataService.updateInvoice(invoice.id, {
      status: 'approved',
      approvedBy: 'Utilisateur actuel'
    });
    this.toastService.success(`Facture ${invoice.invoiceNumber} approuvée`);
  }

  protected onPayInvoice(invoice: PurchaseInvoice): void {
    this.achatsDataService.updateInvoice(invoice.id, {
      status: 'paid',
      paidAt: new Date().toISOString().split('T')[0]
    });
    this.toastService.success(`Facture ${invoice.invoiceNumber} marquée comme payée`);
  }

  protected onRefresh(): void {
    this.loadInvoices();
  }

  protected onExportExcel(): void {
    this.toastService.success('Export Excel en cours de préparation...');
    setTimeout(() => {
      this.toastService.info('Export terminé ! Fichier téléchargé.');
    }, 2000);
  }

  protected onImportInvoices(): void {
    this.toastService.info('Fonctionnalité d\'import à implémenter');
  }

  protected getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      pending: 'En attente',
      approved: 'Approuvée',
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  }

  protected formatCurrency(amount: number, currency: string = 'XOF'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  protected getDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

}