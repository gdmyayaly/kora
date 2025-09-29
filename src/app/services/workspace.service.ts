import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Workspace,
  CreateWorkspaceRequest,
  WorkspaceListResponse,
  CreateWorkspaceResponse,
  WorkspaceErrorResponse,
  WorkspaceDetail,
  WorkspaceDetailResponse,
  UpdateWorkspaceRequest,
  UpdateWorkspaceResponse,
  DeleteWorkspaceResponse,
  SetDefaultWorkspaceResponse
} from '../interfaces/workspace.interface';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private http = inject(HttpClient);

  private readonly SELECTED_WORKSPACE_KEY = 'kora_selected_workspace';

  private workspacesSignal = signal<Workspace[]>([]);
  private selectedWorkspaceSignal = signal<Workspace | null>(null);
  private isLoadingSignal = signal(false);

  readonly workspaces = this.workspacesSignal.asReadonly();
  readonly selectedWorkspace = this.selectedWorkspaceSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();

  constructor() {
    this.initializeSelectedWorkspace();
  }

  private initializeSelectedWorkspace(): void {
    const storedWorkspace = localStorage.getItem(this.SELECTED_WORKSPACE_KEY);
    if (storedWorkspace) {
      try {
        const workspace = JSON.parse(storedWorkspace) as Workspace;
        this.selectedWorkspaceSignal.set(workspace);
      } catch (error) {
        console.error('Error parsing stored workspace:', error);
        localStorage.removeItem(this.SELECTED_WORKSPACE_KEY);
      }
    }
  }

  getWorkspaces(): Observable<WorkspaceListResponse> {
    this.isLoadingSignal.set(true);

    return this.http.get<WorkspaceListResponse>(`${environment.apiWorkspace}/workspaces`)
      .pipe(
        tap(response => {
          if (response.success) {
            const workspaces = response.data || [];
            this.workspacesSignal.set(workspaces);

            // Auto-sélectionner le workspace par défaut si aucun n'est sélectionné
            if (!this.selectedWorkspaceSignal()) {
              const defaultWorkspace = workspaces.find(w => w.is_default);
              if (defaultWorkspace) {
                this.selectWorkspace(defaultWorkspace);
              } else if (workspaces.length > 0) {
                this.selectWorkspace(workspaces[0]);
              }
            }
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  createWorkspace(workspaceData: CreateWorkspaceRequest): Observable<CreateWorkspaceResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<CreateWorkspaceResponse>(`${environment.apiWorkspace}/workspaces/create`, workspaceData)
      .pipe(
        tap(response => {
          if (response.success) {
            // Recharger la liste des workspaces après création
            this.getWorkspaces().subscribe();
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  selectWorkspace(workspace: Workspace): void {
    this.selectedWorkspaceSignal.set(workspace);
    localStorage.setItem(this.SELECTED_WORKSPACE_KEY, JSON.stringify(workspace));
  }

  clearSelectedWorkspace(): void {
    this.selectedWorkspaceSignal.set(null);
    localStorage.removeItem(this.SELECTED_WORKSPACE_KEY);
  }

  hasWorkspaces(): boolean {
    return this.workspaces().length > 0;
  }

  getWorkspaceById(workspaceId: string): Observable<WorkspaceDetailResponse> {
    this.isLoadingSignal.set(true);

    return this.http.get<WorkspaceDetailResponse>(`${environment.apiWorkspace}/workspaces/${workspaceId}`)
      .pipe(
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  updateWorkspace(workspaceId: string, workspaceData: UpdateWorkspaceRequest): Observable<UpdateWorkspaceResponse> {
    this.isLoadingSignal.set(true);

    return this.http.put<UpdateWorkspaceResponse>(`${environment.apiWorkspace}/workspaces/${workspaceId}`, workspaceData)
      .pipe(
        tap(response => {
          if (response.success) {
            // Recharger la liste des workspaces après modification
            this.getWorkspaces().subscribe();
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  setWorkspaceDefault(workspaceId: string): Observable<SetDefaultWorkspaceResponse> {
    this.isLoadingSignal.set(true);

    return this.http.put<SetDefaultWorkspaceResponse>(`${environment.apiWorkspace}/workspaces/${workspaceId}/default`, {})
      .pipe(
        tap(response => {
          if (response.success) {
            // Recharger la liste des workspaces après modification
            this.getWorkspaces().subscribe();
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.isLoadingSignal.set(false))
      );
  }

  deleteWorkspace(workspaceId: string): Observable<DeleteWorkspaceResponse> {
    this.isLoadingSignal.set(true);

    return this.http.delete<DeleteWorkspaceResponse>(`${environment.apiWorkspace}/workspaces/${workspaceId}`)
      .pipe(
        tap(response => {
          if (response.success) {
            // Recharger la liste des workspaces après suppression
            this.getWorkspaces().subscribe();

            // Si le workspace supprimé était sélectionné, le désélectionner
            const currentSelected = this.selectedWorkspaceSignal();
            if (currentSelected?.workspace_id === workspaceId) {
              this.clearSelectedWorkspace();
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
      const errorResponse = error.error as WorkspaceErrorResponse;
      errorMessage = errorResponse.message || errorResponse.error || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Erreur WorkspaceService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}