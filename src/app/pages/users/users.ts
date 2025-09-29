import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  avatar?: string;
}

@Component({
  selector: 'app-users',
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class UsersComponent {
  private toastService = inject(ToastService);

  protected readonly searchTerm = signal('');
  protected readonly viewMode = signal<'grid' | 'list'>('grid');
  protected readonly selectedRole = signal<'all' | 'admin' | 'user' | 'manager'>('all');
  protected readonly isLoading = signal(false);

  // Données mock pour la démonstration
  protected readonly users = signal<User[]>([
    {
      id: '1',
      firstName: 'Amadou',
      lastName: 'Diop',
      email: 'amadou.diop@example.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15'
    },
    {
      id: '2',
      firstName: 'Fatou',
      lastName: 'Sall',
      email: 'fatou.sall@example.com',
      role: 'user',
      status: 'active',
      lastLogin: '2024-01-14'
    },
    {
      id: '3',
      firstName: 'Moussa',
      lastName: 'Ba',
      email: 'moussa.ba@example.com',
      role: 'manager',
      status: 'inactive',
      lastLogin: '2024-01-10'
    }
  ]);

  protected readonly filteredUsers = computed(() => {
    const users = this.users();
    const search = this.searchTerm().toLowerCase();
    const role = this.selectedRole();

    let filtered = users;

    // Filtre par rôle
    if (role !== 'all') {
      filtered = filtered.filter(user => user.role === role);
    }

    // Filtre par recherche
    if (search) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    // Simulation d'un appel API
    setTimeout(() => {
      this.isLoading.set(false);
      this.toastService.success('Utilisateurs chargés avec succès');
    }, 1000);
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  protected onRoleFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedRole.set(target.value as 'all' | 'admin' | 'user' | 'manager');
  }

  protected onViewModeChange(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  protected onCreateUser(): void {
    this.toastService.info('Fonctionnalité de création d\'utilisateur à implémenter');
  }

  protected onEditUser(user: User): void {
    this.toastService.info(`Modification de ${user.firstName} ${user.lastName} à implémenter`);
  }

  protected onDeleteUser(user: User): void {
    this.toastService.warning(`Suppression de ${user.firstName} ${user.lastName} à implémenter`);
  }

  protected onToggleUserStatus(user: User): void {
    const newStatus: 'active' | 'inactive' = user.status === 'active' ? 'inactive' : 'active';
    const updatedUsers = this.users().map(u =>
      u.id === user.id ? { ...u, status: newStatus } : u
    );
    this.users.set(updatedUsers);
    this.toastService.success(`Statut de ${user.firstName} ${user.lastName} mis à jour`);
  }

  protected onRefresh(): void {
    this.loadUsers();
  }

  protected getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      user: 'Utilisateur',
      manager: 'Gestionnaire'
    };
    return labels[role] || role;
  }

  protected getStatusLabel(status: string): string {
    return status === 'active' ? 'Actif' : 'Inactif';
  }

  protected getUserInitials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
}