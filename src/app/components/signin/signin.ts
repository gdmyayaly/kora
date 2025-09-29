import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SigninCredentials } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-signin',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Signin implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected authService = inject(AuthService);

  protected readonly loginForm: FormGroup;
  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly checkingToken = signal(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.checkExistingToken();
  }

  private checkExistingToken(): void {
    const token = this.authService.getStoredToken();

    if (!token) {
      // Pas de token, afficher le formulaire de connexion
      this.showReturnUrlMessage();
      return;
    }

    // Un token existe, vérifier sa validité
    this.checkingToken.set(true);

    this.authService.getUser().subscribe({
      next: (response) => {
        if (response.success) {
          // Token valide, utilisateur authentifié
          this.authService.loadUserDataIfNeeded();
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigate([returnUrl]);
        }
      },
      error: () => {
        // Token invalide, nettoyer et afficher le formulaire
        this.authService.logout();
        this.showReturnUrlMessage();
        this.checkingToken.set(false);
      },
      complete: () => {
        this.checkingToken.set(false);
      }
    });
  }

  private showReturnUrlMessage(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl) {
      this.errorMessage.set('Vous devez vous connecter pour accéder à cette page.');
    }
  }

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.clearMessages();
    this.loading.set(true);

    const credentials: SigninCredentials = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.signin(credentials).subscribe({
      next: () => {
        // Charger les données complètes de l'utilisateur après connexion réussie
        this.authService.getUser().subscribe({
          next: (userResponse) => {
            if (userResponse.success) {
              this.successMessage.set('Connexion réussie ! Redirection...');

              // Redirection vers la page demandée ou le dashboard
              const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

              setTimeout(() => {
                this.router.navigate([returnUrl]);
              }, 1000);
            } else {
              this.errorMessage.set('Erreur lors du chargement du profil utilisateur');
              this.loading.set(false);
            }
          },
          error: (error) => {
            console.error('Erreur lors du chargement du profil:', error);
            // Même en cas d'erreur du profil, on redirige car l'authentification a réussi
            this.successMessage.set('Connexion réussie ! Redirection...');
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

            setTimeout(() => {
              this.router.navigate([returnUrl]);
            }, 1000);
          }
        });
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Erreur lors de la connexion');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  protected onGoogleLogin(): void {
    // TODO: Implémenter la connexion Google si nécessaire
    this.errorMessage.set('Connexion Google non encore implémentée');
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  protected getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);

    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return fieldName === 'email' ? 'L\'email est requis' : 'Le mot de passe est requis';
      }
      if (field.errors?.['email']) {
        return 'Format d\'email invalide';
      }
      if (field.errors?.['minlength']) {
        return 'Le mot de passe doit contenir au moins 6 caractères';
      }
    }

    return null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  private clearMessages(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }
}
