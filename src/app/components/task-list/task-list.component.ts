import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task, TaskFilter } from '../../models/task.model';
import { User } from '../../models/user.model';
import { TaskFormComponent } from '../task-form/task-form.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  currentFilter: TaskFilter = TaskFilter.ALL;
  currentFilterIndex: number = 0; // Index pour le mat-tab-group
  searchQuery: string = ''; // Nouvelle propriété pour la recherche
  isLoading = false;
  TaskFilter = TaskFilter; // Pour utiliser l'enum dans le template

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    console.log('📋 TaskListComponent.loadTasks: Début du chargement des tâches');
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        console.log('✅ TaskListComponent.loadTasks: Tâches reçues =', tasks);
        this.tasks = tasks;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ TaskListComponent.loadTasks: Erreur =', error);
        this.isLoading = false;
        this.snackBar.open(error, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  applyFilter(): void {
    let filtered = [...this.tasks];
    
    // Appliquer le filtre par statut
    switch (this.currentFilter) {
      case TaskFilter.ACTIVE:
        filtered = filtered.filter(task => !task.done);
        break;
      case TaskFilter.COMPLETED:
        filtered = filtered.filter(task => task.done);
        break;
      default:
        // TaskFilter.ALL - garder toutes les tâches
        break;
    }
    
    // Appliquer le filtre de recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(task => 
        task.label.toLowerCase().includes(query)
      );
    }
    
    this.filteredTasks = filtered;
  }

  /**
   * Méthode appelée lors de la saisie dans la barre de recherche
   */
  onSearchChange(searchQuery: string): void {
    this.searchQuery = searchQuery;
    this.applyFilter();
  }

  /**
   * Effacer la recherche
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilter();
  }

  setFilter(filter: TaskFilter | number): void {
    // Si c'est un index numérique, convertir en TaskFilter
    if (typeof filter === 'number') {
      this.currentFilterIndex = filter;
      switch (filter) {
        case 0:
          this.currentFilter = TaskFilter.ALL;
          break;
        case 1:
          this.currentFilter = TaskFilter.ACTIVE;
          break;
        case 2:
          this.currentFilter = TaskFilter.COMPLETED;
          break;
        default:
          this.currentFilter = TaskFilter.ALL;
          this.currentFilterIndex = 0;
      }
    } else {
      this.currentFilter = filter;
      // Synchroniser l'index
      switch (filter) {
        case TaskFilter.ALL:
          this.currentFilterIndex = 0;
          break;
        case TaskFilter.ACTIVE:
          this.currentFilterIndex = 1;
          break;
        case TaskFilter.COMPLETED:
          this.currentFilterIndex = 2;
          break;
      }
    }
    this.applyFilter();
  }

  openTaskDialog(task?: Task): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '500px',
      data: task || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
      }
    });
  }

  toggleTaskCompletion(task: Task): void {
    this.taskService.toggleTaskCompletion(task).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
          this.applyFilter();
        }
        this.snackBar.open(
          updatedTask.done ? 'Tâche marquée comme terminée' : 'Tâche marquée comme active',
          'Fermer',
          { duration: 2000, panelClass: ['success-snackbar'] }
        );
      },
      error: (error) => {
        this.snackBar.open(error, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteTask(task: Task): void {
    const dialogRef = this.snackBar.open(
      `Supprimer la tâche "${task.label}" ?`,
      'Supprimer',
      {
        duration: 5000,
        panelClass: ['warn-snackbar']
      }
    );

    dialogRef.onAction().subscribe(() => {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== task.id);
          this.applyFilter();
          this.snackBar.open('Tâche supprimée', 'Fermer', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.snackBar.open(error, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    });
  }

  clearCompletedTasks(): void {
    console.log('🗑️ TaskListComponent.clearCompletedTasks: Début de la suppression en masse depuis le composant');
    
    const completedTasks = this.tasks.filter(task => task.done);
    console.log(`📊 TaskListComponent.clearCompletedTasks: ${completedTasks.length} tâche(s) terminée(s) détectée(s)`);
    
    if (completedTasks.length === 0) {
      console.log('💡 TaskListComponent.clearCompletedTasks: Aucune tâche terminée à supprimer');
      this.snackBar.open('Aucune tâche terminée à supprimer', 'Fermer', {
        duration: 3000,
        panelClass: ['info-snackbar']
      });
      return;
    }

    console.log('🔄 TaskListComponent.clearCompletedTasks: Appel du service de suppression...');
    this.taskService.deleteCompletedTasks().subscribe({
      next: () => {
        console.log('✅ TaskListComponent.clearCompletedTasks: Suppression réussie côté service');
        this.tasks = this.tasks.filter(task => !task.done);
        this.applyFilter();
        console.log(`✅ TaskListComponent.clearCompletedTasks: Interface mise à jour, ${this.tasks.length} tâche(s) restante(s)`);
        this.snackBar.open(`${completedTasks.length} tâche(s) supprimée(s)`, 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('❌ TaskListComponent.clearCompletedTasks: Erreur lors de la suppression', error);
        this.snackBar.open(error, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getTasksCount(): { total: number; active: number; completed: number } {
    return {
      total: this.tasks.length,
      active: this.tasks.filter(task => !task.done).length,
      completed: this.tasks.filter(task => task.done).length
    };
  }

  getEmptyStateMessage(): string {
    if (this.searchQuery.trim()) {
      return `Aucun résultat pour "${this.searchQuery}"`;
    }
    
    switch (this.currentFilter) {
      case TaskFilter.ACTIVE:
        return 'Aucune tâche active';
      case TaskFilter.COMPLETED:
        return 'Aucune tâche terminée';
      default:
        return 'Aucune tâche pour le moment';
    }
  }

  getEmptyStateSubtitle(): string {
    if (this.searchQuery.trim()) {
      return 'Essayez de modifier votre recherche ou créez une nouvelle tâche.';
    }
    
    switch (this.currentFilter) {
      case TaskFilter.ACTIVE:
        return 'Toutes vos tâches sont terminées !';
      case TaskFilter.COMPLETED:
        return 'Aucune tâche n\'a encore été terminée.';
      default:
        return 'Commencez par créer votre première tâche.';
    }
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

  formatDate(date: Date | string | null | undefined): string {
    // Gestion des cas où la date est null ou undefined
    if (!date) {
      return '';
    }

    let taskDate: Date;
    
    try {
      // Si c'est déjà un objet Date
      if (date instanceof Date) {
        taskDate = date;
      } 
      // Si c'est une string, essayer de la parser
      else if (typeof date === 'string') {
        taskDate = new Date(date);
      }
      // Si c'est un timestamp number
      else if (typeof date === 'number') {
        taskDate = new Date(date);
      }
      // Fallback
      else {
        console.error('❌ TaskListComponent.formatDate: Format de date non supporté:', date);
        return 'Date inconnue';
      }

      // Vérifier si la date est valide
      if (isNaN(taskDate.getTime())) {
        console.error('❌ TaskListComponent.formatDate: Date invalide après parsing:', date);
        return 'Date invalide';
      }

      const now = new Date();
      const diffTime = Math.abs(now.getTime() - taskDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return 'Aujourd\'hui';
      } else if (diffDays === 2) {
        return 'Hier';
      } else if (diffDays <= 7) {
        return `Il y a ${diffDays - 1} jour(s)`;
      } else {
        return taskDate.toLocaleDateString('fr-FR');
      }
    } catch (error) {
      console.error('❌ TaskListComponent.formatDate: Erreur lors du parsing de la date:', error);
      return 'Erreur de date';
    }
  }

  /**
   * Obtient l'utilisateur actuellement connecté
   */
  getCurrentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  /**
   * Déconnecte l'utilisateur et redirige vers la page de connexion
   */
  logout(): void {
    console.log('🚪 TaskListComponent.logout: Déconnexion en cours...');
    this.authService.logout();
    this.snackBar.open('Déconnexion réussie', 'Fermer', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
    this.router.navigate(['/login']);
    console.log('✅ TaskListComponent.logout: Redirection vers /login');
  }
}
