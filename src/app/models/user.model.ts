export interface User {
  id: string;
  email: string;
  username?: string;
  role?: string;
  created_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    token: string;
    user: User;
  };
  message: string;
  meta: {
    method: string;
    path: string;
    status: number;
    timestamp: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  role: string;
}
