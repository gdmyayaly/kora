import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { AchatsDataService } from '../../../services/achats-data.service';
import { BarChartComponent } from '../../../components/charts/bar-chart.component';
import { PieChartComponent } from '../../../components/charts/pie-chart.component';
import { LineChartComponent } from '../../../components/charts/line-chart.component';
import { Supplier, AchatsMetrics } from '../../../interfaces/achats.interface';

@Component({
  selector: 'app-fournisseurs',
  imports: [CommonModule, BarChartComponent, PieChartComponent, LineChartComponent],
  templateUrl: './fournisseurs.html',
  styleUrl: './fournisseurs.css'
})
export class Fournisseurs {
  private toastService = inject(ToastService);
  private achatsDataService = inject(AchatsDataService);

  protected readonly searchTerm = signal('');
  protected readonly selectedStatus = signal<'all' | 'active' | 'inactive' | 'pending'>('all');
  protected readonly selectedCountry = signal<'all' | string>('all');
  protected readonly viewMode = signal<'grid' | 'list'>('grid');
  protected readonly isLoading = signal(false);

  // Utiliser le service pour les données
  protected readonly suppliers = this.achatsDataService.suppliers;
  protected readonly metrics = computed(() => this.achatsDataService.metrics().suppliers);
  protected readonly chartData = computed(() => this.achatsDataService.chartData().suppliers);

  // Pays disponibles pour le filtre
  protected readonly availableCountries = computed(() => {
    const countries = new Set(this.suppliers().map(s => s.address.country));
    return Array.from(countries).sort();
  });

  protected readonly filteredSuppliers = computed(() => {
    const suppliers = this.suppliers();
    const search = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();
    const country = this.selectedCountry();

    let filtered = suppliers;

    if (status !== 'all') {
      filtered = filtered.filter(supplier => supplier.status === status);
    }

    if (country !== 'all') {
      filtered = filtered.filter(supplier => supplier.address.country === country);
    }

    if (search) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(search) ||
        supplier.contactPerson.toLowerCase().includes(search) ||
        supplier.email.toLowerCase().includes(search)
      );
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadSuppliers();
  }

  private loadSuppliers(): void {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.toastService.success('Fournisseurs chargés avec succès');
    }, 1000);
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  protected onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus.set(target.value as 'all' | 'active' | 'inactive' | 'pending');
  }

  protected onCountryFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCountry.set(target.value);
  }

  protected onViewModeChange(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  protected onCreateSupplier(): void {
    this.toastService.info('Fonctionnalité de création de fournisseur à implémenter');
  }

  protected onEditSupplier(supplier: Supplier): void {
    this.toastService.info(`Modification de ${supplier.name} à implémenter`);
  }

  protected onDeleteSupplier(supplier: Supplier): void {
    this.toastService.warning(`Suppression de ${supplier.name} à implémenter`);
  }

  protected onToggleSupplierStatus(supplier: Supplier): void {
    const newStatus: 'active' | 'inactive' = supplier.status === 'active' ? 'inactive' : 'active';
    this.achatsDataService.updateSupplier(supplier.id, { status: newStatus });
    this.toastService.success(`Statut de ${supplier.name} mis à jour`);
  }

  protected onRefresh(): void {
    this.loadSuppliers();
  }

  protected onExportExcel(): void {
    this.toastService.success('Export Excel en cours de préparation...');
    setTimeout(() => {
      this.toastService.info('Export terminé ! Fichier téléchargé.');
    }, 2000);
  }

  protected getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Actif',
      inactive: 'Inactif',
      pending: 'En attente'
    };
    return labels[status] || status;
  }

  protected getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      materials: 'Matériaux',
      services: 'Services',
      equipment: 'Équipements',
      other: 'Autre'
    };
    return labels[category] || category;
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  }

  protected getSupplierInitials(supplier: Supplier): string {
    return supplier.name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
  }
}