import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
      map(response => response.data || []),
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer une tâche par son ID
   */
  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/task/${id}/user`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Créer une nouvelle tâche
   */
  createTask(taskData: CreateTaskRequest): Observable<Task> {
    console.log('📝 TaskService.createTask: Début de la création');
    console.log('📝 TaskService.createTask: taskData =', taskData);
    console.log('📝 TaskService.createTask: URL =', `${this.apiUrl}/task`);
    console.log('📝 TaskService.createTask: Headers =', this.authService.getAuthHeaders());
    
    return this.http.post<TaskResponse>(`${this.apiUrl}/task`, taskData, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(response => {
        console.log('✅ TaskService.createTask: Réponse reçue =', response);
        return response.data[0] || taskData as any;
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
   * Supprimer toutes les tâches terminées
   */
  deleteCompletedTasks(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/task/delete/user`, {ids: []}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
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
