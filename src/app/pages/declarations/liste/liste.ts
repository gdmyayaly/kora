import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { trigger, state, style, transition, animate } from '@angular/animations';
import { DeclarationsDataService } from '../../../services/declarations-data.service';
import {
  Declaration,
  DeclarationMetrics,
  DeclarationType,
  DeclarationStatus,
  DeclarationPriority,
  DeclarationFilter
} from '../../../interfaces/declarations.interface';

type SortField = keyof Declaration;
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-liste-declarations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './liste.html',
  styleUrl: './liste.css',
  // animations: [
  //   trigger('slideDown', [
  //     transition(':enter', [
  //       style({ height: '0', opacity: '0' }),
  //       animate('300ms ease-in-out', style({ height: '*', opacity: '1' }))
  //     ]),
  //     transition(':leave', [
  //       animate('300ms ease-in-out', style({ height: '0', opacity: '0' }))
  //     ])
  //   ])
  // ]
})
export class ListeDeclarations implements OnInit {
  private declarationsService = inject(DeclarationsDataService);

  readonly showAnimations = signal(false);
  readonly tableView = signal<'list' | 'cards'>('list');
  readonly showAdvancedFilters = signal(false);

  // Données
  readonly declarations = signal<Declaration[]>([]);
  readonly selectedDeclarations = signal<string[]>([]);

  // Filtres
  readonly searchTerm = signal('');
  readonly selectedType = signal<string>('');
  readonly selectedStatus = signal<string>('');
  readonly selectedPriority = signal<string>('');
  readonly selectedPeriod = signal<string>('');
  readonly selectedAssignee = signal<string>('');
  readonly dateFrom = signal<string>('');
  readonly dateTo = signal<string>('');
  readonly amountMin = signal<number | null>(null);
  readonly amountMax = signal<number | null>(null);

  // Tri et pagination
  readonly sortField = signal<SortField>('dueDate');
  readonly sortDirection = signal<SortDirection>('asc');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly metrics = computed(() => this.declarationsService.metrics());

  readonly Math = Math;

  readonly filteredDeclarations = computed(() => {
    let filtered = this.declarations();

    // Recherche textuelle
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(term) ||
        d.declarationNumber.toLowerCase().includes(term) ||
        d.description?.toLowerCase().includes(term) ||
        this.getTypeLabel(d.type).toLowerCase().includes(term)
      );
    }

    // Filtres simples
    if (this.selectedType()) {
      filtered = filtered.filter(d => d.type === this.selectedType());
    }
    if (this.selectedStatus()) {
      filtered = filtered.filter(d => d.status === this.selectedStatus());
    }
    if (this.selectedPriority()) {
      filtered = filtered.filter(d => d.priority === this.selectedPriority());
    }
    if (this.selectedAssignee()) {
      filtered = filtered.filter(d => d.assignedTo === this.selectedAssignee());
    }

