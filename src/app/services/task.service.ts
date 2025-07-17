import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskResponse, TaskFilter } from '../models/task.model';
import { AuthService } from './auth.service';
import { TaskHistoryService } from './task-history.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = 'https://todof.woopear.fr/api/v1';
  // En développement, utiliser le proxy Angular pour éviter CORS
  private readonly DEV_API_URL = '/api/v1';
  
  private get apiUrl(): string {
    // Utiliser le proxy en développement, l'API directe en production
    return window.location.hostname === 'localhost' ? this.DEV_API_URL : this.API_URL;
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private taskHistoryService: TaskHistoryService
  ) {}

  /**
   * Récupérer toutes les tâches de l'utilisateur
   */
  getTasks(filter: TaskFilter = TaskFilter.ALL): Observable<Task[]> {
    let params = new HttpParams();
    
    if (filter !== TaskFilter.ALL) {
      const completed = filter === TaskFilter.COMPLETED;
      params = params.set('completed', completed.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/tasks/`, {
      headers: this.authService.getAuthHeaders(),
      params
    }).pipe(
      map(response => {
        console.log('📋 TaskService.getTasks: Réponse brute de l\'API =', response);
        const tasks = (response.data || []).map((t: any) => ({
          id: t.id,
          label: t.title,
          done: t.completed,
          created_at: t.createdAt,
          updated_at: t.updatedAt,
          id_user: t.userId,
          category_id: t.categoryId,
          // Ajout d'autres champs si besoin
        }));
        console.log('📋 TaskService.getTasks: Tâches extraites =', tasks.length, 'tâche(s)');
        if (tasks.length > 0) {
          console.log('📋 TaskService.getTasks: Structure première tâche =', tasks[0]);
        }
        return tasks;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer une tâche par son ID
   * NOTE: Cet endpoint n'est pas documenté dans l'API officielle
   * Utiliser getTasks() et filtrer par ID si nécessaire
   */
  /* 
  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/tasks/${id}/user`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
  */

  /**
   * Créer une nouvelle tâche
   */
  createTask(taskData: CreateTaskRequest): Observable<Task> {
    console.log('📝 TaskService.createTask: Début de la création');
    console.log('📝 TaskService.createTask: taskData =', taskData);
    console.log('📝 TaskService.createTask: URL =', `${this.apiUrl}/task`);
    console.log('📝 TaskService.createTask: Headers =', this.authService.getAuthHeaders());
    
    return this.http.post<any>(`${this.apiUrl}/task`, taskData, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(response => {
        console.log('✅ TaskService.createTask: Réponse reçue =', response);
        console.log('✅ TaskService.createTask: Type de response.data =', typeof response.data, response.data);
        
        // L'API retourne {data: null} après création, donc on simule la tâche créée
        // avec un ID temporaire qui sera remplacé lors du rechargement
        const newTask: Task = {
          id: Date.now().toString(), // ID temporaire
          label: taskData.label,
          done: false,
          created_at: new Date().toISOString(),
          id_user: this.authService.getCurrentUser()?.id || ''
        };
        
        console.log('✅ TaskService.createTask: Tâche simulée =', newTask);
        return newTask;
      }),
      catchError(error => {
        console.error('❌ TaskService.createTask: Erreur =', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Mettre à jour une tâche existante
   */
  updateTask(taskData: UpdateTaskRequest): Observable<Task> {
    console.log('[DEBUG][updateTask] Préparation de la requête de mise à jour de la tâche', taskData.id);
    // L'API attend title et non label
    const body: any = {};
    if (typeof taskData.label !== 'undefined') body.title = taskData.label;
    if (typeof taskData.done !== 'undefined') body.completed = taskData.done;
    console.log('[DEBUG][updateTask] Endpoint =', `${this.apiUrl}/tasks/${taskData.id}`);
    console.log('[DEBUG][updateTask] Body =', body);
    return this.http.put<any>(`${this.apiUrl}/tasks/${taskData.id}`, body, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => console.log('[DEBUG][updateTask] Réponse API =', response)),
      map(response => {
        // On mappe la réponse backend (title) vers le modèle Angular (label)
        const updatedTask: Task = {
          id: response.id,
          label: response.title,
          done: response.completed,
          created_at: response.createdAt,
          updated_at: response.updatedAt,
          id_user: response.userId,
          category_id: response.categoryId
        };
        console.log('[DEBUG][updateTask] Tâche mappée =', updatedTask);
        return updatedTask;
      }),
      catchError(error => {
        console.error('[DEBUG][updateTask] Erreur =', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Basculer le statut de completion d'une tâche
   */
  toggleTaskCompletion(task: Task): Observable<Task> {
    console.log('[DEBUG][toggleTaskCompletion] Préparation du toggle done pour la tâche', task.id);
    // L'API attend completed et non done
    const body = { completed: !task.done };
    console.log('[DEBUG][toggleTaskCompletion] Endpoint =', `${this.apiUrl}/tasks/${task.id}`);
    console.log('[DEBUG][toggleTaskCompletion] Body =', body);
    return this.http.put<any>(`${this.apiUrl}/tasks/${task.id}`, body, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(response => console.log('[DEBUG][toggleTaskCompletion] Réponse API =', response)),
      map(response => {
        const toggledTask: Task = {
          id: response.id,
          label: response.title,
          done: response.completed,
          created_at: response.createdAt,
          updated_at: response.updatedAt,
          id_user: response.userId,
          category_id: response.categoryId
        };
        console.log('[DEBUG][toggleTaskCompletion] Tâche mappée =', toggledTask);
        return toggledTask;
      }),
      catchError(error => {
        console.error('[DEBUG][toggleTaskCompletion] Erreur =', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Supprimer une tâche
   */
  deleteTask(id: string): Observable<void> {
    console.log('[DEBUG][deleteTask] Suppression de la tâche', id);
    console.log('[DEBUG][deleteTask] Endpoint =', `${this.apiUrl}/tasks/${id}`);
    return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(() => console.log('[DEBUG][deleteTask] Suppression réussie pour la tâche', id)),
      catchError(error => {
        console.error('[DEBUG][deleteTask] Erreur =', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Supprimer plusieurs tâches via l'endpoint officiel
   */
  deleteMultipleTasks(taskIds: string[]): Observable<void> {
    console.log('🗑️ TaskService.deleteMultipleTasks: Suppression via endpoint officiel');
    console.log('🗑️ TaskService.deleteMultipleTasks: IDs à supprimer =', taskIds);
    
    return this.http.post<void>(`${this.apiUrl}/tasks/delete/user`, {
      task_ids: taskIds // Selon la doc API, probablement ce format
    }, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      tap(() => console.log('✅ TaskService.deleteMultipleTasks: Suppression réussie')),
      catchError(error => {
        console.error('❌ TaskService.deleteMultipleTasks: Erreur lors de la suppression', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Supprimer toutes les tâches terminées (version optimisée)
   */
  deleteCompletedTasks(): Observable<void> {
    console.log('🗑️ TaskService.deleteCompletedTasks: Début de la suppression en masse');
    
    // D'abord récupérer toutes les tâches pour identifier celles qui sont terminées
    return this.getTasks().pipe(
      switchMap(tasks => {
        console.log('📋 TaskService.deleteCompletedTasks: Tâches récupérées =', tasks.length);
        const completedTasks = tasks.filter(task => task.done);
        
        if (completedTasks.length === 0) {
          console.log('💡 TaskService.deleteCompletedTasks: Aucune tâche terminée à supprimer');
          return of(null);
        }
        
        const completedTaskIds = completedTasks.map(t => t.id);
        console.log(`🗑️ TaskService.deleteCompletedTasks: Suppression de ${completedTasks.length} tâche(s) terminée(s)`);
        console.log('🗑️ TaskService.deleteCompletedTasks: IDs à supprimer =', completedTaskIds);
        
        // Essayer d'abord l'endpoint officiel de suppression en masse
        console.log('🔄 TaskService.deleteCompletedTasks: Tentative avec endpoint officiel POST /tasks/delete/user');
        return this.deleteMultipleTasks(completedTaskIds).pipe(
          tap(() => console.log('✅ TaskService.deleteCompletedTasks: Suppression en masse réussie avec endpoint officiel')),
          catchError(error => {
            console.warn('⚠️ TaskService.deleteCompletedTasks: Endpoint officiel échoué, fallback vers suppression individuelle');
            console.warn('⚠️ TaskService.deleteCompletedTasks: Erreur endpoint officiel =', error);
            
            // Fallback : supprimer chaque tâche individuellement
            const deleteRequests = completedTasks.map(task => 
              this.deleteTask(task.id).pipe(
                tap(() => console.log(`✅ TaskService.deleteCompletedTasks: Tâche ${task.id} supprimée avec succès (mode individuel)`)),
                catchError(error => {
                  console.error(`❌ TaskService.deleteCompletedTasks: Erreur suppression tâche ${task.id}`, error);
                  return throwError(() => error);
                })
              )
            );
            
            console.log(`🔄 TaskService.deleteCompletedTasks: Lancement de ${deleteRequests.length} requêtes individuelles`);
            return forkJoin(deleteRequests);
          })
        );
      }),
      map(() => {
        console.log('✅ TaskService.deleteCompletedTasks: Suppression en masse terminée avec succès');
        return void 0;
      }),
      catchError(error => {
        console.error('❌ TaskService.deleteCompletedTasks: Erreur lors de la suppression en masse', error);
        return this.handleError(error);
      })
    );
  }

  /**
   * Obtenir les statistiques des tâches
   */
  getTasksStats(): Observable<{total: number, completed: number, active: number}> {
    return this.getTasks().pipe(
      map(tasks => ({
        total: tasks.length,
        completed: tasks.filter(task => task.done).length,
        active: tasks.filter(task => !task.done).length
      }))
    );
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError(error: any): Observable<never> {
    console.error('❌ TaskService.handleError: Erreur complète =', error);
    console.error('❌ TaskService.handleError: error.name =', error.name);
    console.error('❌ TaskService.handleError: error.message =', error.message);
    console.error('❌ TaskService.handleError: error.status =', error.status);
    console.error('❌ TaskService.handleError: error.url =', error.url);
    
    let errorMessage = 'Une erreur inattendue s\'est produite';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      console.error('❌ TaskService.handleError: Erreur côté client');
      errorMessage = `Erreur: ${error.error.message}`;
    } else if (error.name === 'HttpErrorResponse' && error.status === 0) {
      // Erreur CORS ou réseau
      console.error('❌ TaskService.handleError: Erreur CORS ou réseau détectée');
      errorMessage = 'Erreur CORS: L\'API ne permet pas les requêtes depuis localhost:4200. Contactez l\'administrateur de l\'API.';
    } else {
      // Erreur côté serveur
      console.error('❌ TaskService.handleError: Erreur côté serveur, status =', error.status);
      switch (error.status) {
        case 401:
          errorMessage = 'Non autorisé - veuillez vous reconnecter';
          this.authService.logout();
          break;
        case 403:
          errorMessage = 'Accès refusé';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 422:
          errorMessage = 'Données invalides';
          break;
        case 500:
          errorMessage = 'Erreur serveur interne';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.error?.message || error.message}`;
      }
    }
    
    console.error('❌ TaskService.handleError: Message d\'erreur final =', errorMessage);
    return throwError(errorMessage);
  }

  /**
   * Obtenir des statistiques détaillées
   */
  getDetailedStats(): Observable<{
    total: number;
    completed: number;
    active: number;
    createdToday: number;
    completedToday: number;
    createdThisWeek: number;
    completedThisWeek: number;
  }> {
    return this.getTasks().pipe(
      map(tasks => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const completedTasks = tasks.filter(task => task.done);
        const activeTasks = tasks.filter(task => !task.done);

        // Tâches créées aujourd'hui
        const createdToday = tasks.filter(task => {
          if (!task.created_at) return false;
          const taskDate = new Date(task.created_at);
          return taskDate >= today;
        }).length;

        // Tâches terminées aujourd'hui (estimation basée sur updated_at)
        const completedToday = completedTasks.filter(task => {
          if (!task.updated_at) return false;
          const taskDate = new Date(task.updated_at);
          return taskDate >= today;
        }).length;

        // Tâches créées cette semaine
        const createdThisWeek = tasks.filter(task => {
          if (!task.created_at) return false;
          const taskDate = new Date(task.created_at);
          return taskDate >= weekAgo;
        }).length;

        // Tâches terminées cette semaine
        const completedThisWeek = completedTasks.filter(task => {
          if (!task.updated_at) return false;
          const taskDate = new Date(task.updated_at);
          return taskDate >= weekAgo;
        }).length;

        return {
          total: tasks.length,
          completed: completedTasks.length,
          active: activeTasks.length,
          createdToday,
          completedToday,
          createdThisWeek,
          completedThisWeek
        };
      })
    );
  }

  /**
   * Obtenir les statistiques d'historique des tâches supprimées
   * (Prépare le terrain pour notre futur backend)
   */
  getHistoryStats() {
    return this.taskHistoryService.calculateHistoryStats();
  }

  /**
   * Marquer une tâche comme supprimée dans l'historique
   * (Sera utilisé quand nous aurons notre propre backend)
   */
  recordTaskDeletion(task: Task): void {
    this.taskHistoryService.markTaskAsDeleted(task);
  }

  /**
   * Marquer une tâche comme créée dans l'historique
   */
  recordTaskCreation(task: Task): void {
    this.taskHistoryService.addTaskToHistory(task);
  }

  /**
   * Marquer une tâche comme terminée dans l'historique
   */
  recordTaskCompletion(task: Task): void {
    this.taskHistoryService.markTaskAsCompleted(task);
  }
}
