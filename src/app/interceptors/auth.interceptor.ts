import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ajouter le token d'authentification si disponible
    const authRequest = this.addTokenToRequest(request);

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si erreur 401 et qu'on n'est pas déjà en train de refresh
        // ET que ce n'est pas une requête d'authentification
        if (error.status === 401 && !this.isRefreshing && !this.isAuthRequest(request)) {
          return this.handle401Error(authRequest, next);
        }

        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getStoredToken();

    if (token && !this.isAuthRequest(request)) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return request;
  }

  private isAuthRequest(request: HttpRequest<any>): boolean {
    return request.url.includes('/signin') ||
           request.url.includes('/refresh-token') ||
           request.url.includes('/signup') ||
           request.url.includes('/user');
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap(() => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);

          // Réessayer la requête originale avec le nouveau token
          const authRequest = this.addTokenToRequest(request);
          return next.handle(authRequest);
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => error);
        })
      );
    }

    // Si refresh en cours, attendre qu'il se termine
    return this.refreshTokenSubject.pipe(
      filter(result => result !== null),
      take(1),
      switchMap(() => {
        const authRequest = this.addTokenToRequest(request);
        return next.handle(authRequest);
      })
    );
  }
}