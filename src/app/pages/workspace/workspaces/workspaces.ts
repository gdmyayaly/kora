import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../../services/workspace.service';
import { ToastService } from '../../../services/toast.service';
import { Workspace } from '../../../interfaces/workspace.interface';

@Component({
  selector: 'app-workspaces',
  imports: [CommonModule],
  templateUrl: './workspaces.html',
  styleUrl: './workspaces.css'
})
export class WorkspacesComponent {
  private workspaceService = inject(WorkspaceService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  protected readonly searchTerm = signal('');
  protected readonly viewMode = signal<'grid' | 'list'>('grid');

  protected readonly workspaces = this.workspaceService.workspaces;
  protected readonly isLoading = this.workspaceService.isLoading;

  protected readonly filteredWorkspaces = computed(() => {
    const workspaces = this.workspaces();
    const search = this.searchTerm().toLowerCase();

    if (!search) return workspaces;

    return workspaces.filter(workspace =>
      workspace.name.toLowerCase().includes(search) ||
      workspace.role.toLowerCase().includes(search)
    );
  });

  ngOnInit(): void {
    this.loadWorkspaces();
  }

  private loadWorkspaces(): void {
    this.workspaceService.getWorkspaces().subscribe({
      error: (error) => {
        console.error('Failed to load workspaces:', error);
        this.toastService.error('Erreur lors du chargement des workspaces');
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

  protected onViewWorkspace(workspace: Workspace): void {
    this.router.navigate(['/workspaces', workspace.workspace_id]);
  }

  protected onCreateWorkspace(): void {
    this.router.navigate(['/workspaces/create']);
  }

  protected onRefresh(): void {
    this.loadWorkspaces();
  }

  protected getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
      'owner': 'Propriétaire',
      'admin': 'Administrateur',
      'member': 'Membre',
      'viewer': 'Observateur'
    };
    return roleMap[role] || role;
  }

  protected getDefaultWorkspacesCount(): number {
    return this.workspaces().filter(w => w.is_default).length;
  }

  protected getOwnedWorkspacesCount(): number {
    return this.workspaces().filter(w => w.is_owner).length;
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }
}