import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { VentesDataService } from '../../../services/ventes-data.service';
import { SalesInvoice, VentesMetrics } from '../../../interfaces/ventes.interface';

@Component({
  selector: 'app-factures-vente',
  imports: [CommonModule, RouterLink],
  templateUrl: './factures-vente.html',
  styleUrl: './factures-vente.css'
})
export class FacturesVente implements OnInit {
  private toastService = inject(ToastService);
  private ventesDataService = inject(VentesDataService);

  protected readonly searchTerm = signal('');
  protected readonly selectedStatus = signal<'all' | 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled'>('all');
  protected readonly selectedPeriod = signal<'all' | 'today' | 'week' | 'month' | 'quarter' | 'year'>('all');
  protected readonly sortBy = signal<'date' | 'amount' | 'customer' | 'status'>('date');
  protected readonly sortOrder = signal<'asc' | 'desc'>('desc');
  protected readonly isLoading = signal(false);
  protected readonly salesInvoices = signal<SalesInvoice[]>([]);

  protected readonly metrics = computed((): VentesMetrics['sales'] => {
    return this.ventesDataService.metrics().sales;
  });

  protected readonly filteredInvoices = computed(() => {
    const invoices = this.salesInvoices();
    const search = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();
    const period = this.selectedPeriod();
    const sortBy = this.sortBy();
    const sortOrder = this.sortOrder();

    let filtered = invoices;

    // Filter by status
    if (status !== 'all') {
      if (status === 'overdue') {
        filtered = filtered.filter(invoice => this.isOverdue(invoice));
      } else {
        filtered = filtered.filter(invoice => invoice.status === status);
      }
    }

    // Filter by period
    if (period !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (period) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(invoice => new Date(invoice.issueDate) >= filterDate);
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(search) ||
        invoice.customerName.toLowerCase().includes(search) ||
        invoice.description?.toLowerCase().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.issueDate);
          bValue = new Date(b.issueDate);
          break;
        case 'amount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'customer':
          aValue = a.customerName;
          bValue = b.customerName;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  });

  ngOnInit(): void {
    this.loadInvoices();
  }

  private async loadInvoices(): Promise<void> {
    this.isLoading.set(true);
    try {
      const invoices = await this.ventesDataService.getSalesInvoices();
      this.salesInvoices.set(invoices);
      this.toastService.success('Factures chargées avec succès');
    } catch (error) {
      this.toastService.error('Erreur lors du chargement des factures');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  protected onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus.set(target.value as any);
  }

  protected onPeriodFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedPeriod.set(target.value as any);
  }

  protected onSort(field: 'date' | 'amount' | 'customer' | 'status'): void {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('desc');
    }
  }

  protected onCreateInvoice(): void {
    this.toastService.info('Redirection vers la création de facture...');
  }

  protected onEditInvoice(invoice: SalesInvoice): void {
    this.toastService.info(`Modification de la facture ${invoice.invoiceNumber} à implémenter`);
  }

  protected onDeleteInvoice(invoice: SalesInvoice): void {
    this.toastService.warning(`Suppression de la facture ${invoice.invoiceNumber} à implémenter`);
  }

  protected onSendInvoice(invoice: SalesInvoice): void {
    this.ventesDataService.updateSalesInvoice(invoice.id, {
      status: 'sent',
      sentAt: new Date().toISOString().split('T')[0]
    })
    .then(() => {
      this.loadInvoices();
      this.toastService.success(`Facture ${invoice.invoiceNumber} envoyée`);
    })
    .catch(() => {
      this.toastService.error('Erreur lors de l\'envoi de la facture');
    });
  }

  protected onMarkAsPaid(invoice: SalesInvoice): void {
    this.ventesDataService.updateSalesInvoice(invoice.id, {
      status: 'paid',
      paymentStatus: 'paid',
      paidAmount: invoice.totalAmount,
      remainingAmount: 0,
      paidAt: new Date().toISOString().split('T')[0]
    })
    .then(() => {
      this.loadInvoices();
      this.toastService.success(`Facture ${invoice.invoiceNumber} marquée comme payée`);
    })
    .catch(() => {
      this.toastService.error('Erreur lors de la mise à jour du statut');
    });
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

  protected getStatusLabel(status: string): string {
    return this.ventesDataService.getStatusLabel(status);
  }

  protected formatCurrency(amount: number): string {
    return this.ventesDataService.formatCurrency(amount);
  }

  protected getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      draft: '#6b7280',
      sent: '#3b82f6',
      viewed: '#8b5cf6',
      paid: '#10b981',
      partial: '#f59e0b',
      overdue: '#ef4444',
      cancelled: '#6b7280'
    };
    return colors[status] || '#6b7280';
  }

  protected isOverdue(invoice: SalesInvoice): boolean {
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    return dueDate < now && invoice.status !== 'paid' && invoice.status !== 'cancelled';
  }

  protected getDaysOverdue(invoice: SalesInvoice): number {
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    const diffTime = now.getTime() - dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  protected getDaysToDue(invoice: SalesInvoice): number {
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
