import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  GlobalEnumsResponse,
  CountriesResponse,
  CurrenciesResponse,
  LegalFormsResponse,
  PaymentStatusesResponse,
  UserRolesResponse,
  GlobalEnumsData,
  Country,
  Currency,
  LegalForm,
  PaymentStatus,
  UserRole,
  EnumsCache,
  EnumsErrorResponse,
  EnumFilterOptions
} from '../interfaces/enums.interface';

@Injectable({
  providedIn: 'root'
})
export class EnumsService {
  private http = inject(HttpClient);

  // Cache duration (5 minutes)
  private readonly CACHE_DURATION = 5 * 60 * 1000;
  private readonly CACHE_KEY = 'kora_enums_cache';

  // Signals for state management
  private globalEnumsSignal = signal<GlobalEnumsData | null>(null);
  private countriesSignal = signal<Country[]>([]);
  private currenciesSignal = signal<Currency[]>([]);
  private legalFormsSignal = signal<LegalForm[]>([]);
  private paymentStatusesSignal = signal<PaymentStatus[]>([]);
  private userRolesSignal = signal<UserRole[]>([]);
  private isLoadingSignal = signal(false);
  private lastUpdatedSignal = signal<Date | null>(null);

  // Public readonly signals
  readonly globalEnums = this.globalEnumsSignal.asReadonly();
  readonly countries = this.countriesSignal.asReadonly();
  readonly currencies = this.currenciesSignal.asReadonly();
  readonly legalForms = this.legalFormsSignal.asReadonly();
  readonly paymentStatuses = this.paymentStatusesSignal.asReadonly();
  readonly userRoles = this.userRolesSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly lastUpdated = this.lastUpdatedSignal.asReadonly();

  // Computed signals for filtered data
  readonly countriesByRegion = computed(() => {
    const countries = this.countries();
    const grouped: { [region: string]: Country[] } = {};

    countries.forEach(country => {
      if (!grouped[country.region]) {
        grouped[country.region] = [];
      }
      grouped[country.region].push(country);
    });

    return grouped;
  });

  readonly userRolesByHierarchy = computed(() => {
    return this.userRoles().sort((a, b) => b.hierarchy - a.hierarchy);
  });

  readonly isDataStale = computed(() => {
    const lastUpdate = this.lastUpdated();
    if (!lastUpdate) return true;

    return Date.now() - lastUpdate.getTime() > this.CACHE_DURATION;
  });

  constructor() {
    this.initializeCache();
  }

