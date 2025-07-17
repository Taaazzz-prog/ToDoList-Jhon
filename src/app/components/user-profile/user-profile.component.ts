import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  isLoading = false;
  isLoadingStats = false;
  
  stats = {
    total: 0,
    completed: 0,
    active: 0,
    createdToday: 0,
    completedToday: 0,
    createdThisWeek: 0,
    completedThisWeek: 0
  };

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserStats();
  }

  /**
   * Charger le profil utilisateur
   */
  loadUserProfile(): void {
    this.isLoading = true;
    
    // Essayer d'abord de récupérer depuis l'API
    this.authService.getUserProfile().subscribe({
      next: (user) => {
        console.log('✅ UserProfile: Profil récupéré =', user);
        this.user = user;
        this.isLoading = false;
      },
      error: (error) => {
        console.warn('⚠️ UserProfile: Erreur API profil, utilisation des données locales =', error);
        // Fallback vers l'utilisateur actuel du service
        this.user = this.authService.getCurrentUser();
        this.isLoading = false;
        
        if (!this.user) {
          this.snackBar.open('Erreur lors du chargement du profil', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  /**
   * Charger les statistiques utilisateur
   */
  loadUserStats(): void {
    this.isLoadingStats = true;
    
    this.taskService.getDetailedStats().subscribe({
      next: (stats) => {
        console.log('📊 UserProfile: Statistiques récupérées =', stats);
        this.stats = stats;
        this.isLoadingStats = false;
      },
      error: (error) => {
        console.error('❌ UserProfile: Erreur chargement statistiques =', error);
        this.isLoadingStats = false;
        this.snackBar.open('Erreur lors du chargement des statistiques', 'Fermer', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Actualiser les données
   */
  refreshData(): void {
    this.loadUserProfile();
    this.loadUserStats();
    this.snackBar.open('Données actualisées', 'Fermer', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Retourner à la liste des tâches
   */
  goBackToTasks(): void {
    this.router.navigate(['/tasks']);
  }

  /**
   * Se déconnecter
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Calculer le taux de completion
   */
  getCompletionRate(): number {
    if (this.stats.total === 0) return 0;
    return Math.round((this.stats.completed / this.stats.total) * 100);
  }

  /**
   * Obtenir le niveau de productivité
   */
  getProductivityLevel(): { level: string; color: string; icon: string } {
    const rate = this.getCompletionRate();
    
    if (rate >= 80) {
      return { level: 'Excellent', color: 'primary', icon: 'emoji_events' };
    } else if (rate >= 60) {
      return { level: 'Très bien', color: 'accent', icon: 'thumb_up' };
    } else if (rate >= 40) {
      return { level: 'Bien', color: 'warn', icon: 'trending_up' };
    } else {
      return { level: 'À améliorer', color: 'warn', icon: 'trending_down' };
    }
  }

  /**
   * Formater la date d'inscription
   */
  formatJoinDate(date: string | Date | null | undefined): string {
    if (!date) return 'Date inconnue';
    
    try {
      const joinDate = new Date(date);
      return joinDate.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  }

  /**
   * Calculer le nombre de jours depuis l'inscription
   */
  getDaysSinceJoin(): number {
    if (!this.user?.created_at) return 0;
    
    try {
      const joinDate = new Date(this.user.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - joinDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  }
}
