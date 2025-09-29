import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  AuthResponse,
  RefreshTokenResponse,
  UserResponse,
  ErrorResponse,
  SigninCredentials,
  SignupCredentials,
  SignupResponse,
  ResendVerificationResponse,
  ProfileUpdateRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
  User
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'kora_access_token';
  private readonly REFRESH_TOKEN_KEY = 'kora_refresh_token';
  private readonly TOKEN_EXPIRES_KEY = 'kora_token_expires';

  private userSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal(false);
  private isLoadingSignal = signal(false);

  private refreshTimer?: number;
  private refreshInProgress$ = new BehaviorSubject<boolean>(false);

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getStoredToken();
    const expiresAt = this.getTokenExpiration();

    if (token && expiresAt && expiresAt > Date.now()) {
      this.isAuthenticatedSignal.set(true);
      this.scheduleTokenRefresh();
      // Ne pas charger le profil utilisateur ici pour éviter la dépendance circulaire
      // Le profil sera chargé lors de la première navigation réelle
    } else {
      this.clearTokens();
    }
  }

  signin(credentials: SigninCredentials): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<AuthResponse>(`${environment.apiUrl}/signin`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            this.storeTokens(
              response.data.access_token,
              response.data.refresh_token,
              response.data.expires_at
            );
            this.isAuthenticatedSignal.set(true);
            this.scheduleTokenRefresh();
            this.mapUserFromAuth(response);
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  signup(credentials: SignupCredentials): Observable<SignupResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<SignupResponse>(`${environment.apiUrl}/signup`, credentials)
      .pipe(
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  resendVerification(email: string): Observable<ResendVerificationResponse> {
    return this.http.post<ResendVerificationResponse>(`${environment.apiUrl}/resend-verification`, { email })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getStoredRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    if (this.refreshInProgress$.value) {
      return this.refreshInProgress$.pipe(
        switchMap(() => this.refreshToken())
      );
    }

    this.refreshInProgress$.next(true);

    return this.http.post<RefreshTokenResponse>(`${environment.apiUrl}/refresh-token`, {
      refresh_token: refreshToken
    }).pipe(
      tap(response => {
        if (response.success) {
          this.storeTokens(
            response.data.access_token,
            response.data.refresh_token,
            response.data.expires_at
          );
          this.scheduleTokenRefresh();
        }
      }),
      catchError(error => {
        this.logout();
        return this.handleError(error);
      }),
      tap(() => this.refreshInProgress$.next(false))
    );
  }

  getUser(): Observable<UserResponse> {
    // Ajouter manuellement le token car /user est exclu de l'intercepteur pour éviter la dépendance circulaire
    const token = this.getStoredToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    return this.http.get<UserResponse>(`${environment.apiUrl}/user`, { headers })
      .pipe(
        tap(response => {
          if (response.success) {
            this.mapUserFromProfile(response);
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  loadUserProfile(): void {
    this.getUser().subscribe({
      next: (response) => {
        if (response.success) {
          this.mapUserFromProfile(response);
        }
      },
      error: (error) => {
        console.error('Failed to load user profile:', error);
      }
    });
  }

  loadUserDataIfNeeded(): void {
    // Charger les données utilisateur uniquement si authentifié et pas encore chargées
    if (this.isAuthenticated() && !this.user()) {
      this.loadUserProfile();
    }
  }

  updateProfile(profileData: ProfileUpdateRequest): Observable<UserResponse> {
    const token = this.getStoredToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    return this.http.put<UserResponse>(`${environment.apiUrl}/update-profile`, profileData, { headers })
      .pipe(
        tap(response => {
          if (response.success) {
            this.mapUserFromProfile(response);
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    const token = this.getStoredToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    return this.http.put<ChangePasswordResponse>(`${environment.apiUrl}/change-password`, passwordData, { headers })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  logout(): void {
    this.clearTokens();
    this.userSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.clearRefreshTimer();
    localStorage.clear();
    this.router.navigate(['/signin']);
  }

  getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getStoredRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getTokenExpiration(): number | null {
    const expires = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
    return expires ? parseInt(expires) * 1000 : null;
  }

  private storeTokens(accessToken: string, refreshToken: string, expiresAt: number): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRES_KEY, expiresAt.toString());
  }

  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
  }

  private scheduleTokenRefresh(): void {
    this.clearRefreshTimer();

    const expiresAt = this.getTokenExpiration();
    if (!expiresAt) return;

    // Programmer le refresh 5 minutes avant l'expiration
    const refreshTime = expiresAt - Date.now() - (5 * 60 * 1000);

    if (refreshTime > 0) {
      this.refreshTimer = window.setTimeout(() => {
        this.refreshToken().subscribe({
          error: () => {
            this.logout();
          }
        });
      }, refreshTime);
    }
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  private mapUserFromAuth(response: AuthResponse): void {
    const userData = response.data;
    const user: User = {
      id: userData.id,
      email: userData.email,
      firstName: userData.user_metadata.first_name,
      lastName: userData.user_metadata.last_name,
      name: `${userData.user_metadata.first_name} ${userData.user_metadata.last_name}`,
      isFirstLogin: true,
      subscriptionStatus: 'trial',
      subscriptionExpiresAt: ''
    };
    this.userSignal.set(user);
  }

  private mapUserFromProfile(response: UserResponse): void {
    const authData = response.data.auth_data;
    const profileData = response.data.profile_data;

    const user: User = {
      id: authData.id,
      email: authData.email,
      firstName: profileData.first_name,
      lastName: profileData.last_name,
      name: profileData.display_name,
      phone: profileData.phone || undefined,
      addressLine1: profileData.address_line1 || undefined,
      addressLine2: profileData.address_line2 || undefined,
      city: profileData.city || undefined,
      country: profileData.country || undefined,
      postalCode: profileData.postal_code || undefined,
      isFirstLogin: profileData.is_first_login,
      subscriptionStatus: profileData.subscription_status,
      subscriptionExpiresAt: profileData.subscription_expires_at
    };
    this.userSignal.set(user);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inattendue s\'est produite';

    if (error.error && typeof error.error === 'object') {
      const errorResponse = error.error as ErrorResponse;

      // Prioriser le message du serveur, puis l'erreur spécifique
      if (errorResponse.message) {
        errorMessage = errorResponse.message;
      } else if (errorResponse.error) {
        errorMessage = errorResponse.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Erreur d\'authentification:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Méthode utilitaire pour vérifier si le token est sur le point d'expirer
  isTokenExpiringSoon(): boolean {
    const expiresAt = this.getTokenExpiration();
    if (!expiresAt) return true;

    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    return expiresAt <= fiveMinutesFromNow;
  }
}