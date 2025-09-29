import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompanyService } from '../../../services/company.service';
import { ToastService } from '../../../services/toast.service';
import { Company } from '../../../interfaces/company.interface';

@Component({
  selector: 'app-companies',
  imports: [CommonModule],
  templateUrl: './companies.html',
  styleUrl: './companies.css'
})
export class CompaniesComponent {
  private companyService = inject(CompanyService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  protected readonly searchTerm = signal('');
  protected readonly viewMode = signal<'grid' | 'list'>('grid');

  protected readonly companies = this.companyService.companies;
  protected readonly isLoading = this.companyService.isLoading;

  protected readonly filteredCompanies = computed(() => {
    const companies = this.companies();
    const search = this.searchTerm().toLowerCase();

    if (!search) return companies;

    return companies.filter(company =>
      company.name.toLowerCase().includes(search) ||
      company.email.toLowerCase().includes(search)
    );
  });

  ngOnInit(): void {
    this.loadCompanies();
  }

  private loadCompanies(): void {
    this.companyService.getCompanies().subscribe({
      error: (error) => {
        console.error('Failed to load companies:', error);
        this.toastService.error('Erreur lors du chargement des entreprises');
      }
    });
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  protected onViewModeChange(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  protected onCompanyClick(company: Company): void {
    this.router.navigate(['/companies', company.company_id]);
  }

  protected onViewCompany(company: Company): void {
    this.router.navigate(['/companies', company.company_id]);
  }

  protected onCreateCompany(): void {
    this.router.navigate(['/companies/create']);
  }

  protected onRefresh(): void {
    this.loadCompanies();
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }
}