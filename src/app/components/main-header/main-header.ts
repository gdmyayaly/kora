import { Component, signal, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { FullscreenService } from '../../services/fullscreen.service';
import { AuthService } from '../../services/auth.service';
import { CompanyService } from '../../services/company.service';
import { WorkspaceService } from '../../services/workspace.service';
import { NotificationDropdownComponent } from '../ui/notification-dropdown/notification-dropdown.component';
import { CompanySelectorComponent } from '../ui/company-selector/company-selector.component';
import { WorkspaceSelectorComponent } from '../ui/workspace-selector/workspace-selector.component';

@Component({
  selector: 'app-main-header',
  imports: [CommonModule, RouterModule, NotificationDropdownComponent, CompanySelectorComponent, WorkspaceSelectorComponent],
  templateUrl: './main-header.html',
  styleUrl: './main-header.css'
})
export class MainHeaderComponent {
  private router = inject(Router);
  protected themeService = inject(ThemeService);
  protected fullscreenService = inject(FullscreenService);
  protected authService = inject(AuthService);
  protected companyService = inject(CompanyService);
  protected workspaceService = inject(WorkspaceService);

  protected readonly showUserDropdown = signal(false);
  protected readonly showMobileMenu = signal(false);
  protected readonly forceCloseCompanySelector = signal(false);
  protected readonly forceCloseWorkspaceSelector = signal(false);

  // Outputs pour communiquer avec le parent
  readonly onMobileMenuToggle = output<void>();
  readonly onViewAllNotifications = output<void>();
  readonly onNotificationClose = output<void>();

  ngOnInit(): void {
    // Charger les workspaces au démarrage
    this.workspaceService.getWorkspaces().subscribe({
      error: (error) => {
        console.error('Failed to load workspaces:', error);
      }
    });

    // Charger les entreprises au démarrage
    this.companyService.getCompanies().subscribe({
      error: (error) => {
        console.error('Failed to load companies:', error);
      }
    });

    // Charger les données utilisateur si nécessaire
    this.authService.loadUserDataIfNeeded();
  }

  protected onMobileMenuClick(): void {
    this.showMobileMenu.update(show => !show);
    this.onMobileMenuToggle.emit();
  }

  protected async onToggleTheme(event: Event): Promise<void> {
    const button = event.currentTarget as HTMLElement;
    await this.themeService.toggleTheme(button);
  }

  protected async onToggleFullscreen(): Promise<void> {
    await this.fullscreenService.toggleFullscreen();
  }

  protected onUserDropdownToggle(): void {
    this.showUserDropdown.update(show => !show);
    // Fermer les autres dropdowns quand on ouvre le user dropdown
    if (this.showUserDropdown()) {
      this.closeAllSelectorDropdowns();
    }
  }

  protected onCompanySelectorToggle(isOpen: boolean): void {
    if (isOpen) {
      // Fermer workspace selector et user dropdown
      this.forceCloseWorkspaceSelector.set(true);
      this.showUserDropdown.set(false);
      // Reset du signal pour la prochaine fois
      setTimeout(() => this.forceCloseWorkspaceSelector.set(false), 0);
    }
  }

  protected onWorkspaceSelectorToggle(isOpen: boolean): void {
    if (isOpen) {
      // Fermer company selector et user dropdown
      this.forceCloseCompanySelector.set(true);
      this.showUserDropdown.set(false);
      // Reset du signal pour la prochaine fois
      setTimeout(() => this.forceCloseCompanySelector.set(false), 0);
    }
  }

  private closeAllSelectorDropdowns(): void {
    this.forceCloseCompanySelector.set(true);
    this.forceCloseWorkspaceSelector.set(true);
    // Reset des signaux pour la prochaine fois
    setTimeout(() => {
      this.forceCloseCompanySelector.set(false);
      this.forceCloseWorkspaceSelector.set(false);
    }, 0);
  }

  protected onNavigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.showUserDropdown.set(false);
  }

  protected onNavigateToPayment(): void {
    this.router.navigate(['/paiement']);
  }

  protected async onLogout(): Promise<void> {
    this.authService.logout();
  }

  protected onViewAllNotificationsClick(): void {
    this.onViewAllNotifications.emit();
  }

  protected onNotificationCloseClick(): void {
    this.onNotificationClose.emit();
  }

  protected isTrialUser(): boolean {
    const user = this.authService.user();
    return user?.subscriptionStatus === 'trial';
  }

  protected getTrialExpirationDate(): string {
    const user = this.authService.user();
    if (!user?.subscriptionExpiresAt) return '';

    const expirationDate = new Date(user.subscriptionExpiresAt);
    return expirationDate.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}