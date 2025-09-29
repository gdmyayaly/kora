import { Component, signal, inject, output, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompanyService } from '../../../services/company.service';
import { ToastService } from '../../../services/toast.service';
import { Company } from '../../../interfaces/company.interface';

@Component({
  selector: 'app-company-selector',
  imports: [CommonModule],
  templateUrl: './company-selector.component.html',
  styleUrl: './company-selector.component.css'
})
export class CompanySelectorComponent {
  private companyService = inject(CompanyService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  protected readonly showDropdown = signal(false);

  // Inputs et outputs
  readonly forceClose = input(false);
  readonly onDropdownToggle = output<boolean>();

  // Accès aux signaux du service
  protected readonly companies = this.companyService.companies;
  protected readonly selectedCompany = this.companyService.selectedCompany;
  protected readonly isLoading = this.companyService.isLoading;

  constructor() {
    // Observer les changements de forceClose avec effect
    effect(() => {
      if (this.forceClose() && this.showDropdown()) {
        this.showDropdown.set(false);
      }
    });
  }

  ngOnInit(): void {
    // Charger les entreprises si pas encore fait
    if (!this.companyService.hasCompanies()) {
      this.companyService.getCompanies().subscribe();
    }
  }

  protected toggleDropdown(): void {
    const newState = !this.showDropdown();
    this.showDropdown.set(newState);
    this.onDropdownToggle.emit(newState);
  }

  protected onSelectCompany(company: Company): void {
    this.companyService.selectCompany(company);
    this.showDropdown.set(false);
    this.onDropdownToggle.emit(false);
    this.toastService.success(`Entreprise "${company.name}" sélectionnée`);
  }

  protected onCreateCompany(): void {
    this.showDropdown.set(false);
    this.onDropdownToggle.emit(false);
    this.router.navigate(['/companies/create']);
  }

  protected onViewAllCompanies(): void {
    this.showDropdown.set(false);
    this.onDropdownToggle.emit(false);
    this.router.navigate(['/companies']);
  }

  protected hasCompanies(): boolean {
    return this.companyService.hasCompanies();
  }

  protected getDisplayName(): string {
    const selected = this.selectedCompany();
    if (selected) {
      return selected.name.length > 20 ? selected.name.substring(0, 17) + '...' : selected.name;
    }
    return this.hasCompanies() ? 'Sélectionner une entreprise' : 'Créer une entreprise';
  }

  protected getDisplayIcon(): string {
    return this.hasCompanies() ? 'fas fa-building' : 'fas fa-plus';
  }
}