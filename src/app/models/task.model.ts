export interface Task {
  id: string;
  label: string;
  done: boolean;
  createdAt: Date;
  updatedAt?: Date;
  userId: string;
}

export interface CreateTaskRequest {
  label: string;
}

export interface UpdateTaskRequest {
  id: string;
  label?: string;
  done?: boolean;
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
