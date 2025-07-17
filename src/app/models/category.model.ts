export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  created_at: string | Date;
  id_user: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color: string;
  icon?: string;
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface CategoryResponse {
  data: Category[];
  message: string;
  meta: {
    method: string;
    path: string;
    status: number;
    timestamp: string;
  };
}

export interface TaskWithCategory extends Omit<Task, 'category'> {
  category_id?: string;
  category?: Category; // Populated category object
}

// Import du modèle Task existant
import { Task } from './task.model';

// Couleurs prédéfinies pour les catégories
export const CATEGORY_COLORS = [
  '#2196F3', // Bleu
  '#4CAF50', // Vert
  '#FF9800', // Orange
  '#9C27B0', // Violet
  '#F44336', // Rouge
  '#607D8B', // Bleu-gris
  '#795548', // Marron
  '#009688', // Teal
  '#E91E63', // Rose
  '#FFC107', // Amber
  '#3F51B5', // Indigo
  '#8BC34A'  // Vert clair
];

// Icônes prédéfinies pour les catégories
export const CATEGORY_ICONS = [
  'work',           // Travail
  'home',           // Maison
  'fitness_center', // Sport
  'school',         // Études
  'shopping_cart',  // Courses
  'local_hospital', // Santé
  'flight',         // Voyage
  'restaurant',     // Restaurants
  'family_restroom',// Famille
  'music_note',     // Musique
  'palette',        // Créatif
  'attach_money'    // Finance
];
