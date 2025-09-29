import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  category: 'system' | 'sales' | 'purchases' | 'payroll' | 'accounting';
  actionUrl?: string;
}

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Notifications {
  protected readonly selectedFilter = signal<'all' | 'unread' | 'system' | 'sales' | 'purchases' | 'payroll' | 'accounting'>('all');

  protected readonly notifications = signal<Notification[]>([
    {
      id: '1',
      title: 'Nouvelle facture créée',
      message: 'La facture #2024-001 a été créée avec succès pour le client ABC Corp.',
      type: 'success',
      timestamp: new Date(2024, 8, 27, 10, 30),
      read: false,
      category: 'sales',
      actionUrl: '/ventes/factures-vente'
    },
    {
      id: '2',
      title: 'Paiement en retard',
      message: 'Le paiement de la facture #2024-015 est en retard de 15 jours.',
      type: 'warning',
      timestamp: new Date(2024, 8, 26, 14, 15),
      read: true,
      category: 'sales'
    },
    {
      id: '3',
      title: 'Mise à jour système',
      message: 'Une nouvelle version de l\'application est disponible avec des améliorations de sécurité.',
      type: 'info',
      timestamp: new Date(2024, 8, 25, 9, 0),
      read: false,
      category: 'system'
    },
    {
      id: '4',
      title: 'Échéance déclaration TVA',
      message: 'La déclaration de TVA pour le mois de septembre doit être déposée avant le 20 octobre.',
      type: 'warning',
      timestamp: new Date(2024, 8, 24, 16, 45),
      read: true,
      category: 'accounting'
    },
    {
      id: '5',
      title: 'Nouveau fournisseur ajouté',
      message: 'Le fournisseur "Matériaux Pro" a été ajouté à votre base de données.',
      type: 'info',
      timestamp: new Date(2024, 8, 23, 11, 20),
      read: true,
      category: 'purchases'
    },
    {
      id: '6',
      title: 'Traitement paie terminé',
      message: 'Le traitement de la paie pour le mois de septembre est terminé pour 15 employés.',
      type: 'success',
      timestamp: new Date(2024, 8, 22, 17, 30),
      read: false,
      category: 'payroll'
    }
  ]);

  protected readonly filteredNotifications = computed(() => {
    const filter = this.selectedFilter();
    const notifications = this.notifications();

    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.category === filter);
  });

  protected readonly unreadCount = computed(() =>
    this.notifications().filter(n => !n.read).length
  );

  protected readonly filters = [
    { value: 'all' as const, label: 'Toutes', icon: 'fas fa-list' },
    { value: 'unread' as const, label: 'Non lues', icon: 'fas fa-envelope' },
    { value: 'system' as const, label: 'Système', icon: 'fas fa-cog' },
    { value: 'sales' as const, label: 'Ventes', icon: 'fas fa-chart-line' },
    { value: 'purchases' as const, label: 'Achats', icon: 'fas fa-shopping-cart' },
    { value: 'payroll' as const, label: 'Paie', icon: 'fas fa-money-bill-wave' },
    { value: 'accounting' as const, label: 'Comptabilité', icon: 'fas fa-calculator' }
  ];

  protected setFilter(filter: 'all' | 'unread' | 'system' | 'sales' | 'purchases' | 'payroll' | 'accounting'): void {
    this.selectedFilter.set(filter);
  }

  protected markAsRead(notificationId: string): void {
    this.notifications.update(notifications =>
      notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }

  protected markAllAsRead(): void {
    this.notifications.update(notifications =>
      notifications.map(n => ({ ...n, read: true }))
    );
  }

  protected deleteNotification(notificationId: string): void {
    this.notifications.update(notifications =>
      notifications.filter(n => n.id !== notificationId)
    );
  }

  protected getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'error': return 'fas fa-times-circle';
      default: return 'fas fa-info-circle';
    }
  }

  protected getNotificationColor(type: Notification['type']): string {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-blue-500';
    }
  }

  protected formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'À l\'instant';
  }
}