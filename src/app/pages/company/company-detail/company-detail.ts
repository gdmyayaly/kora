import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '../../../services/company.service';
import { ToastService } from '../../../services/toast.service';
import { EnumsService } from '../../../services/enums.service';
import { Company, UpdateCompanyRequest } from '../../../interfaces/company.interface';

@Component({
  selector: 'app-company-detail',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-detail.html',
  styleUrl: './company-detail.css'
})
export class CompanyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private toastService = inject(ToastService);
  private enumsService = inject(EnumsService);

  protected readonly company = signal<Company | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isEditing = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly showDeleteModal = signal(false);

  // Signaux pour les données d'énumérations
  protected readonly countries = this.enumsService.countries;
  protected readonly currencies = this.enumsService.currencies;
  protected readonly legalForms = this.enumsService.legalForms;
  protected readonly countriesByRegion = this.enumsService.countriesByRegion;
  protected readonly isLoadingEnums = this.enumsService.isLoading;

  // Méthode utilitaire pour les templates
  protected readonly Object = Object;

  protected readonly editForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', []],
    description: ['', [Validators.maxLength(500)]],
    address: ['', [Validators.maxLength(200)]],
    city: ['', [Validators.maxLength(100)]],
    postal_code: ['', [Validators.maxLength(20)]],
    country: ['', [Validators.required]],
    legal_form: ['', [Validators.required]],
    fiscal_number: ['', [Validators.maxLength(50)]],
    currency: ['', [Validators.required]],
    website: ['', [Validators.pattern(/^https?:\/\/.+\..+/)]]
  });

  protected readonly canEdit = computed(() => {
    const company = this.company();
    return company?.permissions?.includes('company:update') || company?.role === 'Owner';
  });

  protected readonly canDelete = computed(() => {
    const company = this.company();
    return company?.permissions?.includes('company:delete') || company?.role === 'Owner';
  });

  ngOnInit(): void {
    this.loadEnumsData();

    const companyId = this.route.snapshot.paramMap.get('id');
    if (companyId) {
      this.loadCompany(companyId);
    } else {
      this.router.navigate(['/companies']);
    }
  }

  private loadEnumsData(): void {
    this.enumsService.getGlobalEnums().subscribe({
      error: (error) => {
        console.error('Failed to load enums:', error);
        this.toastService.error('Erreur lors du chargement des données');
      }
    });
  }

  private loadCompany(companyId: string): void {
    this.isLoading.set(true);

    this.companyService.getCompany(companyId).subscribe({
      next: (response) => {
        if (response.success) {
          this.company.set(response.data);
          this.populateEditForm(response.data);
        } else {
          this.toastService.error(response.message || 'Erreur lors du chargement de l\'entreprise');
          this.router.navigate(['/companies']);
        }
      },
      error: (error) => {
        console.error('Failed to load company:', error);
        this.toastService.error('Erreur lors du chargement de l\'entreprise');
        this.router.navigate(['/companies']);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  private populateEditForm(company: Company): void {
    this.editForm.patchValue({
      name: company.name,
      email: company.email,
      phone: company.phone,
      description: company.description,
      address: company.address,
      city: company.city,
      postal_code: company.postal_code,
      country: company.country,
      legal_form: company.legal_form,
      fiscal_number: company.fiscal_number,
      currency: company.currency,
      website: company.website
    });
  }

  protected onEdit(): void {
    if (this.canEdit()) {
      this.isEditing.set(true);
    }
  }

  protected onCancelEdit(): void {
    this.isEditing.set(false);
    const company = this.company();
    if (company) {
      this.populateEditForm(company);
    }
  }

  protected onSave(): void {
    if (this.editForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const company = this.company();
    if (!company) return;

    this.isSubmitting.set(true);

    const updateData: UpdateCompanyRequest = this.editForm.value;

    this.companyService.updateCompany(company.company_id, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          this.company.set(response.data);
          this.isEditing.set(false);
          // Afficher le message du serveur
          this.toastService.success(response.message || 'Entreprise mise à jour avec succès');
        }
      },
      error: (error) => {
        console.error('Failed to update company:', error);

        // Extraire le message d'erreur du serveur
        let errorMessage = 'Erreur lors de la mise à jour de l\'entreprise';
        if (error.error && typeof error.error === 'object') {
          // Format: { code, error, message, success }
          errorMessage = error.error.message || error.error.error || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.toastService.error(errorMessage);
      },
      complete: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  protected onDeleteClick(): void {
    if (this.canDelete()) {
      this.showDeleteModal.set(true);
    }
  }

  protected onDeleteConfirm(): void {
    const company = this.company();
    if (!company) return;

    this.isSubmitting.set(true);

    this.companyService.deleteCompany(company.company_id).subscribe({
      next: (response) => {
        if (response.success) {
          // Afficher le message du serveur
          this.toastService.success(response.message || 'Entreprise supprimée avec succès');
          this.showDeleteModal.set(false);
          this.router.navigate(['/companies']);
        }
      },
      error: (error) => {
        console.error('Failed to delete company:', error);

        // Extraire le message d'erreur du serveur
        let errorMessage = 'Erreur lors de la suppression de l\'entreprise';
        if (error.error && typeof error.error === 'object') {
          // Format: { code, error, message, success }
          errorMessage = error.error.message || error.error.error || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.toastService.error(errorMessage);
        this.showDeleteModal.set(false);
      },
      complete: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  protected onDeleteCancel(): void {
    this.showDeleteModal.set(false);
  }

  protected onBack(): void {
    this.router.navigate(['/companies']);
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  protected getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (!field?.errors) return '';

    const errors = field.errors;
    if (errors['required']) return 'Ce champ est requis';
    if (errors['email']) return 'Adresse email invalide';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} caractères`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    if (errors['pattern']) {
      if (fieldName === 'website') return 'URL invalide (doit commencer par http:// ou https://)';
    }
    return 'Valeur invalide';
  }

  protected getFullAddress(company: Company): string {
    const addressParts = [
      company.address,
      company.city,
      company.postal_code,
      company.country
    ].filter(part => part && part.trim() !== '');

    return addressParts.length > 0 ? addressParts.join(', ') : '-';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }
}