  private initializeCache(): void {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const cache: EnumsCache = JSON.parse(cached);

        // Check if cache is still valid
        if (cache.lastUpdated &&
            Date.now() - new Date(cache.lastUpdated).getTime() < this.CACHE_DURATION) {

          this.loadFromCache(cache);
          return;
        }
      }
    } catch (error) {
      console.error('Error loading enums cache:', error);
      localStorage.removeItem(this.CACHE_KEY);
    }
  }

  private loadFromCache(cache: EnumsCache): void {
    if (cache.globalEnums) {
      this.globalEnumsSignal.set(cache.globalEnums);
      this.countriesSignal.set(cache.globalEnums.countries);
      this.currenciesSignal.set(cache.globalEnums.currencies);
      this.legalFormsSignal.set(cache.globalEnums.legal_forms);
      this.paymentStatusesSignal.set(cache.globalEnums.payment_statuses);
      this.userRolesSignal.set(cache.globalEnums.user_roles);
    } else {
      if (cache.countries) this.countriesSignal.set(cache.countries);
      if (cache.currencies) this.currenciesSignal.set(cache.currencies);
      if (cache.legalForms) this.legalFormsSignal.set(cache.legalForms);
      if (cache.paymentStatuses) this.paymentStatusesSignal.set(cache.paymentStatuses);
      if (cache.userRoles) this.userRolesSignal.set(cache.userRoles);
    }

    this.lastUpdatedSignal.set(cache.lastUpdated ? new Date(cache.lastUpdated) : null);
  }

  private saveToCache(): void {
    try {
      const cache: EnumsCache = {
        globalEnums: this.globalEnums(),
        countries: this.countries(),
        currencies: this.currencies(),
        legalForms: this.legalForms(),
        paymentStatuses: this.paymentStatuses(),
        userRoles: this.userRoles(),
        lastUpdated: new Date()
      };

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      this.lastUpdatedSignal.set(new Date());
    } catch (error) {
      console.error('Error saving enums cache:', error);
    }
  }

  getGlobalEnums(forceRefresh = false): Observable<GlobalEnumsResponse> {
    if (!forceRefresh && this.globalEnums() && !this.isDataStale()) {
      return of({
        code: 200,
        data: this.globalEnums()!,
        error: null,
        message: 'Enums retrieved from cache',
        success: true
      });
    }

    this.isLoadingSignal.set(true);

    return this.http.get<GlobalEnumsResponse>(`${environment.apiUrl}/utils/enums`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.globalEnumsSignal.set(response.data);
            this.countriesSignal.set(response.data.countries);
            this.currenciesSignal.set(response.data.currencies);
            this.legalFormsSignal.set(response.data.legal_forms);
            this.paymentStatusesSignal.set(response.data.payment_statuses);
            this.userRolesSignal.set(response.data.user_roles);
            this.saveToCache();
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  getCountries(forceRefresh = false): Observable<CountriesResponse> {
    if (!forceRefresh && this.countries().length > 0 && !this.isDataStale()) {
      return of({
        code: 200,
        data: this.countries(),
        error: null,
        message: 'Countries retrieved from cache',
        success: true
      });
    }

    this.isLoadingSignal.set(true);

    return this.http.get<CountriesResponse>(`${environment.apiUrl}/utils/enums/countries`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.countriesSignal.set(response.data);
            this.saveToCache();
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  getCurrencies(forceRefresh = false): Observable<CurrenciesResponse> {
    if (!forceRefresh && this.currencies().length > 0 && !this.isDataStale()) {
      return of({
        code: 200,
        data: this.currencies(),
        error: null,
        message: 'Currencies retrieved from cache',
        success: true
      });
    }

    this.isLoadingSignal.set(true);

    return this.http.get<CurrenciesResponse>(`${environment.apiUrl}/utils/enums/currencies`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.currenciesSignal.set(response.data);
            this.saveToCache();
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  getLegalForms(forceRefresh = false): Observable<LegalFormsResponse> {
    if (!forceRefresh && this.legalForms().length > 0 && !this.isDataStale()) {
      return of({
        code: 200,
        data: this.legalForms(),
        error: null,
        message: 'Legal forms retrieved from cache',
        success: true
      });
    }

    this.isLoadingSignal.set(true);

    return this.http.get<LegalFormsResponse>(`${environment.apiUrl}/utils/enums/legal-forms`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.legalFormsSignal.set(response.data);
            this.saveToCache();
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  getPaymentStatuses(forceRefresh = false): Observable<PaymentStatusesResponse> {
    if (!forceRefresh && this.paymentStatuses().length > 0 && !this.isDataStale()) {
      return of({
        code: 200,
        data: this.paymentStatuses(),
        error: null,
        message: 'Payment statuses retrieved from cache',
        success: true
      });
    }

    this.isLoadingSignal.set(true);

    return this.http.get<PaymentStatusesResponse>(`${environment.apiUrl}/utils/enums/payment-statuses`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.paymentStatusesSignal.set(response.data);
            this.saveToCache();
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  getUserRoles(forceRefresh = false): Observable<UserRolesResponse> {
    if (!forceRefresh && this.userRoles().length > 0 && !this.isDataStale()) {
      return of({
        code: 200,
        data: this.userRoles(),
        error: null,
        message: 'User roles retrieved from cache',
        success: true
      });
    }

    this.isLoadingSignal.set(true);

    return this.http.get<UserRolesResponse>(`${environment.apiUrl}/utils/enums/user-roles`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.userRolesSignal.set(response.data);
            this.saveToCache();
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  // Utility methods
  findCountryByCode(code: string): Country | undefined {
    return this.countries().find(country => country.code === code);
  }

  findCurrencyByValue(value: string): Currency | undefined {
    return this.currencies().find(currency => currency.value === value);
  }

  findLegalFormByValue(value: string): LegalForm | undefined {
    return this.legalForms().find(form => form.value === value);
  }

  findUserRoleByValue(value: string): UserRole | undefined {
    return this.userRoles().find(role => role.value === value);
  }

  filterCountriesByRegion(region: string): Country[] {
    return this.countries().filter(country => country.region === region);
  }

  filterUserRolesByMinHierarchy(minHierarchy: number): UserRole[] {
    return this.userRoles().filter(role => role.hierarchy >= minHierarchy);
  }

  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    this.globalEnumsSignal.set(null);
    this.countriesSignal.set([]);
    this.currenciesSignal.set([]);
    this.legalFormsSignal.set([]);
    this.paymentStatusesSignal.set([]);
    this.userRolesSignal.set([]);
    this.lastUpdatedSignal.set(null);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inattendue s\'est produite lors de la récupération des énumérations';

    if (error.error && typeof error.error === 'object') {
      const errorResponse = error.error as EnumsErrorResponse;
      errorMessage = errorResponse.message || errorResponse.error || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Erreur EnumsService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}