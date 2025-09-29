import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FullscreenService {
  private readonly isFullscreenSignal = signal(false);

  readonly isFullscreen = this.isFullscreenSignal.asReadonly();

  constructor() {
    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    // Écouter les changements d'état fullscreen
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreenSignal.set(!!document.fullscreenElement);
    });

    document.addEventListener('webkitfullscreenchange', () => {
      this.isFullscreenSignal.set(!!(document as any).webkitFullscreenElement);
    });

    document.addEventListener('mozfullscreenchange', () => {
      this.isFullscreenSignal.set(!!(document as any).mozFullScreenElement);
    });

    document.addEventListener('msfullscreenchange', () => {
      this.isFullscreenSignal.set(!!(document as any).msFullscreenElement);
    });
  }

  async toggleFullscreen(): Promise<void> {
    if (this.isFullscreen()) {
      await this.exitFullscreen();
    } else {
      await this.enterFullscreen();
    }
  }

  async enterFullscreen(): Promise<void> {
    try {
      const element = document.documentElement;

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
    } catch (error) {
      console.warn('Erreur lors de l\'activation du mode plein écran:', error);
    }
  }

  async exitFullscreen(): Promise<void> {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.warn('Erreur lors de la sortie du mode plein écran:', error);
    }
  }

  isFullscreenAvailable(): boolean {
    return !!(
      document.documentElement.requestFullscreen ||
      (document.documentElement as any).webkitRequestFullscreen ||
      (document.documentElement as any).mozRequestFullScreen ||
      (document.documentElement as any).msRequestFullscreen
    );
  }
}