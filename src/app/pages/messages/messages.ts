import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Message {
  id: string;
  subject: string;
  content: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  timestamp: Date;
  read: boolean;
  important: boolean;
  category: 'inbox' | 'sent' | 'draft' | 'archive';
  attachments?: { name: string; size: number; type: string; }[];
}

@Component({
  selector: 'app-messages',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Messages {
  private fb = FormBuilder;

  protected readonly selectedCategory = signal<'inbox' | 'sent' | 'draft' | 'archive'>('inbox');
  protected readonly selectedMessage = signal<Message | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly showCompose = signal(false);

  protected readonly messages = signal<Message[]>([
    {
      id: '1',
      subject: 'Validation de la facture #2024-001',
      content: 'Bonjour,\n\nPouvez-vous valider la facture #2024-001 pour le client ABC Corp ? Le montant est de 1 250,00 €.\n\nMerci',
      sender: {
        id: '1',
        name: 'Marie Dupont',
        email: 'marie.dupont@kora.com'
      },
      timestamp: new Date(2024, 8, 27, 10, 30),
      read: false,
      important: true,
      category: 'inbox'
    },
    {
      id: '2',
      subject: 'Rapport mensuel des ventes',
      content: 'Voici le rapport mensuel des ventes pour septembre 2024.\n\nPoints clés :\n- Chiffre d\'affaires : 45 000 €\n- Nombre de factures : 23\n- Clients actifs : 15',
      sender: {
        id: '2',
        name: 'Pierre Martin',
        email: 'pierre.martin@kora.com'
      },
      timestamp: new Date(2024, 8, 26, 14, 15),
      read: true,
      important: false,
      category: 'inbox',
      attachments: [
        { name: 'rapport-ventes-sept-2024.pdf', size: 245000, type: 'application/pdf' }
      ]
    },
    {
      id: '3',
      subject: 'Demande de formation comptabilité',
      content: 'Bonjour,\n\nJe souhaiterais suivre une formation sur les nouvelles normes comptables. Pourriez-vous m\'indiquer les formations disponibles ?\n\nCordialement',
      sender: {
        id: '3',
        name: 'Sophie Bernard',
        email: 'sophie.bernard@kora.com'
      },
      timestamp: new Date(2024, 8, 25, 9, 45),
      read: true,
      important: false,
      category: 'inbox'
    },
    {
      id: '4',
      subject: 'Confirmation envoi documents',
      content: 'Les documents ont bien été envoyés au client. En attente de retour.',
      sender: {
        id: 'me',
        name: 'Vous',
        email: 'vous@kora.com'
      },
      timestamp: new Date(2024, 8, 24, 16, 20),
      read: true,
      important: false,
      category: 'sent'
    }
  ]);

  protected readonly filteredMessages = computed(() => {
    const category = this.selectedCategory();
    const query = this.searchQuery().toLowerCase();

    return this.messages()
      .filter(m => m.category === category)
      .filter(m =>
        query === '' ||
        m.subject.toLowerCase().includes(query) ||
        m.sender.name.toLowerCase().includes(query) ||
        m.content.toLowerCase().includes(query)
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  });

  protected readonly unreadCount = computed(() =>
    this.messages().filter(m => !m.read && m.category === 'inbox').length
  );

  protected readonly categories = [
    { value: 'inbox' as const, label: 'Boîte de réception', icon: 'fas fa-inbox' },
    { value: 'sent' as const, label: 'Envoyés', icon: 'fas fa-paper-plane' },
    { value: 'draft' as const, label: 'Brouillons', icon: 'fas fa-edit' },
    { value: 'archive' as const, label: 'Archives', icon: 'fas fa-archive' }
  ];

  protected setCategory(category: 'inbox' | 'sent' | 'draft' | 'archive'): void {
    this.selectedCategory.set(category);
    this.selectedMessage.set(null);
  }

  protected selectMessage(message: Message): void {
    this.selectedMessage.set(message);
    if (!message.read && message.category === 'inbox') {
      this.markAsRead(message.id);
    }
  }

  protected markAsRead(messageId: string): void {
    this.messages.update(messages =>
      messages.map(m =>
        m.id === messageId ? { ...m, read: true } : m
      )
    );
  }

  protected markAsImportant(messageId: string): void {
    this.messages.update(messages =>
      messages.map(m =>
        m.id === messageId ? { ...m, important: !m.important } : m
      )
    );
  }

  protected deleteMessage(messageId: string): void {
    this.messages.update(messages =>
      messages.filter(m => m.id !== messageId)
    );

    if (this.selectedMessage()?.id === messageId) {
      this.selectedMessage.set(null);
    }
  }

  protected archiveMessage(messageId: string): void {
    this.messages.update(messages =>
      messages.map(m =>
        m.id === messageId ? { ...m, category: 'archive' as const } : m
      )
    );

    if (this.selectedMessage()?.id === messageId) {
      this.selectedMessage.set(null);
    }
  }

  protected formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
      return 'Hier';
    } else {
      return timestamp.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  protected getInitials(name: string): string {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  }

  protected onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  protected openCompose(): void {
    this.showCompose.set(true);
  }

  protected closeCompose(): void {
    this.showCompose.set(false);
  }
}