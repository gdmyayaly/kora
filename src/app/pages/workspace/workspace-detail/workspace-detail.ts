import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkspaceService } from '../../../services/workspace.service';
import { ToastService } from '../../../services/toast.service';
import { WorkspaceDetail } from '../../../interfaces/workspace.interface';

@Component({
  selector: 'app-workspace-detail',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './workspace-detail.html',
  styleUrl: './workspace-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkspaceDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private workspaceService = inject(WorkspaceService);
  private toastService = inject(ToastService);

  protected readonly workspace = signal<WorkspaceDetail | null>(null);
  protected readonly isLoading = this.workspaceService.isLoading;
  protected readonly isEditing = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly showDeleteModal = signal(false);
  protected readonly isDeleting = signal(false);

  protected readonly editForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]]
  });

  ngOnInit(): void {
    const workspaceId = this.route.snapshot.paramMap.get('id');
    if (workspaceId) {
      this.loadWorkspace(workspaceId);
    } else {
      this.router.navigate(['/workspaces']);
    }
  }

  private loadWorkspace(workspaceId: string): void {
    this.workspaceService.getWorkspaceById(workspaceId).subscribe({
      next: (response) => {
        if (response.success) {
          this.workspace.set(response.data);
          this.editForm.patchValue({
            name: response.data.name,
            description: ''
          });
        } else {
          this.toastService.error('Erreur lors du chargement du workspace');
          this.router.navigate(['/workspaces']);
        }
      },
      error: (error) => {
        console.error('Failed to load workspace:', error);
        this.toastService.error('Erreur lors du chargement du workspace');
        this.router.navigate(['/workspaces']);
      }
    });
  }

  protected onBack(): void {
    this.router.navigate(['/workspaces']);
  }

  protected onEdit(): void {
    this.isEditing.set(true);
  }

  protected onCancelEdit(): void {
    const workspace = this.workspace();
    if (workspace) {
      this.editForm.patchValue({
        name: workspace.name,
        description: ''
      });
    }
    this.isEditing.set(false);
  }

  protected onSaveEdit(): void {
    if (this.editForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const workspace = this.workspace();
    if (!workspace) return;

    this.isSubmitting.set(true);
    const formValue = this.editForm.value;

    this.workspaceService.updateWorkspace(workspace.workspace_id, formValue).subscribe({
      next: (response) => {
        if (response.success) {
          this.workspace.set(response.data);
          this.isEditing.set(false);
          this.toastService.success('Workspace modifié avec succès');
        }
        this.isSubmitting.set(false);
      },
      error: (error) => {
        console.error('Failed to update workspace:', error);

        // Extraire le message d'erreur du serveur
        let errorMessage = 'Erreur lors de la modification du workspace';
        if (error.error && typeof error.error === 'object') {
          errorMessage = error.error.message || error.error.error || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.toastService.error(errorMessage);
        this.isSubmitting.set(false);
      }
    });
  }

  protected onSetDefault(): void {
    const workspace = this.workspace();
    if (!workspace || workspace.is_default) return;

    this.workspaceService.setWorkspaceDefault(workspace.workspace_id).subscribe({
      next: (response) => {
        if (response.success) {
          this.workspace.set(response.data);
          this.toastService.success('Workspace défini comme défaut');
        }
      },
      error: (error) => {
        console.error('Failed to set workspace as default:', error);

        // Extraire le message d'erreur du serveur
        let errorMessage = 'Erreur lors de la définition du workspace par défaut';
        if (error.error && typeof error.error === 'object') {
          errorMessage = error.error.message || error.error.error || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.toastService.error(errorMessage);
      }
    });
  }

  protected onShowDeleteModal(): void {
    this.showDeleteModal.set(true);
  }

  protected onCloseDeleteModal(): void {
    this.showDeleteModal.set(false);
  }

  protected onConfirmDelete(): void {
    const workspace = this.workspace();
    if (!workspace) return;

    this.isDeleting.set(true);

    this.workspaceService.deleteWorkspace(workspace.workspace_id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Workspace supprimé avec succès');
          this.showDeleteModal.set(false);
          this.router.navigate(['/workspaces']);
        }
        this.isDeleting.set(false);
      },
      error: (error) => {
        console.error('Failed to delete workspace:', error);

        // Extraire le message d'erreur du serveur
        let errorMessage = 'Erreur lors de la suppression du workspace';
        if (error.error && typeof error.error === 'object') {
          // Format: { code, error, message, success }
          errorMessage = error.error.message || error.error.error || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.toastService.error(errorMessage);
        this.isDeleting.set(false);
        this.showDeleteModal.set(false); // Fermer le modal après erreur
      }
    });
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
      'Owner': 'Propriétaire',
      'Admin': 'Administrateur',
      'Member': 'Membre',
      'Viewer': 'Observateur'
    };
    return roleMap[role] || role;
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
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} caractères`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    return 'Valeur invalide';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }
}