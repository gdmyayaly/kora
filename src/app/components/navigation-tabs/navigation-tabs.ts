import { Component, signal, inject, ElementRef, ViewChild, AfterViewInit, OnDestroy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TabItem } from '../dual-header-layout/tabs.interface';

@Component({
  selector: 'app-navigation-tabs',
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation-tabs.html',
  styleUrl: './navigation-tabs.css'
})
export class NavigationTabsComponent implements AfterViewInit, OnDestroy {
  private router = inject(Router);

  @ViewChild('tabsContainer', { static: true }) tabsContainer!: ElementRef<HTMLDivElement>;

  // Inputs
  readonly tabs = input.required<TabItem[]>();
  readonly showMobileMenu = input<boolean>(false);

  // Outputs
  readonly onMobileTabClick = output<string>();
  readonly onMobileSubMenuClick = output<void>();
  readonly onMobileMenuClose = output<void>();

  protected readonly activeTab = signal('dashboard');
  protected readonly activeSubMenu = signal<string | null>(null);
  protected readonly hoveredTab = signal<string | null>(null);
  protected readonly dropdownPosition = signal<{ left: string; top: string; width: string } | null>(null);
  protected readonly clickedTab = signal<string | null>(null);
  protected readonly expandedMobileTab = signal<string | null>(null);

  private hoverTimeout: any = null;

  ngAfterViewInit(): void {
    // Détecter la route active au démarrage
    this.updateActiveTabFromRoute();

    // Écouter les changements de route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveTabFromRoute();
      });

    // Écouter les clics globaux pour fermer les dropdowns
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  private onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Fermer les dropdowns de navigation si le clic est en dehors
    if (!target.closest('.dual-header-dropdown') && !target.closest('nav')) {
      this.clickedTab.set(null);
      this.hoveredTab.set(null);
      this.dropdownPosition.set(null);
    }
  }

  protected onTabClick(tabId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    const tabElement = target.closest('div');

    if (tabElement) {
      this.calculateDropdownPosition(tabElement as HTMLElement);

      // Toggle le dropdown au clic
      if (this.clickedTab() === tabId) {
        this.clickedTab.set(null);
        this.dropdownPosition.set(null);
      } else {
        this.clickedTab.set(tabId);
        this.hoveredTab.set(tabId);
      }
    }
  }

  protected onTabHover(tabId: string, event: Event): void {
    // Si un dropdown est déjà ouvert par clic, ne pas interférer
    if (this.clickedTab()) return;

    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    const target = event.target as HTMLElement;
    const tabElement = target.closest('div, a');

    if (tabElement) {
      this.calculateDropdownPosition(tabElement as HTMLElement);
      this.hoveredTab.set(tabId);
    }
  }

  protected onTabLeave(): void {
    // Si un dropdown est ouvert par clic, ne pas le fermer au hover leave
    if (this.clickedTab()) return;

    this.hoverTimeout = setTimeout(() => {
      this.hoveredTab.set(null);
      this.dropdownPosition.set(null);
    }, 400);
  }

  protected onDropdownHover(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
  }

  protected onDropdownLeave(): void {
    this.hoverTimeout = setTimeout(() => {
      this.hoveredTab.set(null);
      this.dropdownPosition.set(null);
    }, 400);
  }

  private calculateDropdownPosition(buttonElement: HTMLElement): void {
    const rect = buttonElement.getBoundingClientRect();

    this.dropdownPosition.set({
      left: `${rect.left}px`,
      top: `${rect.bottom + 4}px`,
      width: `${Math.max(200, rect.width)}px`
    });
  }

  protected shouldShowDropdown(tabId: string): boolean {
    return this.hoveredTab() === tabId || this.clickedTab() === tabId;
  }

  protected isTabActive(tabId: string): boolean {
    const tab = this.tabs().find(t => t.id === tabId);
    if (tab?.subMenus && tab.subMenus.length > 0) {
      return this.activeTab() === tabId && this.activeSubMenu() !== null;
    }
    return this.activeTab() === tabId;
  }


  private updateActiveTabFromRoute(): void {
    const url = this.router.url;
    const pathSegments = url.split('/').filter(segment => segment);

    // Cas spécial pour la route racine
    if (pathSegments.length === 0) {
      this.activeTab.set('dashboard');
      this.activeSubMenu.set(null);
      return;
    }

    // Chercher dans tous les sous-menus de tous les onglets
    for (const tab of this.tabs()) {
      if (tab.subMenus) {
        const subMenuPath = '/' + pathSegments.join('/');
        const matchedSubMenu = tab.subMenus.find(subMenu => subMenu.link === subMenuPath);
        if (matchedSubMenu) {
          this.activeTab.set(tab.id);
          this.activeSubMenu.set(matchedSubMenu.id);
          return;
        }
      }
    }

    // Si pas de sous-menu trouvé, chercher un onglet direct (sans sous-menus)
    const mainSegment = pathSegments[0];
    const matchedTab = this.tabs().find(tab => tab.id === mainSegment && (!tab.subMenus || tab.subMenus.length === 0));
    if (matchedTab) {
      this.activeTab.set(matchedTab.id);
      this.activeSubMenu.set(null);
    } else {
      // Route par défaut si rien ne correspond
      this.activeTab.set('dashboard');
      this.activeSubMenu.set(null);
    }
  }

  protected onMobileTabClickHandler(tabId: string): void {
    // Toggle l'expansion des sous-menus
    if (this.expandedMobileTab() === tabId) {
      this.expandedMobileTab.set(null);
    } else {
      this.expandedMobileTab.set(tabId);
    }
    this.onMobileTabClick.emit(tabId);
  }

  protected onMobileSubMenuClickHandler(): void {
    this.expandedMobileTab.set(null);
    this.onMobileSubMenuClick.emit();
  }

  protected onBackdropClick(): void {
    this.onMobileMenuClose.emit();
  }
}