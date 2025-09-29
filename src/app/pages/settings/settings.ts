import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-foreground mb-2">Paramètres</h1>
        <p class="text-muted-foreground">Configurez votre application</p>
      </div>

      <div class="bg-card rounded-lg border p-6">
        <h2 class="text-xl font-semibold mb-4">Page en cours de développement</h2>
        <p class="text-muted-foreground">Cette page sera bientôt disponible avec toutes les options de configuration.</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Settings {}