import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../../services/workspace.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-workspace-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './workspace-create.html',
  styleUrl: './workspace-create.css'
})
export class WorkspaceCreateComponent {
  private fb = inject(FormBuilder);
  private workspaceService = inject(WorkspaceService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  protected readonly isSubmitting = signal(false);

  protected readonly workspaceForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    is_default: [false]
  });

  protected onSubmit(): void {
    if (this.workspaceForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.workspaceForm.value;

    this.workspaceService.createWorkspace(formValue).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(`Workspace "${response.data.name}" créé avec succès`);
          this.router.navigate(['/workspaces']);
        }
      },
      error: (error) => {
        console.error('Failed to create workspace:', error);
        this.toastService.error('Erreur lors de la création du workspace');
        this.isSubmitting.set(false);
      }
    });
  }

  protected onCancel(): void {
    if (this.workspaceForm.dirty) {
      if (confirm('Voulez-vous vraiment annuler ? Les modifications seront perdues.')) {
        this.router.navigate(['/workspaces']);
      }
    } else {
      this.router.navigate(['/workspaces']);
    }
  }

  protected onReset(): void {
    if (confirm('Voulez-vous vraiment réinitialiser le formulaire ?')) {
      this.workspaceForm.reset();
    }
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.workspaceForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  protected getFieldError(fieldName: string): string {
    const field = this.workspaceForm.get(fieldName);
    if (!field?.errors) return '';

    const errors = field.errors;
    if (errors['required']) return 'Ce champ est requis';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} caractères`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    return 'Valeur invalide';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.workspaceForm.controls).forEach(key => {
      const control = this.workspaceForm.get(key);
      control?.markAsTouched();
    });
  }
}