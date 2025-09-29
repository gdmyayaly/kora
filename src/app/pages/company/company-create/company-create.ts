import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyService } from '../../../services/company.service';
import { ToastService } from '../../../services/toast.service';
import { EnumsService } from '../../../services/enums.service';
import { WorkspaceService } from '../../../services/workspace.service';

@Component({
  selector: 'app-company-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-create.html',
  styleUrl: './company-create.css'
})
export class CompanyCreateComponent {
  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private enumsService = inject(EnumsService);
  private workspaceService = inject(WorkspaceService);

  // Signals pour la gestion des étapes
  protected readonly currentStep = signal(1);
  protected readonly isSubmitting = signal(false);
  protected readonly completedSteps = signal<Set<number>>(new Set());

  // Validator personnalisé pour téléphone sénégalais
  static senegalPhoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const phone = control.value.replace(/\s/g, '');

    // Format 9 chiffres commençant par 7 (ex: 771234567)
    if (/^7\d{8}$/.test(phone)) return null;

    // Format 12 chiffres commençant par 221 (ex: 221771234567)
    if (/^221\d{9}$/.test(phone)) return null;

    return { senegalPhone: true };
  }

  // Signaux pour les données d'énumérations
  protected readonly countries = this.enumsService.countries;
  protected readonly currencies = this.enumsService.currencies;
  protected readonly legalForms = this.enumsService.legalForms;
  protected readonly countriesByRegion = this.enumsService.countriesByRegion;
  protected readonly isLoadingEnums = this.enumsService.isLoading;

  // Signal pour le workspace sélectionné
  protected readonly selectedWorkspace = this.workspaceService.selectedWorkspace;

  // Méthode utilitaire pour les templates
  protected readonly Object = Object;

  protected readonly companyForm: FormGroup = this.fb.group({
    // Étape 1: Informations principales
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [CompanyCreateComponent.senegalPhoneValidator]],
    description: ['', [Validators.maxLength(500)]],

    // Étape 2: Localisation
    address: ['', [Validators.maxLength(200)]],
    city: ['', [Validators.maxLength(100)]],
    postal_code: ['', [Validators.maxLength(20)]],
    country: ['', [Validators.required]],

    // Étape 3: Informations légales
    legal_form: ['', [Validators.required]],
    fiscal_number: ['', [Validators.maxLength(50)]],
    currency: ['', [Validators.required]],

    // Étape 4: Informations optionnelles
    website: ['', [Validators.pattern(/^https?:\/\/.+\..+/)]]
  });

  ngOnInit(): void {
    this.loadEnumsData();
  }

  private loadEnumsData(): void {
    // Charger les données d'énumérations nécessaires
    this.enumsService.getGlobalEnums().subscribe({
      error: (error) => {
        console.error('Failed to load enums:', error);
        this.toastService.error('Erreur lors du chargement des données');
      }
    });
  }

  protected onSubmit(): void {
    if (this.companyForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const currentWorkspace = this.selectedWorkspace();
    if (!currentWorkspace) {
      this.toastService.error('Aucun workspace sélectionné. Veuillez sélectionner un workspace avant de créer une entreprise.');
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.companyForm.value;

    // Ajouter workspace_id au payload
    const companyData = {
      ...formValue,
      workspace_id: currentWorkspace.workspace_id
    };

    this.companyService.createCompany(companyData).subscribe({
      next: (response) => {
        this.toastService.success(`Entreprise "${response.data.name}" créée avec succès dans le workspace "${currentWorkspace.name}"`);
        this.router.navigate(['/companies']);
      },
      error: (error) => {
        console.error('Failed to create company:', error);

        let errorMessage = 'Erreur lors de la création de l\'entreprise';

        // Extraire le message d'erreur spécifique du backend
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.toastService.error(errorMessage);
        this.isSubmitting.set(false);
      }
    });
  }

  protected onCancel(): void {
    if (this.companyForm.dirty) {
      if (confirm('Voulez-vous vraiment annuler ? Les modifications seront perdues.')) {
        this.router.navigate(['/companies']);
      }
    } else {
      this.router.navigate(['/companies']);
    }
  }

  protected onReset(): void {
    if (confirm('Voulez-vous vraiment réinitialiser le formulaire ?')) {
      this.companyForm.reset();
    }
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.companyForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  protected getFieldError(fieldName: string): string {
    const field = this.companyForm.get(fieldName);
    if (!field?.errors) return '';

    const errors = field.errors;
    if (errors['required']) return 'Ce champ est requis';
    if (errors['email']) return 'Adresse email invalide';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} caractères`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    if (errors['senegalPhone']) return 'Format: 7XXXXXXXX (9 chiffres) ou 221XXXXXXXXX (12 chiffres)';
    if (errors['pattern']) {
      if (fieldName === 'website') return 'URL invalide (doit commencer par http:// ou https://)';
    }
    return 'Valeur invalide';
  }

  // Méthodes de navigation entre étapes
  protected nextStep(): void {
    if (this.isCurrentStepValid()) {
      const completed = new Set(this.completedSteps());
      completed.add(this.currentStep());
      this.completedSteps.set(completed);

      if (this.currentStep() < 5) {
        this.currentStep.set(this.currentStep() + 1);
      }
    } else {
      this.markCurrentStepFieldsTouched();
      this.toastService.error('Veuillez corriger les erreurs avant de continuer');
    }
  }

  protected previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  protected goToStep(step: number): void {
    if (step <= this.currentStep() || this.completedSteps().has(step - 1)) {
      this.currentStep.set(step);
    }
  }

  protected isCurrentStepValid(): boolean {
    const step = this.currentStep();
    const stepFields = this.getStepFields(step);
    return stepFields.every(fieldName => {
      const field = this.companyForm.get(fieldName);
      return field?.valid || false;
    });
  }

  protected isStepCompleted(step: number): boolean {
    return this.completedSteps().has(step);
  }

  protected getStepFields(step: number): string[] {
    switch (step) {
      case 1: return ['name', 'email', 'phone', 'description'];
      case 2: return ['address', 'city', 'postal_code', 'country'];
      case 3: return ['legal_form', 'fiscal_number', 'currency'];
      case 4: return ['website'];
      default: return [];
    }
  }

  protected markCurrentStepFieldsTouched(): void {
    const stepFields = this.getStepFields(this.currentStep());
    stepFields.forEach(fieldName => {
      const control = this.companyForm.get(fieldName);
      control?.markAsTouched();
    });
  }

  protected getStepTitle(step: number): string {
    switch (step) {
      case 1: return 'Informations principales';
      case 2: return 'Localisation';
      case 3: return 'Informations légales';
      case 4: return 'Informations optionnelles';
      case 5: return 'Récapitulatif';
      default: return '';
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.companyForm.controls).forEach(key => {
      const control = this.companyForm.get(key);
      control?.markAsTouched();
    });
  }
}