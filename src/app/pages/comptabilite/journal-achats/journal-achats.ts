import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComptabiliteDataService } from '../../../services/comptabilite-data.service';
import {
  JournalEntry,
  JournalType,
  JournalEntryStatus,
  JournalSortField,
  SortDirection,
  ExportOptions,
  ExportFormat
} from '../../../interfaces/comptabilite.interface';

type SortField = JournalSortField;

@Component({
  selector: 'app-journal-achats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './journal-achats.html',
  styleUrl: './journal-achats.css'
})
export class JournalAchats implements OnInit {
  private comptabiliteService = inject(ComptabiliteDataService);

  readonly showAnimations = signal(false);
  readonly entries = signal<JournalEntry[]>([]);
  readonly selectedEntries = signal<string[]>([]);

  // Filtres
  readonly searchTerm = signal('');
  readonly selectedPeriod = signal<string>('');
  readonly selectedAccount = signal<string>('');
  readonly selectedStatus = signal<string>('');
  readonly selectedSupplier = signal<string>('');
  readonly dateFrom = signal<string>('');
  readonly dateTo = signal<string>('');

  // Tri et pagination
  readonly sortField = signal<SortField>('date');
  readonly sortDirection = signal<SortDirection>('desc');
  readonly currentPage = signal(1);
  readonly pageSize = signal(25);

  readonly Math = Math;

  readonly purchaseMetrics = computed(() => {
    const metrics = this.comptabiliteService.metrics();
    return metrics.byJournal.purchases;
  });

