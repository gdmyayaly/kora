import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeclarationsDataService } from '../../../services/declarations-data.service';
import {
  DeclarationCalendarEvent,
  DeclarationMetrics,
  UpcomingDeadline,
  DeclarationType,
  DeclarationStatus,
  DeclarationPriority
} from '../../../interfaces/declarations.interface';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: DeclarationCalendarEvent[];
}

@Component({
  selector: 'app-calendrier-declarations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendrier.html',
  styleUrl: './calendrier.css'
})
export class CalendrierDeclarations implements OnInit {
  private declarationsService = inject(DeclarationsDataService);

  readonly currentDate = signal(new Date());
  readonly calendarView = signal<'month' | 'week'>('month');
  readonly showAnimations = signal(false);
  readonly selectedEvent = signal<DeclarationCalendarEvent | null>(null);

  // Filtres
  readonly selectedType = signal<string>('');
  readonly selectedStatus = signal<string>('');
  readonly selectedPriority = signal<string>('');

  readonly weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  readonly metrics = computed(() => this.declarationsService.metrics());
  readonly calendarEvents = computed(() => this.declarationsService.calendarEvents());

  readonly filteredEvents = computed(() => {
    let events = this.calendarEvents();

    if (this.selectedType()) {
      events = events.filter(e => e.type === this.selectedType());
    }
    if (this.selectedStatus()) {
      events = events.filter(e => e.status === this.selectedStatus());
    }
    if (this.selectedPriority()) {
      events = events.filter(e => e.priority === this.selectedPriority());
    }

    return events;
  });

  readonly upcomingDeadlines = computed(() => {
    const deadlines = this.metrics().upcomingDeadlines;
    return deadlines.slice(0, 5);
  });

  readonly calendarWeeks = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Commencer le lundi
    const startDate = new Date(firstDay);
    const startDayOfWeek = firstDay.getDay();
    const daysToSubtract = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    const weeks: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = this.isSameDay(currentDate, new Date());

      const dayEvents = this.filteredEvents().filter(event =>
        this.isSameDay(new Date(event.dueDate), currentDate)
      );

      currentWeek.push({
        date: currentDate,
        dayNumber: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        events: dayEvents
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    return weeks;
  });

  ngOnInit() {
    // Déclencher les animations après un délai
    setTimeout(() => {
      this.showAnimations.set(true);
    }, 100);
  }

  getCurrentMonthYear(): string {
    const date = this.currentDate();
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  previousMonth() {
    const current = this.currentDate();
    const previous = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    this.currentDate.set(previous);
  }

  nextMonth() {
    const current = this.currentDate();
    const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    this.currentDate.set(next);
  }

  setCalendarView(view: 'month' | 'week') {
    this.calendarView.set(view);
  }

  onFilterChange() {
    // Les computed se mettront à jour automatiquement
  }

  onClearFilters() {
    this.selectedType.set('');
    this.selectedStatus.set('');
    this.selectedPriority.set('');
  }

  onEventClick(event: DeclarationCalendarEvent) {
    this.selectedEvent.set(event);
  }

  closeEventModal() {
    this.selectedEvent.set(null);
  }

  onCreateDeclaration() {
    // TODO: Implémenter la création de déclaration
    console.log('Créer nouvelle déclaration');
  }

  onExportCalendar() {
    // TODO: Implémenter l'export du calendrier
    console.log('Exporter calendrier');
  }

  editDeclaration(declarationId: string) {
    // TODO: Implémenter l'édition de déclaration
    console.log('Éditer déclaration:', declarationId);
    this.closeEventModal();
  }

  getEventClass(event: DeclarationCalendarEvent): string {
    return `status-${event.status.replace(/_/g, '-')}`;
  }

  getEventTime(event: DeclarationCalendarEvent): string {
    const date = new Date(event.dueDate);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }

  getStatusClass(status: DeclarationStatus): string {
    return this.declarationsService.getStatusColor(status);
  }

  getPriorityClass(priority: DeclarationPriority): string {
    return this.declarationsService.getPriorityColor(priority).replace('text-', '');
  }

  getTypeLabel(type: DeclarationType): string {
    return this.declarationsService.getTypeLabel(type);
  }

  getStatusLabel(status: DeclarationStatus): string {
    return this.declarationsService.getStatusLabel(status);
  }

  getPriorityLabel(priority: DeclarationPriority): string {
    return this.declarationsService.getPriorityLabel(priority);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return this.declarationsService.formatCurrency(amount);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}