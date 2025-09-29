import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MainHeaderComponent } from '../main-header/main-header';
import { NavigationTabsComponent } from '../navigation-tabs/navigation-tabs';
import { TabItem } from './tabs.interface';

@Component({
  selector: 'app-dual-header-layout',
  imports: [CommonModule, RouterOutlet, MainHeaderComponent, NavigationTabsComponent],
  templateUrl: './dual-header-layout.html',
  styleUrl: './dual-header-layout.css'
})
export class DualHeaderLayout {
  protected readonly showMobileMenu = signal(false);
  protected readonly expandedMobileTab = signal<string | null>(null);

  protected readonly tabs = signal<TabItem[]>([
    {
      id: 'dashboard',
      title: 'Accueil',
      icon: 'fas fa-home'
    },
    {
      id: 'achats',
      title: 'Achats',
      icon: 'fas fa-shopping-cart',
      subMenus: [
        { id: 'fournisseurs', name: 'Fournisseurs', icon: 'fas fa-truck', link: '/achats/fournisseurs' },
        { id: 'factures-achat', name: 'Factures d\'achat', icon: 'fas fa-file-invoice-dollar', link: '/achats/factures-achat' },
        { id: 'notes-frais', name: 'Notes de frais', icon: 'fas fa-receipt', link: '/achats/notes-frais' },
      ]
    },
    {
      id: 'ventes',
      title: 'Ventes',
      icon: 'fas fa-chart-line',
      subMenus: [
        { id: 'clients', name: 'Clients', icon: 'fas fa-users', link: '/ventes/clients' },
        { id: 'factures-vente', name: 'Factures de vente', icon: 'fas fa-file-invoice', link: '/ventes/factures-vente' },
        { id: 'nouvelle-facture', name: 'Nouvelle facture', icon: 'fas fa-plus-circle', link: '/ventes/nouvelle-facture' },
        { id: 'articles', name: 'Articles', icon: 'fas fa-boxes', link: '/ventes/articles' }
      ]
    },
    {
      id: 'salaires',
      title: 'Salaires',
      icon: 'fas fa-money-bill-wave',
      subMenus: [
        { id: 'employes', name: 'Employés', icon: 'fas fa-user-tie', link: '/salaires/employes' },
        { id: 'paies-mensuelles', name: 'Paies mensuelles', icon: 'fas fa-calendar-alt', link: '/salaires/paies-mensuelles' },
        { id: 'bulletins', name: 'Bulletins de paie', icon: 'fas fa-file-alt', link: '/salaires/bulletins' },
        { id: 'statistiques-salaires', name: 'Statistiques', icon: 'fas fa-chart-bar', link: '/salaires/statistiques' }
      ]
    },
    {
      id: 'declarations',
      title: 'Déclarations',
      icon: 'fas fa-clipboard-list',
      subMenus: [
        { id: 'calendrier-declarations', name: 'Calendrier', icon: 'fas fa-calendar-alt', link: '/declarations/calendrier' },
        { id: 'liste-declarations', name: 'Liste des déclarations', icon: 'fas fa-list-ul', link: '/declarations/liste' },
      ]
    },
    {
      id: 'comptabilite',
      title: 'Comptabilité',
      icon: 'fas fa-calculator',
      subMenus: [
        { id: 'journal-achats', name: 'Journal des achats', icon: 'fas fa-book', link: '/comptabilite/journal-achats' },
        { id: 'journal-ventes', name: 'Journal des ventes', icon: 'fas fa-book-open', link: '/comptabilite/journal-ventes' },
        { id: 'journal-salaires', name: 'Journal des salaires', icon: 'fas fa-bookmark', link: '/comptabilite/journal-salaires' },
      ]
    },
    {
      id: 'users',
      title: 'Utilisateurs',
      icon: 'fas fa-users'
    },
    {
      id: 'companies',
      title: 'Entreprises',
      icon: 'fas fa-building'
    },
    {
      id: 'workspaces',
      title: 'Espaces de travail',
      icon: 'fas fa-layer-group'
    }
  ]);

  protected onMobileMenuToggle(): void {
    this.showMobileMenu.update(show => !show);
  }

  protected onMobileTabClick(tabId: string): void {
    this.expandedMobileTab.update(current => current === tabId ? null : tabId);
  }

  protected onMobileSubMenuClick(): void {
    this.showMobileMenu.set(false);
    this.expandedMobileTab.set(null);
  }

  protected onMobileMenuClose(): void {
    this.showMobileMenu.set(false);
    this.expandedMobileTab.set(null);
  }

  protected onViewAllNotifications(): void {
    // Navigation vers les notifications
  }

  protected onNotificationClose(): void {
    // Logique de fermeture
  }
}