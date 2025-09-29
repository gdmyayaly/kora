import { Injectable, signal, computed } from '@angular/core';
import {
  Employee,
  PayrollPeriod,
  PaySlip,
  SalaryMetrics,
  EmployeeDepartment,
  ContractType,
  EmployeeStatus,
  PayrollPeriodStatus,
  PaySlipStatus,
  AllowanceType,
  TaxType,
  ContributionType,
  PayrollCalculation
} from '../interfaces/salaires.interface';

@Injectable({
  providedIn: 'root'
})
export class SalairesDataService {
  private readonly _employees = signal<Employee[]>(this.generateMockEmployees());
  private readonly _payrollPeriods = signal<PayrollPeriod[]>(this.generateMockPayrollPeriods());
  private readonly _paySlips = signal<PaySlip[]>(this.generateMockPaySlips());

  readonly employees = this._employees.asReadonly();
  readonly payrollPeriods = this._payrollPeriods.asReadonly();
  readonly paySlips = this._paySlips.asReadonly();

  readonly metrics = computed((): SalaryMetrics => {
    const employees = this._employees();
    const payrollPeriods = this._payrollPeriods();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const activeEmployees = employees.filter(e => e.isActive);
    const currentPeriod = payrollPeriods.find(p => p.year === currentYear && p.month === currentMonth);
    const previousPeriod = payrollPeriods.find(p => p.year === previousYear && p.month === previousMonth);

    const avgSalary = activeEmployees.length > 0
      ? activeEmployees.reduce((sum, emp) => sum + emp.baseSalary, 0) / activeEmployees.length
      : 0;

    const departmentMetrics = this.calculateDepartmentMetrics(activeEmployees);
    const monthlyTrends = this.calculateMonthlyTrends(payrollPeriods);
    const contributions = this.calculateContributionSummary(payrollPeriods);

    return {
      overview: {
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        newEmployees: employees.filter(e => {
          const hireDate = new Date(e.hireDate);
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return hireDate >= threeMonthsAgo;
        }).length,
        employeesOnLeave: employees.filter(e => e.status === 'on_leave').length,
        avgMonthlySalary: avgSalary,
        totalPayroll: currentPeriod?.totalGrossSalary || 0,
        payrollGrowth: this.calculatePayrollGrowth(currentPeriod, previousPeriod)
      },
      payroll: {
        currentMonth: {
          totalGross: currentPeriod?.totalGrossSalary || 0,
          totalNet: currentPeriod?.totalNetSalary || 0,
          totalTaxes: currentPeriod?.totalTaxes || 0,
          totalContributions: currentPeriod?.totalContributions || 0,
          totalAllowances: currentPeriod?.totalAllowances || 0
        },
        previousMonth: {
          totalGross: previousPeriod?.totalGrossSalary || 0,
          totalNet: previousPeriod?.totalNetSalary || 0,
          totalTaxes: previousPeriod?.totalTaxes || 0,
          totalContributions: previousPeriod?.totalContributions || 0,
          totalAllowances: previousPeriod?.totalAllowances || 0
        },
        yearToDate: this.calculateYearToDate(payrollPeriods, currentYear)
      },
      departments: departmentMetrics,
      monthlyTrends,
      contributions
    };
  });

