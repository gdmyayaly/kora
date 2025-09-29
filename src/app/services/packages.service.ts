import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Package {
  package_id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_cycle: 'trial' | 'monthly' | 'yearly';
  package_type: 'trial' | 'subscription';
  features: string[];
  max_companies: number;
  max_users: number;
  max_workspaces: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CurrentPackage extends Package {
  is_trial: boolean;
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
  subscription_expires_at: string;
  usage_limits: {
    companies: {
      current: number;
      max: number;
      within_limit: boolean;
    };
    workspaces: {
      current: number;
      max: number;
      within_limit: boolean;
    };
  };
  within_all_limits: boolean;
}

export interface PackagesResponse {
  code: number;
  data: Package[];
  error: string | null;
  message: string;
  success: boolean;
}

export interface CurrentPackageResponse {
  code: number;
  data: CurrentPackage;
  error: string | null;
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PackagesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private readonly packagesSubject = new BehaviorSubject<Package[]>([]);
  private readonly currentPackageSubject = new BehaviorSubject<CurrentPackage | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly packages = signal<Package[]>([]);
  readonly currentPackage = signal<CurrentPackage | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.packagesSubject.subscribe(packages => this.packages.set(packages));
    this.currentPackageSubject.subscribe(currentPackage => this.currentPackage.set(currentPackage));
    this.loadingSubject.subscribe(loading => this.loading.set(loading));
    this.errorSubject.subscribe(error => this.error.set(error));
  }

  getPackages(): Observable<PackagesResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<PackagesResponse>(`${this.apiUrl}/packages/`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.packagesSubject.next(response.data);
        } else {
          this.errorSubject.next(response.error || 'Failed to load packages');
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next('Network error: Failed to load packages');
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  getCurrentPackage(): Observable<CurrentPackageResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<CurrentPackageResponse>(`${this.apiUrl}/packages/current`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentPackageSubject.next(response.data);
        } else {
          this.errorSubject.next(response.error || 'Failed to load current package');
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next('Network error: Failed to load current package');
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  calculateAnnualPrice(monthlyPrice: number): number {
    // 20% discount for annual billing
    return Math.round(monthlyPrice * 12 * 0.8);
  }

  formatPrice(price: number, currency: string = 'XOF'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  isPopularPackage(packageName: string): boolean {
    return packageName.toLowerCase() === 'pro';
  }

  getPackageDisplayPrice(pkg: Package, billingCycle: 'monthly' | 'annual'): number {
    if (pkg.package_type === 'trial') return 0;
    if (billingCycle === 'annual') {
      return this.calculateAnnualPrice(pkg.price);
    }
    return pkg.price;
  }
}