  readonly uniqueSuppliers = computed(() => {
    const entries = this.entries();
    const suppliers = new Map<string, { id: string; name: string }>();

    entries.forEach(entry => {
      if (entry.thirdParty && entry.thirdPartyName) {
        suppliers.set(entry.thirdParty, {
          id: entry.thirdParty,
          name: entry.thirdPartyName
        });
      }
    });

    return Array.from(suppliers.values()).sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly filteredEntries = computed(() => {
    let entries = this.entries().filter(entry => entry.journalType === JournalType.PURCHASE);

    // Recherche textuelle
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      entries = entries.filter(entry =>
        entry.description.toLowerCase().includes(term) ||
        entry.entryNumber.toLowerCase().includes(term) ||
        entry.accountName.toLowerCase().includes(term) ||
        entry.thirdPartyName?.toLowerCase().includes(term) ||
        false
      );
    }

    // Filtres
    if (this.selectedAccount()) {
      entries = entries.filter(entry => entry.account === this.selectedAccount());
    }
    if (this.selectedStatus()) {
      entries = entries.filter(entry => entry.status === this.selectedStatus());
    }
    if (this.selectedSupplier()) {
      entries = entries.filter(entry => entry.thirdParty === this.selectedSupplier());
    }

    // Filtre par période
    if (this.selectedPeriod()) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      switch (this.selectedPeriod()) {
        case 'current_month':
          entries = entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
          });
          break;
        case 'last_month':
          entries = entries.filter(entry => {
            const entryDate = new Date(entry.date);
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return entryDate.getMonth() === lastMonth && entryDate.getFullYear() === lastMonthYear;
          });
          break;
        case 'current_quarter':
          const quarterStart = Math.floor(currentMonth / 3) * 3;
          entries = entries.filter(entry => {
            const entryDate = new Date(entry.date);
            const month = entryDate.getMonth();
            return month >= quarterStart && month < quarterStart + 3 && entryDate.getFullYear() === currentYear;
          });
          break;
        case 'current_year':
          entries = entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getFullYear() === currentYear;
          });
          break;
      }
    }

    // Filtres de date personnalisés
    if (this.dateFrom()) {
      entries = entries.filter(entry => new Date(entry.date) >= new Date(this.dateFrom()));
    }
    if (this.dateTo()) {
      entries = entries.filter(entry => new Date(entry.date) <= new Date(this.dateTo()));
    }

    // Tri
    return this.comptabiliteService.sortEntries(entries, this.sortField(), this.sortDirection());
  });

  readonly paginatedEntries = computed(() => {
    const filtered = this.filteredEntries();
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return filtered.slice(start, end);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredEntries().length / this.pageSize());
  });

  ngOnInit() {
    this.loadEntries();
    setTimeout(() => {
      this.showAnimations.set(true);
    }, 100);
  }

  async loadEntries() {
    const entries = await this.comptabiliteService.getJournalEntriesByType(JournalType.PURCHASE);
    this.entries.set(entries);
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
    this.selectedPeriod.set('');
    this.selectedAccount.set('');
    this.selectedStatus.set('');
    this.selectedSupplier.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.currentPage.set(1);
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm() ||
      this.selectedPeriod() ||
      this.selectedAccount() ||
      this.selectedStatus() ||
      this.selectedSupplier() ||
      this.dateFrom() ||
      this.dateTo()
    );
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchTerm()) count++;
    if (this.selectedPeriod()) count++;
    if (this.selectedAccount()) count++;
    if (this.selectedStatus()) count++;
    if (this.selectedSupplier()) count++;
    if (this.dateFrom()) count++;
    if (this.dateTo()) count++;
    return count;
  }

  // Sélection
  isSelected(id: string): boolean {
    return this.selectedEntries().includes(id);
  }

  toggleSelection(id: string) {
    this.selectedEntries.update(selected => {
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
      const allIds = this.paginatedEntries().map(entry => entry.id);
      this.selectedEntries.set([...new Set([...this.selectedEntries(), ...allIds])]);
    } else {
      const currentPageIds = this.paginatedEntries().map(entry => entry.id);
      this.selectedEntries.update(selected =>
        selected.filter(id => !currentPageIds.includes(id))
      );
    }
  }

  allSelected(): boolean {
    const currentPageIds = this.paginatedEntries().map(entry => entry.id);
    return currentPageIds.length > 0 && currentPageIds.every(id => this.isSelected(id));
  }

  someSelected(): boolean {
    const currentPageIds = this.paginatedEntries().map(entry => entry.id);
    return currentPageIds.some(id => this.isSelected(id)) && !this.allSelected();
  }

  // Pagination
  setPage(page: string | number) {
    if (typeof page === 'number') {
      this.currentPage.set(page);
    }
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
  onRowClick(entry: JournalEntry) {
    this.onViewEntry(entry);
  }

  onCreateEntry() {
    console.log('Créer nouvelle écriture d\'achat');
  }

  onViewEntry(entry: JournalEntry) {
    console.log('Voir écriture:', entry.id);
  }

  onEditEntry(entry: JournalEntry) {
    console.log('Éditer écriture:', entry.id);
  }

  onDeleteEntry(entry: JournalEntry) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'écriture "${entry.description}" ?`)) {
      console.log('Supprimer écriture:', entry.id);
    }
  }

  onExportJournal() {
    const options: ExportOptions = {
      format: ExportFormat.EXCEL,
      includeFilters: true,
      includeMetrics: true
    };
    console.log('Exporter journal des achats avec options:', options);
  }

  onBulkExport() {
    console.log('Exporter sélection:', this.selectedEntries());
  }

  onBulkDelete() {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedEntries().length} écriture(s) ?`)) {
      console.log('Supprimer sélection:', this.selectedEntries());
    }
  }

  // Utilitaires
  formatDate(dateString: string): string {
    return this.comptabiliteService.formatDate(dateString);
  }

  formatCurrency(amount: number): string {
    return this.comptabiliteService.formatCurrency(amount);
  }

  getStatusLabel(status: JournalEntryStatus): string {
    return this.comptabiliteService.getStatusLabel(status);
  }

  getStatusBadgeClass(status: JournalEntryStatus): string {
    return status.replace(/_/g, '-');
  }
}