import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ChangePasswordRequest } from '../../../interfaces/auth.interface';

@Component({
  selector: 'app-change-password-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password-modal.component.html',
  styleUrl: './change-password-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordModalComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  protected readonly isLoading = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);

  readonly closed = output<void>();

  protected readonly passwordForm: FormGroup;

  constructor() {
    this.passwordForm = this.fb.group({
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('new_password')?.value;
    const confirmPassword = form.get('confirm_password')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  protected onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.toastService.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    this.isLoading.set(true);

    const formData: ChangePasswordRequest = {
      new_password: this.passwordForm.value.new_password,
      confirm_password: this.passwordForm.value.confirm_password
    };

    this.authService.changePassword(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(response.message);
          this.onClose();
        } else {
          this.toastService.error(response.message || 'Erreur lors du changement de mot de passe');
        }
      },
      error: (error) => {
        const errorMessage = error.message || 'Erreur lors du changement de mot de passe';
        this.toastService.error(errorMessage);
        console.error('Erreur de changement de mot de passe:', error);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  protected onClose(): void {
    this.passwordForm.reset();
    this.closed.emit();
  }

  protected onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}