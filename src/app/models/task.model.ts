export interface Task {
  id: string;
  label: string;
  done: boolean;
  created_at: string | Date; // L'API utilise created_at avec underscore
  updated_at?: string | Date; // L'API utilise updated_at avec underscore
  id_user: string; // L'API utilise id_user avec underscore
  category_id?: string; // ID de la catégorie (pour notre future API)
  category?: string; // Nom de la catégorie (si supporté par l'API externe)
}

export interface CreateTaskRequest {
  label: string;
  category_id?: string;
  category?: string;
}

export interface UpdateTaskRequest {
  id: string;
  label?: string;
  done?: boolean;
  category_id?: string;
  category?: string;
}

export interface TaskResponse {
  data: Task[];
  message: string;
  meta: {
    method: string;
    path: string;
    status: number;
    timestamp: string;
  };
}

export enum TaskFilter {
  ALL = 'all',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}
