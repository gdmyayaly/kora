import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-dropdown',
  imports: [CommonModule],
  templateUrl: './notification-dropdown.component.html',
  styleUrl: './notification-dropdown.component.css'
})
export class NotificationDropdownComponent {
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  protected readonly isOpen = signal(false);

  // Outputs pour communiquer avec le parent
  readonly onViewAll = output<void>();
  readonly onClose = output<void>();

  protected readonly notifications = this.notificationService.recentNotifications;
  protected readonly unreadCount = this.notificationService.unreadCount;

  protected toggleDropdown(): void {
    this.isOpen.update(open => !open);
    if (!this.isOpen()) {
      this.onClose.emit();
    }
  }

  protected closeDropdown(): void {
    this.isOpen.set(false);
    this.onClose.emit();
  }

  protected onNotificationClick(notification: Notification): void {
    // Marquer comme lu
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
    }

    // Naviguer vers l'action si disponible
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }

    this.closeDropdown();
  }

  protected onMarkAsRead(event: Event, notificationId: string): void {
    event.stopPropagation();
    this.notificationService.markAsRead(notificationId);
  }

  protected onRemoveNotification(event: Event, notificationId: string): void {
    event.stopPropagation();
    this.notificationService.removeNotification(notificationId);
  }

  protected onMarkAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  protected onViewAllNotifications(): void {
    this.onViewAll.emit();
    this.closeDropdown();
  }

  protected getNotificationIcon(notification: Notification): string {
    return notification.icon || this.notificationService.getIconForType(notification.type);
  }

  protected getNotificationColor(notification: Notification): string {
    return this.notificationService.getColorForType(notification.type);
  }

  protected formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) {
      return 'À l\'instant';
    } else if (diffMinutes < 60) {
      return `Il y a ${diffMinutes}min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    }
  }
}