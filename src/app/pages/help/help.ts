import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help',
  imports: [CommonModule],
  templateUrl: './help.html',
  styleUrl: './help.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Help {
  protected readonly sections = [
    {
      id: 'getting-started',
      title: 'Premiers pas',
      icon: 'fas fa-play-circle',
      items: [
        { title: 'Introduction à Kora', description: 'Découvrez les fonctionnalités principales' },
        { title: 'Configuration initiale', description: 'Paramétrez votre compte et vos préférences' },
        { title: 'Navigation', description: 'Apprenez à naviguer dans l\'interface' }
      ]
    },
    {
      id: 'features',
      title: 'Fonctionnalités',
      icon: 'fas fa-cog',
      items: [
        { title: 'Gestion des achats', description: 'Gérez vos fournisseurs et factures d\'achat' },
        { title: 'Gestion des ventes', description: 'Administrez vos clients et factures de vente' },
        { title: 'Gestion des salaires', description: 'Gérez vos employés et leurs paies' },
        { title: 'Déclarations', description: 'Planifiez et suivez vos déclarations' },
        { title: 'Comptabilité', description: 'Consultez vos journaux comptables' }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Résolution de problèmes',
      icon: 'fas fa-question-circle',
      items: [
        { title: 'Problèmes de connexion', description: 'Résolvez les problèmes d\'authentification' },
        { title: 'Erreurs courantes', description: 'Solutions aux erreurs fréquemment rencontrées' },
        { title: 'Performance', description: 'Optimisez l\'utilisation de l\'application' }
      ]
    }
  ];

  protected readonly faqs = [
    {
      question: 'Comment modifier mon profil ?',
      answer: 'Cliquez sur votre avatar en haut à droite, puis sélectionnez "Mon profil" pour accéder aux paramètres de votre compte.'
    },
    {
      question: 'Comment créer une nouvelle facture ?',
      answer: 'Allez dans la section "Ventes" puis cliquez sur "Nouvelle facture" pour créer une facture de vente.'
    },
    {
      question: 'Comment ajouter un nouvel employé ?',
      answer: 'Dans la section "Salaires", cliquez sur "Employés" puis utilisez le bouton "Ajouter un employé".'
    },
    {
      question: 'Comment contacter le support ?',
      answer: 'Vous pouvez nous contacter via l\'adresse email support@kora.com ou utiliser le chat intégré.'
    }
  ];
}