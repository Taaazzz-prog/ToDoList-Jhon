import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { 
  Category, 
  CreateCategoryRequest, 
  UpdateCategoryRequest, 
  CategoryResponse,
  CATEGORY_COLORS,
  CATEGORY_ICONS
} from '../models/category.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly API_URL = 'https://todof.woopear.fr/api/v1';
  private readonly DEV_API_URL = '/api/v1';
  private readonly STORAGE_KEY = 'todolist_categories';
  
  // État local pour la gestion des catégories
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();
  
  // Configuration du mode de fonctionnement
  private useLocalStorage = false; // Sera déterminé par le test API
  private apiSupportsCategories = false;

  private get apiUrl(): string {
    return window.location.hostname === 'localhost' ? this.DEV_API_URL : this.API_URL;
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.initializeCategories();
  }

  /**
   * Initialisation du service
   * Configure le mode localStorage car l'API externe ne supporte pas les catégories
   */
  private async initializeCategories(): Promise<void> {
    console.log('🏷️ CategoryService: Initialisation...');
    
    // Configuration forcée en mode localStorage car l'API externe ne supporte pas les catégories
    this.apiSupportsCategories = false;
    this.useLocalStorage = true;
    
    console.log('🏷️ CategoryService: Mode localStorage activé (API externe non compatible)');
    this.loadCategoriesFromStorage();
    this.createDefaultCategories();
  }

  /**
   * Récupérer toutes les catégories
   */
  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  /**
   * Créer une nouvelle catégorie
   */
  createCategory(categoryData: CreateCategoryRequest): Observable<Category> {
    return this.createCategoryLocal(categoryData);
  }

  /**
   * Mettre à jour une catégorie
   */
  updateCategory(categoryData: UpdateCategoryRequest): Observable<Category> {
    return this.updateCategoryLocal(categoryData);
  }

  /**
   * Supprimer une catégorie
   */
  deleteCategory(id: string): Observable<void> {
    return this.deleteCategoryLocal(id);
  }

  /**
   * Obtenir une catégorie par ID
   */
  getCategoryById(id: string): Observable<Category | undefined> {
    return this.categories$.pipe(
      map(categories => categories.find(cat => cat.id === id))
    );
  }

  // === MÉTHODES LOCALES (localStorage) ===

  private loadCategoriesFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const categories = JSON.parse(stored) as Category[];
        this.categoriesSubject.next(categories);
        console.log(`📦 CategoryService: ${categories.length} catégories chargées depuis localStorage`);
      }
    } catch (error) {
      console.error('❌ CategoryService: Erreur lors du chargement depuis localStorage =', error);
    }
  }

  private saveCategoriesLocalStorage(categories: Category[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('❌ CategoryService: Erreur lors de la sauvegarde dans localStorage =', error);
    }
  }

  private createCategoryLocal(categoryData: CreateCategoryRequest): Observable<Category> {
    const newCategory: Category = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: categoryData.name,
      description: categoryData.description,
      color: categoryData.color,
      icon: categoryData.icon,
      created_at: new Date().toISOString(),
      id_user: this.authService.getCurrentUser()?.id || 'local'
    };

    const currentCategories = this.categoriesSubject.value;
    const updatedCategories = [...currentCategories, newCategory];
    
    this.categoriesSubject.next(updatedCategories);
    this.saveCategoriesLocalStorage(updatedCategories);
    
    console.log('✅ CategoryService: Catégorie créée localement =', newCategory);
    return of(newCategory);
  }

  private updateCategoryLocal(categoryData: UpdateCategoryRequest): Observable<Category> {
    const currentCategories = this.categoriesSubject.value;
    const index = currentCategories.findIndex(cat => cat.id === categoryData.id);
    
    if (index === -1) {
      return throwError(() => new Error('Catégorie non trouvée'));
    }

    const updatedCategory = {
      ...currentCategories[index],
      ...categoryData
    };

    const updatedCategories = [...currentCategories];
    updatedCategories[index] = updatedCategory;
    
    this.categoriesSubject.next(updatedCategories);
    this.saveCategoriesLocalStorage(updatedCategories);
    
    console.log('✅ CategoryService: Catégorie mise à jour localement =', updatedCategory);
    return of(updatedCategory);
  }

  private deleteCategoryLocal(id: string): Observable<void> {
    const currentCategories = this.categoriesSubject.value;
    const filteredCategories = currentCategories.filter(cat => cat.id !== id);
    
    this.categoriesSubject.next(filteredCategories);
    this.saveCategoriesLocalStorage(filteredCategories);
    
    console.log('✅ CategoryService: Catégorie supprimée localement, ID =', id);
    return of(void 0);
  }

  /**
   * Créer des catégories par défaut lors de la première utilisation
   */
  private createDefaultCategories(): void {
    const currentCategories = this.categoriesSubject.value;
    console.log('🏷️ CategoryService: createDefaultCategories - categories actuelles =', currentCategories.length);
    
    if (currentCategories.length === 0) {
      console.log('🎨 CategoryService: Aucune catégorie trouvée, création des catégories par défaut...');
      
      const defaultCategories: CreateCategoryRequest[] = [
        { name: 'Travail', color: CATEGORY_COLORS[0], icon: CATEGORY_ICONS[0], description: 'Tâches professionnelles' },
        { name: 'Personnel', color: CATEGORY_COLORS[1], icon: CATEGORY_ICONS[1], description: 'Tâches personnelles' },
        { name: 'Courses', color: CATEGORY_COLORS[2], icon: CATEGORY_ICONS[4], description: 'Liste de courses' },
        { name: 'Santé', color: CATEGORY_COLORS[3], icon: CATEGORY_ICONS[5], description: 'Rendez-vous médicaux' }
      ];

      const createdCategories: Category[] = [];
      defaultCategories.forEach(catData => {
        this.createCategoryLocal(catData).subscribe(category => {
          createdCategories.push(category);
          console.log('✅ CategoryService: Catégorie par défaut créée =', category.name);
        });
      });

      console.log('🎨 CategoryService: Catégories par défaut créées =', defaultCategories.length);
    } else {
      console.log('🏷️ CategoryService: Catégories existantes trouvées =', currentCategories.length);
    }
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError(error: any): Observable<never> {
    console.error('❌ CategoryService: Erreur HTTP =', error);
    return throwError(() => error);
  }

  /**
   * Méthodes utilitaires publiques
   */
  
  /**
   * Vérifier si l'API supporte les catégories
   */
  isApiSupported(): boolean {
    return this.apiSupportsCategories;
  }

  /**
   * Obtenir les couleurs prédéfinies
   */
  getAvailableColors(): string[] {
    return [...CATEGORY_COLORS];
  }

  /**
   * Obtenir les icônes prédéfinies
   */
  getAvailableIcons(): string[] {
    return [...CATEGORY_ICONS];
  }

  /**
   * Nettoyer le cache local (pour debug)
   */
  clearLocalCategories(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.categoriesSubject.next([]);
    console.log('🧹 CategoryService: Cache local nettoyé');
  }
}
