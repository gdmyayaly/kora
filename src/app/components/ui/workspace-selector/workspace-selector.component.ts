import { Component, signal, inject, output, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkspaceService } from '../../../services/workspace.service';
import { ToastService } from '../../../services/toast.service';
import { Workspace } from '../../../interfaces/workspace.interface';

@Component({
  selector: 'app-workspace-selector',
  imports: [CommonModule],
  templateUrl: './workspace-selector.component.html',
  styleUrl: './workspace-selector.component.css'
})
export class WorkspaceSelectorComponent {
  private workspaceService = inject(WorkspaceService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  protected readonly showDropdown = signal(false);

  // Inputs et outputs
  readonly forceClose = input(false);
  readonly onDropdownToggle = output<boolean>();

  // Accès aux signaux du service
  protected readonly workspaces = this.workspaceService.workspaces;
  protected readonly selectedWorkspace = this.workspaceService.selectedWorkspace;
  protected readonly isLoading = this.workspaceService.isLoading;

  constructor() {
    // Observer les changements de forceClose avec effect
    effect(() => {
      if (this.forceClose() && this.showDropdown()) {
        this.showDropdown.set(false);
      }
    });
  }

  ngOnInit(): void {
    // Charger les workspaces si pas encore fait
    if (!this.workspaceService.hasWorkspaces()) {
      this.workspaceService.getWorkspaces().subscribe();
    }
  }

  protected toggleDropdown(): void {
    const newState = !this.showDropdown();
    this.showDropdown.set(newState);
    this.onDropdownToggle.emit(newState);
  }

  protected onSelectWorkspace(workspace: Workspace): void {
    this.workspaceService.selectWorkspace(workspace);
    this.showDropdown.set(false);
    this.onDropdownToggle.emit(false);
    this.toastService.success(`Workspace "${workspace.name}" sélectionné`);
  }

  protected onCreateWorkspace(): void {
    this.showDropdown.set(false);
    this.onDropdownToggle.emit(false);
    this.router.navigate(['/workspaces/create']);
  }

  protected onViewAllWorkspaces(): void {
    this.showDropdown.set(false);
    this.onDropdownToggle.emit(false);
    this.router.navigate(['/workspaces']);
  }

  protected hasWorkspaces(): boolean {
    return this.workspaceService.hasWorkspaces();
  }

  protected getDisplayName(): string {
    const selected = this.selectedWorkspace();
    if (selected) {
      return selected.name.length > 20 ? selected.name.substring(0, 17) + '...' : selected.name;
    }
    return this.hasWorkspaces() ? 'Sélectionner un workspace' : 'Créer un workspace';
  }

  protected getDisplayIcon(): string {
    return this.hasWorkspaces() ? 'fas fa-users' : 'fas fa-plus';
  }
}