import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { SalairesDataService } from '../../../services/salaires-data.service';
import { Employee, SalaryMetrics, EmployeeDepartment, EmployeeStatus, ContractType } from '../../../interfaces/salaires.interface';

@Component({
  selector: 'app-employes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './employes.html',
  styleUrl: './employes.css'
})
export class Employes implements OnInit {
  private toastService = inject(ToastService);
  private salairesDataService = inject(SalairesDataService);

  protected readonly searchTerm = signal('');
  protected readonly selectedDepartment = signal<'all' | EmployeeDepartment>('all');
  protected readonly selectedStatus = signal<'all' | EmployeeStatus>('all');
  protected readonly selectedContractType = signal<'all' | ContractType>('all');
  protected readonly viewMode = signal<'grid' | 'list'>('grid');
  protected readonly sortBy = signal<'name' | 'department' | 'position' | 'hireDate' | 'salary'>('name');
  protected readonly sortOrder = signal<'asc' | 'desc'>('asc');
  protected readonly isLoading = signal(false);
  protected readonly employees = signal<Employee[]>([]);

  protected readonly metrics = computed((): SalaryMetrics => {
    return this.salairesDataService.metrics();
  });

  protected readonly filteredEmployees = computed(() => {
    const employees = this.employees();
    const search = this.searchTerm().toLowerCase();
    const department = this.selectedDepartment();
    const status = this.selectedStatus();
    const contractType = this.selectedContractType();
    const sortBy = this.sortBy();
    const sortOrder = this.sortOrder();

    let filtered = employees;

    // Filter by department
    if (department !== 'all') {
      filtered = filtered.filter(employee => employee.department === department);
    }

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(employee => employee.status === status);
    }

    // Filter by contract type
    if (contractType !== 'all') {
      filtered = filtered.filter(employee => employee.contractType === contractType);
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter(employee =>
        employee.firstName.toLowerCase().includes(search) ||
        employee.lastName.toLowerCase().includes(search) ||
        employee.position.toLowerCase().includes(search) ||
        employee.employeeNumber.toLowerCase().includes(search) ||
        employee.email.toLowerCase().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'department':
          aValue = a.department;
          bValue = b.department;
          break;
        case 'position':
          aValue = a.position;
          bValue = b.position;
          break;
        case 'hireDate':
          aValue = new Date(a.hireDate);
          bValue = new Date(b.hireDate);
          break;
        case 'salary':
          aValue = a.baseSalary;
          bValue = b.baseSalary;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  });

  ngOnInit(): void {
    this.loadEmployees();
  }

  private async loadEmployees(): Promise<void> {
    this.isLoading.set(true);
    try {
      const employees = await this.salairesDataService.getEmployees();
      this.employees.set(employees);
      this.toastService.success('Employés chargés avec succès');
    } catch (error) {
      this.toastService.error('Erreur lors du chargement des employés');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  protected onDepartmentFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedDepartment.set(target.value as any);
  }

  protected onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus.set(target.value as any);
  }

  protected onContractTypeFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedContractType.set(target.value as any);
  }

  protected onViewModeChange(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  protected onSort(field: 'name' | 'department' | 'position' | 'hireDate' | 'salary'): void {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
  }

  protected onCreateEmployee(): void {
    this.toastService.info('Fonctionnalité de création d\'employé à implémenter');
  }

  protected onViewEmployee(employee: Employee): void {
    this.toastService.info(`Affichage des détails de ${employee.firstName} ${employee.lastName}`);
  }

  protected onEditEmployee(employee: Employee): void {
    this.toastService.info(`Modification de ${employee.firstName} ${employee.lastName} à implémenter`);
  }

  protected onDeleteEmployee(employee: Employee): void {
    this.toastService.warning(`Suppression de ${employee.firstName} ${employee.lastName} à implémenter`);
  }

  protected onToggleEmployeeStatus(employee: Employee): void {
    const newStatus = employee.isActive ? false : true;
    this.salairesDataService.updateEmployee(employee.id, { isActive: newStatus, status: newStatus ? 'active' : 'inactive' })
      .then(() => {
        this.loadEmployees();
        this.toastService.success(`Statut de ${employee.firstName} ${employee.lastName} mis à jour`);
      })
      .catch(() => {
        this.toastService.error('Erreur lors de la mise à jour du statut');
      });
  }

  protected onRefresh(): void {
    this.loadEmployees();
  }

  protected onExportExcel(): void {
    this.toastService.success('Export Excel en cours de préparation...');
    setTimeout(() => {
      this.toastService.info('Export terminé ! Fichier téléchargé.');
    }, 2000);
  }

  protected formatCurrency(amount: number): string {
    return this.salairesDataService.formatCurrency(amount);
  }

  protected getDepartmentLabel(department: EmployeeDepartment): string {
    return this.salairesDataService.getDepartmentLabel(department);
  }

  protected getStatusLabel(status: EmployeeStatus): string {
    return this.salairesDataService.getStatusLabel(status);
  }

  protected getContractTypeLabel(type: ContractType): string {
    return this.salairesDataService.getContractTypeLabel(type);
  }

  protected getEmployeeInitials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }
}