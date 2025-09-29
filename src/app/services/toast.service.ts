import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

interface ToastTimer {
  timeoutId: ReturnType<typeof setTimeout> | null;
  remainingTime: number;
  startTime: number;
  isPaused: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  private toastCounter = 0;
  private timers = new Map<string, ToastTimer>();

  readonly toastList = this.toasts.asReadonly();

  show(toast: Omit<Toast, 'id'>): string {
    const id = `toast-${++this.toastCounter}`;
    const newToast: Toast = {
      id,
      duration: 10000,
      dismissible: true,
      ...toast
    };

    this.toasts.update(toasts => [...toasts, newToast]);

    // Auto-dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      this.startTimer(id, newToast.duration);
    }

    return id;
  }

  success(title: string, message?: string, duration?: number): string {
    return this.show({
      type: 'success',
      title,
      message,
      duration
    });
  }

  error(title: string, message?: string, duration?: number): string {
    return this.show({
      type: 'error',
      title,
      message,
      duration: duration || 12000 // Erreurs affichées plus longtemps
    });
  }

  warning(title: string, message?: string, duration?: number): string {
    return this.show({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  info(title: string, message?: string, duration?: number): string {
    return this.show({
      type: 'info',
      title,
      message,
      duration
    });
  }

  dismiss(id: string): void {
    this.clearTimer(id);
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  dismissAll(): void {
    this.timers.forEach((_, id) => this.clearTimer(id));
    this.toasts.set([]);
  }

  pauseTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer && !timer.isPaused && timer.timeoutId) {
      clearTimeout(timer.timeoutId);
      timer.remainingTime = timer.remainingTime - (Date.now() - timer.startTime);
      timer.isPaused = true;
      timer.timeoutId = null;
    }
  }

  resumeTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer && timer.isPaused && timer.remainingTime > 0) {
      timer.isPaused = false;
      timer.startTime = Date.now();
      timer.timeoutId = setTimeout(() => {
        this.dismiss(id);
      }, timer.remainingTime);
    }
  }

  private startTimer(id: string, duration: number): void {
    const timer: ToastTimer = {
      timeoutId: setTimeout(() => {
        this.dismiss(id);
      }, duration),
      remainingTime: duration,
      startTime: Date.now(),
      isPaused: false
    };
    this.timers.set(id, timer);
  }

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer && timer.timeoutId) {
      clearTimeout(timer.timeoutId);
    }
    this.timers.delete(id);
  }
}