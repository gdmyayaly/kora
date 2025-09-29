import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Redirection par défaut
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Route de connexion
  {
    path: 'signin',
    loadComponent: () => import('./components/signin/signin').then(m => m.Signin)
  },

  // Route d'inscription
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup').then(m => m.Signup)
  },

  // Routes protégées avec le layout dual-header
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
      }
    ]
  },

  // Routes avec layout
  {
    path: 'achats',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'fournisseurs',
        loadComponent: () => import('./pages/achats/fournisseurs/fournisseurs').then(m => m.Fournisseurs)
      },
      {
        path: 'factures-achat',
        loadComponent: () => import('./pages/achats/factures-achat/factures-achat').then(m => m.FacturesAchat)
      },
      {
        path: 'notes-frais',
        loadComponent: () => import('./pages/achats/notes-frais/notes-frais').then(m => m.NotesFrais)
      },
      {
        path: '',
        redirectTo: 'fournisseurs',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: 'ventes',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'clients',
        loadComponent: () => import('./pages/ventes/clients/clients').then(m => m.Clients)
      },
      {
        path: 'factures-vente',
        loadComponent: () => import('./pages/ventes/factures-vente/factures-vente').then(m => m.FacturesVente)
      },
      {
        path: 'nouvelle-facture',
        loadComponent: () => import('./pages/ventes/nouvelle-facture/nouvelle-facture').then(m => m.NouvelleFacture)
      },
      {
        path: 'articles',
        loadComponent: () => import('./pages/ventes/articles/articles').then(m => m.Articles)
      },
      {
        path: '',
        redirectTo: 'clients',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: 'salaires',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'employes',
        loadComponent: () => import('./pages/salaires/employes/employes').then(m => m.Employes)
      },
      {
        path: 'paies-mensuelles',
        loadComponent: () => import('./pages/salaires/paies-mensuelles/paies-mensuelles').then(m => m.PaiesMensuelles)
      },
      {
        path: 'bulletins',
        loadComponent: () => import('./pages/salaires/bulletins/bulletins').then(m => m.Bulletins)
      },
      {
        path: 'statistiques',
        loadComponent: () => import('./pages/salaires/statistiques/statistiques').then(m => m.StatistiquesSalaires)
      },
      {
        path: '',
        redirectTo: 'employes',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: 'declarations',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'calendrier',
        loadComponent: () => import('./pages/declarations/calendrier/calendrier').then(m => m.CalendrierDeclarations)
      },
      {
        path: 'liste',
        loadComponent: () => import('./pages/declarations/liste/liste').then(m => m.ListeDeclarations)
      },
      {
        path: '',
        redirectTo: 'calendrier',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: 'comptabilite',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'journal-achats',
        loadComponent: () => import('./pages/comptabilite/journal-achats/journal-achats').then(m => m.JournalAchats)
      },
      {
        path: 'journal-ventes',
        loadComponent: () => import('./pages/comptabilite/journal-ventes/journal-ventes').then(m => m.JournalVentes)
      },
      {
        path: 'journal-salaires',
        loadComponent: () => import('./pages/comptabilite/journal-salaires/journal-salaires').then(m => m.JournalSalaires)
      },
      {
        path: '',
        redirectTo: 'journal-achats',
        pathMatch: 'full'
      }
    ]
  },

  // Routes existantes conservées
  {
    path: 'projects',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/projects/projects').then(m => m.Projects)
      }
    ]
  },

  {
    path: 'team',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/team/team').then(m => m.Team)
      }
    ]
  },

  {
    path: 'settings',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/settings/settings').then(m => m.Settings)
      }
    ]
  },

  {
    path: 'help',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/help/help').then(m => m.Help)
      }
    ]
  },

  {
    path: 'profile',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile)
      }
    ]
  },

  {
    path: 'notifications',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/notifications/notifications').then(m => m.Notifications)
      }
    ]
  },

  {
    path: 'messages',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/messages/messages').then(m => m.Messages)
      }
    ]
  },

  // Routes de gestion des entreprises
  {
    path: 'companies',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/company/companies/companies').then(m => m.CompaniesComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/company/company-create/company-create').then(m => m.CompanyCreateComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/company/company-detail/company-detail').then(m => m.CompanyDetailComponent)
      }
    ]
  },

  // Routes de gestion des workspaces
  {
    path: 'workspaces',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/workspace/workspaces/workspaces').then(m => m.WorkspacesComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/workspace/workspace-create/workspace-create').then(m => m.WorkspaceCreateComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/workspace/workspace-detail/workspace-detail').then(m => m.WorkspaceDetailComponent)
      }
    ]
  },

  // Routes de gestion des utilisateurs
  {
    path: 'users',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/users/users').then(m => m.UsersComponent)
      }
    ]
  },

  // Route de paiement
  {
    path: 'paiement',
    loadComponent: () => import('./components/dual-header-layout/dual-header-layout').then(m => m.DualHeaderLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/paiement/paiement').then(m => m.PaiementComponent)
      }
    ]
  },

  // Route de fallback
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
