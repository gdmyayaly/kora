import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { VentesDataService } from '../../../services/ventes-data.service';
import { Article, VentesMetrics } from '../../../interfaces/ventes.interface';

@Component({
  selector: 'app-articles',
  imports: [CommonModule],
  templateUrl: './articles.html',
  styleUrl: './articles.css'
})
export class Articles implements OnInit {
  private toastService = inject(ToastService);
  private ventesDataService = inject(VentesDataService);

  protected readonly searchTerm = signal('');
  protected readonly selectedCategory = signal<'all' | 'product' | 'service'>('all');
  protected readonly selectedSubcategory = signal<'all' | 'Informatique' | 'Conseil' | 'Maintenance'>('all');
  protected readonly selectedStatus = signal<'all' | 'active' | 'inactive'>('all');
  protected readonly viewMode = signal<'grid' | 'list'>('grid');
  protected readonly sortBy = signal<'name' | 'price' | 'stock' | 'sales'>('name');
  protected readonly sortOrder = signal<'asc' | 'desc'>('asc');
  protected readonly isLoading = signal(false);
  protected readonly articles = signal<Article[]>([]);

  protected readonly metrics = computed((): VentesMetrics['articles'] => {
    return this.ventesDataService.metrics().articles;
  });

  protected readonly filteredArticles = computed(() => {
    const articles = this.articles();
    const search = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();
    const subcategory = this.selectedSubcategory();
    const status = this.selectedStatus();
    const sortBy = this.sortBy();
    const sortOrder = this.sortOrder();

    let filtered = articles;

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(article => article.category === category);
    }

    // Filter by subcategory
    if (subcategory !== 'all') {
      filtered = filtered.filter(article => article.subcategory === subcategory);
    }

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(article =>
        status === 'active' ? article.isActive : !article.isActive
      );
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter(article =>
        article.name.toLowerCase().includes(search) ||
        article.description.toLowerCase().includes(search) ||
        article.sku.toLowerCase().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'price':
          aValue = a.unitPrice;
          bValue = b.unitPrice;
          break;
        case 'stock':
          aValue = a.stock.available;
          bValue = b.stock.available;
          break;
        case 'sales':
          aValue = a.totalSold;
          bValue = b.totalSold;
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

  protected readonly stockAlerts = computed(() => {
    const articles = this.articles();
    return {
      lowStock: articles.filter(a => a.stock.available <= a.stock.minThreshold && a.stock.available > 0),
      outOfStock: articles.filter(a => a.stock.available === 0),
      overStock: articles.filter(a => a.stock.available > a.stock.maxThreshold)
    };
  });

  ngOnInit(): void {
    this.loadArticles();
  }

  private async loadArticles(): Promise<void> {
    this.isLoading.set(true);
    try {
      const articles = await this.ventesDataService.getArticles();
      this.articles.set(articles);
      this.toastService.success('Articles chargés avec succès');
    } catch (error) {
      this.toastService.error('Erreur lors du chargement des articles');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  protected onCategoryFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory.set(target.value as any);
  }

  protected onSubcategoryFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedSubcategory.set(target.value as any);
  }

  protected onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus.set(target.value as any);
  }

  protected onViewModeChange(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  protected onSort(field: 'name' | 'price' | 'stock' | 'sales'): void {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
  }

  protected onCreateArticle(): void {
    this.toastService.info('Fonctionnalité de création d\'article à implémenter');
  }

  protected onEditArticle(article: Article): void {
    this.toastService.info(`Modification de ${article.name} à implémenter`);
  }

  protected onDeleteArticle(article: Article): void {
    this.toastService.warning(`Suppression de ${article.name} à implémenter`);
  }

  protected onToggleArticleStatus(article: Article): void {
    this.ventesDataService.updateArticle(article.id, { isActive: !article.isActive })
      .then(() => {
        this.loadArticles();
        this.toastService.success(`Statut de ${article.name} mis à jour`);
      })
      .catch(() => {
        this.toastService.error('Erreur lors de la mise à jour du statut');
      });
  }

  protected onRefresh(): void {
    this.loadArticles();
  }

  protected onExportExcel(): void {
    this.toastService.success('Export Excel en cours de préparation...');
    setTimeout(() => {
      this.toastService.info('Export terminé ! Fichier téléchargé.');
    }, 2000);
  }

  protected formatCurrency(amount: number): string {
    return this.ventesDataService.formatCurrency(amount);
  }

  protected getCategoryLabel(category: string): string {
    return this.ventesDataService.getCategoryLabel(category);
  }

  protected getStockStatus(article: Article): 'good' | 'low' | 'out' | 'over' {
    if (article.stock.available === 0) return 'out';
    if (article.stock.available <= article.stock.minThreshold) return 'low';
    if (article.stock.available > article.stock.maxThreshold) return 'over';
    return 'good';
  }

  protected getStockStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      good: 'Stock normal',
      low: 'Stock bas',
      out: 'Rupture de stock',
      over: 'Surstock'
    };
    return labels[status] || status;
  }

  protected getMarginPercentage(article: Article): number {
    if (article.unitPrice === 0) return 0;
    return ((article.unitPrice - article.costPrice) / article.unitPrice) * 100;
  }
}