  private generateMockEmployees(): Employee[] {
    const departments: EmployeeDepartment[] = ['direction', 'comptabilite', 'rh', 'commercial', 'technique'];
    const senegaleseNames = [
      { first: 'Amadou', last: 'Diallo' },
      { first: 'Fatou', last: 'Sall' },
      { first: 'Moussa', last: 'Ndiaye' },
      { first: 'Aïssata', last: 'Ba' },
      { first: 'Oumar', last: 'Faye' },
      { first: 'Mariama', last: 'Thiam' },
      { first: 'Ibrahima', last: 'Sy' },
      { first: 'Khady', last: 'Gueye' },
      { first: 'Mamadou', last: 'Diop' },
      { first: 'Awa', last: 'Sarr' },
      { first: 'Cheikh', last: 'Fall' },
      { first: 'Binta', last: 'Traore' },
      { first: 'Alassane', last: 'Kane' },
      { first: 'Nabou', last: 'Cisse' },
      { first: 'Saliou', last: 'Ndoye' },
      { first: 'Rokhaya', last: 'Camara' },
      { first: 'Modou', last: 'Diouf' },
      { first: 'Aminata', last: 'Wade' }
    ];

    const positions = [
      'Directeur Général', 'Directeur Financier', 'Chef Comptable', 'Comptable',
      'Responsable RH', 'Assistant RH', 'Directeur Commercial', 'Chef des Ventes',
      'Commercial', 'Technicien Senior', 'Technicien', 'Assistant Technique',
      'Secrétaire', 'Réceptionniste', 'Chauffeur', 'Agent de Sécurité',
      'Responsable Marketing', 'Chef de Projet'
    ];

    return senegaleseNames.map((name, index) => ({
      id: `emp_${index + 1}`,
      employeeNumber: `EMP${String(index + 1).padStart(3, '0')}`,
      firstName: name.first,
      lastName: name.last,
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@kora.sn`,
      phone: `+221 77 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`,
      dateOfBirth: this.getRandomDate(new Date('1980-01-01'), new Date('1995-12-31')),
      hireDate: this.getRandomDate(new Date('2020-01-01'), new Date('2024-01-01')),
      position: positions[index % positions.length],
      department: departments[index % departments.length],
      contractType: index < 15 ? 'cdi' : (index < 17 ? 'cdd' : 'stage') as ContractType,
      baseSalary: this.getRandomSalary(index),
      allowances: this.generateRandomAllowances(),
      bankAccount: {
        bankName: ['CBAO', 'SGBS', 'Ecobank', 'BOA', 'BHS'][index % 5],
        accountNumber: `00${Math.floor(Math.random() * 900000000) + 100000000}`,
        branchCode: `AGE${String(index % 10).padStart(3, '0')}`
      },
      socialSecurity: {
        cnssNumber: `${Math.floor(Math.random() * 900000000) + 100000000}`,
        ipresNumber: index < 10 ? `${Math.floor(Math.random() * 90000) + 10000}` : undefined,
        taxNumber: `SN${Math.floor(Math.random() * 900000000) + 100000000}`
      },
      status: index === 16 ? 'on_leave' : (index === 17 ? 'inactive' : 'active') as EmployeeStatus,
      isActive: index < 16,
      address: {
        street: `Rue ${index + 1}, Quartier ${['Plateau', 'Almadies', 'Mermoz', 'Ouakam', 'Fann'][index % 5]}`,
        city: 'Dakar',
        region: 'Dakar',
        postalCode: '10000',
        country: 'Sénégal'
      },
      emergencyContact: {
        name: `${name.first} Family`,
        relationship: 'Époux/Épouse',
        phone: `+221 78 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}`
      },
      totalPaid: Math.floor(Math.random() * 1000000) + 500000,
      lastPayDate: '2024-01-31',
      createdAt: this.getRandomDate(new Date('2020-01-01'), new Date('2024-01-01')),
      updatedAt: new Date().toISOString().split('T')[0]
    }));
  }

  private generateMockPayrollPeriods(): PayrollPeriod[] {
    const periods: PayrollPeriod[] = [];
    const currentDate = new Date();

    for (let year = 2023; year <= currentDate.getFullYear(); year++) {
      const maxMonth = year === currentDate.getFullYear() ? currentDate.getMonth() : 11;

      for (let month = 0; month <= maxMonth; month++) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        const payDate = new Date(year, month + 1, 5);

        const totalGross = Math.floor(Math.random() * 2000000) + 8000000;
        const totalNet = totalGross * 0.75;
        const totalTaxes = totalGross * 0.12;
        const totalContributions = totalGross * 0.13;
        const totalAllowances = totalGross * 0.15;

        periods.push({
          id: `period_${year}_${month}`,
          year,
          month,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          payDate: payDate.toISOString().split('T')[0],
          status: month === currentDate.getMonth() && year === currentDate.getFullYear()
            ? 'in_progress'
            : 'closed' as PayrollPeriodStatus,
          employeeCount: 16,
          totalGrossSalary: totalGross,
          totalNetSalary: totalNet,
          totalTaxes,
          totalContributions,
          totalAllowances,
          isFinalized: month !== currentDate.getMonth() || year !== currentDate.getFullYear(),
          paySlips: [],
          createdAt: startDate.toISOString().split('T')[0],
          finalizedAt: month !== currentDate.getMonth() || year !== currentDate.getFullYear()
            ? payDate.toISOString().split('T')[0]
            : undefined,
          createdBy: 'admin'
        });
      }
    }

    return periods;
  }

  private generateMockPaySlips(): PaySlip[] {
    const paySlips: PaySlip[] = [];
    const employees = this.generateMockEmployees().slice(0, 16);
    const periods = this.generateMockPayrollPeriods();

    periods.forEach(period => {
      employees.forEach((employee, index) => {
        const grossSalary = employee.baseSalary + (employee.baseSalary * 0.1);
        const netSalary = grossSalary * 0.75;

        paySlips.push({
          id: `payslip_${period.id}_${employee.id}`,
          paySlipNumber: `BS${period.year}${String(period.month + 1).padStart(2, '0')}${String(index + 1).padStart(3, '0')}`,
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          payrollPeriodId: period.id,
          period: `${period.month + 1}/${period.year}`,
          grossSalary,
          baseSalary: employee.baseSalary,
          allowances: [
            { id: '1', type: 'transport', name: 'Indemnité Transport', amount: 25000, isTaxable: false },
            { id: '2', type: 'food', name: 'Indemnité Repas', amount: 30000, isTaxable: false }
          ],
          deductions: [
            { id: '1', type: 'advance', name: 'Avance sur salaire', amount: 10000, description: 'Avance octobre' }
          ],
          taxes: [
            { id: '1', type: 'income_tax', name: 'Impôt sur le Revenu', rate: 10, baseAmount: grossSalary, amount: grossSalary * 0.1 }
          ],
          contributions: [
            {
              id: '1',
              type: 'cnss',
              name: 'CNSS',
              employeeRate: 5.6,
              employerRate: 8.4,
              baseAmount: grossSalary,
              employeeAmount: grossSalary * 0.056,
              employerAmount: grossSalary * 0.084
            }
          ],
          netSalary,
          workingDays: 22,
          actualWorkingDays: 22,
          overtimeHours: 0,
          absenceHours: 0,
          status: 'generated' as PaySlipStatus,
          generatedAt: period.payDate,
          sentAt: period.payDate
        });
      });
    });

    return paySlips;
  }

  private generateRandomAllowances() {
    return [
      { id: '1', type: 'transport' as AllowanceType, name: 'Transport', amount: 25000, isPercentage: false, isTaxable: false },
      { id: '2', type: 'food' as AllowanceType, name: 'Repas', amount: 30000, isPercentage: false, isTaxable: false }
    ];
  }

  private getRandomSalary(index: number): number {
    const baseSalaries = [
      2500000, 1800000, 1200000, 800000, 1000000, 600000, 1500000, 900000,
      700000, 600000, 550000, 500000, 400000, 350000, 300000, 280000, 800000, 600000
    ];
    return baseSalaries[index] || 500000;
  }

  private getRandomDate(start: Date, end: Date): string {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  }

  private calculateDepartmentMetrics(employees: Employee[]) {
    const departments: EmployeeDepartment[] = ['direction', 'comptabilite', 'rh', 'commercial', 'technique'];
    const totalSalary = employees.reduce((sum, emp) => sum + emp.baseSalary, 0);

    return departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept);
      const deptSalary = deptEmployees.reduce((sum, emp) => sum + emp.baseSalary, 0);

      return {
        department: dept,
        employeeCount: deptEmployees.length,
        totalSalary: deptSalary,
        avgSalary: deptEmployees.length > 0 ? deptSalary / deptEmployees.length : 0,
        percentageOfTotal: totalSalary > 0 ? (deptSalary / totalSalary) * 100 : 0
      };
    });
  }

  private calculateMonthlyTrends(periods: PayrollPeriod[]) {
    return periods.slice(-12).map(period => ({
      month: this.getMonthName(period.month),
      year: period.year,
      totalGross: period.totalGrossSalary,
      totalNet: period.totalNetSalary,
      employeeCount: period.employeeCount,
      avgSalary: period.employeeCount > 0 ? period.totalGrossSalary / period.employeeCount : 0
    }));
  }

  private calculateContributionSummary(periods: PayrollPeriod[]) {
    const currentPeriod = periods[periods.length - 1];
    if (!currentPeriod) return [];

    return [
      {
        type: 'cnss' as ContributionType,
        name: 'CNSS',
        totalEmployeeAmount: currentPeriod.totalGrossSalary * 0.056,
        totalEmployerAmount: currentPeriod.totalGrossSalary * 0.084,
        totalAmount: currentPeriod.totalGrossSalary * 0.14,
        percentage: 14
      },
      {
        type: 'ipres' as ContributionType,
        name: 'IPRES',
        totalEmployeeAmount: currentPeriod.totalGrossSalary * 0.06,
        totalEmployerAmount: currentPeriod.totalGrossSalary * 0.12,
        totalAmount: currentPeriod.totalGrossSalary * 0.18,
        percentage: 18
      }
    ];
  }

  private calculatePayrollGrowth(current?: PayrollPeriod, previous?: PayrollPeriod): number {
    if (!current || !previous) return 0;
    return ((current.totalGrossSalary - previous.totalGrossSalary) / previous.totalGrossSalary) * 100;
  }

  private calculateYearToDate(periods: PayrollPeriod[], year: number) {
    const ytdPeriods = periods.filter(p => p.year === year);
    return ytdPeriods.reduce((acc, period) => ({
      totalGross: acc.totalGross + period.totalGrossSalary,
      totalNet: acc.totalNet + period.totalNetSalary,
      totalTaxes: acc.totalTaxes + period.totalTaxes,
      totalContributions: acc.totalContributions + period.totalContributions,
      totalAllowances: acc.totalAllowances + period.totalAllowances
    }), { totalGross: 0, totalNet: 0, totalTaxes: 0, totalContributions: 0, totalAllowances: 0 });
  }

  private getMonthName(month: number): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month];
  }

  async getEmployees(): Promise<Employee[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this._employees();
  }

  async getPayrollPeriods(): Promise<PayrollPeriod[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this._payrollPeriods();
  }

  async getPaySlips(): Promise<PaySlip[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this._paySlips();
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    await new Promise(resolve => setTimeout(resolve, 300));

    this._employees.update(employees =>
      employees.map(emp =>
        emp.id === id ? { ...emp, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : emp
      )
    );

    return this._employees().find(emp => emp.id === id)!;
  }

  async createPayrollPeriod(period: Omit<PayrollPeriod, 'id' | 'createdAt'>): Promise<PayrollPeriod> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newPeriod: PayrollPeriod = {
      ...period,
      id: `period_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    this._payrollPeriods.update(periods => [...periods, newPeriod]);
    return newPeriod;
  }

  formatCurrency(amount: number): string {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }

  getDepartmentLabel(department: EmployeeDepartment): string {
    const labels: Record<EmployeeDepartment, string> = {
      direction: 'Direction',
      comptabilite: 'Comptabilité',
      rh: 'Ressources Humaines',
      commercial: 'Commercial',
      technique: 'Technique',
      maintenance: 'Maintenance',
      marketing: 'Marketing',
      logistique: 'Logistique',
      juridique: 'Juridique',
      formation: 'Formation'
    };
    return labels[department];
  }

  getStatusLabel(status: EmployeeStatus | PayrollPeriodStatus | PaySlipStatus): string {
    const labels: Record<string, string> = {
      active: 'Actif',
      inactive: 'Inactif',
      on_leave: 'En congé',
      terminated: 'Licencié',
      suspended: 'Suspendu',
      draft: 'Brouillon',
      in_progress: 'En cours',
      calculated: 'Calculé',
      validated: 'Validé',
      paid: 'Payé',
      closed: 'Clôturé',
      generated: 'Généré',
      sent: 'Envoyé',
      acknowledged: 'Accusé réception',
      disputed: 'Contesté'
    };
    return labels[status] || status;
  }

  getContractTypeLabel(type: ContractType): string {
    const labels: Record<ContractType, string> = {
      cdi: 'CDI',
      cdd: 'CDD',
      stage: 'Stage',
      freelance: 'Freelance',
      consultation: 'Consultation',
      apprentissage: 'Apprentissage'
    };
    return labels[type];
  }
}