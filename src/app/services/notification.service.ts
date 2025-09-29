import { Injectable, signal, computed } from '@angular/core';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notificationsSignal = signal<Notification[]>([
    {
      id: '1',
      title: 'Nouveau projet assigné',
      message: 'Le projet "Application Mobile" vous a été assigné par Marie Dubois',
      type: 'info',
      read: false,
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      actionUrl: '/projects/mobile-app',
      actionLabel: 'Voir le projet',
      icon: 'fas fa-project-diagram'
    },
    {
      id: '2',
      title: 'Réunion dans 30 minutes',
      message: 'Réunion d\'équipe hebdomadaire dans la salle de conférence A',
      type: 'warning',
      read: false,
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      actionUrl: '/calendar/meeting-123',
      actionLabel: 'Rejoindre',
      icon: 'fas fa-calendar'
    },
    {
      id: '3',
      title: 'Mise à jour système',
      message: 'Le système sera mis à jour ce soir à 22h00. Sauvegardez votre travail.',
      type: 'info',
      read: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: 'fas fa-server'
    },
    {
      id: '4',
      title: 'Tâche terminée',
      message: 'La tâche "Conception UI Dashboard" a été marquée comme terminée',
      type: 'success',
      read: true,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      actionUrl: '/tasks/ui-dashboard',
      actionLabel: 'Voir détails',
      icon: 'fas fa-check-circle'
    },
    {
      id: '5',
      title: 'Erreur de déploiement',
      message: 'Le déploiement en production a échoué. Vérifiez les logs.',
      type: 'error',
      read: false,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      actionUrl: '/deployment/logs',
      actionLabel: 'Voir logs',
      icon: 'fas fa-exclamation-triangle'
    }
  ]);

  readonly notifications = this.notificationsSignal.asReadonly();

  readonly unreadCount = computed(() =>
    this.notifications().filter(n => !n.read).length
  );

  readonly recentNotifications = computed(() =>
    this.notifications()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5)
  );

  readonly unreadNotifications = computed(() =>
    this.notifications().filter(n => !n.read)
  );

  markAsRead(notificationId: string): void {
    this.notificationsSignal.update(notifications =>
      notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }

  markAllAsRead(): void {
    this.notificationsSignal.update(notifications =>
      notifications.map(n => ({ ...n, read: true }))
    );
  }

  removeNotification(notificationId: string): void {
    this.notificationsSignal.update(notifications =>
      notifications.filter(n => n.id !== notificationId)
    );
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    this.notificationsSignal.update(notifications => [
      newNotification,
      ...notifications
    ]);
  }

  getNotificationById(id: string): Notification | undefined {
    return this.notifications().find(n => n.id === id);
  }

  getNotificationsByType(type: Notification['type']): Notification[] {
    return this.notifications().filter(n => n.type === type);
  }

  clearAllNotifications(): void {
    this.notificationsSignal.set([]);
  }

  getIconForType(type: Notification['type']): string {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'error':
        return 'fas fa-times-circle';
      case 'info':
      default:
        return 'fas fa-info-circle';
    }
  }

  getColorForType(type: Notification['type']): string {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  }
}