    // Filtres de période
    if (this.selectedPeriod()) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      switch (this.selectedPeriod()) {
        case 'current_month':
          filtered = filtered.filter(d => {
            const dueDate = new Date(d.dueDate);
            return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
          });
          break;
        case 'next_month':
          filtered = filtered.filter(d => {
            const dueDate = new Date(d.dueDate);
            const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
            return dueDate.getMonth() === nextMonth && dueDate.getFullYear() === nextYear;
          });
          break;
        case 'current_quarter':
          const quarterStart = Math.floor(currentMonth / 3) * 3;
          filtered = filtered.filter(d => {
            const dueDate = new Date(d.dueDate);
            const month = dueDate.getMonth();
            return month >= quarterStart && month < quarterStart + 3 && dueDate.getFullYear() === currentYear;
          });
          break;
        case 'current_year':
          filtered = filtered.filter(d => {
            const dueDate = new Date(d.dueDate);
            return dueDate.getFullYear() === currentYear;
          });
          break;
      }
    }

    // Filtres de date avancés
    if (this.dateFrom()) {
      filtered = filtered.filter(d => new Date(d.dueDate) >= new Date(this.dateFrom()));
    }
    if (this.dateTo()) {
      filtered = filtered.filter(d => new Date(d.dueDate) <= new Date(this.dateTo()));
    }

    // Filtres de montant
    if (this.amountMin() !== null) {
      filtered = filtered.filter(d => (d.totalAmount || 0) >= this.amountMin()!);
    }
    if (this.amountMax() !== null) {
      filtered = filtered.filter(d => (d.totalAmount || 0) <= this.amountMax()!);
    }

    // Tri
    return this.sortDeclarations(filtered);
  });

  readonly paginatedDeclarations = computed(() => {
    const filtered = this.filteredDeclarations();
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return filtered.slice(start, end);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredDeclarations().length / this.pageSize());
  });

  ngOnInit() {
    this.loadDeclarations();
    setTimeout(() => {
      this.showAnimations.set(true);
    }, 100);
  }

  async loadDeclarations() {
    const declarations = await this.declarationsService.getDeclarations();
    this.declarations.set(declarations);
  }

  private sortDeclarations(declarations: Declaration[]): Declaration[] {
    return [...declarations].sort((a, b) => {
      const field = this.sortField();
      const direction = this.sortDirection();

      let aValue = a[field];
      let bValue = b[field];

      // Gestion spéciale pour les dates
      if (field === 'dueDate' || field === 'createdAt' || field === 'updatedAt') {
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

  onSort(field: SortField) {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  getSortIcon(field: SortField): string {
    if (this.sortField() !== field) return 'fa-sort';
    return this.sortDirection() === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  onSearch() {
    this.currentPage.set(1);
  }

  onFilterChange() {
    this.currentPage.set(1);
  }

  onClearFilters() {
    this.searchTerm.set('');
    this.selectedType.set('');
    this.selectedStatus.set('');
    this.selectedPriority.set('');
    this.selectedPeriod.set('');
    this.selectedAssignee.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.amountMin.set(null);
    this.amountMax.set(null);
    this.currentPage.set(1);
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters.update(show => !show);
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm() ||
      this.selectedType() ||
      this.selectedStatus() ||
      this.selectedPriority() ||
      this.selectedPeriod() ||
      this.selectedAssignee() ||
      this.dateFrom() ||
      this.dateTo() ||
      this.amountMin() !== null ||
      this.amountMax() !== null
    );
  }

  setTableView(view: 'list' | 'cards') {
    this.tableView.set(view);
  }

  // Sélection
  isSelected(id: string): boolean {
    return this.selectedDeclarations().includes(id);
  }

  toggleSelection(id: string) {
    this.selectedDeclarations.update(selected => {
      if (selected.includes(id)) {
        return selected.filter(s => s !== id);
      } else {
        return [...selected, id];
      }
    });
  }

  toggleAllSelection(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      const allIds = this.paginatedDeclarations().map(d => d.id);
      this.selectedDeclarations.set([...new Set([...this.selectedDeclarations(), ...allIds])]);
    } else {
      const currentPageIds = this.paginatedDeclarations().map(d => d.id);
      this.selectedDeclarations.update(selected =>
        selected.filter(id => !currentPageIds.includes(id))
      );
    }
  }

  allSelected(): boolean {
    const currentPageIds = this.paginatedDeclarations().map(d => d.id);
    return currentPageIds.length > 0 && currentPageIds.every(id => this.isSelected(id));
  }

  someSelected(): boolean {
    const currentPageIds = this.paginatedDeclarations().map(d => d.id);
    return currentPageIds.some(id => this.isSelected(id)) && !this.allSelected();
  }

  // Pagination
  setPage(page: number) {
    this.currentPage.set(page);
  }

  onPageSizeChange() {
    this.currentPage.set(1);
  }

  getPageNumbers(): (number | string)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 4) {
        pages.push('...');
      }

      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }

      if (current < total - 3) {
        pages.push('...');
      }

      pages.push(total);
    }

    return pages;
  }

  // Actions
  onRowClick(declaration: Declaration) {
    this.onViewDeclaration(declaration);
  }

  onCreateDeclaration() {
    console.log('Créer nouvelle déclaration');
  }

  onViewDeclaration(declaration: Declaration) {
    console.log('Voir déclaration:', declaration.id);
  }

  onEditDeclaration(declaration: Declaration) {
    console.log('Éditer déclaration:', declaration.id);
  }

  onDeleteDeclaration(declaration: Declaration) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la déclaration "${declaration.title}" ?`)) {
      console.log('Supprimer déclaration:', declaration.id);
    }
  }

  onExportDeclarations() {
    console.log('Exporter toutes les déclarations');
  }

  onBulkExport() {
    console.log('Exporter sélection:', this.selectedDeclarations());
  }

  onBulkSubmit() {
    console.log('Soumettre sélection:', this.selectedDeclarations());
  }

  onBulkDelete() {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedDeclarations().length} déclaration(s) ?`)) {
      console.log('Supprimer sélection:', this.selectedDeclarations());
    }
  }

  // Utilitaires
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  formatCurrency(amount: number): string {
    return this.declarationsService.formatCurrency(amount);
  }

  getDaysUntilDue(dueDateString: string): number | null {
    const dueDate = new Date(dueDateString);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getDueDateClass(dueDateString: string, status: DeclarationStatus): string {
    if (['submitted', 'accepted'].includes(status)) return '';

    const daysUntil = this.getDaysUntilDue(dueDateString);
    if (daysUntil === null) return '';

    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 7) return 'due-soon';
    return '';
  }

  getDaysRemainingClass(days: number): string {
    if (days < 0) return 'negative';
    if (days <= 7) return 'warning';
    return 'positive';
  }

  getTypeLabel(type: DeclarationType): string {
    return this.declarationsService.getTypeLabel(type);
  }

  getStatusLabel(status: DeclarationStatus): string {
    return this.declarationsService.getStatusLabel(status);
  }

  getPriorityLabel(priority: DeclarationPriority): string {
    return this.declarationsService.getPriorityLabel(priority);
  }

  getTypeBadgeClass(type: DeclarationType): string {
    return type.replace(/_/g, '-');
  }

  getStatusBadgeClass(status: DeclarationStatus): string {
    return status.replace(/_/g, '-');
  }

  getPriorityBadgeClass(priority: DeclarationPriority): string {
    return priority;
  }
}