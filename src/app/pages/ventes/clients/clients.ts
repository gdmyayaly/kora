import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { VentesDataService } from '../../../services/ventes-data.service';
import { Customer, VentesMetrics } from '../../../interfaces/ventes.interface';

@Component({
  selector: 'app-clients',
  imports: [CommonModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css'
})
export class Clients implements OnInit {
  private toastService = inject(ToastService);
  private ventesDataService = inject(VentesDataService);

  protected readonly searchTerm = signal('');
  protected readonly selectedStatus = signal<'all' | 'active' | 'inactive' | 'prospect'>('all');
  protected readonly selectedCategory = signal<'all' | 'retail' | 'wholesale' | 'enterprise' | 'government'>('all');
  protected readonly viewMode = signal<'grid' | 'list'>('grid');
  protected readonly isLoading = signal(false);
  protected readonly customers = signal<Customer[]>([]);

  protected readonly metrics = computed((): VentesMetrics['customers'] => {
    return this.ventesDataService.metrics().customers;
  });

  protected readonly filteredCustomers = computed(() => {
    const customers = this.customers();
    const search = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();
    const category = this.selectedCategory();

    let filtered = customers;

    if (status !== 'all') {
      filtered = filtered.filter(customer => customer.status === status);
    }

    if (category !== 'all') {
      filtered = filtered.filter(customer => customer.category === category);
    }

    if (search) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(search) ||
        customer.contactPerson.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search)
      );
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  private async loadCustomers(): Promise<void> {
    this.isLoading.set(true);
    try {
      const customers = await this.ventesDataService.getCustomers();
      this.customers.set(customers);
      this.toastService.success('Clients chargés avec succès');
    } catch (error) {
      this.toastService.error('Erreur lors du chargement des clients');
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
    this.selectedStatus.set(target.value as 'all' | 'active' | 'inactive' | 'prospect');
  }

  protected onCategoryFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory.set(target.value as 'all' | 'retail' | 'wholesale' | 'enterprise' | 'government');
  }

  protected onViewModeChange(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  protected onCreateCustomer(): void {
    this.toastService.info('Fonctionnalité de création de client à implémenter');
  }

  protected onEditCustomer(customer: Customer): void {
    this.toastService.info(`Modification de ${customer.name} à implémenter`);
  }

  protected onDeleteCustomer(customer: Customer): void {
    this.toastService.warning(`Suppression de ${customer.name} à implémenter`);
  }

  protected onToggleCustomerStatus(customer: Customer): void {
    const newStatus = customer.status === 'active' ? 'inactive' : 'active';
    this.ventesDataService.updateCustomer(customer.id, { status: newStatus })
      .then(() => {
        this.loadCustomers();
        this.toastService.success(`Statut de ${customer.name} mis à jour`);
      })
      .catch(() => {
        this.toastService.error('Erreur lors de la mise à jour du statut');
      });
  }

  protected onRefresh(): void {
    this.loadCustomers();
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

  protected getCategoryLabel(category: string): string {
    return this.ventesDataService.getCategoryLabel(category);
  }

  protected formatCurrency(amount: number): string {
    return this.ventesDataService.formatCurrency(amount);
  }

  protected getCustomerInitials(customer: Customer): string {
    return customer.name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
  }
}
