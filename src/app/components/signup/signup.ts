import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { SignupCredentials } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Signup implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  protected readonly registerForm: FormGroup;
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showEmailVerification = signal(false);
  protected readonly userEmail = signal<string>('');
  protected readonly resendingEmail = signal(false);

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  protected onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.clearMessages();
    this.loading.set(true);

    const formValue = this.registerForm.value;
    const credentials: SignupCredentials = {
      email: formValue.email,
      first_name: formValue.firstName,
      last_name: formValue.lastName,
      password: formValue.password
    };

    this.authService.signup(credentials).subscribe({
      next: (response) => {
        if (response.success) {
          this.userEmail.set(formValue.email);
          this.showEmailVerification.set(true);
          this.toastService.success(
            'Inscription réussie !',
            'Veuillez vérifier votre email pour activer votre compte.'
          );
          this.registerForm.reset();
        }
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Erreur lors de l\'inscription');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  protected onGoogleRegister(): void {
    this.toastService.info('Inscription Google', 'Fonctionnalité bientôt disponible');
  }

  protected onResendVerification(): void {
    if (!this.userEmail()) return;

    this.resendingEmail.set(true);

    this.authService.resendVerification(this.userEmail()).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(
            'Email envoyé !',
            'Un nouvel email de vérification a été envoyé.'
          );
        }
      },
      error: (error) => {
        this.toastService.error(
          'Erreur',
          error.message || 'Impossible d\'envoyer l\'email de vérification'
        );
      },
      complete: () => {
        this.resendingEmail.set(false);
      }
    });
  }

  protected onGoToSignin(): void {
    this.router.navigate(['/signin']);
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(show => !show);
  }

  protected getFieldError(fieldName: string): string | null {
    const field = this.registerForm.get(fieldName);

    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        switch (fieldName) {
          case 'firstName': return 'Le prénom est requis';
          case 'lastName': return 'Le nom est requis';
          case 'email': return 'L\'email est requis';
          case 'password': return 'Le mot de passe est requis';
          case 'confirmPassword': return 'La confirmation du mot de passe est requise';
          case 'acceptTerms': return 'Vous devez accepter les conditions d\'utilisation';
          default: return 'Ce champ est requis';
        }
      }
      if (field.errors?.['email']) {
        return 'Format d\'email invalide';
      }
      if (field.errors?.['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `Ce champ doit contenir au moins ${minLength} caractères`;
      }
      if (field.errors?.['passwordMismatch']) {
        return 'Les mots de passe ne correspondent pas';
      }
    }

    return null;
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  private clearMessages(): void {
    this.errorMessage.set(null);
  }
}
