import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskResponse, TaskFilter } from '../models/task.model';
import { AuthService } from './auth.service';

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
    private authService: AuthService
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

    return this.http.get<TaskResponse>(`${this.apiUrl}/task/`, {
      headers: this.authService.getAuthHeaders(),
      params
    }).pipe(
      map(response => {
        console.log('📋 TaskService.getTasks: Réponse brute de l\'API =', response);
        const tasks = response.data || [];
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
    return this.http.get<Task>(`${this.apiUrl}/task/${id}/user`, {
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
    return this.http.put<any>(`${this.apiUrl}/task/${taskData.id}/label/user`, {label: taskData.label}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(() => taskData as Task),
      catchError(this.handleError)
    );
  }

  /**
   * Basculer le statut de completion d'une tâche
   */
  toggleTaskCompletion(task: Task): Observable<Task> {
    return this.http.put<any>(`${this.apiUrl}/task/${task.id}/done/user`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(() => ({ ...task, done: !task.done })),
      catchError(this.handleError)
    );
  }

  /**
   * Supprimer une tâche
   */
  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/task/${id}/user`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Supprimer plusieurs tâches via l'endpoint officiel
   */
  deleteMultipleTasks(taskIds: string[]): Observable<void> {
    console.log('🗑️ TaskService.deleteMultipleTasks: Suppression via endpoint officiel');
    console.log('🗑️ TaskService.deleteMultipleTasks: IDs à supprimer =', taskIds);
    
    return this.http.post<void>(`${this.apiUrl}/task/delete/user`, {
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
        console.log('🔄 TaskService.deleteCompletedTasks: Tentative avec endpoint officiel POST /task/delete/user');
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
}
