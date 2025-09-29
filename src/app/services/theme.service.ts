import { Injectable, signal, computed, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themeSignal = signal<Theme>('light');
  private readonly animatingSignal = signal(false);

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.themeSignal() === 'dark');
  readonly isLight = computed(() => this.themeSignal() === 'light');
  readonly isAnimating = this.animatingSignal.asReadonly();

  constructor() {
    this.loadThemeFromStorage();
    this.applyThemeToDocument();

    // Effect pour synchroniser avec le document
    effect(() => {
      this.applyThemeToDocument();
    });
  }

  private loadThemeFromStorage(): void {
    const storedTheme = localStorage.getItem('kora-theme') as Theme;
    
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      this.themeSignal.set(storedTheme);
    } else {
      // Détecter le thème système
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.themeSignal.set(systemPrefersDark ? 'dark' : 'light');
    }
  }

  private saveThemeToStorage(theme: Theme): void {
    localStorage.setItem('kora-theme', theme);
  }

  private applyThemeToDocument(): void {
    const html = document.documentElement;
    
    if (this.isDark()) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  async toggleTheme(buttonElement?: HTMLElement): Promise<void> {
    const newTheme = this.isDark() ? 'light' : 'dark';

    // Démarrer l'animation
    this.animatingSignal.set(true);

    // Changer d'abord les couleurs de texte (thème) avant l'animation de background
    this.themeSignal.set(newTheme);
    this.saveThemeToStorage(newTheme);

    // Petit délai pour que les couleurs de texte changent en premier
    await new Promise(resolve => setTimeout(resolve, 50));

    // Si un élément bouton est fourni, créer l'animation de propagation pour le background
    if (buttonElement) {
      await this.createRippleAnimation(buttonElement, newTheme);
    }

    // Terminer l'animation après un délai
    setTimeout(() => {
      this.animatingSignal.set(false);
    }, 500);
  }

  private async createRippleAnimation(buttonElement: HTMLElement, newTheme: Theme): Promise<void> {
    return new Promise((resolve) => {
      const rect = buttonElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculer le rayon pour couvrir tout l'écran
      const maxDistance = Math.sqrt(
        Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)
      );
      
      // Créer l'élément d'animation
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: fixed;
        top: ${centerY}px;
        left: ${centerX}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        background-color: ${newTheme === 'dark' ? '#0f172a' : '#ffffff'};
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0.95;
      `;
      
      document.body.appendChild(ripple);
      
      // Déclencher l'animation
      requestAnimationFrame(() => {
        ripple.style.width = `${maxDistance * 2}px`;
        ripple.style.height = `${maxDistance * 2}px`;
      });
      
      // Nettoyer après l'animation
      setTimeout(() => {
        document.body.removeChild(ripple);
        resolve();
      }, 600);
    });
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    this.saveThemeToStorage(theme);
  }

  getSystemTheme(): Theme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Écouter les changements du thème système
  watchSystemTheme(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('kora-theme')) {
        this.themeSignal.set(e.matches ? 'dark' : 'light');
      }
    });
  }
}