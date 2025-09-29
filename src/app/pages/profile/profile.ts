import { Component, ChangeDetectionStrategy, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ProfileUpdateRequest } from '../../interfaces/auth.interface';
import { ChangePasswordModalComponent } from '../../components/ui/change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, ChangePasswordModalComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  protected authService = inject(AuthService);
  private toastService = inject(ToastService);

  protected readonly isEditing = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly showPasswordModal = signal(false);

  protected readonly profileForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      display_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address_line1: [''],
      address_line2: [''],
      city: [''],
      country: ['Sénégal'],
      postal_code: ['']
    });

    // Désactiver le formulaire par défaut
    this.profileForm.disable();

    // Effet pour réinitialiser le formulaire quand les données utilisateur changent
    effect(() => {
      const user = this.authService.user();
      if (user && !this.isEditing()) {
        this.initializeForm();
      }
    });

    // Effet pour auto-générer le nom d'affichage
    effect(() => {
      const firstName = this.profileForm.get('first_name')?.value;
      const lastName = this.profileForm.get('last_name')?.value;

      if (firstName && lastName && this.isEditing()) {
        const displayName = `${firstName} ${lastName}`;
        this.profileForm.get('display_name')?.setValue(displayName, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    // Charger les données utilisateur si nécessaire
    this.authService.loadUserDataIfNeeded();

    // Initialiser le formulaire avec les données utilisateur
    this.initializeForm();
  }

  private initializeForm(): void {
    const user = this.authService.user();
    if (user) {
      this.profileForm.patchValue({
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        display_name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address_line1: user.addressLine1 || '',
        address_line2: user.addressLine2 || '',
        city: user.city || '',
        country: user.country || 'Sénégal',
        postal_code: user.postalCode || ''
      });
    }
  }

  protected toggleEdit(): void {
    if (this.isEditing()) {
      this.cancelEdit();
    } else {
      this.startEdit();
    }
  }

  protected startEdit(): void {
    this.isEditing.set(true);
    this.profileForm.enable();
    // Garder l'email en lecture seule
    this.profileForm.get('email')?.disable();
  }

  protected cancelEdit(): void {
    this.isEditing.set(false);
    this.profileForm.disable();

    // Restaurer les valeurs originales
    this.initializeForm();
  }

  protected saveProfile(): void {
    if (this.profileForm.invalid) {
      this.toastService.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    this.isLoading.set(true);

    const formData: ProfileUpdateRequest = {
      first_name: this.profileForm.value.first_name,
      last_name: this.profileForm.value.last_name,
      display_name: this.profileForm.value.display_name,
      phone: this.profileForm.value.phone || undefined,
      address_line1: this.profileForm.value.address_line1 || undefined,
      address_line2: this.profileForm.value.address_line2 || undefined,
      city: this.profileForm.value.city || undefined,
      country: this.profileForm.value.country || undefined,
      postal_code: this.profileForm.value.postal_code || undefined
    };

    this.authService.updateProfile(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(response.message);
          this.isEditing.set(false);
          this.profileForm.disable();
          // Recharger les données du formulaire avec les nouvelles données
          this.initializeForm();
        } else {
          this.toastService.error(response.message || 'Erreur lors de la mise à jour du profil');
        }
      },
      error: (error) => {
        const errorMessage = error.message || 'Erreur lors de la mise à jour du profil';
        this.toastService.error(errorMessage);
        console.error('Erreur de mise à jour du profil:', error);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  protected readonly securitySections = [
    {
      title: 'Mot de passe',
      description: 'Modifiez votre mot de passe',
      icon: 'fas fa-key',
      action: 'Changer',
      handler: () => this.openPasswordModal()
    },
    {
      title: 'Authentification à deux facteurs',
      description: 'Sécurisez votre compte avec 2FA',
      icon: 'fas fa-shield-alt',
      action: 'Configurer',
      handler: () => console.log('2FA à implémenter')
    },
    {
      title: 'Sessions actives',
      description: 'Gérez vos sessions de connexion',
      icon: 'fas fa-devices',
      action: 'Voir',
      handler: () => console.log('Sessions à implémenter')
    }
  ];

  protected openPasswordModal(): void {
    this.showPasswordModal.set(true);
  }

  protected closePasswordModal(): void {
    this.showPasswordModal.set(false);
  }
}