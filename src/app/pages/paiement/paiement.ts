import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PackagesService, Package, CurrentPackage } from '../../services/packages.service';
import { ToastService } from '../../services/toast.service';

type BillingCycle = 'monthly' | 'annual';

@Component({
  selector: 'app-paiement',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paiement.html',
  styleUrl: './paiement.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaiementComponent implements OnInit {
  private packagesService = inject(PackagesService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  protected readonly billingCycle = signal<BillingCycle>('monthly');
  protected readonly selectedPackage = signal<Package | null>(null);
  protected readonly showPaymentForm = signal<boolean>(false);

  protected readonly packages = this.packagesService.packages.asReadonly();
  protected readonly currentPackage = this.packagesService.currentPackage.asReadonly();
  protected readonly loading = this.packagesService.loading.asReadonly();
  protected readonly error = this.packagesService.error.asReadonly();

  protected readonly subscriptionPackages = computed(() => {
    return this.packages().filter(pkg => pkg.package_type === 'subscription');
  });

  protected readonly selectedPackagePrice = computed(() => {
    const pkg = this.selectedPackage();
    if (!pkg || pkg.package_type === 'trial') return 0;

    if (this.billingCycle() === 'annual') {
      return this.packagesService.calculateAnnualPrice(pkg.price);
    }
    return pkg.price;
  });

  protected readonly annualDiscount = computed(() => {
    const pkg = this.selectedPackage();
    if (!pkg || pkg.package_type === 'trial') return 0;

    const monthlyTotal = pkg.price * 12;
    const annualPrice = this.packagesService.calculateAnnualPrice(pkg.price);
    return monthlyTotal - annualPrice;
  });

  protected paymentForm: FormGroup;

  constructor() {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
      cardName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  protected loadData(): void {
    this.packagesService.getPackages().subscribe({
      error: (error) => {
        this.toastService.error('Erreur lors du chargement des forfaits');
      }
    });

    this.packagesService.getCurrentPackage().subscribe({
      error: (error) => {
        this.toastService.error('Erreur lors du chargement du forfait actuel');
      }
    });
  }

  protected onBillingCycleChange(cycle: BillingCycle): void {
    this.billingCycle.set(cycle);
  }

  protected onPackageSelect(pkg: Package): void {
    if (pkg.package_type === 'trial') return;

    this.selectedPackage.set(pkg);
    this.showPaymentForm.set(true);
  }

  protected isCurrentPackage(pkg: Package): boolean {
    const current = this.currentPackage();
    return current?.package_id === pkg.package_id;
  }

  protected isPopularPackage(pkg: Package): boolean {
    return this.packagesService.isPopularPackage(pkg.name);
  }

  protected formatPrice(price: number): string {
    return this.packagesService.formatPrice(price);
  }

  protected getPackageDisplayPrice(pkg: Package): number {
    return this.packagesService.getPackageDisplayPrice(pkg, this.billingCycle());
  }

  protected onPaymentSubmit(): void {
    if (this.paymentForm.valid && this.selectedPackage()) {
      this.toastService.info('Traitement du paiement en cours...');
      // TODO: Implement payment processing
      console.log('Payment form data:', this.paymentForm.value);
      console.log('Selected package:', this.selectedPackage());
      console.log('Billing cycle:', this.billingCycle());
    } else {
      this.toastService.error('Veuillez remplir tous les champs requis');
    }
  }

  protected onBackToPackages(): void {
    this.showPaymentForm.set(false);
    this.selectedPackage.set(null);
  }

  protected onInputChange(field: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.paymentForm.patchValue({ [field]: target.value });
  }

  protected onCheckboxChange(field: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.paymentForm.patchValue({ [field]: target.checked });
  }

  protected formatExpirationDate(dateString: string): string {
    const expirationDate = new Date(dateString);
    return expirationDate.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}