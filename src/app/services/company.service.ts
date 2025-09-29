import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Company,
  CreateCompanyRequest,
  CompanyListResponse,
  CreateCompanyResponse,
  CompanyErrorResponse,
  CompanyDetailResponse,
  UpdateCompanyRequest,
  UpdateCompanyResponse,
  DeleteCompanyResponse
} from '../interfaces/company.interface';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private http = inject(HttpClient);

  private readonly SELECTED_COMPANY_KEY = 'kora_selected_company';

  private companiesSignal = signal<Company[]>([]);
  private selectedCompanySignal = signal<Company | null>(null);
  private isLoadingSignal = signal(false);

  readonly companies = this.companiesSignal.asReadonly();
  readonly selectedCompany = this.selectedCompanySignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();

  constructor() {
    this.initializeSelectedCompany();
  }

  private initializeSelectedCompany(): void {
    const storedCompany = localStorage.getItem(this.SELECTED_COMPANY_KEY);
    if (storedCompany) {
      try {
        const company = JSON.parse(storedCompany) as Company;
        this.selectedCompanySignal.set(company);
      } catch (error) {
        console.error('Error parsing stored company:', error);
        localStorage.removeItem(this.SELECTED_COMPANY_KEY);
      }
    }
  }

  getCompanies(): Observable<CompanyListResponse> {
    this.isLoadingSignal.set(true);

    return this.http.get<CompanyListResponse>(`${environment.apiUrl}/companies`)
      .pipe(
        tap(response => {
          if (response.success) {
            const companies = response.data || [];
            this.companiesSignal.set(companies);

            // Auto-sélectionner la première entreprise si aucune n'est sélectionnée
            if (!this.selectedCompanySignal() && companies.length > 0) {
              this.selectCompany(companies[0]);
            }
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  createCompany(companyData: CreateCompanyRequest): Observable<CreateCompanyResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<CreateCompanyResponse>(`${environment.apiUrl}/companies/create`, companyData)
      .pipe(
        tap(response => {
          if (response.success) {
            // Recharger la liste des entreprises après création
            this.getCompanies().subscribe();
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  selectCompany(company: Company): void {
    this.selectedCompanySignal.set(company);
    localStorage.setItem(this.SELECTED_COMPANY_KEY, JSON.stringify(company));
  }

  clearSelectedCompany(): void {
    this.selectedCompanySignal.set(null);
    localStorage.removeItem(this.SELECTED_COMPANY_KEY);
  }

  hasCompanies(): boolean {
    return this.companies().length > 0;
  }

  getCompany(companyId: string): Observable<CompanyDetailResponse> {
    this.isLoadingSignal.set(true);

    return this.http.get<CompanyDetailResponse>(`${environment.apiUrl}/companies/${companyId}`)
      .pipe(
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  updateCompany(companyId: string, companyData: UpdateCompanyRequest): Observable<UpdateCompanyResponse> {
    this.isLoadingSignal.set(true);

    return this.http.put<UpdateCompanyResponse>(`${environment.apiUrl}/companies/${companyId}`, companyData)
      .pipe(
        tap(response => {
          if (response.success) {
            // Mettre à jour la liste des entreprises après modification
            this.getCompanies().subscribe();

            // Mettre à jour l'entreprise sélectionnée si c'est celle qui a été modifiée
            const selectedCompany = this.selectedCompanySignal();
            if (selectedCompany && selectedCompany.company_id === companyId) {
              this.selectedCompanySignal.set(response.data);
              localStorage.setItem(this.SELECTED_COMPANY_KEY, JSON.stringify(response.data));
            }
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  deleteCompany(companyId: string): Observable<DeleteCompanyResponse> {
    this.isLoadingSignal.set(true);

    return this.http.delete<DeleteCompanyResponse>(`${environment.apiUrl}/companies/${companyId}`)
      .pipe(
        tap(response => {
          if (response.success) {
            // Supprimer l'entreprise de la liste locale
            const currentCompanies = this.companiesSignal();
            const updatedCompanies = currentCompanies.filter(company => company.company_id !== companyId);
            this.companiesSignal.set(updatedCompanies);

            // Vider la sélection si l'entreprise supprimée était sélectionnée
            const selectedCompany = this.selectedCompanySignal();
            if (selectedCompany && selectedCompany.company_id === companyId) {
              this.clearSelectedCompany();
            }
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inattendue s\'est produite';

    if (error.error && typeof error.error === 'object') {
      const errorResponse = error.error as CompanyErrorResponse;
      errorMessage = errorResponse.message || errorResponse.error || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Erreur CompanyService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}