import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../models/task.model';

/**
 * Service de cache local pour maintenir l'historique des tâches
 * En attendant l'implémentation d'un backend avec base de données
 */
@Injectable({
  providedIn: 'root'
})
export class TaskHistoryService {
  private readonly STORAGE_KEY = 'todolist_task_history';
  private readonly MAX_HISTORY_ITEMS = 1000; // Limite pour éviter une croissance infinie
  
  private historySubject = new BehaviorSubject<TaskHistoryItem[]>([]);
  public history$ = this.historySubject.asObservable();

  constructor() {
    this.loadHistoryFromStorage();
  }

  /**
   * Ajouter une tâche à l'historique (création)
   */
  addTaskToHistory(task: Task): void {
    const historyItem: TaskHistoryItem = {
      id: task.id,
      title: task.label,
      completed: task.done || false,
      created_at: typeof task.created_at === 'string' ? task.created_at : task.created_at?.toISOString() || new Date().toISOString(),
      action: 'created',
      action_date: new Date().toISOString(),
      original_data: { ...task }
    };

    this.addToHistory(historyItem);
    console.log('📝 TaskHistory: Tâche ajoutée à l\'historique =', historyItem);
  }

  /**
   * Marquer une tâche comme terminée dans l'historique
   */
  markTaskAsCompleted(task: Task): void {
    const history = this.getHistory();
    const existingItem = history.find(item => item.id === task.id);

    if (existingItem) {
      // Mettre à jour l'item existant
      existingItem.completed = true;
      existingItem.action = 'completed';
      existingItem.action_date = new Date().toISOString();
      existingItem.original_data = { ...task };
    } else {
      // Créer un nouvel item si pas trouvé
      const historyItem: TaskHistoryItem = {
        id: task.id,
        title: task.label,
        completed: true,
        created_at: typeof task.created_at === 'string' ? task.created_at : task.created_at?.toISOString() || new Date().toISOString(),
        action: 'completed',
        action_date: new Date().toISOString(),
        original_data: { ...task }
      };
      this.addToHistory(historyItem);
    }

    this.saveHistoryToStorage();
    console.log('✅ TaskHistory: Tâche marquée comme terminée dans l\'historique =', task.id);
  }

  /**
   * Marquer une tâche comme supprimée (mais garder dans l'historique)
   */
  markTaskAsDeleted(task: Task): void {
    const history = this.getHistory();
    const existingItem = history.find(item => item.id === task.id);

    if (existingItem) {
      // Mettre à jour l'item existant
      existingItem.action = 'deleted';
      existingItem.action_date = new Date().toISOString();
      existingItem.deleted_at = new Date().toISOString();
    } else {
      // Créer un nouvel item pour la tâche supprimée
      const historyItem: TaskHistoryItem = {
        id: task.id,
        title: task.label,
        completed: task.done || false,
        created_at: typeof task.created_at === 'string' ? task.created_at : task.created_at?.toISOString() || new Date().toISOString(),
        action: 'deleted',
        action_date: new Date().toISOString(),
        deleted_at: new Date().toISOString(),
        original_data: { ...task }
      };
      this.addToHistory(historyItem);
    }

    this.saveHistoryToStorage();
    console.log('🗑️ TaskHistory: Tâche marquée comme supprimée dans l\'historique =', task.id);
  }

