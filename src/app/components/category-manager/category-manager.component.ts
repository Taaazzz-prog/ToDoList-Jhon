import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../services/category.service';
import { TaskService } from '../../services/task.service';
import { Category } from '../../models/category.model';
import { Task } from '../../models/task.model';
import { CategoryDialogComponent, CategoryDialogData } from './category-dialog.component';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatBadgeModule
  ],
  templateUrl: './category-manager.component.html',
  styleUrl: './category-manager.component.scss'
})
export class CategoryManagerComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  tasks: Task[] = [];
  isLoading = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    public categoryService: CategoryService,
    private taskService: TaskService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('🏷️ CategoryManager: ngOnInit appelé');
    this.loadCategories();
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Charger les catégories
   */
  loadCategories(): void {
    this.isLoading = true;
    
    const sub = this.categoryService.categories$.subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
        console.log('🏷️ CategoryManager: Catégories chargées =', categories.length);
      },
      error: (error) => {
        console.error('❌ CategoryManager: Erreur chargement catégories =', error);
        this.isLoading = false;
        this.showError('Erreur lors du chargement des catégories');
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Charger les tâches pour compter les utilisations
   */
  loadTasks(): void {
    const sub = this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        console.log('📋 CategoryManager: Tâches chargées pour comptage =', tasks.length);
      },
      error: (error) => {
        console.error('❌ CategoryManager: Erreur chargement tâches =', error);
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Obtenir le nombre de tâches par catégorie
   */
  getCategoryTaskCount(categoryId: string): number {
    return this.tasks.filter(task => task.category_id === categoryId).length;
  }

  /**
   * Ouvrir la dialog de création de catégorie
   */
  openCreateDialog(): void {
    const dialogData: CategoryDialogData = {
      mode: 'create'
    };

    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      data: dialogData,
      width: '500px',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createCategory(result);
      }
    });
  }

  /**
   * Modifier une catégorie
   */
  editCategory(category: Category): void {
    const dialogData: CategoryDialogData = {
      mode: 'edit',
      category: category
    };

    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      data: dialogData,
      width: '500px',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateCategory({ ...result, id: category.id });
      }
    });
  }

  /**
   * Créer une nouvelle catégorie
   */
  private createCategory(categoryData: any): void {
    this.isLoading = true;
    
    const sub = this.categoryService.createCategory(categoryData).subscribe({
      next: (category) => {
        this.isLoading = false;
        this.showSuccess(`Catégorie "${category.name}" créée avec succès !`);
        this.loadCategories(); // Recharger la liste
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ CategoryManager: Erreur création catégorie =', error);
        this.showError('Erreur lors de la création de la catégorie');
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Mettre à jour une catégorie
   */
  private updateCategory(categoryData: any): void {
    this.isLoading = true;
    
    const sub = this.categoryService.updateCategory(categoryData).subscribe({
      next: (category) => {
        this.isLoading = false;
        this.showSuccess(`Catégorie "${category.name}" modifiée avec succès !`);
        this.loadCategories(); // Recharger la liste
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ CategoryManager: Erreur modification catégorie =', error);
        this.showError('Erreur lors de la modification de la catégorie');
      }
    });
    
    this.subscriptions.push(sub);
  }

  /**
   * Supprimer une catégorie
   */
  deleteCategory(category: Category): void {
    const taskCount = this.getCategoryTaskCount(category.id);
    
    if (taskCount > 0) {
      this.showError(`Impossible de supprimer "${category.name}" : ${taskCount} tâche(s) l'utilisent`);
      return;
    }

    // TODO: Ajouter confirmation dialog
    if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
      const sub = this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.showSuccess(`Catégorie "${category.name}" supprimée`);
          console.log('✅ CategoryManager: Catégorie supprimée =', category.id);
        },
        error: (error) => {
          console.error('❌ CategoryManager: Erreur suppression =', error);
          this.showError('Erreur lors de la suppression');
        }
      });
      
      this.subscriptions.push(sub);
    }
  }

  /**
   * Confirmer la suppression d'une catégorie
   */
  confirmDeleteCategory(category: Category): void {
    this.deleteCategory(category);
  }

  /**
   * Formater une date pour l'affichage
   */
  formatDate(date: string | Date): string {
    try {
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date inconnue';
    }
  }

  /**
   * TrackBy function pour la performance
   */
  trackByFn(index: number, category: Category): string {
    return category.id;
  }

  /**
   * Afficher un message de succès
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Afficher un message d'erreur
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Afficher un message d'information
   */
  private showInfo(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}
