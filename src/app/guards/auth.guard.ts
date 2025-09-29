import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state.url);
  }

  private checkAuth(url: string): Observable<boolean> {
    // Si déjà authentifié et token pas sur le point d'expirer, autoriser l'accès
    if (this.authService.isAuthenticated() && !this.authService.isTokenExpiringSoon()) {
      return of(true);
    }

    // Si pas authentifié ou token expirant, rediriger vers signin
    // Le refresh sera géré par l'intercepteur lors des vraies requêtes API
    this.redirectToSignin(url);
    return of(false);
  }

  private redirectToSignin(returnUrl: string): void {
    this.router.navigate(['/signin'], {
      queryParams: { returnUrl }
    });
  }
}