import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css'
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);

  protected readonly toasts = this.toastService.toastList;
  private readonly animatingToasts = signal<Set<string>>(new Set());

  protected readonly animatingToastsList = this.animatingToasts.asReadonly();

  protected readonly toastsWithAnimation = computed(() => {
    return this.toasts().map(toast => ({
      ...toast,
      isAnimating: this.animatingToasts().has(toast.id)
    }));
  });

  protected onDismiss(toastId: string): void {
    // Commencer l'animation de sortie
    this.animatingToasts.update(set => new Set([...set, toastId]));

    // Supprimer le toast après l'animation
    setTimeout(() => {
      this.toastService.dismiss(toastId);
      this.animatingToasts.update(set => {
        const newSet = new Set(set);
        newSet.delete(toastId);
        return newSet;
      });
    }, 300); // Durée de l'animation de sortie
  }

  protected getToastIcon(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-triangle';
      case 'warning':
        return 'fas fa-exclamation-circle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-info-circle';
    }
  }

  protected getToastClasses(toast: Toast): string {
    const baseClasses = 'toast-item flex items-start gap-3 p-4 rounded-lg shadow-lg border max-w-sm transition-all duration-300';

    const typeClasses = {
      success: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
      error: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
      warning: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800',
      info: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
    };

    const animationClass = this.animatingToasts().has(toast.id)
      ? 'toast-exit'
      : 'toast-enter';

    return `${baseClasses} ${typeClasses[toast.type]} ${animationClass}`;
  }

  protected getIconClasses(type: Toast['type']): string {
    const iconClasses = {
      success: 'text-green-600 dark:text-green-400',
      error: 'text-red-600 dark:text-red-400',
      warning: 'text-orange-600 dark:text-orange-400',
      info: 'text-blue-600 dark:text-blue-400'
    };

    return iconClasses[type];
  }

  protected onToastMouseEnter(toastId: string): void {
    this.toastService.pauseTimer(toastId);
  }

  protected onToastMouseLeave(toastId: string): void {
    this.toastService.resumeTimer(toastId);
  }
}