  /**
   * Calculer les statistiques basées sur l'historique complet
   */
  calculateHistoryStats(): TaskHistoryStats {
    const history = this.getHistory();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));

    const stats: TaskHistoryStats = {
      totalCreated: 0,
      totalCompleted: 0,
      totalDeleted: 0,
      completedNotDeleted: 0,
      createdToday: 0,
      completedToday: 0,
      deletedToday: 0,
      createdThisWeek: 0,
      completedThisWeek: 0,
      deletedThisWeek: 0,
      completionRate: 0
    };

    history.forEach(item => {
      const createdDate = new Date(item.created_at);
      const actionDate = new Date(item.action_date);

      // Statistiques générales
      stats.totalCreated++;
      
      if (item.completed) {
        stats.totalCompleted++;
      }
      
      if (item.action === 'deleted') {
        stats.totalDeleted++;
      }
      
      if (item.completed && item.action !== 'deleted') {
        stats.completedNotDeleted++;
      }

      // Statistiques d'aujourd'hui
      if (createdDate >= today) {
        stats.createdToday++;
      }
      
      if (item.completed && actionDate >= today) {
        stats.completedToday++;
      }
      
      if (item.action === 'deleted' && actionDate >= today) {
        stats.deletedToday++;
      }

      // Statistiques de cette semaine
      if (createdDate >= weekStart) {
        stats.createdThisWeek++;
      }
      
      if (item.completed && actionDate >= weekStart) {
        stats.completedThisWeek++;
      }
      
      if (item.action === 'deleted' && actionDate >= weekStart) {
        stats.deletedThisWeek++;
      }
    });

    // Calculer le taux de completion
    stats.completionRate = stats.totalCreated > 0 
      ? Math.round((stats.totalCompleted / stats.totalCreated) * 100)
      : 0;

    console.log('📊 TaskHistory: Statistiques calculées =', stats);
    return stats;
  }

  /**
   * Obtenir l'historique complet
   */
  getHistory(): TaskHistoryItem[] {
    return this.historySubject.value;
  }

  /**
   * Nettoyer l'historique (garder seulement les N derniers items)
   */
  cleanupHistory(): void {
    const history = this.getHistory();
    if (history.length > this.MAX_HISTORY_ITEMS) {
      const sortedHistory = history.sort((a, b) => 
        new Date(b.action_date).getTime() - new Date(a.action_date).getTime()
      );
      const trimmedHistory = sortedHistory.slice(0, this.MAX_HISTORY_ITEMS);
      this.historySubject.next(trimmedHistory);
      this.saveHistoryToStorage();
      console.log(`🧹 TaskHistory: Historique nettoyé, gardé ${this.MAX_HISTORY_ITEMS} items`);
    }
  }

  /**
   * Réinitialiser l'historique (pour debug ou migration)
   */
  clearHistory(): void {
    this.historySubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ TaskHistory: Historique effacé');
  }

  // === MÉTHODES PRIVÉES ===

  private addToHistory(item: TaskHistoryItem): void {
    const history = this.getHistory();
    history.push(item);
    this.historySubject.next(history);
    this.saveHistoryToStorage();
    
    // Nettoyer si nécessaire
    if (history.length > this.MAX_HISTORY_ITEMS) {
      this.cleanupHistory();
    }
  }

  private loadHistoryFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const history = JSON.parse(stored) as TaskHistoryItem[];
        this.historySubject.next(history);
        console.log(`📂 TaskHistory: ${history.length} items chargés depuis le localStorage`);
      }
    } catch (error) {
      console.error('❌ TaskHistory: Erreur lors du chargement depuis localStorage =', error);
    }
  }

  private saveHistoryToStorage(): void {
    try {
      const history = this.getHistory();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('❌ TaskHistory: Erreur lors de la sauvegarde dans localStorage =', error);
    }
  }
}

// === INTERFACES ===

export interface TaskHistoryItem {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  action: 'created' | 'completed' | 'deleted' | 'updated';
  action_date: string;
  deleted_at?: string;
  original_data: Task;
}

export interface TaskHistoryStats {
  totalCreated: number;
  totalCompleted: number;
  totalDeleted: number;
  completedNotDeleted: number; // Tâches terminées mais pas supprimées
  createdToday: number;
  completedToday: number;
  deletedToday: number;
  createdThisWeek: number;
  completedThisWeek: number;
  deletedThisWeek: number;
  completionRate: number; // Pourcentage basé sur toutes les tâches créées
}
